/**
 *
 * @author:     Taylor Romero
 * @license:    MIT
 * @vendor:     liquidfire
 * @module:     Curium
 * @nexus:      this.nexus("liquidfire:Curium")
 *
 */

define(['altair/facades/declare', //take a look at terms.md
        'altair/Lifecycle',
        'altair/mixins/_AssertMixin',
        'altair/events/Emitter'
], function (declare,
             Lifecycle,
             _AssertMixin,
             Emitter) {

    return declare([Lifecycle, Emitter, _AssertMixin], {

        execute: function (options) {

            var _options = options || this.options || {};

            if (_options.app) {

                _options.app.dir = 'app';

                return this.forge('models/App', _options.app).then(function (app) {
                    return app.execute();
                });

            }

            return this.inherited(arguments);

        }

    });
});