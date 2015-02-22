/**
 * Main diagram class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

define(function(require) {
    var wire = require('./wire'),
        node = require('./node');

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
     * @param   mixed       canvas              Canvas selector.
     * @param   object      options             Optional options.
     */
    function diagram(canvas, options)
    {
        this.canvas = paper.setup(canvas);
        this.options = $.extend({'raster': 0}, options || {});
        this.nodes = [];
        this.scopes = {};
        this.registry = {};

        this.layers = {
            'wires': new this.canvas.Layer(),
            'nodes': new this.canvas.Layer(),
            'draw': new this.canvas.Layer()
        };

        this.wire = new wire(this);

        // disable context menu
        $('#' + canvas).bind('contextmenu', function() {
            return false;
        });

        // zoom
        $('#' + canvas).mousewheel(function(event) {
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

            $('#' + canvas).on({
                mousedown: function(event) {
                    if (event.shiftKey) {
                        tool.activate();

                        drag = true;
                        point = {x: event.offsetX, y: event.offsetY};
                    }
                }
            });
        })();
    }

    /**
     * Define a node.
     *
     * @param   string      name                Name of node to define.
     * @param   string      def                 Node definition.
     */
    diagram.prototype.defineNode = function(name, def)
    {
        var _def = $.extend({
            input: [],
            output: [],
            color: node.prototype.node_color,
            onClick: function() {},
            onDblClick: function() {}
        }, def);

        function def_node(dia, data) {
            node.call(this, dia, data);
        }

        def_node.prototype = Object.create(node.prototype);
        def_node.prototype.constructor = def_node;

        def_node.prototype.onClick = _def.onClick;
        def_node.prototype.onDblClick = _def.onDblClick;
        def_node.prototype.node_input = _def.input;
        def_node.prototype.node_output = _def.output;
        def_node.prototype.node_color = _def.color;

        this.registry[name] = def_node;
    }

    /**
     * Register a node node-derived class with specified name.
     *
     * @param   string      name                Name of node to register.
     * @param   string      node_subclass       Node class to register.
     */
    diagram.prototype.registerNode = function(name, node_subclass)
    {
        if (!node.prototype.isPrototypeOf(test.prototype)) {
            throw new Error('Invalid parameter specified');
        }

        this.registry[name] = node_subclass;
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
     * Return wires.
     *
     * @return  array                           Array ofwires.
     */
    diagram.prototype.exportWires = function()
    {
        return this.wire.exportWires();
    }

    /**
     * Export nodes.
     *
     * @return  array                           Array of nodes.
     */
    diagram.prototype.exportNodes = function()
    {
        return this.nodes.map(function(node) {
            return node.getData();
        });
    }

    /**
     * Add multiple nodes.
     *
     * @param   array       nodes               Array of nodes.
     */
    diagram.prototype.addNodes = function(nodes)
    {
        nodes.forEach(function(data) {
            this.addNode(data);
        }, this);
    }

    /**
     * Add a single node to diagram.
     *
     * @param   object      data                Node data.
     */
    diagram.prototype.addNode = function(data)
    {
        if (typeof this.registry[data.node] == 'undefined') {
            throw new Error('Unknown node "' + data.node + '"')
        }

        var node = new this.registry[data.node](this, data);
        node.render();

        this.nodes.push(node);
    }

    /**
     * Add multiple wires.
     *
     * @param   array       wires               Array of wires.
     */
    diagram.prototype.addWires = function(wires)
    {
        wires.forEach(function(wire) {
            this.addWire(wire);
        }, this);
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
        this.nodes = this.nodes.filter(function(node) {
            var ret = true;

            if (node.getId() == id) {
                node.destroy();

                ret = false;
            }

            return ret;
        });
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
        this.nodes = this.nodes.filter(function(node) {
            node.destroy();

            return false;
        });
    }

    return diagram;
});
