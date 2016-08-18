goog.provide('DD.ui.Zoom.PanButton');

goog.require('goog.ui.Button');
goog.require('goog.ui.registry');
goog.require('DD.ui.Zoom.renderer.PanButton');

DD.ui.Zoom.PanButton = function(content, opt_renderer, opt_domHelper){
	goog.ui.Button.call(this, content, opt_renderer ||
	DD.ui.Zoom.renderer.PanButton.getInstance(), opt_domHelper);
};
goog.inherits(DD.ui.Zoom.PanButton, goog.ui.Button);

/** @override */
DD.ui.Zoom.PanButton.prototype.handleMouseDown = function(e){
	DD.ui.Zoom.PanButton.superClass_.handleMouseDown.call(this, e);
	if(this.isEnabled()){
		this.dispatchEvent(new goog.events.Event(goog.events.EventType.MOUSEDOWN, this));
	}
	e.stopPropagation();
	e.preventDefault();
};