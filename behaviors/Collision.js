define(['altair/facades/declare',
    'lodash',
    './_Base'
], function (declare, _, _Base) {

    return declare([_Base], {

        calculate:      false,
        group:          null,
        registry:       {},
        view:           null,
        enabled:        true,

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
            if (!this.enabled) { return }


            if (!this.calculate) {
                return;
            }

            var collisions  = [],
                view        = this.view,
                angleOfIncidence,
                angleOfReflection;

            //detect collisions with other views of this namespace.
            _.each(this.registry[this.group], function (collision) {

                var v = collision.view,
                    collisionPoint,
                    lastPosition,
                    thisPosition,
                    collisionData,
                    directionCoords;

                if (v && v !== view && !v.hidden && v.superView) {

                    collisionPoint = this.framesOverlap(view.frame, v.frame);

                    if (collisionPoint) {

                        //calculate angle of incidence and angle of reflection here,

                        //lastPosition = {
                        //    x: this.lastFrame.left,
                        //    y: this.lastFrame.top
//
  //                      };

//                        thisPosition = {
  //                          x: view.frame.left,
    //                        y: view.frame.top
//
  //                      };

                        //angleOfIncidence = this.angle(lastPosition, thisPosition);
                        //angleOfReflection = (angleOfIncidence - 180);      //flip then invert the angle of incidence to create our angle of reflection suggestion.

                        //directionCoords = {
                        //    x: Math.cos(angleOfIncidence * (Math.PI / 180)) * 2,
                        //    y: Math.sin(angleOfIncidence * (Math.PI / 180)) * 2
                        //};

                        //if (collisionPoint.axis.x) {
                        //    directionCoords.x = -directionCoords.x;
                        //}

                        //if (collisionPoint.axis.y) {
                        //    directionCoords.y = -directionCoords.y;
                        //}

                        //angleOfReflection = this.angle({ x: 0, y: 0 }, directionCoords);

                        //reset view to last known non-colliding position
                        //view.frame.left = lastPosition.x;
                        //view.frame.top  = lastPosition.y;

                        collisionData = {
                            view:               v,
                            point:              collisionPoint,
                            //angleOfReflection:  angleOfReflection,
                            //angleOfIncidence:   angleOfIncidence,
                            time:               time,
                            behavior:           collision
                        };

                        collisions.push(collisionData);

                        //if the collided behavior is not calculating, lets emit the event to its view
                        if (!collision.calculate) {

                            v.emit('collision', {
                                collisions:         [collisionData],
                                view:               this.view,
                                collisionPoint:     collisionPoint
                                //angleOfReflection:  angleOfReflection,
                                //angleOfIncidence:   angleOfIncidence
                            });


                        }


                    }

                }

            }, this);


            //do we have collisions? emit them!
            if (collisions.length) {

                view.emit('collision', {
                    collisions: collisions,
                    view: view
                    //angleOfReflection:  angleOfReflection,
                    //angleOfIncidence:   angleOfIncidence
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

        framesOverlap: function (view1, view2) {
            var view1CenterPoint,
                view2CenterPoint,
                axis = {x: false, y: false};


            if (view1.left + view1.width < view2.left || view1.left > view2.left + view2.width || view1.top + view1.height < view2.top || view1.top > view2.top + view2.height) {
                return null;
            }


            //rethink this...   if we are within the horizontal bounds of the colliding frame, then this must be a vertical collisison
            if (view1.left >= view2.left && view1.left + view1.width <= view2.left + view2.width) {
                axis.y = true;
            }

            if (view1.top >= view2.top && view1.top + view1.height <= view2.top + view2.height) {
                axis.x = true;
            }

            view1CenterPoint = {
                x: view1.left + (view1.width / 2),
                y: view1.top + (view1.height / 2)
            };

            view2CenterPoint = {
                x: view2.left + (view2.width / 2),
                y: view2.top + (view2.height / 2)
            };

            //@tod0: account for frame size ratio, this collision point wont work for frames of the differing size
            return {
                x: (view1CenterPoint.x + view2CenterPoint.x) / 2,
                y: (view1CenterPoint.y + view2CenterPoint.y) / 2,
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
        },

        debounceDuration: function (durationMilliseconds) {
            this.enabled = false;

            setTimeout(function () {
                this.enabled = true;
            }.bind(this), durationMilliseconds);
        }

    });

});