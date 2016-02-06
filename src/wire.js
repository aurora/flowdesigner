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
