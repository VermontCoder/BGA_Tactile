define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttDoneWithTurnSequence", null, 
    { 

        constructor: function()
        {
        
        },

        beginDoneWithTurn: function() 
        {
            this.clearAllPreviousHighlighting();
            
            this.setClientState("client_doneWithTurn", 
            {
                descriptionmyturn : _("You have actions remaining! Are you sure you want to end your turn?<BR>"),
            });
        },

        confirmDoneWithTurn: function(isDone)
        {
            if (!isDone) {
                this.restoreServerGameState();
                return;
            }

            this.bgaPerformAction("actDoneWithTurn");
        }
    });
});