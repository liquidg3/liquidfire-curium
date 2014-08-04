define(['altair/facades/declare',
        'altair/Lifecycle',
        './View'
    ], function (declare,
             LifeCycle,
             View) {

    return declare([View, LifeCycle], {

        text:    '',
        font:    '12px serif',
        fontPath: undefined,
        textColor: '#000',
        textAlign: 'left',
        verticalAlign: 'center', //bottom|middle|alphabetic

        startup: function (options) {
            var _options = options || this.options || {};

            if (_options.text) {

                this.setText(_options.text);

            }

            if (_options.fontPath) {

                this.deferred = this.loadFont(_options.fontPath).then(function (font) {
                    //@todo: work in progress

                    return this;

                }.bind(this));

            }

            //mixin options
            return this.inherited(arguments);

        },

        loadFont: function (fontPath) {

        },

        setText: function (text) {

        },

        render: function (context) {

            this.inherited(arguments);

            var frame = this.globalFrame();

            context.textAlign    = this.textAlign; //left | right | center
            context.textBaseline = this.verticalAlign;
            context.fillStyle    = this.textColor;
            context.font         = this.font;

            var textPositionX = frame.left,
                textPositionY = frame.top;

            this.textAlign = 'center';

            switch (this.textAlign) {
            case 'left':
                textPositionX = frame.left;
                break;

            case 'right':
                textPositionX = frame.left + frame.width;
                break;

            case 'center':
                textPositionX = frame.left + (frame.width / 2);
                break;
            }

            switch (this.verticalAlign) {
            case 'top':
                textPositionY = frame.top;
                break;

            case 'bottom':
                textPositionY = frame.top + frame.height;
                break;

            case 'center':
                textPositionY = frame.top + (frame.height / 2);
                break;
            }


            context.fillText(this.text, textPositionX, textPositionY);

            // Undo the clipping mask
//            context.restore();

        }

    });

});