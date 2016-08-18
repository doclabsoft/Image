goog.provide('DD.ui.image.Editor');

goog.require('DD.ui.image.renderer.Editor');
goog.require('DD.ui.image.plugins.Rotate');
goog.require('DD.ui.image.plugins.Crop');
goog.require('DD.ui.image.plugins.Focus');
goog.require('DD.ui.Zoom.Control');
goog.require('DD.ui.canvas.Control');
goog.require('DD.plugins.Pluginable');
goog.require('goog.ui.registry');

/**
 * Редактор изображений
 * @param {Object} settings Список настроек редактора изображений
 */
DD.ui.image.Editor = function(settings)
{
	DD.plugins.Pluginable.call(this, settings);

	/**
	 * Список настроек редактора изображений
	 * @type {Object}
	 * @public
	 */
	this.settings = this.assignParams(!settings && (settings = {}), DD.ui.image.Defaults);

	/**
	 * Список подключенных инструментов/плагинов
	 * @type {Array}
	 * @private
	 */
	this.instruments_ = [];

	/**
	 * Список свойств изображения в редакторе
	 * @type {Object}
	 * @private
	 */
	this.data_ = {};

	/**
	 * Список изначальных свойств. При вызове метода reset свойства редактора будут сбрасываться до свойст,
	 * записанные в этом объекте
	 * @type {Object}
	 * @private
	 */
	this.initialData_ = {};

	/**
	 * Компонент DD.ui.Zoom.Control, позволяющий увеличивать/уменьшать изображение
	 * @type {DD.ui.Zoom.Control}
	 * @private
	 */
	this.smoothZoom_ = new DD.ui.Zoom.Control();
	this.addChild(this.smoothZoom_, true);

	/**
	 * Компонент DD.ui.canvas.Control, позволяющий работать с канвасом
	 * @type {DD.ui.canvas.Control}
	 * @private
	 */
	this.canvasObject_ = new DD.ui.canvas.Control()
	this.addChild(this.canvasObject_, true);

	/**
	 * Определение стандартных плагинов редактора изображений
	 */
	this.setupPlugins([
		DD.ui.image.plugins.Rotate,
		DD.ui.image.plugins.Crop,
		DD.ui.image.plugins.Focus
	]);
};
goog.inherits(DD.ui.image.Editor, DD.plugins.Pluginable);
goog.ui.registry.setDefaultRenderer(DD.ui.image.Editor, DD.ui.image.renderer.Editor);

/**
 * Список событий редактора изображений
 * @enum {String}
 */
DD.ui.image.Editor.EventTypes = {
	// Все визуальны инструменты скрыты
	INSTRUMENTS_CLEAR : 'imageeditor.instruments.clear',
	// Закончена загрузка изображения в редактор
	IMAGE_LOAD_END    : 'imageeditor.load.end',
	// Закончено изменение размеров изображения в редакторе
	IMAGE_ZOOM_END    : 'imageeditor.zoom.end',
	// Изменение величины окна браузера
	RESIZE            : 'imageeditor.resize',
	// Создание blob-объекта
	BLOB              : 'imageeditor.blob',
};

goog.scope(function()
{
	/** @alias DD.ui.image.Editor.prototype */
	var prototype = DD.ui.image.Editor.prototype;
	var superClass_ = DD.ui.image.Editor.superClass_;

	/**
	 * Инициализация плагинов
	 * @param  {DD.plugins.Plugin} plugins DD.plugins.Plugin
	 */
	prototype.setupPlugins = function(plugins)
	{
		for (var i = 0; i < plugins.length; i++)
			this.addPlugin(plugins[i])
	};

	/**
	 * @override
	 */
	prototype.enterDocument = function()
	{
		DD.ui.image.Editor.superClass_.enterDocument.call(this);

		var handler = this.getHandler();
		handler.listen(this.smoothZoom_, DD.ui.Zoom.events.CHANGE_CONTEXT.CC_LOAD, this.imageLoaded);
		handler.listen(this.smoothZoom_, DD.ui.Zoom.events.CHANGE_CONTEXT.ZOOM_PAN_COMPLETE, this.imageZoomComplete);
		handler.listen(this.smoothZoom_, 'zoomend', this.imageLoadEnd_);
		handler.listen(this.canvasObject_, DD.ui.canvas.Control.EventTypes.IMAGE_LOADED, this.canvasImageLoaded);
		handler.listen(window, 'resize', this.resize_);
	};

	/**
	 * Вызывается по окончанию анимации уменьшения/увеличения изображения
	 * @param  {goog.events.Event} event [goog.events.Event
	 */
	prototype.imageLoadEnd_ = function(event)
	{
		var smoothZoomData = this.smoothZoom_.getSmoothZoomData();
		var defaultData = {
			ratio      : smoothZoomData.ratio,
			scaledX    : smoothZoomData.scaledX,
			scaledY    : smoothZoomData.scaledY,
			normHeight : smoothZoomData.normHeight,
			normWidth  : smoothZoomData.normWidth
		};
		this.setData_(defaultData);
	};

	prototype.getSmoothZoom = function()
	{
		return this.smoothZoom_;
	};

	/**
	 * Вызывается по окончанию загрузки нового изображения в редактор
	 * @param  {goog.events.Event} event [goog.events.Event
	 */
	prototype.imageLoaded = function(event) 
	{
		this.dispatchEvent(DD.ui.image.Editor.EventTypes.IMAGE_LOAD_END);
	};

	prototype.imageZoomComplete = function(event) 
	{
		this.dispatchEvent(DD.ui.image.Editor.EventTypes.IMAGE_ZOOM_END);
	};

	prototype.canvasImageLoaded = function(event)
	{
		this.setData_(
		{
			base64 : event.base64,
			blob   : event.blob
		});

		this.dispatchEvent({
			type    : DD.ui.image.Editor.EventTypes.BLOB,
			base64  : event.base64,
			blob    : event.blob
		});
	};

	/**
	 * Загрузка нового изображения
	 * @param  {String} src Путь к изображению
	 */
	prototype.loadImage = function (src)
	{
		this.smoothZoom_.load(src);
		this.canvasObject_.loadImage(src);

		this.setImageSrc_(src);
	};

	/**
	 * Изменение выличины окна браузера
	 * @param {event} value Url изображения
	 * @private
	 */
	prototype.resize_ = function (event)
	{
		if (this.resizeTimeout_)
		{
			clearTimeout(this.resizeTimeout_)
			this.resizeTimeout_ = 0;
		};

		this.resizeTimeout_ = setTimeout(function()
		{
			this.dispatchEvent(DD.ui.image.Editor.EventTypes.RESIZE);
		}.bind(this), 300);
	};


	/**
	 * @param {Object} value
	 * @private
	 */
	prototype.setBlob_ = function (value)
	{
		this.blob_ = value;
	};

	/**
	 * @param {Object} value
	 * @private
	 */
	prototype.getBlob_ = function ()
	{
		return this.blob_;
	};
	/**
	 * Сохранение url изображения
	 * @param {String} value Url изображения
	 * @private
	 */
	prototype.setImageSrc_ = function (value)
	{
		this.imageSrc_ = value;
	};

	/**
	 * Получение url изображения
	 * @return {String}
	 * @private
	 */
	prototype.getImageSrc_ = function ()
	{
		return this.imageSrc_;
	};

	/**
	 * Назначение изначальных данных редактора
	 * @param {Object} value Изначальные свойства изображения
	 * @private
	 */
	prototype.setInitialData_ = function (value)
	{
		this.initialData_ = this.assignParams(value, this.initialData_);
	};

	/**
	 * Получение изначальных данных редактора
	 * @private
	 */
	prototype.getInitialData_ = function (value)
	{
		return this.initialData_;
	};

	/**
	 * Сохранение свойств изображения
	 * @param {Object} value Свойства изображения
	 * @private
	 */
	prototype.setData_ = function (value)
	{
		this.data_ = this.assignParams(value, this.data_);
	};

	/**
	 * Получение свойств изображения
	 * @param {Object} value Свойства изображения
	 * @private
	 */
	prototype.getData_ = function ()
	{
		return this.data_;
	};

	/**
	 * Получение HTML-элемента рисунка
	 * @return {HTMLImageElement}
	 * @public
	 */
	prototype.getImageElement = function ()
	{
		return this.getElement().getElementsByTagName('img')[0];
	};

	/**
	 * Отображение/скрытие сетки
	 * @param  {Boolean} value Флаг, отвечающий за отображение/скрытие сетки
	 * @public
	 */
	prototype.showGrid = function (value)
	{

		var element = this.getElement();
		if (!this.cropGrid.isInDocument())
			this.cropGrid.render(this.getElement());
		else
			value ? this.cropGrid.show() : this.cropGrid.hide();
	};

	/**
	 * Получение списка инструментов редактора
	 * @return {Array}
	 * @public
	 */
	prototype.getInstruments = function ()
	{
		return this.instruments_;
	};

	/**
	 * Скрытие всех инструментов редактора, указанные в this.instruments_
	 * @public
	 */
	prototype.hideInstruments = function ()
	{
		var promisess = [];
		for (var i = 0, ln = this.instruments_.length; i < ln; i++)
		{
			promisess.push(new Promise(function(resolve)
			{
				this.instruments_[i].listenOnce(DD.plugins.PluginInstrument.EventTypes.AFTER_HIDE, resolve);
				this.instruments_[i].hide();
			}.bind(this)))
		};

		Promise.all(promisess).then(function()
		{
			this.dispatchEvent(DD.ui.image.Editor.EventTypes.INSTRUMENTS_CLEAR);
		}.bind(this));
	};

	/**
	 * Получение DD.ui.canvas.Control
	 * @return {DD.ui.canvas.Control} DD.ui.canvas.Control
	 * @public
	 */
	prototype.getCanvasObject = function ()
	{
		return this.canvasObject_;
	};

	/**
	 * Блокирование увеличение/уменьшение изображения в редактора
	 * @param  {Boolean} value Флаг, отвечающий за блокирование увеличение/уменьшение изображения в редактора
	 * @public
	 */
	prototype.blockZoom = function(value)
	{
		goog.isBoolean(value) && this.getRenderer().blockZoom(this, value);
	};
	/**
	 * Получение/сохранение url изображения
	 * @name DD.ui.image.Editor.prototype#imageSrc
	 * @type {String}
	 * @public
	*/
	Object.defineProperty(prototype, "imageSrc", {
		get: prototype.getImageSrc_,
		set: prototype.setImageSrc_
	});

	/**
	 * Получение/сохранение свойств изображения
	 * @name DD.ui.image.Editor.prototype#data
	 * @type {Object}
	 * @public
	*/
	Object.defineProperty(prototype, "data", {
		get: prototype.getData_,
		set: prototype.setData_
	});

	/**
	 * @name DD.ui.image.Editor.prototype#blob
	 * @type {Object}
	 * @public
	*/
	Object.defineProperty(prototype, "blob", {
		get: prototype.getBlob_,
		set: prototype.setBlob_
	});

	/**
	 * @name DD.ui.image.Editor.prototype#blob
	 * @type {Object}
	 * @public
	*/
	Object.defineProperty(prototype, "initialData", {
		get: prototype.getInitialData_,
		set: prototype.setInitialData_
	});
}); // goog.scope