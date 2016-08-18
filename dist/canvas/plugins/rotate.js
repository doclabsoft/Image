goog.provide('DD.ui.canvas.plugins.Rotate');

goog.require('DD.plugins.Plugin');

/**
 * Плагин для DD.ui.canvas.Control, который позволяет переворачивать изображение
 * на 90° по или против часовой стрелки
 * @param {DD.ui.canvas.Control} targetObject DD.ui.canvas.Control
 */
DD.ui.canvas.plugins.Rotate = function(targetObject)
{
	DD.plugins.Plugin.call(this);

	this.targetObject_ = targetObject;
};
goog.inherits(DD.ui.canvas.plugins.Rotate, DD.plugins.Plugin);

/**
 * @override
 */
DD.ui.canvas.plugins.Rotate.publicMethods = ['rotate'];

/**
 * @override
 */
DD.ui.canvas.plugins.Rotate.pluginName = 'canvasRotate';

goog.scope(function()
{
	/** @alias DD.ui.canvas.plugins.Rotate.prototype */
	var prototype = DD.ui.canvas.plugins.Rotate.prototype;

	/**
	 * Метод переворота изображения на 90°
	 * @param  {Number} side Направление по которому переворачивается изображение [0 / 1]
	 */
	prototype.rotate = function(side)
	{
		var canvas = this.targetObject_.canvasElement,
		    image = this.targetObject_.canvasImage,
		    canvasSize = {
		        width  : canvas.width,
		        height : canvas.height
		    },
		    currentDegrees = side ? 90 : 270,
		    ctx = canvas.getContext('2d'),
		    newCanvasImage = '';

		if (currentDegrees == 90 || currentDegrees == 270)
		{
			canvas.width = canvasSize.height;
			canvas.height = canvasSize.width;
		}
		else
		{
			canvas.width = canvasSize.width;
			canvas.height = canvasSize.height;
		};

		/**
		 * Операция по повороту изображения в канвасе
		 */
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate(currentDegrees * Math.PI / 180);
		ctx.drawImage(image, -image.width/2, -image.height/2);
		newCanvasImage = canvas.toDataURL("image/jpeg", 1.0);

		var toBlob = function(blob) {
			this.targetObject_.setCanvasChange(newCanvasImage, blob);
		}.bind(this);

		canvas.toBlob(toBlob, "image/jpeg", 1.0);
	};

}); // goog.scope