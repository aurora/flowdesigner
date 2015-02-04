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
        this.scopes = {};

        this.layers = {
            'wires': this.canvas.append('g'),
            'nodes': this.canvas.append('g'),
            'draw': this.canvas.append('g')
        };

        this.wire = new diagram.wire(this);
    }

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
     * Import wires.
     *
     * @param   array       wires               Wires to build.
     */
    diagram.prototype.importWires = function(wires)
    {
        this.wire.importWires(wires);
    }

    /**
     * Return wires.
     *
     * @return  array                           Export all wires.
     */
    diagram.prototype.exportWires = function()
    {
        return this.wire.exportWires();
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
