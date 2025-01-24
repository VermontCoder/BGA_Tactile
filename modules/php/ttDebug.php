<?php

namespace Bga\Games\tactiledf;

class ttDebug
{
    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function showVariable($nameOfVariable,$variable)
    {
        $this->game->notifyAllPlayers('showVariable', $nameOfVariable.':'.json_encode( $variable));
    }
}