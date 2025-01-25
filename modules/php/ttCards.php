<?php
declare(strict_types=1);

namespace Bga\Games\tactiledf;

require_once("ttDebug.php");
require_once("ttUtility.php");

class ttCards
{
    public array $cards = array();

    const CARDDATA = [0 => ['color' => 'red', 'type' => 'move', 'cost' => ['R','R']],
                        1=> ['color' => 'red', 'type' => 'move', 'cost' => ['R','Y']],
                        2=> ['color' => 'red', 'type' => 'move', 'cost' => ['R','G']],
                        3=> ['color' => 'red', 'type' => 'move', 'cost' => ['R','B']]]; 

    public function __construct(Game $game)
    {
        $this->game = $game;

        $this->cards = $this->game->getNew( "module.common.deck" );
        $this->cards->init( "card" );
        $this->cards->autoreshuffle = true;
    }

    public function createCards()
    {
        $cards = array();
        $cards[] = array( 'type' => null, 'type_arg'=> null, 'card_location' => 'deck', 'nbr' => 120);

        $this->cards->createCards( $cards, 'deck' );

        //card object doesn't take nulls for type and type_arg, so do that here. Also start ids at zero.

        $this->game::DbQuery("UPDATE card SET card_type = null, card_type_arg = null, card_id = card_id - 1");
    }

    private function combineData (array $card) : array
    {

    }

    private function combineDatas (array $cards) : array
    {
       
    }
}