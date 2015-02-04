/**
 * Main diagram class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;var diagram = (function() {
    /**
     * Constructor.
     *
     * @param   mixed       canvas              Canvas selector.
     */
    function diagram(canvas)
    {
        this.canvas = d3.select(canvas);
        this.nodes = [];
        this.wires = [];

        this.layers = {
            'wires': this.canvas.append('g'),
            'nodes': this.canvas.append('g'),
            'draw': this.canvas.append('g')
        };

        this.wire = new diagram.wire(this);
    }

    /**
     * Return layer of specified name. Returns the canvas node if no layer name
     * is specified.
     *
     * @param   string      name                Name of layer to get.
     * @return  node                            Layer node.
     */
    diagram.prototype.getLayer = function(name)
    {
        return (typeof name !== 'undefined'
                ? this.layers[name]
                : this.canvas);
    }

    /**
     * Add multiple wires.
     *
     * @param   array       wires               Array of wires.
     */
    diagram.prototype.addWires = function(wires)
    {
        wires.forEach(function(data) {
            this.addWire(data);
        }, this);
    }

    /**
     * Add a single wire to diagram.
     *
     * @param   object      data                Wire data.
     */
    diagram.prototype.addWire = function(data)
    {
        var wire = new diagram.wire(this, data);
    
        this.wires.push(wire);
    
        wire.render(this.getLayer('wires'));
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

        node.render(this.getLayer('nodes'));
    }
    
    return diagram;
})();
