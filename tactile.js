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
    g_gamethemeurl + "modules/js/ttPushSequence.js",
    g_gamethemeurl + "modules/js/ttGainSequence.js",
    g_gamethemeurl + "modules/js/ttBuySequence.js",
    g_gamethemeurl + "modules/js/ttSwapSequence.js",
    g_gamethemeurl + "modules/js/ttResetSequence.js",
    g_gamethemeurl + "modules/js/ttConvert.js",
    g_gamethemeurl + "modules/js/ttDoneWithTurnSequence.js",
    g_gamethemeurl + "modules/js/ttUndoSequence.js"
],

function (dojo, declare) {
    return declare("bgagame.tactile", ebg.core.gamegui, {
        constructor: function(){
            console.log('tactile constructor');

            this.ttUtility = new bgagame.ttUtility();
            this.ttEventHandlers = new bgagame.ttEventHandlers();
            this.ttMoveSequence = new bgagame.ttMoveSequence();
            this.ttPushSequence = new bgagame.ttPushSequence();
            this.ttGainSequence = new bgagame.ttGainSequence();
            this.ttBuySequence = new bgagame.ttBuySequence();
            this.ttSwapSequence = new bgagame.ttSwapSequence();
            this.ttResetSequence = new bgagame.ttResetSequence();
            this.ttAnimations = new bgagame.ttAnimations();
            this.ttConvert = new bgagame.ttConvert();
            this.ttDoneWithTurnSequence = new bgagame.ttDoneWithTurnSequence();
            this.ttUndoSequence = new bgagame.ttUndoSequence();

            this.cardStatuses = { 0: 'inactive', 1: 'active', 2: 'exhausted' };
            // Attach the resize event listener
            window.addEventListener('resize', this.handleResize);
            
            // Call the function initially to set the correct class on page load
            this.handleResize();
        },
        
       
        isMobile: function () {
            const minWidth = 768; // Minimum width for desktop devices
            return window.innerWidth < minWidth || screen.width < minWidth;
            },
        
            
        handleResize: function() {
            // This switches to mobile at 1030px width instead of 990px as is default.
            setTimeout(() => {
                const body = document.getElementById('ebd-body');
                if (window.innerWidth < 1035) {
                    body.classList.add('mobile_version');
                    body.classList.remove('desktop_version');
                } else {
                    body.classList.remove('mobile_version');
                    body.classList.add('desktop_version');
                }
            }, 1); // Use a timeout to ensure the class is added after the resize event
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

            if (this.isMobile()) {
                console.log("Mobile device detected");
                $('game_play_area').classList.add('mobileDeviceScale');
              } else {
                console.log("Desktop device detected");
              }
            

            // (see "setupNotifications" method below)
            this.setupNotifications();

            this.createHeader();
            this.createTopAndTableauContainer();
            this.createStore(gamedatas.store);
            this.createBoard(gamedatas.board, gamedatas.playerHomes);
            this.createPieces(gamedatas.players, gamedatas.pieces);

           
            const playersInOrder = this.getPlayersInPlayOrder(gamedatas.players);

            for(i=0; i < playersInOrder.length; i++)
            {
                const player = playersInOrder[i];
                //create player panel and tableau
                this.createPlayerPanel(player);
                this.createPlayerTableau(player, gamedatas.hands, gamedatas.actionBoardSelections);
            }
            
            //move the current player's tableau to the top
            // if (! this.isSpectator)
            // {
            //     let currentPlayerTableau = document.querySelector('#tableau_'+this.player_id);
            //     let tableauContainer = document.querySelector('#tableauContainer');

            //     tableauContainer.prepend(currentPlayerTableau);
            // }

            //set color blind preference
            if (this.getGameUserPreference(100) == 1)
            {
                document.querySelector(':root').style.setProperty('--num-tiles-to-offset', 8);
            }
            
            console.log( "Ending game setup" );
            //console.log(gamedatas.legalActions);
        },

        getPlayersInPlayOrder: function(players)
        {
             //create player tableaus in order
             var playersInOrder = [];
             var topPlayerNo = -1; 
             
             if (this.isSpectator) {
                 topPlayerNo = 0;
             }
             else
             {
                 topPlayerNo = parseInt(players[this.player_id].player_no) -1;
             }
 
             const numPlayers = Object.keys(players).length;
             //playerNo is 1-indexed, so we need to add 1 to get the index in the loop below.
             for (let i = 0; i < numPlayers; i++) {
                 let playerNo = (topPlayerNo + i) % numPlayers + 1;
                 playersInOrder.push(this.findPlayerByPlayerNo(playerNo, players));
             }

             return playersInOrder;
        },
        //used in above
        findPlayerByPlayerNo: function(player_no, players) {
            for (const player_id in players) {
                if (players[player_id].player_no == player_no) {
                    return players[player_id];
                }
            }
            return null; // Player not found
        },

        createHeader: function() {
            //fonts
            document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', `<link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">`);
        },
        
        createTopAndTableauContainer: function() {
            document.getElementById('game_play_area').insertAdjacentHTML('beforeend', `
            <DIV id="ttTopContainer" style="display: flex;"></DIV>
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
            
            const tileDim = 75+2; //75px tile size + 1px margin
            var count =0;
            Object.values(tiles).forEach(tile => {
                const tileId = 'tile_' + tile.tile_id;
                const tileClass = 'tile ' +tile.color + (playerHomes[tile.tile_id] ? playerHomes[tile.tile_id] + 'Home' : '');
                const xCoord = tile.tile_id.substring(0,1);
                const yCoord = tile.tile_id.substring(2,3);
                const leftPos = (parseInt(xCoord) * tileDim) +10 + 'px';
                const topPos = (parseInt(yCoord) * tileDim) + 10 + 'px';
                document.getElementById('board').insertAdjacentHTML('beforeend', '<DIV id="'+tileId+'" class="'+tileClass+'"></DIV>');
                $(tileId).style.left = leftPos;
                $(tileId).style.top = topPos;
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
                <DIV id="action_${player.player_id}_move" class="actionBoardSelectionTarget" style="top:34px; left:11px;">
                    <DIV id="action_${player.player_id}_move_text" style="position:absolute; top:0px; left:26px; height:25px; width:92px;"></DIV>
                </DIV>
                <DIV id="action_${player.player_id}_gain" class="actionBoardSelectionTarget" style="top:62px; left:11px;">
                    <DIV id="action_${player.player_id}_gain_text" style="position:absolute; top:0px; left:35px; height:25px; width:92px;"></DIV>
                </DIV>
                <DIV id="action_${player.player_id}_buy" class="actionBoardSelectionTarget" style="top:90px; left:11px;">
                    <DIV id="action_${player.player_id}_buy_text" style="position:absolute; top:0px; left:35px; height:25px; width:92px;"></DIV>
                </DIV>
                <DIV id="action_${player.player_id}_swap" class="actionBoardSelectionTarget" style="top:118px; left:11px;">
                    <DIV id="action_${player.player_id}_swap_text" style="position:absolute; top:0px; left:35px; height:25px; width:92px;"></DIV>
                </DIV>
                <DIV id="action_${player.player_id}_reset" class="actionBoardSelectionTarget" style="top:146px; left:11px;">
                    <DIV id="action_${player.player_id}_reset_text" style="position:absolute; top:0px; left:35px; height:25px; width:92px;"></DIV>
                </DIV>
            </DIV>`);

            //click handlers
            const actionBoardChoices = document.querySelectorAll('#actionBoard_'+player.player_id+' .actionBoardSelectionTarget');
            actionBoardChoices.forEach(choice => {         
                 choice.addEventListener('click', (e) => 
                 {
                    var targetID = e.target.id;

                    //handle case where the text div is clicked instead of the parent div
                    //should look like coming from the parent div.
                    if (targetID.indexOf('_text') > -1) {
                        targetID = targetID.substring(0, targetID.indexOf('_text'));
                    }
                    this.ttEventHandlers.onActionBoardClick.call(this,targetID);
                 });
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
        },

        createPlayerTableau: function(player, hands, actionBoardSelections) {

            var teamHTML = '';
            if (Object.keys(this.gamedatas.players).length == 4)
            {
                //show team colors
                teamHTML = this.ttUtility.getTeamIconHTML.call(this,player.color_name);
            }

            document.getElementById('tableauContainer').insertAdjacentHTML('beforeend', `
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
                    ${teamHTML}
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

                if (Object.keys(this.gamedatas.players).length == 4)
                {
                    //show team colors
                    teamHTML = this.ttUtility.getTeamIconHTML.call(this,player.color_name);

                    const scoreDivSelector = '#player_board_'+player.player_id +' > .player_score';
                    const scoreDiv = document.querySelector(scoreDivSelector);
                    
                    //if we haven't already, add the team icons. Other parts of the player board are typically destroyed.
                    if (!document.querySelector(scoreDivSelector + ' > .icon'))
                    {
                        scoreDiv.insertAdjacentHTML('beforeEnd', teamHTML);
                    }
                }
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
                case 'chooseStartTile':
                    //highlight the tiles that can be chosen
                    if (this.isCurrentPlayerActive())
                    {
                        Object.keys(args.args.playerHomes).forEach((location) => {
                            $(`tile_${location}`).classList.add('legalMove');
                        });
                    }

                    this.pregameColors();
                    break;
                case 'selectAction':
                    this.clearAllPreviousHighlighting();
                    this.eventOrigin = '';

                    //if its the start of turn (no action cubes placed) 
                    if (this.ttUtility.getNumActionBoardActionsSelected.call(this) == 0)
                    {
                        //reset the action board.
                        this.ttAnimations.doActionCubeReset.call(this);

                        //to facilitate a clean animation, remove these classes here.
                        const elements = $('tableauCardContainer_'+this.getActivePlayerId()).querySelectorAll('.active, .exhausted');

                        // Iterate over the all the cards and remove the classes
                        elements.forEach(element => { element.classList.remove('active', 'exhausted'); });
                    }

                    setTimeout(()=>this.updateState(args.args), this.ttAnimations.animationDuration+100);
                    break;

                case 'EndScore':
                    this.clearAllPreviousHighlighting();
                    setTimeout(()=>this.updateState(args.args), this.ttAnimations.animationDuration+100);
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
                        //add alternate selection buttons
                        this.addActionBoardActionButtons();
                        this.addActionButton('actionBtnConvert', _('Convert'), () => this.ttConvert.beginConvert.call(this), null, null, 'blue');
                         //undo
                        if (args.undoOk == 1)
                        {
                            this.addActionButton('actionBtnUndo', _('Undo to '+args.undoPoint), () => this.ttUndoSequence.beginUndo.call(this,args.undoPoint), null, null, 'red');
                        }
                        
                        this.addActionButton('actionBtnDoneWithTurn', _('Done with turn'), () => this.ttDoneWithTurnSequence.beginDoneWithTurn.call(this), null, null, 'red'); 
            
                        break;
                    
                    case 'client_reset':
                        this.addActionButton('actionButtonResetYes', _('Yes'), () => this.ttResetSequence.confirmReset.call(this,true), null, null, 'blue');
                        this.addActionButton('actionButtonResetNo', _('No'), () => this.ttResetSequence.confirmReset.call(this,false), null, null, 'red');
                        break;

                    case 'client_undo':
                        this.addActionButton('actionButtonUndoYes', _('Yes'), () => this.ttUndoSequence.confirmUndo.call(this,true), null, null, 'blue');
                        this.addActionButton('actionButtonUndoNo', _('No'), () => this.ttUndoSequence.confirmUndo.call(this,false), null, null, 'red');
                        break;

                    case 'client_doneWithTurn':
                        this.addActionButton('actionButtonDoneWithTurnYes', _('Yes'), () => this.ttDoneWithTurnSequence.confirmDoneWithTurn.call(this,true), null, null, 'blue');
                        this.addActionButton('actionButtonDoneWithTurnNo', _('No'), () => this.ttDoneWithTurnSequence.confirmDoneWithTurn.call(this,false), null, null, 'red');
                        break;
                    
                    case 'client_swapSelectLoss':
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

                        case 'client_selectResource':
                        case 'client_selectTileMove':
                        case 'client_selectTilePush':
                        case 'client_selectGain':
                        case 'client_swapSelectGain':
                        case 'client_swapSelectLossCard':
                        case 'client_selectPieceMove':
                        case 'client_selectPiecePush':
                        case 'client_buyCard':
                        case 'client_convert':
                            this.addActionButton('actionBtnCancel', _('Cancel'), () => this.restoreServerGameState(), null, null, 'red'); 
                            break;

                        case 'client_selectConvertAction':
                            this.addActionButton('actionBtnConvertMove', _('Move'), () => this.ttMoveSequence.beginMove.call(this), null, null, null);
                            this.addActionButton('actionBtnConvertPush', _('Push'), () => this.ttPushSequence.beginPush.call(this), null, null, null);
                            this.addActionButton('actionBtnConvertGain', _('Gain'), () => this.ttGainSequence.beginGain.call(this), null, null, null);
                            this.addActionButton('actionBtnConvertBuy', _('Buy'), () => this.ttBuySequence.beginBuy.call(this), null, null, null);
                            this.addActionButton('actionBtnConvertSwap', _('Swap'), () => this.ttSwapSequence.beginSwap.call(this), null, null, null);
                            this.addActionButton('actionBtnConvertReset', _('Reset'),() => this.ttResetSequence.beginReset.call(this), null, null, null);
                            this.addActionButton('actionBtnCancelConvert', _('Cancel'), () => this.restoreServerGameState(), null, null, 'red'); 
                            break;
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods

        addActionBoardActionButtons()
        {
            const selectedActions = this.ttUtility.getActionBoardSelections.call(this);
            if ( selectedActions.length < 2){
                for (const curAction of ['move', 'gain', 'buy', 'swap', 'reset']) { 
                    const curActionId = 'action_'+this.getActivePlayerId()+'_'+curAction;
                    if (!selectedActions.includes(curActionId)) {
                        const curActionTitle = String(curAction).charAt(0).toUpperCase() +String(curAction).slice(1);
                        this.addActionButton('actionBtnMobileAlt' + curActionTitle, _(curActionTitle), () => this.ttEventHandlers.onActionBoardClick.call(this,curActionId), null, null, null);
                    }
                } 
            }
        },
        
        updateState: function( args )
        {
            const players = args.players;

            playersInOrder = this.getPlayersInPlayOrder(players);
            
            for(i=0; i < playersInOrder.length; i++)
            {
                const player = playersInOrder[i];

                $('tableau_' + player.player_id).remove();
                this.createPlayerTableau(player, args.hands, args.actionBoardSelections);
            }

            //move the current player's tableau to the top
            //if (! this.isSpectator) $('tableauContainer').prepend($('tableau_'+this.player_id));

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

        pregameColors: function()
        {
            document.querySelectorAll('.player-name > a').forEach(playerName => playerName.style.color = 'black');
            document.querySelectorAll('.tableauLabel').forEach(label => label.classList.add('notColored'));
            document.querySelector('.playername').style.color = 'black';
            document.querySelector('.playername').style.backgroundColor = 'inherit';
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
            dojo.subscribe('chooseStartTile', this, "notif_chooseStartTile");
            dojo.subscribe('allyAssignment', this, "notify_allyAssignment");
            dojo.subscribe('move', this, "notif_move");
            dojo.subscribe('push', this, "notif_push");
            dojo.subscribe('activate', this, "notif_activate");
            dojo.subscribe('gain', this, "notif_gain");
            dojo.subscribe('buy', this, "notif_buy");
            dojo.subscribe('swap', this, "notif_swap");
            dojo.subscribe('swapCard', this, "notif_swapCard");
            dojo.subscribe('reset', this, "notif_reset");
            dojo.subscribe('goalAchieved', this, "notif_goalAchieved");
            dojo.subscribe('messageInfo', this, "notif_messageInfo");
            dojo.subscribe('endGame', this, "notif_endGame");
        },  

        // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call    
        notif_showVariable: function( notif )
        {
            console.log( notif );
        },
        
        notif_chooseStartTile: function( notif )
        {
            console.log( 'notif_chooseStartTile' );
            console.log( notif );

            //during replays, we don't want to reload the page because it gets stuck in an infinite loop..
            if (window.location.href.indexOf('replay') > -1) return;
            //once the player colors are chosen, all the player colors are wrong, and it seems
            //that only a full reload fixes everything in the framework.
            
            location.reload();
        },

        notify_allyAssignment: function( notif )
        {
            console.log( 'notify_allyAssignment' );
            console.log( notif );

            //during replays, we don't want to reload the page because it gets stuck in an infinite loop..
            // if (window.location.href.indexOf('replay') > -1) return;
            // location.reload();
        },

        notif_move: function( notif )
        {
            console.log( 'notif_move' );
            console.log( notif );
           
            this.ttAnimations.movePiece.call(this, notif.args.piece_id, notif.args.tileID);

            //if convert, there will be multiple origins
            const origins = notif.args.origin.split(',');
            origins.forEach(origin => this.ttUtility.notifCardExhaustionCheck( origin) );
        },

        notif_push: function( notif )
        {
            console.log( 'notif_push' );
            console.log( notif );
           
            this.ttAnimations.movePiece.call(this, notif.args.piece_id, notif.args.tileID);

            //if convert, there will be multiple origins
            const origins = notif.args.origin.split(',');
            origins.forEach(origin => this.ttUtility.notifCardExhaustionCheck( origin) );
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

            //if convert, there will be multiple origins
            const origins = notif.args.origin.split(',');
            origins.forEach(origin => this.ttUtility.notifCardExhaustionCheck( origin) );

            const resourceDivQtyID = notif.args.color+'Resource_'+notif.args.player_id;
            this.ttAnimations.moveResource.call(this, notif.args.color, notif.args.player_id, true);
            this.ttAnimations.qtyChangeAnimation.call(this, resourceDivQtyID, 1, this.ttAnimations.animationDuration);
        },

        notif_buy: function( notif )
        {
            console.log( 'notif_buy' );
            console.log( notif );

            //if convert, there will be multiple origins
            const origins = notif.args.origin.split(',');
            origins.forEach(origin => this.ttUtility.notifCardExhaustionCheck( origin) );

            if (!notif.args.isStoreReset)
            {
                this.ttAnimations.buyCardAnim.call(this, notif.args.card, notif.args.newCard, notif.args.player_id);
            }
            else
            {
                //console.log('Reset new cards:', notif.args.newCards);
                this.ttAnimations.buyAndResetAnim.call(this, notif.args.card, notif.args.newCard, notif.args.player_id, notif.args.newCards);
            }
        },

        notif_swap: function( notif )
        {
            console.log( 'notif_swap' );
            console.log( notif );

            //if convert, there will be multiple origins
            const origins = notif.args.origin.split(',');
            origins.forEach(origin => this.ttUtility.notifCardExhaustionCheck( origin) );

            const resourceDivQtyGainID = notif.args.gainColor+'Resource_'+notif.args.player_id;
            const resourceDivQtyLossID = notif.args.lossColor+'Resource_'+notif.args.player_id;
            this.ttAnimations.moveResource.call(this, notif.args.gainColor, notif.args.player_id, true);
            this.ttAnimations.moveResource.call(this, notif.args.lossColor, notif.args.player_id, false);
            this.ttAnimations.qtyChangeAnimation.call(this, resourceDivQtyGainID, 1, this.ttAnimations.animationDuration);
            this.ttAnimations.qtyChangeAnimation.call(this, resourceDivQtyLossID, -1, this.ttAnimations.animationDuration);
        },

        notif_swapCard: function( notif )
        {
            console.log( 'notif_swapCard' );
            console.log( notif );

            this.ttAnimations.swapCardsAnim.call(this, notif.args.gainCardData, notif.args.lossCardData, notif.args.player_id, notif.args.ally_id);
        },

        notif_reset: function( notif )
        {
            console.log( 'notif_reset' );
            console.log( notif );

            //if convert, there will be multiple origins
            const origins = notif.args.origin.split(',');
            origins.forEach(origin => this.ttUtility.notifCardExhaustionCheck( origin) );
            
            //special rule reset on a buy is handled in the buy animation.
            if (!notif.args.specialRuleReset)
            {
                this.ttAnimations.resetAnim.call(this, notif.args.newCards);
            }
                
        },

        notif_goalAchieved: function( notif )
        {
            console.log( 'notif_goalAchieved' );
            console.log( notif );

            this.scoreCtrl[notif.args.player_id].setValue(notif.args.score);
            $(notif.args.piece_id).classList.add('scoring');

            if (notif.args.ally_id != null)
            {
                this.scoreCtrl[notif.args.ally_id].setValue(notif.args.ally_score);
            }
        },

        notif_skipTurn(notif)
        {
            console.log( 'notif_skipTurn' );
            console.log( notif );
        },
        
        notif_messageInfo: function(notif) 
        {
            const message = this.format_string_recursive(notif.log, notif.args.message);
            this.showMessage( message, notif.args.severity); 
        },

        notif_endGame: function( notif )
        {
            console.log( 'notif_endGame' );
            console.log( notif );

            this.updateState(notif.args);
        },
   });             
});
