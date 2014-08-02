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

        render: function (context) {

            this.inherited(arguments);

            context.textAlign = this.textAlign;
            context.textBaseline = this.verticalAlign;
            context.fillStyle = this.textColor;
            context.font = this.font;

            console.log('rendering text', this.text, 'at', this.frame);

            context.fillText(this.text, this.frame.left, this.frame.top, this.frame.width);
        }

    });

});