/**
 * Connector class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

/**
 * Constructor.
 *
 * @param   int             x                   X-Position of connector.
 * @param   int             y                   Y-Position of connector.
 * @param   object          data                Connector data.
 */
diagram.connector = function(x, y, data)
{
    this.x = x;
    this.y = y;

    this.data = data;
}

/**
 * Render connector.
 */
diagram.connector.prototype.render = function()
{

}