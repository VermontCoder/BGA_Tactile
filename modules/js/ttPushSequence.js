define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttPushSequence", null, 
    { 

        constructor: function()
        {
        
        },

        beginMove: function()
        {
            this.setClientState("client_selectPiece_push", 
            {
                descriptionmyturn : _("${you} must select piece to move"),
            });
        },

        selectPiece: function( piece_id )
        {

        }
    }); 
});