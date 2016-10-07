/**
 * @module ui/scrub-args.reel
 */
var Component = require("montage/ui/component").Component;

/**
 * @class ScrubArgs
 * @extends Component
 */
exports.ScrubArgs = Component.specialize(/** @lends ScrubArgs# */ {
    templateDidLoad: {
        value: function() {
            var self = this;
            this.application.storageService.listVolumes().then(function(volumes) {
                self.volumes = volumes;
            });
        }
    },

    enterDocument: {
        value: function(isFirstTime) {

            if (!this.args || this.args.length != 1) {
                this.args = ['---'];
                this.args.length = 1;
            }
        }
    }
});
