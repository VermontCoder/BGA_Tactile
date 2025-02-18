

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

        onActionBoardClick: function( selectionDivID ) {

            const gg = this.gamedatas.gamestate;

            const selectionData = this.ttUtility.getActionBoardActionData(selectionDivID);

            //Do not respond if not current player 
            if(!this.isCurrentPlayerActive()) { return; }
            
            //Do not respond if this action has already been selected.
            if(gg.args.actionBoardSelections[selectionDivID]['selected']) { return; }

            //Do not respond if this is not the active player's action board.
            if(selectionData['player_id'] != this.getActivePlayerId()) { return; }

            //Do not respond if two actions have already been selected.
            const activePlayerBoardVals = this.ttUtility.pickByNestedProperty(gg.args.actionBoardSelections, 'player_id', this.getActivePlayerId());
            const selections = this.ttUtility.pickByNestedProperty(activePlayerBoardVals, 'selected', true);
            if (Object.keys(selections).length >= 2) { return; }

            console.log('onActionBoardClick', JSON.stringify(selectionDivID));

            //check if this is actually an uncheck
            //The selectionDiv will contain the cube div if it is selected
            if ($(selectionDivID).hasChildNodes())
                {
                    this.ttAnimations.moveActionCube.call(this,selectionDivID, true);
                    setTimeout(()=>this.restoreServerGameState,1000);
                    return;
                }
            
            //use call to keep the "this" context.
            //returns true if the sequence can begun.
            if( this.ttEventHandlers.beginSequence.call(this,selectionData.action))
            {
                //record the event origin for later use.
                this.eventOrigin = selectionDivID;
                this.ttAnimations.moveActionCube.call(this,selectionDivID, false);
            }
           
        },

        onTileClick: function( tileID ) {
            if(!this.isCurrentPlayerActive()) { return; }
            if(!$(tileID).classList.contains('legalMove')) { return; }
            console.log('onTileClick', JSON.stringify(tileID));
           
            this.ttMoveSequence.movePiece.call(this, tileID);
        },

        onPieceClick: function( piece_id ) {
            if(!this.isCurrentPlayerActive()) { return; }

            const gg = this.gamedatas.gamestate;

            const pieceData = this.ttUtility.parsePieceID(piece_id);

            //check if piece is selectable
            const isCorrectState = gg.name == 'client_selectPiece' || gg.name == 'client_selectTile';
            const isOfCardOrigin = this.eventOrigin.startsWith('card_');
            const isPiecePlayersPiece = pieceData.player_id == this.getActivePlayerId();

            if (!isCorrectState) { return; }
            if (isOfCardOrigin)
            {
                //pull the card's data for the action
                const cardData = this.ttUtility.getCardDataFromDivID(this.eventOrigin, gg.args.hands);
                if (cardData.action == 'push')
                {
                    //you can only push other player's pieces
                    if (isPiecePlayersPiece) { return; }
                }
            }
            else
            {
                if (!isPiecePlayersPiece) { return; }
            }

            /* EXCEPTIONAL SITUATION: if the piece is in a home/goal tile this may actually be a click to move the other piece *into* the home/goal tile.
            In this case, the tile parent div of the piece will have the "legalMove" class. If this happens, we ignore the click and let the tile click
            handler do the work to move the other piece on top of this one. */

            if($(piece_id).parentNode.classList.contains('legalMove')) { return; }

            console.log('onPieceClick', JSON.stringify(pieceData));

            this.ttMoveSequence.selectPiece.call(this, piece_id);
            
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
                this.gamedatas.gamestate.name == 'client_swapSelectLose')
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
            if(!this.isCurrentPlayerActive()) { return; }

            const cardID = this.ttUtility.getCardIDFromDivID(cardDivID);

            //raw data from db
            const cardData = this.gamedatas.gamestate.args.hands[cardID];
            const cardTypeData = this.ttUtility.getCardDataFromType(cardData);

            //do not respond if this card is not in the active player's hand.
            if (cardData.location_arg != this.getActivePlayerId()) { return; }
            
            if ($(cardDivID).classList.contains('active'))
            {
                //do selection
                this.clearAllPreviousHighlighting();
                $(cardDivID).classList.add('highlighted');

                console.log( 'onCardClick', cardDivID);

                //record the event origin for later use.
                this.eventOrigin = cardDivID;

                //use call to keep the "this" context.
                this.ttEventHandlers.beginSequence.call(this,cardTypeData.action);
            }

            // this.bgaPerformAction("actPlayCard", { 
            //     card_id,
            // }).then(() =>  {                
            //     // What to do after the server call if it succeeded
            //     // (most of the time, nothing, as the game will react to notifs / change of state instead)
            // });        
        },

        beginSequence: function(action)
        {
            switch(action)
            {
                case 'move':
                case 'push':
                    return this.ttMoveSequence.beginMove.call(this, action);
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
        }
    });
}); 
