/**
 * Connector class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;diagram.connector = (function() {
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
        this.data = this.node.diagram.extend({}, data || {});

        this.connections = {};

        this.cn = null;
        
        if (!('id' in this.data)) {
            this.data.id = node.getId() + '-' + this.data.name;
        }
        if (!('scope' in this.data)) {
            this.data.scope = '';
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
     * Return scope-name of connector.
     *
     * @return string                           Scope-name of connector.
     */
    connector.prototype.getScope = function()
    {
        return this.data.scope;
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
     * Test if it's allowed to connection two connectors. Connections are only
     * allowed if both connectors have the same scope and if they are not identical
     * objects.
     *
     * @param   diagram.connector   target      Target connector.
     */
    connector.prototype.isAllowed = function(target)
    {
        return (this.data.scope == target.getScope() &&                     // both connectors of same scope
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
        
        // this.cn = parent.circle().radius(6).transform({'x': x, 'y': y}).attr({
        this.cn = new paper.Path.Circle({
            center: [x, y],
            radius: 6,
            strokeColor: 'black',
            strokeWidth: 2,
            fillColor: (this.node.diagram.hasScope(this.data.scope)
                        ? this.node.diagram.getScope(this.data.scope).color
                        : 'white')
        })
        
        parent.addChild(this.cn);

        var label = new paper.PointText({
            point: [(this.type == 'output' ? x - 10 : x + 10), y + 5],
            content: this.data.label,
            fillColor: 'white',
            fontFamily: 'Verdana, Arial, Helvetica, Sans-Serif',
            fontSize: 12,
            justification: (this.type == 'output' ? 'right' : 'left')
        });
        
        parent.addChild(label);
        
        if (this.type == 'output') {
            
            
            // var tool = new paper.Tool();
            // var obj;
            // tool.onMouseDown = function(event) {
            //     obj = null;
            //     var hitResult = paper.project.hitTest(event.point, hitOptions);
            //
            //     if (hitResult && hitResult.type == 'fill') //state fill
            //         obj = hitResult.item;
            // }
            // tool.onMouseMove = function(event)
            // {
            //     var hitResult = paper.project.hitTest(event.point, hitOptions);
            //     paper.project.activeLayer.selected = false;
            //     if (hitResult && hitResult.item)
            //     hitResult.item.selected = true;
            // }
            // tool.onMouseDrag = function(event)
            // {
            //     if (obj)
            //         obj.position = event.point;
            // }
            // tool.onMouseUp = function(event)
            // {
            // }
            
            // this.cn.attr('cursor', 'crosshair');
            //
            // this.cn.draggable(function() {
            //     return {'x': false, 'y': false};
            // });
            // this.cn.dragstart = function(delta, event){
            //     event.stopPropagation();
            //
            //     me.onDragStart(delta, event);
            // };
            // this.cn.dragmove = function(delta, event){
            //     event.stopPropagation();
            //
            //     me.onDrag(delta, event);
            // };
            // this.cn.dragend = function(delta, event){
            //     event.stopPropagation();
            //
            //     me.onDragEnd(delta, event);
            // };
        } else {
            // this.cn.mouseover(function(event) {
            //     me.onMouseOver(event);
            // });
            // this.cn.mouseout(function(event) {
            //     me.onMouseOut(event);
            // });
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
    connector.prototype.onDragStart = function(delta, event)
    {
    }
    
    connector.prototype.onDrag = function(delta, event)
    {
    }

    connector.prototype.onDragEnd = function(delta, event)
    {
    }

    connector.prototype.onMouseOver = function(event)
    {
    }

    connector.prototype.onMouseOut = function(event)
    {
    }

    return connector;
})();
