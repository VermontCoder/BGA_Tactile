/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * tactile implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * tactile.js
 *
 * tactile user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    g_gamethemeurl + "modules/js/ttUtility.js",
],
function (dojo, declare) {
    return declare("bgagame.tactile", ebg.core.gamegui, {
        constructor: function(){
            console.log('tactile constructor');

            this.ttUtility = new bgagame.ttUtility();
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;

        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */

        createHeader: function() {
            //fonts
            document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', `<link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">`);
        },
        
        createTopAndTableauContainer: function() {
            document.getElementById('game_play_area').insertAdjacentHTML('beforeend', `
            <DIV id="ttTopContainer" style="display: flex"></DIV>
            <DIV id="tableauContainer" class="tableauContainer"></DIV>`);
        },

        //************************************* */
        createStoreCards: function(storeData)
        {
            count =0;
            rowCount = 0;
            Object.values(storeData).forEach(card => 
            {
                if (count % 3 == 0) 
                {
                    document.getElementById('store').insertAdjacentHTML('beforeend', 
                    `<DIV id="storeRow${rowCount}" class="cardRow"></DIV>`);
                    rowCount++;
                }
            
                document.getElementById(`storeRow${rowCount-1}`).insertAdjacentHTML('beforeend',
                            `<DIV id="store_${count}" class="cardTarget addSpace">
                                <DIV id="card_${card.id}" class="card" style="background-position-x: ${-80 * card.id}px;"></DIV>
                            </DIV>`);
                count++;
            });
        },

        createResourceBank: function()
        {
            document.getElementById('store').insertAdjacentHTML('beforeend', 
                `<DIV id="resourceRow" class="cardRow" style="padding-left:5px; padding-right:5px;">
                    <DIV id="redBank" class="bank">
                        <DIV id="redResourceBank1" class="resource red"></DIV>
                        <DIV id="redBankBottomRow" class="cardRow">
                            <DIV id="redResourceBank2" class="resource red addSpaceSmall"></DIV>
                            <DIV id="redResourceBank3" class="resource red addSpaceSmall"></DIV>
                        </DIV>
                    </DIV>
                    <DIV id="blueBank" class="bank">
                        <DIV id="blueResourceBank1" class="resource blue"></DIV>
                        <DIV id="blueBankBottomRow" class="cardRow">
                            <DIV id="blueResourceBank2" class="resource blue addSpaceSmall"></DIV>
                            <DIV id="blueResourceBank3" class="resource blue addSpaceSmall"></DIV>
                        </DIV>
                    </DIV>
                    <DIV id="greenBank" class="bank">
                        <DIV id="greenResourceBank1" class="resource green"></DIV>
                        <DIV id="greenBankBottomRow" class="cardRow">
                            <DIV id="greenResourceBank2" class="resource green addSpaceSmall"></DIV>
                            <DIV id="greenResourceBank3" class="resource green addSpaceSmall"></DIV>
                        </DIV>
                    </DIV>
                    <DIV id="yellowBank" class="bank">
                        <DIV id="yellowResourceBank1" class="resource yellow"></DIV>
                        <DIV id="yellowBankBottomRow" class="cardRow">
                            <DIV id="yellowResourceBank2" class="resource yellow addSpaceSmall"></DIV>
                            <DIV id="yellowResourceBank3" class="resource yellow addSpaceSmall"></DIV>
                        </DIV>
                    </DIV>
                </DIV>`);
        },

        createStore: function(gamedatas) 
        {
            //store
            document.getElementById('ttTopContainer').insertAdjacentHTML('beforeend', `
                <DIV id="store" class="store">
                    <DIV id="deck" class="deck addSpace"></DIV>
                </DIV>
            </DIV>`);

           this.createStoreCards(gamedatas.store);
           this.createResourceBank();
        },
        //************************************* */
        
        
        createBoard: function( gamedatas) {
            console.log( "Creating Board" );

            document.getElementById('ttTopContainer').insertAdjacentHTML('beforeend', 
                `<DIV id="board" class="board"></DIV>`);

            //board
            tiles = Object.values(gamedatas.board);

            // Sort tiles by tile_id, y coord followed by x coord
            tiles.sort((a, b) => (a.tile_id.substring(2,3) + '_' + a.tile_id.substring(0,1)) > (b.tile_id.substring(2,3) + '_' + b.tile_id.substring(0,1)) ? 1 : -1);
            
            Object.values(tiles).forEach(tile => {
                const tileId = 'tile_' + tile.tile_id;
                const tileClass = 'tile ' +tile.color + (gamedatas.playerHomes[tile.tile_id] ? 'Home' : '');

                document.getElementById('board').insertAdjacentHTML('beforeend', '<DIV id="'+tileId+'" class="'+tileClass+'"></DIV>');
            });
        },

        createPiece: function(player,piece) { 
            const divText = '<DIV id="'+piece.piece_id+'" class="playingPiece '+player.color_name+'"></DIV>';
            document.getElementById('tile_'+piece.location).insertAdjacentHTML('beforeend', divText);
        },


        //************************************* */
        createPlayerActionBoard: function(player) {
            document.getElementById('tableauCardContainer_' + player.player_id).insertAdjacentHTML('beforeend', `
            <DIV id="actionBoard_${player.player_id}" class="actionBoard">
                <DIV id="action_${player.player_id}_move" class="actionBoardSelectionTarget" style="top:39px; left:16px;"></DIV>
                <DIV id="action_${player.player_id}_gain" class="actionBoardSelectionTarget" style="top:67px; left:16px;"></DIV>
                <DIV id="action_${player.player_id}_buy" class="actionBoardSelectionTarget red" style="top:95px; left:16px;"></DIV>
                <DIV id="action_${player.player_id}_swap" class="actionBoardSelectionTarget" style="top:123px; left:16px;"></DIV>
                <DIV id="action_${player.player_id}_reset" class="actionBoardSelectionTarget" style="top:151px; left:16px;"></DIV>
            </DIV>`);
        },

        createPlayerTableau: function(player) {
            document.getElementById('tableauContainer').insertAdjacentHTML('beforeend', `
            <DIV id="tableau_${player.player_id}" class = "tableau">
                <SPAN id="tableauLabel_${player.player_id}" class="tableauLabel ${player.color_name}">${player.player_name}</SPAN>
                <DIV id="tableauCardContainer_${player.player_id}" class="cardRow tableauCardContainer"></DIV>
            </DIV>`);

            this.createPlayerActionBoard(player);
        },
        //************************************* */

        createPlayerPanel: function(player) 
        {
            this.getPlayerPanelElement(player.player_id).insertAdjacentHTML('beforeend', `
                <DIV id="resourceContainer_${player.player_id}" class="resourceContainer">   
                    <DIV id="redResourceLabel_${player.player_id}" class="red resource addSpaceSmall"></DIV>
                    <DIV id="redResource_${player.player_id}" class="resourceAmount"> : ${player.red_resource_qty} </DIV>
                    <DIV id="blueResourceLabel_${player.player_id}" class="blue resource addSpaceSmall"></DIV>
                    <DIV id="blueResource_${player.player_id}" class="resourceAmount"> : ${player.blue_resource_qty} </DIV>
                    <DIV id="greenResourceLabel_${player.player_id}" class="green resource addSpaceSmall"></DIV>
                    <DIV id="greenResource_${player.player_id}" class="resourceAmount"> : ${player.green_resource_qty} </DIV>
                    <DIV id="yellowResourceLabel_${player.player_id}" class="yellow resource addSpaceSmall"></DIV>
                    <DIV id="yellowResource_${player.player_id}" class="resourceAmount"> : ${player.yellow_resource_qty} </DIV>
                </DIV>
            `);
        },

        createPlayerHand: function(player, hand) 
        {
            //if player has no cards, return
            if (Object.keys(hand).length == 0) { return; }

            let count =0;

            //use custom sort function to sort by card type - first by color, then by action
            Object.values(hand).sort((a, b) => {
                debugger;
                const cardDataA = this.ttUtility.getCardData(a);
                const cardDataB = this.ttUtility.getCardData(b);
                
                if (cardDataA.color === cardDataB.color) {
                    return cardDataA.action.localeCompare(cardDataB.action);
                }
                return cardDataA.color.localeCompare(cardDataB.color);
            }).forEach(card => {
                document.getElementById('tableauCardContainer_' + player.player_id).insertAdjacentHTML('beforeend', `
                    <div id="cardTarget_${player.player_id}_${count}" class="cardTarget addSpace">
                        <div id="card_${card.id}" class="card" style="background-position-x: ${-80 * card.id}px;"></div>
                    </div>`);
                
                    count++;
            });
            
        },
        
        setup: function( gamedatas )
        {
            console.log( "Starting game setup" );
            

            // (see "setupNotifications" method below)
            this.setupNotifications();

            this.createHeader();
            this.createTopAndTableauContainer();
            this.createStore(gamedatas);
            this.createBoard(gamedatas);

            Object.values(gamedatas.pieces).forEach(piece => {
                this.createPiece(gamedatas.players[piece.piece_owner], piece);
            });
            

            Object.values(gamedatas.players).forEach(player => {
                this.createPlayerPanel(player);
                this.createPlayerTableau(player);

                playerHand = this.ttUtility.pickByNestedProperty(gamedatas.hands, 'location_arg', player.player_id);
                
                this.createPlayerHand(player, playerHand);
            });
            
            //move the current player's tableau to the top
            let currentPlayerTableau = document.querySelector('#tableau_'+this.player_id);
            let tableauContainer = document.querySelector('#tableauContainer');

            // Move stuff
            tableauContainer.prepend(currentPlayerTableau);
            
            console.log( "Ending game setup" );
            console.log(gamedatas.legalActions);
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName, args );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
           
           
            case 'dummy':
                break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
           
           
            case 'dummy':
                break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName, args );
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                //  case 'playerTurn':    
                //     const playableCardsIds = args.playableCardsIds; // returned by the argPlayerTurn

                //     // Add test action buttons in the action status bar, simulating a card click:
                //     playableCardsIds.forEach(
                //         cardId => this.addActionButton(`actPlayCard${cardId}-btn`, _('Play card with id ${card_id}').replace('${card_id}', cardId), () => this.onCardClick(cardId))
                //     ); 

                //     this.addActionButton('actPass-btn', _('Pass'), () => this.bgaPerformAction("actPass"), null, null, 'gray'); 
                //     break;
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods
        
        /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */


        ///////////////////////////////////////////////////
        //// Player's action
        
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */
        
        // Example:
        
        onCardClick: function( card_id )
        {
            console.log( 'onCardClick', card_id );

            this.bgaPerformAction("actPlayCard", { 
                card_id,
            }).then(() =>  {                
                // What to do after the server call if it succeeded
                // (most of the time, nothing, as the game will react to notifs / change of state instead)
            });        
        },    

        
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your tactile.game.php file.
        
        */
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );
            dojo.subscribe( 'showVariable', this, "notif_showVariable" );
            
            // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 
        },  

        notif_showVariable: function( notif )
        {
            console.log( 'hehe' );
        }
        
        // TODO: from this point and below, you can write your game notifications handling methods
        
        /*

       
        Example:
        
        notif_cardPlayed: function( notif )
        {
            console.log( 'notif_cardPlayed' );
            console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            // TODO: play the card in the user interface.
        },    
        
        */
   });             
});
