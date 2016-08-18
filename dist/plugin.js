goog.provide('DD.plugins.Plugin');

goog.require('goog.events.EventTarget');

/**
 * Компонент для плагина
 * @param {Object} targetObject Компонент, к котрому привязывается плагин
 */
DD.plugins.Plugin = function(targetObject)
{
	goog.events.EventTarget.call(this);

	this.targetObject_ = targetObject;
};
goog.inherits(DD.plugins.Plugin, goog.events.EventTarget);

/**
 * Список публичных методов
 * @type {Array}
 */
DD.plugins.Plugin.publicMethods = [];

/**
 * Название плагина
 * @type {String}
 */
DD.plugins.Plugin.pluginName = '';

/**
 * @override
 */
DD.plugins.Plugin.prototype.disposeInternal = function()
{
	DD.plugins.Plugin.superClass_.disposeInternal.call(this);
	this.targetObject_ = null;
};