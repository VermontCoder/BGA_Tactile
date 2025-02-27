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
            const isFromOverdrive = this.eventOrigin.includes(',');
            if (!isFromOverdrive) this.clearAllPreviousHighlighting();
            
            this.setClientState("client_reset", 
            {
                descriptionmyturn : _("This will choose new cards for the store. Confirm?<BR>"),
            });
            
            //logic handled in updateActionButtons
            return true;
        },

        confirmReset: function(doReset)
        {
            if (!doReset) {
                this.ttEventHandlers.cancelActionBoardAction.call(this);
                return;
            }

            this.bgaPerformAction("actReset", { 
                origin: this.eventOrigin
            });
        }
        
    });
});