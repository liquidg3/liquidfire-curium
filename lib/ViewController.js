define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/mixins/_AssertMixin',
        'altair/StateMachine'
], function (declare,
             Lifecycle,
             _AssertMixin,
             StateMachine) {

    return declare([Lifecycle, _AssertMixin], {

        app:    null,
        states: null,
        fsm:    null,
        canvas: null,
        view:   null,
        startup: function (options) {

            var _options = options || this.options || {};

            this.app        = _options.app;
            this.canvas     = _options.canvas || this.app.canvas;
            this.context    = _options.context;

            this.assert(this.states, "You need to set states: ['login', 'logout', 'etc.']");

            this.fsm = new StateMachine({
                states: this.states,
                delegate: this
            });

            this.deferred = this.all({
                view: this.forgeView({
                    frame: {
                        left: 0,
                        top: 0,
                        width: this.canvas.width,
                        height: this.canvas.height
                    }
                })
            }).then(function (dependencies) {
                declare.safeMixin(this, dependencies);
                return this;
            }.bind(this));

            return this.inherited(arguments);
        },

        execute: function () {

            return this.fsm.execute();

        },

        delay: function (duration, data) {

            var dfd = new this.Deferred();

            setTimeout(this.hitch(dfd, 'resolve', data), duration);

            return dfd;
        },

        render: function (context, time) {
            this.view.clearFrameCache();
            return this.view.render(context, time);
        },

        forgeView: function (path, options) {

            if (!options) {
                options = path;
                path    = 'liquidfire:Curium/views/View';
            } else if (path.search(':') === -1 && path[0] !== '/') {
                path = 'liquidfire:Curium/views/' + path;
            }

            return this.forge(path, options);


        }


    });

});