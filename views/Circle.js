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

            if (this.autorestoreContext) {
                //so we don't interfere with anyone else' drawing commands. (as a result, you must call context.restore() when you're done with the.
                context.save();
            }

            _.each(this._animators, function (anim) {
                anim.update(time);
            });

            _.each(this._behaviors, function (behavior) {
                behavior.step(this, time);
            }, this);

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

            _.each(this._subViews, function (view) {
                if (this.isSubViewVisible(view)) {
                    view.render(context, time);
                }
            }, this);


            if (this.autorestoreContext) {
                context.restore();
            }


        }

    });

});