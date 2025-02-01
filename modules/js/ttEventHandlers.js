

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

        onActionBoardClick: function( action_board_action_id ) {
            console.log('onActioBoardClick', JSON.stringify(action_board_action_id));
            //show selection
            //document.getElementById(action_board_action_id).classList.toggle('red');

            this.clientStateArgs.action_board_selected_id = action_board_action_id;
            this.setClientState("client_playerPicksMove", {
                               descriptionmyturn : _("${you} must select piece to move"),
                           });

            this.bgaPerformAction("actActionBoardClick", {
                action_board_action_id,
            }).then(() => {
                // What to do after the server call if it succeeded
                // (most of the time, nothing, as the game will react to notifs / change of state instead)
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
