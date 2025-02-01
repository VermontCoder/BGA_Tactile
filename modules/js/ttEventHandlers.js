

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
            console.log('onActionBoardClick', JSON.stringify(selectionDivID));
            //show selection
            //document.getElementById(action_board_action_id).classList.toggle('red');

            this.clientStateArgs.selectionDivID = selectionDivID;
            // this.setClientState("client_playerPicksMove", {
            //                    descriptionmyturn : _("${you} must select piece to move"),
            //                });

            this.bgaPerformAction("actActionBoardClick", {
                selectionDivID,
            });
        },

        onCardClick: function( card_id, game )
        {
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
