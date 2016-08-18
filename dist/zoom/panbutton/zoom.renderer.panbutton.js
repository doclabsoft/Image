goog.provide('DD.ui.Zoom.renderer.PanButton');

goog.require('goog.ui.FlatButtonRenderer');

/**
 * Renderer for pan buttons
 * @constructor
 */
DD.ui.Zoom.renderer.PanButton = function(){
    goog.base(this);
};
goog.inherits(DD.ui.Zoom.renderer.PanButton, goog.ui.FlatButtonRenderer);
goog.addSingletonGetter(DD.ui.Zoom.renderer.PanButton);

/**
 * Default CSS class to be applied to the root element of components rendered
 * by this renderer.
 * @type {string}
 */
DD.ui.Zoom.renderer.PanButton.CSS_CLASS = goog.getCssName('DD-btn');

/**
 * @override
 * @returns {*}
 */
DD.ui.Zoom.renderer.PanButton.prototype.getCssClass = function() {
    return DD.ui.Zoom.renderer.PanButton.CSS_CLASS;
};