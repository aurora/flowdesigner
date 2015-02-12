/**
 * Test node.
 */

/**
 * Constructor.
 */
define(['../src/node'], function(node) {
    function node_test2(dia, data)
    {
        node.call(this, dia, data);
    }

    node_test2.prototype = Object.create(node.prototype);
    node_test2.prototype.constructor = node;

    node_test2.prototype.node_color = '#550000';

    node_test2.prototype.onClick = function(d) {
        console.log('click', d);
    }
    node_test2.prototype.onDblClick = function(d) {
        console.log('dblclick', d);
    }

    node_test2.prototype.node_input = [
        {'name': 'in-1', 'label': 'Image', 'scope': 'image'},
        {'name': 'in-2', 'label': 'Watermark', 'scope': 'image'},
    ];

    node_test2.prototype.node_output = [
        {'name': 'out1-1', 'label': 'Image', 'scope': 'image'},
    ];

    return node_test2;
});
