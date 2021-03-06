define(['altair/facades/declare',
    'altair/Lifecycle',
    'altair/events/Emitter',
    'altair/mixins/_AssertMixin',
    'altair/StateMachine',
    'lodash'
], function (declare,
             Lifecycle,
             Emitter,
             _AssertMixin,
             StateMachine,
             _) {

    return declare([Lifecycle, _AssertMixin, Emitter], {

        app:    null,
        states: null,
        fsm:    null,
        canvas: null,
        view:   null,

        __coreViews: ['View', 'Image', 'Label', 'Scroll', 'Select', 'Cicrle'], //our view types
        __coreBehaviors: ['Collision', 'Collision2', 'Velocity'], //our behaviors


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

            this.view = this.forgeView({
                frame: {
                    left:   0,
                    top:    0,
                    width:  this.canvas.width,
                    height: this.canvas.height
                }
            });


            return this.inherited(arguments);
        },

        execute: function () {

            return this.fsm.execute().then(function () {
                return this;
            }.bind(this)).otherwise(function (err) {
                this.log('ViewController.StateMachine error');
                this.log(err);
            }.bind(this));

        },

        delay: function (duration, data) {

            var dfd = new this.Deferred();

            setTimeout(this.hitch(dfd, 'resolve', data), duration);

            return dfd;
        },

        render: function (context, time) {
            this.view.willRender(context, time);
            this.view.render(context, time);
            this.view.didRender(context, time);
        },

        forgeView: function (path, options) {

            var _options = options || {};

            if (_.isObject(path)) {

                _options    = path || {};
                path        = 'liquidfire:Curium/views/View';

            } else if (path.search(':') === -1 && path[0] !== '/') {

                //is it a core view?
                if (this.__coreViews.indexOf(path) === -1) {
                    path = 'views/' + path;
                } else {
                    path = 'liquidfire:Curium/views/' + path;
                }

            }

            _options.context = this.context;
            _options.canvas  = this.canvas;
            _options.vc      = this;

            return this.forgeSync(path, _options, { parent: this });

        },

        forgeBehavior: function (path, options) {

            var _options = options || {};

            if (path.search(':') === -1 && path[0] !== '/') {

                if (this.__coreBehaviors.indexOf(path) === -1) {
                    path = 'behaviors/' + path;
                } else {
                    path = 'liquidfire:Curium/behaviors/' + path;
                }


            }

            _options.context = this.context;
            _options.canvas  = this.canvas;
            _options.vc      = this;

            return this.forgeSync(path, _options, { parent: this });


        },

        forgeSound: function (path, options) {

            if (!options) {
                options = path;
                path    = 'liquidfire:Curium/audio/Sound';
            } else if (path.search(':') === -1 && path[0] !== '/') {
                path = 'liquidfire:Curium/audio/' + path;
            }

            return this.forge(path, options, { parent: this });

        }


    });

});