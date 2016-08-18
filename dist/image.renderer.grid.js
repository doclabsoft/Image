goog.provide('DD.ui.image.renderer.Grid');

goog.require('DD.ui.Sizer.renderer.Control');

/**
 * Рендерер для сетки
 */
DD.ui.image.renderer.Grid = function()
{
	DD.ui.Sizer.renderer.Control.call(this);
};
goog.inherits(DD.ui.image.renderer.Grid, DD.ui.Sizer.renderer.Control);
goog.addSingletonGetter(DD.ui.image.renderer.Grid);

DD.ui.image.renderer.Grid.CSS_CLASS = 'DD-grid DD-sizer';

goog.scope(function()
{
	/** @alias DD.ui.image.renderer.Grid.prototype */
	var prototype = DD.ui.image.renderer.Grid.prototype,
	    superClass_ = DD.ui.image.renderer.Grid.superClass_;

	/**
	 * @override
	 */
	prototype.getCssClass = function()
	{
		return DD.ui.image.renderer.Grid.CSS_CLASS;
	};

	/**
	 * @override
	 */
	prototype.initializeDom = function(component)
	{
		component.setSettings('draggable', true);

		var element = component.getElement();
		element.style.display = 'none';
		element.style.opacity = 0;

		superClass_.initializeDom(component);

		var eventHandler = component.$cache('eventHandler');

		eventHandler.listen(component, DD.ui.Sizer.Control.EventType.START_CHANGE_GRID, function(event) {
			this.onStartChange_(component, event);
			this.onResizeContext_(component, event);
		}.bind(this));

		eventHandler.listen(component, DD.ui.Sizer.Control.EventType.BEFORE_MOVE_GRID, function(event) {
			this.onMoveContext_(component, event);
		}.bind(this));

		this.createGridLines_(component);
		this.show(component);
	};

	/**
	 * Срабатывает перед началом изменения положения сетки
	 * @param  {DD.ui.image.Grid} component DD.ui.image.Grid
	 * @param  {goog.event.Event}  event     
	 * @private
	 */
	prototype.onStartChange_ = function(component, event)
	{
		this.getLimits_(component);
	};

	/**
	 * Срабатывает в момент изменения положения сетки
	 * @param  {DD.ui.image.Grid} component DD.ui.image.Grid
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

	/**
	 * Срабатывает перед началом изменения размеров сетки
	 * @param  {DD.ui.image.Grid} component DD.ui.image.Grid
	 * @param  {goog.event.Event}  event     
	 * @private
	 */
	prototype.onResizeContext_ = function(component, event)
	{
		var O = component.$cache('rendererSettings');
		    deltaH = 0,
		    deltaW = 0;

		this.getLimits_(component);

		if (event.direction == DD.ui.Sizer.renderer.Control.Position.NORTHWEST)
		{
			deltaH = O.data.startY - O.data.limits.top;
			deltaW = O.data.startX - O.data.limits.left;
			this.setMaxHeight(component, O.data.bounds.element.height + deltaH);
			this.setMaxWidth(component, O.data.bounds.element.width + deltaW);
		}
		else if (event.direction == DD.ui.Sizer.renderer.Control.Position.NORTHEAST)
		{
			deltaH = O.data.startY - O.data.limits.top;
			deltaW = O.data.limits.right - (O.data.startX + O.data.bounds.element.width);
			this.setMaxHeight(component, O.data.bounds.element.height + deltaH);
			this.setMaxWidth(component, O.data.bounds.element.width + deltaW);
		}
		else if (event.direction == DD.ui.Sizer.renderer.Control.Position.SOUTHWEST)
		{
			deltaH = O.data.limits.bottom - (O.data.startY + O.data.bounds.element.height);
			deltaW = O.data.startX - O.data.limits.left;
			this.setMaxHeight(component, O.data.bounds.element.height + deltaH);
			this.setMaxWidth(component, O.data.bounds.element.width + deltaW);
		}
		else if (event.direction == DD.ui.Sizer.renderer.Control.Position.SOUTHEAST)
		{
			deltaH = O.data.limits.bottom - (O.data.startY + O.data.bounds.element.height);
			deltaW = O.data.limits.right - (O.data.startX + O.data.bounds.element.width);
			this.setMaxHeight(component, O.data.bounds.element.height + deltaH);
			this.setMaxWidth(component, O.data.bounds.element.width + deltaW);
		}
		else if (event.direction == DD.ui.Sizer.renderer.Control.Position.WEST)
		{
			deltaW = O.data.startX - O.data.limits.left;
			this.setMaxWidth(component, O.data.bounds.element.width + deltaW);
			this.setMaxHeight(component, O.data.limits.bottom - O.data.limits.top);
		}
		else if (event.direction == DD.ui.Sizer.renderer.Control.Position.NORTH)
		{

			deltaH = O.data.startY - O.data.limits.top;
			this.setMaxHeight(component, O.data.bounds.element.height + deltaH);
			this.setMaxWidth(component, O.data.limits.right - O.data.limits.left);
		}
		else if (event.direction == DD.ui.Sizer.renderer.Control.Position.EAST)
		{
			deltaW = O.data.limits.right - (O.data.startX + O.data.bounds.element.width);
			this.setMaxWidth(component, O.data.bounds.element.width + deltaW);
			this.setMaxHeight(component, O.data.limits.bottom - O.data.limits.top);
		}
		else if (event.direction == DD.ui.Sizer.renderer.Control.SOUTH)
		{
			deltaH = O.data.limits.bottom - (O.data.startY + O.data.bounds.element.height);
			this.setMaxHeight(component, O.data.bounds.element.height + deltaH);
			this.setMaxWidth(component, O.data.limits.right - O.data.limits.left);
		};
	};

	/**
	 * Создание дополнитльных линий-разметки сетки
	 * @param  {DD.ui.image.Grid} component DD.ui.image.Grid
	 */
	prototype.createGridLines_ = function(component)
	{
		var O = component.$cache('rendererSettings');

		O.gridLines = {
			verticalLeft     : goog.dom.createDom(goog.dom.TagName.DIV, {'class' : 'sizer-grid vertical-left-line'}),
			verticalRight    : goog.dom.createDom(goog.dom.TagName.DIV, {'class' : 'sizer-grid vertical-right-line'}),
			horizontalTop    : goog.dom.createDom(goog.dom.TagName.DIV, {'class' : 'sizer-grid horizontal-top-line'}),
			horizontalBottom : goog.dom.createDom(goog.dom.TagName.DIV, {'class' : 'sizer-grid horizontal-bottom-line'})
		};

		for (var i in O.gridLines)
			if (O.gridLines.hasOwnProperty(i))
				O.element.appendChild(O.gridLines[i]);

		component.$cache('rendererSettings', O);
		this.init(component);
	};

	/**
	 * Инициализация компонента
	 * @param  {DD.ui.image.Grid} component DD.ui.image.Grid
	 */
	prototype.init = function(component)
	{
		this.initSettings(component);
		this.getLimits_(component);
		this.resetBounds_(component);
	};

	/**
	 * Инициализация настроек компонента
	 * @param  {DD.ui.image.Grid} component DD.ui.image.Grid
	 */
	prototype.initSettings = function(component)
	{
		var O = component.$cache('rendererSettings');

		O.cropFrameSize = component.getGridSize();
		O.imgDarken = component.getImageDarken();
		O.toggleAnimateTimer = component.getToggleAnimateTimer();

		component.$cache('rendererSettings', O);
	};

	/**
	 * Сброс координат
	 * @param  {DD.ui.image.Grid} component DD.ui.image.Grid
	 * @private
	 */
	prototype.resetBounds_ = function(component)
	{
		var O = component.$cache('rendererSettings'),
		    parent = O.element.parentElement,
		    imageeditWidth = parent.offsetWidth,
		    imageeditHeight = parent.offsetHeight,
		    sizerWidth = O.data.bounds.scaleImage.width * O.cropFrameSize,
		    sizeHeight = O.data.bounds.scaleImage.height * O.cropFrameSize,
		    left, top, width, height;

		if (O.data.bounds.scaleImage.width > imageeditWidth)
		{
			width = imageeditWidth * O.cropFrameSize;
			O.element.style.width = width + 'px';
			this.setWidth(component, width);
			left = O.data.limits.left + ((imageeditWidth / 2) - (imageeditWidth * O.cropFrameSize / 2));
		}
		else
		{
			O.element.style.width = sizerWidth + 'px';
			this.setWidth(component, sizerWidth);
			left = O.data.limits.left + ((O.data.bounds.scaleImage.width / 2) - (sizerWidth / 2));
		};

		if (O.data.bounds.scaleImage.height > imageeditHeight)
		{
			height = imageeditHeight * O.cropFrameSize;
			O.element.style.height = height + 'px';
			this.setHeight(component, height);
			top = O.data.limits.top + ((imageeditHeight / 2) - (imageeditHeight * O.cropFrameSize) / 2);
		}
		else
		{
			O.element.style.height = sizeHeight + 'px';
			this.setHeight(component, sizeHeight);
			top = O.data.limits.top + ((O.data.bounds.scaleImage.height / 2) - (sizeHeight / 2))
		};

		O.element.style.left = left + 'px';
		O.element.style.top = top + 'px';

		component.$cache('rendererSettings', O);
	};

	/**
	 * Отображение компонента
	 * @param  {DD.ui.image.Grid} component DD.ui.image.Grid
	 * @public
	 */
	prototype.show = function(component)
	{
		if (!component.isInDocument())
			return;

		var O = component.$cache('rendererSettings');
		O.element.style.display = 'block';
		O.element.style.opacity = 0;

		this.getLimits_(component);
		this.resetBounds_(component);

		new Promise(function(resolve)
		{
			O.element.style.opacity = 1;
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
	prototype.hide = function(component, isUpdate)
	{
		if (!component.isVisible())
			return;

		var O = component.$cache('rendererSettings');

		new Promise(function(resolve)
		{
			O.element.style.opacity = 0
			setTimeout(function()
			{
				resolve();
			}, component.getToggleAnimateTimer());
		})
		.then(function()
		{
			O.element.style.display = 'none';
			component.afterHide(isUpdate);
		});
	};

	/**
	 * Получение границ перемещения компонента
	 * @param  {DD.ui.image.Grid} component DD.ui.image.Grid
	 * @private
	 */
	prototype.getLimits_ = function(component)
	{
		var O = component.$cache('rendererSettings'),
		    parent = O.element.parentElement,
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
		// this.hide(component, true);
		this.show(component);
	};
}); // goog.scope