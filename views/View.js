define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/mixins/_AssertMixin',
        'altair/events/Emitter',
        'dojo/_base/lang',
        'altair/plugins/node!tween.js',
        'lodash'
], function (declare,
             Lifecycle,
             _AssertMixin,
             Emitter,
             lang,
             tween,
             _) {

    var View = declare([Lifecycle, _AssertMixin, Emitter], {

        frame:              null,
        backgroundColor:    '#FFF',
        borderWidth:        0,          //implicit pixel type
        borderRadius:       0,          //implicit pixel type
        clipping:           false,
        alpha:              1,
        superView:          null,
        autorestoreContext: true,
        vc:                 null,       //set by the creating view controller
        hidden:             false,

        _subViews:          null,
        _animators:         null,
        _behaviors:         null,
        _ignoreExtensions:  '*',        // ignore the extension system

        constructor: function (options) {

            var _options = _.clone(options || {});

            //reset subviews
            this._subViews  = [];
            this._animators = [];
            this._behaviors = [];

            this.frame = {
                left:   0,
                top:    0,
                width:  0,
                height: 0
            };

            //mixin options
            declare.safeMixin(this, _options);

        },

        willRender: function (context, time) {

            if (this.hidden) {
                return;
            }

            if (this.autorestoreContext) {
                //so we don't interfere with anyone else' drawing commands. (as a result, you must call context.restore() when you're done with the.
                context.save();
            }

            _.each(this._animators, function (anim) {
                if (anim) {
                    anim.update(time);
                }
            });


            _.each(this._behaviors, function (behavior) {
                if (behavior) {
                    behavior.step(time);
                }
            }, this);

            _.each(this._subViews, function (view) {
                if(view) {
                    view.alpha -= 1 - this.alpha;
                }
            }, this);

        },

        render: function (context, time) {

            if (this.hidden) {
                return;
            }

            var drawBorder  = false,
                frame       = this.globalFrame();


            //alpha
            context.globalAlpha = this.alpha;

            //clipping
            if (this.clipping) {

                // Create a shape, of some sort//we should account for border size, border radius.
                context.beginPath();

                if (this.borderRadius) {

                    context.moveTo(frame.left + this.borderRadius, frame.top);

                    //top line
                    context.lineTo(frame.left + frame.width - this.borderRadius, frame.top);

                    //top right corner arc
                    context.arcTo(frame.left + frame.width, frame.top, frame.left + frame.width, frame.top + this.borderRadius, this.borderRadius);

                    //right line
                    context.lineTo(frame.left + frame.width, frame.top + frame.height - this.borderRadius);

                    //bottom right corner arc
                    context.arcTo(frame.left + frame.width, frame.top + frame.height, frame.left + frame.width - this.borderRadius, frame.top + frame.height, this.borderRadius);

                    //bottom line
                    context.lineTo(frame.left + this.borderRadius, frame.top + frame.height);

                    //bottom left arc
                    context.arcTo(frame.left, frame.top + frame.height, frame.left, frame.top + frame.height - this.borderRadius, this.borderRadius);

                    //left line
                    context.lineTo(frame.left, frame.top + this.borderRadius);

                    //top left arc
                    context.arcTo(frame.left, frame.top, frame.left + this.borderRadius, frame.top, this.borderRadius);

                } else {

                    //just the box
                    context.moveTo(frame.left, frame.top);
                    context.lineTo(frame.left + frame.width, frame.top);
                    context.lineTo(frame.left + frame.width, frame.top +    frame.height);
                    context.lineTo(frame.left, frame.top +   frame.height);

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

        },


        didRender: function (context, time) {

            if (this.hidden) {
                return;
            }

            _.each(this._subViews, function (view) {

                if (view && this.isSubViewVisible(view)) {
                    view.willRender(context, time);
                    view.render(context, time);
                    view.didRender(context, time);

                    view.alpha += 1 - this.alpha;

                }

                if (!view) {
//                    console.log(this + ' has undefined subview ', this._subViews.length);
                }


            }, this);


            if (this.autorestoreContext) {
                context.restore();
            }

        },

        isSubViewVisible: function (view, _myBounds) {

            var frame = view.frame,
                myBounds = _myBounds || {
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
            else if (frame.left + frame.width < myBounds.left) {
                return false;
            }
            //top far right
            else if (frame.left > myBounds.left + myBounds.width) {
                return false;
            }
            //too far below
            else if (frame.top > myBounds.top + myBounds.height) {
                return false;
            }

            return true;

        },


        addSubView: function (view) {

            view.removeFromSuperView();
            view.superView = this;
            this._subViews.push(view);

        },

        animate: function (property, value, duration) {

            var dfd;

            if (_.isString(property)) {
                dfd = this.animateProperty(property, value, duration);
            } else {
                dfd = this.animateProperties(property, value, duration);
            }

            return dfd;

        },

        animateProperty: function (named, to, duration) {
            var options = {};
            options[named] = to;
            return this.animateProperties(options, duration || 500);
        },

        globalFrame: function () {

            var frame = _.clone(this.frame),
                parentFrame = this.superView ? this.superView.globalFrame() : null;

            if (parentFrame) {
                frame.top += parentFrame.top;
                frame.left += parentFrame.left;
            }

            return frame;
        },

        addBehavior: function (behavior) {

            this.assert(behavior && behavior.setView, 'you must pass a behavior View.addBehavior()');

            if (!this._behaviors) {
                this._behaviors = [];
            }

            behavior.setView(this);
            this._behaviors.push(behavior);

            return this;
        },

        animateProperties: function (properties, duration, options) {

            var dfd         = new this.Deferred(),
                to          = properties,
                _duration   = duration || 500,
                view        = this,
                _options    = options || {},
                setOnView   = _.has(_options, 'setOnView') ? _options.setOnView : true,
                from        = _options.from,
                anim,
                easing;

            if (_.isObject(_duration)) {
                _options = _duration;
                _duration = _options.duration || 500;
            }

            if (!from) {

                from = {};

                _.each(properties, function (value, key) {
                    from[key] = lang.getObject(key, false, this);
                }, this);

            }

            anim = new tween.Tween(from).to(to, _duration).onUpdate(function (time) {

                //they may be borrowing the animate for something other than view properties
                if (setOnView) {

                    _.each(from, function (value, key) {
                        lang.setObject(key, this[key], view);
                    }, this);

                }

                dfd.progress(this);

            }).onComplete(function () {

                view._animators.splice(view._animators.indexOf(anim), 1);
                dfd.resolve(view);

            });

            if (_options.easing) {

                easing = lang.getObject(_options.easing, false, tween.Easing);

                if (easing) {
                    anim.easing(easing);
                }

            }

            anim.start();
            this._animators.push(anim);

            return dfd;

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
        },

        teardown: function () {

            this._animators = null;
            this.removeFromSuperView();

            this.deferred = this.all(_.map(this._behaviors, function (b) {
                return b.teardown ? b.teardown() : null;
            }));

            return this.inherited(arguments);
        }

    });


    return View;

});