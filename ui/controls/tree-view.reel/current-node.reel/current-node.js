/**
 * @module ui/current-node.reel
 */
var Component = require("montage/ui/component").Component;

/**
 * @class CurrentNode
 * @extends Component
 */
exports.CurrentNode = Component.specialize(/** @lends CurrentNode# */ {

    enterDocument: {
        value: function () {
            this.selectedNode = this.selectedPath;
        }
    },

    _selectedPath: {
        value: null
    },

    selectedPath: {
        get: function () {
            return this._selectedPath;
        },
        set: function (path) {
            this.selectedNode = path;
            this._selectedPath = path;
        }
    },

    handleOpenButtonAction: {
        value: function (event) {
            var iteration = this.items._findIterationContainingElement(event.target.element);

            if (iteration) {
                this.controller.open(iteration.object.path);
            }
        }
    },

    handleCheckboxAction: {
        value: function (event) {
            var iteration = this.items._findIterationContainingElement(event.target.element);
            this.selectedNode = iteration.object.path;
        }
    }
});
