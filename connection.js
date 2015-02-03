/**
 * Connection class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

/**
 * Constructor.
 *
 * @param   diagram.connector   start           Start connector.
 * @param   diagram.connector   end             Optional end connector.
 */
diagram.connection = function(start, end)
{
    console.log(start.node);

    // this.g = d3.select('#canvas').append

    // create start point of connection
    this.start = {
        x: 0,
        y: 0,
        n: start.node.data([{x: 0, y: 0}]).append('g').attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        })
    }

    this.start.n.append('circle').attr({
        'cx': 0,
        'cy': 0,
        'r': 3,
        'stroke': 'none',
        'fill': '#aaa',
        'cursor': 'move'
    });
    
    // create end point of connection
    this.end = {x: 0, y: 0, n: null};
    
    if (typeof end !== 'undefined') {
        this.end.n = end.node.data([{x: 0, y: 0}]).append('g').attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    } else {
        this.end.n = start.node.data([{x: 0, y: 0}]).append('g').attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    }
    
    this.end.n.append('circle').attr({
        'cx': 0,
        'cy': 0,
        'r': 3,
        'stroke': 'none',
        'fill': '#aaa',
        'cursor': 'move'
    });
}

/**
 * Drag and drop for connection points.
 */
diagram.connection.onDragDrop = function()
{
    var drag = d3.behavior.drag();

    drag.on('dragstart', function(d) {
        d3.select(this).moveToFront();
    }).on('drag', dragHandler).on('dragend', dropHandler);

    return drag;
}

/**
 * Drag connection endpoint.
 */
diagram.connection.prototype.drag = function(d)
{
    // this.end.attr(
    //     'cx': d3.event.dx,
    //     'cy': d3.event.dy
    // );

    // console.log(d);
}

/**
 * Destroy connection.
 */
diagram.connection.prototype.destroy = function()
{

}
