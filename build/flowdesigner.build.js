/*
 * This file is part of the 'flowdesigner' package.
 *
 * (c) Harald Lapp
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Main flow designer class.
 *
 * @copyright   copyright (c) 2015-2016 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;(function() {
    /**
     * Constructor, create new diagram.
     *
     * @param   mixed       canvas              Canvas selector.
     * @param   object      options             Optional options.
     */
    function flowdesigner(canvas, options)
    {
        return new flowdesigner.diagram(canvas, options);
    }

    window.flowdesigner = flowdesigner;
})();
/*
 * This file is part of the 'flowdesigner' package.
 *
 * (c) Harald Lapp
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Connector class.
 *
 * @copyright   copyright (c) 2015-2016 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;(function(flowdesigner) {
    /**
     * Constructor.
     *
     * @param   string          type            Type of connector.
     * @param   diagram.node    node            The node the connector belongs to.
     * @param   object          data            Connector data.
     */
    function connector(type, node, data)
    {
        this.type = type;
        this.node = node;
        this.data = $.extend({}, data || {});

        this.connections = {};

        this.cn = null;

        if (!('id' in this.data)) {
            this.data.id = node.getId() + '-' + this.data.name;
        }
        if (!('scopes' in this.data)) {
            this.data.scopes = [];
        }
        if (!('label' in this.data)) {
            this.data.label = '';
        }
    }

    /**
     * Add a connection to an other connector.
     *
     * @param   diagram.connector       target          Target connector.
     */
    connector.prototype.addConnection = function(target)
    {
        this.connections[target.getId()] = target;
    }

    /**
     * Return connections.
     *
     * @param   array                                   Connections.
     */
    connector.prototype.getConnections = function()
    {
        return Object.keys(this.connections).map(function(k) { return this.connections[k]; }, this);
    }

    /**
     * Remove connection.
     */
    connector.prototype.removeConnection = function(target)
    {
        var id = target.getId();

        if (id in this.connections) {
            delete this.connections[id];
        }
    }

    /**
     * Return ID of connector.
     *
     * @return  string                          ID of connector.
     */
    connector.prototype.getId = function()
    {
        return this.data.id;
    }

    /**
     * Test if one of a specified list of scopes is member of the configured scopes.
     *
     * @param   array                           Names of scopes.
     */
    connector.prototype.hasScopes = function(scopes)
    {
        return (this.data.scopes.filter(function(n) { return scopes.indexOf(n) != -1; }).length > 0);
    }

    /**
     * Return scope names of connector.
     *
     * @return array                            Scope-name of connector.
     */
    connector.prototype.getScopes = function()
    {
        return this.data.scopes;
    }

    /**
     * Return node the connector belongs to.
     *
     * @return  diagram.node                    Node.
     */
    connector.prototype.getNode = function()
    {
        return this.node;
    }

    /**
     * Test if it's allowed to connect two connectors. Connections are only
     * allowed if both connectors have the same scope and if they are not identical
     * objects.
     *
     * @param   diagram.connector   target      Target connector.
     */
    connector.prototype.isAllowed = function(target)
    {
        return (target.hasScopes(this.data.scopes) &&                       // both connectors of same scope
                this.node.getId() != target.getNode().getId() &&            // target and source are not the same node
                typeof this.connections[target.getId()] === 'undefined');   // connectors not already connected
    }

    /**
     * Render connector.
     *
     * @param   D3Node      parent              Parent node to render connector at.
     * @param   int         x                   X-Position of connector.
     * @param   int         y                   Y-Position of connector.
     */
    connector.prototype.render = function(parent, x, y)
    {
        var me = this;
        var color = (this.data.scopes.length > 1
                        ? '#777777'     // color for multiple possible scopes
                        : (this.node.diagram.hasScope(this.data.scopes[0])
                            ? this.node.diagram.getScope(this.data.scopes[0]).color     // color for single known scope
                            : 'white'));  // color for unknown scope

        this.cn = new paper.Path.Circle({
            center: [x, y],
            radius: 6,
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: color
        })

        parent.addChild(this.cn);

        var label = new paper.PointText({
            point: [(this.type == 'output' ? x - 10 : x + 10), y + 5],
            content: this.data.label,
            fillColor: this.node.node_font_color,
            fontFamily: this.node.node_font_family,
            fontSize: this.node.node_font_size,
            justification: (this.type == 'output' ? 'right' : 'left')
        });

        parent.addChild(label);

        if (this.type == 'output') {
            var tool = new paper.Tool();
            var drag = false;

            this.cn.onMouseEnter = function(event) {
                if (!event.event.shiftKey) {
                    document.body.style.cursor = 'crosshair';
                }
            };
            this.cn.onMouseLeave = function(event) {
                document.body.style.cursor = 'default';
            };
            this.cn.onMouseDown = function(event) {
                if (!event.event.shiftKey && event.event.button == 0 && me.cn.hitTest(event.point, {segments: false, stroke: false, fill: true, tolerance: 0})) {
                    drag = true;

                    tool.activate();

                    me.onDragStart(event);
                }

                event.stopPropagation();
            }

            tool.onMouseDrag = function(event) {
                if (drag) {
                    me.onDrag(event);

                    event.stopPropagation();
                }
            }
            tool.onMouseUp = function(event) {
                if (drag) {
                    me.onDragEnd(event);
                    drag = false;
                }
            }
        } else {
            this.cn.onMouseEnter = function(event) {
                me.onMouseOver(event);
            };
            this.cn.onMouseLeave = function(event) {
                me.onMouseOut(event);
            };
        }
    }

    /**
     * Return type of connector ('input' or 'output').
     *
     * @return  string                          Type of connector.
     */
    connector.prototype.getType = function()
    {
        return this.type;
    }

    /*
     * Events.
     */
    connector.prototype.onDragStart = function(event)
    {
    }

    connector.prototype.onDrag = function(event)
    {
    }

    connector.prototype.onDragEnd = function(event)
    {
    }

    connector.prototype.onMouseOver = function(event)
    {
    }

    connector.prototype.onMouseOut = function(event)
    {
    }

    flowdesigner.connector = connector;
})(flowdesigner);
/*
 * This file is part of the 'flowdesigner' package.
 *
 * (c) Harald Lapp
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Connectors class.
 *
 * @copyright   copyright (c) 2015-2016 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;(function(flowdesigner) {
    /**
     * Calculate bezier wire path.
     */
    function calcPath(x1, y1, x2, y2)
    {
        return 'M ' + x1 + ', ' + y1 + 'C ' +
                (x1 + (x2 - x1) / 2) + ', ' + y1 + ' ' +
                (x2 - (x2 - x1) / 2) + ', ' + y2 + ' ' +
                x2 + ', ' + y2;
    }

    /**
     * Calculate helper line x,y.
     */
    function calcLine(x1, y1, x2, y2)
    {
        var vx = x2 - x1;
        var vy = y2 - y1;

        var d = Math.sqrt(vx * vx + vy * vy);

        vx /= d;
        vy /= d;

        d = Math.max(0, d - 5);

        return {
            'x': Math.round(x1 + vx * d),
            'y': Math.round(y1 + vy * d)
        }
    }

    /**
     * Constructor.
     *
     * @param   diagram         dia             Diagram instance.
     */
    function wire(dia)
    {
        this.diagram = dia;

        this.registry = {};
        this.wires = {};
    }

    /**
     * Add a wire.
     */
    wire.prototype.addWire = function(start, end)
    {
        var source = this.registry[start];
        var target = this.registry[end];

        if (!source.isAllowed(target)) {
            return;
        }

        var scopes = (function() {
            var tmp = target.getScopes();

            return source.getScopes().filter(function(n) {
                return tmp.indexOf(n) != -1;
            });
        })();

        if (scopes.length == 0) {
            // this should not happen, because isAllowed should handle this case
            throw 'Unknown error occured.';
        }

        var sxy = this.getConnectorCenter(source.cn);
        var txy = this.getConnectorCenter(target.cn);

        var layer = this.diagram.getLayer('wires');
        var wire = new paper.Path(calcPath(sxy.x, sxy.y, txy.x, txy.y));
        wire.strokeWidth = 4;
        wire.strokeColor = (scopes.length > 1
                            ? '#777777'     // multiple scopes could be valid for wire
                            : (this.diagram.hasScope(scopes[0])
                                ? this.diagram.getScope(scopes[0]).color   // color of single known scope
                                : 'black'));    // unknown scope

        wire.onMouseEnter = function(event) {
            document.body.style.cursor = 'not-allowed';
        }
        wire.onMouseLeave = function(event) {
            document.body.style.cursor = 'default';
        }

        source.addConnection(target);
        target.addConnection(source);

        var key = [source.getId(), target.getId()].sort().join('-');

        this.wires[key] = {'source': source, 'target': target, 'wire': wire};

        var me = this;

        wire.onClick = function(event) {
            if (event.event.button == 0) {
                source.removeConnection(target);
                target.removeConnection(source);

                me.wires[key].wire.remove();
                delete me.wires[key];
            }
        }
    }

    /**
     * Return wires.
     *
     * @return  array                           Export all wires.
     */
    wire.prototype.exportWires = function()
    {
        return Object.keys(this.wires).map(function(k) {
            return {
                'source': this.wires[k].source.getId(),
                'target': this.wires[k].target.getId()
            };
        }, this);
    }

    /**
     * Redraw wires.
     *
     * @param   array           ids             Array of connector IDs.
     */
    wire.prototype.redrawWires = function(ids)
    {
        ids.forEach(function(id) {
            var source = this.registry[id];

            this.registry[id].getConnections().forEach(function(target) {
                var key = [source.getId(), target.getId()].sort().join('-');

                if (key in this.wires) {
                    var sxy = this.getConnectorCenter(this.registry[id].cn);
                    var txy = this.getConnectorCenter(target.cn);

                    this.wires[key].wire.set({pathData: calcPath(sxy.x, sxy.y, txy.x, txy.y)});
                }
            }, this);
        }, this);
    }

    /**
     * Get center coordinates of a connector.
     *
     * @param   D3Node          node            Node to return coordinates for.
     * @return  object                          Object with x,y coordinates.
     */
    wire.prototype.getConnectorCenter = function(node)
    {
        var b = node.strokeBounds;

        return {
            'x': b.x + (b.width / 2),
            'y': b.y + (b.height / 2)
        };
    }

    /**
     * Get registered connector by registry id.
     *
     * @param   string              id              Registry key of connector.
     */
    wire.prototype.getConnector = function(id)
    {
        return (id in this.registry
                ? this.registry[id]
                : undefined);
    }

    /**
     * Unregister a connector and remove all wires that are connected to the connector.
     *
     * @param   string              id              Registry key of connector.
     */
    wire.prototype.unregisterConnector = function(id)
    {
        if (id in this.registry) {
            var source = this.registry[id];

            this.registry[id].getConnections().forEach(function(target) {
                var key = [source.getId(), target.getId()].sort().join('-');

                if (key in this.wires) {
                    this.wires[key].wire.remove();

                    delete this.wires[key];
                }
            }, this);

            delete this.registry[id];
        }
    }

    /**
     * Register a connector.
     *
     * @param   diagram.connector    connector      Instance of connector.
     * @return  string                              Registry key for connection.
     */
    wire.prototype.registerConnector = (function() {
        var wire = null;
        var start = null;
        var end = null;

        return function(connector) {
            var type = connector.getType();
            var key = connector.getId();
            var me = this;

            me.registry[key] = connector;

            if (type == 'output') {
                // source target of a wire
                connector.onDragStart = function(event) {
                    var xy = me.getConnectorCenter(me.registry[key].cn);

                    me.diagram.getLayer('draw');

                    wire = new paper.Path.Line({
                        from: [xy.x, xy.y],
                        to: [xy.x, xy.y],
                        strokeWidth: 2,
                        strokeColor: 'red'
                    });

                    start = key;
                }
                connector.onDrag = function(event) {
                    if (wire !== null && end === null) {
                        var xy = me.getConnectorCenter(me.registry[start].cn);
                        var txy = calcLine(xy.x, xy.y, event.point.x, event.point.y);

                        me.diagram.getLayer('draw');

                        wire.set({pathData: 'M' + xy.x + ',' + xy.y + ' L' + txy.x + ',' + txy.y});
                    }
                };
                connector.onDragEnd = function(event) {
                    if (wire !== null) {
                        wire.remove();

                        if (end !== null) {
                            // wire source and target element
                            me.addWire(start, end);
                        }

                        wire = null;
                        start = null;
                        end = null;
                    }
                };
            } else {
                // drop target for a wire
                connector.onMouseOver = function(event) {
                    event.stopPropagation();

                    if (wire !== null) {
                        // snap wire ...
                        if (connector.isAllowed(me.registry[start])) {
                            // ... but only if connection is allowed
                            end = key;

                            var sxy = me.getConnectorCenter(me.registry[start].cn);
                            var exy = me.getConnectorCenter(connector.cn);
                            var txy = calcLine(sxy.x, sxy.y, exy.x, exy.y);

                            me.diagram.getLayer('draw');

                            wire.set({pathData: 'M' + sxy.x + ',' + sxy.y + ' L' + txy.x + ',' + txy.y});
                        }
                    }
                }
                connector.onMouseOut = function(event) {
                    event.stopPropagation();

                    end = null;
                };
            }

            return key;
        }
    })();

    flowdesigner.wire = wire;
})(flowdesigner);
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
/*
 * This file is part of the 'flowdesigner' package.
 *
 * (c) Harald Lapp
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Main diagram class.
 *
 * @copyright   copyright (c) 2015-2016 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;(function(flowdesigner) {
    var wire = flowdesigner.wire;
    var node = flowdesigner.node;

    /*
     * zoom inspired by StableZoom
     * https://github.com/mberth/PanAndZoom/blob/master/app/scripts/pan_and_zoom.coffee
     */
    function zoom(old_zoom, delta, c, p) {
        var factor = 1.05;
        var new_zoom = (delta < 0
                        ? old_zoom * factor
                        : (delta > 0
                            ? old_zoom / factor
                            : old_zoom));

        return {
            zoom: new_zoom,
            offset: p.subtract(p.subtract(c).multiply(old_zoom / new_zoom)).subtract(c)
        };
    }

    /**
     * Constructor.
     *
     * @param   HTMLCanvasElement|string    canvas              Canvas selector.
     * @param   object                      options             Optional options.
     */
    function diagram(canvas, options)
    {
        if (typeof canvas === 'string' || canvas instanceof String) {
            this.canvas_node = $('#' + canvas);
        } else if (canvas instanceof HTMLCanvasElement) {
            this.canvas_node = canvas;
        } else {
            throw new Error('Invalid argument, id or instance of HTMLCanvasElement expected');
        }

        this.canvas = paper.setup(canvas);
        this.options = $.extend({'raster': 0}, options || {});
        this.nodes = {};
        this.scopes = {};

        this.layers = {
            'wires': new this.canvas.Layer(),
            'nodes': new this.canvas.Layer(),
            'draw': new this.canvas.Layer()
        };

        this.wire = new wire(this);

        // disable context menu
        $(this.canvas_node).bind('contextmenu', function() {
            return false;
        });

        // zoom
        $(this.canvas_node).mousewheel(function(event) {
            var pos = paper.view.viewToProject(new paper.Point(event.offsetX, event.offsetY));
            var ret = zoom(paper.view.zoom, event.deltaY, paper.view.center, pos);

            paper.view.zoom = ret.zoom;
            paper.view.center = paper.view.center.add(ret.offset);

            event.preventDefault();

            paper.view.draw();
        });

        // pan
        (function() {
            var tool = new paper.Tool();
            var drag = false;
            var point = {x: 0, y: 0};

            tool.onMouseDrag = function(event) {
                if (drag) {
                    var delta = {
                        x: point.x - event.event.offsetX,
                        y: point.y - event.event.offsetY
                    };

                    point = {x: event.event.offsetX, y: event.event.offsetY};

                    paper.view.center = paper.view.center.add(new paper.Point(delta.x, delta.y));

                    event.stopPropagation();
                }
            }
            tool.onMouseUp = function(event) {
                drag = false;
            }

            $(this.canvas_node).on({
                mousedown: function(event) {
                    if (event.shiftKey) {
                        tool.activate();

                        drag = true;
                        point = {x: event.offsetX, y: event.offsetY};
                    }
                }
            });
        }).call(this);
    }

    /**
     * Define a connector scope.
     *
     * @param   string      name                Name of scope.
     * @param   object      settings            Scope settings.
     */
    diagram.prototype.defineScope = function(name, settings)
    {
        this.scopes[name] = settings;
    }

    /**
     * Test if scope is available.
     *
     * @param   string      name                Name of scope.
     * @return  bool                            Returns true if scope is available.
     */
    diagram.prototype.hasScope = function(name)
    {
        return (name in this.scopes);
    }

    /**
     * Return scope settings.
     *
     * @param   string      name                Name of scope.
     * @return  object                          Scope settings.
     */
    diagram.prototype.getScope = function(name)
    {
        return this.scopes[name];
    }

    /**
     * Test if node of specified Id is available.
     *
     * @param   string      id                  Id of node.
     * @return  bool                            Returns true if node is available.
     */
    diagram.prototype.hasNode = function(id)
    {
        return (id in this.nodes);
    }

    /**
     * Select a node.
     *
     * @param   string|flowdesigner.node    node        Id of node or node instance to select.
     */
    diagram.prototype.selectNode = function(node)
    {
        this.unselectAllNodes();

        if (typeof node === 'string' || node instanceof String) {
            if (this.hasNode(node)) {
                this.getNode(node).select();
            }
        } else if (node instanceof flowdesigner.node) {
            node.select();
        } else {
            throw new Error('Invalid argument, id or instance of flowdesigner.node expected');
        }
    }

    /**
     * Unselect a node.
     *
     * @param   string|flowdesigner.node    node        Id of node or node instance to select.
     */
    diagram.prototype.unselectNode = function(node)
    {
        if (typeof node === 'string' || node instanceof string) {
            if (this.hasNode(node)) {
                this.getNode(node).unselect();;
            }
        } else if (node instanceof flowdesigner.node) {
            node.unselect();
        } else {
            throw new Error('Invalid argument, id or instance of flowdesigner.node expected');
        }
    }

    /**
     * Unselect all nodes.
     */
    diagram.prototype.unselectAllNodes = function()
    {
        for (var i in this.nodes) {
            this.nodes[i].unselect();
        }
    }

    /**
     * Select all nodes.
     */
    diagram.prototype.selectAllNodes = function()
    {
        for (var i in this.nodes) {
            this.nodes[i].select();
        }
    }

    /**
     * Return a list of selected nodes.
     *
     * @return  array                           List of selected nodes.
     */
    diagram.prototype.getSelectedNodes = function()
    {
        var selected = [];

        for (var i in this.nodes) {
            if (this.nodes[i].isSelected()) {
                selected.push(this.nodes[i]);
            }
        }

        return selected;
    }

    /**
     * Return instance of node.
     *
     * @param   string      id                  Id of node to return.
     * @return  flowdesigner.node               Instance of node.
     */
    diagram.prototype.getNode = function(id)
    {
        return this.nodes[id];
    }

    /**
     * Return and activate layer of specified name. Returns the canvas layer, if no layer name
     * is specified.
     *
     * @param   string      name                Name of layer to get.
     * @return  node                            Layer node.
     */
    diagram.prototype.getLayer = function(name)
    {
        var layer = (typeof name !== 'undefined'
                        ? this.layers[name]
                        : this.canvas);

        layer.activate();

        return layer;
    }

    /**
     * Return data URL of canvas.
     *
     * @return  string                          Data URL of canvas.
     */
    diagram.prototype.getDataUrl = function()
    {
        return this.canvas_node.get(0).toDataURL();
    }

    /**
     * Export nodes and wires as json data structure.
     *
     * @return  object                          Defined nodes and wires.
     */
    diagram.prototype.exportJson = function()
    {
        var data = {
            'nodes': [],
            'wires': []
        };

        for (var i in this.nodes) {
            data.nodes.push(this.nodes[i].getSettings());
        }

        data.wires = this.wire.exportWires();

        return data;
    }

    /**
     * Import json data structure of nodes and wires.
     *
     * @param   object              data        Data structure to import.
     */
    diagram.prototype.importJson = function(data)
    {
        data.nodes.forEach(function(node) {
            this.addNode()
        });

        data.wires.forEach(function(wire) {
            this.addWire(wire);
        }, this);
    }

    /**
     * Add an instance of a node to the diagram.
     *
     * @param   flowdesigner.node   node        Instance of node.
     * @return  object                          Instance of created node.
     */
    diagram.prototype.addNode = function(node)
    {
        if (!(node instanceof flowdesigner.node)) {
            throw new Error('Invalid parameter specified');
        }

        var id = node.getId();
        var me = this;

        this.nodes[id] = node;
    }

    /**
     * Add a single wire to diagram.
     *
     * @param   object      wire                Wire to add.
     */
    diagram.prototype.addWire = function(wire)
    {
        this.wire.addWire(wire.source, wire.target);
    }

    /**
     * Remove node of the specified ID.
     *
     * @param   string      id                  ID of node to remove.
     */
    diagram.prototype.removeNode = function(id)
    {
        var node = this.nodes[id];
        node.destroy();

        delete this.nodes[id];
    }

    /**
     * Remove multiple nodes.
     *
     * @param   array       ids                 Array of IDs of nodes to remove.
     */
    diagram.prototype.removeNodes = function(ids)
    {
        ids.forEach(function(id) {
            this.removeNode(id);
        }, this);
    }

    /**
     * Remove all nodes from diagram.
     */
    diagram.prototype.removeAllNodes = function()
    {
        this.removeNodes(Object.keys(this.nodes));
    }

    flowdesigner.diagram = diagram;
})(flowdesigner);
