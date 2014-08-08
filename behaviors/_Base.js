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
        lastTime:   null,
        lastFrame:  null,
        startTime:  null,

        constructor: function (options) {

            _.each(options, function (value, key) {
                this[key] = value;
            }, this);

        },

        start: function (view, time) {

            this.lastFrame  = view.frame;
            this.startTime  = time;

        },

        step:  function (view, time) {

            this.lastFrame = view.frame;
            this.lastTime  = time;

        }

    });

});