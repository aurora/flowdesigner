/**
 * Connector class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

/**
 * Constructor.
 *
 * @param   object          data                Connector data.
 */
diagram.connector = function(data)
{
    this.data = data;
}

/**
 * Render connector.
 *
 * @param   SVGNode         parent              Parent node.
 * @param   int             x                   X-Position to render connector at.
 * @param   int             y                   Y-Position to render connector at.
 */
diagram.connector.prototype.render = function(parent, x, y)
{
    var cn = parent.append('g').attr('transform', 'translate(' + x + ',' + y + ')');

    cn.data([{'x': x, 'y': y}]).append('circle').attr({
        'cx': 0,
        'cy': 0,
        'r': 6,
        'stroke': 'black',
        'stroke-width': 2,
        'fill': 'white',
        'cursor': 'crosshair'
    });

    cn.append('text').text(this.data.label).attr({
        'alignment-baseline': 'middle',
        'stroke': 'none',
        'fill': 'white',
        'x': 10,
        'y': 2
    });
}
