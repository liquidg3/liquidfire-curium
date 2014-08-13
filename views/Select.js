define(['altair/facades/declare',
    'altair/facades/mixin',
    './Scroll',
    'lodash'
], function (declare, mixin, Scroll, _) {

    return declare([Scroll], {

        choices:            null,
        labelOptions:       null,
        fadeOptions:        false,  //should options fade as they reach the edge
        selectionPressure:  0,      //0 to 1
        selectionThreshold: 0.8,    //how much pressure must be applied to count as a valid selection?
        maxSelectionPull:   100,
        deferred:           null, //created on focus(), resolved on release()


        _choiceViews:       null,   //all the labels
        _releasing:         null,   //has someone applied pressure, then released?

        startup: function (options) {

            var _options = options || this.options || {};

            if (this.choices) {
                this.setChoices(this.choices);
            }

            return this;


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

            _.each(choices, function (value, key) {

                var _options = _.cloneDeep(options),
                    labelView;

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
                this.contentView.frame.width    = Math.max(this.contentView.frame.width, _options.frame.left + _options.frame.width);
                this.contentView.frame.height   = Math.max(this.contentView.frame.height, _options.frame.top + _options.frame.height);

                this._choiceViews[key] = labelView = this.vc.forgeView('Label', _options);
                this.addSubView(labelView);

                return labelView;


            }, this);

            return this;

        },

        render: function (context, time) {

            var outer = this.frame.width / 2;

            if (!this._releasing) {
                context.translate(0, this.selectionPressure * this.maxSelectionPull);
            }

            if (this.fadeOptions) {

                _.each(this._choiceViews, function (view, choice) {

                    var distance = this.optionDistanceFromCenter(choice),
                        inner    = 0,
                        alpha    = 0,
                        delta;

                    //distance will fade out starting at 300 and be gone by 900
                    if (distance <= inner) {
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

        selectedChoiceView: function () {
            return this._choiceViews[this.selectedChoice()];
        },

        selectedIndex: function () {
            return Math.round((this.contentOffset.left / this.contentView.frame.width) * Object.keys(this.choices).length) * -1;
        },

        selectedChoice: function () {
            return Object.keys(this.choices)[this.selectedIndex()];
        },

        setValue: function (value) {
            this.value = value;
        },

        release: function () {

            this._releasing = true;

            this.__selected = this.selectedChoiceView();

            this.animate({
                '__selected.frame.top': - 400,
                '__selected.alpha': 0
            }, 200).then(function () {

                this._releasing = false;

                this.__selected.frame.top = 0;
                this.__selected.alpha = 1;
                this.__selected = null;

                this.deferred.resolve(this.selectedChoice());
                this.deferred   = null;

            }.bind(this));

            return this.deferred;

        },

        focus: function () {

            this.deferred = new this.Deferred();

            _.each(this._choiceViews, function (view) {
                view.frame.top = 0;
            });

            return this.deferred;

        }

    });

});