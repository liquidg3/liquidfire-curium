define(['altair/facades/declare',
    'altair/Lifecycle',
    'altair/plugins/node!path',
    'altair/plugins/node!openvg-canvas',
    'altair/mixins/_AssertMixin',
    'require'
], function (declare,
             Lifecycle,
             path,
             Canvas,
             _AssertMixin,
             require) {

    return declare([Lifecycle, _AssertMixin], {

        appDir:                 '',
        activeViewController:   null,
        animationHandle:        null,
        startup: function (options) {

            this.assert(options, 'You must pass some options to ' + this);

            var dir     = require.toUrl(options.dir),
                rootVc  = options.rootViewController,
                width   = options.width || 256,
                height  = options.height || 256;

            this.assert(rootVc, 'You must pass a rootViewController to ' + this);

            //more options needed
            options.dir = this.appDir = dir;

            this.canvas = options.canvas = new Canvas(width, height);
            this.context = options.context = this.canvas.getContext('2d');

            this.deferred = this.all({
                activeViewController: this.forgeController(rootVc, options)
            }).then(function (dependencies) {
                declare.safeMixin(this, dependencies);
                return this;
            }.bind(this));

            return this.inherited(arguments);

        },

        forgeController: function (named, options) {

            var _options = options || {},
                p   = path.join(this.appDir, 'viewcontrollers', named),
                dir = this.appDir;

            _options.app = this;

            return this.forge(p, _options, {
                foundry: function (Class, options, config) {

                    return config.defaultFoundry(Class, options, config).then(function (controller) {
                        controller.dir = dir;
                        return controller;
                    });

                }
            });

        },

        execute: function () {

            //clear context to get ready
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.deferred = new this.Deferred();

            this.activeViewController.execute().then(function (vc) {

                this.presentViewController = vc;

            }.bind(this)).otherwise(function (err) {

                this.log('app error in state: ' + err.state);
                this.log(err.error);

            }.bind(this));

            this.renderFrame();

            return this.inherited(arguments);

        },

        renderFrame: function (time) {

            this.animationHandle = requestAnimationFrame(this.hitch('renderFrame'));
            this.activeViewController.render(this.context, time);
        },

        presentViewController: function (named, options) {

            return this.forgeController(named, options).then(function (vc) {
                return vc.execute();
            }).then(function (vc) {

                this.activeViewController = vc;

                return vc;

            }.bind(this));

        }


    });

});