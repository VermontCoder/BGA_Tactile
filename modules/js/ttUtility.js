/* Generally useful Utility functions */

define([
    "dojo", "dojo/_base/declare"
], function( dojo, declare )

{
return declare("bgagame.ttUtility", null, { 
        
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


        pickByNestedProperty: function(obj, nestedProp, value) {
            return Object.fromEntries(
                Object.entries(obj).filter(([key, nestedObj]) => nestedObj[nestedProp] === value)
            );
        },
        
    });
});