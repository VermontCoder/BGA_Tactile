/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * tactiledf implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * tactiledf.js
 *
 * tactiledf user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter"
],
function (dojo, declare) {
    return declare("bgagame.tactiledf", ebg.core.gamegui, {
        constructor: function(){
            console.log('tactiledf constructor');
              
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

        createBoard: function( gamedatas) {
            console.log( "Creating Board" );

            document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', `<link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">`);
            
            document.getElementById('game_play_area').insertAdjacentHTML('beforeend', `
        <DIV id="ttTopContainer" style="display: flex">
            <DIV id="store" class="store">
                <DIV id="deck" class="deck addSpace"></DIV>
                <DIV id="storeRow1" class="cardRow">
                    <DIV id="store_0" class="cardTarget addSpace">
                        <DIV id="card_11" class="card"></DIV>
                    </DIV>
                    <DIV id="store_1" class="cardTarget addSpace">
                        <DIV id="card_12" class="card"></DIV>
                    </DIV>
                    <DIV id="store_2" class="cardTarget addSpace">
                        <DIV id="card_12" class="card"></DIV>
                    </DIV>
                </DIV>
                <DIV id="storeRow2" class="cardRow">
                    <DIV id="store_4" class="cardTarget addSpace">
                        <DIV id="card_13" class="card"></DIV>
                    </DIV>
                    <DIV id="store_5" class="cardTarget addSpace">
                        <DIV id="card_14" class="card"></DIV>
                    </DIV>
                    <DIV id="store_6" class="cardTarget addSpace">
                        <DIV id="card_15" class="card"></DIV>
                    </DIV>
                </DIV>
                <DIV id="resourceRow" class="cardRow" style="padding-left:5px; padding-right:5px;">
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
                </DIV>
            </DIV> 
            <DIV id="board" class="board"></DIV>
        </DIV>`);
                //debugger;
            Object.values(gamedatas.board).forEach(tile => {
                const tileId = 'tile_' + tile.tile_id;
                const tileClass = 'tile ' +tile.color;

                document.getElementById('board').insertAdjacentHTML('beforeend', '<DIV id="'+tileId+'" class="'+tileClass+'"></DIV>');
            });

                
        
            //     <DIV id="tile_0_0" class="tile greenHome">
            //     </DIV>
            //     <DIV id="tile_0_1" class="tile red">
            //         <DIV id="piece_264_0" class="playingPiece blue"></DIV>
            //     </DIV>
            //     <DIV id="tile_0_2" class="tile blue"></DIV>
            //     <DIV id="tile_0_3" class="tile red"></DIV>
            //     <DIV id="tile_0_4" class="tile red"></DIV>
            //     <DIV id="tile_0_5" class="tile blueHome"></DIV>
            //     <DIV id="tile_1_0" class="tile red"></DIV>
            //     <DIV id="tile_1_1" class="tile red"></DIV>
            //     <DIV id="tile_1_2" class="tile red"></DIV>
            //     <DIV id="tile_1_3" class="tile red"></DIV>
            //     <DIV id="tile_1_4" class="tile red"></DIV>
            //     <DIV id="tile_1_5" class="tile red"></DIV>
            //     <DIV id="tile_2_0" class="tile red"></DIV>
            //     <DIV id="tile_2_1" class="tile red"></DIV>
            //     <DIV id="tile_2_2" class="tile red"></DIV>
            //     <DIV id="tile_2_3" class="tile red"></DIV>
            //     <DIV id="tile_2_4" class="tile red"></DIV>
            //     <DIV id="tile_2_5" class="tile red"></DIV>
            //     <DIV id="tile_3_0" class="tile red"></DIV>
            //     <DIV id="tile_3_1" class="tile red"></DIV>
            //     <DIV id="tile_3_2" class="tile red"></DIV>
            //     <DIV id="tile_3_3" class="tile red"></DIV>
            //     <DIV id="tile_3_4" class="tile red"></DIV>
            //     <DIV id="tile_3_5" class="tile red"></DIV>
            //     <DIV id="tile_4_0" class="tile red"></DIV>
            //     <DIV id="tile_4_1" class="tile red"></DIV>
            //     <DIV id="tile_4_2" class="tile red"></DIV>
            //     <DIV id="tile_4_3" class="tile red"></DIV>
            //     <DIV id="tile_4_4" class="tile red"></DIV>
            //     <DIV id="tile_4_5" class="tile red"></DIV>
            //     <DIV id="tile_5_0" class="tile redHome"></DIV>
            //     <DIV id="tile_5_1" class="tile red"></DIV>
            //     <DIV id="tile_5_2" class="tile red"></DIV>
            //     <DIV id="tile_5_3" class="tile red"></DIV>
            //     <DIV id="tile_5_4" class="tile red"></DIV>
            //     <DIV id="tile_5_5" class="tile yellowHome"></DIV>
            // </DIV>
        
        document.getElementById('game_play_area').insertAdjacentHTML('beforeend',
             `<DIV id="tableauContainer" class="tableauContainer"></DIV>`);
        },

        createPlayerTableau: function(player_id) {
            document.getElementById('tableauContainer').insertAdjacentHTML('beforeend', `
            <DIV id="tableau_${player_id}" class = "tableau">
                <SPAN id="tableauLabel_${player_id}" class="tableauLabel">Player ${player_id}</SPAN>
                <DIV id="tableauCardContainer_${player_id}" class="cardRow tableauCardContainer">
                    <DIV id="actionBoard_${player_id}" class="actionBoard"></DIV>
                    <DIV id="cardTarget_${player_id}_0" class="cardTarget addSpace">
                        <DIV id="card_9" class="card"></DIV>
                    </DIV>
                </DIV>
            </DIV>`);
        },

        createPlayerPanel: function(player_id) 
        {
            this.getPlayerPanelElement(player_id).insertAdjacentHTML('beforeend', `
                <DIV id="resourceContainer_${player_id}" class="resourceContainer">   
                    <DIV id="redResourceLabel_${player_id}" class="red resource addSpaceSmall"></DIV>
                    <DIV id="redResource_${player_id}" class="resourceAmount"> : 0 </DIV>
                    <DIV id="blueResourceLabel_${player_id}" class="blue resource addSpaceSmall"></DIV>
                    <DIV id="blueResource_${player_id}" class="resourceAmount"> : 0 </DIV>
                    <DIV id="greenResourceLabel_${player_id}" class="green resource addSpaceSmall"></DIV>
                    <DIV id="greenResource_${player_id}" class="resourceAmount"> : 0 </DIV>
                    <DIV id="yellowResourceLabel_${player_id}" class="yellow resource addSpaceSmall"></DIV>
                    <DIV id="yellowResource_${player_id}" class="resourceAmount"> : 0 </DIV>
                </DIV>
            `);
        },
        
        setup: function( gamedatas )
        {
            console.log( "Starting game setup" );
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            this.createBoard(gamedatas);
            
            // Setting up player boards
            Object.values(gamedatas.players).forEach(player => {
               this.createPlayerPanel(player.id);
               this.createPlayerTableau(player.id);
            });
            
            // TODO: Set up your game interface here, according to "gamedatas"
            
 
            

            console.log( "Ending game setup" );
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
                 case 'playerTurn':    
                    const playableCardsIds = args.playableCardsIds; // returned by the argPlayerTurn

                    // Add test action buttons in the action status bar, simulating a card click:
                    playableCardsIds.forEach(
                        cardId => this.addActionButton(`actPlayCard${cardId}-btn`, _('Play card with id ${card_id}').replace('${card_id}', cardId), () => this.onCardClick(cardId))
                    ); 

                    this.addActionButton('actPass-btn', _('Pass'), () => this.bgaPerformAction("actPass"), null, null, 'gray'); 
                    break;
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
                  your tactiledf.game.php file.
        
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
            console.log( notif );
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
