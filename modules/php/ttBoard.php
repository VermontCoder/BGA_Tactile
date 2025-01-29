<?php

declare(strict_types=1);

namespace Bga\Games\tactile;

class ttBoard
{
    const BOARD_WIDTH = 6;
    const BOARD_HEIGHT = 6;
    
    const COLORS = ['red','yellow','green','blue'];
    const PLAYERHOMES = ['0_0' => 'green', '5_0' => 'blue', '0_5' => 'red', '5_5' => 'yellow'];
    const PLAYERGOALS = ['green' => '5_5', 'blue' => '0_5', 'red' => '5_0', 'yellow' => '0_0'];

    public array $tiles = array();

    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function createBoard()
    {
        for ($i = 0; $i < self::BOARD_HEIGHT; $i++)
        {
            for ($j = 0; $j < self::BOARD_WIDTH; $j++)
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
        //(new ttDebug($this->game))->showVariable('board', $board);

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