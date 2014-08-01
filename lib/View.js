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

    return declare([_DeferredMixin, _AssertMixin], {


        frame:              null,
        backgroundColor:    '#FFF',
        borderWidth:        0,
        alpha:              1,

        _subViews:  null,
        _animators: null,
        constructor: function (options) {

            var _options = options || {};

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

            var drawBorder = false;

            //alpha
            context.globalAlpha = this.alpha;

            //background color
            if (this.backgroundColor && this.backgroundColor !== 'transparent') {

                context.beginPath();
                context.rect(this.frame.left || 0, this.frame.top || 0, this.frame.width, this.frame.height);
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
            this._subViews.push(view);
            view.parent = this;
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
        }

    });

});