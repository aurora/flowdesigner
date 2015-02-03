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
 * @param   array       nodes               Optional array with nodes to render in canvas.
 */
var diagram = function(canvas, nodes)
{
    this.canvas = d3.select(canvas);
    this.nodes = [];

    nodes = nodes || [];

    if (nodes.length > 0) {
        nodes.forEach(function(node) {
            this.addNode(node);
        }, this);
    }
}

/**
 * Connection drag and drop.
 */
diagram.connector.onDragDrop = function(dragHandler, dropHandler)
{
    var drag = d3.behavior.drag();

    drag.on('dragstart', function(d) {
        d3.select(this).moveToFront();
    }).on('drag', dragHandler).on('dragend', dropHandler);

    return drag;
}

/**
 * Add a node to diagram.
 *
 * @param   object      data                Node data.
 */
diagram.prototype.addNode = function(data)
{
    var node = new diagram.node(data);

    this.nodes.push(node);

    node.render(this.canvas);
}

/**
 * Draw node connections.
 *
 * @param   array       data                Connections to draw.
 */
diagram.prototype.addConnections = function(data)
{

}
