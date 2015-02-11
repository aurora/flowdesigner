/**
 * Main diagram class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;var diagram = (function() {
    /*
     * zoom and pan inspired by StableZoom
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

    function pan(old_center, delta_x, delta_y) {
        var factor = 0.75;

        return old_center.add((new paper.Point(-delta_x, -delta_y)).multiply(factor));
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
        this.options = this.extend({'raster': 10}, options || {});
        this.nodes = [];
        this.wires = [];
        this.scopes = {};

        // make diagram zoomable and panable
        $('#' + canvas).mousewheel(function(event) {
            var pos = paper.view.viewToProject(new paper.Point(event.offsetX, event.offsetY));
            var ret = zoom(paper.view.zoom, event.deltaY, paper.view.center, pos);

            paper.view.zoom = ret.zoom;
            paper.view.center = paper.view.center.add(ret.offset);

            event.preventDefault();

            paper.view.draw();
        });

        // pan
        var background = new this.canvas.Layer();

        var rect = new paper.Path.Rectangle({
            point: [0, 0],
            size: [paper.view.viewSize.width, paper.view.viewSize.height],
            fillColor: 'lightgray'
        });

        rect.onMouseEnter = function() {
            document.body.style.cursor = 'pointer';
        }
        rect.onMouseLeave = function() {
            document.body.style.cursor = 'default';
        }
        rect.onMouseDrag = function(event) {
            var center = pan(paper.view.center, event.delta.x, event.delta.y);
            paper.view.center = center;

            event.preventDefault();
        }

        // finish setup
        this.layers = {
            'wires': new this.canvas.Layer(),
            'nodes': new this.canvas.Layer(),
            'draw': new this.canvas.Layer()
        };

        this.wire = new diagram.wire(this);
    }

    /**
     * Helper method to create shallow copies of objects.
     *
     * @param   object      origin              Object to extend.
     * @param   object      add                 Object with properties to add.
     */
    diagram.prototype.extend = function(origin, add) {
        if (typeof add === 'object') {
            Object.keys(add).forEach(function(k) {
                origin[k] = add[k];
            });
        }

        return origin;
    };

    /**
     * Add a connector scope.
     *
     * @param   string      name                Name of scope.
     * @param   object      settings            Scope settings.
     */
    diagram.prototype.addScope = function(name, settings)
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
        var node = new node_types[data.node](this, data);

        this.nodes.push(node);
    }

    /**
     * Add multiple wires.
     *
     * @param   array       wires               Array of wires.
     */
    diagram.prototype.addWires = function(wires)
    {
        this.wires = this.wires.concat(wires);
    }

    /**
     * Add a single wire to diagram.
     *
     * @param   object      wire                Wire to add.
     */
    diagram.prototype.addWire = function(wire)
    {
        this.wires.push(wire);
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
     * Render diagram and wire all nodes as specified.
     */
    diagram.prototype.render = function()
    {
        // determine if dagre should be used for layouting
        var use_dagre = false;

        if (typeof dagre !== 'undefined') {
            for (var i = 0, rect = null, cnt = this.nodes.length; i < cnt; ++i) {
                rect = this.nodes[i].getRect();

                if ((use_dagre = (rect.x === null || rect.y === null))) {
                    break;
                }
            }
        }

        if (use_dagre) {
            // render nodes with calculated graph layout using dagre library
            var g = new dagre.graphlib.Graph();

            g.setGraph({'rankdir': 'LR'});
            g.setDefaultEdgeLabel(function() { return {}; });

            this.nodes.forEach(function(node) {
                var rect = node.getRect();

                g.setNode(node.getId(), {'width': rect.width, 'height': rect.height});
            });

            this.wires.forEach(function(wire) {
                var source = this.wire.registry[wire.source];
                var target = this.wire.registry[wire.target];

                g.setEdge(source.getNode().getId(), target.getNode().getId());
            }, this);

            dagre.layout(g);

            this.nodes.forEach(function(node) {
                var rect = g.node(node.getId());

                node.render({'x': rect.x, 'y': rect.y});
            }, this);
        } else {
            // render without using dagre
            this.nodes.forEach(function(node) {
                node.render();
            });
        }

        // render wires
        this.wires.forEach(function(wire) {
            this.wire.addWire(wire.source, wire.target);
        }, this);

        //
        paper.view.draw();
    }

    return diagram;
})();
