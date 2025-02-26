define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttOverdrive", null, 
    { 

        constructor: function()
        {
        
        },

        beginOverdrive: function() 
        {
            this.clearAllPreviousHighlighting();
            if (this.eventOrigin.startsWith('action_'))
            {
                //switching to overdrive from an action board action.
                this.ttAnimations.moveActionCube.call(this,this.eventOrigin, true);
            }
            this.eventOrigin = '';
            this.setClientState("client_overdrive", 
            {
                descriptionmyturn : _("Please select two actions."),
            });
            

            //logic handled in event handlers for action board and cards.
            return true;
        },

        beginSelectingAction: function()
        {
            //this.clearAllPreviousHighlighting();
            this.setClientState("client_selectOverdriveAction", 
            {
                descriptionmyturn : _("Please select an action."),
            });
        }
        
    });
});