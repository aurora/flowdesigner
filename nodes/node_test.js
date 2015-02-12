/**
 * Test node.
 */

/**
 * Constructor.
 */
if (typeof node_types == 'undefined') {
    var node_types = {};
}

;node_types.node_test = (function() {
    function node(dia, data)
    {
        diagram.node.call(this, dia, data);
    }

    node.prototype = Object.create(diagram.node.prototype);
    node.prototype.constructor = node;

    node.prototype.onClick = function(d) {
        console.log('click', d);
    }
    node.prototype.onDblClick = function(d) {
        console.log('dblclick', d);
    }

    node.prototype.node_input = [
        {'name': 'in-1', 'label': 'Image', 'scope': 'image'},
        {'name': 'in-2', 'label': 'Control', 'scope': 'ctrl'}
    ];
    
    node.prototype.node_output = [
        {'name': 'out1-1', 'label': 'Image', 'scope': 'image'},
        {'name': 'out1-2', 'label': 'Control', 'scope': 'ctrl'}
    ];
    
    return node;
})();

