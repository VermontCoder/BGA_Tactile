# Design: Classic Mode vs Overdrive Mode

## Goal

Split the game into two modes selectable as a pre-game lobby option:

- **Classic Mode** — no Convert action; fixed typed market (3 separate decks: MOVE, GAIN, PUSH; always 2 of each type in the store)
- **Overdrive Mode** — Convert available; randomized single-deck market (the game as it exists today)

---

## Game Option

New entry in `gameoptions.json` at ID 101:

```json
"101": {
    "name": "Game Mode",
    "values": {
        "1": { "name": "Classic" },
        "2": { "name": "Overdrive" }
    }
}
```

Default is Overdrive (value 2) so existing behavior is preserved.

PHP reads it via:
```php
public function isClassicMode(): bool {
    return $this->tableOptions->get(101) === 1;
}
```

The JS receives `isClassicMode` as a flag through `getAllDatas()`.

---

## Classic Mode — Server Side

### Deck Setup

At game setup, Classic mode sorts the full card pool into 3 type-specific deck locations instead of one `'deck'`:

- `'deck_move'`, `'deck_gain'`, `'deck_push'` — each shuffled independently
- Store seeded with 2 cards from each type deck (6 total)
- Store slot order: slots 1–2 = move, 3–4 = gain, 5–6 = push

Auto-reshuffle is configured via `autoreshuffle_custom` (not the default `autoreshuffle = true`):
```php
$this->cards->autoreshuffle_custom = [
    'deck_move'  => 'discard_move',
    'deck_gain'  => 'discard_gain',
    'deck_push'  => 'discard_push',
];
```
This means `pickCardForLocation('deck_move', ...)` automatically reshuffles `'discard_move'` into `'deck_move'` when empty — no manual reshuffle code needed.

### Buy Replacement

In Classic mode, the replacement card is drawn from the type-specific deck matching the bought card's action:
```php
$newCard = $this->cards->pickCardForLocation('deck_' . $cardData['action'], 'store', $slotArg);
```
The replacement occupies the same store slot as the bought card (preserving position).

### Reset

In Classic mode, `actReset` discards each store card into its type-specific discard pile (parsed from `card_type`), then draws 2 fresh cards from each type deck:
```php
foreach ($storeCards as $card) {
    $type = ttUtility::getCardDataFromType($card)['action'];
    $this->cards->moveCard($card['id'], 'discard_' . $type);
}
foreach (['move', 'gain', 'push'] as $type) {
    $this->cards->pickCardsForLocation(2, 'deck_' . $type, 'store');
}
```

### Auto-Reset Rule

Classic mode uses color-only check with the same threshold (>= 5):
```php
// Classic: color check only (action check dropped — max 2 per type, can never reach 5)
return max($colorCount) >= 5;
```

---

## Classic Mode — Client Side

### Convert Button

Not rendered. The `onEnteringState` handler wraps the Convert button addition in:
```js
if (!this.isClassicMode) { /* add Convert button */ }
```

### Market Layout

Same 3×2 card grid, same store size. Cards grouped by type in reading order — no labels on cards or store sections. Move cards fill slots 1–2 (top-left), gain fills slots 3–4, push fills slots 5–6.

### Deck Display

The current single deck area is replaced by 3 smaller deck piles shown side-by-side in the same total footprint. Each deck pile:
- Shows the standard card-back visual (`.deck` CSS)
- Has an action type icon overlaid (`position: absolute`) from `action_icons.png`
  - move: offset `0`
  - gain: offset `-104px`
  - push: offset `-208px` (last icon in sprite)
- Icon dimensions from existing CSS variables: `--action-icon-width: 104px`, `--action-icon-height: 128px`

Deck piles are read-only visuals — players do not interact with them directly.

---

## Overdrive Mode — No Changes

Overdrive is the game exactly as it exists today. All Classic-mode code paths are gated behind `isClassicMode()` and never execute in Overdrive mode.

---

## Files to Change

| File | Change |
|------|--------|
| `gameoptions.json` | Add option 101 (Game Mode) |
| `modules/php/Game.php` | Add `isClassicMode()`, branch in `actBuy`, `actReset`, `checkStoreReset`, `setupGame`, `getAllDatas` |
| `modules/php/ttCards.php` | Add `createClassicDecks()` for typed deck setup |
| `tactile.js` | Store `isClassicMode` flag; conditionally render Convert button; conditionally render Classic market/deck UI |
| `tactile.css` | Add styles for 3 classic deck piles + action icon overlays |
