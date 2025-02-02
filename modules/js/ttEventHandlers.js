

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
            if(!this.isCurrentPlayerActive()) { return; }

            //this.gamedatas.gamestate.args.variable is variable from state args - I think.
            console.log('onActionBoardClick', JSON.stringify(selectionDivID));
           
            this.clientStateArgs.selectionDivID = selectionDivID;
            // this.setClientState("client_selectPiece", {
            //                    descriptionmyturn : _("${you} must select piece to move"),
            //                });

            this.bgaPerformAction("actActionBoardClick", {
                selectionDivID,
            });
        },

        onTileClick: function( tileID ) {
            if(!this.isCurrentPlayerActive()) { return; }
            console.log('onTileClick', JSON.stringify(tileID));
           
            //TBD tile click handling.
        },

        onPieceClick: function( pieceID ) {
            if(!this.isCurrentPlayerActive()) { return; }
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
            console.log( 'onCardClick', card_id );

            // this.bgaPerformAction("actPlayCard", { 
            //     card_id,
            // }).then(() =>  {                
            //     // What to do after the server call if it succeeded
            //     // (most of the time, nothing, as the game will react to notifs / change of state instead)
            // });        
        }
    });
}); 
