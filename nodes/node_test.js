/**
 * Test node.
 */

/**
 * Constructor.
 */
define(['../src/node'], function(node) {
    function node_test(dia, data)
    {
        node.call(this, dia, data);
    }

    node_test.prototype = Object.create(node.prototype);
    node_test.prototype.constructor = node;

    node_test.prototype.onClick = function(d) {
        console.log('click', d);
    }
    node_test.prototype.onDblClick = function(d) {
        console.log('dblclick', d);
    }

    node_test.prototype.node_input = [
        {'name': 'in-1', 'label': 'Image', 'scope': 'image'},
        {'name': 'in-2', 'label': 'Control', 'scope': 'ctrl'}
    ];

    node_test.prototype.node_output = [
        {'name': 'out1-1', 'label': 'Image', 'scope': 'image'},
        {'name': 'out1-2', 'label': 'Control', 'scope': 'ctrl'}
    ];

    return node_test;
});
