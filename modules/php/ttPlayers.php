<?php

declare(strict_types=1);

namespace Bga\Games\tactile;

class ttPlayers
{
    public array $players = array();
    const RGB2NAME =
    [   'f10000' => 'red',
        'f3ac11' => 'yellow',
        '6ab524' => 'green',
        '0f87da' => 'blue'];
    
    const NAME2RGB =
    [   'red' => 'f10000',
        'yellow' => 'f3ac11',
        'green' => '6ab524',
        'blue' => '0f87da'];


    public function __construct(Game $game)
    {
        //$this->$players = array();
        $this->game = $game;
    }

    public function createPlayers($players) : void
    {
        $gameinfos = $this->game->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        foreach ($players as $player_id => $player) {
            $curColor = array_shift($default_colors);
            $curColorName = self::RGB2NAME[$curColor];

            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s', '%s',%01d,%01d,%01d,%01d)", [
                $player_id,
                $curColor,
                $curColorName,
                $player["player_canal"],
                addslashes($player["player_name"]),
                addslashes($player["player_avatar"]),
                0,
                0,
                0,
                0
            ]);
        }

        $this->game::DbQuery(
            sprintf(
                "INSERT INTO player (player_id, player_color, color_name, player_canal, player_name, player_avatar, red_resource_qty,
                blue_resource_qty, green_resource_qty,  yellow_resource_qty) VALUES %s",
                implode(",", $query_values)
            ));

        $this->game->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
        $this->game->reloadPlayersBasicInfos();

        //The reattributing of colors causes the color names to misalign with the colors
        //This code corrects the color names

        //get the new players table
        $players = $this->deserializePlayersFromDb();
        
        foreach ($players as $player_id => $player) {
            $this->game->DbQuery(
                sprintf(
                    "UPDATE player SET color_name = '%s' WHERE player_id = %s",
                    self::RGB2NAME[$player['player_color']],
                    $player_id
                )
            );
        }

        //reload the players table
        $this->players = $this->deserializePlayersFromDb();

    }

    public function deserializePlayersFromDb() : array
    {
        $sql = "SELECT player_id, player_color, color_name, player_score, player_canal, player_name, player_avatar, red_resource_qty,
        blue_resource_qty, green_resource_qty, yellow_resource_qty, ally_id FROM player";
        $this->players = $this->game->getCollectionFromDb($sql);
        //(new ttDebug($this->game))->showVariable('players', $this->players);

        return $this->players;
    }

    public function setPlayerColor($player_id, $color) : void
    {
        $this->game->DbQuery(
            sprintf(
                "UPDATE player SET player_color = '%s', color_name = '%s' WHERE player_id = %s",
                self::NAME2RGB[$color],
                $color,
                $player_id
            )
        );

        if (empty($this->players))
        {
            $this->deserializePlayersFromDb();
        }
        else
        {
            $this->players[$player_id]['player_color'] = self::NAME2RGB[$color];
            $this->players[$player_id]['color_name'] = $color;
        }
    }

    public function gainResource($player_id, $resource) : void
    {
        $resourceCol = $resource . "_resource_qty";
        $this->game->DbQuery(
            sprintf(
                "UPDATE player SET %s = %s + 1 WHERE player_id = %s",
                $resourceCol,
                $resourceCol,
                $player_id
            )
        );
    }

    public function spendResources($player_id, $resource0,$resource1) : void
    {
        $resourceCol0 = $resource0 . "_resource_qty";
        $resourceCol1 = $resource1 . "_resource_qty";
        $this->game->DbQuery(
            sprintf(
                "UPDATE player SET %s = %s - 1, %s = %s - 1 WHERE player_id = %s",
                $resourceCol0,
                $resourceCol0,
                $resourceCol1,
                $resourceCol1,
                $player_id
            )
        );
    }

    public function swapResources($player_id, $lostResource, $gainedResource) : void
    {
        $lostResourceCol = $lostResource . "_resource_qty";
        $gainedResourceCol = $gainedResource . "_resource_qty";
        $this->game->DbQuery(
            sprintf(
                "UPDATE player SET %s = %s - 1, %s = %s + 1 WHERE player_id = %s",
                $lostResourceCol,
                $lostResourceCol,
                $gainedResourceCol,
                $gainedResourceCol,
                $player_id
            )
        );
    }

    public function scorePoint($player_id) : void
    {
        $this->game->DbQuery(
            sprintf(
                "UPDATE player SET player_score = player_score + 1 WHERE player_id = %s",
                $player_id
            )
        );

        if (empty($this->players))
        {
            $this->deserializePlayersFromDb();
        }
        else
        {
            $this->players[$player_id]['player_score']++;
        }
    }

    public function setAlly($player_id, $ally_id) : void
    {
        $this->game->DbQuery(
            sprintf(
                "UPDATE player SET ally_id = %s WHERE player_id = %s",
                $ally_id,
                $player_id
            )
        );

        if (empty($this->players))
        {
            $this->deserializePlayersFromDb();
        }
        else
        {
            $this->players[$player_id]['ally_id'] = $ally_id;
        }
    }

    public function randomizeAllies() : void
    {
        $playersWithIdx = [];
        foreach($this->players as $player_id => $player)
        {
            $playersWithIdx[] = $player;
        }

        shuffle($playersWithIdx);
        
        $this->setAlly($playersWithIdx[0]['player_id'], $playersWithIdx[1]['player_id']);
        $this->setAlly($playersWithIdx[1]['player_id'], $playersWithIdx[0]['player_id']);
        $this->setAlly($playersWithIdx[2]['player_id'], $playersWithIdx[3]['player_id']);
        $this->setAlly($playersWithIdx[3]['player_id'], $playersWithIdx[2]['player_id']);
    }

    private function updatePlayerColorAndNo($player_id, $color, $player_no) : void
    {
        $this->players[$player_id]['player_color'] = self::NAME2RGB[$color];
        $this->players[$player_id]['color_name'] = $color;

        $this->game->DbQuery(
            sprintf(
                "UPDATE player SET player_color = '%s', color_name = '%s', player_no='%01d' WHERE player_id = %s",
                self::NAME2RGB[$color],
                $color,
                $player_no,
                $player_id
            )
        );
    }

    public function assignTeams() : void
    {
        $PLAYER_COLOR_2_ORDER = ['red' => 1, 'yellow' => 2, 'green' => 3, 'blue' => 4];
        $TEAM_COLORS = ['red','green','yellow','blue'];
        
        $assignedIDs = [];
        foreach($this->players as $player_id => $player)
        {
            if (in_array($player_id, $assignedIDs))
            {
                continue;
            }

            $newColor = $TEAM_COLORS[count($assignedIDs)];
            $this->updatePlayerColorAndNo($player_id, $newColor, $PLAYER_COLOR_2_ORDER[$newColor]+100);

            $assignedIDs[] = $player_id;

            $newColor = $TEAM_COLORS[count($assignedIDs)];
            $ally_id = $player['ally_id'];
            $this->updatePlayerColorAndNo($ally_id, $newColor, $PLAYER_COLOR_2_ORDER[$newColor]+100);

            $assignedIDs[] = $ally_id;
        }

        //remove the extra 100 from the player_no
        $this->game->DbQuery('UPDATE player SET player_no=player_no-100;');

        //pieces also needs to be updated to reflect new colors.
        (new ttPieces($this->game))->createPieces($this->players);
    }
}