/**
 * Main diagram class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

/**
 * Constructor.
 *
 * @param   mixed       canvas              Canvas selector.
 */
var diagram = function(canvas)
{
    this.canvas = d3.select(canvas);
    this.nodes = [];

    // build layers: node, connections

    this.layers = {
        'wires': this.canvas.append('g'),
        'nodes': this.canvas.append('g'),
    };
}

/**
 * Return layer of specified name. Returns the canvas node if no layer name
 * is specified.
 *
 * @param   string      name                Name of layer to get.
 * @return  node                            Layer node.
 */
diagram.prototype.getLayer = function(name)
{
    return (typeof name !== 'undefined'
            ? this.layers[name]
            : this.canvas);
}

/**
 * Add multiple nodes.
 * 
 * @param   array       nodes               Array of nodes.
 */
diagram.prototype.addNodes = function(nodes)
{
    nodes.forEach(function(data) {
        this.addNode(data);
    }, this);
}

/**
 * Add a single node to diagram.
 *
 * @param   object      data                Node data.
 */
diagram.prototype.addNode = function(data)
{
    var node = new node_types[data.node](this, data);

    this.nodes.push(node);

    node.render(this.getLayer('nodes'));
}
