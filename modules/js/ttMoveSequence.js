/* Handles both pushes and moves - pushes and moves are identical except which pieces can be selected */

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

        beginMove: function( action)
        {
            this.setClientState("client_selectPiece", 
            {
                descriptionmyturn : _("${you} must select piece to move"),
            });

            const pieces = this.gamedatas.gamestate.args.pieces;
            const player_id = this.getActivePlayerId();

            var doesPlayerHaveMovablePieces = false;
            const legalMoves = this.gamedatas.gamestate.args.legalMoves;

            //highlight all pieces that can be moved.
            Object.keys(pieces).forEach(function(key,index) {
                const playerMatch = pieces[key].player_id == player_id;
                if((action=='move' && playerMatch) || (action=='push' && !playerMatch))
                {
                    $(key).classList.add('highlighted');
                    if(legalMoves[key].length > 0) 
                    { 
                        doesPlayerHaveMovablePieces = true; 
                    }
                }
            });

            if(!doesPlayerHaveMovablePieces) 
            { 
                const moveOrPush = (action=='move') ? 'moved' : 'pushed';
                this.showMessage(_("There are no pieces that can be "+moveOrPush+"!"),'error'); 
                this.restoreServerGameState();
            }
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
            
            //highlight only this piece now.
            document.querySelectorAll('.playingPiece').forEach(function(el) { el.classList.remove('highlighted'); });
            document.getElementById(piece_id).classList.add('highlighted');
            
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
                origin: this.eventOrigin
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