/**
 * Test node.
 */

/**
 * Constructor.
 */
if (typeof node_types == 'undefined') {
    var node_types = {};
}

;node_types.node_test2 = (function() {
    function node(dia, data)
    {
        diagram.node.call(this, dia, data);
    }

    node.prototype = Object.create(diagram.node.prototype);
    node.prototype.constructor = node;

    node.prototype.node_color = '#550000';

    node.prototype.node_input = [
        {'name': 'in-1', 'label': 'Image', 'scope': 'image'},
        {'name': 'in-2', 'label': 'Watermark', 'scope': 'image'},
    ];
    
    node.prototype.node_output = [
        {'name': 'out1-1', 'label': 'Image', 'scope': 'image'},
    ];
    
    return node;
})();

