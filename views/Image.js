define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/plugins/node!fs',
        './View',
        'altair/plugins/node!openvg-canvas' //it's bad i have to bring this in
], function (declare,
             Lifecycle,
             fs,
             View,
             Canvas) {

    return declare([View, Lifecycle], {


        image:   null,
        imagePath: '',
        startup: function (options) {

            var _options = options || this.options || {};

            if (_options.image) {
                this.imagePath = _options.image;
            }

            //mixin options
            return this.inherited(arguments);

        },

        loadImage: function (path) {

            return this.promise(fs, 'readFile', this.vc.resolvePath(path || this.imagePath)).then(function (data) {

                var img = new Canvas.Image();
                img.src = data;

                this.image          = img;

                //we have no size yet
                if (this.frame.width === 0) {
                    this.frame.width    = img.width;
                    this.frame.height   = img.height;
                }

                return this;

            }.bind(this)).otherwise(function (err) {
                console.log('image load failed');
                console.log(err.stack);
            });

        },

        render: function (context) {

            this.inherited(arguments);

            if (this.image) {
                context.drawImage(this.image, this.frame.left, this.frame.top);
            }

        }

    });

});