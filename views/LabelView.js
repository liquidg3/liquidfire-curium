define(['altair/facades/declare',
        'altair/plugins/node!fs',
        './View'
], function (declare,
             fs,
             View) {

    return declare([View], {

        text:    '',
        font:    '12px serif',
        textColor: '#000',
        textAlign: 'left',
        verticalAlign: 'bottom', //bottom|middle|alphabetic
        backgroundColor: '#FFA',
        text:           '',
        font:           '12px serif',
        textColor:      '#000',
        textAlign:      'left',
        verticalAlign:  'bottom', //bottom|middle|alphabetic

        render: function (context) {
            this.inherited(arguments);

            context.textAlign    = this.textAlign; //left | right | center
            context.textBaseline = this.verticalAlign;
            context.fillStyle    = this.textColor;
            context.font         = this.font;

            var textPositionX = this.frame.left;
            var textPositionY = this.frame.top;

            this.textAlign = 'center';

            switch (this.textAlign) {
                case 'left':
                    textPositionX = this.frame.left;
                    break;

                case 'right':
                    textPositionX = this.frame.left+this.frame.width;
                    break;

                case 'center':
                    textPositionX = this.frame.left+(this.frame.width/2);
                    break;
            }

            switch (this.verticalAlign) {
                case 'top':
                    textPositionY = this.frame.top;
                    break;

                case 'bottom':
                    textPositionY = this.frame.top+this.frame.height;
                    break;

                case 'center':
                    textPositionY = this.frame.top+(this.frame.height/2);

                    break;
            }


            context.fillText(this.text, textPositionX, textPositionY, this.frame.width);

            // Undo the clipping
            context.restore();

        }

    });

});