﻿'use strict';

PocketCode.merge({

    WaitBrick: (function () {
        WaitBrick.extends(PocketCode.BaseBrick, false);

        function WaitBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WaitBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_wait',
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'WaitBrick'+ PocketCode.WaitBrick.content[1].id,
                        value: '',
                    },
                    {
                        type: 'text',
                        i18n: 'nxt_second_s'
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WaitBrick;
    })(),


    NoteBrick: (function () {
        NoteBrick.extends(PocketCode.BaseBrick, false);

        function NoteBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.NoteBrick)) {
                throw new Error("Invalid argument Model");
            }
            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_note'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'NoteBrick' + PocketCode.NoteBrick.content[1].id,
                        value: '',
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return NoteBrick;
    })(),

    ForeverBrick: (function () {
        ForeverBrick.extends(PocketCode.BaseBrick, false);

        function ForeverBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.ForeverBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_forever',
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: 'brick_loop_end',
                    }
                ]

            };

            var view = new PocketCode.View.LoopBrick(commentedOut, content, true);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return ForeverBrick;
    })(),

    IfThenElseBrick: (function () {
        IfThenElseBrick.extends(PocketCode.BaseBrick, false);

        function IfThenElseBrick(model, commentedOut, elseVisible) {
            if (!(model instanceof PocketCode.Model.IfThenElseBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_if_begin'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'IfThenElseBrick'+ PocketCode.IfThenElseBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'brick_if_begin_second_part'
                    }
                ],
                elseContent: [
                    {
                        type: 'text',
                        i18n: 'brick_if_else'
                    }
                ],
                endContent: [
                    {
                        type: 'text',
                        i18n: 'brick_if_end'
                    }
                ]

            };

            var view = new PocketCode.View.IfThenElseBrick(commentedOut, elseVisible, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return IfThenElseBrick;
    })(),

    //please notice: we evaluate the condition using a timeout equal to minLoopDelay
    //the implementation is equal to the Android implementation- anyway, it's not correct
    //we should? extend our formula to support onChange events- this may cause performance issues, e.g. onChangeHandler on each sensor, sprite property, variable, ..
    WaitUntilBrick: (function () {
        WaitUntilBrick.extends(PocketCode.BaseBrick, false);

        function WaitUntilBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.WaitUntilBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_wait_until'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'WaitUntilBrick'+ PocketCode.WaitUntilBrick.content[1].id,
                        value: '',
                    },
                    {
                        type: 'text',
                        i18n: 'brick_wait_until_second_part'
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return WaitUntilBrick;
    })(),

    RepeatBrick: (function () {
        RepeatBrick.extends(PocketCode.BaseBrick, false);

        function RepeatBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.RepeatBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_repeat'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'RepeatBrick'+ PocketCode.RepeatBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'times_s'
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return RepeatBrick;
    })(),

    RepeatUntilBrick: (function () {
        RepeatUntilBrick.extends(PocketCode.BaseBrick, false);

        function RepeatUntilBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.RepeatUntilBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_repeat_until'
                    },
                    {
                        type: 'formula',
                        id: SmartJs.getNewId(),
                        //name: 'RepeatUntilBrick'+ PocketCode.RepeatUntilBrick.content[1].id,
                        value: ''
                    },
                    {
                        type: 'text',
                        i18n: 'brick_wait_until_second_part'
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return RepeatUntilBrick;
    })(),

    //continue or start scene
    SceneTransitionBrick: (function () {
        SceneTransitionBrick.extends(PocketCode.BaseBrick, false);

        function SceneTransitionBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.SceneTransitionBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_scene_transition'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from scene??
                        //name: 'SceneTransitionBrick'+ PocketCode.SceneTransitionBrick.content[2].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }


        return SceneTransitionBrick;
    })(),

    StartSceneBrick: (function () {
        StartSceneBrick.extends(PocketCode.BaseBrick, false);

        function StartSceneBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.StartSceneBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_scene_start'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from scene??
                        //name: 'StartSceneBrick'+ PocketCode.StartSceneBrick.content[2].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return StartSceneBrick;
    })(),

    CloneBrick: (function () {
        CloneBrick.extends(PocketCode.BaseBrick, false);

        function CloneBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.CloneBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_clone'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from sprites??
                        //name: 'CloneBrick'+ PocketCode.CloneBrick.content[2].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }
        return CloneBrick;
    })(),

    DeleteCloneBrick: (function () {
        DeleteCloneBrick.extends(PocketCode.BaseBrick, false);

        function DeleteCloneBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.DeleteCloneBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_delete_this_clone'
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return DeleteCloneBrick;
    })(),

    StopScriptType: {
        THIS: 1,
        ALL: 2,
        OTHER: 3
    },

    StopScriptBrick: (function () {
        StopScriptBrick.extends(PocketCode.BaseBrick, false);

        function StopScriptBrick(model, commentedOut) {
            if (!(model instanceof PocketCode.Model.StopScriptBrick)) {
                throw new Error("Invalid argument Model");
            }

            var content = {
                content: [
                    {
                        type: 'text',
                        i18n: 'brick_stop_script'
                    },
                    {
                        type: 'lf'
                    },
                    {
                        type: 'select',
                        id: SmartJs.getNewId(), //todo take id from scripts??
                        //name: 'StopScriptBrick'+ PocketCode.StopScriptBrick.content[2].id,
                        value: ''
                    }
                ]
            };

            var view = new PocketCode.View.BaseBrick(PocketCode.View.BrickType.CONTROL, commentedOut, content);
            PocketCode.BaseBrick.call(this, view, model, commentedOut);
        }

        return StopScriptBrick;
    })(),

});
