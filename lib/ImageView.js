define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/plugins/node!fs',
        './View',
        'altair/plugins/node!openvg-canvas'
], function (declare,
             Lifecycle,
             fs,
             View,
             Canvas) {

    return declare([View, Lifecycle], {


        image:   null,
        startup: function (options) {

            var _options = options || this.options || {};

            if (_options.image) {

                this.deferred = this.loadImage(_options.image).then(function (img) {

                    this.image          = img;
                    this.frame.width    = img.width;
                    this.frame.height   = img.height;

                    return this;

                }.bind(this));
            }

            //mixin options
            return this.inherited(arguments);

        },

        loadImage: function (path) {

            return this.promise(fs, 'readFile', this.parent.resolvePath(path)).then(function (data) {

                var img = new Canvas.Image();
                img.src = data;

                return img;

            }).otherwise(function (err) {
                console.log('image load failed');
                console.log(err.stack);
            });

        },

        render: function (context) {

            this.inherited(arguments);

            context.drawImage(this.image, this.frame.left, this.frame.top);
        }

    });

});