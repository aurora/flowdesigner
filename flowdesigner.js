/**
 * Main flow designer class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

;(function() {
    /**
     * Constructor, create new diagram.
     *
     * @param   mixed       canvas              Canvas selector.
     * @param   object      options             Optional options.
     */
    function flowdesigner(canvas, options)
    {
        return new flowdesigner.diagram(canvas, options);
    }

    window.flowdesigner = flowdesigner;
})();
