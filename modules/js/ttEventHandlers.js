

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

            //Do not respond if not current player or this move has already been processed.
            if(!this.isCurrentPlayerActive()) { return; }
            if(this.gamedatas.gamestate.args.actionBoardSelections[selectionDivID]['selected']) { return; } 

            
            console.log('onActionBoardClick', JSON.stringify(selectionDivID));

            
            //check if this is actually an uncheck
            if ($(selectionDivID).classList.contains('selected')) {
                $(selectionDivID).classList.remove('selected');
                this.restoreServerGameState();
                return;
            }
            this.clearAllPreviousHighlighting();

            $(selectionDivID).classList.add('selected');

            //record the event origin for later use.
            this.eventOrigin = selectionDivID;
            
            selectionData = this.ttUtility.getActionBoardActionData(selectionDivID);
            switch(selectionData.action)
            {
                case 'move':
                    this.ttMoveSequence.beginMove.call(this);
                    break;
                case 'gain':
                    break;
                case 'buy':
                    break;
                case 'swap':
                    break;
                case 'reset':
                    break;
                
            }
           
            //this.clientStateArgs.selectionDivID = selectionDivID;
            // this.setClientState("client_selectPiece", {
            //                    descriptionmyturn : _("${you} must select piece to move"),
            //                });

            // this.bgaPerformAction("actActionBoardClick", {
            //     selectionDivID,
            // });
        },

        onTileClick: function( tileID ) {
            if(!this.isCurrentPlayerActive()) { return; }
            if(!$(tileID).classList.contains('legalMove')) { return; }
            console.log('onTileClick', JSON.stringify(tileID));
           
            this.ttMoveSequence.movePiece.call(this, tileID);
        },

        onPieceClick: function( piece_id ) {
            if(!this.isCurrentPlayerActive()) { return; }

            pieceData = this.ttUtility.parsePieceID(piece_id);

            //are we in the right state to be able to move a piece?
            if(this.gamedatas.gamestate.name == 'client_selectPiece' || this.gamedatas.gamestate.name == 'client_selectTile') 
            {
                //check if piece is the active player's piece
                //TO DO handle push. This is a push if this.eventOrigin starts with 'card_' AND gamedatas.gamestate.args.hands[card_id].type == contains push
                if (pieceData.player_id != this.getActivePlayerId()) { return; }
            } 
            else
            {
                return;
            }

            console.log('onPieceClick', JSON.stringify(pieceData));

            this.clearTileHighlighting();
            this.ttMoveSequence.selectPiece.call(this, piece_id); 
           
        },

        onResourceBankClick: function( resource_id ) {
            if(!this.isCurrentPlayerActive()) { return; }
            console.log('onResourceBankClick', JSON.stringify(resource_id));

            //TBD resource click handling.
        },

        onPlayerResourceBankClick: function( resource_id ) {
            if(!this.isCurrentPlayerActive()) { return; }
            console.log('onPlayerResourceBankClick', JSON.stringify(resource_id));

            //TBD player resource click handling.
        },

        onStoreCardClick: function( card_id ) {
            if(!this.isCurrentPlayerActive()) { return; }
            console.log('onStoreCardClick', JSON.stringify(card_id));

            //TBD store card click handling.
        },

        onCardClick: function( card_id )
        {
            if(!this.isCurrentPlayerActive()) { return; }
            
            //tbd - check if this card is active.
            this.ttEventHandlers.clearAllPreviousHighlighting.call(this);
            console.log( 'onCardClick', card_id );

            //record the event origin for later use.
            this.eventOrigin = card_id;

            // this.bgaPerformAction("actPlayCard", { 
            //     card_id,
            // }).then(() =>  {                
            //     // What to do after the server call if it succeeded
            //     // (most of the time, nothing, as the game will react to notifs / change of state instead)
            // });        
        },

        
    });
}); 
