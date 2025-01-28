<?php

declare(strict_types=1);

namespace Bga\Games\tactile;

/**
     * This class sends back arrays of legal moves for the active player, depending on the action they are taking.
*/
class ttLegalMoves
{
    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function legalActions(array $gamedatas) : array
    {
        $legalActions = [];

        //get cards in player's hand which are active
        $activeCardsInHand = $this->game->cards->getCardsOfTypeInLocation(null, ttCards::CARDSTATUS['active'],'hand', $this->game->getActivePlayerId());

        $firstActionCardAction = $this->game->globals->get($this->game::FIRST_ACTION_CARD_ACTION);
        $secondActionCardAction = $this->game->globals->get($this->game::SECOND_ACTION_CARD_ACTION);

        /* Check each possible action for legality. Assume it *is* legal and make it false if it is not. */

        /* MOVE ACTION */
        $moveLegal = true;
        $moveLegal = !($firstActionCardAction == 'move' || $secondActionCardAction == 'move');

        foreach($activeCardsInHand as $card)
        {
            $cardData
            if($card['type'] == 'move')
            {
                $moveLegal = true;
            }
        }
        
    }


    
}