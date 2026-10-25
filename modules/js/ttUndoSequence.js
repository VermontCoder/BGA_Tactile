define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttUndoSequence", null, 
    { 

        constructor: function()
        {
        
        },

        beginUndo: function(undoPoint) 
        {   
            var undoPointText = '';

            if (undoPoint == 'start')
            {
                undoPointText = "Undo all your moves?<BR>";
            }
            else
            {
                undoPointText = "Undo all your moves from your last " + undoPoint + " forward?<BR>";
            }

            this.setClientState("client_undo", 
            {
                descriptionmyturn : _(undoPointText),
            });
            
            //logic handled in updateActionButtons
            return true;
        },

        confirmUndo: function(doUndo)
        {
            if (!doUndo) {
                this.restoreServerGameState();
                return;
            }

            this.bgaPerformAction("actUndo", { });
        }
    });
});