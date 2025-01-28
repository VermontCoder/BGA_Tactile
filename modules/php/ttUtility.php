<?php

declare(strict_types=1);

namespace Bga\Games\tactile;

require_once("ttDebug.php");

class ttUtility
{

    public static function xy2ID(int $x, int $y): string
    {
        return strval($x) . '_' . strval($y);
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
}