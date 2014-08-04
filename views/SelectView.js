define(['altair/facades/declare',
        'altair/facades/mixin',
        './ScrollView',
        'lodash'
], function (declare,
             mixin,
             ScrollView,
             _) {

    return declare([ScrollView], {


        choices: null,
        value:   null,
        labelOptions: null,

        _choiceViews: null,

        startup: function (options) {

            var _options = options || this.options || {};

            return this.inherited(arguments).then(function () {

                if(this.choices) {

                    return this.setChoices(_options.choices).then(function () {
                        return this;
                    }.bind(this));

                } else {
                    return this;
                }


            }.bind(this));
        },


        setChoices: function (choices) {

            //make sure nothing left in it
            this.contentView.removeAllSubViews();

            this._choiceViews   = [];
            this.choices        =  choices;

            var frame           = _.clone(this.frame),
                left            = 0,
                top             = 0,
                options         = this.labelOptions || {},
                all;

            if (!options.frame) {
                options.frame = {};
            }

            options.frame = mixin(frame, options.frame);

            all = _.map(choices, function (value, key) {

                var _options            = _.cloneDeep(options);
                _options.text           = value;
                _options.selectValue    = key;
                _options.frame.top      = top;
                _options.frame.left     = left;

                return this.vc.forgeView('LabelView', _options).then(function (v) {

                    this.contentView.addSubView(v);
                    this._choiceViews.push(v);

                    return v;

                }.bind(this));

                if (this.direction === 'horizontal') {
                    left += _options.frame.width;
                } else {
                    top += _options.frame.height;
                }

            }, this);

            return this.all(all);

        },

        setValue: function (value) {
            this.value = value;
        }

    });

});