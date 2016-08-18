goog.provide('DD.ui.Sizer.Sliders');

goog.require('goog.array');
goog.require('DD.Collection');
goog.require('DD.ui.Sizer.Slider');

/**
 * Class of sliders component
 * @param {Object=} properties Hash of the properties
 *   @param {Boolean=} properties.enabled=true Аvailability for sliders components
 *   @param {Boolean=} properties.visible=true Visibility for sliders components
 * @constructor
 * @extends {DD.Collection}
 */
DD.ui.Sizer.Sliders = function(properties)
{
	DD.Collection.call(this, DD.ui.Sizer.Slider);

	this.initSliders_(properties);
	this.addSlidersPropsListeners();
};
goog.inherits(DD.ui.Sizer.Sliders, DD.Collection);

/**
 * Priority values for sliders elements.
 * @enum {Number}
 */
DD.ui.Sizer.Sliders.Priority = {
	'EAST'      : 1,
	'SOUTH'     : 3,
	'WEST'      : 5,
	'NORTH'     : 7,
	'NORTHWEST' : 6,
	'NORTHEAST' : 2,
	'SOUTHEAST' : 0,
	'SOUTHWEST' : 4
};

/**
 * EventTypes of component.
 * @enum {String}
 */
DD.ui.Sizer.Sliders.EventType = {
	ENABLED : 'enabled',
	VISIBLE : 'visible'
};

/**
 * Default properties of component.
 * @enum {Boolean}
 */
DD.ui.Sizer.Sliders.DefaultProperties = {
	ENABLED : true, 
	VISIBLE : true
};

goog.scope(function()
{
	var prototype = DD.ui.Sizer.Sliders.prototype;
	/**
	 * Initializing sliders object; set properties
	 * @param  {Object=} properties 
	 * @return {DD.sizer.Sliders}
	 * @private
	 */
	prototype.initSliders_ = function(properties)
	{
		var properties = properties || DD.ui.Sizer.Sliders.DefaultProperties,
		    ids = Object.keys(DD.ui.Sizer.Sliders.Priority),
		    sliders = [],
		    enabled = new Boolean(),
		    visible = new Boolean();

		properties.enabled = properties.enabled == undefined ? DD.ui.Sizer.Sliders.DefaultProperties.ENABLED : properties.enabled;
		properties.visible = properties.visible == undefined ? DD.ui.Sizer.Sliders.DefaultProperties.VISIBLE : properties.visible;

		goog.array.forEach(ids, function(id)
		{
			var hasSliderSettings = properties[id];
			if (goog.isObject(hasSliderSettings))
			{
				enabled = hasSliderSettings.enabled;
				visible = hasSliderSettings.visible;
			}
			else
			{
				enabled = properties.enabled;
				visible = properties.visible;
			};

			sliders.push({
				id      : id,
				enabled : enabled,
				visible : visible
			});
		});

		this.setSliders(sliders);

		return this;
	};

	/**
	 * Add sliders from input array
	 * @param {Object[]} sliders
	 * @return {DD.sizer.Sliders}
	 * @public
	 */
	prototype.setSliders = function(sliders)
	{
		goog.array.forEach(sliders, function(slider)
		{
			this.add(slider);
		}.bind(this));

		return this;
	};

	/**
	 * Get priority value by slider id
	 * @param  {String} sliderId
	 * @return {Number}
	 * @public
	 */
	prototype.getPriorityById = function(sliderId)
	{
		return DD.ui.Sizer.Sliders.Priority[sliderId];
	};

	/**
	 * Run setting enabled property for sliders components
	 * @param {Boolean} enabled
	 * @return {DD.sizer.Sliders}
	 * @public
	 */
	prototype.setEnabled = function(enabled)
	{
		this.setEnabledSliders_(enabled);

		return this;
	};

	/**
	 * Set enabled property for sliders components
	 * @param {Boolean} enabled
	 * @return {DD.sizer.Sliders}
	 * @private
	 */
	prototype.setEnabledSliders_ = function(enabled)
	{
		for (var i = 0, count = this.getCount(); i < count; i++)
		{
			var slider = this.get(i);
			slider.setEnabled(enabled);
		};

		return this;
	};

	/**
	 * Run setting visible property for sliders components
	 * @param {Boolean} visible
	 * @return {DD.sizer.Sliders}
	 * @public
	 */
	prototype.setVisible = function(visible)
	{
		this.setVisibleSliders_(visible);
		return this;
	};

	/**
	 * Set visible property for sliders components
	 * @param {Boolean} enabled
	 * @return {DD.sizer.Sliders}
	 * @private
	 */
	prototype.setVisibleSliders_ = function(visible)
	{
		for (var i = 0, count = this.getCount(); i < count; i++)
		{
			var slider = this.get(i);
			slider.setVisible(visible);
		};

		return this;
	};

	/**
	 * Add DD.sizer.Sliders.EventType events listeners for sliders objects and forwarding its
	 */
	prototype.addSlidersPropsListeners = function()
	{
		var events = goog.object.getValues(DD.ui.Sizer.Sliders.EventType);

		for (var i = 0, count = this.getCount(); i < count; i++)
		{
			var slider = this.get(i);
			goog.events.listen(
				slider,
				[events],
				function(e)
				{
					this.dispatchEvent({
						type  : e.type,
						id    : e.id,
						value : e.value
					});
				}.bind(this)
			);
		};
	};

}); // goog.scope