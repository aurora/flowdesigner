/**
 * Node class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

/**
 * Constructor.
 *
 * @param   object          data                Node configuration.
 */
diagram.node = function(data)
{
    data.input = data.input || [];
    data.output = data.output || [];

    this.data = data;
    this.selected = false;
}

/**
 * Default node width.
 *
 * @type    int
 */
diagram.node.defaultWidth = 250;

/**
 * Default node height.
 *
 * @param   int
 */
diagram.node.defaultHeight = 40;

/**
 * Default connector radius.
 *
 * @type    int
 */
diagram.node.defaultConnectorRadius = 5;

/**
 * Helper function to move node in foreground.
 */
d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

/**
 * Node drag and drop.
 */
diagram.node.onDragDrop = function(dragHandler, dropHandler)
{
    var drag = d3.behavior.drag();

    drag.on('dragstart', function(d) {
        d3.select(this).moveToFront();
    }).on('drag', dragHandler).on('dragend', dropHandler);

    return drag;
}

/**
 * Select the node.
 */
diagram.node.prototype.select = function()
{
    this.selected = true;
}

/**
 * Deselect the node.
 */
diagram.node.prototype.deselect = function()
{
    this.selected = false;
}

/**
 * Toggle the selection of the node.
 */
diagram.node.prototype.toggleSelected = function()
{
    this.selected = !this.selected;
}

/**
 * Returns true if the node is selected.
 */
diagram.node.prototype.selected = function()
{
    return this.selected;
}

/**
 * Add an input connector to the node.
 */
diagram.node.prototype.addInputConnector = function(data)
{
    // this.
}

/**
 * Add an output connector to the node.
 */
diagram.node.prototype.addOutputConnector = function(data)
{
    // this.
}

/**
 * Render node.
 *
 * @param   SVGNode         parent              Parent node.
 */
diagram.node.prototype.render = function(parent)
{
    var cn = Math.max(this.data.input.length, this.data.output.length);
    var me = this;

    var node = parent.data([{'x': this.data.x, 'y': this.data.y}]).append('g').attr('transform', function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    }).attr('cursor', 'move').call(diagram.node.onDragDrop(
        function(d) {
            me.data.x += d3.event.dx;
            me.data.y += d3.event.dy;

            d3.select(this).attr('transform', 'translate(' + me.data.x + ',' + me.data.y + ')');
        },
        function(d) {
            console.log('dropped', d);
        }
    ));

    node.append('rect').attr({
        'width': diagram.node.defaultWidth,
        'height': 30 + cn * 15,
        'stroke': 'black',
        'fill': 'blue',
        'fill-opacity': 0.85,
        'rx': 5,
        'ry': 5,
        'x': 0,
        'y': 0
    });

    node.append('text').text(this.data.label).attr({
        'alignment-baseline': 'hanging',
        'stroke': 'none',
        'fill': 'white',
        'x': 5,
        'y': 5
    });

    // render connectors
    var i, cnt;

    this.data.input.forEach(function(data, idx) {
        var cn = node.append('g').attr('transform', 'translate(' + 10 + ',' + (30 + (idx * 17)) + ')');
        cn.append('circle').attr({
            'cx': 0,
            'cy': 0,
            'r': 6,
            'stroke': 'black',
            'stroke-width': 2,
            'fill': 'white',
            'cursor': 'crosshair'
        });

        cn.append('text').text(data.label).attr({
            'alignment-baseline': 'middle',
            'stroke': 'none',
            'fill': 'white',
            'x': 10,
            'y': 2
        });
    });
}
