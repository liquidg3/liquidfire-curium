define(['altair/facades/declare',
    './_Base'
], function (declare,
             _Base) {

    return declare([_Base], {

        speed: 0,
        direction: 0,

        _xSpeed: 0,
        _ySpeed: 0,

        step:  function (time) {

            //from speed and direction, we determine where the ball needs to be drawn for this frame.
            this.view.frame.left += Math.ceil(Math.cos(this.direction * 0.01745329251994) * this.speed);
            this.view.frame.top += Math.ceil(Math.sin(this.direction * 0.01745329251994) * this.speed);


            //this.view.frame.left += this._xSpeed;
            //this.view.frame.top += this._ySpeed;

            return this.inherited(arguments);
        }

    });

});