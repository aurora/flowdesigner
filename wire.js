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

        var scope = source.getScope();

        var sxy = this.getConnectorCenter(source.cn);
        var txy = this.getConnectorCenter(target.cn);

        var wire = this.diagram.getLayer('wires').path(calcPath(sxy.x, sxy.y, txy.x, txy.y)).attr({
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
        var rbox = node.rbox();
        
        return {
            'x': rbox.x + (rbox.width / 2),
            'y': rbox.y + (rbox.height / 2)
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
                connector.onDragStart = function(delta, event) {
                    var xy = me.getConnectorCenter(event.target.instance);

                    wire = me.diagram.getLayer('draw').line(xy.x, xy.y, xy.x, xy.y).attr({
                        'stroke-width': 2,
                        'stroke': 'red'
                    });

                    start = key;
                }
                connector.onDrag = function(delta, event) {
                    if (wire !== null && end === null) {
                        var txy = calcLine(wire.x(), wire.y(), event.x, event.y);

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
                connector.onMouseOver = function(event) {
                    event.stopPropagation();
                    
                    if (wire !== null) {
                        // snap wire ...
                        if (connector.isAllowed(me.registry[start])) {
                            // ... but only if connection is allowed
                            end = key;

                            var xy = me.getConnectorCenter(connector.cn);

                            var txy = calcLine(wire.x(), wire.y(), xy.x, xy.y);

                            wire.attr({'x2': txy.x, 'y2': txy.y});
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

    return wire;
})();
