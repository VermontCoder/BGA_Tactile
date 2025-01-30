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

        //get cards in player's hand which are active
        $activeCardsInHand = $this->game->cards->getCardsOfTypeInLocation(null, ttCards::CARDSTATUS['active'],'hand', $this->game->getActivePlayerId());

        foreach(ttLegalMoves::ACTIONS as $action)
        {
            if ($this->checkActionLegal($action, $activeCardsInHand()))
            {
                $legalActions[]= $action;
            }
        }

        return $legalActions;
    }

    private function checkActionLegal(string $action, int $player_id, array $activeCardsInHand) : bool
    {
        $actionBoardSelections = new ttActionBoardSelections($this->game);
        $playerSelections = $actionBoardSelections->getPlayerSelections($player_id);

        $legal = true;

        //if the player has already made a selection of this action, it is not legal to make another selection of the same action
        $legal = !array_filter($playerSelections, function($selection) use ($action) {
            return $selection['action'] == $action;
        });

        foreach($activeCardsInHand as $card)
        {
            $cardData = ttUtility::getCardData($card);
            if($card['action'] == $action)
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
        $player_id = (int)$this->game->getActivePlayerId();

        $piecesObj = new ttPieces($this->game);
        
        $pieces = $piecesObj->deserializePiecesFromDb();
        $pieceLocations = $piecesObj->getPieceLocations();

        foreach($pieces as $piece)
        {
            if ($piece['piece_owner'] != $player_id) continue;
            if (ttPieces::isPieceFinished($piece)) continue;

            $possibleMoves = ttUtility::getAdjacentSpacesIDs($piece['location']);

            //home and goal spaces are always legal, remove them from the list of illegal moves even if they have pieces on them
            $illegalLocations = array_diff($pieceLocations, 
                [ttBoard::PLAYERGOALS[$piece['piece_color']],ttBoard::COLORHOMES[$piece['piece_color']]]);

            $illegalLocations = array_merge($illegalLocations, ttBoard::ILLEGALTILES[$piece['piece_color']]);

            $possibleMoves = array_diff($possibleMoves, array_values($illegalLocations));


            $pieceMoves = [$piece['piece_id'] => $possibleMoves];
            
            $legalMoves[] = $pieceMoves;
        }

        return $legalMoves;
    }


    
}