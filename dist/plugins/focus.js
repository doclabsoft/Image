goog.provide('DD.ui.image.plugins.Focus');

goog.require('DD.plugins.PluginInstrument');
goog.require('DD.ui.image.Focus');

DD.ui.image.plugins.Focus = function(targetObject)
{
	DD.plugins.PluginInstrument.call(this, targetObject);

	this.targetObject_ = targetObject;
	this.focus_ = new DD.ui.image.Focus({
		width     : 80,
		height    : 80,
		sliders   : {
			SOUTHWEST : {
				enabled: false
			},
			SOUTHEAST : {
				enabled: false
			},
			NORTHWEST : {
				enabled: false
			},
			NORTHEAST : {
				enabled: false
			},
			WEST : {
				visible: false
			},
			EAST : {
				visible : false
			},
			NORTH : {
				visible: false
			},
			SOUTH : {
				visible: false
			}
		}
	});

	this.focus_.listen(DD.ui.image.Focus.EventTypes.PROPERTY_CHANGE, function(event)
	{
		var data = this.targetObject_.data;
		data.focusX = (data.scaledX + event.data.focusX) / data.ratio;
		data.focusY = (data.scaledY + event.data.focusY) / data.ratio;

		this.targetObject_.dispatchEvent({
			type   : DD.ui.image.plugins.Focus.EventTypes.PROPERTY_FOCUS_CHANGE,
			focusX : data.focusX,
			focusY : data.focusY
		});

		this.focus_.setFocusInternal(data.focusX, data.focusY);
	}, false, this);

	this.targetObject_.listen(DD.ui.image.Editor.EventTypes.IMAGE_ZOOM_END, this.recalcFocusCenter_, false, this);
};
goog.inherits(DD.ui.image.plugins.Focus, DD.plugins.PluginInstrument);

DD.ui.image.plugins.Focus.publicMethods = ['show', 'hide', 'getFocus', 'reset', 'resetToDefault'];

DD.ui.image.plugins.Focus.pluginName = 'instrumentFocus';

DD.ui.image.plugins.Focus.EventTypes = {
	PROPERTY_FOCUS_CHANGE : 'imageeditor.focus.property_change'
};

goog.scope(function()
{
	/** @alias DD.ui.image.plugins.Focus.prototype */
	var prototype = DD.ui.image.plugins.Focus.prototype,
	    superClass_ = DD.ui.image.plugins.Focus.superClass_;

	prototype.getFocus = function()
	{
		var data = this.targetObject_.data;

		if (!data.focusX || !data.focusY)
			return null;

		return {
			focusX : data.focusX,
			focusY : data.focusY
		};
	};

	prototype.hideInstruments_ = function()
	{
		return new Promise(function(resolve) {
			// Подписка на событие прятание визуальных инструментов в редакторе изображений
			this.targetObject_.listenOnce(DD.ui.image.Editor.EventTypes.INSTRUMENTS_CLEAR, resolve);
			this.targetObject_.hideInstruments();
		}.bind(this));
	};

	prototype.show_ = function()
	{
		superClass_.show.call(this);

		this.targetObject_.blockZoom(true);
		var data = this.targetObject_.data;
		this.focus_.setFocusInternal(data.focusX, data.focusY);

		if (!this.focus_.isInDocument())
			this.focus_.render(this.targetObject_.getElement());
		else
			this.focus_.show();
	};

	prototype.show = function()
	{
		var smoothZoom = this.targetObject_.getSmoothZoom();
		this.targetObject_.listen(DD.ui.image.Editor.EventTypes.RESIZE, this.update_, false, this);

		if (smoothZoom)
		{
			var promisess = [
				new Promise(function(resolve)
				{
					smoothZoom.listenOnce('zoomend', resolve);
					smoothZoom.setZoom(1, 20);
				}),
				this.hideInstruments_()
			];

			Promise.all(promisess).then(this.show_.bind(this));
		}
		else
			this.hideInstruments_().then(this.show_.bind(this));
	};

	prototype.hide = function()
	{
		var isVisible = this.isVisible();
		this.targetObject_.unlisten(DD.ui.image.Editor.EventTypes.RESIZE, this.update_, false, this);

		if (!this.focus_.isInDocument() || !isVisible)
		{
			this.dispatchEvent(DD.plugins.PluginInstrument.EventTypes.AFTER_HIDE);
			return;
		};
		superClass_.hide.call(this);

		new Promise(function(resolve){
			this.focus_.listenOnce('after_hide', resolve);
			this.targetObject_.blockZoom(false);
			this.focus_.hide();
		}.bind(this))
		.then(function(){
			this.dispatchEvent(DD.plugins.PluginInstrument.EventTypes.AFTER_HIDE);
		}.bind(this));
	};

	prototype.reset = function()
	{
		this.focus_.reset();
	};

	prototype.resetToDefault = function()
	{
		this.targetObject_.data = this.targetObject_.initialData;
		this.focus_.resetToDefault(this.targetObject_.initialData);
	};

	prototype.recalcFocusCenter_ = function()
	{
		this.focus_.recalcFocusCenter();
	};

	prototype.update_ = function()
	{
		this.focus_.update();
	};
}); // goog.scope