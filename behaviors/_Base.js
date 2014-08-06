define(['altair/facades/declare',
        'altair/mixins/_DeferredMixin',
        'altair/mixins/_AssertMixin'
], function (declare,
             _DeferredMixin,
             _AssertMixin) {

    return declare([_DeferredMixin, _AssertMixin], {
        view:       null,
        lastTime:   null,
        lastFrame:  null,
        startTime:  null,

        construct: function (options) {
            this.options = options;
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