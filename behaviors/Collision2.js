define(['altair/facades/declare',
    'lodash',
    './_Base'
], function (declare, _, _Base) {

    return declare([_Base], {

        calculate:        false,
        group:            null,
        registry:         {},
        view:             null,
        enabled:          true,
        debounceDuration: 100,  //how long to way before checking for colissions again
        debug:            false,
        constructor: function (options) {

            //add our self to the collision registry
            var _options = options || {
                group: '*'
            };

            //ensure that our group exists in the registry
            this.registry[_options.group] = this.registry[_options.group] || [];
            this.registry[_options.group].push(this);

        },

        step: function (time) {

            var fullFrame,
                right,
                lastRight,
                bottom,
                lastBotton,
                thisCollision,
                collisionData = [],
                view = this.view;


            if (!this.lastFrame || !this.enabled || !this.calculate) {
                return this.inherited(arguments);
            }

            //calculate rect around this and last frame (we could have passed through the paddle between the 2)
            right       = view.frame.left + view.frame.width;
            lastRight   = this.lastFrame.left + this.lastFrame.width;

            bottom      = view.frame.top + view.frame.height;
            lastBotton  = this.lastFrame.top + this.lastFrame.height;

            fullFrame = {
                left: Math.min(this.lastFrame.left, view.frame.left),
                top: Math.min(this.lastFrame.top, view.frame.top)
            };

            fullFrame.width     = Math.max(right, lastRight) - fullFrame.left;
            fullFrame.height    = Math.max(bottom, lastBotton) - fullFrame.top;

            _.each(this.registry[this.group], function (collision) {

                var v = collision && collision.view;

                if (v && v !== view && !v.hidden && v.superView) {

                    if (this.rectsOverlap(fullFrame, v.frame)) {

                        thisCollision = {
                            view:               v,
                            time:               time,
                            behavior:           collision
                        };

                        collisionData.push(thisCollision);

                        v.emit('collision', {
                            view: this.view,
                            collisions: [{
                                view:       this.view,
                                time:       time,
                                behavior:   this
                            }]
                        });


                    }

                }

            }, this);

            if (collisionData.length) {

                view.emit('collision', {
                    collisions:         collisionData,
                    view:               this.view

                });

            }

            return this.inherited(arguments);
        },


        teardown: function () {

            if (this.registry[this.group]) {
                this.registry[this.group].splice(this.registry[this.group].indexOf(this), 1);
            } else {
                console.log('teardown of collision had no group (should never happen)');
            }

            return this.inherited(arguments);

        },

        rectsOverlap: function (rect1, rect2) {

            if (rect1.left + rect1.width < rect2.left || rect1.left > rect2.left + rect2.width || rect1.top + rect1.height < rect2.top || rect1.top > rect2.top + rect2.height) {
                return false;
            }

            return true;

        }



    });

});