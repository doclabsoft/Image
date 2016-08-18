goog.provide('DD.ui.canvas.Control');

goog.require('DD.plugins.Pluginable');
goog.require('DD.ui.canvas.renderer.Control');

/**
 * Компонент для использование канваса для преобразования изображений
 * @param {Function} plugins Класс плагина
 */
DD.ui.canvas.Control = function(plugins)
{
	DD.plugins.Pluginable.call(this);

	if (plugins && plugins.length)
		this.setupPlugins(plugins);
};
goog.inherits(DD.ui.canvas.Control, DD.plugins.Pluginable);
goog.ui.registry.setDefaultRenderer(DD.ui.canvas.Control, DD.ui.canvas.renderer.Control);

DD.ui.canvas.Control.EventTypes = {
	IMAGE_LOADED  : 'image_loaded',
	CANVAS_CHANGE : 'canvas_change'
};

goog.scope(function()
{
	/** @alias DD.ui.canvas.Control.prototype */
	var prototype = DD.ui.canvas.Control.prototype;

	/**
	 * Загружает изображение в на полотно канваса
	 * @param  {String} srcImage Путь к изображению
	 */
	prototype.loadImage = function(srcImage)
	{
		goog.isString(srcImage) && this.getRenderer().loadImage(this, srcImage);
	};

	/**
	 * Инициализация плагинов
	 * @param {Function} plugins Класс плагина
	 */
	prototype.setupPlugins = function(plugins)
	{
		for (var i = 0; i < plugins.length; i++)
			this.addPlugin(plugins[i])
	};

	/**
	 * Получение DOM-элемента канваса
	 * @return {HTMLelement}
	 * @private
	 */
	prototype.getCanvasElement_ = function()
	{
		return this.canvasElement_;
	};

	/**
	 * Сохранение DOM-элемента канваса
	 * @param {HTMLelement} value DOM-элемент канваса
	 * @private
	 */
	prototype.setCanvasElement_ = function(value)
	{
		this.canvasElement_ = value;
	};

	/**
	 * Получение DOM-элемента изображения
	 * @return {HTMLImageElement}
	 * @private
	 */
	prototype.getCanvasImage_ = function()
	{
		return this.canvasImage_;
	};

	/**
	 * Сохранение DOM-элемента изображения
	 * @param {HTMLImageElement} value DOM-элемент изображения
	 * @private
	 */
	prototype.setCanvasImage_ = function(value)
	{
		this.canvasImage_ = value;
	};


	/**
	 * Вызывается в случае изменения изображения внутри канваса
	 * @param {String} newCanvasImage Новое изображение
	 */
	prototype.setCanvasChange = function(newCanvasImage, blob)
	{
		this.dispatchEvent({
			type           : DD.ui.canvas.Control.EventTypes.CANVAS_CHANGE,
			newCanvasImage : newCanvasImage,
			blob           : blob
		});
	};

	/**
	 * Вызывается в случае изменения изображения внутри канваса
	 * @param {String} newCanvasImage Новое изображение
	 */
	prototype.setCanvasImageLoaded = function(base64, blob)
	{
		this.dispatchEvent({
			type   : DD.ui.canvas.Control.EventTypes.IMAGE_LOADED,
			base64 : base64,
			blob   : blob
		});
	};

	/**
	 * Сохранение/получение DOM-элемента изображения
	 * @name DD.ui.canvas.Control.prototype#canvasImage
	 * @type {HTMLImageElement}
	 * @public
	*/
	Object.defineProperty(prototype, "canvasImage", {
		get: prototype.getCanvasImage_,
		set: prototype.setCanvasImage_
	});

	/**
	 * Сохранение/получение DOM-элемента канваса
	 * @name DD.ui.canvas.Control.prototype#canvasElement
	 * @type {HTMLCanvasElement}
	 * @public
	*/
	Object.defineProperty(prototype, "canvasElement", {
		get: prototype.getCanvasElement_,
		set: prototype.setCanvasElement_
	});

}); // goog.scope