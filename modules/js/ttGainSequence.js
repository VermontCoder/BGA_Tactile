define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttGainSequence", null, 
    { 

        constructor: function()
        {
           
        },

        beginGain: function()
        {
            const player_id = this.getActivePlayerId();
            const pieces = this.gamedatas.gamestate.args.pieces;
            var elegibleResourceColors = [];
            Object.keys(pieces).forEach(function(key,index) {
                if(pieces[key].player_id == player_id)
                {
                    const pieceTileColor = pieces[key].tile_color;

                    //pieceTileColor will be '' if the piece is at a home or goal tile.
                    if (pieceTileColor != '')
                    {
                        elegibleResourceColors.push(pieceTileColor);
                    }
                }
            });

            //if all the player's pieces are at home or goal tiles, there are no resources to gain.
            if(elegibleResourceColors.length == 0) 
            {
                this.showMessage(_("You have no pieces on the board that can gain resources!"),'info');
                this.clearAllPreviousHighlighting();
                return;
            } 

            for(i=0; i< elegibleResourceColors.length; i++)
            {
                const resourceBank = document.getElementById(elegibleResourceColors[i]+'Bank');
                resourceBank.classList.add('highlighted');
                
                const resourceBankDivs = document.querySelectorAll('#' +elegibleResourceColors[i]+'Bank .resource');
                resourceBankDivs.forEach( (resourceBankDiv => resourceBankDiv.classList.add('highlighted')));

            }

            this.setClientState("client_selectResource", 
            {
                descriptionmyturn : _("${you} must select resource to gain"),
            });
        },
        
        gainResource: function(resource_id)
        {
            const resourceColor = resource_id.replace('Bank','');

            this.bgaPerformAction("actGain", { 
                color: resourceColor,
                origin: this.eventOrigin
            });
        }
    });
});