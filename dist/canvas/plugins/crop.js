goog.provide('DD.ui.canvas.plugins.Crop');

goog.require('DD.plugins.Plugin');
/**
 * Плагин для DD.ui.canvas.Control, который позволяет обрезать изображения по
 * заданным координатам
 * @param {DD.ui.canvas.Control} targetObject DD.ui.canvas.Control
 */
DD.ui.canvas.plugins.Crop = function(targetObject)
{
	DD.plugins.Plugin.call(this);

	this.targetObject_ = targetObject;
};
goog.inherits(DD.ui.canvas.plugins.Crop, DD.plugins.Plugin);

/**
 * @override
 */
DD.ui.canvas.plugins.Crop.publicMethods = ['crop'];

/**
 * @override
 */
DD.ui.canvas.plugins.Crop.pluginName = 'canvasCrop';

goog.scope(function()
{
	/** @alias DD.ui.canvas.plugins.Crop.prototype */
	var prototype = DD.ui.canvas.plugins.Crop.prototype;

	/**
	 * Метод обрезания изображения в канвасе
	 * @param  {Number} x      Координата верхнего левого угла по оси X
	 * @param  {Number} y      Координата верхнего левого угла по оси Y
	 * @param  {Number} width  Ширина, используется для получение координаты нижнего правого угла по оси X
	 * @param  {Number} height Высота, используется для получение координаты нижнего правого угла по оси Y
	 */
	prototype.crop = function(x, y, width, height)
	{
		var canvas = this.targetObject_.canvasElement,
		    image = this.targetObject_.canvasImage,
		    ctx = canvas.getContext('2d'),
		    newCanvasImage = '';

		canvas.width = width;
		canvas.height = height;
		ctx.fillStyle="#000";
		ctx.fillRect(0, 0, width, height);
		ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
		newCanvasImage = canvas.toDataURL("image/jpeg", 1.0);

		var toBlob = function(blob) {
			this.targetObject_.setCanvasChange(newCanvasImage, blob);
		}.bind(this);

		canvas.toBlob(toBlob, "image/jpeg", 1.0);
	};

}); // goog.scope