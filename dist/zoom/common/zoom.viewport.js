goog.provide('DD.ui.Zoom.ViewPort');

goog.require('goog.events.EventType');
goog.require('goog.events.EventTarget');
goog.require('DD.ui.Zoom.Constants');

DD.ui.Zoom.ViewPort = function(){
	goog.base(this);
	this.width_ = '100%';
	this.height_ = '100%';
	this.aspectWidth_ = DD.ui.Zoom.Constants.DEFAULT_ASPECT_WIDTH;
	this.aspectHeight_ = DD.ui.Zoom.Constants.DEFAULT_ASPECT_HEIGHT;
	this.minHeight_ = 0;
};
goog.inherits(DD.ui.Zoom.ViewPort, goog.events.EventTarget);

goog.scope(function(){
	var prototype = DD.ui.Zoom.ViewPort.prototype;

	prototype.getWidth = function() {
		return this.width_;
	};

	/**
	 * Set width. Recalculates height to keep aspect ratio and checks for minimum value.
	 * @param value
	 */
	prototype.setWidth = function(value) {
		if (goog.isString(value))
			var isPercent = value.match(/%/);

		if (isPercent)
			this.width_ = value;
		else
		{
			this.width_ = value > DD.ui.Zoom.Constants.DEFAULT_WIDTH ? value : DD.ui.Zoom.Constants.DEFAULT_WIDTH;
			this.recalculateHeight_();
		};
	};

	prototype.getHeight = function() {
		return this.height_;
	};

	/**
	 * Set height. Recalculates width to keep aspect ratio and checks for minimum value.
	 * @param value
	 */
	prototype.setHeight = function(value) {
		if (goog.isString(value))
			var isPercent = value.match(/%/);

		if (isPercent)
			this.height_ = value
		else
		{
			this.height_ = value > this.getMinHeight_() ? value : this.getMinHeight_();
			this.recalculateWidth_();
		};
	};

	prototype.getAspectHeight = function() {
		return this.aspectHeight_;
	};

	/**
	 * @private
	 */
	prototype.setAspectHeight_ = function(value) {
		this.aspectHeight_ = value;
	};

	prototype.getAspectWidth = function() {
		return this.aspectWidth_;
	};

	/**
	 * @private
	 */
	prototype.setAspectWidth_ = function(value) {
		this.aspectWidth_ = value;
	};

	/**
	 * @private
	 */
	prototype.getMinHeight_ = function(){
		return this.minHeight_;
	};

	/**
	 * @private
	 */
	prototype.setMinHeight_ = function(value){
		this.minHeight_ = value;
	};

	/**
	 * Recalculate Height to keep aspect ratio.
	 * @private
	 */
	prototype.recalculateHeight_ = function(){
		this.height_ = this.getWidth() / this.getAspectWidth() * this.getAspectHeight();
		this.raiseChanged_();
	};

	/**
	 * Recalculate Width to keep aspect ratio.
	 * @private
	 */
	prototype.recalculateWidth_ = function() {
		this.width_ = this.getHeight() / this.getAspectHeight() * this.getAspectWidth();
		this.raiseChanged_();
	};

	/**
	 * Change aspect ratio. Recalculates ViewPort taking width value.
	 * @param width
	 * @param height
	 */
	prototype.setAspectRatio = function(width, height) {
		this.setAspectWidth_(width);
		this.setAspectHeight_(height);
		this.recalculateMinHeight_();
		this.recalculateHeight_();
	};

	/**
	 * Recalculates minimum Height.
	 * @returns {number}
	 * @private
	 */
	prototype.recalculateMinHeight_ = function(){
		return DD.ui.Zoom.Constants.DEFAULT_WIDTH / this.getAspectWidth() * this.getAspectHeight();
	};

	/**
	 * Raise ViewPort changed event to notify listeners.
	 * @private
	 */
	prototype.raiseChanged_ = function(){
		this.dispatchEvent(goog.events.EventType.CHANGE);
	};

}); //goog.scope