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

        selectPiece: function( pieceID )
        {
            console.log("selectPiece: " + pieceID);

            //does this piece have any moves?
            const legalMoves = this.gamedatas.gamestate.args.legalMoves[pieceID];
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

            this.curPiece = pieceID;
        },

        movePiece: function( tileID )
        {
            console.log("movePiece: " + tileID);

            this.bgaPerformAction("actMoveOrPush", { 
                pieceID: this.curPiece,
                tileID: tileID,
                isPush: false
            }
            )//.then(() =>  {                
                // What to do after the server call if it succeeded
                // (most of the time, nothing, as the game will react to notifs / change of state instead)
           // });       

            // this.ajaxcall("/tt/tt/movePiece.html", { 
            //     pieceID: this.curPiece,
            //     tileID: tileID,
            //     lock: true
            // }, this, function(result) {
            //     // What to do after the server call
            // });
        }
    }); 
});