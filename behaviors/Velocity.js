define(['altair/facades/declare',
    './_Base'
], function (declare,
             _Base) {

    return declare([_Base], {

        xSpeed: 0,
        ySpeed: 0,

        step:  function (view, time) {



            return this.inherited(arguments);
        }

    });

});