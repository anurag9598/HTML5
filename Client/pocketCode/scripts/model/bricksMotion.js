﻿/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-core.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../../../smartJs/sj-animation.js" />
/// <reference path="../core.js" />
/// <reference path="bricksCore.js" />
'use strict';


PocketCode.Model.merge({

    GoToPositionBrick: (function () {
        GoToPositionBrick.extends(PocketCode.Model.BaseBrick, false);

        function GoToPositionBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
        }

        GoToPositionBrick.prototype._execute = function () {
            var x = this._x.calculate(),
                y = this._y.calculate();
            if (isNaN(x) || isNaN(y))
                this._return(false);
            else
                this._return(this._sprite.setPosition(x, y));
        };

        return GoToPositionBrick;
    })(),

    SetXBrick: (function () {
        SetXBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetXBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._x = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetXBrick.prototype._execute = function () {
            var x = this._x.calculate();
            if (isNaN(x))
                this._return(false);
            else
                this._return(this._sprite.setPositionX(x));
        };

        return SetXBrick;
    })(),

    SetYBrick: (function () {
        SetYBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetYBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._y = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetYBrick.prototype._execute = function () {
            var y = this._y.calculate();
            if (isNaN(y))
                this._return(false);
            else
                this._return(this._sprite.setPositionY(y));
        };

        return SetYBrick;
    })(),

    ChangeXBrick: (function () {
        ChangeXBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeXBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._x = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeXBrick.prototype._execute = function () {
            var x = this._x.calculate();
            if (isNaN(x))
                this._return(false);
            else
                this._return(this._sprite.changePositionX(x));
        };

        return ChangeXBrick;
    })(),

    ChangeYBrick: (function () {
        ChangeYBrick.extends(PocketCode.Model.BaseBrick, false);

        function ChangeYBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._y = new PocketCode.Formula(device, sprite, propObject.value);
        }

        ChangeYBrick.prototype._execute = function () {
            var y = this._y.calculate();
            if (isNaN(y))
                this._return(false);
            else
                this._return(this._sprite.changePositionY(y));
        };

        return ChangeYBrick;
    })(),

    SetRotionStyleBrick: (function () {
        SetRotionStyleBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetRotionStyleBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            if (!propObject)
                this._style = PocketCode.RotationStyle.ALL_AROUND;
            else
                switch (propObject.selected) {  //{ 0: left-right, 1: all around, 2: don't rotate }
                    case 0:
                        this._style = PocketCode.RotationStyle.LEFT_TO_RIGHT;
                        break;
                    case 2:
                        this._style = PocketCode.RotationStyle.DO_NOT_ROTATE;
                        break;
                    default:
                        this._style = PocketCode.RotationStyle.ALL_AROUND;
                        break;
                }
        }

        SetRotionStyleBrick.prototype._execute = function () {
            this._return(this._sprite.setRotationStyle(this._style));
        };

        return SetRotionStyleBrick;
    })(),

    GoToType: {
        POINTER: 1,
        RANDOM: 2,
        SPRITE: 3
    },

    GoToBrick: (function () {
        GoToBrick.extends(PocketCode.Model.BaseBrick, false);

        function GoToBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);


            // this._gameEngine = gameEngine;
            this._scene = scene;
            this._destinationSpriteId = propObject.spriteId;
            switch (propObject.destinationType) {
                case 'pointer':
                    this._type = PocketCode.Model.GoToType.POINTER;
                    break;
                case 'random':
                    this._type = PocketCode.Model.GoToType.RANDOM;
                    break;
                case 'sprite':
                    this._type = PocketCode.Model.GoToType.SPRITE;
                    break;
            }
        }

        GoToBrick.prototype._execute = function () {

            this._return(this._scene.setSpritePosition(this._sprite.id, this._type, this._destinationSpriteId));
        };

        return GoToBrick;
    })(),

    IfOnEdgeBounceBrick: (function () {
        IfOnEdgeBounceBrick.extends(PocketCode.Model.BaseBrick, false);

        function IfOnEdgeBounceBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

        }

        IfOnEdgeBounceBrick.prototype._execute = function () {
            this._return(this._sprite.ifOnEdgeBounce());
        };

        return IfOnEdgeBounceBrick;
    })(),

    MoveNStepsBrick: (function () {
        MoveNStepsBrick.extends(PocketCode.Model.BaseBrick, false);

        function MoveNStepsBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._steps = new PocketCode.Formula(device, sprite, propObject.steps);
        }

        MoveNStepsBrick.prototype._execute = function () {
            var val = this._steps.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.move(val));
        };

        return MoveNStepsBrick;
    })(),

    TurnLeftBrick: (function () {
        TurnLeftBrick.extends(PocketCode.Model.BaseBrick, false);

        function TurnLeftBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        TurnLeftBrick.prototype._execute = function () {
            var val = this._degrees.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.turnLeft(val));
        };

        return TurnLeftBrick;
    })(),

    TurnRightBrick: (function () {
        TurnRightBrick.extends(PocketCode.Model.BaseBrick, false);

        function TurnRightBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        TurnRightBrick.prototype._execute = function () {
            var val = this._degrees.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.turnRight(val));
        };

        return TurnRightBrick;
    })(),

    SetDirectionBrick: (function () {
        SetDirectionBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetDirectionBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degrees = new PocketCode.Formula(device, sprite, propObject.degrees);
        }

        SetDirectionBrick.prototype._execute = function () {
            var val = this._degrees.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.setDirection(val));
        };

        return SetDirectionBrick;
    })(),

    SetDirectionToBrick: (function () {
        SetDirectionToBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetDirectionToBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._spriteId = propObject.spriteId;
        }

        SetDirectionToBrick.prototype._execute = function () {
            this._return(this._sprite.SetDirectionTo(this._spriteId));
        };

        return SetDirectionToBrick;
    })(),

    GlideToBrick: (function () {
        GlideToBrick.extends(PocketCode.Model.ThreadedBrick, false);

        function GlideToBrick(device, sprite, propObject) {
            PocketCode.Model.ThreadedBrick.call(this, device, sprite, propObject);

            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
            this._velocity = 0; //initial
            this._paused = false;
        }

        GlideToBrick.prototype.merge({
            _updatePositionHandler: function (e) {
                this._sprite.setPosition(e.value.x, e.value.y, true, this._cancel.bind(this, this._callId), this._velocity);
            },
            //_returnHandler: function (e) {
            //    //var callId = e.callId;
            //    this._return(e.callId, true);
            //},
            _cancel: function (callId) {
                var po = this._pendingOps[callId];
                if (!po)    //make sure a internaly canceled op does not get cnaceled again from sprite callback
                    return;
                po.animation.stop();
                this._return(callId, true);
            },
            _execute: function (callId) {
                this._callId = callId;  //in this brick there can only be one active animation
                var sprite = this._sprite;

                var po;
                //terminate pending ops to avoid conflicts
                for (var p in this._pendingOps)
                    if (p != callId)
                        this._cancel(p);

                po = this._pendingOps[callId];
                po.paused = this._paused;
                var duration = this._duration.calculate(),
                    x = this._x.calculate(),
                    y = this._y.calculate();
                if (isNaN(duration)) {
                    if (!isNaN(x) && !isNaN(y))
                        this._updatePositionHandler({ value: { x: x, y: y } });
                    this._return(callId, false);
                    return;
                }

                var dx = Math.abs(x - sprite.positionX),
                    dy = Math.abs(y - sprite.positionY);
                this._velocity = Math.sqrt(dx * dx + dy * dy) / duration;

                var animation = new SmartJs.Animation.Animation2D({ x: sprite.positionX, y: sprite.positionY }, { x: x, y: y }, Math.round(duration * 1000), SmartJs.Animation.Type.LINEAR2D);
                animation.onUpdate.addEventListener(new SmartJs.Event.EventListener(this._updatePositionHandler, this));
                animation.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._return.bind(this, callId)));
                po.animation = animation;
                animation.start({ callId: callId });
                if (this._paused)
                    animation.pause();
            },
            pause: function () {
                this._paused = true;
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    if (po.animation)
                        po.animation.pause();
                    po.paused = true;
                }
            },
            resume: function () {
                this._paused = false;
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    if (po.paused) {
                        po.paused = false;
                        if (po.animation)
                            po.animation.resume();
                    }
                }
            },
            stop: function () {
                this._paused = false;
                var po, pos = this._pendingOps;
                for (var p in pos) {
                    if (!pos.hasOwnProperty(p))
                        continue;
                    po = pos[p];
                    if (po.animation)
                        po.animation.stop();
                }
                this._pendingOps = {};
            },
        });

        return GlideToBrick;
    })(),

    GoBackBrick: (function () {
        GoBackBrick.extends(PocketCode.Model.BaseBrick, false);

        function GoBackBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._layers = new PocketCode.Formula(device, sprite, propObject.layers);
        }

        GoBackBrick.prototype._execute = function () {
            var val = this._layers.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._sprite.goBack(val));
        };

        return GoBackBrick;
    })(),

    ComeToFrontBrick: (function () {
        ComeToFrontBrick.extends(PocketCode.Model.BaseBrick, false);

        function ComeToFrontBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

        }

        ComeToFrontBrick.prototype._execute = function () {
            this._return(this._sprite.comeToFront());
        };

        return ComeToFrontBrick;
    })(),

    VibrationBrick: (function () {
        VibrationBrick.extends(PocketCode.Model.BaseBrick, false);

        function VibrationBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._duration = new PocketCode.Formula(device, sprite, propObject.duration);
            this._device.vibrate();    //call on ctr to notify our device this feature is in use
        }

        VibrationBrick.prototype._execute = function () {
            var val = this._duration.calculate();
            if (isNaN(val))
                this._return(false);
            else
                this._return(this._device.vibrate(val));
        };

        return VibrationBrick;
    })(),


    /* PHYSICS BRICKS */
    SetPhysicsObjectTypeBrick: (function () {
        SetPhysicsObjectTypeBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetPhysicsObjectTypeBrick(device, sprite, physicsWorld, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);
            this._physicsWorld = physicsWorld;

            if (!propObject) {
                this._physicsType = PocketCode.MovementStyle.NONE;
            }
            else {
                switch (propObject.physicsType) {
                    case 'FIXED':
                        this._physicsType = PocketCode.MovementStyle.FIXED;
                        break;
                    case 'DYNAMIC':
                        this._physicsType = PocketCode.MovementStyle.DYNAMIC;
                        break;
                    default:
                        this._physicsType = PocketCode.MovementStyle.NONE;
                        break;
                }
            }
        }

        SetPhysicsObjectTypeBrick.prototype._execute = function () {
            //TODO:
            var physicsEnabled = this._physicsType !== PocketCode.MovementStyle.NONE;

            this._physicsWorld.subscribe(this._sprite.id, physicsEnabled);
            this._sprite.movementStyle = this._physicsType;

            this._return(false);
        };

        return SetPhysicsObjectTypeBrick;
    })(),

    SetVelocityBrick: (function () {
        SetVelocityBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetVelocityBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
        }

        SetVelocityBrick.prototype._execute = function () {
            var x = this._x.calculate(),
                y = this._y.calculate();
            if (isNaN(x) || isNaN(y))
                this._return(false);

            this._sprite.setVelocity(x, y); //TODO: velocity/sek ->direction?
            this._return(false);
        };

        return SetVelocityBrick;
    })(),

    RotationSpeedLeftBrick: (function () {
        RotationSpeedLeftBrick.extends(PocketCode.Model.BaseBrick, false);

        function RotationSpeedLeftBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degreesPerSecond = new PocketCode.Formula(device, sprite, propObject.degreesPerSec);
        }

        RotationSpeedLeftBrick.prototype._execute = function () {
            var degreesPerSecond = this._degreesPerSecond.calculate();

            if (isNaN(degreesPerSecond))
                this._return(false);

            this._sprite.turnNDegreePerSecond = -degreesPerSecond;
            this._return(false);
        };

        return RotationSpeedLeftBrick;
    })(),

    RotationSpeedRightBrick: (function () {
        RotationSpeedRightBrick.extends(PocketCode.Model.BaseBrick, false);

        function RotationSpeedRightBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._degreesPerSecond = new PocketCode.Formula(device, sprite, propObject.degreesPerSec);
        }

        RotationSpeedRightBrick.prototype._execute = function () {
            var degreesPerSecond = this._degreesPerSecond.calculate();

            if (isNaN(degreesPerSecond))
                this._return(false);

            this._sprite.turnNDegreePerSecond = degreesPerSecond;
            this._return(false);
        };

        return RotationSpeedRightBrick;
    })(),

    SetGravityBrick: (function () {
        SetGravityBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetGravityBrick(device, sprite, scene, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._scene = scene;
            this._x = new PocketCode.Formula(device, sprite, propObject.x);
            this._y = new PocketCode.Formula(device, sprite, propObject.y);
        }

        SetGravityBrick.prototype._execute = function () {
            var x = this._x.calculate(),
                y = this._y.calculate();
            if (isNaN(x) || isNaN(y))
                this._return(false);

            this._scene.setGravity(x, y);
            this._return(false);
        };

        return SetGravityBrick;
    })(),

    SetMassBrick: (function () {
        SetMassBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetMassBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._mass = new PocketCode.Formula(device, sprite, propObject.value);
        }

        SetMassBrick.prototype._execute = function () {
            var mass = this._mass.calculate();

            if (isNaN(mass))
                this._return(false);

            this._sprite.mass = mass;
            this._return(false);
        };

        return SetMassBrick;
    })(),

    SetBounceFactorBrick: (function () {
        SetBounceFactorBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetBounceFactorBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._bounceFactor = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        SetBounceFactorBrick.prototype._execute = function () {
            var bounceFactor = this._bounceFactor.calculate();

            if (isNaN(bounceFactor))
                this._return(false);

            this._sprite.bounceFactor = bounceFactor;
            this._return(false);
        };

        return SetBounceFactorBrick;
    })(),

    SetFrictionBrick: (function () {
        SetFrictionBrick.extends(PocketCode.Model.BaseBrick, false);

        function SetFrictionBrick(device, sprite, propObject) {
            PocketCode.Model.BaseBrick.call(this, device, sprite, propObject);

            this._friction = new PocketCode.Formula(device, sprite, propObject.percentage);
        }

        SetFrictionBrick.prototype._execute = function () {
            var friction = this._friction.calculate();
            if (isNaN(friction))
                this._return(false);

            this._sprite.friction = friction;
            this._return(false);
        };

        return SetFrictionBrick;
    })(),

});
