<?php
declare(strict_types=1);

namespace Bga\Games\tactiledf;

class ttCards
{
    public array $cards = array();
    
    const CARDTYPES = ['move', 'push', 'gain'];
    const COLORS = ['red','yellow','green','blue'];
    public static array $CARDDATA = array(); 

    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function createCards()
    {
        $cards = array();

        foreach(ttCards::CARDTYPES as $cardType)
        {
            foreach(ttCards::COLORS as $color)
            {
                for($i=0; $i <= 3; $i++)
                {
                    for($j=$i; $j <= 3; $j++)
                    {
                        $type = $color.'_'.$cardType.'_'.ttCards::COLORS[$i].'_'.ttCards::COLORS[$j];
                        $cards[] = array( 'type' => $type, 'type_arg'=> 0, 'card_location' => 'deck', 'nbr' => 1);
                    }
                }
            }
        }

        $this->game->cards->createCards( $cards, 'deck' );

        //card_id needs to correspond to the image offset to display the card.
        //The order of the cards is stored in card_location_arg.
        //We need to overwrite card_id to match the image offset.

        $this->game::DbQuery("UPDATE card SET card_id=card_location_arg+500");
        $this->game::DbQuery("UPDATE card SET card_id=card_id-501");
    }
}