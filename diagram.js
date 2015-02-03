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
    // get D3 node of canvas
    this.canvas = d3.select(canvas);

    // build layers: node, connections
    this.layers = {
        'nodes': this.canvas.append('g'),
        'connections': this.canvas.append('g')
    };

    this.nodes = [];
}

/**
 * Return specified layer object. Returns canvas object if no layer name is provided.
 *
 * @param   string      layer               Optional name of layer.
 * @return  Node                            Layer object.
 */
diagram.prototype.getLayer = function(name)
{
    return (typeof name !== 'undefined'
            ? this.layers[name]
            : this.canvas);
}

/**
 * Build diagram from nodes.
 * 
 * @param   array       nodes               Array of nodes.
 */
diagram.prototype.build = function(nodes)
{
    nodes.forEach(function(data) {
        this.addNode(data);
    }, this);
}

/**
 * Add a node to diagram.
 *
 * @param   object      data                Node data.
 */
diagram.prototype.addNode = function(data)
{
    var node = new node_types[data.node](this, data);

    this.nodes.push(node);

    node.render(this.canvas);
}
