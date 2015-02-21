/**
 * Node class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

define(function(require) {
    var connector = require('./connector');

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

        this.data = $.extend({}, data);
        this.node = null;

        this.registry = [];

        if (!('id' in this.data)) {
            this.data.id = 'node-' + (++id);
        }

        // register input connectors
        this.node_input.forEach(function(data, idx) {
            var cn = new connector('input', this, data);

            this.registry.push(this.diagram.wire.registerConnector(cn));
        }, this);

        // register output connectors
        this.node_output.forEach(function(data, idx) {
            var cn = new connector('output', this, data);

            this.registry.push(this.diagram.wire.registerConnector(cn));
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
        return $.extend({}, this.data);
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
     */
    node.prototype.render = function(pos)
    {
        // render node
        var layer = this.diagram.getLayer('nodes');

        var cn = Math.max(this.node_input.length, this.node_output.length);
        var me = this;
        var drag = false;
        var rect;

        var pos = {
            x: this.data.x,
            y: this.data.y
        };

        this.node = new paper.Group();
        this.node.onMouseDown = function(event) {
            if ((drag = !event.event.shiftKey)) {
                this.bringToFront();
            }
        }
        this.node.onMouseDrag = function(event) {
            if (drag) {
                pos.x += event.delta.x;
                pos.y += event.delta.y;

                if (me.diagram.options.raster > 0) {
                    var x = Math.round(pos.x / me.diagram.options.raster) * me.diagram.options.raster;
                    var y = Math.round(pos.y / me.diagram.options.raster) * me.diagram.options.raster;

                    this.translate(x - me.data.x, y - me.data.y);

                    me.data.x = x;
                    me.data.y = y;
                } else {
                    this.translate(event.delta.x, event.delta.y);

                    me.data.x = pos.x;
                    me.data.y = pos.y;
                }

                me.diagram.wire.redrawWires(me.registry);
            }
        }

        rect = new paper.Path.Rectangle({
            point: [0, 0],
            size: [this.node_width, this.node_height + cn * this.node_line_height],
            radius: 5,
            strokeColor: 'black',
            fillColor: this.node_color,
            opacity: this.node_opacity
        });

        this.node.addChild(rect);

        rect.onClick = function(event) {
            me.onClick(event);
        }
        rect.onDoubleClick = function(event) {
            me.onDblClick(event);
        }

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
            justification: 'right',
            opacity: 0.5
        });

        this.node.addChild(bclose);

        bclose.onMouseEnter = function() {
            this.set({opacity: 1});
            document.body.style.cursor = 'pointer';
        }
        bclose.onMouseLeave = function() {
            this.set({opacity: 0.5});
            document.body.style.cursor = 'default';
        }
        bclose.onClick = function() {
            me.diagram.removeNode(me.data.id);
        }

        // render connectors
        var idx = {'input': 0, 'output': 0};

        this.registry.forEach(function(id) {
            var cn = this.diagram.wire.getConnector(id);

            if (cn.getType() == 'input') {
                cn.render(this.node, 10, this.node_height + idx.input * this.node_line_height);
                ++idx.input;
            } else {
                cn.render(this.node, this.node_width - 10, this.node_height + idx.output * this.node_line_height);
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
});
