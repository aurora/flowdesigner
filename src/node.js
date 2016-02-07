/*
 * This file is part of the 'flowdesigner' package.
 *
 * (c) Harald Lapp
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Node class.
 *
 * @copyright   copyright (c) 2015-2016 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;(function(flowdesigner) {
    var connector = flowdesigner.connector;

    var id = 0;

    /**
     * Constructor.
     *
     * @param   diagram         diagram             Diagram instance.
     * @param   object          settings            Node configuration settings.
     */
    function node(diagram, settings)
    {
        this.id = 'node-' + (++id);
        this.diagram = diagram;

        this.settings = $.extend({
            id: this.id,            // id of node
            x: 0,                   // x-position of node
            y: 0,                   // y-position of node
            width: 250,             // width of node
            color: '#000055',       // background color of node
            font_color: 'white',    // font color
            border_color: 'black',  // border color
            can_remove: true,       // whether node has a 'remove' button
            label: '',              // label of node
            description: '',        // node description
            input: [],              // input connectors
            output: [],             // output connectors
        }, settings);

        this.node = null;
        this.label = null;

        this.registry = [];     // connector registry

        // register input connectors
        this.settings.input.forEach(function(data, idx) {
            data.id = this.id + '-' + data.name;
            var cn = new connector('input', this, data);

            this.registry.push(this.diagram.wire.registerConnector(cn));
        }, this);

        // register output connectors
        this.settings.output.forEach(function(data, idx) {
            data.id = this.id + '-' + data.name;
            var cn = new connector('output', this, data);

            this.registry.push(this.diagram.wire.registerConnector(cn));
        }, this);
    }

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
     * Default font family.
     *
     * @type    string
     */
    node.prototype.node_font_family = 'Verdana, Arial, Helvetica, Sans-Serif';

    /**
     * Default font size.
     *
     * @type    int
     */
    node.prototype.node_font_size = 12;

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
     * Check if node is selected.
     *
     * @return  bool                    Returns true if node is selected.
     */
    node.prototype.isSelected = function()
    {
        return this.node.children[0].selected;
    }

    /**
     * Select node.
     */
    node.prototype.select = function()
    {
        this.node.children[0].selected = true;
    }

    /**
     * Unselect node.
     */
    node.prototype.unselect = function()
    {
        this.node.children[0].selected = false;
    }

    /**
     * Return internal id of node.
     *
     * @return  string                              Id of node.
     */
    node.prototype.getId = function()
    {
        return this.id;
    }

    /**
     * Return node settings.
     *
     * @return  object                              Node settings.
     */
    node.prototype.getSettings = function()
    {
        return $.extend(true, {}, this.settings);
    }

    /**
     * Return rectangle of node (x, y, width, height).
     *
     * @return  object                              Rectangle.
     */
    node.prototype.getRect = function()
    {
        var cn = Math.max(this.settings.input.length, this.settings.output.length);

        return {
            'x':      (isNaN(this.settings.x) ? 0 : this.settings.x),
            'y':      (isNaN(this.settings.y) ? 0 : this.settings.y),
            'width':  this.settings.width,
            'height': this.node_height + cn * this.node_line_height
        };
    }

    /**
     * Set/change label of node.
     *
     * @param   string              label           Label to set.
     */
    node.prototype.setLabel = function(label)
    {
        this.settings.label = label;

        if (this.label != null) {
            this.label.content = label;

            paper.project.view.update(true);
        }
    }

    /**
     * Render node.
     */
    node.prototype.render = function(pos)
    {
        // render node
        var layer = this.diagram.getLayer('nodes');

        var cn = Math.max(this.settings.input.length, this.settings.output.length);
        var me = this;
        var drag = false;
        var rect;

        var pos = {
            x: this.settings.x,
            y: this.settings.y
        };

        this.node = new paper.Group();

        rect = new paper.Path.Rectangle({
            point: [0, 0],
            size: [this.settings.width, this.node_height + cn * this.node_line_height],
            radius: 5,
            strokeColor: this.settings.border_color,
            fillColor: this.settings.color,
            opacity: this.node_opacity
        });

        this.node.addChild(rect);

        this.node.onMouseDown = function(event) {
            if (!event.event.shiftKey) {
                this.bringToFront();

                drag = (event.event.button == 0);

                me.diagram.selectNode(me);

                me.onMouseDown(event);
            }
        }
        this.node.onMouseUp = function(event) {
            me.onMouseUp(event);
        }
        this.node.onClick = function(event) {
            me.onClick(event);
        }
        this.node.onDoubleClick = function(event) {
            me.onDblClick(event);
        }
        this.node.onMouseDrag = function(event) {
            if (drag) {
                pos.x += event.delta.x;
                pos.y += event.delta.y;

                if (me.diagram.options.raster > 0) {
                    var x = Math.round(pos.x / me.diagram.options.raster) * me.diagram.options.raster;
                    var y = Math.round(pos.y / me.diagram.options.raster) * me.diagram.options.raster;

                    this.translate(x - me.settings.x, y - me.settings.y);

                    me.settings.x = x;
                    me.settings.y = y;
                } else {
                    this.translate(event.delta.x, event.delta.y);

                    me.settings.x = pos.x;
                    me.settings.y = pos.y;
                }

                me.diagram.wire.redrawWires(me.registry);
            }
        }

        this.label = new paper.PointText({
            point: [5, 15],
            content: this.settings.label,
            fillColor: this.settings.font_color,
            fontFamily: this.node_font_family,
            fontSize: this.node_font_size
        });

        this.node.addChild(this.label);

        if (this.settings.can_remove) {
            var bclose = new paper.PointText({
                point: [this.settings.width - 5, 15],
                content: '\u00D7',
                fillColor: this.settings.font_color,
                fontFamily: this.node_font_family,
                fontSize: this.node_font_size,
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
            bclose.onClick = function(event) {
                if (event.event.button == 0) {
                    me.diagram.removeNode(me.settings.id);
                }
            }
        }

        // render connectors
        var idx = {'input': 0, 'output': 0};

        this.registry.forEach(function(id) {
            var cn = this.diagram.wire.getConnector(id);

            if (cn.getType() == 'input') {
                cn.render(this.node, 10, this.node_height + idx.input * this.node_line_height);
                ++idx.input;
            } else {
                cn.render(this.node, this.settings.width - 10, this.node_height + idx.output * this.node_line_height);
                ++idx.output;
            }
        }, this);

        this.node.translate(this.settings.x, this.settings.y);
    }

    /*
     * Event handlers to be overwritten by child classes.
     */
    node.prototype.onMouseDown = function(d) {
    }
    node.prototype.onMouseUp = function(d) {
    }
    node.prototype.onClick = function(d) {
    }
    node.prototype.onDblClick = function(d) {
    }

    flowdesigner.node = node;
})(flowdesigner);
