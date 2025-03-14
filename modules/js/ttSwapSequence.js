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

            const isFromOverdrive = this.eventOrigin.includes(',');
            if (!isFromOverdrive) this.clearAllPreviousHighlighting();

            if ( Object.keys(this.gamedatas.gamestate.args.players).length < 4)
            {
                this.setClientState("client_swapSelectGain", 
                {
                    descriptionmyturn : _("${you} must select the resource to gain<BR>"),
                });
            }
            else
            {
                this.setClientState("client_swapSelectGain", 
                {
                    descriptionmyturn : _("${you} must select the resource or card from your ally to gain<BR>"),
                });

                const ally_id= this.gamedatas.gamestate.args.players[this.getActivePlayerId()].ally_id;
                this.ttEventHandlers.highlightPlayerCards.call(this, ally_id, this.gamedatas.gamestate.args.hands);
            }

            
            
            //oddly enough, this is the only place where the list of colors is needed on the client side.
            this.ttEventHandlers.highlightResourceBanks(['red','yellow','green','blue']);

            return true;
        },

        selectGain: function(resource_id)
        {         
            this.swapGainColor = resource_id.replace('Bank','');
            var iconHTML = this.ttUtility.getColorIconHTML(this.swapGainColor);

            //remove highlighting from banks
            document.querySelectorAll('.bank').forEach((bank) => {
                if(bank.id !== resource_id) bank.classList.remove('highlighted');
            });

            //setClientState *implicitly* passes the gamestate args to the client state.
            //In order for new values to get to the client state, they must be set in the gamestate args.

            //used to display message below
            this.gamedatas.gamestate.args.gainColor = this.swapGainColor.toUpperCase(); 
            this.gamedatas.gamestate.args.colorIconHTML = iconHTML;
            
            this.setClientState("client_swapSelectLoss", 
            {
                descriptionmyturn : _("To obtain ${gainColor}(${colorIconHTML}) what resource will you swap?<BR>"),
            });
        },

        selectGainCard: function(card_id)
        {
            this.swapGainCardID = card_id.replace('card_','');
            this.clearAllPreviousHighlighting();
            $(card_id).classList.add('highlighted');
            this.setClientState("client_swapSelectLossCard", 
            {
                descriptionmyturn : _("To obtain this card what card will you exchange?<BR>"),
            });

            this.ttEventHandlers.highlightPlayerCards.call(this, this.getActivePlayerId(), this.gamedatas.gamestate.args.hands);
        },

        selectSwapLossCard: function(card_id)
        {
            this.bgaPerformAction("actSwapCard", 
            {
                origin: this.eventOrigin,
                lossCardID: card_id.replace('card_',''), 
                gainCardID: this.swapGainCardID,
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