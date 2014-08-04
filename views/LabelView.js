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
        backgroundColor: '#000',
        borderRadius: 10,

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

            context.textAlign    = this.textAlign; //left | right | center
            context.textBaseline = this.verticalAlign;
            context.fillStyle    = this.textColor;
            context.font         = this.font;

            var textPositionX = this.frame.left,
                textPositionY = this.frame.top;

            this.textAlign = 'center';

            switch (this.textAlign) {
            case 'left':
                textPositionX = this.frame.left;
                break;

            case 'right':
                textPositionX = this.frame.left + this.frame.width;
                break;

            case 'center':
                textPositionX = this.frame.left + (this.frame.width / 2);
                break;
            }

            switch (this.verticalAlign) {
            case 'top':
                textPositionY = this.frame.top;
                break;

            case 'bottom':
                textPositionY = this.frame.top + this.frame.height;
                break;

            case 'center':
                textPositionY = this.frame.top + (this.frame.height / 2);
                break;
            }


            context.fillText(this.text, textPositionX, textPositionY);

            // Undo the clipping mask
            context.restore();

        }

    });

});