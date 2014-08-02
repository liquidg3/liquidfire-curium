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

        render: function (context) {

            this.inherited(arguments);

            //if height is zero, set the height of the frame.
//            if( !this.height ){
//                this.frame.height = context.measureText(this.text).height;
//            }

            console.log(this.height, context.measureText(this.text));
this.backgroundColor = '#000';
            //draw the frame's background color first.
            context.fillStyle = this.backgroundColor;
            context.fillRect( this.frame.top, this.frame.left, this.frame.width, this.frame.heiht );

            context.textAlign    = this.textAlign; //left | right | center
            context.textBaseline = this.verticalAlign;
            context.fillStyle    = this.textColor;
            context.font         = this.font;

            context.save();

            // Create a shape, of some sort
            context.beginPath();
            context.moveTo(this.frame.left, this.frame.top);
            context.lineTo(this.frame.left +this.frame.width, this.frame.top);
            context.lineTo(this.frame.left +this.frame.width, this.frame.top    +this.frame.height);
            context.lineTo(this.frame.left, this.frame.top   +this.frame.height);

            context.clip();

            console.log(this.verticalAlign);

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