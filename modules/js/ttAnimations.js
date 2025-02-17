define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
    return declare("bgagame.ttAnimations", null, 
    { 
        constructor: function()
        {
        
        },

        moveActionCube: function( actionCardDiv, isCancel ) 
        {
            const playerID = this.getActivePlayerId();
            if (isCancel) 
            {
                //move cube back to parking spot. 
                const cubeDiv = $(actionCardDiv).firstChild;
                const spotID = cubeDiv.id.split('_')[2];
                $('actionCubeContainer_' + playerID+'_'+spotID).prepend(cubeDiv);
            }
            else
            {
                //move cube to action card. Which cube is available?
                const cubeNum = $('actionCubeContainer_' + playerID+'_0').hasChildNodes() ? 1 : 0;
                const cubeDiv = $('actionCube_' + playerID+'_'+cubeNum);
                $(actionCardDiv).prepend(cubeDiv);
            }

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