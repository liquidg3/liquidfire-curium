define(['altair/facades/declare',
    'lodash',
    './_Base'
], function (declare, _, _Base) {

    return declare([_Base], {

        group: null,
        registry:       {},
        view:           null,

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

            var collisions = [],
                view = this.view;

            //detect collisions with other views of this namespace.
            _.each(this.registry[this.group], function (collision) {

                var v = collision.view,
                    collisionPoint;

                if (v && v !== view) {

                    collisionPoint = this.framesOverlap(view.frame, v.frame);

                    if (collisionPoint) {

                        collisions.push({
                            view:  v,
                            point: collisionPoint,
                            time:  time
                        });

                    }

                }

            }, this);

            if (collisions.length) {

                view.emit('collision', {
                    collisions: collisions,
                    view: view
                });

            }

        },

        teardown: function () {

            if (this.registry[this.group]) {
                this.registry[this.group].splice(this.registry[this.group].indexOf(this), 1);
            } else {
                console.log('teardown of collision had no group (should never happen)');
            }

            return this.inherited(arguments);

        },

        framesOverlap: function (view1, view2) {

            if (view1.left + view2.width < view2.left || view1.left > view2.left + view2.width || view1.top + view2.height < view2.top || view1.top > view2.top + view2.height) {
                return null;
            }

            //an easy way to determine the center of the collision is to take the center points of each rect, and find the center of a line drawn between those points.

            var view1CenterPoint = {
                x: view1.left + (view1.width / 2),
                y: view1.top + (view1.height / 2)
            };

            var view2CenterPoint = {
                x: view2.left + (view2.width / 2),
                y: view2.top + (view2.height / 2)
            };


            return {
                x: (view1CenterPoint.x + view2CenterPoint.x) / 2,
                y: (view1CenterPoint.y + view2CenterPoint.y) / 2
            };

        }

    });

});