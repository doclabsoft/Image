goog.provide('DD.ui.Zoom.events');

/**
 * Media control's event type.
 * @type {{onChange: string}}
 */
DD.ui.Zoom.events.EventType = {
	onChange : 'onChange'
};

/**
 * Context of event.
 * @type {{CC_LOAD: string, CC_ROTATE: string, CC_RESET: string, CC_CLIP: string}}
 */
DD.ui.Zoom.events.CHANGE_CONTEXT = {
	CC_LOAD           : 'load',
	CC_ROTATE         : 'rotate',
	CC_RESET          : 'reset',
	CC_CROP           : 'crop',
	CC_ZOOM           : 'zoom',
	ZOOM_PAN_COMPLETE : 'zoom.pan.complete'
};

/**
 * Custom event type. Provides sender and context values.
 * @param sender
 * @param context
 * @constructor
 */
DD.ui.Zoom.events.ChangeEvent = function(sender, context){
	goog.events.Event.call(this, DD.ui.Zoom.events.EventType.onChange);
	this.sender_ = sender;
	this.context_ = context;
};
goog.inherits(DD.ui.Zoom.events.ChangeEvent, goog.events.Event);


goog.scope(function(){
	var prototype = DD.ui.Zoom.events.ChangeEvent.prototype;

	prototype.getSender = function(){
		return this.sender_;
	};

	/**
	 * @private
	 */
	prototype.setSender_ = function(value){
		this.sender_ = value;
	};

	prototype.getContext = function(){
		return this.context_;
	};

	/**
	 * @private
	 */
	prototype.setContext_ = function(value){
		this.context_ = value;
	};

}); // goog.scope