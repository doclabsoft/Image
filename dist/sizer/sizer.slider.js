goog.provide('DD.ui.Sizer.Slider');

goog.require('DD.CollectionItem');

/**
 * Class of slider component
 * @param {DD.sizer.Sliders} owner
 * @param {Object=} opt_data Hash of the properties
 *  @param {Boolean=} opt_data.enabled=true Аvailability for sliders components
 *  @param {Boolean=} opt_data.visible=true Visibility for sliders components
 * @constructor
 * @extends {DD.CollectionItem}
 */
DD.ui.Sizer.Slider = function(owner, opt_data)
{
	DD.ui.Sizer.Slider.superClass_.constructor.call(this, owner, opt_data);

	opt_data = opt_data || {};

	this.enabled_ = goog.isBoolean(opt_data.enabled) ? opt_data.enabled : true;
	this.visible_ = goog.isBoolean(opt_data.visible) ? opt_data.visible : true;

	return this; 
};
goog.inherits(DD.ui.Sizer.Slider, DD.CollectionItem);

goog.scope(function()
{
	var prototype = DD.ui.Sizer.Slider.prototype;

	/**
	 * Get enabled value
	 * @return {Boolean}
	 */
	prototype.getEnabled = function()
	{
		return this.enabled_;
	};

	/**
	 * Set enabled property for component
	 * @param {Boolean} enabled
	 * @return {DD.sizer.Slider}
	 * @public
	 */
	prototype.setEnabled = function(enabled)
	{
		this.enabled_ = enabled;

		this.dispatchEvent(
		{
			type  : DD.ui.Sizer.Sliders.EventType.ENABLED,
			id    : this.getId(),
			value : this.enabled_
		});

		return this;
	};

	/**
	 * Get visible value
	 * @return {Boolean}
	 */
	prototype.getVisible = function()
	{
		return this.visible_;
	};

	/**
	 * Set visible property for component
	 * @param {Boolean} visible
	 * @return {DD.sizer.Slider}
	 * @public
	 */
	prototype.setVisible = function(visible)
	{
		this.visible_ = visible;

		this.dispatchEvent(
		{
			type  : DD.ui.Sizer.Sliders.EventType.VISIBLE,
			id    : this.getId(),
			value : this.visible_
		});

		return this;
	};

}); // goog.scope