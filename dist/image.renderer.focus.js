goog.provide('DD.ui.image.renderer.Focus');

goog.require('DD.ui.Sizer.renderer.Control');

/**
 * Рендерер для компонента Фокус
 */
DD.ui.image.renderer.Focus = function()
{
	DD.ui.Sizer.renderer.Control.call(this);
};
goog.inherits(DD.ui.image.renderer.Focus, DD.ui.Sizer.renderer.Control);
goog.addSingletonGetter(DD.ui.image.renderer.Focus);

DD.ui.image.renderer.Focus.CSS_CLASS = 'DD-focus';

goog.scope(function()
{
	/** @alias DD.ui.image.renderer.Focus.prototype */
	var prototype = DD.ui.image.renderer.Focus.prototype,
	    superClass_ = DD.ui.image.renderer.Focus.superClass_;

	/** 
	 * @override
	 */
	prototype.getCssClass = function()
	{
		return DD.ui.image.renderer.Focus.CSS_CLASS;
	};

	/** 
	 * @override
	 */
	prototype.initializeDom = function(component)
	{
		component.setSettings('draggable', true);
		
		superClass_.initializeDom.call(this, component);

		var element = component.getElement();
		element.style.visible = 'hidden';
		element.style.display = 'block';
		element.style.opacity = 0;

		var eventHandler = component.$cache('eventHandler');

		eventHandler.listen(component, DD.ui.Sizer.Control.EventType.START_CHANGE_GRID, function(event) {
			this.onStartChange_(component, event);
		}.bind(this));

		eventHandler.listen(component, DD.ui.Sizer.Control.EventType.BEFORE_MOVE_GRID, function(event) {
			this.onMoveContext_(component, event);
		}.bind(this));

		eventHandler.listen(component, DD.ui.Sizer.Control.EventType.END_CHANGE_GRID, function(event) {
			this.onEndMoveContext_(component, event);
		}.bind(this));

		this.init(component);
		this.show(component);
	};

	/**
	 * Инициализация компонента
	 * @param  {DD.ui.image.Focus} component DD.ui.image.Focus
	 * @public
	 */
	prototype.init = function(component)
	{
		this.getLimits_(component);
		this.setFocus(component)
	};

	prototype.setFocus = function(component)
	{
		var data = component.getData(),
		    O = component.$cache('rendererSettings'),
		    x = 0,
		    y = 0;

		if (!O)
			return;

		if (data.focusX && data.focusY)
		{
			x = (data.focusX * (O.data.bounds.scaleImage.width / O.data.bounds.image.width)) - (O.width / 2) + (O.data.bounds.image.left - O.data.bounds.parent.left);
			y = (data.focusY * (O.data.bounds.scaleImage.height / O.data.bounds.image.height)) - (O.height / 2) + (O.data.bounds.image.top - O.data.bounds.parent.top);
		}
		else
		{
			x = O.data.limits.left + ((O.data.bounds.scaleImage.width / 2) - (O.width / 2));
			y = O.data.limits.top + ((O.data.bounds.scaleImage.height / 2) - (O.height / 2));
		};

		this.setPosition(component, x, y);
	};

	/**
	 * Задает позицию элемента фокуса
	 * @param  {DD.ui.image.Focus} component DD.ui.image.Focus
	 * @param {Number}             x         Координата по оси X
	 * @param {Number}             y         Координата по оси Y
	 * @public
	 */
	prototype.setPosition = function(component, x, y)
	{
		var element = component.getElement();
		element.style.left = x + 'px';
		element.style.top = y + 'px';
	};

	/**
	 * Получение координат центра фокуса
	 * @param  {DD.ui.image.Focus} component DD.ui.image.Focus
	 * @private
	 */
	prototype.getFocusCenter_ = function(component)
	{
		var O = component.$cache('rendererSettings');
		return {
			focusX : O.element.offsetLeft + O.width / 2,
			focusY : O.element.offsetTop + O.height / 2
		};
	};

	/**
	 * Срабатывает перед началом изменения положения фокуса в редактора изображений
	 * @param  {DD.ui.image.Focus} component DD.ui.image.Focus
	 * @param  {goog.event.Event}  event     
	 * @private
	 */
	prototype.onStartChange_ = function(component, event)
	{
		this.getLimits_(component);
	};

	/**
	 * Срабатывает в момент изменения положения фокуса в редактора изображений
	 * @param  {DD.ui.image.Focus} component DD.ui.image.Focus
	 * @param  {goog.event.Event}  event     
	 * @private
	 */
	prototype.onMoveContext_ = function(component, event)
	{
		O = component.$cache('rendererSettings');

		if (event.x < O.data.limits.left)
			component.setBlockMoveWhileCoordX(O.data.limits.left);
		else if (event.x + O.data.gridWidth >= O.data.limits.right)
			component.setBlockMoveWhileCoordX(Math.abs(O.data.limits.right - O.data.gridWidth));
		else
			component.setBlockMoveWhileCoordX(false);

		if (event.y < O.data.limits.top)
			component.setBlockMoveWhileCoordY(O.data.limits.top);
		else if (event.y + O.data.gridHeight >= O.data.limits.bottom)
			component.setBlockMoveWhileCoordY(Math.abs(O.data.limits.bottom - O.data.gridHeight));
		else
			component.setBlockMoveWhileCoordY(false);
	};

	prototype.onEndMoveContext_ = function(component, event)
	{
		component.setFocus(this.getFocusCenter_(component));
	};

	prototype.reset = function(component)
	{
		this.recalcFocusCenter(component);
	};

	prototype.recalcFocusCenter = function(component)
	{
		this.getLimits_(component);
		this.setFocus(component);
	};

	/**
	 * Отображение фокуса
	 * @param  {DD.ui.image.Focus} component DD.ui.image.Focus
	 */
	prototype.show = function(component)
	{
		this.recalcFocusCenter(component);
		this.showFocusElement(component);
	};

	prototype.showFocusElement = function(component)
	{
		var O = component.$cache('rendererSettings');

		new Promise(function(resolve)
		{
			goog.style.setStyle(O.element, {
				visibility : 'visible',
				opacity : 1
			});

			setTimeout(function()
			{
				resolve();
			}, component.getToggleAnimateTimer());
		})
		.then(function()
		{
			component.afterShow();
		}.bind(this));
	};

	/**
	 * Скрытие компонента
	 * @param  {DD.ui.image.Grid} component DD.ui.image.Grid
	 * @public
	 */
	prototype.hide = function(component)
	{
		if (!component.isVisible())
			return;

		var O = component.$cache('rendererSettings'),
		    smoothHideDelta = 150;

		new Promise(function(resolve)
		{
			O.element.style.opacity = 0
			setTimeout(function()
			{
				resolve();
			}, component.getToggleAnimateTimer() + smoothHideDelta);
		})
		.then(function()
		{
			O.element.style.visibility = 'hidden';
			component.afterHide();
		});
	};
	/**
	 * Получение границ перемещения фокуса
	 * @param  {DD.ui.image.Focus} component DD.ui.image.Focus
	 * @private
	 */
	prototype.getLimits_ = function(component)
	{
		var O = component.$cache('rendererSettings');

		if (!O)
			return;

		var parent = O.element.parentElement,
		    image = parent.getElementsByTagName('img')[0];

		var data = {
			limits : {},
			bounds : {}
		};

		// Находим границы элементов
		data.bounds.parent = goog.style.getBounds(parent);
		data.bounds.image = goog.style.getBounds(image);
		data.bounds.scaleImage = goog.style.getTransformedSize(image);
		data.bounds.element = goog.style.getBounds(O.element);

		var parentPadding = goog.style.getPaddingBox(parent);
		data.bounds.parent.width = data.bounds.parent.width - parentPadding.left - parentPadding.right;
		data.bounds.parent.height = data.bounds.parent.height - parentPadding.top - parentPadding.bottom;

		// Определяем приделы движения crop-сетки и ее текущие размеры
		if (data.bounds.scaleImage.width <= data.bounds.parent.width)
		{
			data.limits.left = data.bounds.image.left - data.bounds.parent.left;
			data.limits.right = data.limits.left + data.bounds.scaleImage.width;
		}
		else
		{
			data.limits.left = parentPadding.left;
			data.limits.right = parentPadding.left + data.bounds.parent.width;
		};

		if (data.bounds.scaleImage.height <= data.bounds.parent.height)
		{
			data.limits.top = data.bounds.image.top - data.bounds.parent.top;
			data.limits.bottom = data.limits.top + data.bounds.scaleImage.height;
		}
		else
		{
			data.limits.top = data.bounds.parent.top + parentPadding.top - data.bounds.parent.top;
			data.limits.bottom = data.limits.top + parentPadding.top + data.bounds.parent.height;
		};

		data.gridWidth = O.element.offsetWidth;
		data.gridHeight = O.element.offsetHeight;
		data.startX = data.bounds.element.left - data.bounds.parent.left;
		data.startY = data.bounds.element.top - data.bounds.parent.top;

		O.data = data;
		component.$cache('rendererSettings', O);
	};

	prototype.update = function(component)
	{
		this.show(component);
	};
}); // goog.scope