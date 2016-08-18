goog.provide('DD.ui.Sizer.Control');

goog.require('goog.ui.registry');
goog.require('DD.ui.Component');
goog.require('DD.ui.Sizer.renderer.Control');
goog.require('DD.ui.Sizer.Sliders');

/**
 * Base class of sizer object which based on DragDropHelper component.
 * @extends {DD.ui.Component}
 */
DD.ui.Sizer.Control = function(settings)
{
	DD.ui.Component.call(this, settings);

	this.settings = this.assignParams(!settings && (settings = {}) || settings, DD.ui.Sizer.Control.Defaults);

	this.sliders_ = new DD.ui.Sizer.Sliders(this.settings.sliders);
	this.handlers_ = {};

	// this.addWindowListeners();
};
goog.inherits(DD.ui.Sizer.Control, DD.ui.Component);
goog.ui.registry.setDefaultRenderer(DD.ui.Sizer.Control, DD.ui.Sizer.renderer.Control);

/**
 * EventTypes of component.
 * @enum {String}
 */
DD.ui.Sizer.Control.EventType =
{
	RESIZE_GRID                : 'resize_grid',
	MOVE_GRID                  : 'move_grid',
	BEFORE_MOVE_GRID           : 'before_move_grid',
	START_CHANGE_GRID          : 'start_change_grid',
	START_RESIZE_GRID          : 'start_resize_grid',
	END_RESIZE_GRID            : 'end_resize_grid',
	END_CHANGE_GRID            : 'end_change_grid',
	CHANGE_HEIGHT              : 'change_height',
	CHANGE_WIDTH               : 'change_width',
	CHANGE_MAX_HEIGHT          : 'change_max_height',
	CHANGE_MIN_HEIGHT          : 'change_min_height',
	CHANGE_MAX_WIDTH           : 'change_max_width',
	CHANGE_MIN_WIDTH           : 'change_min_width',
	CHANGE_ASPECT_RATIO_WIDTH  : 'change_aspect_ratio_width',
	CHANGE_ASPECT_RATIO_HEIGHT : 'change_aspect_ratio_height',
	AFTER_HIDE                 : 'after_hide',
	AFTER_SHOW                 : 'after_show'
};

/**
 * Prefix for event's context property.
 * @type {String}
 */
DD.ui.Sizer.Control.ContextPrefix = 'CC_';

/**
 * Свойства компонента по-умолчанию
  */
DD.ui.Sizer.Control.Defaults = {
	minWidth          : 0,
	maxWidth          : 0,
	minHeight         : 0,
	maxHeight         : 0,
	aspectRatioWidth  : 0,
	aspectRatioHeight : 0,
	tracking          : true,
	draggable         : false
};

goog.scope(function()
{
	var prototype = DD.ui.Sizer.Control.prototype,
	    superClass_ = DD.ui.Sizer.Control.superClass_;

	/**
	 * Определение свойств до инициализации суперкласса
	 * @param {String} key   Ключ настройки
	 * @param {Any}    value Значение ключа настройки
	 */
	prototype.setSettings = function(key, value)
	{
		this.settings[key] = value;
	};

	/**
	 * Сохранение значения ширины
	 * @param {Number} value Значение ширины
	 * @private
	 */
	prototype.setWidth_ = function(value)
	{
		value && goog.isNumber(value) && this.getRenderer().setWidth(this, value);
	};

	/**
	 * Get element width
	 * @private
	 */
	prototype.getWidth_ = function()
	{
		return this.settings.width;
	};

	prototype.setHeight_ = function(value)
	{
		value && goog.isNumber(value) && this.getRenderer().setHeight(this, value);
	};

	/**
	 * Get element height
	 * @return {Number}
	 * @public
	 */
	prototype.getHeight_ = function()
	{
		return this.settings.height;
	};

	/**
	 * Set min. width after checking max. and aspect ratio values
	 * @param {Number/String} width        In pixels
	 * @public
	 */
	prototype.setMinWidth_ = function(value)
	{
		value && goog.isNumber(value) && this.getRenderer().setMinWidth(this, value);
	};

	/**
	 * Get min. width
	 * @return {Number}
	 * @private
	 */
	prototype.getMinWidth_ = function()
	{
		return this.settings.minWidth;
	};

	/**
	 * Set min. height after checking max. and aspect ratio values
	 * @param {Number/String} height        In pixels
	 * @private
	 */
	prototype.setMinHeight_ = function(value)
	{
		value && goog.isNumber(value) && this.getRenderer().setMinHeight(this, value);
	};

	/**
	 * Get min. height
	 * @return {Number}
	 * @private
	 */
	prototype.getMinHeight_ = function()
	{
		return this.settings.minHeight;
	};


	prototype.setDraggable_ = function(value)
	{
		goog.isBoolean(value) && this.getRenderer().setDraggable(this, value);
	};

	prototype.getDraggable_ = function()
	{
		return this.settings.draggable;
	};

	/**
	 * Set max. width after checking min. and aspect ratio values
	 * @param {Number/String} width        In pixels
	 * @private
	 */
	prototype.setMaxWidth_ = function(value)
	{
		goog.isNumber(value) && value > 0 && this.getRenderer().setMaxWidth(this, value);
	};

	/**
	 * Get max. width
	 * @return {Number}
	 * @private
	 */
	prototype.getMaxWidth_ = function()
	{
		return this.settings.maxWidth;
	};

	/**
	 * Set max. height after checking min. and aspect ratio values
	 * @param {Number/String} height        In pixels
	 * @private
	 */
	prototype.setMaxHeight_ = function(value)
	{
		goog.isNumber(value) && value > 0 && this.getRenderer().setMaxHeight(this, value);
	};

	/**
	 * Get max. height
	 * @return {Number}
	 * @private
	 */
	prototype.getMaxHeight_ = function()
	{
		return this.settings.maxHeight;
	};

	prototype.setBlockMove = function(value)
	{
		goog.isBoolean(value) && this.getRenderer().setBlockMove(this, value);
	};

	prototype.setBlockMoveWhileCoordX = function(value)
	{
		(goog.isNumber(value) || goog.isBoolean(value)) && this.getRenderer().setBlockMoveWhileCoordX(this, value);
	};

	prototype.setBlockMoveWhileCoordY = function(value)
	{
		(goog.isNumber(value) || goog.isBoolean(value)) && this.getRenderer().setBlockMoveWhileCoordY(this, value);
	};

	/**
	 * Set aspect ratio width after checking min./max. values
	 * @param {Number/String} width
	 * @private
	 */
	prototype.setAspectRatioWidth_ = function(value)
	{
		goog.isNumber(value) && value > 0 && this.getRenderer().setAspectRatioWidth(this, value);
	};

	/**
	 * Get aspect ratio width
	 * @return {Number}
	 * @private
	 */
	prototype.getAspectRatioWidth_ = function()
	{
		return this.settings.aspectRatioWidth;
	};

	/**
	 * Set aspect ratio height after checking min./max. values
	 * @param {Number/String} height
	 * @private
	 */
	prototype.setAspectRatioHeight_ = function(value)
	{
		goog.isNumber(value) && value > 0 && this.getRenderer().setAspectRatioHeight(this, value);
	};

	/**
	 * Get aspect ratio height
	 * @return {Number}
	 * @private
	 */
	prototype.getAspectRatioHeight_ = function()
	{
		return this.settings.aspectRatioHeight;
	};

	/**
	 * Get tracking value
	 * @return {Boolean}
	 * @private
	 */
	prototype.getTracking_ = function()
	{
		return this.settings.tracking;
	};

	/**
	 * Set tracking property and runing 'manageGhostContainer'
	 * @param {Boolean} tracking
	 * @return {Boolean}
	 * @private
	 */
	prototype.setTracking_ = function(value)
	{
		this.settings.tracking = value;
		goog.isBoolean(value) && this.getRenderer().setTracking(this, value);
	};

	/**
	 * Get hanlers elements
	 * @param  {String} key Number
	 * @return {DOMElement/DOMElement[]}
	 * @public
	 */
	prototype.getHandlers = function(key)
	{
		return key ? goog.object.getValueByKeys(this.handlers_, key) : goog.object.getValues(this.handlers_);
	};

	/**
	 * Get sliders object of component
	 * @return {DD.sizer.Sliders}
	 * @public
	 */
	prototype.getSliders = function()
	{
		return this.sliders_.getSliders();
	};

	prototype.hide = function()
	{
		this.getRenderer().hide(this);
	};

	prototype.show = function()
	{
		this.getRenderer().show(this);
	};

	prototype.setElementHide = function()
	{
		this.dispatchEvent('hide');
	};

	prototype.setElementShow = function()
	{
		this.dispatchEvent('show');
	};

	/**
	 * Get enabled value
	 * @return {Boolean}
	 */
	prototype.getEnabled = function ()
	{
		return this.enabled_;
	};

	/**
	 * Set enabled property for component only, if 'deep' = false, or change it in sliders object also otherwise
	 * @param {Boolean} enabled
	 * @param {Boolean} deep    
	 * @return {Boolean}
	 * @public
	 */
	prototype.setEnabled = function (enabled, deep)
	{
		this.enabled_ = enabled;
		this.setEnabledElements(this.getHandlers(), this.enabled_);

		if (deep === true)
			this.sliders_.setEnabled(this.enabled_);

		this.dispatchEvent({
			type  : DD.ui.Sizer.Control.EventType.ENABLED,
			value : this.enabled_
		});

		return this.enabled_;
	};

	/**
	 * Get resizable element
	 * @return {DOMElement}
	 */
	prototype.getContainer = function ()
	{
		return this.getElement();
	};

	/**
	 * Get visible value
	 * @return {Boolean}
	 */
	prototype.getVisible = function ()
	{
		return this.visible_;
	};

	/**
	 * Set visible property for component only, if 'deep' = false, or change it in sliders object also otherwise
	 * @param {Boolean} visible
	 * @param {Boolean} deep
	 * @return {Boolean}
	 * @public
	 */
	prototype.setVisible = function (visible, deep)
	{
		this.visible_ = visible;
		this.setVisibleElements(this.getHandlers(), this.visible_);

		if (deep === true)
			this.sliders_.setVisible(this.visible_);

		this.dispatchEvent({
			type  : DD.ui.Sizer.Control.EventType.VISIBLE,
			value : this.visible_
		});

		return this.visible_;
	};

	/**
	 * Get ghost element - grey border to resize element after dragend event dispatch
	 * @return {DOMElement}
	 */
	prototype.getGhostBorder = function()
	{
		return this.getRenderer().getGhostBorder();
	};

	prototype.setGhostContainer = function(value)
	{
		this.ghostEl_ = value;
	};

	/**
	 * Runing configurations functions: 'resizeGhostContainer'
	 * @public
	 */
	prototype.reconfigure = function()
	{
		this.resizeGhostContainer_();
	};

	/**
	 * Add goog.events.EventType.RESIZE event listener for window object to reconfigure important setting
	 */
	prototype.addWindowListeners = function()
	{
		goog.events.listen( window, goog.events.EventType.RESIZE, function(e)
		{
			this.reconfigure();
		}.bind(this));
	};

	/**
	 * Disposes all.
	 * @override
	 */
	prototype.disposeInternal = function()
	{
		DD.ui.Sizer.Control.superClass_.disposeInternal.call(this);
	};

	prototype.setSizeInternal = function(value)
	{
		this.settings.width = value.width;
		this.settings.height = value.height;
	};

	prototype.getSize = function()
	{
		return {
			width  : this.settings.width,
			height : this.settings.height
		};
	}

	prototype.setLastActiveControl = function(value)
	{
		this.settings.lastActiveControl = value;
	};

	prototype.getLastActiveControl = function()
	{
		return this.settings.lastActiveControl;
	};

	prototype.setPositionInternal = function(value)
	{
		this.settings.position = value;
	};

	prototype.getPosition = function()
	{
		return this.settings.position;
	};

	prototype.generateEventParams = function(params, defaultParams)
	{
		return this.assignParams(goog.isObject(params) && params || new Object, defaultParams);
	};

	prototype.generateEvents = function(eventType, params)
	{
		this.dispatchEvent(this.generateEventParams(params, {type : eventType}));
	}

	prototype.setSizeChange = function(size, opt_eventParams)
	{
		this.setSizeInternal(size);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type :DD.ui.Sizer.Control.EventType.RESIZE_GRID}));
	};

	prototype.setBeforePositionChange = function(value, opt_eventParams)
	{
		this.setPositionInternal(value);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type : DD.ui.Sizer.Control.EventType.BEFORE_MOVE_GRID}));
	};

	prototype.setPositionChange = function(value, opt_eventParams)
	{
		this.setPositionInternal(value);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type : DD.ui.Sizer.Control.EventType.MOVE_GRID}));
	};

	prototype.setStartChange = function(lastActiveControl, opt_eventParams)
	{
		this.setLastActiveControl(lastActiveControl);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {
			type : DD.ui.Sizer.Control.EventType.START_CHANGE_GRID,
			direction: lastActiveControl
		}));
	};

	prototype.setEndChange = function(opt_eventParams)
	{
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {
			type : DD.ui.Sizer.Control.EventType.END_CHANGE_GRID
		}));
	};

	prototype.setHeightChange = function(value, opt_eventParams)
	{
		this.setHeightInternal(value);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type : DD.ui.Sizer.Control.EventType.CHANGE_HEIGHT}));
	};

	prototype.setHeightInternal = function(value)
	{
		this.settings.height = value;
	};

	prototype.setWidthChange = function(value, opt_eventParams)
	{
		this.setWidthInternal(value);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type : DD.ui.Sizer.Control.EventType.CHANGE_WIDTH}));
	};

	prototype.setWidthInternal = function(value)
	{
		this.settings.width = value;
	};

	prototype.setMaxHeightChange = function(value, opt_eventParams)
	{
		this.setMaxHeightInternal(value);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type : DD.ui.Sizer.Control.EventType.CHANGE_MAX_HEIGHT}));
	};

	prototype.setMaxHeightInternal = function(value)
	{
		this.settings.maxHeight = value;
	};

	prototype.setMaxWidthChange = function(value, opt_eventParams)
	{
		this.setMaxWidthInternal(value);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type : DD.ui.Sizer.Control.EventType.CHANGE_MAX_WIDTH}));
	};

	prototype.setMaxWidthInternal = function(value)
	{
		this.settings.maxWidth = value;
	};

	prototype.setMinHeightChange = function(value, opt_eventParams)
	{
		this.setMinHeightInternal(value);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type : DD.ui.Sizer.Control.EventType.CHANGE_MIN_HEIGHT}));
	};

	prototype.setMinHeightInternal = function(value)
	{
		this.settings.minHeight = value;
	};

	prototype.setMinWidthChange = function(value, opt_eventParams)
	{
		this.setMinWidthInternal(value);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type : DD.ui.Sizer.Control.EventType.CHANGE_MIN_WIDTH}));
	};

	prototype.setMinWidthInternal = function(value)
	{
		this.settings.minWidth = value;
	};

	prototype.setAspectRatioWidthChange = function(value, opt_eventParams)
	{
		this.setAspectRatioWidthInternal(value);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type : DD.ui.Sizer.Control.EventType.CHANGE_ASPECT_RATIO_WIDTH}));
	};

	prototype.setAspectRatioWidthInternal = function(value)
	{
		this.settings.aspectRatioWidth = value;
	};

	prototype.setAspectRatioHeightChange = function(value, opt_eventParams)
	{
		this.setAspectRatioHeightInternal(value);
		this.dispatchEvent(this.generateEventParams(opt_eventParams, {type : DD.ui.Sizer.Control.EventType.CHANGE_ASPECT_RATIO_HEIGHT}));
	};

	prototype.setAspectRatioHeightInternal = function(value)
	{
		this.settings.aspectRatioWidth = value;
	};

	/**
	 * Сохранение/получение значение ширины
	 * @name DD.ui.Sizer.Control.prototype#width
	 * @type {Number}
	 * @public
	*/
	Object.defineProperty(prototype, "width", {
		get: prototype.getWidth_,
		set: prototype.setWidth_
	});

	/**
	 * Сохранение/получение значение высоты
	 * @name DD.ui.Sizer.Control.prototype#height
	 * @type {Number}
	 * @public
	*/
	Object.defineProperty(prototype, "height", {
		get: prototype.getHeight_,
		set: prototype.setHeight_
	});

	/**
	 * Сохранение/получение миниальной ширины
	 * @name DD.ui.Sizer.Control.prototype#minWidth
	 * @type {Number}
	 * @public
	*/
	Object.defineProperty(prototype, "minWidth", {
		get: prototype.getMinWidth_,
		set: prototype.setMinWidth_
	});

	/**
	 * Сохранение/получение минимальной высоты
	 * @name DD.ui.Sizer.Control.prototype#minHeight
	 * @type {Number}
	 * @public
	*/
	Object.defineProperty(prototype, "minHeight", {
		get: prototype.getMinHeight_,
		set: prototype.setMinHeight_
	});

	/**
	 * Сохранение/получение возможности драга компонента
	 * @name DD.ui.Sizer.Control.prototype#draggable
	 * @type {Boolean}
	 * @public
	*/
	Object.defineProperty(prototype, "draggable", {
		get: prototype.getDraggable_,
		set: prototype.setDraggable_
	});

	/**
	 * Сохранение/получение значения максимальной ширины
	 * @name DD.ui.Sizer.Control.prototype#maxWidth
	 * @type {Number}
	 * @public
	*/
	Object.defineProperty(prototype, "maxWidth", {
		get: prototype.getMaxWidth_,
		set: prototype.setMaxWidth_
	});

	/**
	 * Сохранение/получение значения максимальной высоты
	 * @name DD.ui.Sizer.Control.prototype#maxHeight
	 * @type {Number}
	 * @public
	*/
	Object.defineProperty(prototype, "maxHeight", {
		get: prototype.getMaxHeight_,
		set: prototype.setMaxHeight_
	});

	/**
	 * Сохранение/получение значения соотношения сторон по ширине
	 * @name DD.ui.Sizer.Control.prototype#aspectRatioWidth
	 * @type {Number}
	 * @public
	*/
	Object.defineProperty(prototype, "aspectRatioWidth", {
		get: prototype.getAspectRatioWidth_,
		set: prototype.setAspectRatioWidth_
	});

	/**
	 * Сохранение/получение значения соотношения сторон по высоте
	 * @name DD.ui.Sizer.Control.prototype#aspectRatioHeight
	 * @type {Number}
	 * @public
	*/
	Object.defineProperty(prototype, "aspectRatioHeight", {
		get: prototype.getAspectRatioHeight_,
		set: prototype.setAspectRatioHeight_
	});

	/**
	 * @name DD.ui.Sizer.Control.prototype#tracking
	 * @type {Number}
	 * @public
	*/
	Object.defineProperty(prototype, "tracking", {
		get: prototype.getTracking_,
		set: prototype.setTracking_
	});

}); // goog.scope