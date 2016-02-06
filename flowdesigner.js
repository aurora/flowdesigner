/*
 * This file is part of the 'flowdesigner' package.
 *
 * (c) Harald Lapp
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Main flow designer class.
 *
 * @copyright   copyright (c) 2015-2016 by Harald Lapp
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
