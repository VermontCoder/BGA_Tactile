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


    
}