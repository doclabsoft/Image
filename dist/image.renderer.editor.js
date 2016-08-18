goog.provide('DD.ui.image.renderer.Editor');

goog.require('DD.ui.renderer.Component');

/**
 * Рендерер для редактора изображений
 */
DD.ui.image.renderer.Editor = function()
{
	DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.image.renderer.Editor, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.image.renderer.Editor);

DD.ui.image.renderer.Editor.CSS_CLASS = 'DD-image-editor';

goog.scope(function()
{
	/** @alias DD.ui.image.renderer.Editor.prototype */
	var prototype = DD.ui.image.renderer.Editor.prototype;

	/**
	 * @override
	 */
	prototype.getCssClass = function()
	{
		return DD.ui.image.renderer.Editor.CSS_CLASS;
	};

	/**
	 * Блокирование увеличение/уменьшение изображения в редактора
	 * @param  {DD.ui.image.Editor} component DD.ui.image.Editor
	 * @param  {Boolean}            value     Флаг, отвечающий за блокирование увеличение/уменьшение изображения в редактора
	 * @public
	 */
	prototype.blockZoom = function(component, value)
	{
		var O = component.$cache('rendererSettings');

		if (!O)
		{
			O = {};
			O.element = component.getElement();
		};

		if (value)
		{
			if (!O.overlay)
			{
				O.overlay = goog.dom.createDom('div');
				O.overlay.style.position = 'absolute';
				O.overlay.style.left = 0;
				O.overlay.style.right = 0;
				O.overlay.style.top = 0;
				O.overlay.style.bottom = 0;
				O.overlay.style.zIndex = 3;
				component.$cache('rendererSettings', O);
			}
			O.element.appendChild(O.overlay);
		}
		else if(O.overlay)
			O.overlay.remove();
	};
}); // goog.scope