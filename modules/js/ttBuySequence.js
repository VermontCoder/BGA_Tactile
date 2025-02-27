define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttBuySequence", null, 
    { 
        constructor: function()
        {
        
        },

        beginBuy: function()
        {
            //highlight cards that can be bought
            const buyableCards = this.gamedatas.gamestate.args.buyableCards;
            
            if(Object.keys(buyableCards).length == 0)
            {
                this.showMessage(_("You cannot afford to buy any cards!"),'error');
                return false;
            }

            const isFromOverdrive = this.eventOrigin.includes(',');
            if (!isFromOverdrive) this.clearAllPreviousHighlighting();
            
            Object.keys(buyableCards).forEach(function(card_id,index) {
                const cardDiv = document.getElementById('storecard_'+card_id);
                cardDiv.classList.add('highlighted');
            });

            this.setClientState("client_buyCard", 
            {
                descriptionmyturn : _("${you} must select card to buy<BR>"),
            });

            return true;
        },

        buyCard: function(card_id)
        {
            console.log('buyCard: '+card_id);
            this.bgaPerformAction("actBuy", { 
                card_id: card_id,
                origin: this.eventOrigin
            });
        }
    });
});