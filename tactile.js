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
            var count =0;
            var rowCount = 0;

            storeData = this.ttUtility.sortCards(Object.values(storeData));

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
                                <DIV id="storecard_back_${card.id}" class="storecard back"></DIV>
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
                <DIV id="action_${player.player_id}_move" class="actionBoardSelectionTarget" style="top:34px; left:11px;"></DIV>
                <DIV id="action_${player.player_id}_gain" class="actionBoardSelectionTarget" style="top:62px; left:11px;"></DIV>
                <DIV id="action_${player.player_id}_buy" class="actionBoardSelectionTarget" style="top:90px; left:11px;"></DIV>
                <DIV id="action_${player.player_id}_swap" class="actionBoardSelectionTarget" style="top:118px; left:11px;"></DIV>
                <DIV id="action_${player.player_id}_reset" class="actionBoardSelectionTarget" style="top:146px; left:11px;"></DIV>
            </DIV>`);

            //click handlers
            const actionBoardChoices = document.querySelectorAll('#actionBoard_'+player.player_id+' .actionBoardSelectionTarget');
            actionBoardChoices.forEach(choice => {         
                 choice.addEventListener('click', (e) => this.ttEventHandlers.onActionBoardClick.call(this,e.target.id));
            });

            this.createActionBoardSelections(player.player_id, actionBoardSelections);
            
        },

        createActionBoardSelections: function(player_id, actionBoardSelections) {
            var numSelections = 0;
            for (let selectionDivID in actionBoardSelections) 
            {
                //only manipulate the action board of this player
                if (actionBoardSelections[selectionDivID]['player_id'] != player_id) continue;

                if (actionBoardSelections[selectionDivID]['selected'] == true) {
                    $(selectionDivID).prepend($('actionCube_'+player_id+'_'+numSelections));
                    numSelections++;
                }
            }

            // //if there is a cube on the action board, there should be no cube in parking.
            // for(i=0;i<numSelections;i++) 
            // {
            //     $('actionCube_'+player_id+'_'+i).classList.add('unselected');
            // }
        },

        createPlayerTableau: function(player, hands, actionBoardSelections) {
            document.getElementById('tableauContainer').insertAdjacentHTML('afterbegin', `
            <DIV id="tableau_${player.player_id}" class = "tableau">
                <DIV id="tableauTopRowContainer_${player.player_id}" class="cardRow tableauTopRowContainer">
                    <SPAN id="tableauLabel_${player.player_id}" class="tableauLabel ${player.color_name}">${player.player_name}</SPAN>
                    <DIV id="actionCubeBorder_${player.player_id}_0" class="actionCubeBorder">
                        <DIV id="actionCubeContainer_${player.player_id}_0" class="actionCubeContainer">
                            <DIV id="actionCube_${player.player_id}_0" class="actionCube"></DIV>
                        </DIV>
                    </DIV>
                    <DIV id="actionCubeBorder_${player.player_id}_1" class="actionCubeBorder">
                        <DIV id="actionCubeContainer_${player.player_id}_1" class="actionCubeContainer">
                            <DIV id="actionCube_${player.player_id}_1" class="actionCube"></DIV>
                        </DIV>
                    </DIV>
                </DIV>
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
                    <DIV id="redResource_${player.player_id}" class="playerPanelNumber"> : ${player.red_resource_qty} </DIV>
                    <DIV id="blueResourceLabel_${player.player_id}" class="blue resource addSpaceSmall"></DIV>
                    <DIV id="blueResource_${player.player_id}" class="playerPanelNumber"> : ${player.blue_resource_qty} </DIV>
                    <DIV id="greenResourceLabel_${player.player_id}" class="green resource addSpaceSmall"></DIV>
                    <DIV id="greenResource_${player.player_id}" class="playerPanelNumber"> : ${player.green_resource_qty} </DIV>
                    <DIV id="yellowResourceLabel_${player.player_id}" class="yellow resource addSpaceSmall"></DIV>
                    <DIV id="yellowResource_${player.player_id}" class="playerPanelNumber"> : ${player.yellow_resource_qty} </DIV>
                </DIV>`);
            

                this.scoreCtrl[player.player_id] = new ebg.counter();
                this.scoreCtrl[player.player_id].create('player_score_'+player.player_id);
                this.scoreCtrl[player.player_id].setValue(player.player_score);
                $('player_score_'+player.player_id).classList.add('playerPanelNumber');
        },

        

        createPlayerHand: function(player, hand) 
        {
            //if player has no cards, return
            if (Object.keys(hand).length == 0) { return; }

            let count =0;

            //use custom sort function to sort by card type - first by color, then by action
            const sortedCards = this.ttUtility.sortCards(Object.values(hand));
            sortedCards.forEach(card => {
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
                case 'gameEnd':
                case 'selectAction':
                    //debugger;
                    this.clearAllPreviousHighlighting();
                    this.eventOrigin = '';
                    setTimeout(()=>this.updateState(args.args), this.ttAnimations.animationDuration+50);
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
                    case 'client_selectResource':
                    case 'client_selectTile':
                    case 'client_selectGain':
                    case 'client_selectPiece':
                    case 'selectAction':
                        this.addActionButton('actionBtnDoneWithTurn', _('Done with turn'), () => this.bgaPerformAction("actDoneWithTurn"), null, null, 'red'); 
                        break;
                        
                    case 'client_reset':
                        this.addActionButton('actionButtonResetYes', _('Yes'), () => this.ttResetSequence.confirmReset.call(this,true), null, null, 'red');
                        this.addActionButton('actionButtonResetNo', _('No'), () => this.ttResetSequence.confirmReset.call(this,false), null, null, 'red');
                        break;
                    
                    case 'client_swapSelectLose':
                        for (const curColor of args.swappableResources[parseInt(this.getActivePlayerId())]) {
                            const colorIconHTML = this.ttUtility.getColorIconHTML(curColor);
                            const btnMsg = _(curColor.toUpperCase())+'('+colorIconHTML+')';
                            const btnId = 'actionButtonSwapLose_'+curColor;
                            this.statusBar.addActionButton(btnMsg, 
                                () => this.ttSwapSequence.selectSwapLoss.call(this,curColor),
                                {
                                    color: 'secondary',
                                    id: btnId,
                                });
                        }
                        this.statusBar.addActionButton( _('Cancel'), 
                            () => this.ttEventHandlers.cancelActionBoardAction.call(this),
                            {
                                color:'alert',
                                id: 'actionButtonSwapCancel',
                            });
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
            dojo.subscribe('swap', this, "notif_swap");
            dojo.subscribe('reset', this, "notif_reset");
            dojo.subscribe('goalAchieved', this, "notif_goalAchieved");
            dojo.subscribe('endGame', this, "notif_endGame");
        },  

        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call    
        notif_showVariable: function( notif )
        {
            console.log( notif );
        },
        
        notif_moveOrPush: function( notif )
        {
            console.log( 'notif_moveOrPush' );
            console.log( notif );
           
            this.ttAnimations.movePiece.call(this, notif.args.piece_id, notif.args.tileID);

            //exhaust card if it was used.
            if (notif.args.origin.startsWith('card_'))
            {
                $(notif.args.origin).classList.add('exhausted');
            }
            
        },

        notif_activate: function( notif )
        {
            console.log( 'notif_activate' );
            console.log( notif );

            Object.keys(notif.args.activatedCards).forEach(cardID => {
                $('card_'+cardID).classList.add('active');
            });
        },

        notif_gain: function( notif )
        {
            console.log( 'notif_gain' );
            console.log( notif );

            //exhaust card if it was used.
            if (notif.args.origin.startsWith('card_'))
            {
                $(notif.args.origin).classList.add('exhausted');
            }

            const resourceDivQtyID = notif.args.color+'Resource_'+notif.args.player_id;
            this.ttAnimations.moveResource.call(this, notif.args.color, notif.args.player_id, true);
            this.ttAnimations.qtyChangeAnimation.call(this, resourceDivQtyID, 1, this.ttAnimations.animationDuration);
        },

        notif_buy: function( notif )
        {
            console.log( 'notif_buy' );
            console.log( notif );

            this.ttAnimations.buyCardAnim.call(this, notif.args.card, notif.args.newCard, notif.args.player_id);
        },

        notif_swap: function( notif )
        {
            console.log( 'notif_swap' );
            console.log( notif );

            const resourceDivQtyGainID = notif.args.gainColor+'Resource_'+notif.args.player_id;
            const resourceDivQtyLossID = notif.args.lossColor+'Resource_'+notif.args.player_id;
            this.ttAnimations.moveResource.call(this, notif.args.gainColor, notif.args.player_id, true);
            this.ttAnimations.moveResource.call(this, notif.args.lossColor, notif.args.player_id, false);
            this.ttAnimations.qtyChangeAnimation.call(this, resourceDivQtyGainID, 1, this.ttAnimations.animationDuration);
            this.ttAnimations.qtyChangeAnimation.call(this, resourceDivQtyLossID, -1, this.ttAnimations.animationDuration);
        },

        notif_reset: function( notif )
        {
            console.log( 'notif_reset' );
            console.log( notif );

            this.ttAnimations.resetAnim.call(this, notif.args.newCards);
        },

        notif_goalAchieved: function( notif )
        {
            console.log( 'notif_goalAchieved' );
            console.log( notif );

            this.scoreCtrl[notif.args.player_id].setValue(notif.args.score);
        },

        notif_endGame: function( notif )
        {
            console.log( 'notif_endGame' );
            console.log( notif );

            this.updateState(notif.args);
        },
   });             
});
