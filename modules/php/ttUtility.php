<?php

declare(strict_types=1);

namespace Bga\Games\tactile;

class ttUtility
{

    public static function xy2ID(int $x, int $y): string
    {
        return strval($x) . '_' . strval($y);
    }

    public static function ID2xy(string $ID): array
    {
        $loc = explode('_', $ID);
        return ['x' => intval($loc[0]), 'y' => intval($loc[1])];
    }

    public static function getCardData(array $card) : array
    {
        $cardData = explode('_',$card['type']);

        return [
            'color' => $cardData[0],
            'action' => $cardData[1],
            'resources' => [$cardData[2], $cardData[3]]
        ];
    }

    public static function parseActionCardSelectionID(string $actionCardSelectionID) : array
    {
        $actionCardSelectionData = explode('_', $actionCardSelectionID);

        return [
            'player_id' => $actionCardSelectionData[1],
            'action' => $actionCardSelectionData[2]
        ];
    }

    public static function getAdjacentSpacesIDs(string $curSpaceID) : array
    {
        $curSpaceXY = ttUtility::ID2xy($curSpaceID);
        $x = $curSpaceXY['x'];
        $y = $curSpaceXY['y'];

        $adjacentSpaces = [];

        if ($x >1) $adjacentSpaces[] = ttUtility::xy2ID($x-1, $y);
        if ($x < ttBoard::BOARD_WIDTH-1) $adjacentSpaces[] = ttUtility::xy2ID($x+1, $y);
        if ($y >1) $adjacentSpaces[] = ttUtility::xy2ID($x, $y-1);
        if ($y < ttBoard::BOARD_HEIGHT-1) $adjacentSpaces[] = ttUtility::xy2ID($x, $y+1);

        return $adjacentSpaces;
    }
}