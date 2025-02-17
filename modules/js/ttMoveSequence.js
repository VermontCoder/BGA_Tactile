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
            const pieces = this.gamedatas.gamestate.args.pieces;
            const player_id = this.getActivePlayerId();

            //as a convenience, if only one piece can be moved, select it automatically.
            var pieceCount = 0;
            var selectablePieceID = null;

            const legalMoves = this.gamedatas.gamestate.args.legalMoves;

            //highlight all pieces that can be moved.
            Object.keys(pieces).forEach(function(key,index) {
                const playerMatch = pieces[key].player_id == player_id;
                if((action=='move' && playerMatch) || (action=='push' && !playerMatch))
                {
                    
                    if(legalMoves[key].length > 0) 
                    { 
                        $(key).classList.add('highlighted');
                        pieceCount++;
                        selectablePieceID = key; 
                    }
                }
            });

            if(selectablePieceID == null) 
            { 
                const moveOrPush = (action=='move') ? 'moved' : 'pushed';
                this.showMessage(_("There are no pieces that can be "+moveOrPush+"!"),'error');
                this.ttUtility.errorUIHandling.call(this); 
                //this.restoreServerGameState();
                return;
            }

            if(pieceCount == 1)
            {
                this.ttMoveSequence.selectPiece.call(this,selectablePieceID);
                return;
            }

            this.setClientState("client_selectPiece", 
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