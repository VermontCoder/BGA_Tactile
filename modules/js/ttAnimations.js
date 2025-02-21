define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttAnimations", null, 
    { 
        constructor: function()
        {
            this.animationDuration = 1000;
        },

        moveActionCube: async function( actionCardDiv, isCancel ) 
        {
            const playerID = this.getActivePlayerId();
            if (isCancel) 
            {
                //move cube back to parking spot. 
                const cubeDiv = $(actionCardDiv).firstChild;
                const spotID = cubeDiv.id.split('_')[2];
                const cubeContainerDiv = $('actionCubeContainer_' + playerID+'_'+spotID);
                const anim = this.slideToObject( cubeDiv, cubeContainerDiv, this.ttAnimations.animationDuration, 0 );

                await this.bgaPlayDojoAnimation( anim ).then(()=>
                    {
                        cubeDiv.removeAttribute('style'); //the slideToObject function adds a style attribute to the div. This removes it.
                        $(cubeContainerDiv).prepend(cubeDiv);
                    });
            }
            else
            {
                //move cube to action card. Which cube is available?
                const cubeDiv = $('actionCube_' + playerID+'_'+this.ttUtility.getNumActionBoardActionsSelected.call(this));

                const anim = this.slideToObject( cubeDiv, actionCardDiv, this.ttAnimations.animationDuration, 0 );
                await this.bgaPlayDojoAnimation( anim ).then(()=>
                    {
                        $(actionCardDiv).prepend(cubeDiv);
                        cubeDiv.removeAttribute('style'); //the slideToObject function adds a style attribute to the div. This removes it.
                    });
            }

        },

        movePiece: async function( pieceDivID, targetDivID )
        {
            const anim = this.slideToObject( pieceDivID, targetDivID, this.ttAnimations.animationDuration, 0 );
            await this.bgaPlayDojoAnimation( anim );
        },

        moveResource: async function( color, player_id, toPlayer) 
        {
            const bankDiv = $(color+'Bank');
            const playerDiv = $(color+'ResourceLabel_'+player_id);
            const resourceDiv = `<div id="resourceAnim${color}" style="position: absolute;" class="${color} resource"></div>`;

            const destination = toPlayer ? playerDiv : bankDiv;
            const source = toPlayer ? bankDiv : playerDiv;
            source.insertAdjacentHTML('beforeend', resourceDiv);

            anim = this.slideToObjectAndDestroy( 'resourceAnim'+color, destination, this.ttAnimations.animationDuration, 0 );
            
            await this.bgaPlayDojoAnimation(anim);
        },

        //starts the number changing to red after the move animation is complete.
        qtyChangeAnimation: async function( qtyDivID, qtyDelta, delay )
        {
            console.log($(qtyDivID).innerHTML+';;;');
            const newQty = parseInt($(qtyDivID).innerHTML.trimEnd().slice(-1)) + qtyDelta;
            setTimeout(()=> {
                $(qtyDivID).classList.add('red');
                $(qtyDivID).innerHTML = ' : ' + newQty;
            }, delay+100);
            setTimeout(()=> $(qtyDivID).classList.remove('red'), delay+this.ttAnimations.animationDuration);
        },

        resetAnim: async function(newCards )
        {
            //this.ttAnimations.animationDuration = 2100; //delay for the reset animation

            //flip the cards and move them to discard.
            const storeCards = this.gamedatas.gamestate.args.store
            Object.keys(storeCards).forEach(cardID => {
                $('storecard_'+cardID).classList.add('flip');
                $('storecard_back_'+cardID).classList.add('flip');

                //flipping takes 1s.  Start the movement to "discard" 1s later - to the bga icon logo works.
                this.slideToObjectAndDestroy( 'storecard_back_'+cardID, 'logoiconimg', this.ttAnimations.animationDuration, 0 );
                this.slideToObjectAndDestroy( 'storecard_'+cardID, 'logoiconimg', this.ttAnimations.animationDuration, 0 );
            });

            //simultaneously, move the new cards to the store.
            //tried to reuse the flip animation, but it didn't work.  So, I'm just going to slide them in.

            const cardWidth = 80;

            for(i=0; i<newCards.length; i++)
            {
                const cardID = newCards[i].id;
                
                const xOffset = -1* (parseInt(cardID) * cardWidth);
                const newCardDiv = `<div id="storecard_${cardID}" class="storecard" style="background-position-x: ${xOffset}px;"></div>`;
                
                $('deck').insertAdjacentHTML('beforeend', newCardDiv);
                
                const anim = this.slideToObject( 'storecard_'+cardID, 'store_'+i, this.ttAnimations.animationDuration, 0 );
                this.bgaPlayDojoAnimation( anim );
            }
        },

        buyCardAnim: async function( cardID, newCardID, playerID )
        {
            const cardDiv = $('storecard_'+cardID);
            const destinationDiv = $('cardTarget_'+playerID+'_0');

            const anim = this.slideToObject( cardDiv, destinationDiv, this.ttAnimations.animationDuration, 0 );
            await this.bgaPlayDojoAnimation( anim );
        },

        // moveActionCube: function( actionCubeDivID, targetDivID, callback ) {

        //     const actionCubeDiv = $(actionCubeDivID);
        //     const targetDiv = $(targetDivID);

        //     const actionCubePos = actionCubeDiv.getBoundingClientRect();
        //     const targetPos = targetDiv.getBoundingClientRect();

        //     const xOffset = targetPos.left - actionCubePos.left;
        //     const yOffset = targetPos.top - actionCubePos.top;

        //     const animationDuration = 1000;

        //     // Set the initial position of the action cube
        //     actionCubeDiv.style.transform = `translate(${xOffset}px, ${yOffset}px)`;

        //     // Add a class to trigger the CSS transition
        //     actionCubeDiv.classList.add('move-animation');

        //     // Wait for the animation to complete before calling the callback
        //     setTimeout(() => {
        //         // Remove the class to reset the state
        //         actionCubeDiv.classList.remove('move-animation');

        //         // Call the callback function if provided
        //         if (callback) {
        //             callback();
        //         }
        //     }, animationDuration);
        // }
    });
});