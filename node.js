/**
 * Node class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;diagram.node = (function() {
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
    
        this.data = data;
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
     * Render node.
     *
     * @param   SVGNode         parent              Parent node.
     */
    node.prototype.render = function(parent)
    {
        // render node
        var cn = Math.max(this.node_input.length, this.node_output.length);
        var me = this;

        var node = parent.data([{'x': this.data.x, 'y': this.data.y}]).append('g').attr('transform', function(d) {
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

        node.append('rect').attr({
            'width': this.node_width,
            'height': this.node_height + cn * 15,
            'stroke': 'black',
            'fill': this.node_color,
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

        // render input connectors
        
        
        // this.input.forEach(function(connector, idx) {
        //     connector.render(node, 10, 30 + (idx * 17));
        // }, this);
        
        // render output connectors
        
        // this.output.forEach(function(connector, idx) {
        //     connector.render(node, 10, 30 + (idx * 17));
        // }, this);
    }
    
    return node;
})();
