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
            this.setClientState("client_swapSelectGain", 
            {
                descriptionmyturn : _("${you} must select the resource to gain"),
            });

            //oddly enough, this is the only place where the list of colors is needed on the client side.
            this.ttUtility.highlightResourceBanks(['red','yellow','green','blue']);
        },
    });
});