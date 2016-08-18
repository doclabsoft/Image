goog.provide('DD.ui.canvas.renderer.Control');

goog.require('DD.ui.renderer.Component');

/**
 * Рандерер для компонента DD.ui.canvas.Control
 */
DD.ui.canvas.renderer.Control = function()
{
	DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.canvas.renderer.Control, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.canvas.renderer.Control);

DD.ui.canvas.renderer.Control.CSS_CLASS = 'DD-canvas-control';

goog.scope(function()
{
	/** @alias DD.ui.canvas.renderer.Control.prototype */
	var prototype = DD.ui.canvas.renderer.Control.prototype;

	/**
	 * @override
	 */
	prototype.getCssClass = function()
	{
		return DD.ui.canvas.renderer.Control.CSS_CLASS;
	};

	/**
	 * @override
	 */
	prototype.initializeDom = function(component)
	{
		component.$cache('rendererSettings', {});
		this.createCanvas_(component);
	};

	/**
	 * Создание DOM-канваса
	 * @param  {DD.ui.canvas.Control} component DD.ui.canvas.Control
	 */
	prototype.createCanvas_ = function(component)
	{
		var O = component.$cache('rendererSettings');

		O.canvas = goog.dom.createDom(goog.dom.TagName.CANVAS);
		goog.style.setStyle(O.canvas,
		{
			'position'   : 'fixed',
			'left'       : '0',
			'top'        : '0',
			'z-index'    : '-1',
			'display'    : 	'none'
		});

		component.getElement().appendChild(O.canvas);
		component.$cache('rendererSettings', O);
		component.canvasElement = O.canvas;
	};

	/**
	 * Загрузка нового изображение на полотно в канвас
	 * @param  {DD.ui.canvas.Control} component DD.ui.canvas.Control
	 * @param  {String}               srcImage  Путь к изображению
	 */
	prototype.loadImage = function(component, srcImage)
	{
		var O = component.$cache('rendererSettings');
		var image = new Image();
		image.crossOrigin = "use-credentials";
		// image.crossOrigin = "Anonymous";
		image.src = srcImage;

		image.onload = function()
		{
			var width = this.naturalWidth;
			var height = this.naturalHeight;
			O.canvas.width = width;
			O.canvas.height = height;
			var ctx = O.canvas.getContext('2d');
			ctx.fillStyle="#000";
			ctx.fillRect(0, 0, width, height);
			ctx.drawImage(image, 0, 0, width, height, 0, 0, width, height);
			O.toDataURL = O.canvas.toDataURL("image/jpeg", 1.0);
			
			

			var toBlob = function(blob) {
				component.setCanvasImageLoaded(O.toDataURL, blob);
			}.bind(this);

			O.canvas.toBlob(toBlob, "image/jpeg", 1.0);
		};

		component.canvasImage = image;
	};
}); // goog.scope