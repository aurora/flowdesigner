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

    start.node.append('circle').attr({
        'cx': 0,
        'cy': 0,
        'r': 3,
        'stroke': 'none',
        'fill': '#aaa',
        'cursor': 'move'
    });
}

/**
 * Destroy connection.
 */
diagram.connection.prototype.destroy = function()
{

}
