define(['altair/facades/declare',
    'altair/facades/mixin',
    './ScrollView',
    'lodash'
], function (declare, mixin, ScrollView, _) {

    return declare([ScrollView], {


        choices:      null,
        value:        null,
        labelOptions: null,
        fadeOptions:  true,
        _choiceViews: null,

        startup: function (options) {

            var _options = options || this.options || {};

            return this.inherited(arguments).then(function () {

                if (this.choices) {

                    return this.setChoices(_options.choices).then(function () {
                        return this;
                    }.bind(this));

                } else {
                    return this;
                }


            }.bind(this));
        },


        optionDistanceFromCenter: function (choice) {

            var view = this._choiceViews[choice],
                center,
                myCenter,
                distance;

            this.assert(view, 'you must pass a valid choice');

            if (this.direction === 'horizontal') {
                center = view.frame.left + view.frame.width / 2 + this.contentOffset.left;
                myCenter = this.frame.width / 2;
            } else {
                center = view.frame.top + view.frame.height / 2;
                myCenter = this.frame.height / 2;

            }

            distance = center - myCenter;

            return Math.abs(distance);

        },

        setChoices: function (choices) {

            //make sure nothing left
            this.contentView.removeAllSubViews();

            this._choiceViews = {};
            this.choices = choices;

            var frame = _.clone(this.frame),
                left = 0,
                top = 0,
                options = _.merge({
                    backgroundColor: 'transparent',
                    textAlign:       this.direction === 'horizontal' ? 'center' : 'left'
                }, this.labelOptions || {}),
                all;

            options.frame = mixin(frame, options.frame || {});

            all = _.map(choices, function (value, key) {

                var _options = _.cloneDeep(options);
                _options.text = value;
                _options.selectValue = key;
                _options.frame.top = top;
                _options.frame.left = left;


                if (this.direction === 'horizontal') {
                    left += _options.frame.width;
                } else {
                    top += _options.frame.height;
                }

                //grow our content frame
                this.contentView.frame.width = Math.max(this.contentView.frame.width, _options.frame.left + _options.frame.width);
                this.contentView.frame.height = Math.max(this.contentView.frame.height, _options.frame.top + _options.frame.height);

                return this.vc.forgeView('LabelView', _options).then(function (v) {

                    this.addSubView(v);
                    this._choiceViews[key] = v;

                    return v;

                }.bind(this));


            }, this);

            return this.all(all);

        },

        render: function () {


            var outer = this.frame.width / 2;

            if(this.fadeOptions) {

                _.each(this._choiceViews, function (view, choice) {

                    var distance = this.optionDistanceFromCenter(choice),
                        inner    = 0,
                        alpha    = 0,
                        delta;

                    //distance will fade out starting at 300 and be gone by 900
                    if(distance <= inner) {
                        alpha = 1;
                    } else if (distance >= outer) {
                        alpha = 0;
                    } else {

                        delta = distance - inner;
                        alpha = 1 - (delta / (outer - inner));

                    }

                    view.alpha = alpha;

                }, this);
            }


            return this.inherited(arguments);
        },

        setValue: function (value) {
            this.value = value;
        }

    });

});