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

            //for reasons not entirely clear to me, the page "forgets" the the gamedatas.gamestate.args.swappableResources
            //object if you come back here more than once. So we need to save the colors here.
            this.elegibleResourceColors = swappableResources[parseInt(this.getActivePlayerId())];
            
            if(this.elegibleResourceColors.length == 0) 
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
                swappableResources: this.elegibleResourceColors,
                colorIconHTML: this.ttUtility.getColorIconHTML(this.swapGainColor)
            };
            
            this.setClientState("client_swapSelectLose", 
                {
                    descriptionmyturn : _("To obtain ${gainColor}(${colorIconHTML}) what resource will you swap?"),
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