define(['altair/facades/declare',
        'lodash',
        './_Base'
    ], function (declare,
             _Base,
             _) {

    return declare([_Base], {
        collisionGroup: null,
        registry: {},
        view: null,

        construct: function (options) {
            this.inherited(arguments);  //do i need this to ensure this.view has been set?

            //add ourself to the collision registry
            var _options = options || {
                collisionGroup: '*'
            };

            this.collisionGroup = _options.collisionGroup;

            //ensoure that our group exists in the registry
            this.registry[this.collisionGroup] = this.registry[this.collisionGroup] || [];

            //add ourself to the registry
            this.registry[this.collisionGroup].push(this.view);

        },

        step: function (view, time) {
            var collisions = [];

            //detect collisions with other views of this namespace.
            _.each(this.registry[this.collisionGroup], function (v) {

                var collisionPoint = this.framesOverlap(view.frame, v.frame);

                if (v !== view && collisionPoint) {
                    collisions.push({
                        view: v,
                        point: collisionPoint,
                        time: time
                    });

                }

            });

            if (collisions.length) {
                view.emit('collision', {
                    'collisions': collisions
                })

            }

        },

        teardown: function () {
            //@todo: find a good way to remove the this.view from this.registry[this.collisionGroup array.

        },

        framesOverlap: function (view1, view2) {
            if( view1.left+view2.width < view2.left || view1.left > view2.left+view2.width || view1.top+view2.height < view2.top || view1.top > view2.top+view2.height) {
                return null;
            }

            //an easy way to determine the center of the collision is to take the center points of each rect, and find the center of a line drawn between those points.

            var view1CenterPoint = {
                x: view1.left+(view1.width/2),
                y: view1.top+(view1.height/2)
            };

            var view2CenterPoint = {
                x: view2.left+(view2.width/2),
                y: view2.top+(view2.height/2)
            };


            return {
                x: (view1CenterPoint.x+view2CenterPoint.x)/2,
                y: (view1CenterPoint.y+view2CenterPoint.y)/2
            };

        }

    });

});