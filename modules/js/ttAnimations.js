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

            //flip the cards and move them to discard.
            const storeCards = this.gamedatas.gamestate.args.store
            
            //sort the new cards so they look like they are moving to the right spot
            newCards = this.ttUtility.sortCards(Object.values(newCards));

            Object.keys(storeCards).forEach(cardID => {
                $('storecard_'+cardID).classList.add('flip');
                $('storecard_back_'+cardID).classList.add('flip');

                this.slideToObjectAndDestroy( 'storecard_back_'+cardID, 'logoiconimg', this.ttAnimations.animationDuration, 0 );
                this.slideToObjectAndDestroy( 'storecard_'+cardID, 'logoiconimg', this.ttAnimations.animationDuration, 0 );
            });

            //simultaneously, move the new cards to the store.
            //tried to reuse the flip animation, but it didn't work.  So, I'm just going to slide them in.

            for(i=0; i<newCards.length; i++)
            {
                this.ttAnimations.setNewCardDivForStore(newCards[i]);
             
                const anim = this.slideToObjectAndDestroy( 'storecard_'+newCards[i].id, 'store_'+i, this.ttAnimations.animationDuration, 0 );
                this.bgaPlayDojoAnimation( anim );
            }
        },

        setNewCardDivForStore: function( card )
        {
            const cardWidth = 80;
            const xOffset = -1* (parseInt(card.id) * cardWidth);
            const newCardDiv = `<div id="storecard_${card.id}" class="storecard" style="background-position-x: ${xOffset}px;"></div>`;
            $('deck').insertAdjacentHTML('beforeend', newCardDiv);
        },

        buyCardAnim: async function( card, newCard, playerID )
        {
            //animation from deck to store

            //get the new card div from the deck
            this.ttAnimations.setNewCardDivForStore(newCard);

            //get the new tableau & store positions
            const newTableau = this.ttAnimations.getNewTableau.call(this, card, playerID);
            const newStore = this.ttAnimations.getNewStore.call(this,card, newCard);
            
            //add new Target div to the player's tableau
            const newTargetDiv = `<div id="cardTarget_${playerID}_${newTableau.length-1}" class="cardTarget addSpace">
                </div>`;
            $('tableauCardContainer_'+playerID).insertAdjacentHTML('beforeend', newTargetDiv);

            console.log('newTargetDiv: '+newTargetDiv);


            //animate store cards
            for (var i=0; i<newStore.length; i++)
            {
                const cardDiv = 'storecard_'+newStore[i].id;
                const destinationDiv = 'store_'+i;

                const anim = this.slideToObject( cardDiv, destinationDiv, this.ttAnimations.animationDuration, 0 );
                this.bgaPlayDojoAnimation( anim );
            }

            //animate tableau cards
            for (var i=0; i<newTableau.length; i++)
            {
                //The card coming from the store is included in this array. It has "storecard_" prepended to the id
                // instead of "card_".
                //check for this and modify it accordingly.

                const cardPrefix = newTableau[i].id != card.id ? 'card_' : 'storecard_';
                const cardDiv = cardPrefix+newTableau[i].id;
                const destinationDiv = 'cardTarget_'+playerID+'_'+i;

                console.log('cardDiv: '+cardDiv+'; destinationDiv: '+destinationDiv);

                const anim = this.slideToObject( cardDiv, destinationDiv, this.ttAnimations.animationDuration, 0 );
                this.bgaPlayDojoAnimation( anim );
            }
        },

        //returns a dictionary of card id to target div index in the store array.
        getNewStore: function( cardData, newCardData )
        {
            //create an array of the store cards without the card that was just bought.
            var storeCards =Object.values(this.gamedatas.gamestate.args.store);
            for(i=0; i<storeCards.length; i++)
            {
                if(storeCards[i].id == cardData.id)
                {
                    storeCards.splice(i,1);    
                }
            }
            
            //sort this array
            storeCards = this.ttUtility.sortCards(storeCards);

            //add the new card to a copy of the array
            var newStoreCards = structuredClone(storeCards);
            newStoreCards.push(newCardData);

            //sort & return the new array
            return this.ttUtility.sortCards(newStoreCards);

            // //create a dictionary of mappings of card id to index in the sorted array.
            // var mappings = {};
            // for(i=0; i<newStoreCards.length; i++)
            // {
            //     mappings[newStoreCards[i].id] = i;
            // }
            
            // return mappings;
        },

        getNewTableau: function(cardData,playerID)
        {
            //get player's tableau
            const hand = this.ttUtility.getPlayerHand(playerID, this.gamedatas.gamestate.args.hands);
            
            //convert to array
            var handCards = Object.values(hand);
            
            //add the new card to a copy of the array
            handCards.push(cardData);

            //sort the new array & return it
            return this.ttUtility.sortCards(handCards);

            //create a dictionary of mappings of card id to index in the sorted array.
            // var mappings = {};
            // for(i=0; i<newHandCards.length; i++)
            // {
            //     mappings[newHandCards[i].id] = i;
            // }
            
            // return mappings;
        }
    });
});