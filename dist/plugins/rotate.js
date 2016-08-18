goog.provide('DD.ui.image.plugins.Rotate');

goog.require('DD.plugins.PluginInstrument');
goog.require('DD.ui.canvas.plugins.Rotate');

DD.ui.image.plugins.Rotate = function(targetObject)
{
	DD.plugins.PluginInstrument.call(this, targetObject);

	this.targetObject_ = targetObject;
	this.canvasObject_ = this.targetObject_.getCanvasObject();
	this.canvasObject_ && this.canvasObject_.addPlugin(DD.ui.canvas.plugins.Rotate);
};
goog.inherits(DD.ui.image.plugins.Rotate, DD.plugins.PluginInstrument);

DD.ui.image.plugins.Rotate.publicMethods = ['rotate'];

DD.ui.image.plugins.Rotate.pluginName = 'instrumentRotate';

goog.scope(function()
{
	/** @alias DD.ui.image.plugins.Rotate.prototype */
	var prototype = DD.ui.image.plugins.Rotate.prototype,
	    superClass_ = DD.ui.image.plugins.Rotate.superClass_;

	prototype.rotate = function(side)
	{
		Promise.all([
			this.hideInstruments_(),
			this.rotate_(side)
		])
		.then(function(result) {
			this.targetObject_.loadImage(result[1].newCanvasImage);
			this.targetObject_.blob = result[1].blob;
		}.bind(this));
	};

	prototype.hideInstruments_ = function()
	{
		return new Promise(function(resolve) {
			// Подписка на событие прятание визуальных инструментов в редакторе изображений
			this.targetObject_.listenOnce(DD.ui.image.Editor.EventTypes.INSTRUMENTS_CLEAR, resolve);
			this.targetObject_.hideInstruments();
		}.bind(this));
	};

	prototype.rotate_ = function(side)
	{
		return new Promise(function(resolve) {
			// Подписка на событие изменения изображение посредством инструментов канваса
			this.canvasObject_.listenOnce(DD.ui.canvas.Control.EventTypes.CANVAS_CHANGE, function(event) {
				resolve({newCanvasImage: event.newCanvasImage, blob: event.blob});
			});
			this.canvasObject_.canvasRotate_rotate(side);
		}.bind(this));
	};

	prototype.hide = function()
	{
		superClass_.hide.call(this);

		this.dispatchEvent(DD.plugins.PluginInstrument.EventTypes.AFTER_HIDE);
	};

	prototype.show = function()
	{
		superClass_.show.call(this);

		this.targetObject_.dispatchEvent(DD.plugins.PluginInstrument.EventTypes.BEFORE_SHOW);
	};
}); // goog.scope