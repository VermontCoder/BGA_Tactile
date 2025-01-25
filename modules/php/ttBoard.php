<?php

declare(strict_types=1);

namespace Bga\Games\tactiledf;

require_once("ttDebug.php");
require_once("ttUtility.php");

class ttBoard
{
    public int $BOARD_WIDTH = 6;
    public int $BOARD_HEIGHT = 6;
    public array $tiles = array();

    const COLORS = ['red','yellow','green','blue'];
    const PLAYERHOMES = ['0_0' => 'green', '5_0' => 'blue', '0_5' => 'red', '5_5' => 'yellow'];

    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function createBoard()
    {
        for ($i = 0; $i < $this->BOARD_HEIGHT; $i++)
        {
            for ($j = 0; $j < $this->BOARD_WIDTH; $j++)
            {
                $tile_id = ttUtility::xy2id($i,$j);
                if(isset(self::PLAYERHOMES[$tile_id]))
                {
                    $this->tiles[$tile_id] = array(
                        'tile_id' => $tile_id,
                        'color' => self::PLAYERHOMES[$tile_id],
                    );
                }
                else
                {
                    $this->tiles[$tile_id] = array(
                        'tile_id' => $tile_id,
                        'color' => self::COLORS[random_int(0,3)],
                    );
                }

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

        return $this->tiles;
    }

}