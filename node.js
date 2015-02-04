/**
 * Node class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;diagram.node = (function() {
    var id = 0;
    
    /**
     * Node drag and drop.
     */
    function onDragDrop(dragHandler, dropHandler)
    {
        var drag = d3.behavior.drag();

        drag.on('dragstart', function(d) {
            d3.select(this).moveToFront();
        }).on('drag', dragHandler).on('dragend', dropHandler);

        return drag;
    }
    
    /**
     * Constructor.
     *
     * @param   diagram         diagram             Diagram instance.
     * @param   object          data                Node configuration.
     */
    function node(dia, data)
    {
        this.diagram = dia;
    
        this.data = data || {};
        this.node = null;
        
        if (!('id' in this.data)) {
            this.data.id = 'node-' + (++id);
        }
    }

    /**
     * Input connectors.
     *
     * @type    array
     */
    node.prototype.node_input = [];

    /**
     * Output connectors.
     *
     * @type    array
     */
    node.prototype.node_output = [];

    /**
     * Width.
     *
     * @type    int
     */
    node.prototype.node_width = 250;

    /**
     * Default node height.
     *
     * @type    int
     */
    node.prototype.node_height = 40;

    /**
     * Line height for title and connectors in node.
     *
     * @type    int
     */
    node.prototype.node_line_height = 15;

    /**
     * Default node color.
     *
     * @type    string
     */
    node.prototype.node_color = '#000055';

    /**
     * Default connector radius.
     *
     * @type    int
     */
    node.prototype.connector_radius = 5;

    /**
     * Destroy node.
     */
    node.prototype.destroy = function()
    {
        // remove wires between this and other nodes, unregister connectors, remove SVG nodes
    }

    /**
     * Return ID of node.
     *
     * @return  string                              ID of node.
     */
    node.prototype.getId = function()
    {
        return this.data.id;
    }

    /**
     * Render node.
     *
     * @param   SVGNode         parent              Parent node.
     */
    node.prototype.render = function(parent)
    {
        // render node
        var cn = Math.max(this.node_input.length, this.node_output.length);
        var me = this;

        this.node = parent.data([{'x': this.data.x, 'y': this.data.y}]).append('g').attr('transform', function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        }).attr('cursor', 'move').call(onDragDrop(
            function(d) {
                me.data.x += d3.event.dx;
                me.data.y += d3.event.dy;

                d3.select(this).attr('transform', 'translate(' + me.data.x + ',' + me.data.y + ')');
            },
            function(d) {
                console.log('dropped', d);
            }
        ));

        this.node.append('rect').attr({
            'width': this.node_width,
            'height': this.node_height + cn * this.node_line_height,
            'stroke': 'black',
            'fill': this.node_color,
            'fill-opacity': 0.85,
            'rx': 5,
            'ry': 5,
            'x': 0,
            'y': 0
        });

        this.node.append('text').text(this.data.label).attr({
            'alignment-baseline': 'hanging',
            'stroke': 'none',
            'fill': 'white',
            'x': 5,
            'y': 5
        });

        // render input connectors
        this.node_input.forEach(function(connector, idx) {
            var cn = this.node.data([{'x': 10, 'y': this.node_height + idx * this.node_line_height}]).append('circle').attr({
                'cx': function(d) { return d.x; },
                'cy': function(d) { return d.y; },
                'r': 6,
                'stroke': 'black',
                'stroke-width': 2,
                'fill': 'white'
            });
            
            this.diagram.wire.registerConnector('input', cn, this);
            
            this.node.append('text').text(connector.label).attr({
                'alignment-baseline': 'middle',
                'stroke': 'none',
                'fill': 'white',
                'x': 20,
                'y': this.node_height + idx * this.node_line_height + 2
            });
        }, this);
        
        // render output connectors
        this.node_output.forEach(function(connector, idx) {
            var cn = this.node.data([{'x': this.node_width - 10, 'y': this.node_height + idx * this.node_line_height}]).append('circle').attr({
                'cx': function(d) { return d.x; },
                'cy': function(d) { return d.y; },
                'r': 6,
                'stroke': 'black',
                'stroke-width': 2,
                'fill': 'white',
                'cursor': 'crosshair'
            });
            
            this.diagram.wire.registerConnector('output', cn, this);
            
            this.node.append('text').text(connector.label).attr({
                'alignment-baseline': 'middle',
                'text-anchor': 'end',
                'stroke': 'none',
                'fill': 'white',
                'x': this.node_width - 20,
                'y': this.node_height + idx * this.node_line_height + 2
            });
        }, this);
    }
    
    return node;
})();
