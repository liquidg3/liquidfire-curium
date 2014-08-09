define(['altair/facades/declare',
    './_Base'
], function (declare,
             _Base) {

    return declare([_Base], {

        xSpeed: 0,
        ySpeed: 0,

        step:  function (time) {

            this.view.frame.left += this.xSpeed;
            this.view.frame.top += this.ySpeed;

            return this.inherited(arguments);
        }

    });

});