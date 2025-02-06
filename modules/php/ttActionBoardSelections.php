<?php

declare(strict_types=1);

namespace Bga\Games\tactile;

class ttActionBoardSelections
{
    public array $actionBoardSelections = array();

    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function createActionBoardSelections(array $players) : void
    {
        $divPrefix = 'action_';

        foreach ($players as $player_id => $player)
        {
            foreach(ttLegalMoves::ACTIONS as $action)
            {
                //don't do push
                if($action == 'push')
                {
                    continue;
                }
                
                $actionBoardSelection = array();
                $actionBoardSelection['selection_div_id'] = $divPrefix.$player_id.'_'.$action;
                $actionBoardSelection['action'] = $action;
                $actionBoardSelection['player_id'] = $player_id;
                $actionBoardSelection['selected'] = 0;
                $this->actionBoardSelections[] = $actionBoardSelection;
            }
        }
        
        $this->serializeActionBoardSelectionsToDb();
    }

    public function serializeActionBoardSelectionsToDb() : void
    {
        foreach ($this->actionBoardSelections as $actionBoardSelection) {
            $query_values[] = vsprintf("('%s', '%s', '%s', '%d')", [
                $actionBoardSelection['selection_div_id'],
                $actionBoardSelection['action'],
                $actionBoardSelection['player_id'],
                $actionBoardSelection['selected'],
            ]);
        }

        $query = sprintf("INSERT INTO action_board_selections (selection_div_id, action, player_id, selected) VALUES %s", implode(',', $query_values));
        $this->game::DbQuery($query);
    }

    public function deserializeActionBoardSelectionsFromDb() : array
    {
        $sql = "SELECT selection_div_id, action, player_id, selected FROM action_board_selections";
        $this->actionBoardSelections = $this->game->getCollectionFromDb($sql);

        foreach($this->actionBoardSelections as $selection_div_id => $actionBoardSelection)
        {
            $this->actionBoardSelections[$selection_div_id]['selected'] = $actionBoardSelection['selected'] == "1" ? true : false;
        }

        return $this->actionBoardSelections;
    }

    public function clearPlayerSelections(int $player_id) : void
    {
        $sql = "UPDATE action_board_selections SET selected = 0 WHERE player_id = $player_id";
        $this->game::DbQuery($sql);

        //also modify in memory array
        foreach($this->actionBoardSelections as $actionBoardSelection)
        {
            if($actionBoardSelection['player_id'] == $player_id)
            {
                $actionBoardSelection['selected'] = false;
            }
        }
    }

    public function setSelected(string $selection_div_id) : void
    {
        $sql = "UPDATE action_board_selections SET selected = 1 WHERE selection_div_id = '$selection_div_id'";
        $this->game::DbQuery($sql);

        //also modify in memory array
        foreach($this->actionBoardSelections as $actionBoardSelection)
        {
            if($actionBoardSelection['selection_div_id'] == $selection_div_id)
            {
                $actionBoardSelection['selected'] = true;
                break;
            }
        }
    }

    public function getAllSelected() : array
    {
        if (empty($this->actionBoardSelections))
        {
            $this->deserializeActionBoardSelectionsFromDb();
        }

        $selected = array();

        foreach($this->actionBoardSelections as $actionBoardSelection)
        {
            if($actionBoardSelection['selected'] == true)
            {
                $selected[] = $actionBoardSelection['action'];
            }
        }

        return $selected;
    }
    
    public function getPlayerSelections(int $player_id) : array
    {
        if (empty($this->actionBoardSelections))
        {
            $this->deserializeActionBoardSelectionsFromDb();
        }

        $selected = array();

        foreach($this->actionBoardSelections as $actionBoardSelection)
        {
            if($actionBoardSelection['player_id'] == $player_id && $actionBoardSelection['selected'] == true)
            {
                $selected[] = $actionBoardSelection['action'];
            }
        }

        return $selected;
    }
}