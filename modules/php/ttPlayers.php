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

        //$this->game->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
        //$this->game->reloadPlayersBasicInfos();

        //The reattributing of colors causes the color names to misalign with the colors
        //This code corrects the color names

        //get the new players table
        // $players = $this->deserializePlayersFromDb();
        
        // foreach ($players as $player_id => $player) {
        //     $this->game->DbQuery(
        //         sprintf(
        //             "UPDATE player SET color_name = '%s' WHERE player_id = %s",
        //             self::RGB2NAME[$player['player_color']],
        //             $player_id
        //         )
        //     );
        // }

        //reload the players table
        $this->players = $this->deserializePlayersFromDb();

    }

    //Four player player table is created differently because these are teams.
    public function createPlayers4P($players) : void
    {
        $colorTeamOrder = ['red' => 'green', 'green'=>'red', 'yellow'=> 'blue','blue'=>'yellow'];

        // Retrieve inital player order ([0=>playerId1, 1=>playerId2, ...])
		$playerInitialOrder = [];
        $allyAssignments = [];
		foreach ($players as $playerId => $player) {
			$playerInitialOrder[$player['player_table_order']] = $playerId;
            $allyAssignments[$playerId] = $playerId; //initially set ally to self
		}
		ksort($playerInitialOrder);
		$playerInitialOrder = array_flip(array_values($playerInitialOrder));


        //assign allies
        $hostID = $playerInitialOrder[0];
        $hostAlly = null; //initialize host ally
       
        $gameOptions = $this->getTableOptions();
        $allyOption = (int) $gameOptions['100'];
        
        if ($allyOption == 1)
        {
            //set host ally randomly
            $hostAlly = array_rand($allyAssignments); //choose random ally from remaining players
        }
        else
        {
           //ally is set by user choice
           $hostAlly = $playerInitialOrder[$allyOption-1]; //set host ally to the player specified by player_table_order
        }
        
        unset($allyAssignments[$hostID]); //remove host from ally assignments
        $players[$hostID]['ally_id'] = $hostAlly;

        $players[$hostAlly]['ally_id'] = $hostID; //set the ally's ally to host
        unset($allyAssignments[$hostAlly]); //remove the ally from future assignments

        $otherTeamP1 = array_rand($allyAssignments); //choose random player from remaining players
        unset($allyAssignments[$otherTeamP1]); //remove the player from future assignments

        //actually should be only one player left.
        $otherTeamP2 = array_rand($allyAssignments); //choose random player from remaining players
        $players[$otherTeamP1]['ally_id'] = $otherTeamP2;
        $players[$otherTeamP2]['ally_id'] = $otherTeamP1; //set other team player's ally to the other player


        //Choose random color for game host, and assign colors on that basis
        $hostColor = $colorTeamOrder[array_rand($colorTeamOrder)];
        $hostAllyColor = $colorTeamOrder[$hostColor]; //get the color for the host's ally

        $players[$hostID]['player_color'] = self::NAME2RGB[$hostColor];
        $players[$hostID]['color_name'] = $hostColor;
        $players[$hostAlly]['player_color'] = self::NAME2RGB[$hostAllyColor];
        $players[$hostAlly]['color_name'] = $hostAllyColor;

        unset($colorTeamOrder[$hostColor]); //remove the host color from the colorTeamOrder array
        unset($colorTeamOrder[$hostAllyColor]); //remove the host ally color from the colorTeamOrder array

        $otherTeamColorP1 = array_rand($colorTeamOrder); //choose random color for the other team
        unset($colorTeamOrder[$otherTeamColorP1]); //remove the color from the colorTeamOrder array
        $otherTeamColorP2 = array_rand($colorTeamOrder); //choose remaining color for the other team member

        $players[$otherTeamP1]['player_color'] = self::NAME2RGB[$otherTeamColorP1];
        $players[$otherTeamP1]['color_name'] = $otherTeamColorP1;
        $players[$otherTeamP2]['player_color'] = self::NAME2RGB[$otherTeamColorP2];
        $players[$otherTeamP2]['color_name'] = $otherTeamColorP2;
        
        //establish play order for the players
        $hostPlayerNo = random_int(1,4); //set host player_no to random value between 1 and 4
        $hostAllyPlayerNo = ($hostPlayerNo + 2) % 4;
        $otherTeamP1PlayerNo = ($hostPlayerNo + 1) % 4;
        $otherTeamP2PlayerNo = ($hostPlayerNo + 3) % 4;

        $players[$hostID]['player_no'] = $hostPlayerNo;
        $players[$hostAlly]['player_no'] = $hostAllyPlayerNo;
        $players[$otherTeamP1]['player_no'] = $otherTeamP1PlayerNo;
        $players[$otherTeamP2]['player_no'] = $otherTeamP2PlayerNo;
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

    public function assignAllies(int $firstPlayerTeamIdx) : void
    {
        $otherTeamIdxs = [1,2,3];
        $otherTeamIdxs = array_diff($otherTeamIdxs, [$firstPlayerTeamIdx]);
        $otherTeamIdxs = array_values($otherTeamIdxs); //re-index the array to avoid gaps

        if (empty($this->players))
        {
            $this->deserializePlayersFromDb();
        }

        $playersWithIdx = [];
        foreach($this->players as $player_id => $player)
        {
            $playersWithIdx[] = $player;
        }

        //assign allies based on the first player team index
        $this->setAlly($playersWithIdx[0]['player_id'], $playersWithIdx[$firstPlayerTeamIdx]['player_id']);
        $this->setAlly($playersWithIdx[$firstPlayerTeamIdx]['player_id'], $playersWithIdx[0]['player_id']);

        $this->setAlly($playersWithIdx[$otherTeamIdxs[0]]['player_id'], $playersWithIdx[$otherTeamIdxs[1]]['player_id']);
        $this->setAlly($playersWithIdx[$otherTeamIdxs[1]]['player_id'], $playersWithIdx[$otherTeamIdxs[0]]['player_id']);
    }

    public function randomizeAllies() : void
    {
        if (empty($this->players))
        {
            $this->deserializePlayersFromDb();
        }
        
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

        $this->deserializePlayersFromDb(); //reload the players table to reflect the new player_no and colors
    }
}