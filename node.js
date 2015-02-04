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
    
        this.data = Object.create(data || {});
        this.node = null;
        
        this.registry = [];
        
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
                
                me.diagram.wire.redrawWires(me.registry);
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
        this.node_input.forEach(function(data, idx) {
            var connector = new diagram.connector('input', this, data);
            connector.render(this.node, 10, this.node_height + idx * this.node_line_height);

            this.registry.push(this.diagram.wire.registerConnector(connector));
        }, this);
        
        // render output connectors
        this.node_output.forEach(function(data, idx) {
            var connector = new diagram.connector('output', this, data);
            connector.render(this.node, this.node_width - 10, this.node_height + idx * this.node_line_height);

            this.registry.push(this.diagram.wire.registerConnector(connector));
        }, this);
    }
    
    return node;
})();
