<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * tactile implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * Game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */
declare(strict_types=1);

namespace Bga\Games\tactile;

require_once(APP_GAMEMODULE_PATH . "module/table/table.game.php");

class Game extends \Table
{
    private static array $CARD_TYPES;

    //******************************************************* */
    // GAME CONSTANTS
    //******************************************************* */

    const BOTTOMLEFT = '0_5';
    const TOPLEFT = '0_0';
    const TOPRIGHT = '5_0';
    const BOTTOMRIGHT = '5_5';
    
    const COLORS = ['red','yellow','green','blue'];
 
    // Define player homes using position constants
    const PLAYERHOMES = [
        self::TOPLEFT => 'yellow', 
        self::TOPRIGHT => 'green', 
        self::BOTTOMLEFT => 'red', 
        self::BOTTOMRIGHT => 'blue'
    ];

    const COLORHOMES = [
         'blue' => self::BOTTOMRIGHT, 
         'green' => self::TOPRIGHT, 
         'red' => self::BOTTOMLEFT, 
         'yellow' => self::TOPLEFT
    ];
 
    // Define illegal tiles using position constants
    const ILLEGALTILES2P4P = [
        'blue' => [self::TOPRIGHT, self::BOTTOMLEFT],
        'green' => [self::BOTTOMRIGHT, self::TOPLEFT],
        'red' => [self::TOPLEFT, self::BOTTOMRIGHT],
        'yellow' => [self::BOTTOMLEFT, self::TOPRIGHT]
    ];

     // Define player goals using position constants
    const PLAYERGOALS2P4P = [
         'blue' => [self::TOPLEFT], 
         'green' => [self::BOTTOMLEFT], 
         'red' => [self::TOPRIGHT], 
         'yellow' => [self::BOTTOMRIGHT]
    ];

    const PLAYERGOALS3P = self::ILLEGALTILES2P4P;
    const ILLEGALTILES3P = self::PLAYERGOALS2P4P;

    /**
     * Your global variables labels:
     *
     * Here, you can assign labels to global variables you are using for this game. You can use any number of global
     * variables with IDs between 10 and 99. If your game has options (variants), you also have to associate here a
     * label to the corresponding ID in `gameoptions.inc.php`.
     *
     * NOTE: afterward, you can get/set the global variables with `getGameStateValue`, `setGameStateInitialValue` or
     * `setGameStateValue` functions.
     */
    public function __construct()
    {
        parent::__construct();

        $this->initGameStateLabels([
            "my_first_global_variable" => 10,
            "my_second_global_variable" => 11,
            "my_first_game_variant" => 100,
            "my_second_game_variant" => 101,
        ]);

        //deck object is initialized here, but all operations on it are handled in ttCards.php
        $this->cards = $this->getNew( "module.common.deck" );
        $this->cards->init( "card" );
        $this->cards->autoreshuffle = true;
    }

    //***************************************************** */
    //Player Actions and supporting functions
    //***************************************************** */

    public function actMove(string $piece_id, string $tileID, string $origin) :void
    {
        $legalActions = new ttLegalMoves($this);
        $legalMoves = $legalActions->legalMoves();
        $location = ttUtility::tileID2location($tileID);
        

        //1 - check for destination legality
        if (!in_array($location,$legalMoves[$piece_id]))
        {
            throw new \BgaUserException('Invalid move choice');
        }

        $this->checkActionLegality('move', $origin);

        //2 - actually move the piece
        $pieces = new ttPieces($this);
        $reachedGoal = $pieces->movePiece($piece_id,$location);

        $this->notifyAllPlayers("move", clienttranslate('${player_name} moved a piece'), [
            "player_name" => $this->getActivePlayerName(),
            "piece_id" => $piece_id,
            "tileID" => $tileID,
            "origin" => $origin,
        ]);

        //3 - Did we activate any cards?
        $this->activateCards($location);
        
        //4 - Did we reach the goal?
        if ($reachedGoal) {
            $hasWon = $this->scorePiece($piece_id, $pieces, $origin);
            if ($hasWon) { return; }
        }
        
        $this->endOfActionBoardState($origin);
        $this->goToNextState();        
    }

    public function actPush(string $piece_id, string $tileID, string $origin) :void
    {
        $legalActions = new ttLegalMoves($this);
        $legalMoves = $legalActions->legalMoves();
        $location = ttUtility::tileID2location($tileID);

        //1 - check for destination legality
        if (!in_array($location,$legalMoves[$piece_id]))
        {
            throw new \BgaUserException('Invalid move choice');
        }

        $this->checkActionLegality('push', $origin);

        //2 - actually move the piece
        $pieces = new ttPieces($this);
        $reachedGoal = $pieces->movePiece($piece_id,$location);

        $this->notifyAllPlayers("push", clienttranslate('${player_name} pushed a piece'), [
            "player_name" => $this->getActivePlayerName(),
            "piece_id" => $piece_id,
            "tileID" => $tileID,
            "origin" => $origin,
        ]);
        
        //3 - Did we reach the goal?
        if ($reachedGoal) {
            $hasWon = $this->scorePiece($piece_id, $pieces, $origin);
            if ($hasWon) { return; }
        }
        
        $this->endOfActionBoardState($origin);
        $this->goToNextState();        
    }

    //returns true if player won by this move
    private function scorePiece(string $piece_id, ttPieces $pieces, $origin) : true
    {
        $ttPlayers = new ttPlayers($this);
        $ttPlayers->deserializePlayersFromDb();

        //Equivalent to join between players and pieces to get the player who reached the goal
        $player = $ttPlayers->players[$pieces->pieces[$piece_id]['player_id']];
        $ttPlayers->scorePoint($player['player_id']);

        //score point in local copy of $player
        $player['player_score']++;

        $this->notifyAllPlayers("goalAchieved", clienttranslate('${player_name} has a piece in their goal!'), [
            "player_name" => $player['player_name'],
            "piece_id" => $piece_id,
            "player_id" => $player['player_id'],
            "score" => $player['player_score'],
        ]);

        $pieces->deletePiece($piece_id);

        $scoreGoal = count($ttPlayers->players) <= 3 ? 2 : 3;
        if ($player['player_score'] >= $scoreGoal)
        {
            //player has won!
            $this->endOfActionBoardState($origin);
            $this->gamestate->nextState("gameEnd");
            return true;
        }
        return false;
    }

    private function activateCards(string $location) : void
    {
        $board = new ttBoard($this);
        $board->deserializeBoardFromDb();
        
        $color = $board->tiles[$location]['color'];
        $cards = new ttCards($this);

        $activatedCards = [];

        //color is '' on home or goal tiles - cannot activate cards.
        if ($color != '')
        {
            $activatedCards = $cards->activateCardsByColor(intval($this->getActivePlayerId()), $color);
        }

        if (count($activatedCards) > 0)
        {
            $this->notifyAllPlayers("activate", clienttranslate('${player_name} activated ${numCardsActivated} <B>${color}</B>(${colorIcon}) card(s)'), [
                "player_name" => $this->getActivePlayerName(),
                "activatedCards" => $activatedCards,
                "numCardsActivated" => count($activatedCards),
                "color" => $color,
                "colorIcon" => $this->getColorIconHTML($color),
            ]);
        }
    }

    public function actGain(string $color, string $origin) : void
    {
        $player_id = $this->getActivePlayerId();
        
        $ttPieces = new ttPieces($this);
        $pieces = $ttPieces->deserializePiecesFromDb();

        $board = new ttBoard($this);
        $board->deserializeBoardFromDb();

        $colorMatch = false;
        foreach ($pieces as $piece)
        {
            if ($piece['player_id'] ==$player_id)
            {
                $tileColor = $ttPieces->getTileColorPieceIsOn($piece['piece_id'], $board->tiles);
                if ($tileColor == $color)
                {
                    $colorMatch = true;
                    break;
                }
            }
        }

        if (!$colorMatch)
        {
            throw new \BgaUserException('Not a legal color to gain');
        }

        $this->checkActionLegality('gain', $origin);
                
        $players = new ttPlayers($this);
        $players->gainResource($player_id, $color);
        $this->endOfActionBoardState($origin);

        $this->notifyAllPlayers("gain", clienttranslate('${player_name} gained a <B>${color}</B>(${colorIcon}) resource'), [
            "player_id" => $player_id,
            "player_name" => $this->getActivePlayerName(),
            "color" => $color,
            "colorIcon" => $this->getColorIconHTML($color),
            "origin" => $origin,
        ]);

        $this->goToNextState();
    }

    public function actBuy(int $card_id, string $origin) : void
    {
        $player_id = $this->getActivePlayerId();
        
        $card = $this->cards->getCard($card_id);
        $cardData = ttUtility::getCardDataFromType($card);

        $players = new ttPlayers($this);
        $player = $players->deserializePlayersFromDb()[$player_id];

        $legalMoves = new ttLegalMoves($this);
        if (!$legalMoves->isCardBuyable($cardData,$player))
        {
            throw new \BgaUserException('Not enough resources to buy card');
        }

        $this->checkActionLegality('buy', $origin);
        
        $this->cards->moveCard($card_id, 'hand', $player_id);
        $newCard = $this->cards->pickCardForLocation('deck', 'store', $card_id);
        $newCardData = ttUtility::getCardDataFromType($newCard);
        $players->spendResources($player_id, $cardData['resources'][0], $cardData['resources'][1]);

        $storeRequiresReset = $this->checkStoreReset();
        $this->endOfActionBoardState($origin);

        //check for store reset; if so send down the new cards
        $newCards = [];
        if ($storeRequiresReset)
        {
            $newCards = $this->actReset($origin, true);
        }

        $this->notifyAllPlayers("buy", clienttranslate('${player_name} bought a <B>${color}</B>(${colorIcon}) <B>${action}</B> card. A <B>${newColor}</B>(${newColorIcon}) <B>${newAction}</B> was picked for the store.'), [
            "player_id" => $player_id,
            "player_name" => $this->getActivePlayerName(),
            "card" => $card,
            "color" => $cardData['color'],
            "colorIcon" => $this->getColorIconHTML($cardData['color']),
            "action" => $cardData['action'],
            "newColor" => $newCardData['color'],
            "newColorIcon" => $this->getColorIconHTML($newCardData['color']),
            "newAction" => $newCardData['action'],
            "newCard" => $newCard,
            "isStoreReset" => $storeRequiresReset,
            "newCards" => $newCards,
            "origin" => $origin,
        ]);

        $this->goToNextState();        
    }

    public function actSwap(string $gainColor, string $lossColor, string $origin) : void
    {
        if ($gainColor == $lossColor)
        {
            throw new \BgaUserException('Cannot swap the same color!');
        }

        $player_id = $this->getActivePlayerId();
        
        $players = new ttPlayers($this);
        $players->deserializePlayersFromDb();

        $legalActions = new ttLegalMoves($this);
        $this->checkActionLegality('swap', $origin);

        if (!$legalActions->isSwappable($lossColor, $players->players[$player_id]))
        {
            throw new \BgaUserException('Illegal swap');
        }

        $players->swapResources($player_id, $lossColor, $gainColor);

        $this->notifyAllPlayers("swap", clienttranslate('${player_name} swapped a <B>${lossColor}</B>(${lossColorIcon}) resource for a <B>${gainColor}</B>(${gainColorIcon}) resource'), [
            "player_id" => $player_id,
            "player_name" => $this->getActivePlayerName(),
            "lossColor" => $lossColor,
            "lossColorIcon" => $this->getColorIconHTML($lossColor),
            "gainColor" => $gainColor,
            "gainColorIcon" => $this->getColorIconHTML($gainColor),
            "origin" => $origin,
        ]);

        $this->endOfActionBoardState($origin);
        $this->goToNextState();
    }

    //This function can also be called from actBuy if the buy results in a store reset.
    //In this case, it will return the new cards that were picked for the store.
    //Otherwise it behaves as a normal reset and returns null.
    public function actReset(string $origin, bool $specialRuleReset=false) 
    {
        if (!$specialRuleReset)
        {
            $this->checkActionLegality('reset', $origin);
        }

        $this->cards->moveAllCardsInLocation('store', 'discard');
        $newCards = $this->cards->pickCardsForLocation( 6, 'deck', 'store');

        if ($this->checkStoreReset())
        {
            //This reset resulted in another set of cards that need to be reset
            $this->actReset($origin, $specialRuleReset);
            
            //Probably ok if users see the store reset multiple times in a row. If not, uncomment the return below.
            //return;
        }

        if (!$specialRuleReset)
        {
            $this->notifyAllPlayers("reset", clienttranslate('${player_name} reset the store'), [
                "newCards" => $newCards,
                "player_name" => $this->getActivePlayerName(),
                "specialRuleReset" => $specialRuleReset,
                "origin" => $origin,
            ]);

            $this->endOfActionBoardState($origin);
        }
        else
        {
            $this->notifyAllPlayers("reset", clienttranslate('5 cards in the store were the same color or action. The store is reset!'), [
                "newCards" => $newCards,
                "specialRuleReset" => $specialRuleReset,
                "origin" => $origin,
            ]);

            return $newCards;
        }
        
        $this->goToNextState();
    }

    public function actDoneWithTurn() : void
    {
        // Retrieve the active player ID.
        $player_id = (int)$this->getActivePlayerId();

        $this->notifyAllPlayers("doneWithTurn", clienttranslate('${player_name} has finished their turn'), [
            "player_id" => $player_id,
            "player_name" => $this->getActivePlayerName(),
        ]);

        $this->gamestate->nextState("nextPlayer");
    }

    //******************************************************* */
    // Action Support Functions
    //******************************************************* */

    //exhaust a card or check off a player action on the action board
    public function endOfActionBoardState(string $origin) : void
    {
        //if this was from overdrive, we need to check for multiple origins
        if (str_contains($origin,','))
        {
            $origins = explode(',',$origin);
            foreach($origins as $o)
            {
                $this->exhaustCardOrMoveCube($o);
            }
        }
        else
        {
            $this->exhaustCardOrMoveCube($origin);
        }
    }

    private function exhaustCardOrMoveCube(string $origin) : void
    {
        $cards = new ttCards($this);
        if (str_starts_with($origin, 'card'))
        {
            $cards->setCardStatus(ttCards::getCardIDFromDivID($origin), 'exhausted');
        }
        else
        {
            $actionBoardSelections = new ttActionBoardSelections($this);
            $actionBoardSelections->setSelected($origin);
        }
    }

    //If a player resets the store or buys a card, 
    //then if 5 or more cards have the same color or action, we reset the store.
    public function checkStoreReset() : bool
    {
        $storeCards = $this->cards->getCardsInLocation('store');
        $colorCount = ['red' => 0, 'blue' => 0, 'green' => 0, 'yellow' => 0];
        $actionCount = ['move' => 0, 'gain' => 0, 'push' => 0];

        foreach($storeCards as $card)
        {
            $cardData = ttUtility::getCardDataFromType($card);
            $colorCount[$cardData['color']]++;
            $actionCount[$cardData['action']]++;
        }

        return (max($colorCount) >= 5 || max($actionCount) >= 5);
    }

    //If player has no legal actions left, move to next player. Otherwise, stay in selectAction state.
    public function goToNextState() : void
    {
        //if no legal actions are left, move to the next player
        //Otherwise, stay move back to selectAction
        $nextState = (new ttLegalMoves($this))->hasLegalActions() ? "selectAction" : "nextPlayer";

        if ($nextState == "nextPlayer")
        {
            $this->notifyAllPlayers("doneWithTurn", clienttranslate('${player_name} has finished their turn'), 
            [
                "player_name" => $this->getActivePlayerName(),
            ]);
        }
        
        $this->gamestate->nextState($nextState);
    }

    private function checkActionLegality(string $action, string $origin) : void
    {
        $legalActions = new ttLegalMoves($this);
        $isOverDriveOrigin = str_contains($origin, ',');

        if (!$isOverDriveOrigin && !in_array($action, $legalActions->legalActions()))
        {
            throw new \BgaUserException('This is not a legal action!');
        }
    }

    public function getColorIconHTML(string $color) : string
    {
        return '<span class="'.$color.' icon"></span>';
    }

    public function getPlayerGoals() : array
    {
        return $this->getPlayersNumber() == 3 ? self::PLAYERGOALS3P : self::PLAYERGOALS2P4P;
    }

    public function getIllegalTiles() : array
    {
        return $this->getPlayersNumber() == 3 ? self::ILLEGALTILES3P : self::ILLEGALTILES2P4P;
    }

    /**
     * Game state arguments.
     */
    public function argSelectAction(): array
    {
        // Get some values from the current game situation from the database.

        return $this->getAllDatas();
    }

    /**
     * Compute and return the current game progression.
     *
     * The number returned must be an integer between 0 and 100.
     *
     * This method is called each time we are in a game state with the "updateGameProgression" property set to true.
     *
     * @return int
     * @see ./states.inc.php
     */
    public function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }

    /**
     * Game state action, example content.
     *
     * The action method of state `nextPlayer` is called everytime the current game state is set to `nextPlayer`.
     */
    public function stNextPlayer(): void {
        // Retrieve the active player ID.
        $player_id = (int)$this->getActivePlayerId();

        // Give some extra time to the active player when he completed an action
        $this->giveExtraTime($player_id);
        
        $this->activeNextPlayer();

        $player_id = (int)$this->getActivePlayerId(); //get the new active player id

        $actionBoardSelections = new ttActionBoardSelections($this);
        $actionBoardSelections->clearPlayerSelections($player_id);

        $cards = new ttCards($this);
        $cards->deactivateAllCards($player_id);
    
        // Go to another gamestate
        // Here, we would detect if the game is over, and in this case use "endGame" transition instead 
        $this->gamestate->nextState("nextPlayer");
    }

    public function argGameEnd(): array
    {
        $parentResult = parent::argGameEnd();

        return array_merge($parentResult, $this->getAllDatas());
    }

    /**
     * Migrate database.
     *
     * You don't have to care about this until your game has been published on BGA. Once your game is on BGA, this
     * method is called everytime the system detects a game running with your old database scheme. In this case, if you
     * change your database scheme, you just have to apply the needed changes in order to update the game database and
     * allow the game to continue to run with your new version.
     *
     * @param int $from_version
     * @return void
     */
    public function upgradeTableDb($from_version)
    {
//       if ($from_version <= 1404301345)
//       {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            $this->applyDbUpgradeToAllDB( $sql );
//       }
//
//       if ($from_version <= 1405061421)
//       {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            $this->applyDbUpgradeToAllDB( $sql );
//       }
    }

    /*
     * Gather all information about current game situation (visible by the current player).
     *
     * The method is called each time the game interface is displayed to a player, i.e.:
     *
     * - when the game starts
     * - when a player refreshes the game page (F5)
     */
    protected function getAllDatas() :array
    {
        $result = [];

        //$current_player_id = (int) $this->getCurrentPlayerId();
        // TODO: Gather all information about current game situation (visible by player $current_player_id).

        $players = new ttPlayers($this);
        $result["players"] = $players->deserializePlayersFromDb();

        $board = new ttBoard($this);
        $result['board'] = $board->deserializeBoardFromDb();

        $pieces = new ttPieces($this);
        $piecesData = $pieces->deserializePiecesFromDb();

        $actionBoardSelections = new ttActionBoardSelections($this);
        $result['actionBoardSelections'] = $actionBoardSelections->deserializeActionBoardSelectionsFromDb();

        //append color of tile that the piece is on to the piece data
        foreach ($piecesData as $piece_id => $piece)
        {
            $piecesData[$piece_id]['tile_color'] = $pieces->getTileColorPieceIsOn($piece_id, $board->tiles);
        }

        $result['pieces'] = $piecesData;
        $result['playerHomes'] = self::PLAYERHOMES;
        $result['store'] = $this->cards->getCardsInLocation('store');

        $cards = new ttCards($this);
        $result['buyableCards'] = $cards->getBuyableCards($result['store'], $result['players'][$this->getActivePlayerId()]);
        
        $result['swappableResources'] = [];
        foreach($players->players as $player)
        {
            $swappableResources = [];
            foreach(self::COLORS as $color)
            {
                if ($player[$color.'_resource_qty'] > 0)
                {
                    $swappableResources[] = $color;
                }
            }

            $result['swappableResources'][$player['player_id']] = $swappableResources;
        }
        
        $result['hands'] = $this->cards->getCardsInLocation('hand');

        $legalActions = new ttLegalMoves($this);
        $result['legalActions'] = $legalActions->legalActions($result['hands']);

        if (in_array('move',$result['legalActions']) || in_array('push',$result['legalActions']))
        {
            $result['legalMoves'] = $legalActions->legalMoves();
        }

        return $result;

    }

    protected function getGameState(): array
    {
        $state = parent::getGameState();
    }

    /**
     * Returns the game name.
     *
     * IMPORTANT: Please do not modify.
     */
    protected function getGameName()
    {
        return "tactile";
    }

    /**
     * This method is called only once, when a new game is launched. In this method, you must setup the game
     *  according to the game rules, so that the game is ready to be played.
     */
    protected function setupNewGame($players, $options = [])
    {
        // Set the colors of the players with HTML color code. 
        $gameinfos = $this->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        $board = new ttBoard($this);
        $board->createBoard();

        $ttPlayers = new ttPlayers($this);
        $ttPlayers->createPlayers($players);

        $ttPieces = new ttPieces($this);
        $ttPieces->createPieces($ttPlayers->players);

        $ttCards = new ttCards($this);
        $ttCards->createCards();

        $ttActionBoardSelections = new ttActionBoardSelections($this);
        $ttActionBoardSelections->createActionBoardSelections($ttPlayers->players);
        
        $this->cards->shuffle('deck');

        //testing reset - only two colors
        self::DbQuery(sprintf("UPDATE card SET card_location='discard' where card_type LIKE '%s_%%' or card_type LIKE '%s_%%'", 'red','blue'));


        $this->cards->pickCardsForLocation( 6, 'deck', 'store');
        if ($this->checkStoreReset())
        {
            $this->actReset('specialRule', true);
        }

        //test data
        $this->cards->pickCardsForLocation( 10, 'deck', 'hand', 2383264);
        $this->cards->pickCardsForLocation( 4, 'deck', 'hand', 2383265);

        //testing buy - issue plenty of resources
        self::DbQuery("UPDATE player SET red_resource_qty=20, blue_resource_qty=20, green_resource_qty=20, yellow_resource_qty=20");

        // Init game statistics.
        //
        // NOTE: statistics used in this file must be defined in your `stats.inc.php` file.

        // Dummy content.
        // $this->initStat("table", "table_teststat1", 0);
        // $this->initStat("player", "player_teststat1", 0);

        // TODO: Setup the initial game situation here.

        // Activate first player once everything has been initialized and ready.
        $this->activeNextPlayer();
    }

    /**
     * This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
     * You can do whatever you want in order to make sure the turn of this player ends appropriately
     * (ex: pass).
     *
     * Important: your zombie code will be called when the player leaves the game. This action is triggered
     * from the main site and propagated to the gameserver from a server, not from a browser.
     * As a consequence, there is no current player associated to this action. In your zombieTurn function,
     * you must _never_ use `getCurrentPlayerId()` or `getCurrentPlayerName()`, otherwise it will fail with a
     * "Not logged" error message.
     *
     * @param array{ type: string, name: string } $state
     * @param int $active_player
     * @return void
     * @throws feException if the zombie mode is not supported at this game state.
     */
    protected function zombieTurn(array $state, int $active_player): void
    {
        $state_name = $state["name"];

        if ($state["type"] === "activeplayer") {
            switch ($state_name) {
                default:
                {
                    $this->gamestate->nextState("zombiePass");
                    break;
                }
            }

            return;
        }

        // Make sure player is in a non-blocking status for role turn.
        if ($state["type"] === "multipleactiveplayer") {
            $this->gamestate->setPlayerNonMultiactive($active_player, '');
            return;
        }

        throw new \feException("Zombie mode not supported at this game state: \"{$state_name}\".");
    }
}
