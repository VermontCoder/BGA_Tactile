define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttMoveSequence", null, 
    { 

        constructor: function()
        {
            this.curPiece = null;
        },

        beginMove: function()
        {
            this.setClientState("client_selectPiece_move", 
            {
                descriptionmyturn : _("${you} must select piece to move"),
            });
        },

        selectPiece: function( piece_id )
        {
            console.log("selectPiece: " + piece_id);

            //does this piece have any moves?
            const legalMoves = this.gamedatas.gamestate.args.legalMoves[piece_id];
            if (legalMoves.length == 0) 
            {
                this.showMessage(_("This piece has no legal moves!"),'error');
                this.restoreServerGameState(); 
                return; 
            }
            
            for(i=0; i< legalMoves.length; i++)
            {
                const move = legalMoves[i];
                const moveDiv = document.getElementById('tile_'+move);
                moveDiv.classList.add('legalMove');
            }

            this.curPiece = piece_id;

            this.setClientState("client_selectTile", 
            {
                descriptionmyturn : _("${you} must select tile to move piece to"),  
            });
        },

        movePiece: function( tileID )
        {
            console.log("movePiece: " + tileID);

            this.bgaPerformAction("actMoveOrPush", { 
                piece_id: this.curPiece,
                tileID: tileID,
                isPush: false
            }
            )//.then(() =>  {                
                // What to do after the server call if it succeeded
                // (most of the time, nothing, as the game will react to notifs / change of state instead)
           // });       

            // this.ajaxcall("/tt/tt/movePiece.html", { 
            //     piece_id: this.curPiece,
            //     tileID: tileID,
            //     lock: true
            // }, this, function(result) {
            //     // What to do after the server call
            // });
        }
    }); 
});