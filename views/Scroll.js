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
        clipping:    false,
        contentOffset: {
            top: 0,
            left: 0
        },

        startup: function () {

            this.deferred = this.vc.forgeView({
                frame: _.clone(this.frame),
                backgroundColor: 'transparent'
            }).then(function (view) {

                this.addSubView(view);
                this.contentView = view;

                if(this.contentHeight) {
                    this.contentView.frame.height = this.contentHeight;
                    delete this.contentHeight;
                }

                return this;

            }.bind(this));

            return this.inherited(arguments);
        },

        addSubView: function (view) {

            if (this.contentView) {


                return this.contentView.addSubView(view)

            } else {

                view.isSubViewVisible = this.hitch(function (view) {

                    return this.isSubViewVisible({
                        frame: {
                               left: view.frame.left + this.contentOffset.left,
                               top: view.frame.top + this.contentOffset.top,
                               width: view.frame.width,
                               height: view.frame.height
                        }
                    });

                });

                return this.inherited(arguments);

            }
        },


        setLeftScroll: function (percent) {
            this.contentOffset.left = (this.contentView.frame.width - this.frame.width) * percent * -1;
        },

        calculatedContentFrame: function () {

            var frame = _.clone(this.frame),
                contentFrame = this.contentView.frame;

            frame.height    = Math.max(frame.height, contentFrame.height);
            frame.width     = Math.max(frame.width, contentFrame.width);
            frame.top       = this.contentOffset.top;
            frame.left      = this.contentOffset.left;

            return frame;

        },

        scrollTo: function (offset, duration, options) {

            var _offset = _.merge({
                top: this.contentOffset.top,
                left: this.contentOffset.left
            }, offset);

            if(!duration) {
                duration = 500;
            }

            return this.animateProperties({
                'contentOffset.top': _offset.top,
                'contentOffset.left': _offset.left
            }, duration, options)

        },

        render: function () {
            this.contentView.frame = this.calculatedContentFrame();
            this.inherited(arguments);
        }


    });

});