/**
 * Connectors class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;diagram.wire = (function() {
    /**
     * Constructor.
     *
     * @param   diagram         dia             Diagram instance.
     */
    function wire(dia)
    {
        this.diagram = dia;
        this.draw = null;
        
        this.registry = {};
        this.idx = 0;
        
        this.wire = null;
        this.start = null;
        this.end = null;

        this.wires = [];
    }

    /**
     * Add a wire.
     */
    wire.prototype.addWire = function(source, target)
    {
        var sxy = this.getConnectorCenter(source.node());
        var txy = this.getConnectorCenter(target.node());
        
        this.diagram.getLayer('wires').append('line').attr({
            'x1': sxy.x,
            'y1': sxy.y,
            'x2': txy.x,
            'y2': txy.y,
            'stroke-width': 2,
            'stroke': 'green'
        });
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
     * Register a connector.
     *
     * @param   string          type            Type of connector.
     * @param   D3Node          cn              D3 node of connector.
     * @param   diagram.node    node            Node instance the connector belongs to.
     * @return  string                          Registry key for connection.
     */
    wire.prototype.registerConnector = function(type, cn, node)
    {
        var key = 'cn-' + (++this.idx);
        var me = this;
        
        me.registry[key] = cn;
        
        if (type == 'output') {
            // source target of a wire
            cn.call((function() {
                var drag = d3.behavior.drag();

                drag.on('dragstart', function(d) {
                    d3.event.sourceEvent.stopPropagation();

                    var xy = me.getConnectorCenter(d3.event.sourceEvent.target);
                    
                    me.wire = me.diagram.getLayer('draw').append('line').attr({
                        'x1': xy.x,
                        'y1': xy.y,
                        'x2': xy.x,
                        'y2': xy.y,
                        'stroke-width': 2,
                        'stroke': 'red'
                    });
                    
                    me.start = key;
                }).on('drag', function(d) {
                    if (me.wire !== null && me.end === null) {
                        var mxy = d3.mouse(me.diagram.getLayer().node());
                    
                        me.wire.attr({'x2': mxy[0], 'y2': mxy[1]});
                    }
                }).on('dragend', function(d) {
                    if (me.wire !== null) {
                        me.wire.remove();
                        
                        if (me.end !== null) {
                            // wire source and target element
                            me.addWire(me.registry[me.start], me.registry[me.end]);
                        }
                        
                        me.start = null;
                        me.end = null;
                    }
                });

                return drag;
            })());
        } else {
            // drop target for a wire
            cn.on('mouseover', function() {
                d3.event.stopPropagation();

                if (me.wire !== null) {
                    // snap wire
                    me.end = key;

                    var xy = me.getConnectorCenter(d3.event.target);
                    
                    me.wire.attr({'x2': xy.x, 'y2': xy.y});
                }
            }).on('mouseout', function() {
                d3.event.stopPropagation();

                me.end = null;
            });
        }
        
        return key;
    }
    
    return wire;
})();
