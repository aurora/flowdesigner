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
