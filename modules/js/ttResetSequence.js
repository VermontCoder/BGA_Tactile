define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttResetSequence", null, 
    { 

        constructor: function()
        {
        
        },

        beginReset: function() 
        {
            this.setClientState("client_reset", 
            {
                descriptionmyturn : _("This will choose new cards for the store. Confirm?"),
            });
            
            //logic handled in updateActionButtons
        },

        confirmReset: function(doReset)
        {
            if (!doReset) {
                this.restoreServerGameState();
                return;
            }

            this.bgaPerformAction("actReset", { 
                origin: this.eventOrigin
            });
        }
        
    });
});