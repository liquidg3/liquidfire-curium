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
    'altair/events/Emitter',
    'require'
], function (declare,
             Lifecycle,
             _AssertMixin,
             Emitter,
             require) {

    return declare([Lifecycle, Emitter, _AssertMixin], {

        execute: function (options) {

            var _options = options || this.options || {};

            if (_options.app) {

                if (!_options.app.dir) {
                    _options.app.dir = '.';
                }

                _options.app.dir = this.nexus('Altair').resolvePath(_options.app.dir);

                return this.forge(require.toUrl(_options.app.dir + '/App'), _options.app, { type: 'curium-app' }).then(function (app) {
                    app.execute();
                });

            }

            return this.inherited(arguments);

        }

    });
});