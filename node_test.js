/**
 * Test node.
 */

/**
 * Constructor.
 */
var node_types = {};

(function() {
    function node(dia, data)
    {
        diagram.node.call(this, dia, data, {
            'input': [
                {'name': 'in-1', 'label': 'Image', 'scope': 'image'},
                {'name': 'in-2', 'label': 'Control', 'scope': 'video'}
            ],
            'output': []
        });
    }

    node.prototype = Object.create(diagram.node.prototype);
    node.prototype.constructor = node;
    
    node_types.node_test = node;
})();

