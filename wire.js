/**
 * Connectors class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;diagram.wire = (function() {
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
            'x': Math.ceil(x1 + vx * d),
            'y': Math.ceil(y1 + vy * d)
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

        var scope = source.getScope();

        var sxy = this.getConnectorCenter(source.cn.node());
        var txy = this.getConnectorCenter(target.cn.node());

        var wire = this.diagram.getLayer('wires').append('path').attr({
            'd': calcPath(sxy.x, sxy.y, txy.x, txy.y),
            'stroke-width': 4,
            'stroke': (this.diagram.hasScope(scope)
                        ? this.diagram.getScope(scope).color
                        : 'white'),
            'fill': 'none'
        });

        source.addConnection(target);
        target.addConnection(source);

        var key = [source.getId(), target.getId()].sort().join('-');

        this.wires[key] = {'source': source, 'target': target, 'wire': wire};
    }

    /**
     * Import wires.
     *
     * @return  array                           Export all wires.
     */
    wire.prototype.importWires = function(wires)
    {
        wires.forEach(function(wire) {
            this.addWire(wire.source, wire.target);
        }, this);
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
                    var sxy = this.getConnectorCenter(this.registry[id].cn.node());
                    var txy = this.getConnectorCenter(target.cn.node());

                    this.wires[key].wire.attr({'d': calcPath(sxy.x, sxy.y, txy.x, txy.y)});
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
        var me = this;

        function convertCoords(x, y) {
            var offset = me.diagram.getLayer().node().getBoundingClientRect();
            var matrix = node.getScreenCTM();

            return {
                x: (matrix.a * x) + (matrix.c * y) + matrix.e - offset.left,
                y: (matrix.b * x) + (matrix.d * y) + matrix.f - offset.top
            };
        }

        var bbox = node.getBBox();

        return convertCoords(bbox.x + (bbox.width / 2), bbox.y + (bbox.height / 2));
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
                connector.onDragStart = function(d) {
                    var xy = me.getConnectorCenter(d3.event.sourceEvent.target);

                    wire = me.diagram.getLayer('draw').append('line').attr({
                        'x1': xy.x,
                        'y1': xy.y,
                        'x2': xy.x,
                        'y2': xy.y,
                        'stroke-width': 2,
                        'stroke': 'red'
                    });

                    start = key;
                }
                connector.onDrag = function(d) {
                    if (wire !== null && end === null) {
                        var sxy = {'x': parseInt(wire.attr('x1'), 10), 'y': parseInt(wire.attr('y1'), 10)};
                        var mxy = d3.mouse(me.diagram.getLayer().node());

                        var txy = calcLine(sxy.x, sxy.y, mxy[0], mxy[1]);

                        wire.attr({'x2': txy.x, 'y2': txy.y});
                    }
                };
                connector.onDragEnd = function(d) {
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
                connector.onMouseOver = function() {
                    d3.event.stopPropagation();

                    if (wire !== null) {
                        // snap wire ...
                        if (connector.isAllowed(me.registry[start])) {
                            // ... but only if connection is allowed
                            end = key;

                            var sxy = {'x': parseInt(wire.attr('x1'), 10), 'y': parseInt(wire.attr('y1'), 10)};
                            var xy = me.getConnectorCenter(d3.event.target);

                            var txy = calcLine(sxy.x, sxy.y, xy.x, xy.y);

                            wire.attr({'x2': txy.x, 'y2': txy.y});
                        }
                    }
                }
                connector.onMouseOut = function() {
                    d3.event.stopPropagation();

                    end = null;
                };
            }

            return key;
        }
    })();

    return wire;
})();
