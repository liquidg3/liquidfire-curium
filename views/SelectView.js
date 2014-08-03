define(['altair/facades/declare',
    'altair/Lifecycle',
    'altair/plugins/node!fs',
    './View',
    'altair/plugins/node!openvg-canvas'
], function (declare,
             Lifecycle,
             fs,
             View,
             Canvas) {

    return declare([View, Lifecycle], {


        choices: null,
        value:   null,
        render: function (context) {

            this.inherited(arguments);

            //draw select control here

//            context.drawImage(this.image, this.frame.left, this.frame.top);
        },

        setValue: function (value) {
            this.value = value;
        }

    });

});