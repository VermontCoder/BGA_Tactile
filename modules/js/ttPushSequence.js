/* Handles both pushes and moves - pushes and moves are identical except which pieces can be selected */

define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttPushSequence", null, 
    { 
        constructor: function()
        {
            this.curPiece = null;
        },

        beginPush: function()
        {
            const pieces = this.gamedatas.gamestate.args.pieces;
            const player_id = this.getActivePlayerId();

            //as a convenience, if only one piece can be moved, select it automatically.
            var selectablePieceIDs = [];

            const legalMoves = this.gamedatas.gamestate.args.legalMovesPush;

            //find all pieces that can be moved.
            Object.keys(pieces).forEach(function(key,index) {
                const playerMatch = pieces[key].player_id == player_id;
                if( !playerMatch && legalMoves[key].length > 0) 
                {
                    selectablePieceIDs.push(key); 
                }
            });

            if(selectablePieceIDs.length == 0) 
            { 
                this.showMessage(_("There are no pieces that can be pushed!"),'error');
                return false;
            }

            const isFromOverdrive = this.eventOrigin.includes(',');
            if (!isFromOverdrive)
            {   
                this.clearAllPreviousHighlighting();
                //if this came from a card, highlight the card.
                if (this.eventOrigin.startsWith('card_'))
                {
                    $(this.eventOrigin).classList.add('highlighted');
                }
            }

            for (const pieceID of selectablePieceIDs)
            {
                $(pieceID).classList.add('highlighted');
            }

            if(selectablePieceIDs.length == 1)
            {
                this.ttPushSequence.selectPiece.call(this,selectablePieceIDs[0]);
                return true;
            }

            this.setClientState("client_selectPiecePush", 
            {
                descriptionmyturn : _("${you} must select piece to move<BR>"),
            });

            return true;
        },

        selectPiece: function( piece_id )
        {
            console.log("selectPiece: " + piece_id);

            //does this piece have any moves?
            const legalMoves = this.gamedatas.gamestate.args.legalMovesPush[piece_id];
            if (legalMoves.length == 0) 
            {
                this.showMessage(_("This piece has no legal moves!"),'error');
                return false; 
            }
            
            //highlight only this piece now.
            
            this.clearTileHighlighting();
            document.querySelectorAll('.playingPiece').forEach(function(el) { el.classList.remove('highlighted'); });
            document.getElementById(piece_id).classList.add('highlighted');
            
            for(i=0; i< legalMoves.length; i++)
            {
                const move = legalMoves[i];
                const moveDiv = document.getElementById('tile_'+move);
                moveDiv.classList.add('legalMove');
            }

            this.curPiece = piece_id;

            this.setClientState("client_selectTilePush", 
            {
                descriptionmyturn : _("${you} must select tile to push piece to<BR>"),  
            });

            return true;
        },

        pushPiece: function( tileID )
        {
            console.log("pushPiece: " + tileID);

            this.bgaPerformAction("actPush", { 
                piece_id: this.curPiece,
                tileID: tileID,
                origin: this.eventOrigin
            }
            )//.then(() =>  {                
                // What to do after the server call if it succeeded
                // (most of the time, nothing, as the game will react to notifs / change of state instead)
           // });       
        }
    }); 
});