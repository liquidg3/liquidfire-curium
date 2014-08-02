define(['altair/facades/declare',
        'altair/plugins/node!fs',
        './View'
], function (declare,
             fs,
             View) {

    return declare([View], {


        text:    '',
        font:    '12px sanserif',
        textAlign: 'left',
        verticalAlign: 'middle', //bottom|middle|alphabetic


        render: function (context) {

            this.inherited(arguments);

            context.textAlign = this.textAlign;
            context.textBaseline = this.verticalAlign;

            context.fillText(this.text, this.frame.left, this.frame.right);
        }

    });

});