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
        clipping:           true,
        alpha:              1,
        superView:          null,

        _subViews:  null,
        _animators: null,
        _frameCache: null,
        _frame:     null,

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

            _.each(this._animators, function (anim) {
                anim.update(time);
            });

            var drawBorder  = false,
                frame       = this.calculatedFrame();

            //alpha
            context.globalAlpha = this.alpha;

            //so we don't interfere with anyone else' drawing commands. (as a result, you must call context.restore() when you're done with the.
            context.save();

            //clipping
            if (this.clipping){
                // Create a shape, of some sort//we should account for border size, border radius.
                context.beginPath();

                if( this.borderRadius ){
                    context.moveTo(this.frame.left+this.borderRadius, this.frame.top);

                    //top line
                    context.lineTo(this.frame.left+this.frame.width-this.borderRadius, this.frame.top);

                    //top right corner arc
                    context.arcTo(this.frame.left+this.frame.width, this.frame.top, this.frame.left+this.frame.width, this.frame.top+this.borderRadius, this.borderRadius);

                    //right line
                    context.lineTo(this.frame.left+this.frame.width, this.frame.top+this.frame.height-this.borderRadius);

                    //bottom right corner arc
                    context.arcTo(this.frame.left+this.frame.width, this.frame.top+this.frame.height, this.frame.left+this.frame.width-this.borderRadius, this.frame.top+this.frame.height, this.borderRadius);

                    //bottom line
                    context.lineTo(this.frame.left+this.borderRadius, this.frame.top+this.frame.height);

                    //bottom left arc
                    context.arcTo(this.frame.left, this.frame.top+this.frame.height, this.frame.left, this.frame.top+this.frame.height-this.borderRadius, this.borderRadius);

                    //left line
                    context.lineTo(this.frame.left, this.frame.top+this.borderRadius);

                    //top left arc
                    context.arcTo(this.frame.left, this.frame.top, this.frame.left+this.borderRadius, this.frame.top, this.borderRadius);

                } else {
                    //just the box
                    context.moveTo(this.frame.left, this.frame.top);
                    context.lineTo(this.frame.left+ this.frame.width, this.frame.top);
                    context.lineTo(this.frame.left+ this.frame.width, this.frame.top+    this.frame.height);
                    context.lineTo(this.frame.left, this.frame.top+   this.frame.height);

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
                view.render(context, time);
            }, this);



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
            return this.frame;
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