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
        debounceDuration: 50,
        precision: 4,
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

            var lastPosition,
                currentPosition,
                nextPosition,
                currentDirection,
                collisionData = [],
                view = this.view;



            if (!this.lastFrame) {
                return this.inherited(arguments);
            }

            if (!this.enabled) {
                return;
            }

            //@todo: test that removing this check and it's related property doesnt break anything else
            if (!this.calculate) {
                return;
            }


            lastPosition = {
                x: this.lastFrame.left,
                y: this.lastFrame.top

            };

            currentPosition = {
                x: view.frame.left,
                y: view.frame.top

            };

            nextPosition = {
                x: currentPosition.x + (currentPosition.x - lastPosition.x),
                y: currentPosition.y + (currentPosition.y - lastPosition.y)

            };

            currentDirection = {
                x: nextPosition.x - lastPosition.x,  //>0 means right
                y: nextPosition.y - lastPosition.y   //>0 means down

            };
//console.log('this frame', view.frame);
//console.log('lastPosition',lastPosition);
//console.log('currentPosition', currentPosition);
//console.log('nextPosition', nextPosition);

            _.each(this.registry[this.group], function (collision) {

                if (!collision) {return;} //paddle may dissapear just after collision?

                var v = collision.view,
                    collisionX,
                    collisionY;

                if (v && v !== view && !v.hidden && v.superView) {

                    collisionX = undefined;
                    collisionY = undefined;

                    //moving from left to right
                    if (currentDirection.x > 0 && lastPosition.x < v.frame.left && currentPosition.x + view.frame.width > v.frame.left) {
                        collisionX = v.frame.left;
//console.log('collision moving right');
                    }

                    //moving right to left
                    if (currentDirection.x < 0 && lastPosition.x + view.frame.width > v.frame.left + v.frame.width && currentPosition.x < v.frame.left + v.frame.width) {
                        collisionX = v.frame.left + v.frame.width;
//console.log('collision moving left');
                    }


                    //a potential collision
                    if (collisionX && view.frame.top + view.frame.height > v.frame.top && view.frame.top < v.frame.top + v.frame.height) {
//console.log('a potential collision, tracing it now against', {
//    x: v.frame.left,
//    y: v.frame.top,
///    width: v.frame.width,
//    height: v.frame.height
//});

                        for (var step = 0; step < this.precision; step++) {
                            var rect1 = {
                                x: currentPosition.x + ((currentPosition.x - lastPosition.x) * (step/this.precision)),
                                y: currentPosition.y + ((currentPosition.y - lastPosition.y) * (step/this.precision)),
                                width: view.frame.width,
                                height: view.frame.height

                            };

//console.log( 'rect1', rect1 );

                            var rect2 = {
                                x: v.frame.left,
                                y: v.frame.top,
                                width: v.frame.width,
                                height: v.frame.height
                            };

//console.log( this.rectsOverlap(rect1, rect2));

                            if (this.rectsOverlap(rect1, rect2)) {
                                var thisCollision = {
                                    view:               v,
                                    point:              {x: rect1.x, y: rect1.y},
                                    velocity:           {x: currentDirection.x, y: currentDirection.y},
                                    time:               time,
                                    behavior:           collision
                                };

                                collisionData.push(thisCollision);

                                v.emit('collision', {
                                    collisions:         [{
                                        view:               this.view,
                                        point:              {x: rect2.x, y: rect2.y},
                                        velocity:           {x: 0, y: 0},
                                        time:               time,
                                        behavior:           collision
                                    }],
                                    view:               this.view
                                });

                                this.enabled = false;

                                setTimeout(function () {
                                    this.enabled = true;

                                }.bind(this), this.debounceDuration);

                                break;

                            }

                        }

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
            var rect1CenterPoint,
                rect2CenterPoint,
                axis = {x: false, y: false};


            if (rect1.x + rect1.width < rect2.x || rect1.x > rect2.x + rect2.width || rect1.y + rect1.height < rect2.y || rect1.y > rect2.y + rect2.height) {
                return null;
            }


            //rethink this...   if we are within the horizontal bounds of the colliding frame, then this must be a vertical collisison
            if (rect1.x >= rect2.x && rect1.x + rect1.width <= rect2.x + rect2.width) {
                axis.y = true;
            }

            if (rect1.y >= rect2.y && rect1.y + rect1.height <= rect2.y + rect2.height) {
                axis.x = true;
            }

            rect1CenterPoint = {
                x: rect1.x + (rect1.width / 2),
                y: rect1.y + (rect1.height / 2)
            };

            rect2CenterPoint = {
                x: rect2.x + (rect2.width / 2),
                y: rect2.y + (rect2.height / 2)
            };

            //@tod0: account for frame size ratio, this collision point wont work for frames of the differing size
            return {
                x: (rect1CenterPoint.x + rect2CenterPoint.x) / 2,
                y: (rect1CenterPoint.y + rect2CenterPoint.y) / 2,
                axis: axis
            };

        },

        angle: function (p1, p2) {
            return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI);
        },

        distance: function (p1, p2) {
            var xs = 0,
                ys = 0;

            xs = p2.x - p1.x;
            xs = xs * xs;

            ys = p2.y - p1.y;
            ys = ys * ys;

            return Math.sqrt(xs + ys);
        }

    });

});