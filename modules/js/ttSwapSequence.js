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
            var elegibleResourceColors = swappableResources[parseInt(this.getActivePlayerId())];
            
            if(elegibleResourceColors.length == 0) 
            {
                this.showMessage(_("You have no resources and thus are inneligible for swap!"),'info');                
                return false;
            }

            //need to repass the args
            this.setClientState("client_swapSelectGain", 
            {
                descriptionmyturn : _("${you} must select the resource to gain"),
            });

            this.clearAllPreviousHighlighting();
            //oddly enough, this is the only place where the list of colors is needed on the client side.
            this.ttEventHandlers.highlightResourceBanks(['red','yellow','green','blue']);

            return true;
        },

        selectGain: function(resource_id)
        {         
            this.swapGainColor = resource_id.replace('Bank','');
            var iconHTML = this.ttUtility.getColorIconHTML(this.swapGainColor);

            //setClientState *implicitly* passes the gamestate args to the client state.
            //In order for new values to get to the client state, they must be set in the gamestate args.

            //used to display message below
            this.gamedatas.gamestate.args.gainColor = this.swapGainColor.toUpperCase(); 
            this.gamedatas.gamestate.args.colorIconHTML = iconHTML;
            
            this.setClientState("client_swapSelectLose", 
            {
                descriptionmyturn : _("To obtain ${gainColor}(${colorIconHTML}) what resource will you swap?"),
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