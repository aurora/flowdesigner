/**
 * Connector class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;diagram.connector = (function() {
    /**
     * Create connection between two connectors.
     */
    function onDragDrop(start)
    {
        var drag = d3.behavior.drag();
        var connection;

        drag.on('dragstart', function(d) {
            connection = new diagram.connection(start);
        
            d3.event.sourceEvent.stopPropagation();
        }).on('drag', function(d) {
            connection.drag(d);
        }).on('dragend', function(d) {
            console.log('connector drag stop', connection);
        });

        return drag;
    }

    /**
     * Constructor.
     *
     * @param   object          data                Connector data.
     */
    function connector(data)
    {
        this.data = data;
        this.node = null;
    }

    /**
     * Test whether connector is connected to some other connector.
     *
     * @return  bool                                Returns true if connector is connected.
     */
    connector.prototype.isConnected = function()
    {
        return false;
    }

    /**
     * Render connector.
     *
     * @param   SVGNode         parent              Parent node.
     * @param   int             x                   X-Position to render connector at.
     * @param   int             y                   Y-Position to render connector at.
     */
    connector.prototype.render = function(parent, x, y)
    {
        this.node = parent.append('g').attr('transform', 'translate(' + x + ',' + y + ')');

        this.node.data([{'x': 0, 'y': 0}]).append('circle').attr({
            'cx': function(d) { return d.x; },
            'cy': function(d) { return d.y; },
            'r': 6,
            'stroke': 'black',
            'stroke-width': 2,
            'fill': 'white',
            'cursor': 'crosshair'
        }).on('mouseover', function() {
            console.log('over connector');
        }).call(onDragDrop(this));

        this.node.append('text').text(this.data.label).attr({
            'alignment-baseline': 'middle',
            'stroke': 'none',
            'fill': 'white',
            'x': 10,
            'y': 2
        });
    }
    
    return connector;
})();
