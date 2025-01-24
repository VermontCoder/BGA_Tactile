<?php

declare(strict_types=1);

namespace Bga\Games\tactiledf;

require_once("ttDebug.php");

class ttPlayers
{
    public $players = array();
    public static rgb2name = array(
        'ff0000' => 'red',
        'ffff00' => 'yellow',
        '00ff00' => 'green',
        '0000ff' => 'blue',
    );

    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function createPlayers($players)
    {
        $gameinfos = $this->game->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        foreach ($players as $player_id => $player) {
            $curColor = array_shift($default_colors);
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s', '%s',%01d,%01d,%01d,%01d)", [
                $player_id,
                $curColor,
                ttPlayers::rgb2name[$curColor],
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
    }

    public function deserializePlayersFromDb()
    {
        $sql = "SELECT player_id, player_color, color_name, player_canal, player_name, player_avatar, red_resource_qty,
        blue_resource_qty, green_resource_qty, yellow_resource_qty FROM player";
        $players = $this->game->getCollectionFromDb($sql);
        (new ttDebug($this->game))->showVariable('players', $players);
        foreach ($players as $player_id => $player) {
            $this->players[$player_id] = $player;
        }

        return $this->players;
    }
}