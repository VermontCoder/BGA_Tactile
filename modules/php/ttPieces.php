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
                $piece['piece_color'] = $player['color_name'];
                $piece['finished'] = false;
                $piece['location'] = self::PIECESHOMES[$player['color_name']];
                $this->pieces[] = $piece;
            }
        }
        
        $this->serializePiecesToDb($this->pieces);
    }

    private function serializePiecesToDb($pieces)
    {
        foreach ($pieces as $piece) {
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%d')", [
                $piece['piece_id'],
                $piece['piece_owner'],
                $piece['piece_color'],
                $piece['location'],
                $piece['finished'],
            ]);
        }

        $query = sprintf("INSERT INTO pieces (piece_id, piece_owner, piece_color, location, finished) VALUES %s", implode(',', $query_values));
        $this->game::DbQuery($query);
    }

    public function deserializePiecesFromDb()
    {
        $sql = "SELECT piece_id, piece_owner, piece_color, location, finished FROM pieces";
        $this->pieces = $this->game->getCollectionFromDb($sql);

        foreach ($this->pieces as $piece)
        {
            $this->pieces[$piece['piece_id']]['finished'] = boolval($piece['finished']);
        }
        //(new ttDebug($this->game))->showVariable('players', $this->$players);

        return $this->pieces;
    }

    public function getPieceLocations()
    {
        if (empty($this->pieces))
        {
            $this->deserializePiecesFromDb();
        }

        $pieceLocations = [];
        foreach ($this->pieces as $piece)
        {
            $pieceLocations[$piece['piece_id']] = $piece['location'];
        }

        return $pieceLocations;
    }

    public static function isPieceFinished(array $piece) : bool
    {
        return $piece['finished'];
    }
}