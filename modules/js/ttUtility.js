/* Generally useful Utility functions */

define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttUtility", null, 
    { 
        
        constructor: function()
        {
        
        },

        // Function to get the value of a nested property in an object
        // Example usage:
        // const data = {
        //     a: { id: 1, name: 'Alice' },
        //     b: { id: 2, name: 'Bob' },
        //     c: { id: 1, name: 'Charlie' }
        // };

        // const result = pickByNestedProperty(data, 'id', 1);
        // console.log(result); // { a: { id: 1, name: 'Alice' }, c: { id: 1, name: 'Charlie' } }


        pickByNestedProperty: function(obj, nestedProp, value) 
        {
            return Object.fromEntries(
                Object.entries(obj).filter(([key, nestedObj]) => nestedObj[nestedProp] == value)
            );
        },

        getPlayerHand: function(player_id, hands)
        {
            return this.pickByNestedProperty(hands, 'location_arg', player_id);
        },

        removeDOMElement: function(elementName)
        {
            var x = document.querySelector('#'+elementName)
            if (x) x.remove()
        },

        //parse the card type field to get the color, action, and resources
        getCardDataFromType(card)
        {
            const cardData = card.type.split('_');

            return {
                color: cardData[0],
                action: cardData[1],
                resources: [cardData[2], cardData[3]]
            };
        },
        
        getCardIDFromDivID(divID)
        {
            return parseInt(divID.split('_')[1]);
        },

        getCardDataFromDivID(divID,hands)
        {
            const cardID = this.getCardIDFromDivID(divID);
            const card = hands[cardID];
            return this.getCardDataFromType(card);
        },

        parsePieceID(piece_id)
        {
            const pieceData = piece_id.split('_');
            return { 'player_id': parseInt(pieceData[1]), 'pieceNum': parseInt(pieceData[2]) };
        },

        parseActionBoardID(actionBoardID)
        {
            const actionBoardData = actionBoardID.split('_');
            return { 'player_id': parseInt(actionBoardData[1]), 'action': actionBoardData[2] };
        },

        getCardStatus(card)
        {
            const statuses = ['inactive', 'active', 'exhuasted'];

            return statuses[card.type_arg];
        },

        getActionBoardActionData(id)
        {
            const actionData = id.split('_');

            return {
                player_id: actionData[1],
                action: actionData[2]
            };
        },

        getColorIconHTML(color)
        {
            return `<span class="${color} icon"></span>`;
        },

        getTeamIconHTML(playerColor)
        {
            if (['red','green'].includes(playerColor))
            {
                return '&nbsp;' + this.ttUtility.getColorIconHTML('red') +'&nbsp;'+ this.ttUtility.getColorIconHTML('green'); 
            }
            else
            {
                return '&nbsp;' + this.ttUtility.getColorIconHTML('yellow') + '&nbsp;' + this.ttUtility.getColorIconHTML('blue'); 
            }
        },

        sortCards(cards)
        {
            return cards.toSorted((a, b) => 
            {
                const cardDataA = this.getCardDataFromType(a);
                const cardDataB = this.getCardDataFromType(b);
                
                if (cardDataA.color === cardDataB.color) 
                {
                    return cardDataA.action.localeCompare(cardDataB.action);
                }
                return cardDataA.color.localeCompare(cardDataB.color);
            });
        },

        //not used
        // sortById(arr) {
        //     return arr.sort((a, b) => {
        //         return parseInt(a.id) - parseInt(b.id);
        //     });
        // },

        //use "call" to keep the "game" context.
        getNumActionBoardActionsSelected()
        {
            return this.ttUtility.getActionBoardSelections.call(this).length;
        },

        getActionBoardSelections()
        {
            const gg = this.gamedatas.gamestate;
            const activePlayerBoardVals = this.ttUtility.pickByNestedProperty(gg.args.actionBoardSelections, 'player_id', this.getActivePlayerId());
            const selections = this.ttUtility.pickByNestedProperty(activePlayerBoardVals, 'selected', true);
            return Object.keys(selections);
        },

        notifCardExhaustionCheck(origin)
        {
            //exhaust card if it was used.
            if (origin.startsWith('card_'))
            {
                $(origin).classList.add('exhausted');
            }
        },

        //not working?
        // getCSSVariable: function(v) {
        //     return document.querySelector(':root').style.getPropertyValue('--' + v);
        // }
    });
});