goog.provide('DD.ui.Sizer.renderer.Control');

goog.require('DD.ui.renderer.Component');
goog.require('DD.fx.DragDropHelper');
goog.require('goog.dom');
goog.require('goog.style');

DD.ui.Sizer.renderer.Control = function()
{
	DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.Sizer.renderer.Control, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.Sizer.renderer.Control);

DD.ui.Sizer.renderer.Control.CSS_CLASS = 'DD-sizer';

/**
 * Positions enum
 * @enum {Number}
 */
DD.ui.Sizer.renderer.Control.Position =
{
	'EAST'      : 2,
	'SOUTH'     : 4,
	'WEST'      : 8,
	'NORTH'     :16,
	'NORTHWEST' : 32,
	'NORTHEAST' : 64,
	'SOUTHEAST' : 128,
	'SOUTHWEST' : 256,
	'all'       : 510
};

/**
 * Basic styles.
 * @enum {Object}
 */
DD.ui.Sizer.renderer.Control.Style =
{
	GHOST_ELEMENT :
	{
		position : 'absolute',
		border   : '1px solid grey',
		zIndex   : '999',
		cursor   : 'move'
	},
	ENABLED :
	{
		pointerEvents : 'auto'
	},
	DISABLED :
	{
		pointerEvents : 'none'
	},
	HIDE_CLASSNAME     : 'hide',
	VISIBILITY_HIDDEN  : 'hidden',
	ABSOLUTE           : 'absolute'
};

/**
 * Error messages.
 * @enum {string}
 */
DD.ui.Sizer.renderer.Control.Error =
{
	CONTAINER_UNDEFINED: 'Sizer. Container. Id is undefined',
	HANDLE_CLASS_NAME_UNDEFINED: 'Sizer. Handle: className is undefined',

	MIN_WIDTH_CONTRADICTORY_MAX_WIDTH: 'Min width: value is contradictory with max width',
	MIN_WIDTH_HEIGHT_CONTRADICTORY: 'Min width: height value is contradictory with minHeight or maxHeight',

	MIN_HEIGHT_CONTRADICTORY_MAX_HEIGHT: 'Min height: value is contradictory with max height',
	MIN_HEIGHT_WIDTH_CONTRADICTORY: 'Min height: width value is contradictory with minWidth or maxWidth',

	MAX_WIDTH_CONTRADICTORY_MIN_WIDTH: 'Max width: value is contradictory with min width',
	MAX_WIDTH_HEIGHT_CONTRADICTORY: 'Max width: height value is contradictory with minHeight or maxHeight',

	MAX_HEIGHT_CONTRADICTORY_MIN_HEIGHT: 'Max height: value is contradictory with min height',
	MAX_HEIGHT_WIDTH_CONTRADICTORY: 'Max height: width value is contradictory with minWidth or maxWidth',

	MAX_HEIGHT_CONTRADICTORY_MIN_HEIGHT: 'Max height: value is contradictory with min height',
	MAX_HEIGHT_WIDTH_CONTRADICTORY: 'Max height: width value is contradictory with minWidth or maxWidth',

	ASPECT_RATIO_WIDTH_CONTRADICTORY: 'AspectRatioWidth: value is contradictory with min or max width',
	ASPECT_RATIO_HEIGHT_CONTRADICTORY: 'AspectRatioHeight: value is contradictory with min or max height',
	ASPECT_CONTRADICTORY: 'AspectRatioWidth / AspectRatioHeight: value is contradictory'
};

goog.scope(function()
{
	/** @alias DD.ui.Sizer.renderer.Control.prototype */
	var prototype = DD.ui.Sizer.renderer.Control.prototype,
	    superClass_ = DD.ui.Sizer.renderer.Control.superClass_;

	prototype.getCssClass = function()
	{
		return DD.ui.Sizer.renderer.Control.CSS_CLASS;
	};

	prototype.initializeDom = function(component)
	{
		superClass_.initializeDom.call(this, component);

		var O = this.initSettings(component);

		this.setWidth(component, O.width);
		this.setHeight(component, O.height);
		this.setupResizableHandler_(component);
		!O.tracking && this.createGhostBorder_(component);
		this.initDragDropHelper_(component);
	};

	prototype.initSettings = function (component)
	{
		var minWidth = component.minWidth,
		    maxWidth = component.maxWidth,
		    minHeight = component.minHeight,
		    maxHeight = component.maxHeight,
		    width = component.width,
		    height = component.height,
		    element = component.getElement(),
		    draggable = component.draggable;

		width = goog.isNumber(width) ? width : element.offsetWidth;
		height = goog.isNumber(height) ? height : element.offsetHeight;
		minWidth = goog.isNumber(minWidth) ? Math.min(minWidth, width) : 0;
		maxWidth = goog.isNumber(maxWidth) ? Math.max(maxWidth, width) : 0;
		minHeight = goog.isNumber(minHeight) ? Math.min(minHeight, width) : 0;
		maxHeight = goog.isNumber(maxHeight) ? Math.max(maxHeight, width) : 0;

		var O = {
			tracking  : component.tracking,
			element   : element,
			minWidth  : minWidth,
			maxWidth  : maxWidth,
			minHeight : minHeight,
			maxHeight : maxHeight,
			width     : width,
			height    : height,
			draggable : draggable
		};

		component.$cache('rendererSettings', O);

		return O;
	};

	prototype.setupResizableHandler_ = function (component)
	{
		for (var i = 0, count = component.sliders_.getCount(); i < count; i++)
		{
			var slider = component.sliders_.get(i);
			this.addResizableHandler_(component,
				DD.ui.Sizer.renderer.Control.Position[slider.getId()],
				'goog-ui-resizable-' + slider.getId(),
				slider.getEnabled(),
				slider.getVisible(),
				component.sliders_.getPriorityById(slider.getId())
			);
		};
	};

	prototype.initDragDropHelper_ = function(component)
	{
		var O = component.$cache('rendererSettings');

		O.DragDropHelper = new DD.fx.DragDropHelper(
		{
			source          : [O.element],
			target          : [O.element],
			pixelThreshold  : {desktop: 0, sensor: 0},
			lapseThreshold  : {desktop: 0, sensor: 0},
			allowClassNames : 'goog-ui-resizable' + (O.draggable ? ' ' + this.getCssClass() : ''),
			showDragImage   : false,
			onDragStart     : this.handleDragStartDriver_.bind(this, component),
			onDragDrop      : this.handleDragEndDriver_.bind(this, component),
			onDragOver      : this.handleDragDriver_.bind(this, component)
		});

		component.$cache('rendererSettings', O);
	};

	/**
	 * Wrapper for DragDropHelper to run drag handler function
	 * @param  {goog.events.Event} e Dragover event
	 */
	prototype.handleDragDriver_ = function(component, event)
	{
		event.currentTarget.target = event.dragSource;
		event.currentTarget.target.style.display = "";
		this.computeInitialPosition_(event.currentTarget, event.resource);
		requestAnimationFrame(this.handleDrag_.bind(this, component, event));
	};

	/**
	 * Calculate new position during component resize
	 * @param  {goog.events.Event} e Dragover event
	 * @return {Boolean}   True - if resize is not allowed, false - otherwise
	 * @private
	 */
	prototype.handleDrag_ = function(component, event)
	{
		var O = component.$cache('rendererSettings'),
		    dragger = event.currentTarget,
		    position = this.getDraggerPosition_(component, dragger),
		    el = O.tracking ? O.element : O.ghostBorder,
		    size = this.getSize_(el),
		    coord = this.getPosition_(el);

		if (position)
		{
			if (position & (DD.ui.Sizer.renderer.Control.Position['NORTHEAST'] | DD.ui.Sizer.renderer.Control.Position['EAST'] | DD.ui.Sizer.renderer.Control.Position['SOUTHEAST']))
			{ 
				size.width = O.containerSize.width + dragger.deltaX;
				if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0)
					size.height = size.width * O.aspectRatioHeight / O.aspectRatioWidth;
			};

			if (position & (DD.ui.Sizer.renderer.Control.Position['SOUTHEAST'] | DD.ui.Sizer.renderer.Control.Position['SOUTH'] | DD.ui.Sizer.renderer.Control.Position['SOUTHWEST']))
			{
				size.height = O.containerSize.height + dragger.deltaY;
				if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0)
					size.width = size.height * O.aspectRatioWidth / O.aspectRatioHeight;
			};

			if (position & (DD.ui.Sizer.renderer.Control.Position['SOUTHWEST'] | DD.ui.Sizer.renderer.Control.Position['WEST'] | DD.ui.Sizer.renderer.Control.Position['NORTHWEST']))
			{
				size.width = O.containerSize.width - dragger.deltaX;
				if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0)
					size.height = size.width * O.aspectRatioHeight / O.aspectRatioWidth;
				coord.x = O.containerCoord.x + dragger.deltaX;
			};

			if (position & (DD.ui.Sizer.renderer.Control.Position['NORTHWEST'] | DD.ui.Sizer.renderer.Control.Position['NORTH'] | DD.ui.Sizer.renderer.Control.Position['NORTHEAST']))
			{
				size.height = O.containerSize.height - dragger.deltaY;
				if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0)
					size.width = size.height * O.aspectRatioWidth / O.aspectRatioHeight;
				coord.y = O.containerCoord.y + dragger.deltaY;
			};

			if (!this.canResize(component, size.width, size.height))
				return true;

			this.resize_(component, el, size, coord, position, O.tracking);

			component.setSizeChange(size, {direction: position});
		}
		else if (event.source == O.element)
		{
			coord.x = O.containerCoord.x + event.resource.deltaX;
			coord.y = O.containerCoord.y + event.resource.deltaY;

			component.setBeforePositionChange(coord, {originalEvent : event, x: coord.x, y: coord.y});

			if (O.isBlockMove)
				return;
			
			if (goog.isNumber(O.blockMoveWhileCoordX))
				coord.x = O.blockMoveWhileCoordX;
			if (goog.isNumber(O.blockMoveWhileCoordY))
				coord.y = O.blockMoveWhileCoordY;

			el.style.left = coord.x + 'px';
			el.style.top = coord.y + 'px';

			component.setPositionChange(coord, {originalEvent : event, x: coord.x, y: coord.y});
		};

		return false;
	};

	prototype.setBlockMove = function(component, value)
	{
		var O = component.$cache('rendererSettings');
		O.isBlockMove = value;
		component.$cache('rendererSettings', O);
	};

	prototype.setBlockMoveWhileCoordX = function(component, value)
	{
		var O = component.$cache('rendererSettings');
		O.blockMoveWhileCoordX = value;
		component.$cache('rendererSettings', O);
	};

	prototype.setBlockMoveWhileCoordY = function(component, value)
	{
		var O = component.$cache('rendererSettings');
		O.blockMoveWhileCoordY = value;
		component.$cache('rendererSettings', O);
	};

	/**
	 * Wrapper for DragDropHelper to run drag end handler function
	 * @param  {goog.events.Event} e Dragend event
	 */
	prototype.handleDragEndDriver_ = function(component, event)
	{
		if (!event.dragSource)
			return 1;

		event.currentTarget.target = event.dragSource;
		event.currentTarget.target.style.display = "";
		this.computeInitialPosition_(event.currentTarget, event.sender);
		this.handleDragEnd_(component, event);
	};

	/**
	 * Hide ghost element if visibile or removed them if tracking=true. Run setting width/height properties
	 * @param  {goog.events.Event} e Dragend event
	 * @private
	 */
	prototype.handleDragEnd_ = function(component, event)
	{
		var O = component.$cache('rendererSettings');

		if (!O.tracking && goog.style.isElementShown(O.ghostBorder) == true)
		{
			this.setContainerPositionFromGhostEl(component, O.ghostElOriginalSize, O.ghostElOriginalCoord);
			goog.style.showElement(O.ghostBorder, false);
		}
		else if (O.tracking && O.ghostBorder)
		{
			O.ghostBorder.remove();
			component.$cache('ghostBorder', null);
			component.$cache('rendererSettings', O);
		};

		var currentSize = this.getSize_(O.element);
		this.setWidth(component, currentSize.width, false);
		this.setHeight(component, currentSize.height, false);
		component.setEndChange();
	};

	/**
	 * Checking aspect ratio values with input parameters
	 * @param  {Number} width  In pixels
	 * @param  {Number} height In pixels
	 * @return {Boolean}
	 * @public
	 */
	prototype.canResize = function (component, width, height)
	{
		var O = component.$cache('rendererSettings');

		if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0 && (
			((O.minWidth > 0 && width < O.minWidth) || (O.maxWidth > 0 && width > O.maxWidth)) || 
			((O.minHeight > 0 && height < O.minHeight) || (O.maxHeight > 0 && height > O.maxHeight)) ||
			(width / O.aspectRatioWidth != height / O.aspectRatioHeight)))
			return false;

		return true;
	};

	/**
	 * Set new size and position of resizable element
	 * @param  {DOMElement} container
	 * @param  {Object} size
	 * @param  {Object} coord
	 * @param  {Number} position
	 * @param  {Boolean} tracking
	 * @private
	 */
	prototype.resize_ = function(component, container, size, coord, position, tracking)
	{
		var newSize = new goog.math.Size(Math.max(size.width, 0), Math.max(size.height, 0));
		var specialDirection = position & (DD.ui.Sizer.renderer.Control.Position['NORTH']
		    | DD.ui.Sizer.renderer.Control.Position['NORTHEAST']
		    | DD.ui.Sizer.renderer.Control.Position['SOUTHWEST']
		    | DD.ui.Sizer.renderer.Control.Position['WEST']
		    | DD.ui.Sizer.renderer.Control.Position['NORTHWEST']);

		var O = component.$cache('rendererSettings');

		if (O.minWidth >= 0)
		{
			newSize.width = Math.max(newSize.width, O.minWidth > 0 ? O.minWidth : newSize.width);
			coord.x = ( specialDirection && newSize.width === O.minWidth ) ? O.rightX : coord.x ;
		};

		if (O.maxWidth >= 0)
		{
			newSize.width = Math.min(newSize.width, O.maxWidth > 0 ? O.maxWidth : newSize.width);
			coord.x = ( specialDirection && newSize.width === O.maxWidth ) ? O.leftX : coord.x ;
		};

		if (O.minHeight >= 0)
		{
			newSize.height = Math.max(newSize.height, O.minHeight > 0 ? O.minHeight : newSize.height);
			coord.y = ( specialDirection && newSize.height === O.minHeight ) ? O.bottomY : coord.y ;
		};

		if (O.maxHeight >= 0)
		{

			newSize.height = Math.min(newSize.height, O.maxHeight > 0 ? O.maxHeight : newSize.height);
			coord.y = ( specialDirection && newSize.height === O.maxHeight ) ? O.topY : coord.y ;
		};

		if (position & DD.ui.Sizer.renderer.Control.Position['NORTHWEST'])
		{
			coord.x = O.rightX - newSize.width;
			coord.y = O.bottomY - newSize.height;
		};

		if (!this.canResize(component, newSize.width, newSize.height))
			return true;

		goog.style.setBorderBoxSize(container, newSize);

		if (position & (DD.ui.Sizer.renderer.Control.Position['NORTHWEST']
		| DD.ui.Sizer.renderer.Control.Position['NORTH']
		| DD.ui.Sizer.renderer.Control.Position['NORTHEAST']
		| DD.ui.Sizer.renderer.Control.Position['SOUTHWEST']
		| DD.ui.Sizer.renderer.Control.Position['WEST']))
		{
			if (position & (DD.ui.Sizer.renderer.Control.Position['NORTHWEST']
			| DD.ui.Sizer.renderer.Control.Position['NORTH']
			| DD.ui.Sizer.renderer.Control.Position['NORTHEAST']))
				container.style.top = coord.y + 'px';

			if (position & (DD.ui.Sizer.renderer.Control.Position['NORTHWEST']
			| DD.ui.Sizer.renderer.Control.Position['SOUTHWEST']
			| DD.ui.Sizer.renderer.Control.Position['WEST']))
				container.style.left = coord.x + 'px';
		};

		if (O.tracking)
		{
			this.setWidth(component, newSize.width, false);
			this.setHeight(component, newSize.height, false);
		};
	};

	prototype.setTracking = function(component, value)
	{
		var O = component.$cache('rendererSettings');
		O.tracking = value;
		!value && this.createGhostBorder_(component);
		component.$cache('rendererSettings', O);
	};

	prototype.setDraggable = function(component, value)
	{
		var O = component.$cache('rendererSettings');
		O.draggable = value;

		component.$cache('rendererSettings', O);
	};
	/**
	 * Set element height after checking min./max. value
	 * @param {Number/String} height        In pixels
	 * @param {Boolean=} shouldResize=true Resize element if true.
	 * @public
	 */
	prototype.setHeight = function(component, value, shouldResize)
	{
		var O = component.$cache('rendererSettings');

		value = parseInt(value);
		value = isNaN(value) ? O.height : value;

		shouldResize = shouldResize == undefined ? true : false;
		O.height = Math.max(value, 0, O.minHeight);
		if (O.maxHeight > 0)
			Math.min(O.height, O.maxHeight);

		if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0 &&
			O.width != O.height * O.aspectRatioWidth / O.aspectRatioHeight)
			this.setWidth(component, O.height * O.aspectRatioWidth / O.aspectRatioHeight, shouldResize);

		if (shouldResize === true)
			goog.style.setBorderBoxSize(O.element, {width: O.width, height: O.height});

		component.$cache('rendererSettings', O);
		component.setHeightChange(O.height);
	};

	/**
	 * Set element width after checking min./max. value
	 * @param {Number/String} width        In pixels
	 * @param {Boolean=} shouldResize=true Resize element if true.
	 * @public
	 */
	prototype.setWidth = function(component, value, shouldResize)
	{
		var O = component.$cache('rendererSettings');

		value = parseInt(value);
		value = isNaN(value) ? O.width : value;
		shouldResize = shouldResize == undefined ? true : false;

		O.width = Math.max(value, 0, O.minWidth);
		if (O.maxWidth > 0)
			Math.min(O.width, O.maxWidth);

		if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0 && 
			O.height != O.width * O.aspectRatioHeight / O.aspectRatioWidth)
			this.setHeight(component, O.width * O.aspectRatioHeight / O.aspectRatioWidth, shouldResize);

		if (shouldResize === true)
			goog.style.setBorderBoxSize(O.element, {width: O.width, height: O.height});

		component.$cache('rendererSettings', O);
		component.setWidthChange(O.width);
	};

	/**
	 * Set max. height after checking min. and aspect ratio values
	 * @param {Number/String} height        In pixels
	 * @public
	 */
	prototype.setMaxHeight = function(component, value)
	{
		var O = component.$cache('rendererSettings');

		if (value < O.height)
		{
			if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0)
			{
				var newWidth = value * O.aspectRatioWidth / O.aspectRatioHeight;
				if ((newWidth < O.minWidth && O.minWidth)
				|| (newWidth > O.maxWidth && O.maxWidth > 0))
					throw Error(DD.ui.Sizer.renderer.Control.Error.MAX_HEIGHT_WIDTH_CONTRADICTORY);
			};
			this.setHeight(component, value);
		};

		O.maxHeight = value;
		component.$cache('rendererSettings', O);
		component.setMaxHeightChange(O.maxHeight);
	};

	/**
	 * Set max. width after checking min. and aspect ratio values
	 * @param {Number/String} width        In pixels
	 * @public
	 */
	prototype.setMaxWidth = function(component, value)
	{
		var O = component.$cache('rendererSettings');

		if (value < O.width)
		{
			if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0)
			{
				var newHeight = value * O.aspectRatioHeight / O.aspectRatioWidth;
				if ((newHeight < O.minHeight && O.minHeight > 0)
				  || (newHeight > O.maxHeight && O.maxHeight))
				throw Error(DD.ui.Sizer.renderer.Control.Error.MAX_WIDTH_HEIGHT_CONTRADICTORY);
			};
			this.setWidth(component, value);
		};

		O.maxWidth = value;
		component.$cache('rendererSettings', O);
		component.setMaxWidthChange(O.maxWidth);
	};

	/**
	 * Set min. width after checking max. and aspect ratio values
	 * @param {Number/String} width        In pixels
	 * @public
	 */
	prototype.setMinWidth = function(component, value)
	{
		var O = component.$cache('rendererSettings');

		if (value > 0 && value > O.width)
		{
			if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0)
			{
				var newHeight = value * O.aspectRatioHeight / O.aspectRatioWidth;
				if ((newHeight < O.minHeight && O.minHeight) 
				   || (newHeight > O.maxHeight && O.maxHeight))
				{
					throw Error(DD.sizer.Sizer.Error.MIN_WIDTH_HEIGHT_CONTRADICTORY);
				};
			};
			this.setWidth(component, value);
		};

		O.minWidth = value;
		component.$cache('rendererSettings', O);
		component.setMinWidthChange(O.minWidth);
	};

	/**
	 * Set min. height after checking max. and aspect ratio values
	 * @param {Number/String} height        In pixels
	 * @public
	 */
	prototype.setMinHeight = function(component, value)
	{
		var O = component.$cache('rendererSettings');

		if (value > 0 && value > O.height)
		{
			if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0)
			{
				var newWidth = value * O.aspectRatioWidth / O.aspectRatioHeight;
				if ((newWidth < O.minWidth && O.minWidth > 0) 
				  || (newWidth > O.maxWidth && O.maxWidth > 0))
					throw Error(DD.ui.Sizer.renderer.Control.Error.MIN_HEIGHT_WIDTH_CONTRADICTORY);
			};
			this.setHeight(component, value);
		};

		O.minHeight = value;
		component.$cache('rendererSettings', O);
		component.setMinHeightChange(O.minHeight);
	};

	/**
	 * Set aspect ratio width after checking min./max. values
	 * @param {Number/String} width
	 * @public
	 */
	prototype.setAspectRatioWidth = function(component, value)
	{
		var O = component.$cache('rendererSettings'),
		    newWidthObject = O.height * value / O.aspectRatioHeight;

		if (value > 0 && O.aspectRatioHeight > 0
		&& (newWidthObject < O.minWidth || newWidthObject > O.maxWidth))
		{
			O.aspectRatioWidth_ = 0;
			this.setAspectRatioHeight(component, 0);
			throw Error(DD.ui.Sizer.renderer.Control.Error.ASPECT_RATIO_WIDTH_CONTRADICTORY);
		}
		else
		{
			O.aspectRatioWidth = value;

			if (O.aspectRatioWidth > 0 && O.aspectRatioHeight > 0)
				this.setWidth(component, newWidthObject);

			component.eventChangeAspectRatioWidth({
				value : O.aspectRatioWidth
			});
		};

		component.$cache('rendererSettings', O);
		component.setAspectRatioWidthChange(O.aspectRatioWidth);
	};

	/**
	 * Set aspect ratio height after checking min./max. values
	 * @param {Number/String} height
	 * @public
	 */
	prototype.setAspectRatioHeight = function(component, value)
	{
		var O = component.$cache('rendererSettings'),
		    newHeightObject = O.width * value / O.aspectRatioWidth;

		if (value > 0 && O.aspectRatioWidth > 0
		&& (newHeightObject < O.minHeight || newHeightObject > O.maxHeight))
		{
			O.aspectRatioHeight = 0;
			this.setAspectRatioWidth(component, 0);
			throw Error(DD.ui.Sizer.renderer.Control.Error.ASPECT_RATIO_HEIGHT_CONTRADICTORY);
		}
		else
		{
			O.aspectRatioHeight = value;
			if (O.aspectRatioHeight > 0 && O.aspectRatioWidth > 0)
				this.setHeight(component, newHeightObject);

			component.eventChangeAspectRatioHeight({
				value : O.aspectRatioHeight
			});
		};

		component.$cache('rendererSettings', O);
		component.setAspectRatioHeightChange(O.aspectRatioWidth);
	};

	/**
	 * Wrapper for DragDropHelper to run drag start handler function
	 * @param  {goog.events.Event} e Dragstart event
	 */
	prototype.handleDragStartDriver_ = function(component, event)
	{
		event.currentTarget.target = event.dragSource;
		event.currentTarget.target.style.display = "";
		this.computeInitialPosition_(event.currentTarget, event.currentTarget);
		this.handleDragStart_(component, event);
	};

	/**
	 * Set initial parameters
	 * @param  {goog.events.Event} e Dragstart event
	 * @private
	 */
	prototype.handleDragStart_ = function(component, event)
	{
		var O = component.$cache('rendererSettings'),
		    dragger = event.currentTarget,
		    position = this.getDraggerPosition_(component, dragger),
		    targetPos = goog.style.getPosition(dragger.target);
		    tmpElement = null,
		    size = new Object(),
		    coord = new Object();


		if (!O.tracking)
		{
			var bounds = O.element.getBoundingClientRect();
			goog.style.setPosition(O.ghostBorder, bounds.left, bounds.top);
			goog.style.setBorderBoxSize(O.ghostBorder, this.getSize_(O.element));
			goog.style.showElement(O.ghostBorder, true);
			O.ghostElOriginalSize = this.getSize_(O.ghostBorder);
			O.ghostElOriginalCoord = this.getPosition_(O.ghostBorder);
		}
		else
		{
			O.ghostBorder = O.element.cloneNode();
			O.ghostBorder.style.visibility = DD.ui.Sizer.renderer.Control.Style.VISIBILITY_HIDDEN;
			O.ghostBorder.style.position = DD.ui.Sizer.renderer.Control.Style.ABSOLUTE;
			goog.style.setPosition(O.ghostBorder, goog.style.getPosition(O.element));
			document.body.appendChild(O.ghostBorder);
		};

		tmpElement = O.tracking ? O.element : O.ghostBorder;
		size = this.getSize_(tmpElement);
		coord = this.getPosition_(tmpElement);

		O.containerCoord = coord;
		O.containerSize = new goog.math.Size(size.width , size.height);
		component.$cache('rendererSettings', O);

		component.setStartChange(DD.ui.Sizer.renderer.Control.Position[this.getPositionNameByValue(position)]);

		this.setupMinAndMaxCoord_(component, coord, size, position);
	};

	/**
	 * Set min. and max. coordinates for resizable element
	 * @param  {Object} coord    Current coordinates of element
	 * @param  {Object} size     Current size of element
	 * @param  {Number} position Index of handle's element
	 * @private
	 */
	prototype.setupMinAndMaxCoord_ = function (component, coord, size, position)
	{
		var leftX = 0,
		    rightX = 0,
		    topY = 0,
		    bottomY = 0,
		    O = component.$cache('rendererSettings');

		if (position & DD.ui.Sizer.renderer.Control.Position['NORTHWEST'])
		{
			leftX = coord.x + size.width;
			rightX = coord.x + size.width;
		}
		else if (position & (DD.ui.Sizer.renderer.Control.Position['NORTH'] | DD.ui.Sizer.renderer.Control.Position['NORTHEAST']))
		{
			leftX = coord.x;
			rightX = coord.x;
		}
		else
		{
			leftX = coord.x - ( O.maxWidth - size.width );
			rightX = coord.x + ( size.width - O.minWidth );
		};

		if (position & DD.ui.Sizer.renderer.Control.Position['NORTHWEST'])
		{
			topY = coord.y + size.height;
			bottomY = coord.y + size.height;  
		}
		else if (position & (DD.ui.Sizer.renderer.Control.Position['SOUTHWEST'] | DD.ui.Sizer.renderer.Control.Position['WEST']))
		{
			topY = coord.y ;
			bottomY = coord.y;
		}
		else
		{
			topY = coord.y - ( O.maxHeight - size.height );
			bottomY = coord.y + ( size.height - O.minHeight );
		};

		O.leftX = leftX;
		O.rightX = rightX;
		O.topY = topY;
		O.bottomY = bottomY;
		component.$cache('rendererSettings', O);
	};

	/**
	 * Get position name 
	 * @param  {[type]} val Index value
	 * @return {String}
	 * @public
	 */
	prototype.getPositionNameByValue = function (val)
	{
		return Object.keys(DD.ui.Sizer.renderer.Control.Position).filter(function(key)
		{
			return DD.ui.Sizer.renderer.Control.Position[key] === val
		})[0];
	};

	/**
	 * Get position of DOM element by style property
	 * @param  {DOMElement} el
	 * @return {Object}
	 * @private
	 */
	prototype.getPosition_ = function(element)
	{
		var coord = goog.style.getPosition(element);
		coord.x = parseFloat(element.style.left) || coord.x;
		coord.y = parseFloat(element.style.top)  || coord.y;
		return coord;
	};

	/**
	 * Get size of DOM element by style property
	 * @param  {DOMElement} el
	 * @return {Object}
	 * @private
	 */
	prototype.getSize_ = function(element)
	{
		return {
			height : element.offsetHeight,
			width  : element.offsetWidth
		};
	};

	/**
	 * Set container size and coordinates from ghost element style properties after resizing ghost element
	 * @param  {Object} originalSize Size and coordinates of ghost element before resizing
	 *  @param {Number} originalSize.width
	 *  @param {Number} originalSize.height
	 *  @param {Number} originalCoord.x
	 *  @param {Number} originalCoord.y
	 * @private
	 */
	prototype.setContainerPositionFromGhostEl = function(component, originalSize, originalCoord)
	{
		originalSize = originalSize || {width: 0, height: 0};
		originalCoord = originalCoord || {x: 0, y: 0};

		var O = component.$cache('rendererSettings'),
		    size = this.getSize_(O.ghostBorder),
		    coord = goog.style.getPosition(O.ghostBorder);

		var diffSize = {
			width  : size.width-originalSize.width, 
			height : size.height-originalSize.height
		};

		var diffCoord = {
		  x: coord.x - originalCoord.x, 
		  y: coord.y - originalCoord.y
		};

		var containerSizeOriginal = this.getSize_(O.element);
		var containerCoordOriginal = this.getPosition_(O.element);
		var containerSizeNew = {
			width  : containerSizeOriginal.width + diffSize.width,
			height : containerSizeOriginal.height + diffSize.height
		};
		var containerCoordNew = {
			x : containerCoordOriginal.x + diffCoord.x,
			y : containerCoordOriginal.y + diffCoord.y
		};

		O.element.style.width = containerSizeNew.width + 'px';
		O.element.style.height = containerSizeNew.height + 'px';
		O.element.style.left = containerCoordNew.x + 'px';
		O.element.style.top = containerCoordNew.y + 'px';
	};

	/**
	 * Get index of dragger element
	 * @param  {Object} dragger
	 * @return {Object/Number}
	 * @private
	 */
	prototype.getDraggerPosition_ = function(component, dragger)
	{
		var O = component.$cache('rendererSettings');

		for (var position in O.handleDraggers)
			if (O.handleDraggers[position] === dragger.target)
				return goog.string.toNumber(position);

		return null;
	};

	/**
	 * Add 'deltaX'/'deltaY' properties 
	 * @param  {Object} dst To add properties to
	 * @param  {Object} src To get properties from
	 * @private
	 */
	prototype.computeInitialPosition_ = function(dst, src)
	{
		dst.deltaX = (src.deltaOffset && src.deltaOffset.x) || src.deltaX;
		dst.deltaY = (src.deltaOffset && src.deltaOffset.y) || src.deltaY;
	};

	/**
	 * Create ghost element, run resizing or remove it
	 * @private
	 */
	prototype.createGhostBorder_ = function(component)
	{
		var O = component.$cache('rendererSettings');

		if (!O.tracking && !O.ghostBorder)
		{
			O.ghostBorder = goog.dom.createDom('div');
			goog.style.setStyle(O.ghostBorder, DD.ui.Sizer.renderer.Control.Style.GHOST_ELEMENT);
			goog.style.setStyle(O.ghostBorder,
			{
				position : goog.style.getClientPosition(component.getElement()),
				width    : component.getWidth(),
				height   : component.getHeight()
			});
			document.body.appendChild(O.ghostBorder);
			goog.style.showElement(O.ghostBorder, false);
		}
		else if (!O.tracking && O.ghostBorder)
		{
			this.resizeGhostContainer_(component);
		}
		else if (O.tracking && O.ghostBorder)
		{
			O.ghostBorder.remove();
			O.ghostBorder = null;
		};

		component.$cache('rendererSettings', O);
	};

	prototype.getGhostBorder = function(component)
	{
		return component.$cache('rendererSettings').ghostBorder;
	};

	/**
	 * Change size of ghost element if it were created
	 * @private
	 */
	prototype.resizeGhostContainer_ = function(component)
	{
		var O = component.$cache('rendererSettings');

		if (O.ghostBorder)
		{
			var statusCurrent = O.ghostBorder.style.display;
			goog.style.setPosition(O.ghostBorder, goog.style.getClientPosition(O.element));
			goog.style.setWidth(O.ghostBorder, component.getWidth());
			goog.style.setHeight(O.ghostBorder, component.getHeight());
			O.ghostBorder.style.display = statusCurrent;
		};
	};

	prototype.addResizableHandler_ = function(component, position, className, enabled, visible, priority)
	{
		var O = component.$cache('rendererSettings'),
		    handle = goog.dom.createDom('div', className + ' goog-ui-resizable');

		handle.style.zIndex =  999 - (priority || 1);

		O.element.appendChild(handle);

		this.setEnabledElements(handle, enabled);
		this.setVisibleElements(handle, visible);
		this.setHandleDraggers(component, position, handle);
		this.setHandles(component, position, handle);
	};

	prototype.setHandleDraggers = function (component, position, value)
	{
		var O = component.$cache('rendererSettings');

		!O.handleDraggers && (O.handleDraggers = new Object());
		O.handleDraggers[position] = value;
		component.$cache('rendererSettings', O);
	};

	prototype.setHandles = function (component, position, value)
	{
		var O = component.$cache('rendererSettings');

		!O.handlers && (O.handlers = new Object());
		O.handlers[position] = value;
		component.$cache('rendererSettings', O);
	};

	/**
	 * Add or remove element styles (DD.sizer.Sizer.Style.HIDE_CLASSNAME)
	 * @param {DOMElement/DOMElement[]} elements
	 * @param {Boolean} visible
	 * @public
	 */
	prototype.setVisibleElements = function (elements, visible)
	{
		if (goog.isArrayLike(elements))
		{
			goog.array.forEach(elements, function(element)
			{
				this.setVisibleElements(element, visible);
			}.bind(this));
		}
		else
		{
			if (visible)
				goog.dom.classlist.remove(elements, DD.ui.Sizer.renderer.Control.Style.HIDE_CLASSNAME);
			else
				goog.dom.classlist.add(elements,  DD.ui.Sizer.renderer.Control.Style.HIDE_CLASSNAME);
		};
	};

	/**
	 * Change element styles to DD.sizer.Sizer.Style.ENABLED or DD.sizer.Sizer.Style.DISABLED
	 * @param {DOMElement/DOMElement[]} elements
	 * @param {Boolean} enabled
	 * @public
	 */
	prototype.setEnabledElements = function (elements, enabled)
	{
		if (goog.isArrayLike(elements))
		{
			goog.array.forEach(elements, function(element)
			{
				this.setEnabledElements(element, enabled);
			}.bind(this));
		}
		else
		{
			if (!goog.array.isEmpty(goog.dom.classlist.get(elements)))
			{
				if (enabled)
					goog.style.setStyle(elements, DD.ui.Sizer.renderer.Control.Style.ENABLED);
				else
					goog.style.setStyle(elements, DD.ui.Sizer.renderer.Control.Style.DISABLED);
			};
		};
	};

	prototype.hide = function(component)
	{
		var element = component.getElement();

		if (!element)
			return;

		element.style.display = 'none';
		component.setElementHide();
	};

	prototype.show = function(component)
	{
		var element = component.getElement();

		if (!element)
			return;

		element.style.display = 'block';
		component.setElementShow();
	};
}); // goog.scope