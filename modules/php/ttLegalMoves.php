<?php

declare(strict_types=1);

namespace Bga\Games\tactile;

/**
     * This class sends back arrays of legal moves for the active player, depending on the action they are taking.
*/
class ttLegalMoves
{
    const ACTIONS= ['move', 'gain', 'buy', 'swap', 'reset', 'push' ];

    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function legalActions() : array
    {
        $legalActions = [];
        $player_id = (int)$this->game->getActivePlayerId();
        
        //get cards in player's hand which are active
        $activeCardsInHand = $this->game->cards->getCardsOfTypeInLocation(null, ttCards::CARDSTATUS['active'],'hand', $player_id);

        //get the player's selections on the action board
        $actionBoardSelections = new ttActionBoardSelections($this->game);
        $playerSelections = $actionBoardSelections->getPlayerSelections($player_id);

        foreach(ttLegalMoves::ACTIONS as $action)
        {
            if ($this->checkActionLegal($action, $playerSelections, $activeCardsInHand))
            {
                $legalActions[]= $action;
            }
        }

        return $legalActions;
    }

    public function hasLegalActions() : bool
    {
        return count($this->legalActions()) > 0;
    }

    private function checkActionLegal(string $action, array $playerSelections, array $activeCardsInHand) : bool
    {
        //if the player has already made two selections, the only legal selections come from the cards.
        $legal = count($playerSelections) < 2;

        //if the player has already made a selection of this action on the action board, it is not legal to make another selection of the same action
         // Check if any of the arrays in $playerSelections contain a key 'action' with a value matching $action
        foreach ($playerSelections as $selection) 
        {
            if ($selection == $action) {
                $legal = false;
                break;
            }
        }

        foreach($activeCardsInHand as $card)
        {
            $cardData = ttUtility::getCardData($card);
            if($cardData['action'] == $action)
            {
                $legal = true;
                break;
            }
        }

        return $legal;
    }

    public function legalMoves() : array
    {
        $legalMoves = [];
        //$player_id = (int)$this->game->getActivePlayerId();

        $pieces = new ttPieces($this->game);
        $pieceLocations = $pieces->getPieceLocations();

        foreach($pieces->pieces as $piece)
        {
            //if ($piece['player_id'] != $player_id) continue;
            if ($piece['finished']) continue;

            $adjacentLocations = ttUtility::getAdjacentSpacesIDs($piece['location']);

            //home and goal spaces are always legal, remove them from the list of illegal moves even if they have pieces on them
            $illegalLocations = array_diff($pieceLocations, 
                [ttBoard::PLAYERGOALS[$piece['piece_color']],ttBoard::COLORHOMES[$piece['piece_color']]]);

            $illegalLocations = array_merge($illegalLocations, ttBoard::ILLEGALTILES[$piece['piece_color']]);

            $possibleMoves = [];

            foreach($adjacentLocations as $adjacentLocation)
            {
                if (!in_array($adjacentLocation, $illegalLocations))
                {
                    $possibleMoves[] = $adjacentLocation;
                }
            }            

            $legalMoves[ $piece['piece_id']] = $possibleMoves;
        }
        
        //$this->game->dump('legal moves',$legalMoves);
        return $legalMoves;
    }


    
}