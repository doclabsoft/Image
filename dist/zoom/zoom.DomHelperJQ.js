goog.provide('DD.ui.Zoom.DomHelperJQ');

goog.require('goog.dom.DomHelper');

/**
 * Dom Helper which add jQuery support.
 * @param opt_document
 * @constructor
 */
DD.ui.Zoom.DomHelperJQ = function(opt_document){
	goog.base(this, opt_document);
};
goog.inherits(DD.ui.Zoom.DomHelperJQ, goog.dom.DomHelper);

/**
 * Function to wrap element by jquery.
 * @param element
 * @returns {*|jQuery|HTMLElement}
 */
DD.ui.Zoom.DomHelperJQ.prototype.getWrappedElement = function(element){
	return $(element);
};

/**
 * By default all new elements wrapped by jquery.
 * @param tagName
 * @param opt_attributes
 * @param var_args
 * @returns {*|jQuery|HTMLElement}
 */
DD.ui.Zoom.DomHelperJQ.prototype.createDom = function(tagName, opt_attributes, var_args){
	var element = DD.ui.Zoom.DomHelperJQ.superClass_.createDom.call(this, tagName, opt_attributes, var_args);
	return this.getWrappedElement(element);
};