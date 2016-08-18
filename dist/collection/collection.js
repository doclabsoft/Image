/**
 * Collection and collection item base classes.
 * @project Collection
 * @author Anna Agte
 * @version 3.0.1
 */

goog.provide('DD.Collection');
goog.provide('DD.CollectionItem');
goog.provide('DD.Collection.EventType');
goog.provide('DD.Collection.Context');

goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('DD.utils.GUID');


// ------------------------------
// Constructor
// ------------------------------

/**
 * Base class of collection element.
 * @param {DD.Collection} collection Collection which this item belongs to.
 * @param {Object=} opt_properties Hash of the item properties
 * @constructor
 * @extends {goog.events.EventTarget}
 */
DD.CollectionItem = function(collection, opt_properties) {

  if (!(collection instanceof DD.Collection)) {
    throw new Error(DD.CollectionItem.Error.INVALID_OWNER);
  }

  goog.events.EventTarget.call(this);

  /**
   * Link to collection which this item belongs to.
   * @type {DD.Collection}
   * @private
   */
  this.collection_ = collection;

  /**
   * Unique ID of the item. This property is strictly private
   * and must not be accessed directly outside of this class!
   * @private {?string}
   */
  this.id_ = null;

  this.initialize(opt_properties);

  // We should not rely on initialize.
  if (!this.id_ && opt_properties && opt_properties.id)
    this.id_ = ''+opt_properties.id;

  // Finally we must insure that id is not empty.
  if (!this.id_)
    this.id_ = this.idGenerator_.get();
};
goog.inherits(DD.CollectionItem, goog.events.EventTarget);


// ------------------------------
// Constants
// ------------------------------

/**
 * Error messages.
 * @enum {string}
 */
DD.CollectionItem.Error = {
  INVALID_OWNER: 'CollectionItem can\'t exist without an owner.'
};


// ------------------------------
// Properties
// ------------------------------

/**
 * Generator for unique IDs.
 * @type {Object}
 * @private
 */
DD.CollectionItem.prototype.idGenerator_ = DD.utils.GUID;


// ------------------------------
// Methods
// ------------------------------

/**
 * Gets the unique ID for the instance of this component.
 * @return {string} Unique component ID.
 * @public
 */
DD.CollectionItem.prototype.getId = function() {
  return this.id_;
};

/**
 * Gets the item index in the collection.
 * @return {number} Item index.
 * @public
 */
DD.CollectionItem.prototype.getIndex = function() {
  return this.collection_.getIndexById(this.id_);
};

/**
 * Gets this item's owner.
 * @return {DD.Collection} Owner collection.
 * @public
 */
DD.CollectionItem.prototype.getOwner = function() {
  return this.collection_;
};

/**
 * Initializes the item. Override this method in descendants.
 * @param {Object=} opt_properties Hash of an item properties.
 * @protected
 */
DD.CollectionItem.prototype.initialize = function(opt_properties) {
};


// ------------------------------
// Constructor
// ------------------------------

/**
 * Base class of item collection.
 * @param {Function} Javascript class of the each collection items.
 * @param {goog.events.EventTarget=} opt_owner Collection owner.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
DD.Collection = function(itemClass, opt_owner) {

  if (!goog.isFunction(itemClass) || !(itemClass === DD.CollectionItem
    || DD.CollectionItem.prototype.isPrototypeOf(itemClass.prototype)))
  {
    throw new Error(DD.Collection.Error.INVALID_ITEM_CLASS);
  }

  goog.events.EventTarget.call(this);

  /**
   * Class for all new items in collection.
   * @type {DD.CollectionItem}
   * @private
   */
  this.itemClass_ = itemClass;

  /**
   * Array of items. Lazily initialized on first use.
   * Must be kept in sync with {@code itemIndex_}.
   * @private {?Array.<DD.CollectionItem>}
   */
  this.items_ = null;

  /**
   * Map of items IDs to items, like database indexes.
   * Used for constant-time random access to items by ID.
   * Lazily initialized on first use.
   * Must be kept in sync with {@code items_}.
   * @private {?Object}
   */
  this.itemIndex_ = null;

  /**
   * Count of lock calls.
   * @type {Number}
   * @private
   */
  this.updateCount_ = 0;

  /**
   * Collection's owner.
   * @type {?Object}
   * @private
   */
  this.owner_ = opt_owner || null;

  /**
   * Maximum number of items. Reserved.
   */
  this.capacity_ = 0;
}
goog.inherits(DD.Collection, goog.events.EventTarget);


// ------------------------------
// Constants
// ------------------------------

/**
 * Event names.
 * @enum {string}
 */
DD.Collection.EventType = {

  /**
   * Dispatches when collection is changed
   */
  CHANGE: 'onChange',

  /**
   * Dispatches before collection changes.
   */
  BEFORE_CHANGE: 'onBeforeChange',

  /**
   * Dispatched when collection exceeds. Reserved.
   */
  AT_CAPACITY: 'onAtCapacity'
};

/**
 * Operation types.
 * @enum {string}
 */
DD.Collection.Context = {
  UPDATE: 'update',
  ADD: 'add',
  REMOVE: 'remove',
  CLEAR: 'clear',
  MOVE: 'move',
  ITEM_CHANGED: 'item' // reserved.
};

/**
 * Error messages.
 * @enum {string}
 */
DD.Collection.Error = {
  INVALID_INDEX: 'Index out of bounds.',
  INVALID_ITEM_CLASS: 'Invalid item class.',
  INVALID_OWNER: 'Owner must be a goog.events.EventTarget instance.',
  DUPLICATE_ID: 'Collection already has an item with this id.'
};


// ------------------------------
// Methods
// ------------------------------

/**
 * Disposes all. No collection - no items!
 * @inheritdoc
 */
DD.Collection.prototype.disposeInternal = function() {
  this.clear();
};

/**
 * Returns collection size.
 * @return {number} Size of the collection
 * @public
 */
DD.Collection.prototype.getCount = function() {
  return this.items_ ? this.items_.length : 0;
};

/**
 * @param {Function} handler
 * @public
 */
DD.Collection.prototype.forEach = function(handler) {
  if (!this.items_)
    return;
  for (var i=0; i<this.items_.length; i++)
    handler(this.items_[i], i);
};

/**
 * Gets an item from the collection by its index.
 * Throws an error if the index is out of bounds.
 *
 * @param {number} index  0-based index at which the item must be;
 *    must be between 0 and the current item count (inclusive).
 * @throws {Error} If index is out of bounds.
 * @return {Collection.Item} Found item.
 * @public
 */
DD.Collection.prototype.get = function(index) {
  index = +index;
  if (index < 0 || index >= this.getCount()) {
    throw new Error(DD.Collection.Error.INVALID_INDEX);
  }
  return this.items_[index];
};

/**
 * Gets an item from the collection by its unique id.
 * @param {String} id Item id.
 * @return {?Collection.Item} Found item.
 * @public
 */
DD.Collection.prototype.getById = function(id) {
  return this.itemIndex_ ? this.itemIndex_[id] || null : null;
};

/**
 * Gets an index in the collection by item's unique id.
 * @param {string} id Item id.
 * @return {number} Found item index. If no item was found, return -1.
 * @public
 */
DD.Collection.prototype.getIndexById = function(id) {
  var item = this.getById(id);
  if (!item) {
    return -1;
  }
  return goog.array.indexOf(this.items_, item);
};

/**
 * Adds an item to the collection.
 * Always creates new item, does not add existing ones.
 * @param {Object=} opt_properties Item properties.
 * @return {?Collection.Item} Created item.
 * @public
 */
DD.Collection.prototype.add = function(opt_properties) {
  return this.insert(this.getCount(), opt_properties);
};

/**
 * Adds an item to the collection at the given 0-based index.
 * Throws an error if the index is out of bounds.
 *
 * @param {number} index  0-based index at which the new item is to be added;
 *    must be between 0 and the current item count (inclusive).
 * @param {Object=} opt_properties Item properties.
 * @return {?Collection.Item} Created item.
 *    Returns null, if operation was prevented.
 * @public
 */
DD.Collection.prototype.insert = function(index, opt_properties) {

  index = +index;
  if (index < 0 || index > this.getCount()) {
    throw new Error(DD.Collection.Error.INVALID_INDEX);
  }

  if (!this.canChange(DD.Collection.Context.ADD)) {
    return null;
  }

  var item = new this.itemClass_(this, opt_properties);

  var id = item.getId();
  if (this.itemIndex_ && this.itemIndex_[id])
    throw new Error(DD.Collection.Error.DUPLICATE_ID);

  if (!this.items_ || !this.itemIndex_) {
    this.items_ = [];
    this.itemIndex_ = {};
  }
  goog.array.insertAt(this.items_, item, index);
  this.itemIndex_[id] = item;

  this.update_(item, DD.Collection.Context.ADD);

  return item;
};

/**
 * Removes the item at the given index from the collection and returns it.
 * Throws an error if the index is out of bounds.
 *
 * @param {number} index  0-based index of the item to remove.
 * @throws {Error} If index is out of bounds.
 * @return {boolean} Was item removed or not.
 * @public
 */
DD.Collection.prototype.remove = function(index) {

  var item = this.get(index);

  if (!this.canChange(DD.Collection.Context.REMOVE)) {
    return false;
  }

  item.dispose();
  goog.array.removeAt(this.items_, index);
  this.itemIndex_[item.getId()] = null;

  this.update_(item, DD.Collection.Context.REMOVE);
  return true;
};

/**
 * Removes an item by its id.
 * @param {string} id Item's id.
 * @return {boolean}
 * @public
 */
DD.Collection.prototype.removeById = function(id) {
  var index = this.getIndexById(id);
  if (index === -1)
    return false;
  return this.remove(index);
};

/**
 * Removes every item from the collection.
 * @return {DD.Collection} self
 * @public
 */
DD.Collection.prototype.clear = function() {

  if (!this.isDisposed() && !this.canChange(DD.Collection.Context.CLEAR)) {
    return this;
  }

  if (this.items_) {
    goog.disposeAll(this.items_);
    this.items_ = null;
    this.itemIndex_ = null;
  }
  this.update_(null, DD.Collection.Context.CLEAR);
  return this;
};

/**
 * Moves an item of the collection from index "from" to position "to"
 *
 * @param {Number} from The source index
 * @param {Number} to The destination index
 * @throws {Error} If one of the indexes is out of bounds.
 * @return {DD.Collection} self
 * @public
 */
DD.Collection.prototype.move = function(from, to) {

  from = +from;
  if (from < 0 || from >= this.getCount()) {
    throw new Error(DD.Collection.Error.INVALID_INDEX);
  }

  to = +to;
  if (to < 0 || to >= this.getCount()) {
    throw new Error(DD.Collection.Error.INVALID_INDEX);
  }

  if (from != to) {

    if (!this.canChange(DD.Collection.Context.MOVE)) {
      return this;
    }

    var item = this.items_[from];
    goog.array.moveItem(this.items_, from, to);
    this.update_(item, DD.Collection.Context.MOVE);
  }

  return this;
};

/**
 * Increments the update-counter.
 * @return {number} Counter value.
 * @public
 */
DD.Collection.prototype.beginUpdate = function() {
  ++this.updateCount_;
  return this.updateCount_;
};


/**
 * Decrements the update-counter.
 * @param {DD.Collection.Context} context User defined context of changes.
 * @return {number} Counter value.
 * @public
 */
DD.Collection.prototype.endUpdate = function(context) {
  if (this.updateCount_ > 0) {
    --this.updateCount_;
    this.update_(null, context || DD.Collection.Context.UPDATE);
  }
  return this.updateCount_;
};

/**
 * Reaction on all changes.
 * @param {?DD.CollectionItem} Item which is subject of changes.
 * @param {DD.Collection.Context} context Operation type.
 * @private
 */
DD.Collection.prototype.update_ = function(item, context) {
  if (this.updateCount_ === 0) {
    this.dispatchEvent({
      type: DD.Collection.EventType.CHANGE,
      context: context,
      item: item
    });
  }
};

/**
 * Notify listeners before all changes.
 * Any listener may return false and prevent changes.
 * @param {DD.Collection.Context} context Operation type.
 * @return {boolean} Can we carry out the "context" change or not.
 * @protected
 */
DD.Collection.prototype.canChange = function(context) {
  var event = new goog.events.Event(DD.Collection.EventType.BEFORE_CHANGE);
  event.context = context;
  var success = this.dispatchEvent(event);
  return success !== false && event.defaultPrevented !== true;
};

/**
 * Gets amount of calls "beginUpdate".
 * @return {number}
 * @public
 */
DD.Collection.prototype.getUpdateCount = function() {
    return this.updateCount_;
};

/**
 * Gets collection's owner.
 * @return {?goog.events.EventTarget}
 * @public
 */
DD.Collection.prototype.getOwner = function() {
  return this.owner_;
};

/**
 * Invokes private method update_
 * @param {?DD.CollectionItem} Item which is subject of changes.
 * @param {DD.Collection.Context} context Operation type.
 * @public
 */
DD.Collection.prototype.changed = function(item, context) {
  this.update_(item, context);
};