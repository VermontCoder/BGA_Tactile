<?php

declare(strict_types=1);

namespace Bga\Games\tactiledf;

require_once("ttDebug.php");

class ttBoard
{
    public int $BOARD_WIDTH = 6;
    public int $BOARD_HEIGHT = 6;
    public array $tiles = array();

    public array $colors = ['red','yellow','green','blue'];

    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function buildBoard()
    {
        for ($i = 0; $i < $this->BOARD_WIDTH; $i++)
        {
            for ($j = 0; $j < $this->BOARD_HEIGHT; $j++)
            {
                $this->tiles[strval($i).'_'.strval($j)] = array(
                    'color' => $this->colors[random_int(0,3)],
                    );
            }
        }

        $this->serializeBoardToDb();
    }

    public function serializeBoardToDb()
    {
        foreach ($this->tiles as $tile_id => $tile) {
            $query_values[] = vsprintf("('%s', '%s')", [
                $tile_id,
                $tile['color'],
            ]);
        }

        $this->game::DbQuery(
            sprintf(
                "INSERT INTO board (tile_id, color) VALUES %s",
                implode(",", $query_values)
            )
        );
    }

    public function deserializeBoardFromDb()
    {
        $sql = "SELECT tile_id, color FROM board";
        $board = $this->game->getCollectionFromDb($sql);
        (new ttDebug($this->game))->showVariable('board', $board);
        foreach ($board as $tile_id => $tile) {
            // $tile_id = $board['tile_id'];
            $this->tiles[$tile_id] = array(
                'tile_id' => $tile_id,
                'color' => $tile['color'],
            );
        }
    }

}