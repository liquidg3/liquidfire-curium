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

        step:  function (view, time) {

            //I cant seem to initialize this property in startup. a little help?
            this.lastFrame = this.lastFrame || {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            };

            //calculate the last frame so that we can use it in our behaviors
            this.lastFrame.left = this.view.frame.left;
            this.lastFrame.top = this.view.frame.top;
            this.lastFrame.width = this.view.frame.width;
            this.lastFrame.height = this.view.frame.height;

            this.lastTime  = time;

        },

        setView: function (view) {
            this.view = view;
            return this;
        },

        teardown: function () {}

    });

});