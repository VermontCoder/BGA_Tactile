<?php

declare(strict_types=1);

namespace Bga\Games\tactiledf;

require_once("ttDebug.php");

class ttPlayers
{
    public array $players = array();
    const RGB2NAME =
    [   'ff0000' => 'red',
        'ffff00' => 'yellow',
        '00ff00' => 'green',
        '0000ff' => 'blue'];

    public function __construct(Game $game)
    {
        //$this->$players = array();
        $this->game = $game;
    }

    public function createPlayers($players)
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

    public function deserializePlayersFromDb()
    {
        $sql = "SELECT player_id, player_color, color_name, player_canal, player_name, player_avatar, red_resource_qty,
        blue_resource_qty, green_resource_qty, yellow_resource_qty FROM player";
        $this->players = $this->game->getCollectionFromDb($sql);
        //(new ttDebug($this->game))->showVariable('players', $this->$players);

        return $this->players;
    }
}