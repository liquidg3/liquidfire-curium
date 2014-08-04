define(['altair/facades/declare',
    'altair/mixins/_DeferredMixin',
    'altair/mixins/_AssertMixin',
    'dojo/_base/lang',
    'altair/plugins/node!tween.js',
    'lodash'
], function (declare,
             _DeferredMixin,
             _AssertMixin,
             lang,
             tween,
             _) {

    var View = declare([_DeferredMixin, _AssertMixin], {


        frame:              null,
        backgroundColor:    '#FFF',
        borderWidth:        0,          //implicit pixel type
        borderRadius:       0,          //implicit pixel type
        clipping:           false,
        alpha:              1,
        superView:          null,
        autorestoreContext: false,
        vc:                 null,           //set by the creating view controller

        _subViews:          null,
        _animators:         null,
        _frameCache:        null,

        constructor: function (options) {

            var _options = _.clone(options || {});

            //reset subviews
            this._subViews  = [];
            this._animators = [];

            this.frame = {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            };

            //mixin options
            declare.safeMixin(this, _options);

        },

        render: function (context, time) {

            //so we don't interfere with anyone else' drawing commands. (as a result, you must call context.restore() when you're done with the.
            context.save();


            _.each(this._animators, function (anim) {
                anim.update(time);
            });

            var drawBorder  = false,
                frame       = this.calculatedFrame();

            //alpha
            context.globalAlpha = this.alpha;

            //clipping
            if (this.clipping) {

                // Create a shape, of some sort//we should account for border size, border radius.
                context.beginPath();

                if( this.borderRadius ){

                    context.moveTo(frame.left+this.borderRadius, frame.top);

                    //top line
                    context.lineTo(frame.left+frame.width-this.borderRadius, frame.top);

                    //top right corner arc
                    context.arcTo(frame.left+frame.width, frame.top, frame.left+frame.width, frame.top+this.borderRadius, this.borderRadius);

                    //right line
                    context.lineTo(frame.left+frame.width, frame.top+frame.height-this.borderRadius);

                    //bottom right corner arc
                    context.arcTo(frame.left+frame.width, frame.top+frame.height, frame.left+frame.width-this.borderRadius, frame.top+frame.height, this.borderRadius);

                    //bottom line
                    context.lineTo(frame.left+this.borderRadius, frame.top+frame.height);

                    //bottom left arc
                    context.arcTo(frame.left, frame.top+frame.height, frame.left, frame.top+frame.height-this.borderRadius, this.borderRadius);

                    //left line
                    context.lineTo(frame.left, frame.top+this.borderRadius);

                    //top left arc
                    context.arcTo(frame.left, frame.top, frame.left+this.borderRadius, frame.top, this.borderRadius);

                } else {

                    //just the box
                    context.moveTo(frame.left, frame.top);
                    context.lineTo(frame.left+ frame.width, frame.top);
                    context.lineTo(frame.left+ frame.width, frame.top+    frame.height);
                    context.lineTo(frame.left, frame.top+   frame.height);

                }

                context.clip();

            }


            //background color
            if (this.backgroundColor && this.backgroundColor !== 'transparent') {

                context.beginPath();
                context.rect(frame.left || 0, frame.top || 0, frame.width, frame.height);
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
                if(this.isSubViewIsVisible(view)) {
                    view.render(context, time);
                }
            }, this);


            if( this.autorestoreContext ){
                context.restore();
            }

        },

        isSubViewIsVisible: function (view) {

            var frame = view.frame,
                myBounds = {
                    left: 0,
                    top: 0,
                    width: this.frame.width,
                    height: this.frame.height
                };

            //outside the top
            if (frame.top + frame.height < myBounds.top) {
                return false;
            }
            //too far left
            else if(frame.left + frame.right < myBounds.left) {
                return false;
            }
            //top far right
            else if(frame.left > myBounds.left + myBounds.width) {
                return false;
            }
            //too far below
            else if(frame.top + frame.height > myBounds.top + myBounds.height) {
                return false;
            }

            return true;

        },


        addSubView: function (view) {
            view.removeFromSuperView();
            this._subViews.push(view);
            view.superView = this;
        },

        animate: function (property, value, duration) {

            var dfd;

            if (_.isString(property)) {
                dfd = this.animateProperty(property, value, duration);
            } else {
                dfd = this.animateProperties(property, value);
            }

            return dfd;
        },


        animateProperty: function (named, to, duration) {
            var options = {};
            options[named] = to;
            return this.animateProperties(options, duration || 500);
        },

        calculatedFrame: function () {

            var frame = _.clone(this.frame),
                parentFrame = this.superView ? this.superView.calculatedFrame() : null;

            if(parentFrame) {
                frame.top += parentFrame.top;
                frame.left += parentFrame.left;
            }

            return frame;
        },

        animateProperties: function (properties, duration) {

            var from = {},
                dfd = new this.Deferred(),
                to = properties,
                _duration = duration || 500,
                view      = this,
                anim;


            _.each(properties, function (value, key) {
                from[key] = lang.getObject(key, false, this);
            }, this);

            anim = new tween.Tween(from).to(to, _duration).onUpdate(function () {
                _.each(from, function (value, key) {
                    lang.setObject(key, this[key], view);
                }, this);

            }).onComplete(function () {
                view._animators.splice(view._animators.indexOf(this));
                dfd.resolve(view);
            });

            anim.start();
            this._animators.push(anim);

            return dfd;

        },

        clearFrameCache: function () {
            this._frameCache = null;
        },

        removeAllSubViews: function () {
            _.each(this._subViews, function (view) {
                view.removeFromSuperView();
            });
        },

        removeFromSuperView: function () {

            if (this.superView) {
                this.superView._subViews.splice(this.superView._subViews.indexOf(this), 1);
                this.superView = null;
            }
        }

    });


    return View;

});