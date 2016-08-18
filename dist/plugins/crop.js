goog.provide('DD.ui.image.plugins.Crop');

goog.require('DD.plugins.PluginInstrument');
goog.require('DD.ui.canvas.plugins.Crop');
goog.require('DD.ui.image.Grid');

/**
 * Плагин для редактора изображений
 * @param {DD.ui.image.Editor} targetObject DD.ui.image.Editor
 */
DD.ui.image.plugins.Crop = function(targetObject)
{
	DD.plugins.PluginInstrument.call(this, targetObject);

	/**
	 * Компонент, к которому приписан данный класс
	 * @type {DD.plugins.Pluginable}
	 */
	this.targetObject_ = targetObject;
	this.canvasObject_ = this.targetObject_.getCanvasObject();
	this.canvasObject_ && this.canvasObject_.addPlugin(DD.ui.canvas.plugins.Crop);

	/**
	 * Объект сетка
	 * @type {DD.ui.image.Grid}
	 */
	this.grid_ = new DD.ui.image.Grid();
};
goog.inherits(DD.ui.image.plugins.Crop, DD.plugins.PluginInstrument);

DD.ui.image.plugins.Crop.publicMethods = ['show', 'hide', 'crop'];

DD.ui.image.plugins.Crop.pluginName = 'instrumentCrop';

goog.scope(function()
{
	/** @alias DD.ui.image.plugins.Crop.prototype */
	var prototype = DD.ui.image.plugins.Crop.prototype,
	    superClass_ = DD.ui.image.plugins.Crop.superClass_;

	prototype.show = function()
	{
		this.targetObject_.listen(DD.ui.image.Editor.EventTypes.IMAGE_ZOOM_END, this.update_, false, this);
		this.hideInstruments_().then(this.show_.bind(this));
	};

	prototype.hide = function()
	{
		if (!this.grid_.isInDocument() || !this.isVisible_)
		{
			this.dispatchEvent(DD.plugins.PluginInstrument.EventTypes.AFTER_HIDE);
			return;
		};

		this.targetObject_.unlisten(DD.ui.image.Editor.EventTypes.IMAGE_ZOOM_END, this.update_, false, this);

		superClass_.hide.call(this);

		new Promise(function(resolve){
			this.grid_.listenOnce('after_hide', resolve);
			this.targetObject_.blockZoom(false);
			this.grid_.hide();
			this.isVisible_ = false;
		}.bind(this))
		.then(function(){
			this.dispatchEvent(DD.plugins.PluginInstrument.EventTypes.AFTER_HIDE);
		}.bind(this));
	};

	prototype.crop = function()
	{
		var isGridVisible = this.grid_.isVisible();

		if (!isGridVisible)
		{
			console && console.warn('Сетка инструмента Crop не вызвана');
			return;
		};

		new Promise(function(resolve, reject)
		{
			this.canvasObject_.listenOnce(DD.ui.canvas.Control.EventTypes.CANVAS_CHANGE, function(event) {
				resolve({newCanvasImage: event.newCanvasImage, blob: event.blob});
			}, false, this);
		}.bind(this))
		.then(function(image)
		{
			this.targetObject_.loadImage(image.newCanvasImage);
			this.targetObject_.blob = image.blob;
			this.hide();
		}.bind(this));

		var data = this.targetObject_.data,
		    image = this.targetObject_.getImageElement(),
		    gridElement = this.grid_.getElement(),
		    x = (data.scaledX + gridElement.offsetLeft) / data.ratio,
		    y = (data.scaledY + gridElement.offsetTop) / data.ratio,
		    width = gridElement.offsetWidth / data.ratio,
		    height = gridElement.offsetHeight  / data.ratio;

		(width < 1) && (width = 1);
		(height < 1) && (height = 1);

		if (x < 0)
		{
			width += x;
			x = 0;
		};

		if (y < 0)
		{
			height += y;
			y = 0;
		};

		this.canvasObject_.canvasCrop_crop(x, y, width, height);
	};

	prototype.cropByCoord = function(x, y, width, height)
	{
		this.canvasObject_.canvasCrop_crop(x, y, width, height);
	};

	prototype.renderGrid_ = function()
	{
		this.grid_.render( this.targetObject_.getElement());
	};

	prototype.hideInstruments_ = function()
	{
		return new Promise(function(resolve) {
			// Подписка на событие прятание визуальных инструментов в редакторе изображений
			this.targetObject_.listenOnce(DD.ui.image.Editor.EventTypes.INSTRUMENTS_CLEAR, resolve);
			this.targetObject_.hideInstruments();
		}.bind(this));
	};

	prototype.update_ = function()
	{
		this.grid_.update();
	};

	prototype.show_ = function()
	{
		superClass_.show.call(this);

		this.targetObject_.blockZoom(true);
		if (!this.grid_.isInDocument())
			this.renderGrid_();
		else
			this.grid_.show();
	};
}); // goog.scope