goog.provide('DD.ui.image.Focus');

goog.require('DD.ui.Sizer.Control');
goog.require('DD.ui.image.renderer.Focus');

/**
 * Компонент для реализации фокуса на изображении
 * @param {Object} settings Список настроек компонента
 */
DD.ui.image.Focus = function(settings)
{
	DD.ui.Sizer.Control.call(this, settings);

	/**
	 * Список настроек компонента
	 * @type {Object}
	 * @public
	 */
	this.settings = this.assignParams(this.settings, DD.ui.image.Focus.Defaults);

	/**
	 * Список свойств компонента
	 * @type {Object}
	 * @private
	 */
	this.data_ = {};
};
goog.inherits(DD.ui.image.Focus, DD.ui.Sizer.Control);
goog.ui.registry.setDefaultRenderer(DD.ui.image.Focus, DD.ui.image.renderer.Focus);

/**
 * Список настроек компонента по-умолчанию
 * @enum {Any}
 */
DD.ui.image.Focus.Defaults = 
{
	imgDarken          : 0.5,
	gridSize           : 0.8,
	toggleAnimateTimer : 100
};

/**
 * Список событий компонента
 * @enum {String}
 */
DD.ui.image.Focus.EventTypes = {
	PROPERTY_CHANGE : 'focus.property.change'
};

goog.scope(function()
{
	/** @alias DD.ui.image.Focus.prototype */
	var prototype = DD.ui.image.Focus.prototype;

	/**
	 * Получение размера сетки
	 * @return {Object}
	 * @public
	 */
	prototype.getGridSize = function()
	{
		return this.settings.gridSize;
	};

	/**
	 * Получение прозрачности оверлея
	 * @return {Number}
	 * @public
	 */
	prototype.getImageDarken = function()
	{
		return this.settings.imgDarken;
	};

	/**
	 * Получение скорости анимации
	 * @return {Number}
	 * @public
	 */
	prototype.getToggleAnimateTimer = function()
	{
		return this.settings.toggleAnimateTimer;
	};

	/**
	 * Отображение компонента
	 * @public
	 */
	prototype.show = function()
	{
		this.getRenderer().show(this);
	};

	/**
	 * Сбратывает положение фокуса по-умолчанию
	 * @public
	 */
	prototype.reset = function()
	{
		this.setFocus({focusX: NaN, focusY: NaN});
		this.getRenderer().reset(this);
	};

	/**
	 * Сбратывает положение фокуса до изначального
	 * @public
	 */
	prototype.resetToDefault = function(data)
	{
		if (!data)
			return;

		this.data_.focusX = data.focusX;
		this.data_.focusY = data.focusY;
		this.getRenderer().reset(this);
	};

	prototype.recalcFocusCenter = function()
	{
		this.getRenderer().recalcFocusCenter(this);
	};

	prototype.update = function()
	{
		this.getRenderer().update(this);
	};

	/**
	 * Сохранение координат центра фокуса без вызова события
	 * @param {Number} x Координата цента фокуса по оси X
	 * @param {Number} y Координата цента фокуса по оси Y
	 * public
	 */
	prototype.setFocusInternal = function(x, y)
	{
		this.data_.focusX = x;
		this.data_.focusY = y;
	};

	/**
	 * Сохранение координат центра фокуса
	 * @param {Object} data Координаты цента фокуса
	 */
	prototype.setFocus = function(data)
	{
		if (!data)
			return;

		this.data_ = {
			focusX : data.focusX,
			focusY : data.focusY
		};

		this.dispatchEvent({
			type : DD.ui.image.Focus.EventTypes.PROPERTY_CHANGE,
			data : this.data_
		});
	};

	/**
	 * Получение координат центра фокуса
	 * @return {Object}
	 */
	prototype.getData = function()
	{
		return this.data_;
	};

	prototype.afterHide = function()
	{
		this.dispatchEvent('after_hide');
		this.isVisible_ = false;
	};

	prototype.afterShow = function()
	{
		this.dispatchEvent('after_show');
		this.isVisible_ = true;
	};

	prototype.isVisible = function()
	{
		return this.isVisible_;
	};
}); // goog.scope