define(['altair/facades/declare',
        'altair/mixins/_DeferredMixin',
        'altair/mixins/_AssertMixin',
        'lodash'
], function (declare,
             _DeferredMixin,
             _AssertMixin,
             _) {

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

        step:  function (view, time) {

            this.lastFrame = _.clone(this.view.frame);
            this.lastTime  = time;

        },

        setView: function (view) {
            this.view = view;
            return this;
        },

        teardown: function () {}

    });

});