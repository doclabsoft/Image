goog.provide('DD.plugins.Pluginable');

goog.require('DD.ui.Component');

/**
 * Компонент, позволяющий использование плагинов
 */
DD.plugins.Pluginable = function()
{
	DD.ui.Component.call(this);

	/**
	 * Список плагинов
	 * @type {Object}
	 */
	this.Plugins = {};
};
goog.inherits(DD.plugins.Pluginable, DD.ui.Component);

goog.scope(function()
{
	/** @alias DD.plugins.Pluginable.prototype */
	var prototype = DD.plugins.Pluginable.prototype;

	/**
	 * Добавление плагина
	 * @param {Function} pluginClass Класс плагина
	 * @public
	 */
	prototype.addPlugin = function(pluginClass)
	{
		// Создание экземпляра класса
		var plugin = new pluginClass(this);

		// Получение публичных методов для регистрации в классе
		var methods = pluginClass.publicMethods;

		this.Plugins[pluginClass.pluginName] = plugin;

		// Регистрация публичных методов
		for (var i = 0, ln = methods.length; i < ln; i++)
			this.registerMethod_(pluginClass.pluginName, methods[i], plugin);
	};

	/**
	 * Регистрация публичных методов экземпляра класса
	 * @param  {String}            pluginName  Имя плагина
	 * @param  {String}            method      Имя метода
	 * @param  {DD.plugins.Plugin} plugin      Объект плагина
	 * @private
	 */
	prototype.registerMethod_ = function(pluginName, method, plugin)
	{
		this[pluginName + '_' + method] = function() {
			return plugin[method].apply(plugin, arguments);
		};
	};

	/**
	 * @override
	 */
	prototype.disposeInternal = function()
	{
		for (var pluginName in this.Plugins)
			this.Plugins[pluginName].dispose();

		this.Plugins = {};

		DD.plugins.Pluginable.superClass_.disposeInternal.call(this);
	};
}); // goog.scope