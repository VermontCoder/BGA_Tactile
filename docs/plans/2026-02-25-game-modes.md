# Classic vs Overdrive Game Modes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a pre-game lobby option that splits the game into Classic Mode (no Convert, fixed typed market) and Overdrive Mode (the game as it exists today).

**Architecture:** A single `isClassicMode()` PHP helper gates all server-side divergence. A `this.isClassicMode` flag (passed via `getAllDatas`) gates all client-side divergence. Classic mode uses three typed card locations (`deck_move`, `deck_gain`, `deck_push`) instead of one `deck`; all other locations (`hand`, `store`, `discard_*`) are the same.

**Tech Stack:** PHP (BGA framework, Deck component), JavaScript (Dojo AMD modules), CSS.

---

## Task 1: Add game option to gameoptions.json

**Files:**
- Modify: `gameoptions.json`

**Step 1: Add option 101**

Open `gameoptions.json`. The file currently has one option (100 for Teams). Add option 101 after the closing brace of option 100, inside the outer `{}`:

```json
{
    "100": {
        "name": "Teams",
        ...existing content...
    },
    "101": {
        "name": "Game Mode",
        "values": {
            "1": { "name": "Classic" },
            "2": { "name": "Overdrive" }
        }
    }
}
```

Value 1 = Classic, Value 2 = Overdrive. BGA defaults to the first value (Classic) unless the host changes it.

**Step 2: Verify**

Open BGA Studio in the browser and create a new table. Confirm "Game Mode" appears as a lobby option with Classic and Overdrive choices.

**Step 3: Commit**

```bash
git add gameoptions.json
git commit -m "add Game Mode lobby option (Classic / Overdrive)"
```

---

## Task 2: Add isClassicMode() helper to Game.php + pass flag to JS

**Files:**
- Modify: `modules/php/Game.php`

**Step 1: Add isClassicMode() method**

Find the `getColorIconHTML` method (around line 642). Add the new helper just above it:

```php
public function isClassicMode(): bool
{
    return $this->tableOptions->get(101) === 1;
}
```

**Step 2: Pass flag to JS via getAllDatas**

Find `getAllDatas()` (line 844). Just before `return $result;` (line 902), add:

```php
$result['isClassicMode'] = $this->isClassicMode();
```

**Step 3: Store flag in JS setup**

Open `tactile.js`. In the `setup` function (line 97), add this as the very first line inside the function body (before `console.log`):

```js
this.isClassicMode = gamedatas.isClassicMode;
```

**Step 4: Commit**

```bash
git add modules/php/Game.php tactile.js
git commit -m "add isClassicMode() helper and pass flag to JS"
```

---

## Task 3: Add Classic deck helpers to ttCards.php

**Files:**
- Modify: `modules/php/ttCards.php`

These three methods handle the typed-deck mechanics that Classic mode needs.

**Step 1: Add reshuffleClassicTypeIfNeeded()**

At the bottom of the `ttCards` class (before the closing `}`), add:

```php
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
            $this->game->cards->moveCards($discards, 'deck_' . $type);
            $this->game->cards->shuffle('deck_' . $type);
        }
    }
}
```

**Step 2: Add pickClassicReplacement()**

```php
/**
 * Picks one replacement card of $type from its typed deck into the store at $slotArg.
 * Reshuffles the typed discard into the typed deck first if needed.
 */
public function pickClassicReplacement(string $type, int $slotArg): ?array
{
    $this->reshuffleClassicTypeIfNeeded($type);
    return $this->game->cards->pickCardForLocation('deck_' . $type, 'store', $slotArg);
}
```

**Step 3: Add createClassicDecks()**

This is called once at game setup. It moves all cards from `'deck'` into typed locations and shuffles each.

```php
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
```

**Step 4: Commit**

```bash
git add modules/php/ttCards.php
git commit -m "add Classic mode deck helpers to ttCards"
```

---

## Task 4: Update setupNewGame for Classic mode

**Files:**
- Modify: `modules/php/Game.php`

**Step 1: Replace the store seeding block in setupNewGame**

Find `setupNewGame` (around line 910). The current store seeding block (around lines 938–956) looks like:

```php
$this->cards->shuffle('deck');

// ... test code comments ...

$this->cards->pickCardsForLocation( 6, 'deck', 'store');
if ($this->checkStoreReset())
{
    $this->actReset('specialRule', true);
}
```

Replace it with:

```php
if ($this->isClassicMode())
{
    $ttCards->createClassicDecks();
    foreach (['move', 'gain', 'push'] as $type)
    {
        $this->cards->pickCardsForLocation(2, 'deck_' . $type, 'store');
    }
}
else
{
    $this->cards->shuffle('deck');
    $this->cards->pickCardsForLocation(6, 'deck', 'store');
}

if ($this->checkStoreReset())
{
    $this->actReset('specialRule', true);
}
```

Note: `$ttCards` is already declared earlier in `setupNewGame` (`$ttCards = new ttCards($this);`).

**Step 2: Verify in BGA Studio**

Start a Classic mode game. Confirm 6 store cards appear (2 move, 2 gain, 2 push). Start an Overdrive game. Confirm 6 random cards appear.

**Step 3: Commit**

```bash
git add modules/php/Game.php
git commit -m "seed Classic store from typed decks in setupNewGame"
```

---

## Task 5: Update actBuy for Classic mode

**Files:**
- Modify: `modules/php/Game.php`

**Step 1: Replace the replacement card pick in actBuy**

Find `actBuy` (line 313). The current replacement line (line 332) is:

```php
$newCard = $this->cards->pickCardForLocation('deck', 'store', $card_id);
```

Replace it with:

```php
if ($this->isClassicMode())
{
    $ttCards = new ttCards($this);
    $newCard = $ttCards->pickClassicReplacement($cardData['action'], $card_id);
}
else
{
    $newCard = $this->cards->pickCardForLocation('deck', 'store', $card_id);
}
```

`$cardData` is already computed just above this line from `$card`.

**Step 2: Verify in BGA Studio**

In Classic mode, buy a MOVE card. Confirm the replacement is also a MOVE card.

**Step 3: Commit**

```bash
git add modules/php/Game.php
git commit -m "pick typed replacement card in actBuy for Classic mode"
```

---

## Task 6: Update actReset for Classic mode

**Files:**
- Modify: `modules/php/Game.php`

**Step 1: Replace the discard + refill block in actReset**

Find `actReset` (line 454). The current discard + refill (lines 461–462) is:

```php
$this->cards->moveAllCardsInLocation('store', 'discard');
$newCards = $this->cards->pickCardsForLocation( 6, 'deck', 'store');
```

Replace it with:

```php
if ($this->isClassicMode())
{
    $storeCards = $this->cards->getCardsInLocation('store');
    foreach ($storeCards as $card)
    {
        $type = ttUtility::getCardDataFromType($card)['action'];
        $this->cards->moveCard((int)$card['id'], 'discard_' . $type);
    }
    $newCards = [];
    $ttCards = new ttCards($this);
    foreach (['move', 'gain', 'push'] as $type)
    {
        $ttCards->reshuffleClassicTypeIfNeeded($type);
        $picked = $this->cards->pickCardsForLocation(2, 'deck_' . $type, 'store');
        $newCards = array_merge($newCards, $picked);
    }
}
else
{
    $this->cards->moveAllCardsInLocation('store', 'discard');
    $newCards = $this->cards->pickCardsForLocation(6, 'deck', 'store');
}
```

**Step 2: Verify in BGA Studio**

In Classic mode, use the Reset action. Confirm the store refreshes with 2 move, 2 gain, 2 push cards.

**Step 3: Commit**

```bash
git add modules/php/Game.php
git commit -m "reset Classic store into typed discards and refill from typed decks"
```

---

## Task 7: Update checkStoreReset for Classic mode

**Files:**
- Modify: `modules/php/Game.php`

**Step 1: Update checkStoreReset**

Find `checkStoreReset` (line 597). The current return statement (line 610) is:

```php
return (max($colorCount) >= 5 || max($actionCount) >= 5);
```

Replace it with:

```php
if ($this->isClassicMode())
{
    // In Classic mode, only check color (action count can never reach 5 with 2-per-type market)
    return max($colorCount) >= 5;
}
return (max($colorCount) >= 5 || max($actionCount) >= 5);
```

**Step 2: Commit**

```bash
git add modules/php/Game.php
git commit -m "skip action count in checkStoreReset for Classic mode"
```

---

## Task 8: Hide Convert button in Classic mode

**Files:**
- Modify: `tactile.js`

**Step 1: Wrap the Convert button in a mode check**

Find line 575 in `tactile.js`:

```js
this.addActionButton('actionBtnConvert', _('Convert'), () => this.ttConvert.beginConvert.call(this), null, null, 'blue');
```

Wrap it:

```js
if (!this.isClassicMode)
{
    this.addActionButton('actionBtnConvert', _('Convert'), () => this.ttConvert.beginConvert.call(this), null, null, 'blue');
}
```

**Step 2: Verify in BGA Studio**

In Classic mode, confirm no "Convert" button appears during selectAction. In Overdrive, confirm it still appears.

**Step 3: Commit**

```bash
git add tactile.js
git commit -m "hide Convert button in Classic mode"
```

---

## Task 9: Add sortCardsClassic utility

**Files:**
- Modify: `modules/js/ttUtility.js`

**Step 1: Add the method**

In `ttUtility.js`, add `sortCardsClassic` right after the existing `sortCards` method (after line 129):

```js
sortCardsClassic(cards)
{
    const actionOrder = ['move', 'gain', 'push'];
    return cards.toSorted((a, b) =>
    {
        const actionA = a.type.split('_')[1];
        const actionB = b.type.split('_')[1];
        const orderDiff = actionOrder.indexOf(actionA) - actionOrder.indexOf(actionB);
        if (orderDiff !== 0) return orderDiff;
        return a.type.split('_')[0].localeCompare(b.type.split('_')[0]);
    });
},
```

**Step 2: Commit**

```bash
git add modules/js/ttUtility.js
git commit -m "add sortCardsClassic utility (sort by action type then color)"
```

---

## Task 10: Update createStore for Classic market UI

**Files:**
- Modify: `tactile.js`

Classic mode renders a row of **3 full-size deck piles** (same 80×120px as the existing single deck) above the 3×2 card grid. Each deck pile reuses the existing `.deck` CSS class and has an action-type icon overlaid inside it.

**Step 1: Replace createStore with a mode-branching version**

Find `createStore` (line 266). The current body is:

```js
createStore: function(store)
{
    //store
    document.getElementById('ttTopContainer').insertAdjacentHTML('beforeend', `
        <DIV id="store" class="store">
            <DIV id="deck" class="deck addSpace"></DIV>
        </DIV>
    </DIV>`);

   this.createStoreCards(store);
   this.createResourceBank();
},
```

Replace the body with:

```js
createStore: function(store)
{
    if (this.isClassicMode)
    {
        document.getElementById('ttTopContainer').insertAdjacentHTML('beforeend', `
            <DIV id="store" class="store">
                <DIV class="cardRow">
                    <DIV id="deck_move" class="deck addSpace">
                        <DIV class="classicDeckIcon move"></DIV>
                    </DIV>
                    <DIV id="deck_gain" class="deck addSpace">
                        <DIV class="classicDeckIcon gain"></DIV>
                    </DIV>
                    <DIV id="deck_push" class="deck addSpace">
                        <DIV class="classicDeckIcon push"></DIV>
                    </DIV>
                </DIV>
            </DIV>
        </DIV>`);
    }
    else
    {
        document.getElementById('ttTopContainer').insertAdjacentHTML('beforeend', `
            <DIV id="store" class="store">
                <DIV id="deck" class="deck addSpace"></DIV>
            </DIV>
        </DIV>`);
    }
    this.createStoreCards(store);
    this.createResourceBank();
},
```

Note: the three Classic deck divs reuse the existing `.deck` class — no new size CSS needed. Only the icon overlay needs new CSS (Task 13).

**Step 2: Commit**

```bash
git add tactile.js
git commit -m "render 3 full-size typed deck piles in Classic mode createStore"
```

---

## Task 11: Update createStoreCards sort for Classic mode

**Files:**
- Modify: `tactile.js`

There are two places that sort store cards for display: `createStoreCards` (initial render + state refresh) and the `onEnteringState` store refresh. Both must use `sortCardsClassic` in Classic mode.

**Step 1: Update createStoreCards sort (line 200)**

Find `createStoreCards` (line 195). Line 200 currently reads:

```js
storeData = this.ttUtility.sortCards(Object.values(storeData));
```

Replace with:

```js
storeData = this.isClassicMode
    ? this.ttUtility.sortCardsClassic(Object.values(storeData))
    : this.ttUtility.sortCards(Object.values(storeData));
```

**Step 2: Commit**

```bash
git add tactile.js
git commit -m "use sortCardsClassic in createStoreCards when in Classic mode"
```

---

## Task 12: Update animation sort for Classic mode

**Files:**
- Modify: `modules/js/ttAnimations.js`

Two animation functions sort store cards using `sortCards`. Both must use `sortCardsClassic` in Classic mode. `animateDeckToStore` also hardcodes `$('deck')` as the animation source — in Classic mode it must use the type-specific deck div.

**Step 1: Update getNewStore sort (line 201 and 208)**

Find `getNewStore` (line 188). Lines 201 and 208 both call `this.ttUtility.sortCards(...)`:

```js
// line 201
storeCards = this.ttUtility.sortCards(storeCards);
// ...
// line 208
return this.ttUtility.sortCards(newStoreCards);
```

Replace both:

```js
// line 201
storeCards = this.isClassicMode
    ? this.ttUtility.sortCardsClassic(storeCards)
    : this.ttUtility.sortCards(storeCards);
// ...
// line 208
return this.isClassicMode
    ? this.ttUtility.sortCardsClassic(newStoreCards)
    : this.ttUtility.sortCards(newStoreCards);
```

**Step 2: Update resetAnim sort (line 122)**

Find `resetAnim` (line 117). Line 122 currently reads:

```js
newCards = this.ttUtility.sortCards(Object.values(newCards));
```

Replace with:

```js
newCards = this.isClassicMode
    ? this.ttUtility.sortCardsClassic(Object.values(newCards))
    : this.ttUtility.sortCards(Object.values(newCards));
```

**Step 3: Update animateDeckToStore source div (line 108)**

Find `animateDeckToStore` (line 95). Line 108 currently reads:

```js
$('deck').insertAdjacentHTML('beforeend', newCardDiv);
```

Replace with:

```js
const sourceDeck = this.isClassicMode
    ? 'deck_' + cardsToPutInStore[i].type.split('_')[1]
    : 'deck';
$(sourceDeck).insertAdjacentHTML('beforeend', newCardDiv);
```

**Step 4: Commit**

```bash
git add modules/js/ttAnimations.js
git commit -m "use Classic sort and typed deck sources in animations for Classic mode"
```

---

## Task 13: Add CSS for Classic deck piles

**Files:**
- Modify: `tactile.css`

**Step 1: Add styles after the existing .deck rules (after line 118)**

The three Classic deck piles reuse `.deck` for size/appearance. Only the icon overlay needs new CSS.

Icons are from `action_icons.png` (move at offset 0, gain at 104px, push at 208px; each icon 104×128px native).
Displayed at 48×59px (scale ≈ 0.46). Scaled sprite width: 144px. Offsets: 0, −48px, −96px.

```css
/* Action type icon overlaid on each Classic mode deck pile.
   action_icons.png: move at 0, gain at 104px, push at 208px (104×128px each).
   Displayed at 48×59px (scale 0.46); scaled sprite: 144×59px. */
.classicDeckIcon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 59px;
    background: url(img/action_icons.png) no-repeat;
    background-size: 144px 59px;
    z-index: calc(var(--z-index-deck) + 1);
}

.classicDeckIcon.move { background-position: 0 0; }
.classicDeckIcon.gain { background-position: -48px 0; }
.classicDeckIcon.push { background-position: -96px 0; }
```

**Step 2: Verify visually in BGA Studio**

Start a Classic mode game. Confirm the deck area shows 3 mini card-back piles, each with the correct action icon overlaid (move icon on left deck, gain in middle, push on right).

**Step 3: Commit**

```bash
git add tactile.css
git commit -m "add Classic mode mini typed deck pile CSS with action icon overlays"
```

---

## Task 14: Manual verification in BGA Studio

Deploy to BGA Studio and verify the following scenarios.

**Classic Mode — lobby:**
- [ ] "Game Mode" option appears in lobby with Classic / Overdrive choices

**Classic Mode — market:**
- [ ] Store opens with exactly 2 move, 2 gain, 2 push cards
- [ ] Three mini deck piles appear with correct action icons (move / gain / push)
- [ ] Buying a move card replaces it with another move card
- [ ] Buying a gain card replaces it with another gain card
- [ ] Buying a push card replaces it with another push card
- [ ] Reset action replaces all 6 cards with 2 new of each type
- [ ] Store card order groups by type (move → gain → push) in both rows

**Classic Mode — Convert:**
- [ ] No "Convert" button appears in the action bar

**Classic Mode — auto-reset:**
- [ ] If 5 or more store cards share the same color, the store auto-resets after a buy

**Overdrive Mode — no regressions:**
- [ ] Single deck pile appears (existing card-back style)
- [ ] Convert button appears in action bar
- [ ] Buying a card replaces it with a random card from the single deck
- [ ] Reset replaces all 6 cards randomly
- [ ] Auto-reset triggers on 5+ same color OR action
