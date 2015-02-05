/**
 * Utilities for D3.
 */

/**
 * Helper function to move node in foreground.
 */
d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

