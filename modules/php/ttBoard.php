<?php

declare(strict_types=1);

namespace Bga\Games\tactile;

class ttBoard
{
    const BOARD_WIDTH = 6;
    const BOARD_HEIGHT = 6;

    public array $tiles = array();

    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function createBoard() : void
    {
        $tileColors = [];

        for ($i = 0; $i < count($this->game::COLORS); $i++)
        {
            $tileColors = array_merge($tileColors, array_fill(0, 8, $this->game::COLORS[$i]));
        }

        shuffle($tileColors);

        for ($i = 0; $i < self::BOARD_HEIGHT; $i++)
        {
            for ($j = 0; $j < self::BOARD_WIDTH; $j++)
            {
                $tile_id = ttUtility::xy2id($i,$j);
                if(isset($this->game::PLAYERHOMES[$tile_id]))
                {
                    $this->tiles[$tile_id] = array(
                        'tile_id' => $tile_id,
                        'color' => '',
                    );
                }
                else
                {
                    $this->tiles[$tile_id] = array(
                        'tile_id' => $tile_id,
                        'color' => array_shift($tileColors),
                    );
                }

            }
        }

        $this->serializeBoardToDb();
    }

    public function serializeBoardToDb() : void
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

    public function deserializeBoardFromDb() : array
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