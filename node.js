/**
 * Node class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;diagram.node = (function() {
    var id = 0;

    /**
     * Constructor.
     *
     * @param   diagram         diagram             Diagram instance.
     * @param   object          data                Node configuration.
     */
    function node(dia, data)
    {
        this.diagram = dia;

        this.data = this.diagram.extend({}, data);
        this.node = null;

        this.registry = [];

        if (!('id' in this.data)) {
            this.data.id = 'node-' + (++id);
        }

        // register input connectors
        this.node_input.forEach(function(data, idx) {
            var connector = new diagram.connector('input', this, data);

            this.registry.push(this.diagram.wire.registerConnector(connector));
        }, this);

        // register output connectors
        this.node_output.forEach(function(data, idx) {
            var connector = new diagram.connector('output', this, data);

            this.registry.push(this.diagram.wire.registerConnector(connector));
        }, this);
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
     * Default node opacity.
     *
     * @type    string
     */
    node.prototype.node_opacity = 0.75;

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
        this.registry = this.registry.filter(function(id) {
            this.diagram.wire.unregisterConnector(id);

            return false;
        }, this);

        this.node.remove();
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
     * Return node data.
     *
     * @return  object                              Node data.
     */
    node.prototype.getData = function()
    {
        return this.diagram.extend({}, this.data);
    }

    /**
     * Return rectangle of node (x, y, width, height).
     *
     * @return  object                              Rectangle.
     */
    node.prototype.getRect = function()
    {
        var cn = Math.max(this.node_input.length, this.node_output.length);
        
        return {
            'x':      (isNaN(this.data.x) ? null : this.data.x),
            'y':      (isNaN(this.data.y) ? null : this.data.y),
            'width':  this.node_width,
            'height': this.node_height + cn * this.node_line_height
        };
    }

    /**
     * Render node.
     *
     * @param   object          pos                 Optional {x: x, y: y} pair to use for rendering instead of in data provided x,y values.
     */
    node.prototype.render = function(pos)
    {
        if (typeof pos !== 'undefined' && 'x' in pos && 'y' in pos) {
            this.data.x = pos.x;
            this.data.y = pos.y;
        } else if (!('y' in this.data && 'x' in this.data)) {
            this.data.x = 0;
            this.data.y = 0;
        }
        
        // render node
        var layer = this.diagram.getLayer('nodes');
        
        var cn = Math.max(this.node_input.length, this.node_output.length);
        var me = this;

        this.node = new paper.Group();
        
        // this.node.mousedown(function() {
        //     this.front();
        // });
        //
        // this.node.click = function() {
        //     me.onClick();
        // }
        // this.node.dblclick = function() {
        //     me.onDblClick();
        // }
        //
        // this.node.draggable();
        // this.node.dragstart = function(delta, event) {
        //     event.stopPropagation();
        // }
        // this.node.dragmove = function(delta, event) {
        //     event.stopPropagation();
        //
        //     me.data.x += delta.x;
        //     me.data.y += delta.y;
        //
        //     if (me.diagram.options.raster > 0) {
        //         var bbox = this.bbox();
        //
        //         var x = Math.round(bbox.x / me.diagram.options.raster) * me.diagram.options.raster;
        //         var y = Math.round(bbox.y / me.diagram.options.raster) * me.diagram.options.raster;
        //
        //         this.transform({'x': x, 'y': y});
        //     }
        //
        //     me.diagram.wire.redrawWires(me.registry);
        // }
        // this.node.dragend = function(delta, event) {
        //     event.stopPropagation();
        // }

        var rect = new paper.Path.Rectangle({
            point: [0, 0],
            size: [this.node_width, this.node_height + cn * this.node_line_height],
            radius: 5,
            strokeColor: 'black',
            fillColor: this.node_color,
            opacity: this.node_opacity
        });

        this.node.addChild(rect);

        // rect.click(function() {
        //     me.onClick();
        // });
        // rect.dblclick(function() {
        //     me.onDblClick();
        // });
        //
        
        var text = new paper.PointText({
            point: [5, 15],
            content: this.data.label,
            fillColor: 'white',
            fontFamily: 'Verdana, Arial, Helvetica, Sans-Serif',
            fontSize: 12
        });
        
        this.node.addChild(text);
        
        var bclose = new paper.PointText({
            point: [this.node_width - 5, 15],
            content: '\u00D7',
            fillColor: 'white',
            fontFamily: 'Verdana, Arial, Helvetica, Sans-Serif',
            fontSize: 12,
            justification: 'right'
        });

        this.node.addChild(bclose);
        

        // var bclose = this.node.text('').plain('\u00D7').leading(1).transform({'x': this.node_width - 5, 'y': 5}).attr({
        //     'alignment-baseline': 'hanging',
        //     'text-anchor': 'end',
        //     'fill': 'white',
        //     'opacity': 0.5,
        //     'cursor': 'pointer'
        // });
        //
        // bclose.mouseover(function() {
        //     this.attr({'opacity': 1});
        // });
        // bclose.mouseout(function() {
        //     this.attr({'opacity': 0.5});
        // });
        // bclose.click(function() {
        //     me.diagram.removeNode(me.data.id);
        // });
        //
        // render connectors
        var idx = {'input': 0, 'output': 0};
       
        this.registry.forEach(function(id) {
            var connector = this.diagram.wire.getConnector(id);

            if (connector.getType() == 'input') {
                connector.render(this.node, 10, this.node_height + idx.input * this.node_line_height);
                ++idx.input;
            } else {
                connector.render(this.node, this.node_width - 10, this.node_height + idx.output * this.node_line_height);
                ++idx.output;
            }
        }, this);

        this.node.translate(this.data.x, this.data.y);        
    }

    /*
     * Event handlers to be overwritten by child classes.
     */
    node.prototype.onClick = function(d) {
    }
    node.prototype.onDblClick = function(d) {
    }

    return node;
})();
