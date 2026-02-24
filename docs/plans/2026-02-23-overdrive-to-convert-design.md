# Design: Rename Overdrive → Convert + Cards-Only Restriction

**Date:** 2026-02-23
**Status:** Approved

---

## Overview

Two objectives:
1. Rename the "Overdrive" mechanic to "Convert" throughout the codebase (JS and PHP).
2. Restrict Convert so that only cards (not action board slots) can be used as the two selections.

---

## Objective 1: Rename Overdrive → Convert

A systematic rename across all files. No behavioral change.

### Files and changes

| File | Change |
|------|--------|
| `modules/js/ttOverdrive.js` | Rename file to `ttConvert.js`; update class `bgagame.ttOverdrive` → `bgagame.ttConvert`; rename `beginOverdrive` → `beginConvert` |
| `tactile.js` | Update `require` path; `this.ttOverdrive` → `this.ttConvert`; state names `client_overdrive` → `client_convert` and `client_selectOverdriveAction` → `client_selectConvertAction`; button ID `actionBtnOverdrive` → `actionBtnConvert` and all `actionBtnOverdrive*` → `actionBtnConvert*`; button label `'Overdrive'` → `'Convert'` |
| `modules/js/ttEventHandlers.js` | `overdriveClickProcessing` → `convertClickProcessing`; update all state name string checks |
| `modules/js/ttMoveSequence.js` | `isFromOverdrive` → `isFromConvert` |
| `modules/js/ttPushSequence.js` | `isFromOverdrive` → `isFromConvert` |
| `modules/js/ttGainSequence.js` | `isFromOverdrive` → `isFromConvert` |
| `modules/js/ttBuySequence.js` | `isFromOverdrive` → `isFromConvert` |
| `modules/js/ttResetSequence.js` | `isFromOverdrive` → `isFromConvert` |
| `modules/js/ttSwapSequence.js` | `isFromOverdrive` → `isFromConvert` |
| `modules/php/Game.php` | Update comment on line 569 |

### Dead code removal

Remove the `if (this.eventOrigin.startsWith('action_'))` block in `beginConvert`. This block handled the case where a player entered overdrive while an action board action was the current origin — no longer possible since Convert is cards-only.

---

## Objective 2: Cards-Only + Visual Disable (Option B)

During the `client_convert` state, the active player's action board is visually dimmed and clicks are blocked. Only card clicks are processed.

### CSS (`tactile.css`)

Add new rule:
```css
.actionBoard.convertDisabled {
    opacity: 0.4;
    pointer-events: none;
}
```

### `ttConvert.js` — `beginConvert`

After `clearAllPreviousHighlighting`, add `convertDisabled` to the active player's action board wrapper:
```js
$('actionBoard_' + this.getActivePlayerId()).classList.add('convertDisabled');
```

### `modules/js/ttEventHandlers.js` — `onActionBoardClick`

Extend the existing early-return guard to cover both convert states:
```js
// was: if (gg.name == 'client_selectConvertAction') { return; }
if (gg.name == 'client_selectConvertAction' || gg.name == 'client_convert') { return; }
```

### `tactile.js` — `clearAllPreviousHighlighting`

Add one line to strip `convertDisabled` from all action board wrappers when state is restored:
```js
document.querySelectorAll('.actionBoard').forEach(el => el.classList.remove('convertDisabled'));
```
This handles cleanup when the player cancels out of Convert via `restoreServerGameState`.

### `modules/js/ttEventHandlers.js` — `convertClickProcessing`

Remove the entire `if (selectionDivID.startsWith('action_'))` branch. It is now unreachable since action board clicks are blocked upstream in `onActionBoardClick`.
