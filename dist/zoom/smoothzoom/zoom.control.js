goog.provide('DD.ui.Zoom.Control');

goog.require('goog.object');
goog.require('goog.events');
goog.require('goog.ui.Control');
goog.require('goog.async.run');
goog.require('goog.string');
goog.require('goog.string.format');
goog.require('goog.labs.userAgent.device');
goog.require('DD.ui.Zoom.DomHelperJQ');
goog.require('DD.ui.Zoom.Constants');
goog.require('DD.ui.Zoom.events');
goog.require('DD.ui.Zoom.ViewPort');
goog.require('DD.ui.Zoom.renderer.Control');

/**
 *
 * @param opt_content
 * @param opt_renderer
 * @param opt_domHelper
 * @constructor
 */
DD.ui.Zoom.Control = function (opt_content, opt_renderer, opt_domHelper) {
	var domHelper = opt_domHelper || new DD.ui.Zoom.DomHelperJQ();
	var renderer = opt_renderer || DD.ui.Zoom.renderer.Control.getInstance();
	goog.base(this, opt_content, renderer, domHelper);

	DD.ui.Zoom.Control.CHANGE_CONTEXT = goog.object.clone(DD.ui.Zoom.events.CHANGE_CONTEXT);
	goog.object.extend(DD.ui.Zoom.Control.CHANGE_CONTEXT, { CC_ZOOM_PAN : 'zoom_pan' });

	this.stateManager_ = new DD.ui.Zoom.Control.StateManager();

	this.setDefaultState_();

	/**
	 * Default value for src should be space-value string to avoid of firing javascript error by smoothZoomPan control
	 * @type {string}
	 * @private
	 */
	this.imageSrc_ = " ";
};
goog.inherits(DD.ui.Zoom.Control, goog.ui.Control);

// Register the default renderer for DD.ui.Zoom.Control.
goog.ui.registry.setDefaultRenderer(DD.ui.Zoom.Control, DD.ui.Zoom.renderer.Control);

// Register a decorator factory function for DD.ui.SmoothZoom.
goog.ui.registry.setDecoratorByClassName(DD.ui.Zoom.renderer.Control.CSS_CLASS,
	function() {
		return new DD.ui.Zoom.Control();
	}
);


goog.scope(function(){
	var prototype = DD.ui.Zoom.Control.prototype;

	/**
	 * Set defaults for control. Initial state.
	 * @private
	 */
	prototype.setDefaultState_ = function(){
		this.zoom_ = DD.ui.Zoom.Constants.DEFAULT_ZOOM;
		this.positionX_ = DD.ui.Zoom.Constants.DEFAULT_POSITION_X;
		this.positionY_ = DD.ui.Zoom.Constants.DEFAULT_POSITION_Y;

		/**
		 * ViewPort object.
		 * @type {DD.ui.SmoothZoom.ViewPort}
		 * @private
		 */
		this.viewPort_ = new DD.ui.Zoom.ViewPort();

		/**
		 * Jquery object instantiated by smoothZoom control.
		 * @type {jQuery object}
		 * @private
		 */
		this.elementJQ_ = null;

		/**
		 * Values of center point. Needed for zoom and pan actions.
		 * @type {number}
		 * @private
		 */
		this.centerX_ = DD.ui.Zoom.Constants.DEFAULT_WIDTH / 2;
		this.centerY_ = DD.ui.Zoom.Constants.DEFAULT_HEIGHT / 2;

		/**
		 * Minimum value of zoom.
		 * @type {number}
		 * @private
		 */
		this.zoomMin_ = 0;

		this.lastCaller_ = "";

		/**
		 * Order of buttons like
		 * @type {null}
		 * @private
		 */
		this.panButtons_ = null;

		this.stateManager_.reset();
	};

	//<editor-fold desc="Properties">
	prototype.getZoom = function(){
		return this.zoom_;
	};

	/**
	 * Property for zoom value. Contol change it's state immediately.
	 * @param value
	 */
	prototype.setZoom = function(value, speed){
		this.zoom_ = value;
		this.focus_({zoom : this.zoom_, speed: speed || speed == 0 ? speed : 2 });
		this.dispatchEvent(new DD.ui.Zoom.events.ChangeEvent(this, DD.ui.Zoom.Control.CHANGE_CONTEXT.CC_ZOOM));
	};

	prototype.getPositionX = function(){
		return this.positionX_;
	};

	prototype.setPositionX = function(value){
		this.positionX_ = value;
		this.focus_({x : this.positionX_ });
	};

	prototype.getPositionY = function(){
		return this.positionY_;
	};

	prototype.setPositionY = function(value){
		this.positionY_ = value;
		this.focus_( {y : this.positionY_ });
	};

	prototype.getViewPort = function(){
		return this.viewPort_;
	};

	prototype.setViewPort = function(value){
		this.viewPort_ = value;
	};

	prototype.getImageSrc = function(){
		return this.imageSrc_;
	};

	prototype.setImageSrc_ = function(value) {
		this.imageSrc_ = value;
	};

	prototype.getElementJQInternal = function(){
		return this.elementJQ_;
	};

	prototype.setElementJQInternal = function(value){
		this.elementJQ_ = value;
	};

	prototype.getCenterX_ = function(){
		return this.centerX_;
	};

	prototype.setCenterX_ = function(value){
		this.centerX_ = value;
	};

	prototype.getCenterY_ = function(){
		return this.centerY_;
	};

	prototype.setCenterY_ = function(value){
		this.centerY_ = value;
	};

	prototype.getPanButtons_ = function(){
		return this.panButtons_;
	};

	prototype.setPanButtonsInternal = function(value){
		this.panButtons_ = value;
		if(this.isInDocument()){
			this.bindButtonEvents_(value);
		}
	};

	prototype.getZoomMin = function(){
		return this.zoomMin_;
	};

	prototype.setZoomMin_ = function(value){
		this.zoomMin_ = value;
	};

	prototype.getLastCaller_ = function(){
		return this.lastCaller_;
	};

	prototype.setLastCaller_ = function(value){
		this.lastCaller_ = value;
	};

	prototype.getStateManager_ = function(){
		return this.stateManager_;
	};

	prototype.setStateManager_ = function(value){
		this.stateManager_ = value;
	};

	prototype.isDesktop = function(){
		return this.isDesktop_ = this.isDesktop_ || goog.labs.userAgent.device.isDesktop();
	};
	//</editor-fold>

	/**
	 * Finds internal <img> html element of smoothZoom component.
	 * @returns {dom object}
	 * @private
	 */
	prototype.getImageElement_ = function(){
		return this.getDomHelper().getElementsByTagNameAndClass(goog.dom.TagName.IMG, null, this.getElement())[0];
	};

	/**
	 * Finds internal <img> html element of smoothZoom component.
	 * @returns {dom object}
	 * @public
	 */
	prototype.getImageElement = function(){
		return this.getImageElement_();
	};

	/**
	 * Load image to control.
	 * @param src
	 * @returns {boolean}
	 */
	prototype.load = function(src){
		this.setLastCaller_(DD.ui.Zoom.Control.CHANGE_CONTEXT.CC_LOAD);
		this.setEnabled(true);
		this.setImageSrc_(src);
		this.getStateManager_().reset();
		this.getRenderer().updateSmoothZoom(this, this.getElementJQInternal());
		return true;
	};

	/**
	 * Reset control to default state and reload image.
	 * @returns {boolean}
	 */
	prototype.reset = function(){
		this.setDefaultState_();
		this.setLastCaller_(DD.ui.Zoom.Control.CHANGE_CONTEXT.CC_RESET);
		this.getRenderer().decorate(this, this.getElement());
		return true;
	};


	/**
	 * Pan left action. It will move right if "pan_REVERSE" of smoothZoom option was set to false.
	 * @param e - Event
	 * @private
	 */
	prototype.moveLeft_ = function(e){
		this.getElementJQInternal().smoothZoom('moveLeft');
	};

	/**
	 * Pan right action. It will move left if "pan_REVERSE" of smoothZoom option was set to false.
	 * @param e - Event
	 * @private
	 */
	prototype.moveRight_ = function(e){
		this.getElementJQInternal().smoothZoom('moveRight');
	};

	/**
	 * Pan up action. It will move down if "pan_REVERSE" of smoothZoom option was set to false.
	 * @param e - Event
	 * @private
	 */
	prototype.moveUp_ = function(e){
		this.getElementJQInternal().smoothZoom('moveUp');
	};

	/**
	 * Pan down action. It will move up if "pan_REVERSE" of smoothZoom option was set to false.
	 * @param e - Event
	 * @private
	 */
	prototype.moveDown_ = function(e){
		this.getElementJQInternal().smoothZoom('moveDown');
	};

	/**
	 * Internal handler of smoothZoom ZOOM_PAN_UPDATE event. Do nothing if no image loaded. Updates enabled state
	 * of Pan buttons.
	 * @param data
	 * @param completed
	 * @internal
	 */
	prototype.zoomPanUpdatedInternal = function(data, completed){
		var changed = this.updateState_(data);
		changed && this.dispatchEvent(new DD.ui.Zoom.events.ChangeEvent(this, DD.ui.Zoom.Control.CHANGE_CONTEXT.CC_ZOOM));
		this.updatePanButtonsState_();
		this.dispatchEvent('zoom');
	};

	/**
	 * Update state of pan buttons. Disables button if image reaches it's edge.
	 * @private
	 */
	prototype.updatePanButtonsState_ = function(){
		if(this.isDesktop()){
			var buttonClasses = this.getRenderer().getButtonClasses();
			var panButtons = this.getPanButtons_();
			var data = this.getSmoothZoomData_();
			var viewPort = this.getViewPort();
			if(this.getPositionX() <= 0){
				panButtons[buttonClasses.LEFT].setEnabled(false);
			}
			else{
				panButtons[buttonClasses.LEFT].setEnabled(true);
			}
			if(this.getPositionY() <= 0){
				panButtons[buttonClasses.UP].setEnabled(false);
			}
			else{
				panButtons[buttonClasses.UP].setEnabled(true);
			}
			var vHeight = viewPort.getHeight();
			(goog.isString(vHeight) && vHeight.match(/%/)) && (vHeight = this.element_.offsetHeight);
			if((data.scaledHeight - data.scaledY) <= vHeight){
				panButtons[buttonClasses.DOWN].setEnabled(false);
			}
			else{
				panButtons[buttonClasses.DOWN].setEnabled(true);
			}
			var vWidth = viewPort.getHeight();
			(goog.isString(vWidth) && vWidth.match(/%/)) && (vWidth = this.element_.offsetWidth);
			if((data.scaledWidth - data.scaledX) <= vWidth){
				panButtons[buttonClasses.RIGHT].setEnabled(false);
			}
			else{
				panButtons[buttonClasses.RIGHT].setEnabled(true);
			}
		}
	};

	/**
	 * Scale image to ViewPort. Recalculates zoom to place image right into the ViewPort.
	 * @param data
	 * @private
	 */
	prototype.scaleImageToViewPort_ = function(data){
		var zoomValue = this.getScale_(data) * 100;
		this.getStateManager_().tryChange(DD.ui.Zoom.Control.StateManager.States.SCALING_STARTED);
		this.setZoom(zoomValue);
	};

	/**
	 * Disables control and activates loader.
	 * @private
	 */
	prototype.activateLoader_ = function(){
		this.setEnabled(false);
		this.getElementJQInternal().css('background-image', 'url(zoom_assets/preloader.gif)');
	};

	/**
	 *
	 * @param opt_data
	 * @returns {number}
	 * @private
	 */
	prototype.getScale_ = function(opt_data){
		var data = opt_data || this.getSmoothZoomData_();
		var viewPort = this.getViewPort();

		var vWidth = viewPort.getWidth();
		(goog.isString(vWidth) && vWidth.match(/%/)) && (vWidth = this.element_.offsetWidth);

		var vHeight = viewPort.getHeight();
		(goog.isString(vHeight) && vHeight.match(/%/)) && (vHeight = this.element_.offsetHeight);

		var parameter = 0 % 180 == 0 ? data.scaledWidth : data.scaledHeight;
		var widthZoomValue = data.ratio * vWidth / parameter;

		parameter = 0 % 180 == 0 ? data.scaledHeight : data.scaledWidth ;
		var heightZoomValue = data.ratio * vHeight / parameter;

		return widthZoomValue > heightZoomValue ? widthZoomValue : heightZoomValue;
	};

	/**
	 * Checks if current zoom is minimum.
	 * @returns {boolean}
	 */
	prototype.isZoomMin = function(){
		return this.getZoom() <= this.getZoomMin();
	};

	/**
	 * Handler for smoothZoom ZOOM_PAN_COMPLETED event.
	 * @param data
	 * @internal
	 */
	prototype.zoomPanCompletedInternal = function(data) {
		this.dispatchEvent('zoomend');
	};

	/**
	 * Handler on size of ViewPort change.
	 * @public
	 */
	prototype.resize = function(){};

	/**
	 * Function to apply change of Zoom, PositionX and PositionY value changes.
	 * @param params
	 * @private
	 */
	prototype.focus_ = function(params){
		var elementJQ = this.getElementJQInternal();
		var data = {
			x : this.getCenterX_(),
			y : this.getCenterY_(),
			zoom : this.getZoom()
		};
		goog.object.extend(data, params);
		elementJQ.smoothZoom('focusTo', data);
	};

	/**
	 * Update state of control from smoothZoom data. Set values outside properties to prevent of circular events.
	 * @param opt_data
	 * @private
	 */
	prototype.updateState_ = function(opt_data){
		var data = goog.isDef(opt_data) ? opt_data : this.getSmoothZoomData_();
		var changed = false;
		if(this.getZoom() != data.ratio * 100){
			this.zoom_ = data.ratio * 100;
			changed = true;
		}
		var normX = goog.string.toNumber(data.normX);
		if(this.getPositionX() != normX){
			this.positionX_ = normX || 0;
			changed = true;
		}
		var normY = goog.string.toNumber(data.normY);
		if(this.getPositionY() != normY){
			this.positionY_ = normY || 0;
			changed = true;
		}
		return changed;
	};

	/**
	 * Bind button event's handlers. Handle mousedown event and apply needed action.
	 * @param panButtons
	 * @private
	 */
	prototype.bindButtonEvents_ = function(panButtons){
		if(panButtons != null){
			var buttonSelectors = this.getRenderer().getButtonClasses();
			this.getHandler()
				.listen(panButtons[buttonSelectors.LEFT],
					goog.events.EventType.MOUSEDOWN,
					this.moveLeft_)
				.listen(panButtons[buttonSelectors.RIGHT],
					goog.events.EventType.MOUSEDOWN,
					this.moveRight_)
				.listen(panButtons[buttonSelectors.UP],
					goog.events.EventType.MOUSEDOWN,
					this.moveUp_)
				.listen(panButtons[buttonSelectors.DOWN],
					goog.events.EventType.MOUSEDOWN,
					this.moveDown_)
				.listen(this.getElement(),
					goog.events.EventType.POINTEROVER,
					this.applyPointerBehavior_);
		}
	};

	/**
	 * Get
	 * @returns {smoothZoom data object:
	 *  normX,
	 *  normY,
	 *  normWidth,
	 *  normHeight,
	 *  scaledX,
	 *  scaledY,
	 *  scaledWidth,
	 *  scaledHeight,
	 *  centerX,
	 *  centerY,
	 *  ratio}
	 * @private
	 */
	prototype.getSmoothZoomData_ = function(){
		return this.getElementJQInternal().smoothZoom('getZoomData');
	};

	/**
	 * @returns {smoothZoom data object:
	 * @public
	 */
	prototype.getSmoothZoomData = function(){
		return this.getSmoothZoomData_();
	};

	/**
	 * Update center for which focus calls.
	 * @param data - smoothZoom data.
	 * @private
	 */
	prototype.updateCenter_ = function(data){
		this.setCenterX_(data.centerX);
		this.setCenterY_(data.centerY);
	};

	/**
	 * @override
	 */
	prototype.enterDocument = function(){
		DD.ui.Zoom.Control.superClass_.enterDocument.call(this);
		this.getHandler()
			.listen(this.getViewPort(), goog.events.EventType.CHANGE, this.resize_)
			.listen(this.getStateManager_(), DD.ui.Zoom.Control.StateManager.States.IMAGE_PRELOADED, this.handleImagePreloaded_)
			.listen(this.getStateManager_(), DD.ui.Zoom.Control.StateManager.States.INITIALIZED, this.handleInitialized_);
		if(this.isDesktop()){
			this.bindButtonEvents_(this.getPanButtons_());
		}
	};

	/**
	 * Image preloaded event handler. Run scaling as async operation because image will be loaded after this event occurs.
	 * @param e
	 * @private
	 */
	prototype.handleImagePreloaded_ = function(e) {
		var data = this.getSmoothZoomData_();
		goog.async.run(function(){
			this.scaleImageToViewPort_(data);
			this.setZoomMin_(this.getZoom());
		},this);
	};

	/**
	 * Initialized event handler. Updates pan buttons state and fire load or reset event.
	 * @param e
	 * @private
	 */
	prototype.handleInitialized_ = function(e){
		this.updatePanButtonsState_();
		var caller = this.getLastCaller_();
		if(caller){
			this.dispatchEvent(new DD.ui.Zoom.events.ChangeEvent(this, caller));
		}
	};

	/**
	 * Turn off or turn on hover auto state depending on pointer type. Works with IE pointer events
	 * which have internal browser property 'pointerType'.
	 * @param e
	 * @private
	 */
	prototype.applyPointerBehavior_ = function(e){
		var browserEvent = e.getBrowserEvent();
		if(browserEvent.pointerType){
			var isMouse = browserEvent.pointerType == "mouse";
			this.setAutoStates(goog.ui.Component.State.HOVER, isMouse);
		}
	};

	/**
	 * @override
	 */
	prototype.handleMouseDown = function(e){
		this.applyPointerBehavior_(e);
		DD.ui.Zoom.Control.superClass_.handleMouseDown.call(this, e);
	};

	/**
	 * @override
	 */
	prototype.handleMouseUp = function(e){
		this.applyPointerBehavior_(e);
		DD.ui.Zoom.Control.superClass_.handleMouseUp.call(this, e);
	};

	/**
	 * @override
	 */
	prototype.disposeInternal = function(){
		delete this.viewPort_;
		delete this.elementJQ_;
		delete this.stateManager_;
		this.positionX_ = null;
		this.positionY_ = null;
		this.zoom_ = null;
		this.centerX_ = null;
		this.centerY_ = null;
		this.panButtons_ = null;
		DD.ui.Zoom.Control.prototype.superClass_.disposeInternal.call(this);
	};

}); //goog.scope

/**
 * State handler. Helps to organize internal events in the right order.
 * @constructor
 */
DD.ui.Zoom.Control.StateManager = function(){
	goog.base(this);
	/**
	 * State of control. It takes integer value for comparing order of events.
	 * It takes one of the DD.ui.SmoothZoom.StateManager.States.CREATED values.
	 * @type {number}
	 * @private
	 */
	this.state_ = DD.ui.Zoom.Control.StateManager.States.CREATED;
};
goog.inherits(DD.ui.Zoom.Control.StateManager, goog.events.EventTarget);

/**
 * Available states of control.
 * @type {{CREATED: number, IMAGE_PRELOADED: number, SCALING_STARTED: number, INITIALIZED: number}}
 */
DD.ui.Zoom.Control.StateManager.States = {
	CREATED : 0,
	IMAGE_PRELOADED : 1,
	SCALING_STARTED : 2,
	INITIALIZED : 3
};

goog.scope(function(){
	var prototype = DD.ui.Zoom.Control.StateManager.prototype;

	prototype.getState = function(){
		return this.state_;
	};

	prototype.setState_ = function(value){
		this.state_ = value;
	};

	/**
	 * Change state and raise event.
	 * @private
	 */
	prototype.changeState_ = function(){
		this.setState_(this.getState() + 1);
		this.dispatchEvent(this.getState());
	};

	/**
	 * Checks whether possible to set state. State could be changed only to the nearest.
	 * @param state
	 */
	prototype.tryChange = function(state){
		if((state - this.getState()) == 1){
			this.changeState_();
		}
	};

	/**
	 * Reset state. It needs to reinitialize control.
	 */
	prototype.reset = function(){
		this.setState_(DD.ui.Zoom.Control.StateManager.States.CREATED);
	};

	/**
	 * Section of current states. It checks whether event was happen or not.
	 */
	prototype.isCreated = function(){
		return this.getState() >=DD.ui.Zoom.Control.StateManager.States.CREATED;
	};

	prototype.isImagePreloaded = function(){
		return this.getState() >= DD.ui.Zoom.Control.StateManager.States.IMAGE_PRELOADED;
	};

	prototype.isScalingStarted = function(){
		return this.getState() >= DD.ui.Zoom.Control.StateManager.States.SCALING_STARTED;
	};

	prototype.isInitialized = function(){
		return this.getState() == DD.ui.Zoom.Control.StateManager.States.INITIALIZED;
	};
}); // goog.scope