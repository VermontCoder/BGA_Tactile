<?php
declare(strict_types=1);

namespace Bga\Games\tactile;

class ttCards
{
    public array $cards = array();
    
    const CARDTYPES = ['move', 'push', 'gain'];
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
        $card_id = 0;

        foreach(ttCards::CARDTYPES as $cardType)
        {
            foreach($this->game::COLORS as $color)
            {
                for($i=0; $i <= 3; $i++)
                {
                    for($j=$i; $j <= 3; $j++)
                    {
                        $type = $color.'_'.$cardType.'_'.$this->game::COLORS[$i].'_'.$this->game::COLORS[$j];
                        $query_values[] = vsprintf("('%01d','%s', '%01d','%s','%01d')", [
                        $card_id,
                        $type,
                        0,
                        'deck',
                        $card_id
                        ]);
                        $card_id++;
                    }
                }
            }
        }

        $query = sprintf("INSERT INTO card (`card_id`,`card_type`,`card_type_arg`,`card_location`,`card_location_arg`) VALUES %s", implode(',', $query_values));
        $this->game::DbQuery($query);
        $this->game->cards->shuffle( 'deck' );

        //card_id needs to correspond to the image offset to display the card.
        //The order of the cards is stored in card_location_arg.
        //We need to overwrite card_id to match the image offset.

        // $this->game::DbQuery("UPDATE card SET card_id=card_location_arg+500");
        // $this->game::DbQuery("UPDATE card SET card_id=card_id-501");

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
        //save the cards we are going to activate before we actually activate them
        $sql = sprintf("SELECT card_id id, card_type type, card_type_arg type_arg, card_location location, card_location_arg location_arg FROM card 
        WHERE card_type_arg=%01d AND card_type LIKE '%s_%%' AND card_location = 'hand' AND card_location_arg = %01d", ttCards::CARDSTATUS['inactive'], $color, $player_id);

        $affectedCards = $this->game->getCollectionFromDb($sql);

        $sql = sprintf("UPDATE card SET card_type_arg = %01d WHERE card_type_arg=%01d AND card_type LIKE '%s_%%' AND card_location = 'hand' AND card_location_arg = %01d", 
            ttCards::CARDSTATUS['active'],ttCards::CARDSTATUS['inactive'], $color, $player_id);
        
        $this->game::DbQuery($sql);
        
        //return affectedCards
        return $affectedCards;
        
        // $result = $this->game::DbQuery("SELECT ROW_COUNT() AS affected_rows");
        // $row = $result->fetch_assoc();
        //return $row['affected_rows'];
    }

    public function swapCards( int $gainCardID, int $lossCardID, int $player_id, int $ally_id) : void
    {
        $sql = sprintf("UPDATE card SET card_location_arg = %01d, card_type_arg = 0 WHERE card_id = %01d", $player_id, $gainCardID);
        $this->game::DbQuery($sql);

        $sql = sprintf("UPDATE card SET card_location_arg = %01d, card_type_arg = 0 WHERE card_id = %01d", $ally_id, $lossCardID);
        $this->game::DbQuery($sql);
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

    public function getBuyableCards(array $storeCards, array $player) : array
    {
        $buyable = array();
        $legalMoves = new ttLegalMoves($this->game);

        foreach($storeCards as $card)
        {
            $cardData = ttUtility::getCardDataFromType($card);
            if($legalMoves->isCardBuyable($cardData, $player))
            { 
                $buyable[$card['id']] = $card;
            }
        }

        return $buyable;
    }

    /**
     * If 'deck_{type}' is empty, reshuffles 'discard_{type}' into it.
     */
    public function reshuffleClassicTypeIfNeeded(string $type): void
    {
        if (empty($this->game->cards->getCardsInLocation('deck_' . $type)))
        {
            $discards = $this->game->cards->getCardsInLocation('discard_' . $type);
            if (!empty($discards))
            {
                $cardIds = array_map(fn($card) => (int)$card['id'], $discards);
                $this->game->cards->moveCards($cardIds, 'deck_' . $type);
                $this->game->cards->shuffle('deck_' . $type);
                $this->game->notify->all('deckReshuffled', clienttranslate('The <B>${type}</B> deck was reshuffled.'), [
                    'type' => $type,
                ]);
            }
        }
    }

    /**
     * Picks one replacement card of $type from its typed deck into the store at $slotArg.
     * Reshuffles the typed discard into the typed deck first if needed.
     */
    public function pickClassicReplacement(string $type, int $slotArg): ?array
    {
        $this->reshuffleClassicTypeIfNeeded($type);
        return $this->game->cards->pickCardForLocation('deck_' . $type, 'store', $slotArg);
    }

    /**
     * Splits the card pool (already in 'deck') into three typed deck locations.
     * Called once during setupNewGame in Classic mode.
     */
    public function createClassicDecks(): void
    {
        $allCards = $this->game->cards->getCardsInLocation('deck');
        foreach ($allCards as $card)
        {
            $cardData = ttUtility::getCardDataFromType($card);
            $this->game->cards->moveCard((int)$card['id'], 'deck_' . $cardData['action']);
        }
        foreach (['move', 'gain', 'push'] as $type)
        {
            $this->game->cards->shuffle('deck_' . $type);
        }
    }
}