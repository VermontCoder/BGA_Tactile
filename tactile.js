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
    g_gamethemeurl + "modules/js/ttAnimations.js",
    g_gamethemeurl + "modules/js/ttUtility.js",
    g_gamethemeurl + "modules/js/ttEventHandlers.js",
    g_gamethemeurl + "modules/js/ttMoveSequence.js",
    g_gamethemeurl + "modules/js/ttGainSequence.js",
    g_gamethemeurl + "modules/js/ttBuySequence.js",
    g_gamethemeurl + "modules/js/ttSwapSequence.js",
    g_gamethemeurl + "modules/js/ttResetSequence.js"
],

function (dojo, declare) {
    return declare("bgagame.tactile", ebg.core.gamegui, {
        constructor: function(){
            console.log('tactile constructor');

            this.ttUtility = new bgagame.ttUtility();
            this.ttEventHandlers = new bgagame.ttEventHandlers();
            this.ttMoveSequence = new bgagame.ttMoveSequence();
            this.ttGainSequence = new bgagame.ttGainSequence();
            this.ttBuySequence = new bgagame.ttBuySequence();
            this.ttSwapSequence = new bgagame.ttSwapSequence();
            this.ttResetSequence = new bgagame.ttResetSequence();
            this.ttAnimations = new bgagame.ttAnimations();

            this.cardStatuses = { 0: 'inactive', 1: 'active', 2: 'exhausted' };

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

        setup: function( gamedatas )
        {
            console.log( "Starting game setup" );
            

            // (see "setupNotifications" method below)
            this.setupNotifications();

            this.createHeader();
            this.createTopAndTableauContainer();
            this.createStore(gamedatas.store);
            this.createBoard(gamedatas.board, gamedatas.playerHomes);
            this.createPieces(gamedatas.players, gamedatas.pieces);

            Object.values(gamedatas.players).forEach(player => {
                this.createPlayerPanel(player);
                this.createPlayerTableau(player, gamedatas.hands, gamedatas.actionBoardSelections);
            });
            
            //move the current player's tableau to the top
            let currentPlayerTableau = document.querySelector('#tableau_'+this.player_id);
            let tableauContainer = document.querySelector('#tableauContainer');

            tableauContainer.prepend(currentPlayerTableau);

            //set color blind preference
            if (this.getGameUserPreference(100) == 1)
            {
                document.querySelector(':root').style.setProperty('--num-tiles-to-offset', 8);
            }

            console.log( "Ending game setup" );
            //console.log(gamedatas.legalActions);
        },

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
                                <DIV id="storecard_${card.id}" class="storecard" style="background-position-x: ${-80 * card.id}px;"></DIV>
                            </DIV>`);
                
                //add event listener.
                $('storecard_'+card.id).addEventListener('click', (e) => this.ttEventHandlers.onStoreCardClick.call(this,e.target.id));
                
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

                //click handlers
                //currentTarget is the div that was clicked, not the child div.
                const resourceBankDivs = document.querySelectorAll('.bank');
                resourceBankDivs.forEach(resourceBankDiv => {         
                    resourceBankDiv.addEventListener('click', (e) => this.ttEventHandlers.onResourceBankClick.call(this,e.currentTarget.id));
                });
        },

        createStore: function(store) 
        {
            //store
            document.getElementById('ttTopContainer').insertAdjacentHTML('beforeend', `
                <DIV id="store" class="store">
                    <DIV id="deck" class="deck addSpace"></DIV>
                </DIV>
            </DIV>`);

           this.createStoreCards(store);
           this.createResourceBank();
        },
        //************************************* */
        
        
        createBoard: function( board, playerHomes) {
            console.log( "Creating Board" );

            document.getElementById('ttTopContainer').insertAdjacentHTML('beforeend', 
                `<DIV id="board" class="board"></DIV>`);

            //board
            tiles = Object.values(board);

            // Sort tiles by tile_id, y coord followed by x coord
            tiles.sort((a, b) => (a.tile_id.substring(2,3) + '_' + a.tile_id.substring(0,1)) > (b.tile_id.substring(2,3) + '_' + b.tile_id.substring(0,1)) ? 1 : -1);
            
            Object.values(tiles).forEach(tile => {
                const tileId = 'tile_' + tile.tile_id;
                const tileClass = 'tile ' +tile.color + (playerHomes[tile.tile_id] ? playerHomes[tile.tile_id] + 'Home' : '');

                document.getElementById('board').insertAdjacentHTML('beforeend', '<DIV id="'+tileId+'" class="'+tileClass+'"></DIV>');
            });

            //click handlers
            const tileDivs = document.querySelectorAll('#board > div');
            tileDivs.forEach(tileDiv => {
                //this passes the currentTarget as opposed to the target, because that will be the tileID if there is a piece here.
                 tileDiv.addEventListener('click', (e) => this.ttEventHandlers.onTileClick.call(this,e.currentTarget.id));
            });
        },

        createPieces: function(players,pieces) {
            Object.values(pieces).forEach(piece => {
                this.createPiece(players[piece.player_id], piece);
            });
        },
        createPiece: function(player,piece) { 
            const divText = '<DIV id="'+piece.piece_id+'" class="playingPiece '+player.color_name+'"></DIV>';
            document.getElementById('tile_'+piece.location).insertAdjacentHTML('beforeend', divText);
            $(piece.piece_id).addEventListener('click', (e) => this.ttEventHandlers.onPieceClick.call(this,e.target.id));
        },


        //************************************* */
        createPlayerActionBoard: function(player, actionBoardSelections) {
            document.getElementById('tableauCardContainer_' + player.player_id).insertAdjacentHTML('beforeend', `
            <DIV id="actionBoard_${player.player_id}" class="actionBoard">
                <DIV id="action_${player.player_id}_move" class="actionBoardSelectionTarget" style="top:39px; left:16px;"></DIV>
                <DIV id="action_${player.player_id}_gain" class="actionBoardSelectionTarget" style="top:67px; left:16px;"></DIV>
                <DIV id="action_${player.player_id}_buy" class="actionBoardSelectionTarget" style="top:95px; left:16px;"></DIV>
                <DIV id="action_${player.player_id}_swap" class="actionBoardSelectionTarget" style="top:123px; left:16px;"></DIV>
                <DIV id="action_${player.player_id}_reset" class="actionBoardSelectionTarget" style="top:151px; left:16px;"></DIV>
            </DIV>`);

            //click handlers
            const actionBoardChoices = document.querySelectorAll('#actionBoard_'+player.player_id+' .actionBoardSelectionTarget');
            actionBoardChoices.forEach(choice => {         
                 choice.addEventListener('click', (e) => this.ttEventHandlers.onActionBoardClick.call(this,e.target.id));
            });

            this.createActionBoardSelections(player.player_id, actionBoardSelections);
            
        },

        createActionBoardSelections: function(player_id, actionBoardSelections) {
            for (let selectionDivID in actionBoardSelections) 
            {
                //only manipulate the action board of this player
                if (actionBoardSelections[selectionDivID]['player_id'] != player_id) continue;

                if (actionBoardSelections[selectionDivID]['selected'] == true) {
                    $(selectionDivID).classList.add('selected');
                }
                else {
                    $(selectionDivID).classList.remove('selected');
                }
            }
        },

        createPlayerTableau: function(player, hands, actionBoardSelections) {
            document.getElementById('tableauContainer').insertAdjacentHTML('afterbegin', `
            <DIV id="tableau_${player.player_id}" class = "tableau">
                <SPAN id="tableauLabel_${player.player_id}" class="tableauLabel ${player.color_name}">${player.player_name}</SPAN>
                <DIV id="tableauCardContainer_${player.player_id}" class="cardRow tableauCardContainer"></DIV>
            </DIV>`);

            this.createPlayerActionBoard(player, actionBoardSelections);

            playerHand = this.ttUtility.getPlayerHand(player.player_id, hands);
            this.createPlayerHand(player, playerHand);
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

            resourcePlayer = document.querySelectorAll('.resource');
            resourcePlayer.forEach(resource => {         
                resource.addEventListener('click', (e) => this.ttEventHandlers.onPlayerResourceBankClick.call(this,e.target.id));
            });
        },

        

        createPlayerHand: function(player, hand) 
        {
            //if player has no cards, return
            if (Object.keys(hand).length == 0) { return; }

            let count =0;

            //use custom sort function to sort by card type - first by color, then by action
            Object.values(hand).sort((a, b) => {
                //debugger;
                const cardDataA = this.ttUtility.getCardDataFromType(a);
                const cardDataB = this.ttUtility.getCardDataFromType(b);
                
                if (cardDataA.color === cardDataB.color) {
                    return cardDataA.action.localeCompare(cardDataB.action);
                }
                return cardDataA.color.localeCompare(cardDataB.color);
            }).forEach(card => {
                document.getElementById('tableauCardContainer_' + player.player_id).insertAdjacentHTML('beforeend', `
                    <div id="cardTarget_${player.player_id}_${count}" class="cardTarget addSpace">
                        <div id="card_${card.id}" class="card" style="background-position-x: ${-80 * card.id}px;"></div>
                    </div>`);
                    //debugger;

                    //add active class if card is active
                    if (this.cardStatuses[parseInt(card.type_arg)] == 'active') {
                        $('card_'+card.id).classList.add('active');
                    }

                    //add exhausted class if card is exhausted
                    if (this.cardStatuses[parseInt(card.type_arg)] == 'exhausted') {
                        $('card_'+card.id).classList.add('exhausted');
                    }

                    //add event listener.
                    $('card_'+card.id).addEventListener('click', (e) => this.ttEventHandlers.onCardClick.call(this,e.target.id));
                    count++;
            });
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
                case 'selectAction':
                    //debugger;
                    this.updateState(args.args);
                    this.clearAllPreviousHighlighting();
                    break;
           
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
                    case 'selectAction':
                        this.addActionButton('actionBtnDoneWithTurn', _('Done with turn'), () => this.bgaPerformAction("actDoneWithTurn"), null, null, 'red'); 
                        break;
                        
                    case 'client_reset':
                        this.addActionButton('actionButtonResetYes', _('Yes'), () => this.ttResetSequence.confirmReset.call(this,true), null, null, 'red');
                        this.addActionButton('actionButtonResetNo', _('No'), () => this.ttResetSequence.confirmReset.call(this,false), null, null, 'red');
                        break;    
                
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods
        
        updateState: function( args )
        {
            const players = args.players;

            //TABLEAU
            for (const player_id in players) 
            {
                const player = players[player_id];

                $('tableau_' + player_id).remove();
                this.createPlayerTableau(player, args.hands, args.actionBoardSelections);
            }

            //move the current player's tableau to the top
            $('tableauContainer').prepend($('tableau_'+this.player_id));

            //PIECES
            document.querySelectorAll('.playingPiece').forEach(piece => piece.remove());
            this.createPieces(players, args.pieces);

            //PLAYER PANELS
            for (const player_id in players) 
            {
                const player = players[player_id];
                $('resourceContainer_'+player_id).remove();
                this.createPlayerPanel(player);
            }

            //STORE
            $('storeRow0').remove();
            $('storeRow1').remove();
            $('resourceRow').remove();
            this.createStoreCards(args.store);
            this.createResourceBank();
        },

        clearTileHighlighting: function()
        {
            //remove tile highlighting
            const tiles = document.querySelectorAll('.tile');
            tiles.forEach(el => el.classList.remove('legalMove'));
        },

        clearAllPreviousHighlighting: function()
        {
            this.clearTileHighlighting();

            //restore action board selections
            this.createActionBoardSelections(this.getActivePlayerId(),
                    this.gamedatas.gamestate.args.actionBoardSelections);
            
            //clear any other highlighting
            const allDivs = document.querySelectorAll('*');
            allDivs.forEach(el => el.classList.remove('highlighted'));
        },

        ///////////////////////////////////////////////////
        //// Player's action
        
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */

       /* SEE ttEventHandlers.js */    

        
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
            dojo.subscribe('moveOrPush', this, "notif_moveOrPush");
            dojo.subscribe('activate', this, "notif_activate");
            dojo.subscribe('gain', this, "notif_gain");
            dojo.subscribe('buy', this, "notif_buy");
            
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
            console.log( notif );
        },
        
        notif_moveOrPush: function( notif )
        {
            console.log( 'notif_moveOrPush' );
            console.log( notif );
           
            
            //animation code?
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call    
        },

        notif_activate: function( notif )
        {
            console.log( 'notif_activate' );
            console.log( notif );
        },

        notif_gain: function( notif )
        {
            console.log( 'notif_gain' );
            console.log( notif );
        },

        notif_buy: function( notif )
        {
            console.log( 'notif_buy' );
            console.log( notif );
        }
   });             
});
