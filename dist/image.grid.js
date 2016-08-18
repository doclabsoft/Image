goog.provide('DD.ui.image.Grid');

goog.require('DD.ui.Sizer.Control');
goog.require('DD.ui.image.renderer.Grid');

/**
 * Компонент оторбажение сетки в редакторе изображений
 * @param {Object} settings Список настроек компонента
 */
DD.ui.image.Grid = function(settings)
{
	DD.ui.Sizer.Control.call(this, settings);

	/**
	 * Список настроек компонента
	 * @type {Object}
	 * @public
	 */
	this.settings = this.assignParams(this.settings, DD.ui.image.Grid.Defaults);
};
goog.inherits(DD.ui.image.Grid, DD.ui.Sizer.Control);
goog.ui.registry.setDefaultRenderer(DD.ui.image.Grid, DD.ui.image.renderer.Grid);

/**
 * Список настроек компонента по-умолчанию
 * @enum {Any}
 */
DD.ui.image.Grid.Defaults = 
{
	imgDarken          : 0.5,
	gridSize           : 0.8,
	toggleAnimateTimer : 500
};

goog.scope(function()
{
	/** @alias DD.ui.image.Grid.prototype */
	var prototype = DD.ui.image.Grid.prototype;

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
	 * @override
	 */
	prototype.show = function()
	{
		this.getRenderer().show(this);
	};

	/**
	 * @override
	 */
	prototype.hide = function()
	{
		this.getRenderer().hide(this);
	};

	prototype.afterHide = function(isUpdate)
	{
		this.dispatchEvent('after_hide');
		this.isVisible_ = false;
		if (isUpdate)
			this.show();
	};

	prototype.afterShow = function()
	{
		this.dispatchEvent('after_show');
		this.isVisible_ = true;
	};

	prototype.update = function()
	{
		this.getRenderer().update(this);
	};

	prototype.isVisible = function()
	{
		return this.isVisible_;
	};
}); // goog.scope