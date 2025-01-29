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

        $firstActionCardAction = $this->game->globals->get($this->game->FIRST_ACTION_CARD_ACTION);
        $secondActionCardAction = $this->game->globals->get($this->game->SECOND_ACTION_CARD_ACTION);

        foreach(ttLegalMoves::ACTIONS as $action)
        {
            if ($this->checkActionLegal($action, $activeCardsInHand,$firstActionCardAction,$secondActionCardAction))
            {
                $legalActions[]= $action;
            }
        }

        return $legalActions;
    }

    private function checkActionLegal(string $action, array $activeCardsInHand, ?string $firstActionCardAction, ?string $secondActionCardAction) : bool
    {
        $legal = !($firstActionCardAction == $action || $secondActionCardAction == $action);

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