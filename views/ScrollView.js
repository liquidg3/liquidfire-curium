define(['altair/facades/declare',
        'altair/Lifecycle',
        './View',
        'lodash'
], function (declare,
             Lifecycle,
             View,
             _) {

    return declare([View, Lifecycle], {

        contentView: null,
        contentOffset: {
            top: 0,
            left: 0
        },

        startup: function () {

            this.deferred = this.vc.forgeView({
                frame: this.frame,
                backgroundColor: '#00f'
            }).then(function (view) {

                this.contentView = view;
                this.addSubView(this.contentView);

                return this;

            }.bind(this));

            return this.inherited(arguments);
        },

        addSubView: function (view) {

            if (!this.contentView) {

               return this.inherited(arguments);

            } else {

                return this.contentView.addSubView(view)

            }
        },

        calculatedContentFrame: function () {

            var frame = _.clone(this.frame),
                contentFrame = this.contentView.frame;

            frame.height    = Math.max(frame.height, contentFrame.height);
            frame.width     = Math.max(frame.width, contentFrame.width);
            frame.top       += this.contentOffset.top;
            frame.left      += this.contentOffset.left;

            return frame;

        },

        render: function () {
            this.contentView.frame = this.calculatedContentFrame();
            this.inherited(arguments);
        }


    });

});