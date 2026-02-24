define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttConvert", null, 
    { 

        constructor: function()
        {
        
        },

        beginConvert: function() 
        {
            this.clearAllPreviousHighlighting();
            this.eventOrigin = '';
            $('actionBoard_' + this.getActivePlayerId()).classList.add('convertDisabled');
            this.setClientState("client_convert", 
            {
                descriptionmyturn : _("Please select two actions."),
            });
            

            //logic handled in event handlers for action board and cards.
            return true;
        },

        beginSelectingAction: function()
        {
            this.setClientState("client_selectConvertAction", 
            {
                descriptionmyturn : _("Please select an action."),
            });
        }
        
    });
});
