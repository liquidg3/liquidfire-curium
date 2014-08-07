define(['altair/facades/declare',
    'altair/Lifecycle',
    './View',
    'lodash'
], function (declare,
             Lifecycle,
             View,
             lodash) {

    return declare([View, Lifecycle], {


        render: function (context, time) {

            var drawBorder  = false,
                frame       = this.globalFrame();


            //alpha
            context.globalAlpha = this.alpha;


            //background color
            if (this.backgroundColor && this.backgroundColor !== 'transparent') {

                context.beginPath();
                context.arc(frame.left || 0, frame.top || 0, frame.width, 0, 2 * Math.PI);
                context.fillStyle = this.backgroundColor;
                context.fill();

            }

            //border
            if (this.borderWidth) {
                context.lineWidth = 7;
                drawBorder = true;
            }

            if (this.borderColor) {
                context.strokeStyle = 'black';
                drawBorder = true;
            }

            if (drawBorder) {
                context.stroke();
            }

        }

    });

});