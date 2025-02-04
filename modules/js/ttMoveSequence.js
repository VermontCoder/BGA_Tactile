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

            const legalMoves = this.gamedatas.gamestate.args.legalMoves[pieceID];
            for(i=0; i< legalMoves.length; i++)
            {
                const move = legalMoves[i];
                const moveDiv = document.getElementById('tile_'+move);
                moveDiv.classList.add('legalMove');
            }

            this.curPiece = pieceID;
        }
    }); 
});