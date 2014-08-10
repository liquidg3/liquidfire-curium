define(['altair/facades/declare',
        'altair/mixins/_DeferredMixin',
        'altair/mixins/_AssertMixin',
        'lodash'
], function (declare,
             _DeferredMixin,
             _AssertMixin,
             lodash) {

    return declare([_DeferredMixin, _AssertMixin], {

        view:       null,
        particles: null,

        constructor: function (options) {
            this.particles = [];

            //load it up with options.particleCount number of particle views

        },

        step:  function (view, time) {
            //animate and render all the particles in this.particles

            return this.inherited(arguments);
        }


    });

});