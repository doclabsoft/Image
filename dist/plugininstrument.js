goog.provide('DD.plugins.PluginInstrument');

goog.require('DD.plugins.Plugin');

/**
 * Компонент для плагина, определющийся как визуальный инстурмент
 * @param {Object} targetObject Компонент, к котрому привязывается плагин
 */
DD.plugins.PluginInstrument = function(targetObject)
{
	DD.plugins.Plugin.call(this, targetObject);

	this.registerInstrument_();

	this.isVisible_ = false;
};
goog.inherits(DD.plugins.PluginInstrument, DD.plugins.Plugin);

DD.plugins.PluginInstrument.EventTypes = {
	AFTER_HIDE  : 'instrument.plugin.after_hide',
	AFTER_SHOW  : 'instrument.plugin.after_show',
	BEFORE_HIDE : 'instrument.plugin.before_hide',
	BEFORE_SHOW : 'instrument.plugin.before_show'
};

goog.scope(function()
{
	var prototype = DD.plugins.PluginInstrument.prototype,
	    superClass_= DD.plugins.PluginInstrument.superClass_;

	/**
	 * Отображение инструмента
	 */
	prototype.show = function()
	{
		this.isVisible_ = true;
	};

	/**
	 * Скрытие инструмента
	 */
	prototype.hide = function()
	{
		this.isVisible_ = false;
	};

	/**
	 * Скрытие инструмента
	 */
	prototype.isVisible = function()
	{
		return this.isVisible_;
	};

	/**
	 * Регистрация плагина как инструмента у this.targetObject_
	 */
	prototype.registerInstrument_ = function()
	{
		var instruments = this.targetObject_.getInstruments();
		if (!instruments)
			return;
		this.targetObject_.getInstruments().push(this);
	};
});