

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

        onActionBoardClick: function( selectionDivID ) {

            //Do not respond if not current player or this move has already been processed.
            if(!this.isCurrentPlayerActive()) { return; }
            if(this.gamedatas.gamestate.args.actionBoardSelections[selectionDivID]['selected']) { return; } 

            //this.gamedatas.gamestate.args.variable is variable from state args - I think.
            //this.gamedatas.gamestate.name is the name of the client state.
            console.log('onActionBoardClick', JSON.stringify(selectionDivID));

            this.ttEventHandlers.clearAllPreviousHighlighting.call(this);

            //check if this is actually an uncheck
            if ($(selectionDivID).classList.contains('selected')) {
                $(selectionDivID).classList.remove('selected');
                this.restoreServerGameState();
                return;
            }

            $(selectionDivID).classList.add('selected');
            
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

        onPieceClick: function( pieceID ) {
            if(!this.isCurrentPlayerActive()) { return; }

            //are we in the right state to be able to move a piece?
            if(this.gamedatas.gamestate.name == 'client_selectPiece_move') 
            {
                //check if piece is the active player's piece
                if (!pieceID.startsWith(String(this.getActivePlayerId()))) { return; }
                this.ttEventHandlers.clearTileHighlighting.call(this);
                this.ttMoveSequence.selectPiece.call(this, pieceID); 
            }
            else if (this.gamedatas.gamestate.name == 'client_selectPiece_push')
            {
                //check if piece is NOT the active player's piece
                if (pieceID.startsWith(String(this.getActivePlayerId()))) { return; }
                this.ttEventHandlers.clearTileHighlighting.call(this);
                this.ttMoveSequence.selectPiece.call(this, pieceID);
            }
            else
            {
                return;
            }

            console.log('onPieceClick', JSON.stringify(pieceID));
           
            //TBD piece click handling.
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

            // this.bgaPerformAction("actPlayCard", { 
            //     card_id,
            // }).then(() =>  {                
            //     // What to do after the server call if it succeeded
            //     // (most of the time, nothing, as the game will react to notifs / change of state instead)
            // });        
        },

        clearTileHighlighting: function()
        {
            //remove tile highlighting
            const tiles = document.querySelectorAll('.tile');
            tiles.forEach(el => el.classList.remove('legalMove'));
        },

        clearAllPreviousHighlighting: function()
        {
            this.ttEventHandlers.clearTileHighlighting.call(this);

            //restore action board selections
            this.createActionBoardSelections(this.getActivePlayerId(),
                    this.gamedatas.gamestate.args.actionBoardSelections);
            
            //clear any other highlighting
            const allDivs = document.querySelectorAll('*');
            allDivs.forEach(el => el.classList.remove('highlighted'));
        }
    });
}); 
