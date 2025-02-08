<?php
declare(strict_types=1);

namespace Bga\Games\tactile;

class ttCards
{
    public array $cards = array();
    
    const CARDTYPES = ['move', 'push', 'gain'];
    const COLORS = ['red','yellow','green','blue'];
    const CARDSTATUS = ['inactive' => 0, 'active' => 1, 'exhausted'=> 2]; //index into type_arg

    public static function getCardIDFromDivID(string $divID) : int
    {
        if (str_starts_with($divID, 'card_')) return (int)substr($divID, 5);
        if (str_starts_with($divID, 'storecard_')) return (int)substr($divID, 10);

        throw new \BgaVisibleSystemException("Invalid cardID: $divID");
        return -1;
    }

    public function __construct(Game $game)
    {
        $this->game = $game;
    }

    public function createCards() : void
    {
        $cards = array();

        foreach(ttCards::CARDTYPES as $cardType)
        {
            foreach(ttCards::COLORS as $color)
            {
                for($i=0; $i <= 3; $i++)
                {
                    for($j=$i; $j <= 3; $j++)
                    {
                        $type = $color.'_'.$cardType.'_'.ttCards::COLORS[$i].'_'.ttCards::COLORS[$j];
                        $cards[] = array( 'type' => $type, 'type_arg'=> 0, 'card_location' => 'deck', 'nbr' => 1);
                    }
                }
            }
        }

        $this->game->cards->createCards( $cards, 'deck' );

        //card_id needs to correspond to the image offset to display the card.
        //The order of the cards is stored in card_location_arg.
        //We need to overwrite card_id to match the image offset.

        $this->game::DbQuery("UPDATE card SET card_id=card_location_arg+500");
        $this->game::DbQuery("UPDATE card SET card_id=card_id-501");
    }

    /**
     * @param int $card_id
     * @param string $status - 'active', 'inactive', 'exhausted'
     */
    public function setCardStatus(int $card_id, string $status) : void
    {
        $sql = sprintf("UPDATE card SET card_type_arg = %01d WHERE card_id = %01d", ttCards::CARDSTATUS[$status], $card_id);
        $this->game::DbQuery($sql);
    }

    /**  
     * @param int $player_id
     * @param string $color
     * @return int - number of cards activated
     */
    public function activateCardsByColor(int $player_id, string $color) 
    {
        $sql = sprintf("UPDATE card SET card_type_arg = %01d WHERE card_type LIKE '%s_%%' AND card_location = 'hand' AND card_location_arg = %01d", ttCards::CARDSTATUS['active'], $color, $player_id);
        $result = $this->game::DbQuery($sql);

        //return number of cards activated
        $result = $this->game::DbQuery("SELECT ROW_COUNT() AS affected_rows");
        $row = $result->fetch_assoc();
        return $row['affected_rows'];
    }

    public function deactivateAllCards(int $player_id) : void
    {
        $sql = sprintf("UPDATE card SET card_type_arg = %01d WHERE card_location = 'hand' AND card_location_arg = %01d", ttCards::CARDSTATUS['inactive'], $player_id);
        $this->game::DbQuery($sql);
    }

    public function getActiveCards(int $player_id) : array
    {
        $sql = sprintf("SELECT card_id id, card_type type, card_type_arg type_arg, card_location location, card_location_arg location_arg FROM card WHERE card_location = 'hand' AND card_location_arg = %01d AND card_type_arg = %01d", $player_id, ttCards::CARDSTATUS['active']);
        return $this->game->getCollectionFromDb($sql);
    }

    public function isCardBuyable(array $cardData, array $player) : bool
    {
        $player[$cardData['resources'][0].'_resource_qty']--;
        $player[$cardData['resources'][1].'_resource_qty']--;

        return $player[$cardData['resources'][0].'_resource_qty'] >= 0 && 
                $player[$cardData['resources'][1].'_resource_qty'] >= 0;
    }

    public function getBuyableCards(array $storeCards, array $player) : array
    {
        $buyable = array();

        foreach($storeCards as $card)
        {
            if($this->isCardBuyable($card, $player))
            { 
                $buyable[$card['id']] = $card;
            }
        }

        return $buyable;
    }
}