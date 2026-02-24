# Overdrive → Convert Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rename the "Overdrive" mechanic to "Convert" and restrict Convert to card selections only (no action board slots).

**Architecture:** Pure rename pass first (no behavior change), then the behavior change (block action board during Convert + visual disable). This order means the rename is independently verifiable before adding the restriction.

**Tech Stack:** JavaScript (Dojo AMD modules), PHP, CSS. No automated test framework — all testing is manual via BGA Studio.

---

## Task 1: Rename ttOverdrive.js → ttConvert.js

**Files:**
- Rename: `modules/js/ttOverdrive.js` → `modules/js/ttConvert.js`

**Step 1: Rename the file via git**

```bash
git mv modules/js/ttOverdrive.js modules/js/ttConvert.js
```

**Step 2: Update the class declaration and function name inside `ttConvert.js`**

Change line 6:
```js
// before
return declare("bgagame.ttOverdrive", null,
// after
return declare("bgagame.ttConvert", null,
```

Change line 14:
```js
// before
beginOverdrive: function()
// after
beginConvert: function()
```

Change line 23 — the client state name:
```js
// before
this.setClientState("client_overdrive",
// after
this.setClientState("client_convert",
```

Change line 35 — the second client state name:
```js
// before
this.setClientState("client_selectOverdriveAction",
// after
this.setClientState("client_selectConvertAction",
```

**Step 3: Remove the dead action-board-origin block (lines 17–21)**

```js
// DELETE these lines entirely:
if (this.eventOrigin.startsWith('action_'))
{
    //switching to overdrive from an action board action.
    this.ttAnimations.moveActionCube.call(this,this.eventOrigin, true);
}
```

After removal, `beginConvert` should look like:
```js
beginConvert: function()
{
    this.clearAllPreviousHighlighting();
    this.eventOrigin = '';
    this.setClientState("client_convert",
    {
        descriptionmyturn : _("Please select two actions."),
    });

    //logic handled in event handlers for action board and cards.
    return true;
},
```

**Step 4: Commit**

```bash
git add modules/js/ttConvert.js
git commit -m "rename ttOverdrive.js to ttConvert.js, update class/function/state names"
```

---

## Task 2: Update tactile.js

**Files:**
- Modify: `tactile.js`

**Step 1: Update the require path (line 31)**

```js
// before
g_gamethemeurl + "modules/js/ttOverdrive.js",
// after
g_gamethemeurl + "modules/js/ttConvert.js",
```

**Step 2: Update the constructor instantiation (line 50)**

```js
// before
this.ttOverdrive = new bgagame.ttOverdrive();
// after
this.ttConvert = new bgagame.ttConvert();
```

**Step 3: Update the Overdrive button (line 578)**

```js
// before
this.addActionButton('actionBtnOverdrive', _('Overdrive'), () => this.ttOverdrive.beginOverdrive.call(this), null, null, 'blue');
// after
this.addActionButton('actionBtnConvert', _('Convert'), () => this.ttConvert.beginConvert.call(this), null, null, 'blue');
```

**Step 4: Update the state switch cases (lines 633–644)**

```js
// before
case 'client_overdrive':
    this.addActionButton('actionBtnCancel', _('Cancel'), () => this.restoreServerGameState(), null, null, 'red');
    break;

case 'client_selectOverdriveAction':
    this.addActionButton('actionBtnOverdriveMove', _('Move'), () => this.ttMoveSequence.beginMove.call(this), null, null, null);
    this.addActionButton('actionBtnOverdrivePush', _('Push'), () => this.ttPushSequence.beginPush.call(this), null, null, null);
    this.addActionButton('actionBtnOverdriveGain', _('Gain'), () => this.ttGainSequence.beginGain.call(this), null, null, null);
    this.addActionButton('actionBtnOverdriveBuy', _('Buy'), () => this.ttBuySequence.beginBuy.call(this), null, null, null);
    this.addActionButton('actionBtnOverdriveSwap', _('Swap'), () => this.ttSwapSequence.beginSwap.call(this), null, null, null);
    this.addActionButton('actionBtnOverdriveReset', _('Reset'),() => this.ttResetSequence.beginReset.call(this), null, null, null);
    this.addActionButton('actionBtnCancelOverdrive', _('Cancel'), () => this.restoreServerGameState(), null, null, 'red');
    break;

// after
case 'client_convert':
    this.addActionButton('actionBtnCancel', _('Cancel'), () => this.restoreServerGameState(), null, null, 'red');
    break;

case 'client_selectConvertAction':
    this.addActionButton('actionBtnConvertMove', _('Move'), () => this.ttMoveSequence.beginMove.call(this), null, null, null);
    this.addActionButton('actionBtnConvertPush', _('Push'), () => this.ttPushSequence.beginPush.call(this), null, null, null);
    this.addActionButton('actionBtnConvertGain', _('Gain'), () => this.ttGainSequence.beginGain.call(this), null, null, null);
    this.addActionButton('actionBtnConvertBuy', _('Buy'), () => this.ttBuySequence.beginBuy.call(this), null, null, null);
    this.addActionButton('actionBtnConvertSwap', _('Swap'), () => this.ttSwapSequence.beginSwap.call(this), null, null, null);
    this.addActionButton('actionBtnConvertReset', _('Reset'),() => this.ttResetSequence.beginReset.call(this), null, null, null);
    this.addActionButton('actionBtnCancelConvert', _('Cancel'), () => this.restoreServerGameState(), null, null, 'red');
    break;
```

**Step 5: Update the "if overdrive" comments in notif_ functions (lines 817, 829, 849, 863, 883, 908)**

Each of these six lines reads:
```js
//if overdrive, there will be multiple origins
```
Change all to:
```js
//if convert, there will be multiple origins
```

**Step 6: Commit**

```bash
git add tactile.js
git commit -m "update tactile.js: require path, instance name, state names, button IDs/labels"
```

---

## Task 3: Update ttEventHandlers.js

**Files:**
- Modify: `modules/js/ttEventHandlers.js`

**Step 1: Update the early-return guard in `onActionBoardClick` (line 40)**

```js
// before
//Do not respond if picking an action during overdrive.
if (gg.name == 'client_selectOverdriveAction') { return; }
// after
//Do not respond during convert.
if (gg.name == 'client_selectConvertAction' || gg.name == 'client_convert') { return; }
```

**Step 2: Update the `client_overdrive` check in `onActionBoardClick` (lines 42–46)**

```js
// before
if (gg.name == 'client_overdrive')
{
    this.ttEventHandlers.overdriveClickProcessing.call(this, selectionDivID);
    return;
}
// DELETE these lines entirely — action board clicks during convert are now fully blocked above
```

**Step 3: Update the early-return guard in `onCardClick` (line 166)**

```js
// before
//Do not respond if picking an action during overdrive.
if (gg.name == 'client_selectOverdriveAction') { return; }
// after
//Do not respond if picking an action during convert.
if (gg.name == 'client_selectConvertAction') { return; }
```

**Step 4: Update the `client_overdrive` check in `onCardClick` (line 196)**

```js
// before
if (gg.name == 'client_overdrive')
{
    this.ttEventHandlers.overdriveClickProcessing.call(this, cardDivID);
// after
if (gg.name == 'client_convert')
{
    this.ttEventHandlers.convertClickProcessing.call(this, cardDivID);
```

**Step 5: Rename the function and remove the action_ branch (line 240)**

```js
// before
overdriveClickProcessing: function(selectionDivID)
{
    if (selectionDivID.startsWith('action_'))
    {
        //check to see if this is a previously selected action during this overdrive.
        //Previous processing won't allow a click on an already selected action.
        if(selectionDivID == this.eventOrigin)
        {
            //this is a cancel action
            this.ttAnimations.moveActionCube.call(this,selectionDivID, true);
            this.eventOrigin ='';
            return;
        }

        if (this.eventOrigin.startsWith('action_') && this.ttUtility.getNumActionBoardActionsSelected.call(this) == 1)
        {
            //This is a click on the action board when there are two other actions selected.
            //Do not respond
            return;
        }
        //Move the cube if it is on the action board.


        //special case - if we are moving two cubes we need to specify to use the 2nd cube.
        //the moveActionCube function looks at the gamestate to determine if it should use the 2nd cube.
        //gamestate would be unaffected by the first move, so we need to specify the 2nd cube.
        if (this.eventOrigin.startsWith('action_'))
        {
            cubeDiv = $('actionCube_' + playerID+'_1');
            this.ttAnimations.animateActionCubeMove.call(this,cubeDiv,selectionDivID);
        }
        else
        {
            this.ttAnimations.moveActionCube.call(this,selectionDivID, false);
        }

    }

    if (selectionDivID.startsWith('card_'))

// after (rename function, remove entire action_ block, keep card_ block and tail)
convertClickProcessing: function(selectionDivID)
{
    if (selectionDivID.startsWith('card_'))
```

The rest of the function body (from `if (selectionDivID.startsWith('card_'))` to the end) remains unchanged, except update the final call on line 300:

```js
// before
this.ttOverdrive.beginSelectingAction.call(this);
// after
this.ttConvert.beginSelectingAction.call(this);
```

**Step 6: Commit**

```bash
git add modules/js/ttEventHandlers.js
git commit -m "update ttEventHandlers: rename convertClickProcessing, block action board during convert, remove dead action_ branch"
```

---

## Task 4: Update isFromOverdrive → isFromConvert in sequence files

**Files:**
- Modify: `modules/js/ttMoveSequence.js`
- Modify: `modules/js/ttPushSequence.js`
- Modify: `modules/js/ttGainSequence.js`
- Modify: `modules/js/ttBuySequence.js`
- Modify: `modules/js/ttResetSequence.js`
- Modify: `modules/js/ttSwapSequence.js`

In each file, rename the local variable `isFromOverdrive` to `isFromConvert`. Each file has exactly one declaration and one or two uses of this variable. The value (`this.eventOrigin.includes(',')`) does not change.

Example (same pattern in all six files):
```js
// before
const isFromOverdrive = this.eventOrigin.includes(',');
if (!isFromOverdrive) this.clearAllPreviousHighlighting();
// after
const isFromConvert = this.eventOrigin.includes(',');
if (!isFromConvert) this.clearAllPreviousHighlighting();
```

`ttGainSequence.js` has a second reference to check:
```js
// before
if (!isFromOverdrive && this.eventOrigin.startsWith('card_'))
// after
if (!isFromConvert && this.eventOrigin.startsWith('card_'))
```

**Step 1: Update all six files** (the rename is mechanical — find `isFromOverdrive`, replace with `isFromConvert`).

**Step 2: Commit**

```bash
git add modules/js/ttMoveSequence.js modules/js/ttPushSequence.js modules/js/ttGainSequence.js modules/js/ttBuySequence.js modules/js/ttResetSequence.js modules/js/ttSwapSequence.js
git commit -m "rename isFromOverdrive to isFromConvert in all sequence files"
```

---

## Task 5: Update PHP comment

**Files:**
- Modify: `modules/php/Game.php`

**Step 1: Update line 569**

```php
// before
//if this was from overdrive, we need to check for multiple origins
// after
//if this was from convert, we need to check for multiple origins
```

**Step 2: Commit**

```bash
git add modules/php/Game.php
git commit -m "update overdrive comment to convert in Game.php"
```

---

## Task 6: Add visual disable for action board during Convert

**Files:**
- Modify: `tactile.css`
- Modify: `modules/js/ttConvert.js`
- Modify: `tactile.js`

**Step 1: Add CSS class to `tactile.css`**

Add after the `.actionBoardSelectionTarget.selected` block (after line 601):

```css
.actionBoard.convertDisabled {
    opacity: 0.4;
    pointer-events: none;
}
```

**Step 2: Apply `convertDisabled` in `beginConvert` (`modules/js/ttConvert.js`)**

After the `this.eventOrigin = '';` line, add:

```js
$('actionBoard_' + this.getActivePlayerId()).classList.add('convertDisabled');
```

Full `beginConvert` after this change:
```js
beginConvert: function()
{
    this.clearAllPreviousHighlighting();
    this.eventOrigin = '';
    $('actionBoard_' + this.getActivePlayerId()).classList.add('convertDisabled');
    this.setClientState("client_convert",
    {
        descriptionmyturn : _("Please select two actions."),
    });

    //logic handled in event handlers for cards.
    return true;
},
```

**Step 3: Strip `convertDisabled` in `clearAllPreviousHighlighting` (`tactile.js`)**

In `clearAllPreviousHighlighting` (around line 712), add one line after the `allDivs.forEach` line that clears `highlighted`:

```js
document.querySelectorAll('.actionBoard').forEach(el => el.classList.remove('convertDisabled'));
```

Full function after change:
```js
clearAllPreviousHighlighting: function()
{
    this.clearTileHighlighting();

    //restore action board selections
    this.createActionBoardSelections(this.getActivePlayerId(),
            this.gamedatas.gamestate.args.actionBoardSelections);

    //clear any other highlighting
    const allDivs = document.querySelectorAll('*');
    allDivs.forEach(el => el.classList.remove('highlighted'));
    document.querySelectorAll('.actionBoard').forEach(el => el.classList.remove('convertDisabled'));
},
```

**Step 4: Commit**

```bash
git add tactile.css modules/js/ttConvert.js tactile.js
git commit -m "add convertDisabled CSS and apply/clear it during convert state"
```

---

## Task 7: Manual verification in BGA Studio

Deploy to BGA Studio and verify the following scenarios:

**Rename checks:**
- [ ] "Convert" button appears in the action bar (not "Overdrive")
- [ ] Clicking Convert enters the convert selection state with prompt "Please select two actions."
- [ ] After selecting two cards, the action picker shows (Move, Push, Gain, Buy, Swap, Reset, Cancel)
- [ ] Completing a Convert action works end-to-end (two card exhaustions show in the log)
- [ ] Cancel during Convert returns to normal selectAction state

**Cards-only checks:**
- [ ] During Convert selection, the active player's action board is visually dimmed (40% opacity)
- [ ] Clicking on action board slots during Convert does nothing
- [ ] Cards in hand are still clickable and selectable during Convert
- [ ] Canceling Convert (via Cancel button) restores the action board to full opacity
- [ ] After a Convert completes, the action board is at full opacity on the next turn

**Regression checks:**
- [ ] Normal (non-Convert) action board clicks still work
- [ ] Normal card-triggered actions still work
- [ ] Undo still works after a Convert action
