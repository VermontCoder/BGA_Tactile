define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttMoveSequence", null, 
    { 

        constructor: function()
        {
        
        },

        beginMove: function()
        {
            this.setClientState("client_selectPiece", 
            {
                descriptionmyturn : _("${you} must select piece to move"),
            });
        },
    }); 
});