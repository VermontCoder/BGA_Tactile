define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttAnimations", null, 
    { 
        constructor: function()
        {
            this.animationDuration = 500;
        },

        moveActionCube: async function( actionCardDiv, isCancel ) 
        {
            playerID = this.getActivePlayerId();

            var cubeDiv = ''; //changes on cancel
            var targetDiv = actionCardDiv;

            if (isCancel) 
            {
                //move cube back to parking spot. 
                cubeDiv = $(actionCardDiv).firstChild;
                const spotID = cubeDiv.id.split('_')[2];
                targetDiv = $('actionCubeContainer_' + playerID+'_'+spotID);
            }
            else
            {
                //Which cube is available?
                cubeDiv = $('actionCube_' + playerID+'_'+this.ttUtility.getNumActionBoardActionsSelected.call(this));
            }
            this.ttAnimations.animateActionCubeMove.call(this, cubeDiv, targetDiv);
        },

        //The actual moving of the action cube is broken out into a separate function so it can be called from other functions.
        animateActionCubeMove: async function( cubeDiv, targetDiv )
        {
            const anim = this.slideToObject( cubeDiv, targetDiv, this.ttAnimations.animationDuration, 0 );
            await this.bgaPlayDojoAnimation( anim ).then(()=>
            {
                $(targetDiv).prepend(cubeDiv);
                cubeDiv.removeAttribute('style'); //the slideToObject function adds a style attribute to the div. This removes it.
            });
        },

        doActionCubeReset: async function()
        {
            const playerID = this.getActivePlayerId();
            for(i=0; i<2; i++)
            {
                const cubeDivParentID = $('actionCube_'+playerID+'_'+i).parentNode.id;
                if (cubeDivParentID.startsWith('action_')) 
                {
                    //if the cube is on an action card, move it back to the parking spot.
                    this.ttAnimations.moveActionCube.call(this, cubeDivParentID, true, playerID);
                }
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
            //extract the number from the innerHTML
            const newQty = parseInt($(qtyDivID).innerHTML.match(/(\d+)/)) + qtyDelta;

            console.log('newQty:' + newQty);
            setTimeout(()=> {
                $(qtyDivID).classList.add('red');
                $(qtyDivID).innerHTML = ' : ' + newQty;
            }, delay+100);
            setTimeout(()=> $(qtyDivID).classList.remove('red'), delay+this.ttAnimations.animationDuration);
        },

        animateDeckToStore: async function( cardsToPutInStore )
        {
            for(i=0; i<cardsToPutInStore.length; i++)
            {
                //if this is a buy, many of the cards will already be in the store, so we don't want to create them again.
                //for these cards, we just want to move them within the store.

                const cardID = cardsToPutInStore[i].id;
                if(!$('storecard_'+cardID) )
                {
                    const cardWidth = 80;
                    const xOffset = -1* (parseInt(cardID) * cardWidth);
                    newCardDiv = `<div id="storecard_${cardID}" class="storecard" style="background-position-x: ${xOffset}px;"></div>`;
                    const sourceDeck = this.isClassicMode
                        ? 'deck_' + cardsToPutInStore[i].type.split('_')[1]
                        : 'deck';
                    $(sourceDeck).insertAdjacentHTML('beforeend', newCardDiv);
                }
            
                const anim = this.slideToObjectAndDestroy( 'storecard_'+cardID, 'store_'+i, this.ttAnimations.animationDuration, 0 );
                this.bgaPlayDojoAnimation( anim );
            }
        },

        //flip the cards and move them to discard.
        resetAnim: async function(newCards, resetWithBuyCardID=null )
        {
            const storeCards = this.gamedatas.gamestate.args.store
            
            //sort the new cards so they look like they are moving to the right spot
            newCards = this.isClassicMode
                ? this.ttUtility.sortCardsClassic(Object.values(newCards))
                : this.ttUtility.sortCards(Object.values(newCards));
            this.ttAnimations.animateDeckToStore.call(this,newCards);

            Object.keys(storeCards).forEach(cardID => {
                if (cardID == resetWithBuyCardID) return; /* don't use this card in the reset anim. Continue to next card */
                $('storecard_'+cardID).classList.add('flip');
                $('storecard_back_'+cardID).classList.add('flip');

                this.slideToObjectAndDestroy( 'storecard_back_'+cardID, 'logoiconimg', this.ttAnimations.animationDuration, 0 );
                this.slideToObjectAndDestroy( 'storecard_'+cardID, 'logoiconimg', this.ttAnimations.animationDuration, 0 );
            });
        },

        buyCardAnim: async function( card, newCard, playerID )
        {   
            //get the new store positions
            const newStore = this.ttAnimations.getNewStore.call(this,card, newCard);
            this.ttAnimations.animateDeckToStore.call(this, newStore);

            //get the new tableau positions
            const newTableau = this.ttAnimations.getNewTableau.call(this, card, playerID);
            
            //add new Target div to the player's tableau
            const newTargetDiv = `<div id="cardTarget_${playerID}_${newTableau.length-1}" class="cardTarget addSpace">
                </div>`;
            $('tableauCardContainer_'+playerID).insertAdjacentHTML('beforeend', newTargetDiv);

           this.ttAnimations.animateTableauChange.call(this, newTableau, playerID, card);
        },

        swapCardsAnim: async function( gainCardData, lossCardData, playerID, allyID )
        {
            var newPlayerTableau = this.ttAnimations.getNewTableau.call(this, gainCardData, playerID);
            var newAllyTableau = this.ttAnimations.getNewTableau.call(this, lossCardData, allyID);

            //remove the cards from the respective tableaus. getNewTableau has already added the new cards.
            newPlayerTableau = newPlayerTableau.filter(card => card.id != lossCardData.id);
            newAllyTableau = newAllyTableau.filter(card => card.id != gainCardData.id);
            
            this.ttAnimations.animateTableauChange.call(this, newPlayerTableau, playerID);
            this.ttAnimations.animateTableauChange.call(this, newAllyTableau, allyID);
        },

        animateTableauChange: async function( newTableau, playerID, cardFromStore = null )
        {
             //animate tableau cards
             for (var i=0; i<newTableau.length; i++)
            {
                //This might include a card coming from the store. It has "storecard_" prepended to the id
                // instead of "card_".
                //check for this and modify it accordingly.

                var cardPrefix = 'card_';
                if (cardFromStore && newTableau[i].id == cardFromStore.id) cardPrefix = 'storecard_';
                
                const cardDiv = cardPrefix+newTableau[i].id;
                const destinationDiv = 'cardTarget_'+playerID+'_'+i;

                console.log('cardDiv: '+cardDiv+'; destinationDiv: '+destinationDiv);

                const anim = this.slideToObjectAndDestroy( cardDiv, destinationDiv, this.ttAnimations.animationDuration-20, 0 );
                this.bgaPlayDojoAnimation( anim );
            }
        },

        //returns an array of index, which is position on screen, to new card data
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
            storeCards = this.isClassicMode
                ? this.ttUtility.sortCardsClassic(storeCards)
                : this.ttUtility.sortCards(storeCards);

            //add the new card to a copy of the array
            var newStoreCards = structuredClone(storeCards);
            newStoreCards.push(newCardData);

            //sort & return the new array
            return this.isClassicMode
                ? this.ttUtility.sortCardsClassic(newStoreCards)
                : this.ttUtility.sortCards(newStoreCards);
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
        },

        buyAndResetAnim(card, newCard, player_id, newCards)
        {
            this.ttAnimations.buyCardAnim.call(this, card, newCard, player_id);
            this.ttAnimations.resetAnim.call(this, newCards, card.id);
        }
    });
});