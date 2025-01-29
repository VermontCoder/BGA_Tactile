<?php

declare(strict_types=1);

namespace Bga\Games\tactile;

class ttPieces
{
    public array $pieces = array();
    const PIECESHOMES = ['green' => '0_0', 'blue' => '5_0', 'red' => '0_5', 'yellow' => '5_5'];

    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function createPieces($players)
    {
        foreach ($players as $player_id => $player)
        {
            for($i=0; $i<2; $i++)
            {
                $piece = array();
                $piece['piece_id'] = $player_id . '_'.strval($i);
                $piece['piece_owner'] = $player_id;
                $piece['finished'] = false;
                $piece['location'] = self::PIECESHOMES[$player['color_name']];
                $this->pieces[] = $piece;
            }
        }
        
        $this->serializePiecesToDb($this->pieces);
    }

    public function serializePiecesToDb($pieces)
    {
        foreach ($pieces as $piece) {
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s')", [
                $piece['piece_id'],
                $piece['piece_owner'],
                $piece['location'],
                $piece['finished'],
            ]);
        }

        $query = sprintf("INSERT INTO pieces (piece_id, piece_owner, location, finished) VALUES %s", implode(',', $query_values));
        $this->game::DbQuery($query);
    }

    public function deserializePiecesFromDb()
    {
        $sql = "SELECT piece_id, piece_owner, location, finished FROM pieces";
        $this->pieces = $this->game->getCollectionFromDb($sql);
        //(new ttDebug($this->game))->showVariable('players', $this->$players);

        return $this->pieces;
    }

    //* These functions are only callable after deserializePiecesFromDb has been called
    public function getPieceLocations()
    {
        $pieceLocations = [];
        foreach ($this->pieces as $piece)
        {
            $pieceLocations[$piece['piece_id']] = $piece['location'];
        }

        return $pieceLocations;
    }

    public function isPieceFinished(string $piece_id)
    {
       return $this->pieces[$piece_id]['finished'];
    }
}