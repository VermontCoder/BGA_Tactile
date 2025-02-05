<?php

declare(strict_types=1);

namespace Bga\Games\tactile;

class ttPieces
{
    public array $pieces = array();

    public static function parsePieceDivData($piece_id)
    {
        $pieceData = explode('_', $piece_id);
        return ['player_id' => $pieceData[1], 'piece_number' => $pieceData[2]];
    }

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
                $piece['piece_id'] = 'piece_' . $player_id . '_'.strval($i);
                $piece['player_id'] = $player_id;
                $piece['piece_color'] = $player['color_name'];
                $piece['finished'] = false;
                $piece['location'] = ttBoard::COLORHOMES[$player['color_name']];
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
                $piece['player_id'],
                $piece['piece_color'],
                $piece['location'],
                $piece['finished'],
            ]);
        }

        $query = sprintf("INSERT INTO pieces (piece_id, player_id, piece_color, location, finished) VALUES %s", implode(',', $query_values));
        $this->game::DbQuery($query);
    }

    public function deserializePiecesFromDb()
    {
        $sql = "SELECT piece_id, player_id, piece_color, location, finished FROM pieces";
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

    public function movePiece($piece_id, $location)
    {
        $this->pieces[$piece_id]['location'] = $location;
        $sql = sprintf("UPDATE pieces SET location = '%s' WHERE piece_id = '%s'", $location, $piece_id); 
        $this->game::DbQuery($sql);
    }
}