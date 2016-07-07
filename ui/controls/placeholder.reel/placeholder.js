var Slot = require("montage/ui/slot.reel").Slot;

/**
 * @class Placeholder
 * @extends Slot
 */
exports.Placeholder = Slot.specialize({

    constructor: {
        value: function () {
            this._componentsMap = new Map();
        }
    },

    hasTemplate: {
        value: true
    },

    _moduleId: {
        value: null
    },

    moduleId: {
        get: function () {
            return this._moduleId;
        },
        set: function (value) {
            if (this._moduleId !== value) {
                this._moduleId = value;
                if (typeof value === "string" && value.length) {
                    this._needsLoadComponent = true;
                    this.needsDraw = true;
                }
            }
        }
    },

    _object: {
        value: null
    },

    object: {
        get: function () {
            return this._object;
        },
        set: function (object) {
            if (this._object !== object) {
                this._object = object;
                this._needsLoadComponent = true;
                this.needsDraw = true;
            }
        }
    },

    _context: {
        value: null
    },

    context: {
        get: function () {
            return this._context;
        },
        set: function (context) {
            if (this._context !== context) {
                this._context = context;
                this.needsDraw = true;
            }
        }
    },

    component: {
        value: null
    },

    size: {
        value: null
    },

    _needsLoadComponent: {
        value: false
    },

    exitDocument: {
        value: function () {
            // Reset content to ensure that component is detached from component tree
            // to ensure that its context is set when it's re-enter in the DOM
            this.content = null;
            //Fixme: montage issue, not able to remove a class from the element when leaving the dom
            if (this.element.classList.contains("selected")) {
                this.element.classList.remove("selected");
            }
        }
    },

    _dispatchPlaceholderContentLoaded: {
        value: function () {
            this.dispatchEventNamed("placeholderContentLoaded", true, true, this);
        }
    },

    _loadComponentIfNeeded: {
        value: function () {
            var promise,
                moduleId = this._moduleId;
            if (this._needsLoadComponent && typeof this._moduleId === "string" && this._moduleId.length) {
                var self = this;

                this._isLoadingComponent = true;
                this._needsLoadComponent = false;

                if (this._componentsMap.has(moduleId)) {
                    promise = Promise.resolve(this._componentsMap.get(moduleId));
                } else {
                    promise = require.async(moduleId).then(function (exports) {
                        var component = new exports[Object.keys(exports)[0]]();
                        self._componentsMap.set(moduleId, component);

                        return component;
                    });
                }

                promise.then(function (component) {
                    self.component = component;
                    self._isLoadingComponent = false;
                    component.object = self.object;
                    component.context = self.context;
                    self.content = component;

                    var oldEnterDocument = self.component.enterDocument;

                    self.component.enterDocument = function (isFirstTime) {
                        self._dispatchPlaceholderContentLoaded();

                        if (this.enterDocument = oldEnterDocument) {
                            this.enterDocument(isFirstTime);
                        }
                    }
                });
            } else if (!this.content && this._componentsMap.has(moduleId)) {
                this.content = this._componentsMap.get(moduleId);
                this.content.context = this.context;
                this.content.object = this.object;
            }

            return promise;
        }
    },

    draw: {
        value: function () {
            this._loadComponentIfNeeded();
        }
    }

});
