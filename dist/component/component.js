/**
 * @overview Base ui component. Similar to goog.ui.Component, except it always uses renderers.
 * @project UI
 * @author Anna Agte
 * @version 2.0
 */

goog.provide('DD.ui.Component');

goog.require('goog.ui.Component');
goog.require('DD.ui.EventType');
goog.require('DD.ui.renderer.Component');
goog.require('goog.ui.registry');

/**
 * @typedef {Object} COMPONENT_OPTIONS
 * @property {string=} id Component's unique id.
 * @property {string=} nodeId Dom element's id.
 * @property {string=} cssPrefix Element's renderer css class,
 *    used as prefix for inner dom nodes.
 * @property {string=} cssClass Element's additional root css class
 *    or classes splitted by spaces.
 * @property {boolean=} disabled State disabled.
 * @property {boolean=} readonly State readonly.
 * @property {boolean=} checked State checked.
 *    Used mostly by checkboxes and radiobuttons.
 * @property {boolean=} selected State selected.
 * @property {boolean=} opened State opened.
 *    Used mostly by dropdown components.
 * @property {boolean=} active State active.
 * @property {boolean=} focused State focused.
 * @property {boolean=} indeterminate State indeterminate.
 * @property {boolean=} [visible=true] Visibility.
 * @property {boolean=} [autoResize=false] Autoresize on window resize.
 * @property {DD.ui.renderer.Component=} renderer Renderer instance.
 * @property {goog.dom.DomHelper=} domHelper Google closure dom helper.
 */


// ------------------------------
// Constructor
// ------------------------------

/**
 * Базовый класс UI-компонентов библиотеки DD.
 * Для краткости принимает на вход конструктора значения для большинства своих свойств.
 * @param {COMPONENT_OPTIONS} options
 * @constructor
 * @extends goog.ui.Component 
 */
DD.ui.Component = function(options) {

  goog.isObject(options) || (options = null);

  var domHelper = null;
  if (options && goog.isObject(options.domHelper) &&
      options.domHelper instanceof goog.dom.DomHelper) {
    domHelper = options.domHelper;
  }

  goog.ui.Component.call(this, domHelper);
  this.domListeners_ = [];
  this.renderer_ = goog.ui.registry.getDefaultRenderer(this.constructor);

  if (options) {
    this.beginUpdate();
    this.assign(options);
    this.endUpdate(false);
  }
};
goog.inherits(DD.ui.Component, goog.ui.Component);
goog.ui.registry.setDefaultRenderer(DD.ui.Component, DD.ui.renderer.Component);


// ------------------------------
// Constants
// ------------------------------

/**
 * Для обратной совместимости.
 * @ignore
 */
DD.ui.Component.EventType = DD.ui.EventType;

/**
 * Возможные состояния компонента.
 * @enum {number}
  */
DD.ui.Component.State = {

  /**
   * Summa of all states.
   */
  ALL: 0xFFF,

  FOCUSED:       0x001,
  ACTIVE:        0x002,
  CHECKED:       0x004,
  SELECTED:      0x008,
  READONLY:      0x010,
  DISABLED:      0x020,
  INDETERMINATE: 0x040,
  OPENED:        0x080
};

/**
 * Возможные ошибки внутри компонента.
 * @enum {string}
 */
DD.ui.Component.Error = {
  NOT_A_RENDERER: 'Not a renderer instance'
};

/**
 * Проверяет, является ли объект "renderer" классом-рендерером из бибилиотеки DD.
 * @return {boolean}
 * @public
 */
DD.ui.Component.isRendererClass = function(renderer) {
  if (!goog.isFunction(renderer))
    return false;
  return DD.ui.renderer.Component === renderer
      || DD.ui.renderer.Component.prototype.isPrototypeOf(renderer.prototype);
};


// ------------------------------
// Prototype
// ------------------------------

goog.scope(function() {

/** @alias DD.ui.Component.prototype */
var prototype = DD.ui.Component.prototype;
var superClass_ = DD.ui.Component.superClass_;
var EventType = DD.ui.EventType;


// ------------------------------
// Properties
// ------------------------------

/**
 * Bit mask of current states.
 * @type {number}
 * @private
 */
prototype.state_ = 0;

/**
 * Bit mask of supported states.
 * @type {number}
 * @default DD.ui.Component.State.ALL
 * @private
 */
prototype.supportedStates_ = DD.ui.Component.State.ALL;

/**
 * Singleton helper for rendering DOM.
 * @type {DD.ui.renderer.Component}
 * @private
 */
prototype.renderer_ = null;

/**
 * Renderers are stateless, but sometimes they need to cache
 * calculated objects (nodes, strings, etc) to optimize.
 * @type {?Object}
 * @private
 */
prototype.rendererCache_ = null;

/**
 * Css class for all elements in a component's markup.
 * @type {string}
 * @private
 */
prototype.cssPrefix_ = '';

/**
 * Custom class which will be added to the main element.
 * @type {string}
 * @private
 */
prototype.customCssClass_ = '';

/**
 * Element id.
 * @type {string}
 * @private
 */
prototype.nodeId_ = '';

/**
 * Element tag name.
 * @type {string}
 * @private
 */
prototype.tagName_ = '';

/**
 * Component visibility.
 * @type {boolean}
 * @default true
 * @private
 */
prototype.visible_ = true;

/**
 * Cover mode.
 * @type {boolean}
 * @default false
 * @private
 * @todo Провести ревизию и пересмотреть: нужен ли вообще такой режим?
 */
prototype.covered_ = false;

/**
 * Автоматический ресайз при изменении размеров окна.
 * @type {boolean}
 * @default false
 * @private
 */
prototype.autoResize_ = false;

/**
 * Some user data. Model.
 * @type {string}
 * @private
 */
prototype.value_ = null;

/**
 * Locks count.
 * @type {number}
 * @private
 */
prototype.updateCount_ = 0;

/**
 * Listeners for delegated events from DOM node to DD component.
 * @type {Array.<Object>}
 * @private
 */
prototype.domListeners_ = null;


// ------------------------------
// Methods
// ------------------------------

/**
 * @inheritdoc
 */
prototype.createDom = function() {
  this.setElementInternal(this.renderer_.createDom(this));
};

/**
 * @inheritdoc
 */
prototype.canDecorate = function(element) {
  return this.renderer_.canDecorate(element);
};

/**
 * @inheritdoc
 */
prototype.decorateInternal = function(element) {
  this.setElementInternal(this.renderer_.decorate(this, element));
};

/**
 * @inheritdoc
 */
prototype.enterDocument = function() {
  superClass_.enterDocument.call(this);
  this.renderer_.initializeDom(this);
  if (this.autoResize_)
    this.getHandler().listenWithScope(window, 'resize', this.resize, false, this);
};

/**
 * @inheritdoc
 */
prototype.exitDocument = function() {
  this.renderer_.uninitializeDom(this);
  superClass_.exitDocument.call(this);
};

/**
 * @inheritdoc
 */
prototype.disposeInternal = function() {
  this.clearRendererCache();
  superClass_.disposeInternal.call(this);
};

/**
 * Вставляет элемент в родительский компонент, если он есть, или в BODY.
 * Бронебойный метод для рендеринга компонента.
 * Если компонент не отрендерен, то вызывает render.
 * Если компонент уже в документе,
 * то метод сперва изымает его, а затем вставляет в указанное место.
 * @see DD.ui.Component#attachTo
 * @public
 */
prototype.attach = function() {
  var el = document.body;
  var parent = this.getParent();
  if (parent) {
    el = parent.getContentElement();
    if (!el)
      return;
  }
  this.attachTo(el);
};

/**
 * Вставляет компонент в указанный контейнер.
 * Можно также указать позицию в контейнере.
 * Бронебойный метод для рендеринга компонента.
 * Если компонент не отрендерен, то вызывает render.
 * Если компонент уже в документе,
 * то метод сперва изымает его, а затем вставляет в указанное место.
 */
prototype.attachTo = function(container, opt_index) {

  var dom = this.getDomHelper();
  if (!dom.isElement(container))
    return;

  var element = this.getElement();
  var inDocument = this.isInDocument();

  if (element && inDocument && element.parentNode === container) {
    if (goog.isNumber(opt_index)) {
      if (element.parentNode.children[opt_index] === element)
        return;
    } else {
      return;
    }
  }

  if (inDocument)
    this.detach();

  if (element) {
    if (goog.isNumber(opt_index))
      dom.insertChildAt(container, element, opt_index);
    else
      container.appendChild(this.getElement());
    this.enterDocument();

  } else {
    if (goog.isNumber(opt_index)) {
      var next = container.children[opt_index];
      if (next)
        this.renderBefore(next);
      else
        this.render(container);
    } else {
      this.render(container);
    }
  }
};

/**
 * Вставляет компонент перед указанным элементом.
 * Бронебойный метод для рендеринга компонента.
 * Если компонент не отрендерен, то вызывает render.
 * Если компонент уже в документе,
 * то метод сперва изымает его, а затем вставляет в указанное место.
 */
prototype.attachBefore = function(next) {

  var dom = this.getDomHelper();
  if (!dom.isElement(next))
    return;

  var container = next.parentNode;
  if (!dom.isElement(container))
    return;

  var element = this.getElement();
  var inDocument = this.isInDocument();

  if (element && inDocument && element.parentNode === container) {
    if (element.nextElementSibling === next)
      return;
  }

  if (inDocument)
    this.detach();

  if (element) {
    goog.dom.insertSiblingBefore(element, container);
    this.enterDocument();
  } else {
    this.renderBefore(next);
  }
};

/**
 * Извлекает компонент из документа.
 */
prototype.detach = function() {
  if (this.isInDocument())
    this.exitDocument();
  if (this.getElement())
    goog.dom.removeNode(this.getElement());
};

/**
 * Удаляет текущий компонент из иерархии компонентов.
 * @public
 */
prototype.remove = function() {
  var parent = this.getParent();
  if (parent)
    parent.removeChild(this);
};

  /**
   * Совмещение параметров по-умолчанию c параметрами, указанными в момент инициализации компонента
   * @param  {Object} params   Список параметров, указанных в момент инициализации компонента
   * @param  {Object} defaults Список парамметров по-умолчанию
   * @return {Object}
   */
prototype.assignParams = function(params, defaults) {
  for (var prop in defaults)
  {
    if (prop in params && typeof params[prop] === 'object')
    {
      for (var subProp in defaults[prop])
        if (!(subProp in params[prop]))
          params[prop][subProp] = defaults[prop][subProp];
    }
    else if (!(prop in params))
      params[prop] = defaults[prop];
  };

  return params;
};

/**
 * Sets many properties at once.
 * @param {Object} options Hash of properties like in constructor.
 * @protected
 */
prototype.assign = function(options) {

  if (!goog.isObject(options))
    return;

  if ('id' in options)
    this.setId(options.id);

  if ('nodeId' in options)
    this.setNodeId(options.nodeId);

  if ('tagName' in options)
    this.setTagName(options.tagName);

  if ('cssPrefix' in options)
    this.setCssPrefix(options.cssPrefix);

  if ('cssClass' in options)
    this.setCssClass(options.cssClass);

  if ('disabled' in options)
    this.setDisabled(options.disabled);

  if ('readonly' in options)
    this.setReadonly(options.readonly);

  if ('checked' in options)
    this.setChecked(options.checked);

  if ('selected' in options)
    this.setSelected(options.selected);

  if ('opened' in options)
    this.setOpened(options.opened);

  if ('indeterminate' in options)
    this.setIndeterminate(options.indeterminate);

  if ('visible' in options)
    this.visible_ = options.visible;

  if ('autoResize' in options)
    this.setAutoResize(options.autoResize);

  if ('renderer' in options)
    this.setRenderer(options.renderer);
};

/**
 * @param {string} value
 * @public
 */
prototype.setCssPrefix = function(value) {
  if (!goog.isString(value))
    return;
  this.cssPrefix_ = value.split(' ')[0];
};

/**
 * @return {string}
 * @public
 */
prototype.getCssPrefix = function(value) {
  return this.cssPrefix_;
};

/**
 * @return {string}
 * @public
 */
prototype.getBEMClass = function(elClass, modClass) {
  return this.getRenderer().getBEMClass(this, elClass, modClass);
};

/**
 * @param {string} value
 * @public
 */
prototype.setCssClass = function(value) {
  if (!goog.isString(value))
    return;
  this.customCssClass_ = value;
};

/**
 * Устаревшее
 * @alias DD.ui.Component#setCssClass
 * @deprecated
 */
prototype.setCustomCssClass = prototype.setCssClass;

/**
 * @return {string}
 * @public
 */
prototype.getCssClass = function() {
  return this.customCssClass_;
};

/**
 * Устаревшее
 * @alias DD.ui.Component#getCssClass
 * @deprecated
 */
prototype.getCustomCssClass = prototype.getCssClass;

/**
 * @param {string} id
 * @public
 */
prototype.setNodeId = function(id) {
  if (!goog.isString(id))
    return;
  this.setNodeIdInternal(id);
  this.renderer_.setNodeId(this, id);
};

/**
 * @param {string} id
 * @public
 */
prototype.setNodeIdInternal = function(id) {
  this.nodeId_ = id;
};

/**
 * @return {string}
 * @public
 */
prototype.getNodeId = function() {
  return this.nodeId_;
};

/**
 * @param {string} tagName
 * @public
 */
prototype.setTagName = function(tagName) {
  if (!goog.isString(tagName))
    return;
  this.tagName_ = tagName;
};

/**
 * @return {string}
 * @public
 */
prototype.getTagName = function() {
  return this.tagName_;
};

/**
 * Defines the element in the component's DOM,
 * which may contain the childrens. By default it's the component's element.
 * @inheritdoc
 * @param  {HTMLElement} element Element inside component's dom sctructure
 *    or the component's root element.
 * @protected
 */
prototype.setContentElement = function(element) {
  this.contentElement_ = element;
};

/**
 * Gets the container element for children.
 * @inheritdoc
 * @see {prototype.setContentElement}
 * @param {HTMLElement}
 * @public
 */
prototype.getContentElement = function() {
  return this.contentElement_ || this.getElement();
};

/**
 * Sets content.
 * @param {HTMLElement|string} content
 * @public
 */
prototype.setContentInternal = function(content) {
  if (!this.contentElement_)
    return;
  if (typeof content === 'string')
    this.contentElement_.innerHTML = content;
  else
    this.contentElement_.appendChild(content);
};

/**
 * Sets the renderer.
 * @param {DD.ui.renderer.Component} renderer Renderer instance.
 * @public
 */
prototype.setRenderer = function(renderer) {

  if (!goog.isObject(renderer) || !(renderer instanceof DD.ui.renderer.Component))
    throw Error(DD.ui.Component.Error.NOT_A_RENDERER);

  // Don't change the renderer if the component is in document.
  if (this.isInDocument())
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);

  // If the component is not in document, but the element is rendered,
  // remove the old element.
  if (this.getElement())
    this.setElementInternal(null);

  this.clearRendererCache();
  this.renderer_ = renderer;
};

/**
 * Gets the renderer instance.
 * @return {?DD.ui.renderer.Component}
 * @public
 */
prototype.getRenderer = function() {
  return this.renderer_;
};

/**
 * @param {DD.ui.renderer.Component} renderer
 * @public
 */
prototype.changeRenderer = function(renderer) {

  if (renderer === this.renderer_)
    return;

  var wasIn = this.isInDocument();
  var element = this.getElement();
  var hadDom = !!this.getElement();

  if (wasIn)
    this.exitDocument();

  this.setRenderer(renderer);

  if (hadDom)
    this.createDom();

  if (wasIn) {
    goog.dom.replaceNode(this.getElement(), element);
    this.enterDocument();
  }

  this.changed();
};

/**
 * @public
 */
prototype.updateDom = function() {

  var wasIn = this.isInDocument();
  var element = this.getElement();
  var hadDom = !!element;

  if (wasIn)
    this.exitDocument();

  if (hadDom) {
    this.clearRendererCache();
    this.createDom();
  }

  if (wasIn) {
    goog.dom.replaceNode(this.getElement(), element);
    this.enterDocument();
  }

  this.changed();
};

/**
 * Saves some value to cache.
 * @param {string} key
 * @param {*} value
 * @public
 */
prototype.setRendererCache = function(key, value) {
  this.rendererCache_ || (this.rendererCache_ = {});
  this.rendererCache_[key] = value;
};

/**
 * Gets values from cache. If there's no key specified it returns all cache.
 * @param  {string=} opt_key Имя свойства
 * @return {*|undefined|Object}
 * @public
 */
prototype.getRendererCache = function(opt_key) {
  if (!this.rendererCache_)
    return null;
  if (opt_key)
    return this.rendererCache_[opt_key];
  return this.rendererCache_;
};

/**
 * Clears the renderer cache.
 * In case we switch renderers or the component disposes.
 * @protected
 */
prototype.clearRendererCache = function() {

  // Check for disposable objects.
  var key, obj;
  for (key in this.rendererCache_) {
    obj = this.rendererCache_[key];
    if (goog.isObject(obj) && obj instanceof goog.Disposable)
      obj.dispose();
  }

  this.rendererCache_ = null;
};

/**
 * Like goog.events.listen. Will be applyed to the component's root element.
 * @public
 */
prototype.listenDOM = function(type, listener, opt_capture, opt_scope) {
  var i, data = null;
  for (i=0; i<this.domListeners_.length; i++) {
    data = this.domListeners_[i];
    if (data.type === type && data.listener === listener && data.capture === opt_capture)
      return false;
  }
  this.domListeners_.push({
    type: type,
    listener: listener,
    capture: opt_capture,
    scope: opt_scope
  });
  this.getRenderer().updateDomListeners(this);
};

/**
 * Like goog.events.unlisten. Will be applyed to the component's root element.
 * @public
 */
prototype.unlistenDOM = function(type, listener, opt_capture, opt_scope) {
  var data = null;
  for (var i=0; i<this.domListeners_.length; i++) {
    data = this.domListeners_[i];
    if (data.type === type && data.listener === listener && data.capture === opt_capture) {
      this.domListeners_.splice(i, 1);
      break;
    }
  }
  this.getRenderer().updateDomListeners(this);
};

/**
 * @protected
 */
prototype.getDomListeners = function() {
  return this.domListeners_;
};

/**
 * Change component state.
 * It is used by controls (buttons, checkboxes, etc.) and some other components.
 * @param {DD.ui.Component.State} state Component state.
 * @param {boolean} enabled If TRUE the state is enabled.
 * @public
 */
prototype.setState = function(state, enable) {

  // If it is already set to the desired value, then do nothing.
  if (!this.isSupportedState(state))
    return false;

  enable = !!enable;

  if (enable === this.hasState(state))
    return false;

  this.state_ = enable
    ? this.state_ | state // plus state
    : this.state_ & ~state; // minus state
  // State changing can affect the components markup.
  this.renderer_.setState(this, state, enable);
  return true;
};

/**
 * Sets the component's state to the state represented by a bit mask of
 * {@link DD.ui.Component.State}s. Unlike {@link #setState}, doesn't
 * update the component's styling, and doesn't reject unsupported states.
 * Called by renderers during element decoration. Considered protected;
 * should only be used within this package and by subclasses.
 * This should only be used by subclasses and its associated renderers.
 *
 * @param {number} state Bit mask representing component state.
 * @public
 */
prototype.setStatesInternal = function(states) {
  this.state_ = states;
};

/**
 * Returns the component current states.
 * @return {number} Bit mask.
 * @protected
 */
prototype.getState = function() {
  return this.state_;
};

/**
 * Checks one of the component states.
 * @param  {DD.ui.Component.State} state Checked state.
 * @return {boolean}
 * @public
 */
prototype.hasState = function(state) {
  return !!(this.state_ & state);
};

/**
 * Enables or disables support for the given state.
 * @param {goog.ui.Component.State} state State to support or de-support.
 * @param {boolean} support Whether the component should support the state.
 * @public
 */
prototype.setSupportedState = function(state, support) {

  if (!support && this.hasState(state))
    this.setState(state, false);

  this.supportedStates_ = support
    ? this.supportedStates_ | state
    : this.supportedStates_ & ~state;
};

/**
 * Returns TRUE if the component supports the specified state, FALSE otherwise.
 * @param {DD.ui.Component.State} state State to check.
 * @return {boolean} Whether the component supports the given state.
 * @public
 */
prototype.isSupportedState = function(state) {
  return !!(this.supportedStates_ & state);
};

/**
 * Sets state FOCUSED.
 * @param {boolean} focused
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setFocused = function(focused) {
  if (!goog.isBoolean(focused))
    return false;
  return this.setState(DD.ui.Component.State.FOCUSED, focused);
};

/**
 * Checks if the component is focused.
 * @return {Boolean}
 * @public
 */
prototype.isFocused = function() {
  return this.hasState(DD.ui.Component.State.FOCUSED);
};

/**
 * Sets state ACTIVE.
 * @param {boolean} active
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setActive = function(active) {
  if (!goog.isBoolean(active))
    return false;
  return this.setState(DD.ui.Component.State.ACTIVE, active);
};

/**
 * Checks if the component is active.
 * @return {boolean}
 * @public
 */
prototype.isActive = function() {
  return this.hasState(DD.ui.Component.State.ACTIVE);
};

/**
 * Sets state CHECKED.
 * @param {boolean} checked
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setChecked = function(checked) {
  if (!goog.isBoolean(checked))
    return false;
  var success = this.setState(DD.ui.Component.State.CHECKED, checked);
  if (success)
    this.dispatchEvent(DD.ui.EventType.CHECK);
  return success;
};

/**
 * Checks if the component is checked.
 * @return {boolean}
 * @public
 */
prototype.isChecked = function() {
  return this.hasState(DD.ui.Component.State.CHECKED);
};

/**
 * Sets state SELECTED.
 * @param {boolean} selected
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setSelected = function(selected) {
  if (!goog.isBoolean(selected))
    return false;
  var success = this.setState(DD.ui.Component.State.SELECTED, selected);
  if (success)
    this.dispatchEvent(DD.ui.EventType.SELECT);
  return success;
};

/**
 * Checks if the component is selected.
 * @return {boolean}
 * @public
 */
prototype.isSelected = function() {
  return this.hasState(DD.ui.Component.State.SELECTED);
};

/**
 * Sets state READONLY.
 * @param {boolean} readonly
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setReadonly = function(readonly) {
  if (!goog.isBoolean(readonly))
    return false;
  return this.setState(DD.ui.Component.State.READONLY, readonly);
};

/**
 * Checks if the component is readonly.
 * @return {boolean}
 * @public
 */
prototype.isReadonly = function() {
  return this.hasState(DD.ui.Component.State.READONLY);
};

/**
 * Sets state DISABLED.
 * @param {boolean} disabled
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setDisabled = function(disabled) {
  if (!goog.isBoolean(disabled))
    return false;
  return this.setState(DD.ui.Component.State.DISABLED, disabled);
};

/**
 * Checks if the component is disabled.
 * @return {boolean}
 * @public
 */
prototype.isDisabled = function() {
  return this.hasState(DD.ui.Component.State.DISABLED);
};

/**
 * Sets state INDETERMINATE.
 * @param {boolean} indeterminate
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setIndeterminate = function(indeterminate) {
  if (!goog.isBoolean(indeterminate))
    return false;
  return this.setState(DD.ui.Component.State.INDETERMINATE, indeterminate);
};

/**
 * Checks if the component is indeterminate.
 * @return {boolean}
 * @public
 */
prototype.isIndeterminate = function() {
  return this.hasState(DD.ui.Component.State.INDETERMINATE);
};

/**
 * Sets state OPENED.
 * @param {boolean} opened
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setOpened = function(opened) {
  if (!goog.isBoolean(opened))
    return false;
  var success = this.setState(DD.ui.Component.State.OPENED, opened);
  if (success)
    this.dispatchEvent(opened ? DD.ui.EventType.OPEN : DD.ui.EventType.CLOSE);
  return success;
};

/**
 * Checks if the component is indeterminate.
 * @return {boolean}
 * @public
 */
prototype.isOpened = function() {
  return this.hasState(DD.ui.Component.State.OPENED);
};

/**
 * Changes the state COVERED value.
 * @param {boolean} enabled
 * @public
 */
prototype.setCovered = function(enabled) {
  if (!goog.isBoolean(enabled))
    return false;
  enabled = !!enabled;
  this.covered_ = enabled;
  this.renderer_.setCovered(this, enabled);
};

/**
 * Checks if the component is covered.
 * @return {boolean}
 * @public
 */
prototype.isCovered = function() {
  return this.covered_;
};

/**
 * Defines the viewport of the component. Viewport is relative to the document.
 * Original idea was that out of the viewport
 * the component's children become COVERED to optimize.
 * @param {Object.<number>} viewport
 *    Relative to the document coordinates of viewport.
 * @param {number} viewport.left
 * @param {number} viewport.right
 * @param {number} viewport.top
 * @param {number} viewport.bottom
 * @public
 * @todo А нужен ли такой функционал? Востребован ли он сейчас?
 */
prototype.coverOuterArea = function(viewport) {
  this.renderer_.coverOuterArea(this, viewport);
};

/**
 * Checks if the component is visible.
 * @return {boolean}
 * @public
 */
prototype.isVisible = function() {
  return this.visible_;
};

/**
 * Facade for show and hide methods.
 * @public
 */
prototype.setVisible = function(visible) {
  if (!goog.isBoolean(visible))
    return false;
  visible ? this.show() : this.hide();
};

/**
 * Заставляет компонент ресайзиться вместе с окном.
 * Применять аккуратно.
 * @param {boolean} enable
 * @public
 */
prototype.setAutoResize = function(enable) {
  this.autoResize_ = enable;
  if (this.isInDocument()) {
    if (enable)
      this.getHandler().listenWithScope(window, 'resize', this.resize, false, this);
    else
      this.getHandler().unlisten(window, 'resize', this.resize, false, this);
  }
};

/**
 * @return {boolean}
 * @public
 */
prototype.hasAutoResize = function() {
  return this.autoResize_;
};

/**
 * Sets the value.
 * @param {string} value
 * @public
 */
prototype.setValue = function(value) {

  if (value === this.value_)
    return;

  this.setValueInternal(value);

  var renderer = this.getRenderer();
  if (renderer.setValue)
    renderer.setValue(this, value);

  this.valueChanged();
  this.changed();
};

/**
 * Sets the value without triggering events and rerendering.
 * Must be used only by renderers.
 * @public
 */
prototype.setValueInternal = function(value) {
  this.value_ = value;
};

/**
 * Returns the value.
 * @return {string}
 * @public
 */
prototype.getValue = function() {
  return this.value_;
};

/**
 * Shows the component.
 * Triggers BEFORE_SHOW and SHOW.
 * @public
 */
prototype.show = function() {

  if (this.visible_)
    return;

  if (this.dispatchEvent(EventType.BEFORE_SHOW) === false)
    return;

  this.visible_ = true;
  this.renderer_.show(this);
  this.dispatchEvent(EventType.SHOW);
  this.changed();

  // Promise.resolve()

  // .then(function () {
  //   this.visible_ = true;
  //   return this.renderer_.show(this);
  // }.bind(this))

  // .then(function () {
  //   this.dispatchEvent(EventType.SHOW);
  //   this.changed();
  // }.bind(this));
};

/**
 * Hides the component.
 * Triggers BEFORE_HIDE and HIDE.
 * @public
 */
prototype.hide = function(opt_force) {

  if (!this.visible_)
    return;

  if (this.dispatchEvent(EventType.BEFORE_HIDE) === false)
    return;

  this.visible_ = false;
  this.renderer_.hide(this);
  this.dispatchEvent(EventType.HIDE);
  this.changed();

  // Promise.resolve()

  // .then(function () {
  //   this.visible_ = false;
  //   return this.renderer_.hide(this);
  // }.bind(this))

  // .then(function () {
  //   this.dispatchEvent(EventType.HIDE);
  //   this.changed();
  // }.bind(this));
};

/**
 * Для обратной совместимости с некоторыми старыми компонентами.
 * TODO Вычистить.
 * @ignore
 */
prototype.handleShow = goog.nullFunction;
prototype.handleHide = goog.nullFunction;

/**
 * Resizes the component and its children.
 * First - children, then - self!
 * @todo Почему так: "first - children, then - self"?
 * @public
 */
prototype.resize = function() {
  if (!this.isInDocument())
    return;
  if (this.renderer_.resize)
    this.renderer_.resize(this);
};

/**
 * Locks event dispatching and rerendering until endUpdate call.
 * @public
 */
prototype.beginUpdate = function() {
  this.updateCount_++;
};

/**
 * Unlocks event dispatching and rerendering. If opt_forceUpdate set to FALSE,
 * then no events dispatch on unlock. It may be very useful.
 * @param {boolean=} [opt_forceUpdate=TRUE]
 * @public
 */
prototype.endUpdate = function(opt_forceUpdate) {
  this.updateCount_--;
  if (this.updateCount_ === 0 && opt_forceUpdate !== false) {
    this.update();
  }
};

/**
 * Returns depths of locks.
 * @return {number}
 * @public
 */
prototype.getUpdateCount = function() {
  return this.updateCount_;
};

/**
 * Checks component for locks.
 * @return {boolean}
 * @public
 */
prototype.canUpdate = function() {
  return !this.updateCount_;
};

/**
 * Triggers CHANGE event if it is not locked by beginUpdate.
 * Left for backward compatibility with DD.ui.List 1.0.
 * Use method "changed" instead.
 * @todo Remove this.
 * @public
 * @deprecated
 */
prototype.update = function() {
  this.changed();
};

/**
 * Triggers CHANGE event if it is not locked by beginUpdate.
 * @public
 */
prototype.changed = function() {
  if (!this.isInDocument())
    return;
  if (!this.canUpdate())
    return;
  this.dispatchEvent(EventType.CHANGE);
};

/**
 * Triggers VALUE_CHANGED event.
 * @public
 */
prototype.valueChanged = function() {
  this.dispatchEvent(EventType.VALUE_CHANGED);
};

/**
 * Shortcut to set or get renderer cache.
 * @param {string} key Key in hash.
 * @param {*=} opt_value Value to be set by key.
 * @return {*=} Value by key.
 * @public
 */
prototype.$cache = function(key, opt_value) {
  if (arguments.length > 1)
    this.setRendererCache(key, opt_value);
  else
    return this.getRendererCache(key);
};

}); // goog.scope
