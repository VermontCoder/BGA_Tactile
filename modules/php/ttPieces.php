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
                $piece['location'] = ttBoard::COLORHOMES[$player['color_name']];
                $this->pieces[] = $piece;
            }
        }
        
        $this->serializePiecesToDb($this->pieces);
    }

    private function serializePiecesToDb($pieces)
    {
        foreach ($pieces as $piece) {
            $query_values[] = vsprintf("('%s', %01d, '%s', '%s')", [
                $piece['piece_id'],
                $piece['player_id'],
                $piece['piece_color'],
                $piece['location'],
            ]);
        }

        $query = sprintf("INSERT INTO pieces (piece_id, player_id, piece_color, location) VALUES %s", implode(',', $query_values));
        $this->game::DbQuery($query);
    }

    public function deserializePiecesFromDb() : array
    {
        $sql = "SELECT piece_id, player_id, piece_color, location FROM pieces";
        $this->pieces = $this->game->getCollectionFromDb($sql);

        return $this->pieces;
    }

    public function getPieceLocations() : array
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

    
    //** Move piece to new location, return true if piece is in goal */
    public function movePiece($piece_id, $location) : bool
    {
        $sql = sprintf("UPDATE pieces SET location = '%s' WHERE piece_id = '%s'", $location, $piece_id); 
        $this->game::DbQuery($sql);

        $this->deserializePiecesFromDb();
        
        return $location == ttBoard::PLAYERGOALS[$this->pieces[$piece_id]['piece_color']];
    }

    public function deletePiece($piece_id) : void
    {
        $sql = sprintf("DELETE FROM pieces WHERE piece_id = '%s'", $piece_id); 
        $this->game::DbQuery($sql);
    }

    public function getTileColorPieceIsOn($piece_id, $tiles) : ?string
    {
        if (empty($this->pieces))
        {
            $this->deserializePiecesFromDb();
        }

        $location = $this->pieces[$piece_id]['location'];
        return $tiles[$location]['color'];
    }
}