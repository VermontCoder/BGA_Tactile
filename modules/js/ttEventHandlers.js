

define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttEventHandlers", null, 
    { 

        constructor: function()
        {
           
        },

        //In all click handlers, "this" refers to the game object 
        // due to use of the call method of javascript!

        //this.gamedatas.gamestate.args.variable is variable from state args - I think.
        //this.gamedatas.gamestate.name is the name of the client state.

        onActionBoardClick: function( selectionDivID ) 
        {
            const gg = this.gamedatas.gamestate;
            const selectionData = this.ttUtility.getActionBoardActionData(selectionDivID);

            //Do not respond if not current player 
            if(!this.isCurrentPlayerActive()) { return; }
            
            //Do not respond if this action has already been selected.
            if(gg.args.actionBoardSelections[selectionDivID].selected) { return; }

            //Do not respond if this is not the active player's action board.
            if(selectionData['player_id'] != this.getActivePlayerId()) { return; }

            //Do not respond if two actions have already been selected.
            if (this.ttUtility.getNumActionBoardActionsSelected.call(this) >= 2) { return; }

            //Do not respond if picking an action during overdrive.
            if (gg.name == 'client_selectOverdriveAction') { return; }

            if (gg.name == 'client_overdrive')
            { 
                this.ttEventHandlers.overdriveClickProcessing.call(this, selectionDivID);
                return;
            }

            console.log('onActionBoardClick', JSON.stringify(selectionDivID));

            //save a copy of the origin if the sequence fails.
            const oldEventOrigin = this.eventOrigin;
            this.eventOrigin = selectionDivID;

            //check if this is actually an uncheck
            //The selectionDiv will contain the cube div if it is selected
            const isCancel = document.querySelector('#'+selectionDivID +' > .actionCube') != null;
            if (isCancel) 
            { 
                this.ttEventHandlers.cancelActionBoardAction.call(this); 
                return; 
            }
            
            //use call to keep the "this" context.
            //returns true if the sequence has successfuly begun.
            if( this.ttEventHandlers.beginSequence.call(this,selectionData.action))
            {
                this.ttAnimations.moveActionCube.call(this,selectionDivID, false);
            }
            else
            {
                this.eventOrigin = oldEventOrigin;
            }
        },

        onTileClick: function( tileID ) {
            if(!this.isCurrentPlayerActive()) { return; }
            if(!$(tileID).classList.contains('legalMove')) { return; }
            console.log('onTileClick', JSON.stringify(tileID));
           
            if (this.gamedatas.gamestate.name == 'client_selectTileMove')
            {
                this.ttMoveSequence.movePiece.call(this, tileID);
            }
            else if (this.gamedatas.gamestate.name == 'client_selectTilePush')
            {
                this.ttPushSequence.pushPiece.call(this, tileID);
            }
            else if (this.gamedatas.gamestate.name == 'chooseStartTile')
            {
                this.bgaPerformAction("actChooseStartTile", { 
                    tileID: tileID
                });
            }
        },

        onPieceClick: function( piece_id ) {
            if(!this.isCurrentPlayerActive()) { return; }

            const gg = this.gamedatas.gamestate;
            const isPush = gg.name.includes('Push');
            const pieceData = this.ttUtility.parsePieceID(piece_id);
            const isPiecePlayersPiece = pieceData.player_id == this.getActivePlayerId();

            //check if piece is selectable
            const isCorrectState = gg.name.startsWith('client_selectPiece') || gg.name.startsWith('client_selectTile');
            if (!isCorrectState) { return; }
            
             //you can only push other player's pieces or move your own pieces.
            if (isPush == isPiecePlayersPiece) { return; }
                
            /* EXCEPTIONAL SITUATION: if the piece is in a home/goal tile this may actually be a click to move the other piece *into* the home/goal tile.
            In this case, the tile parent div of the piece will have the "legalMove" class. If this happens, we ignore the click and let the tile click
            handler do the work to move the other piece on top of this one. */

            if($(piece_id).parentNode.classList.contains('legalMove')) { return; }

            console.log('onPieceClick', JSON.stringify(pieceData));

            if (isPush)
            {
                this.ttPushSequence.selectPiece.call(this, piece_id);
            }
            else
            {
                this.ttMoveSequence.selectPiece.call(this, piece_id);
            }
            
        },

        onResourceBankClick: function( resource_id ) {
            if(!this.isCurrentPlayerActive()) { return; }
            if(!$(resource_id).classList.contains('highlighted')) { return; }

            console.log('onResourceBankClick', JSON.stringify(resource_id));
            if (this.gamedatas.gamestate.name == 'client_selectResource')
            {
                this.ttGainSequence.gainResource.call(this, resource_id);
            }

            if (this.gamedatas.gamestate.name == 'client_swapSelectGain' ||
                this.gamedatas.gamestate.name == 'client_swapSelectLoss')
            {
                this.ttSwapSequence.selectGain.call(this, resource_id);
            }
        },

        onStoreCardClick: function( cardDivID ) {
            if(!this.isCurrentPlayerActive()) { return; }
            console.log('onStoreCardClick', cardDivID);

            const cardID = this.ttUtility.getCardIDFromDivID(cardDivID);

            if($(cardDivID).classList.contains('highlighted'))
            {
                this.ttBuySequence.buyCard.call(this, cardID);
            }
        },

        onCardClick: function( cardDivID )
        {
            const gg = this.gamedatas.gamestate;

            if(!this.isCurrentPlayerActive()) { return; }

            //Do not respond if picking an action during overdrive.
            if (gg.name == 'client_selectOverdriveAction') { return; }

            const cardID = this.ttUtility.getCardIDFromDivID(cardDivID);

            //raw data from db
            const cardData = this.gamedatas.gamestate.args.hands[cardID];
            const cardTypeData = this.ttUtility.getCardDataFromType(cardData);

            //If this is a 4 player game, this might be designating a swap card.
            //card from ally hand.
            if (gg.name == 'client_swapSelectGain' && $(cardDivID).classList.contains('highlighted'))
            {
                this.ttSwapSequence.selectGainCard.call(this, cardDivID);
                return;
            }

            if (gg.name == 'client_swapSelectLossCard' && $(cardDivID).classList.contains('highlighted'))
            {
                this.ttSwapSequence.selectSwapLossCard.call(this, cardDivID);
                return;
            }
                 
                

            //do not respond if this card is not in the active player's hand.
            if (cardData.location_arg != this.getActivePlayerId()) { return; }
            
            if ($(cardDivID).classList.contains('active'))
            {
                console.log( 'onCardClick', cardDivID);
                if (gg.name == 'client_overdrive')
                { 
                    this.ttEventHandlers.overdriveClickProcessing.call(this, cardDivID);
                    return;
                }

                //record the event origin for later use.
                const oldEventOrigin = this.eventOrigin;
                this.eventOrigin = cardDivID;

                //use call to keep the "this" context.
                //if the player cannot do the action, this will return false, and the card will not be highlighted and the sequence not started.
                if(this.ttEventHandlers.beginSequence.call(this,cardTypeData.action))
                {
                    //do selection
                    if(oldEventOrigin.startsWith('action_'))
                    {
                        //remove the action cube from the action board.
                        this.ttAnimations.moveActionCube.call(this,oldEventOrigin, true);
                    }
                }
                else
                {
                    this.eventOrigin = oldEventOrigin;
                }
            }

            // this.bgaPerformAction("actPlayCard", { 
            //     card_id,
            // }).then(() =>  {                
            //     // What to do after the server call if it succeeded
            //     // (most of the time, nothing, as the game will react to notifs / change of state instead)
            // });        
        },

        onAllySelection: function( allyID )
        {
            console.log('onAllySelection', allyID);

            this.bgaPerformAction("actAllySelection", { 
                ally_id: allyID,
            });
        },

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
            {
                if ($(selectionDivID).classList.contains('highlighted'))
                {
                    //this is a cancel.
                    $(selectionDivID).classList.remove('highlighted');
                    this.eventOrigin = '';
                    return;
                }
               
                $(selectionDivID).classList.add('highlighted');
            }

            if (this.eventOrigin.length == 0)
            {
                this.eventOrigin = selectionDivID;
            }
            else
            {
                this.eventOrigin += ','+selectionDivID;

                //if two actions have been selected, move into selecting the action to do now.
                this.ttOverdrive.beginSelectingAction.call(this);
            }

        },

        beginSequence: function(action)
        {
            switch(action)
            {
                case 'move':
                    return this.ttMoveSequence.beginMove.call(this);
                case 'push':
                    return this.ttPushSequence.beginPush.call(this);
                case 'gain':
                    return this.ttGainSequence.beginGain.call(this);
                case 'buy':
                    return this.ttBuySequence.beginBuy.call(this);
                case 'swap':
                    return this.ttSwapSequence.beginSwap.call(this);
                case 'reset':
                    return this.ttResetSequence.beginReset.call(this);
            }
        },

        highlightResourceBanks: function(resourceColors)
        {
            for(i=0; i< resourceColors.length; i++)
            {
                const resourceBankDiv = resourceColors[i]+'Bank';
                $(resourceBankDiv).classList.add('highlighted');
            }
        },

        highlightPlayerCards: function(playerID, hands)
        {
            const playerHand = this.ttUtility.getPlayerHand(playerID, hands);
            Object.values(playerHand).forEach((card) => {
                const cardDiv = 'card_'+card.id;
                $(cardDiv).classList.add('highlighted');
            });
        },

        cancelActionBoardAction: function()
        {
            this.ttAnimations.moveActionCube.call(this,this.eventOrigin, true);
            setTimeout(() => this.restoreServerGameState(),this.ttAnimations.animationDuration);
            this.eventOrigin = null;
        }
    });
}); 
