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
     * @param   mixed       canvas              Canvas selector.
     * @param   object      options             Optional options.
     */
    function diagram(canvas, options)
    {
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
