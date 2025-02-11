define([
    "dojo", "dojo/_base/declare", 
], function( dojo, declare )

{
    return declare("bgagame.ttSwapSequence", null, 
    { 

        constructor: function()
        {
            
        },

        beginSwap: function() 
        {
            const swappableResources = this.gamedatas.gamestate.args.swappableResources;
            const elegibleResourceColors = swappableResources[parseInt(this.getActivePlayerId())];
            if(elegibleResourceColors.length == 0) 
            {
                this.showMessage(_("You have no resources and thus are inneligible for swap!"),'info');
                this.clearAllPreviousHighlighting();
                return;
            }

            this.setClientState("client_swapSelectGain", 
            {
                descriptionmyturn : _("${you} must select the resource to gain"),
            });

             
            //oddly enough, this is the only place where the list of colors is needed on the client side.
            this.ttEventHandlers.highlightResourceBanks(['red','yellow','green','blue']);
        },

        selectGain: function(resource_id)
        {            
            this.swapGainColor = resource_id.replace('Bank','');
            //this form is required for setClientState to work.
            const args = {
                gainColor: this.swapGainColor.toUpperCase(),
                swappableResources: this.gamedatas.gamestate.args.swappableResources[this.getActivePlayerId()],
            };

            this.setClientState("client_swapSelectLose", 
                {
                    descriptionmyturn : _("To obtain ${gainColor} what resource will you swap?"),
                    args: args,
                });
        },

        selectSwapLoss: function(lossColor)
        {
            this.bgaPerformAction("actSwap", 
            {
                origin: this.eventOrigin,
                lossColor: lossColor, 
                gainColor: this.swapGainColor,
            });
        }
    });
});