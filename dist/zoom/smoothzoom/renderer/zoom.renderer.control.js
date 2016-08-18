goog.provide('DD.ui.Zoom.renderer.Control');

goog.require('goog.ui.ControlRenderer');
goog.require('goog.labs.userAgent.device');
goog.require('DD.ui.Zoom.PanButton');

/**
 * Renderer for ImageEdit control.
 * @constructor
 */
DD.ui.Zoom.renderer.Control = function(){
	goog.ui.ControlRenderer.call(this);
};
goog.inherits(DD.ui.Zoom.renderer.Control, goog.ui.ControlRenderer);
goog.addSingletonGetter(DD.ui.Zoom.renderer.Control);

/**
 * Sets CSS class for ImageEdit controls.
 * @type {string}
 * @override
 */
DD.ui.Zoom.renderer.Control.CSS_CLASS = goog.getCssName('DD-imageedit');

/**
 * Css classes for pan buttons. Used as keys for associative array of pan buttons.
 * @type {{UP: string, RIGHT: string, DOWN: string, LEFT: string}}
 */
DD.ui.Zoom.renderer.Control.ButtonClasses = {
	UP : "DD-btn-up icon-arrow-up",
	RIGHT : "DD-btn-right icon-arrow-right",
	DOWN : "DD-btn-down icon-arrow-down",
	LEFT : "DD-btn-left icon-arrow-left"
};

goog.scope(function() {
	var prototype = DD.ui.Zoom.renderer.Control.prototype;

	/**
	 * @override
	 */
	prototype.getCssClass = function(){
		return DD.ui.Zoom.renderer.Control.CSS_CLASS;
	};

	/**
	 * @override
	 */
	prototype.createDom = function(control){
		var element =DD.ui.Zoom.renderer.Control.superClass_.createDom.call(this, control);
		var jqElement = control.getDomHelper().getWrappedElement(element);
		jqElement = this.createSmoothZoom_(control, jqElement, false);
		control.setElementJQInternal(jqElement);
		return jqElement[0];
	};

	/**
	 * @override
	 */
	prototype.decorate = function(control, element){
		if(!control.getElementJQInternal()){
			var elementJQ = control.getDomHelper().getWrappedElement(element);
			control.setElementJQInternal(elementJQ);
		}
		var item = this.createSmoothZoom_(control, control.getElementJQInternal(), true);
		item = DD.ui.Zoom.renderer.Control.superClass_.decorate.call(this, control, item);
		control.setContent(item[0].children);
		return item[0];
	};

	prototype.updateSmoothZoom = function(control, elementJQ){
		this.createSmoothZoom_(control, elementJQ, true);
	};

	/**
	 * Creating or recreating DOM of ImageEdit control.
	 * @param control
	 * @param elementJQ
	 * @param isExists
	 * @returns {*}
	 * @private
	 */
	prototype.createSmoothZoom_ = function(control, elementJQ, isExists){
		var viewPort = control.getViewPort(),
		    width = viewPort.getWidth(),
		    height = viewPort.getHeight();

		var updatedHandler = function(data, completed){
			control.zoomPanUpdatedInternal(data, completed);
		};

		var completedHandler = function(data){
			control.zoomPanCompletedInternal(data);
			control.dispatchEvent(DD.ui.Zoom.events.CHANGE_CONTEXT.ZOOM_PAN_COMPLETE);
		};

		var onImageLoad = function(data) {
			control.dispatchEvent(DD.ui.Zoom.events.CHANGE_CONTEXT.CC_LOAD);
		};

		var item = isExists ? elementJQ.smoothZoom('destroy')
			.css('background-image', 'url(zoom_assets/preloader.gif)') : elementJQ;
		var initialPosition = control.getPositionX().toString() + ',' + control.getPositionY().toString();

		var imgSrc = control.getImageSrc();
		if (imgSrc !== ' ')
			item.smoothZoom({
				width                : width,
				height               : height,
				initial_POSITION     : initialPosition,
				image_url            : control.getImageSrc(),
				zoom                 : control.getZoom(),
				zoom_MIN             : 0,
				zoom_MAX             : 800,
				on_ZOOM_PAN_UPDATE   : updatedHandler,
				on_ZOOM_PAN_COMPLETE : completedHandler,
				on_IMAGE_LOAD        : onImageLoad,
				zoom_BUTTONS_SHOW    : false,
				pan_BUTTONS_SHOW     : false,
				button_AUTO_HIDE     : true,
				mouse_DOUBLE_CLICK   : false,
				pan_REVERSE          : true,
				border_SIZE          : 0
				// animation_SMOOTHNESS : 1
				// zoom_OUT_TO_FIT      : false,
				// responsive: true,
				// responsive_maintain_ratio: true
			});

		var buttonClasses = this.getButtonClasses();
		if(control.isDesktop()){
			var buttons = this.createButtons_(control, item[0], [
				buttonClasses.UP,
				buttonClasses.RIGHT,
				buttonClasses.DOWN,
				buttonClasses.LEFT
			]);

			control.setPanButtonsInternal(buttons);
		}

		return elementJQ;
	};

	/**
	 * Create pan buttons.
	 * @param control
	 * @param element
	 * @param cssClasses
	 * @returns {Array}
	 * @private
	 */
	prototype.createButtons_ = function(control, element, cssClasses){
		var buttons = [];
		goog.array.forEach(cssClasses, function(item){
			var button = new DD.ui.Zoom.PanButton(null);
			button.addClassName(item);
			button.render(element);
			button.setEnabled(false);
			buttons[item] = button;
		});
		return buttons;
	};

	/**
	 * We don't need additional operations here. Just set content_ property in control class (ImageEdit).
	 * @param element
	 * @param content
	 */
	prototype.setContent = function(element, content){
	};

	/**
	 * Return key values for pan buttons.
	 * @returns {{UP: string, RIGHT: string, DOWN: string, LEFT: string}|*}
	 */
	prototype.getButtonClasses = function(){
		return DD.ui.Zoom.renderer.Control.ButtonClasses;
	};

}); //goog.scope
