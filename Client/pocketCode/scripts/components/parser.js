﻿/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../core.js" />
/// <reference path="../model/bricksCore.js" />
/// <reference path="../model/bricksEvent.js" />
/// <reference path="../model/bricksControl.js" />
/// <reference path="../model/bricksSound.js" />
/// <reference path="../model/bricksMotion.js" />
/// <reference path="../model/bricksPen.js" />
/// <reference path="../model/bricksData.js" />
/// <reference path="../model/userVariable.js" />
/// <reference path="../component/sprite.js" />
'use strict';

PocketCode.merge({

    SpriteFactory: (function () {
        SpriteFactory.extends(SmartJs.Core.Component);

        function SpriteFactory(device, gameEngine, soundMgr, minLoopCycleTime) {
            this._device = device;
            this._gameEngine = gameEngine;
            this._soundMgr = soundMgr;
            this._minLoopCycleTime = minLoopCycleTime || 20;

            this._unsupportedBricks = [];

            //we use the brickFactory events here
            this._onSpriteLoaded = new SmartJs.Event.Event(this);
            this._onUnsupportedBricksFound = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(SpriteFactory.prototype, {
            onSpriteLoaded: {
                get: function () { return this._onSpriteLoaded; },
            },
            onUnsupportedBricksFound: {
                get: function () { return this._onUnsupportedBricksFound; },
            },
        });

        //methods
        SpriteFactory.prototype.merge({
            create: function (currentScene, broadcastMgr, /*bricksLoaded,*/ jsonSprite, asBackground) {
                if (!(currentScene instanceof PocketCode.Model.Scene))
                    throw new Error('invalid argument: current scene');
                if (!(broadcastMgr instanceof PocketCode.BroadcastManager))
                    throw new Error('invalid argument: broadcast manager');
                if (typeof jsonSprite !== 'object' || jsonSprite instanceof Array)
                    throw new Error('invalid argument: expected type: object');

                //this._bricksLoaded = 0;
                this._unsupportedBricks = [];
                //bricksLoaded = bricksLoaded || 0;
                var brickFactory = new PocketCode.BrickFactory(this._device, this._gameEngine, currentScene, broadcastMgr, this._soundMgr, /*this._bricksTotal, bricksLoaded,*/ this._minLoopCycleTime);
                //brickFactory.onProgressChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onProgressChange.dispatchEvent(e); }, this));
                brickFactory.onUnsupportedBrickFound.addEventListener(new SmartJs.Event.EventListener(function (e) { this._unsupportedBricks.push(e.unsupportedBrick); }, this));

                var sprite = asBackground ?
                    new PocketCode.Model.BackgroundSprite(this._gameEngine, currentScene, jsonSprite) :
                    new PocketCode.Model.Sprite(this._gameEngine, currentScene, jsonSprite);
                var scripts = [];
                for (var i = 0, l = jsonSprite.scripts.length; i < l; i++)
                    scripts.push(brickFactory.create(sprite, jsonSprite.scripts[i]));

                //this._bricksLoaded += brickFactory.bricksParsed;
                sprite.scripts = scripts;

                this._onSpriteLoaded.dispatchEvent({ bricksLoaded: brickFactory.bricksParsed });
                brickFactory.dispose();
                if (this._unsupportedBricks.length > 0)
                    this._onUnsupportedBricksFound.dispatchEvent({ unsupportedBricks: this._unsupportedBricks });
                return sprite;
            },
            createClone: function (currentScene, broadcastMgr, jsonSprite, definition) {
                if (!(currentScene instanceof PocketCode.Model.Scene))
                    throw new Error('invalid argument: current scene');
                if (!(broadcastMgr instanceof PocketCode.BroadcastManager))
                    throw new Error('invalid argument: broadcast manager');
                if (typeof jsonSprite !== 'object' || jsonSprite instanceof Array)
                    throw new Error('invalid argument: expected type: object');

                var brickFactory = new PocketCode.BrickFactory(this._device, this._gameEngine, currentScene, broadcastMgr, this._soundMgr, /*this._bricksTotal, 0,*/ this._minLoopCycleTime);
                var clone = new PocketCode.Model.SpriteClone(this._gameEngine, currentScene, jsonSprite, definition);
                var scripts = [];
                for (var i = 0, l = jsonSprite.scripts.length; i < l; i++)
                    scripts.push(brickFactory.create(clone, jsonSprite.scripts[i]));

                brickFactory.dispose();
                clone.scripts = scripts;
                return clone;
            },
            dispose: function () {
                this._device = undefined;
                this._gameEngine = undefined;
                this._soundMgr = undefined;
                SmartJs.Core.Component.prototype.dispose.call(this);
            },
        });

        return SpriteFactory;
    })(),


    BrickFactory: (function () {
        BrickFactory.extends(SmartJs.Core.Component);

        function BrickFactory(device, gameEngine, scene, broadcastMgr, soundMgr, minLoopCycleTime) {
            this._device = device;
            this._gameEngine = gameEngine;
            this._scene = scene;
            this._broadcastMgr = broadcastMgr;
            this._soundMgr = soundMgr;
            this._minLoopCycleTime = minLoopCycleTime;

            //this._total = totalCount;
            this._parsed = 0;//loadedCount;
            //this._updatePercentage = 0.0;
            //this._unsupportedBricks = [];

            //this._onProgressChange = new SmartJs.Event.Event(this);
            this._onUnsupportedBrickFound = new SmartJs.Event.Event(this);
        }

        //events
        Object.defineProperties(BrickFactory.prototype, {
            //onProgressChange: {
            //    get: function () { return this._onProgressChange; },
            //    //enumerable: false,
            //    //configurable: true,
            //},
            onUnsupportedBrickFound: {
                get: function () { return this._onUnsupportedBrickFound; },
                //enumerable: false,
                //configurable: true,
            },
        });

        //properties
        Object.defineProperties(BrickFactory.prototype, {
            bricksParsed: {
                get: function () { return this._parsed; },
            },
        });

        //methods
        BrickFactory.prototype.merge({
            create: function (currentSprite, jsonBrick) {
                if (jsonBrick.id && jsonBrick.type !== 'UserScript')
                    this._currentScriptId = jsonBrick.id;
                var type = jsonBrick.type + 'Brick';
                var brick = undefined;

                switch (type) {
                    //not yet planed?:
                    //case 'ResetTimerBrick':
                    //    brick = new PocketCode.Model[type](this._device, currentSprite, this._gameEngine.projectTimer, jsonBrick);
                    //    break;
                    //case 'SetCameraTransparencyBrick':  //add scene to cntr - access background

                    //not part of current Android release:
                    case 'UserScriptBrick':
                    case 'CallUserScriptBrick':

                    //in development:
                    //case 'WhenConditionMetBrick':
                    //case 'StopScriptBrick':
                    //case 'SetBackgroundBrick':
                    case 'WhenCollisionBrick':
                    //case 'WhenStartAsCloneBrick':
                    //case 'CloneBrick':
                    //case 'DeleteCloneBrick':
                    case 'SetPhysicsObjectTypeBrick':
                    case 'SetVelocityBrick':
                    case 'RotationSpeedLeftBrick':
                    case 'RotationSpeedRightBrick':
                    case 'SetGravityBrick':
                    case 'SetMassBrick':
                    case 'SetBounceFactorBrick':
                    case 'SetFrictionBrick':

                    case 'SelectCameraBrick':
                    case 'CameraBrick':

                    //case 'PlaySoundAndWaitBrick':
                    //case 'SpeakAndWaitBrick':
                        brick = new PocketCode.Model.UnsupportedBrick(this._device, currentSprite, jsonBrick);
                        break;
                        //    //^^ in development: delete/comment out bricks for testing purpose (but do not push these changes until you've finished implementation + testing)

                        //active:
                    case 'WhenCollisionBrick':
                    case 'SetPhysicsObjectTypeBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene.physicsWorld, jsonBrick);
                        break;

                    case 'WhenProgramStartBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick, this._scene.onStart);
                        break;

                    case 'WhenActionBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick, this._scene.onSpriteTappedAction);
                        break;
                    case 'WhenTouchBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick, this._scene.onTouchStartAction);
                        //switch (jsonBrick.action) {
                        //    case 'Tapped':
                        //        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick, this._scene.onSpriteTappedAction);
                        //        break;
                        //    case 'TouchStart':
                        //        brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick, this._scene.onTouchStartAction);
                        //        break;
                        //}
                        break;

                    case 'CloneBrick':
                    case 'DeleteCloneBrick':
                    case 'SetGravityBrick':
                    case 'SetBackgroundBrick':
                    case 'SetBackgroundAndWaitBrick':
                    case 'ClearBackgroundBrick':
                    case 'GoToBrick':
                    case 'AskSpeechBrick':
                    case 'AskBrick':
                    //bubbles
                    case 'SayBrick':
                    case 'SayForBrick':
                    case 'ThinkBrick':
                    case 'ThinkForBrick':
                    //background
                    case 'SetBackgroundByIndexBrick':
                    case 'WhenBackgroundChangesToBrick':
                        if (type == 'AskSpeechBrick')  //providing a ask dialog instead the typical askSpeech brick
                            type = 'AskBrick';
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene, jsonBrick);
                        break;

                    case 'BroadcastBrick':
                        //type = 'BroadcastAndWaitBrick'; //fix to make sure we are catroid compatible?
                    case 'BroadcastAndWaitBrick':
                    case 'WhenBroadcastReceiveBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._broadcastMgr, jsonBrick);
                        break;

                    case 'PlaySoundAndWaitBrick':   //disabled
                    case 'SpeakAndWaitBrick':
                        brick = new PocketCode.Model.UnsupportedBrick(this._device, currentSprite, jsonBrick);
                        break;

                    case 'PlaySoundBrick':
                    case 'PlaySoundAndWaitBrick':
                    case 'StopAllSoundsBrick':
                    case 'SpeakBrick':
                    case 'SpeakAndWaitBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene.id, this._soundMgr, jsonBrick);
                        break;

                    case 'SetVolumeBrick':
                    case 'ChangeVolumeBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._soundMgr, jsonBrick);
                        break;

                    case 'MoveNStepsBrick':
                    case 'WaitUntilBrick':
                    case 'ForeverBrick':
                    case 'RepeatBrick':
                    case 'RepeatUntilBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._minLoopCycleTime, jsonBrick);
                        break;

                    case 'WhenConditionMetBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._minLoopCycleTime, jsonBrick, this._scene.onStart);
                        break;
                        
                    case 'StartSceneBrick':
                    case 'SceneTransitionBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._gameEngine, jsonBrick);
                        break;

                    case 'StopScriptBrick':
                        brick = new PocketCode.Model[type](this._device, currentSprite, this._scene, this._currentScriptId, jsonBrick);
                        break;

                        //control: WaitBrick, NoteBrick, WhenStartAsCloneBrick, IfThenElse
                        //motion: GoToPositionBrick, SetXBrick, SetYBrick, ChangeXBrick, ChangeYBrick, SetRotionStyleBrick, IfOnEdgeBounce
                        //        TurnLeft, TurnRight, SetDirection, SetDirectionTo, SetRotationStyle, GlideTo, GoBack, ComeToFront, Vibration
                        //motion physics: SetVelocity, RotationSpeedLeft, RotationSpeedRight, SetMass, SetBounceFactor, SetFriction
                        //look: SetLook, SetLookByIndex, NextLook, PreviousLook, SetSize, ChangeSize, Hide, Show, Say, SayFor, Think, ThinkFor, SetTransparency, 
                        //      .. all filters, .. ClearGraphicEffect
                        //pen: PenDown, PenUp, SetPenSize, SetPenColor, Stamp
                        //data: SetVariable, ChangeVariable, ShowVariable, HideVariable, AppendToList, DeleteAtList, InsertAtList, ReplaceAtList
                    default:
                        if (PocketCode.Model[type])
                            brick = new PocketCode.Model[type](this._device, currentSprite, jsonBrick);
                        else
                            brick = new PocketCode.Model.UnsupportedBrick(this._device, currentSprite, jsonBrick);
                }

                if (brick instanceof PocketCode.Model.UnsupportedBrick) {
                    //this._unsupportedBricks.push(brick);
                    this._onUnsupportedBrickFound.dispatchEvent({ unsupportedBrick: brick });
                }
                else {
                    //load sub bricks
                    //if (!(brick instanceof PocketCode.Model.UnsupportedBrick)) {
                    if (jsonBrick.bricks) { //all loops
                        brick._bricks = this._createList(currentSprite, jsonBrick.bricks);
                    }
                    else if (jsonBrick.ifBricks) {  // && jsonBrick.elseBricks) {  //if then else
                        brick._ifBricks = this._createList(currentSprite, jsonBrick.ifBricks);
                        brick._elseBricks = this._createList(currentSprite, jsonBrick.elseBricks);
                    }
                }

                this._parsed++; //this has to be incremented after creating the sub items to avoid the unsupported brick event trigger more than once
                //this._updateProgress();

                //if (this._total === this._parsed && this._unsupportedBricks.length > 0)
                //    this._onUnsupportedBricksFound.dispatchEvent({ unsupportedBricks: this._unsupportedBricks });

                return brick;
            },
            _createList: function (currentSprite, jsonBricks) {    //returns bricks as a BrickContainer
                var bricks = [];
                for (var i = 0, l = jsonBricks.length; i < l; i++)
                    bricks.push(this.create(currentSprite, jsonBricks[i]));
                return new PocketCode.Model.BrickContainer(bricks);
            },
            //_updateProgress: function () {
            //    var progress = 100.0 / this._total * this._parsed;
            //    //we do not want to trigger several hundred progress updates.. every 5% should be enough
            //    //todo introduce new condition to update
            //    //if (this._total === this._parsed || (progress - this._updatePercentage) >= 5.0) {
            //    this._updatePercentage = progress;
            //    progress = Math.round(progress * 10) / 10;  //show only one decimal place
            //    this._onProgressChange.dispatchEvent({ progress: progress, parsed: this._parsed });
            //    // }

            //},
            dispose: function () {
                this._device = undefined;
                this._gameEngine = undefined;
                this._scene = undefined;
                this._broadcastMgr = undefined;
                this._soundMgr = undefined;
                SmartJs.Core.Component.prototype.dispose.call(this);
            }
        });

        return BrickFactory;
    })(),


    FormulaParser: (function () {
        function FormulaParser() {
            this._isStatic = false;
        }

        FormulaParser.prototype.merge({
            //todo geti18nJson function statt getUiString
            //return: object statt string

            parsei18nJson: function(jsonFormula, variableNames, listNames){
                if (typeof variableNames !== 'object')
                    throw new Error('invalid argument: variableNames (lookup dictionary required)');
                if (typeof listNames !== 'object')
                    throw new Error('invalid argument: listNames (lookup dictionary required)');
                this._variableNames = variableNames;
                this._listNames = listNames;

                return this._parseJsonType(jsonFormula, true);
            },/*
            getUiString: function (jsonFormula, variableNames, listNames) {
                if (typeof variableNames !== 'object')
                    throw new Error('invalid argument: variableNames (lookup dictionary required)');
                if (typeof listNames !== 'object')
                    throw new Error('invalid argument: listNames (lookup dictionary required)');
                this._variableNames = variableNames;
                this._listNames = listNames;

                return this._parseJsonType(jsonFormula, true);
            },*/
            parseJson: function (jsonFormula) {
                this._isStatic = true;
                var formulaString = this._parseJsonType(jsonFormula);
                return {
                    calculate: new Function(
                        'uvh',
                        'uvh || (uvh = this._sprite); ' +
                        'return ' + formulaString + ';'),
                    isStatic: this._isStatic
                };
            },

            _parseJsonType: function (jsonFormula, asUiObject) {
                if (jsonFormula === null){
                    if(asUiObject)
                        return;
                    else
                        return '';
                }


                /* package org.catrobat.catroid.formulaeditor: class FormulaElement: enum ElementType
                *  OPERATOR, FUNCTION, NUMBER, SENSOR, USER_VARIABLE, BRACKET, STRING, COLLISION_FORMULA
                */
                switch (jsonFormula.type) {
                    case 'OPERATOR':
                        return this._parseJsonOperator(jsonFormula, asUiObject);

                    case 'FUNCTION':
                        return this._parseJsonFunction(jsonFormula, asUiObject);

                    case 'NUMBER':
                        if (asUiObject){
                            jsonFormula.left = jsonFormula.right = undefined;
                            break;
                        }

                        var num = Number(jsonFormula.value);
                        if (isNaN(num))
                            throw new Error('invalid operator/type \'number\': string to number conversion failed');
                        return num;

                    case 'SENSOR':
                        this._isStatic = false;
                        return this._parseJsonSensor(jsonFormula, asUiObject);

                    case 'USER_VARIABLE':
                        if (asUiObject) {
                            var variable = this._variableNames[PocketCode.UserVariableScope.PROCEDURE][jsonFormula.value] || 
                                this._variableNames[PocketCode.UserVariableScope.LOCAL][jsonFormula.value] || 
                                this._variableNames[PocketCode.UserVariableScope.GLOBAL][jsonFormula.value];
                            return '"' + variable.name + '"';
                        }

                        this._isStatic = false;
                        return 'uvh.getVariable("' + jsonFormula.value + '").value';

                    case 'USER_LIST':
                        if (asUiObject) {
                            var list = this._listNames[PocketCode.UserVariableScope.PROCEDURE][jsonFormula.value] || 
                                this._listNames[PocketCode.UserVariableScope.LOCAL][jsonFormula.value] || 
                                this._listNames[PocketCode.UserVariableScope.GLOBAL][jsonFormula.value];
                            return '*' + list.name + '*';
                        }

                        this._isStatic = false;
                        return 'uvh.getList("' + jsonFormula.value + '")';

                    case 'BRACKET':
                        return '(' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';

                    case 'STRING':
                        return '\'' + jsonFormula.value.replace(/('|\n|\\)/g, '\\\$1') + '\'';
                        //var tmp = jsonFormula.value.replace(/'/g, '\\\'').replace(/\n/g, '\\n');
                        //if (uiString)
                        //    return '\'' + tmp + '\'';
                        //return '\'' + tmp.replace(/\\/g, '\\\\') + '\'';

                    case 'COLLISION_FORMULA':   //sprite (name) can only be added using a dialog
                        this._isStatic = false;
                        var params = jsonFormula.value.split(' touches ');  //e.g. 'sp1 touches sp2'
                        if (params.length == 1) { //v0.993
                            if (asUiObject)
                                return 'touches_object(' + jsonFormula.value + ')';

                            return 'this._sprite.collidesWithSprite(\'' + params[0] + '\')';
                        }
                        else if (params.length == 3) { //v0.992
                            if (asUiObject)
                                return '\'' + jsonFormula.value + '\'';

                            return 'this._sprite.collidesWithSprite(\'' + params[1] + '\')';
                        }
                        else { //not supported
                            if (asUiObject)
                                return '\'' + jsonFormula.value + '\'';
                            return 'false';
                        }

                    default:
                        throw new Error('formula parser: unknown type: ' + jsonFormula.type);     //TODO: do we need an onError event? -> new and unsupported operators?
                }
            },

            _concatOperatorFormula: function (jsonFormula, operator) {
                return '(' + this._parseJsonType(jsonFormula.left) + operator + this._parseJsonType(jsonFormula.right) + ')';
            },
            _addKeyRecursive: function (jsonFormula, i18nKey) {
                jsonFormula.i18nKey = i18nKey;
                jsonFormula.left = this._parseJsonType(jsonFormula.left, true);
                jsonFormula.right = this._parseJsonType(jsonFormula.right, true);
            },
            _parseJsonOperator: function (jsonFormula, asUiObject) {
                /* package org.catrobat.catroid.formulaeditor: enum Operators */
                switch (jsonFormula.value) {
                    case 'LOGICAL_AND':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_and');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' && ');

                    case 'LOGICAL_OR':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_or');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' || ');

                    case 'EQUAL':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_equal');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' == ');

                    case 'NOT_EQUAL':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_notequal');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' != ');

                    case 'SMALLER_OR_EQUAL':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_leserequal');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' <= ');

                    case 'GREATER_OR_EQUAL':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_greaterequal');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' >= ');

                    case 'SMALLER_THAN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_lesserthan');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' < ', asUiObject);

                    case 'GREATER_THAN':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_greaterthan');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' > ', asUiObject);

                    case 'PLUS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_operator_plus');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' + ', asUiObject, true);

                    case 'MINUS':
                        if (asUiObject){
                            //todo: left === null?
                            this._addKeyRecursive(jsonFormula, 'formula_editor_operator_minus');
                            break;
                        }
                        if (jsonFormula.left === null)    //singed number
                            return this._concatOperatorFormula(jsonFormula, '-', asUiObject);
                        return this._concatOperatorFormula(jsonFormula, ' - ', asUiObject, jsonFormula.left !== null);

                    case 'MULT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_operator_mult');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' * ', asUiObject, true);

                    case 'DIVIDE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_operator_divide');
                            break;
                        }
                        return this._concatOperatorFormula(jsonFormula, ' / ', asUiObject, true);

                    case 'LOGICAL_NOT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_logic_not');
                            break;
                        }
                        return '!' + this._parseJsonType(jsonFormula.right);

                    default:
                        throw new Error('formula parser: unknown operator: ' + jsonFormula.value);  //TODO: do we need an onError event? -> new and unsupported operators?
                }
            },
            /*_parseFunctionAndAddKey: function (jsonFormula, i18nKey, rightExists) {
                //i18nKey -> object


                jsonFormula.i18nKey = i18nKey;
                jsonFormula.left = this._parseJsonType(jsonFormula.left, true);

                jsonFormula.right = this._parseJsonType(jsonFormula.right, true);
            },*/
            _parseJsonFunction: function (jsonFormula, asUiObject) {
                /* package org.catrobat.catroid.formulaeditor: enum Functions
                *  SIN, COS, TAN, LN, LOG, PI, SQRT, RAND, ABS, ROUND, MOD, ARCSIN, ARCCOS, ARCTAN, EXP, FLOOR, CEIL, MAX, MIN, TRUE, FALSE, LENGTH, LETTER, JOIN;
                */
                switch (jsonFormula.value) {
                    case 'SIN':
                        if (asUiObject) {
                            //this._parseFunctionAndAddKey(jsonFormula, i18nKey als object, false)
                            return 'sin(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        }
                        return 'Math.sin(this._degree2radian(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'COS':
                        if (asUiObject)
                            return 'cos(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'Math.cos(this._degree2radian(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'TAN':
                        if (asUiObject)
                            return 'tan(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'Math.tan(this._degree2radian(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'LN':
                        if (asUiObject)
                            return 'ln(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'Math.log(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'LOG':
                        if (asUiObject)
                            return 'log(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'this._log10(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'PI':
                        if (asUiObject)
                            return 'pi';
                        return 'Math.PI';

                    case 'SQRT':
                        if (asUiObject)
                            return 'sqrt(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'Math.sqrt(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'RAND':
                        if (asUiObject)
                            return 'random(' + this._parseJsonType(jsonFormula.left, asUiObject) + ', ' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';

                        this._isStatic = false;
                        //please notice: this function is quite tricky, as the 2 parametes can be switched (min, max) and we need to calculate this two values
                        //at runtime to determine which one to use
                        //if both partial results are integers, the random number will be a number without decimal places
                        //for calculation we need the scope of the formula itself! To solve this, the whole logic is included in our dynamic function
                        var lString = '(' + this._parseJsonType(jsonFormula.left) + ')';
                        var rString = '(' + this._parseJsonType(jsonFormula.right) + ')';

                        var stmt = '((' + lString + ' <= ' + rString + ') ? ';
                        stmt += '((' + lString + ' % 1 === 0 && ' + rString + ' % 1 === 0) ? (Math.floor(Math.random() * (' + rString + '+ 1 -' + lString + ') + ' + lString + ')) : (Math.random() * (' + rString + '-' + lString + ') + ' + lString + ')) : ';
                        stmt += '((' + lString + ' % 1 === 0 && ' + rString + ' % 1 === 0) ? (Math.floor(Math.random() * (' + lString + '+ 1 -' + rString + ') + ' + rString + ')) : (Math.random() * (' + lString + '-' + rString + ') + ' + rString + ')))';
                        //var test = ((1.0) <= (1.01)) ? (((1.0) % 1 === 0 && (1.01) % 1 === 0) ? (Math.floor(Math.random() * ((1.01) - (1.0)) + (1.0))) : (Math.random() * ((1.01) - (1.0)) + (1.0))) : (((1.0) % 1 === 0 && (1.01) % 1 === 0) ? (Math.floor(Math.random() * ((1.0) - (1.01)) + (1.01))) : (Math.random() * ((1.0) - (1.01)) + (1.01)));

                        return stmt;
                        //var functionBody = 'var left = (' + this.parseJson(this._parseJsonType(jsonFormula.left)) + ').calculate(); ';
                        //functionBody += 'var right = (' + this.parseJson(this._parseJsonType(jsonFormula.right)) + ').calculate(); ';
                        ////functionBody += 'var returnInt = (left % 1 === 1 && right % 1 === 0); ';
                        //functionBody += 'if (left < right) { ';
                        //functionBody += 'var factor = (right - left); var offset = left; } else { ';
                        //functionBody += 'var factor = (left - right); var offset = right; } ';
                        //functionBody += 'if (left % 1 === 0 && right % 1 === 0) ';  //retrun value as integer 
                        //functionBody += '';
                        //functionBody += '';

                        //var left = (this.parseJson(this._parseJsonType(jsonFormula.left))).calculate();
                        //var right = (this.parseJson(this._parseJsonType(jsonFormula.right))).calculate();
                        //if (left < right) //min = left
                        //    return 'Math.random() * ' + (right - left) + ' + ' + left;// + this._parseJsonType(jsonFormula.right) + ') + ' + this._parseJsonType(jsonFormula.left) + ')';
                        //else
                        //    return 'Math.random() * ' + (left - right) + ' + ' + right;// + this._parseJsonType(jsonFormula.right) + ') + ' + this._parseJsonType(jsonFormula.left) + ')';
                        ////return 'Math.floor((Math.random() * ' + this._parseJsonType(jsonFormula.right) + ') + ' + this._parseJsonType(jsonFormula.left) + ')';  //TODO:
                        ////return 'Math.random() * ' + this._parseJsonType(jsonFormula.right) + ') + ' + this._parseJsonType(jsonFormula.left) + ')';  //TODO:

                    case 'ABS':
                        if (asUiObject)
                            return 'abs(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'Math.abs(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'ROUND':
                        if (asUiObject)
                            return 'round(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'Math.round(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'MOD': //http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
                        if (asUiObject)
                            return 'mod(' + this._parseJsonType(jsonFormula.left, asUiObject) + ', ' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';
                        return '(((' + this._parseJsonType(jsonFormula.left) + ') % (' + this._parseJsonType(jsonFormula.right) + ')) + (' + this._parseJsonType(jsonFormula.right) + ')) % (' + this._parseJsonType(jsonFormula.right) + ')';

                    case 'ARCSIN':
                        if (asUiObject)
                            return 'arcsin(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'this._radian2degree(Math.asin(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'ARCCOS':
                        if (asUiObject)
                            return 'arccos(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'this._radian2degree(Math.acos(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'ARCTAN':
                        if (asUiObject)
                            return 'arctan(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'this._radian2degree(Math.atan(' + this._parseJsonType(jsonFormula.left) + '))';

                    case 'EXP':
                        if (asUiObject)
                            return 'exp(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'Math.exp(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'POWER':
                        if (asUiObject)
                            return 'power(' + this._parseJsonType(jsonFormula.left, asUiObject) + ', ' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';
                        return 'Math.pow(' + this._parseJsonType(jsonFormula.left) + ', ' + this._parseJsonType(jsonFormula.right) + ')';

                    case 'FLOOR':
                        if (asUiObject)
                            return 'floor(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'Math.floor(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'CEIL':
                        if (asUiObject)
                            return 'ceil(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';
                        return 'Math.ceil(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'MAX':
                        if (asUiObject)
                            return 'max(' + this._parseJsonType(jsonFormula.left, asUiObject) + ', ' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';
                        return 'Math.max(' + this._parseJsonType(jsonFormula.left) + ', ' + this._parseJsonType(jsonFormula.right) + ')';

                    case 'MIN':
                        if (asUiObject)
                            return 'min(' + this._parseJsonType(jsonFormula.left, asUiObject) + ', ' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';
                        return 'Math.min(' + this._parseJsonType(jsonFormula.left) + ', ' + this._parseJsonType(jsonFormula.right) + ')';

                    case 'TRUE':
                        if (asUiObject)
                            return 'TRUE';
                        return 'true';

                    case 'FALSE':
                        if (asUiObject)
                            return 'FALSE';
                        return 'false';

                        //string
                    case 'LENGTH':
                        if (asUiObject)
                            return 'length(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';

                        if (jsonFormula.left)
                            return '(' + this._parseJsonType(jsonFormula.left) + ' + \'\').length';
                        return 0;

                    case 'LETTER':
                        if (asUiObject)
                            return 'letter(' + this._parseJsonType(jsonFormula.left, asUiObject) + ', ' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';

                        var idx = Number(this._parseJsonType(jsonFormula.left)) - 1; //given index (1..n)
                        return '((' + this._parseJsonType(jsonFormula.right) + ') + \'\').charAt(' + idx + ')';

                    case 'JOIN':
                        if (asUiObject)
                            return 'join(' + this._parseJsonType(jsonFormula.left, asUiObject) + ', ' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';

                        return '((' + this._parseJsonType(jsonFormula.left) + ') + \'\').concat((' + this._parseJsonType(jsonFormula.right) + ') + \'\')';

                        //list
                    case 'NUMBER_OF_ITEMS':
                        if (asUiObject)
                            return 'number_of_items(' + this._parseJsonType(jsonFormula.left, asUiObject) + ')';

                        this._isStatic = false;
                        return this._parseJsonType(jsonFormula.left) + '.length';

                    case 'LIST_ITEM':
                        if (asUiObject)
                            return 'element(' + this._parseJsonType(jsonFormula.left, asUiObject) + ', ' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';

                        this._isStatic = false;
                        return this._parseJsonType(jsonFormula.right) + '.valueAt(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'CONTAINS':
                        if (asUiObject)
                            return 'contains(' + this._parseJsonType(jsonFormula.left, asUiObject) + ', ' + this._parseJsonType(jsonFormula.right, asUiObject) + ')';

                        this._isStatic = false;
                        return this._parseJsonType(jsonFormula.left) + '.contains(' + this._parseJsonType(jsonFormula.right) + ')';

                        //touch
                    case 'MULTI_FINGER_X':
                        if (asUiObject)
                            return 'screen_touch_x( ' + this._parseJsonType(jsonFormula.left, asUiObject) + ' )';

                        this._isStatic = false;
                        return 'this._device.getTouchX(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'MULTI_FINGER_Y':
                        if (asUiObject)
                            return 'screen_touch_y( ' + this._parseJsonType(jsonFormula.left, asUiObject) + ' )';

                        this._isStatic = false;
                        return 'this._device.getTouchY(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'MULTI_FINGER_TOUCHED':
                        if (asUiObject)
                            return 'screen_is_touched( ' + this._parseJsonType(jsonFormula.left, asUiObject) + ' )';

                        this._isStatic = false;
                        return 'this._device.isTouched(' + this._parseJsonType(jsonFormula.left) + ')';

                        //arduino
                    case 'ARDUINOANALOG':
                        if (asUiObject)
                            return 'arduino_analog_pin( ' + this._parseJsonType(jsonFormula.left, asUiObject) + ' )';

                        this._isStatic = false;
                        return 'this._device.getArduinoAnalogPin(' + this._parseJsonType(jsonFormula.left) + ')';

                    case 'ARDUINODIGITAL':
                        if (asUiObject)
                            return 'arduino_digital_pin( ' + this._parseJsonType(jsonFormula.left, asUiObject) + ' )';

                        this._isStatic = false;
                        return 'this._device.getArduinoDigitalPin(' + this._parseJsonType(jsonFormula.left) + ')';

                    default:
                        throw new Error('formula parser: unknown function: ' + jsonFormula.value);    //TODO: do we need an onError event? -> new and unsupported operators?

                }
            },

            _parseJsonSensor: function (jsonFormula, asUiObject) {
                /* package org.catrobat.catroid.formulaeditor: enum Sensors
                *  X_ACCELERATION, Y_ACCELERATION, Z_ACCELERATION, COMPASS_DIRECTION, X_INCLINATION, Y_INCLINATION, LOUDNESS, FACE_DETECTED, FACE_SIZE, FACE_X_POSITION, FACE_Y_POSITION, OBJECT_X(true), OBJECT_Y(true), OBJECT_GHOSTEFFECT(true), OBJECT_BRIGHTNESS(true), OBJECT_SIZE(true), OBJECT_ROTATION(true), OBJECT_LAYER(true)
                */
                switch (jsonFormula.value) {
                    //device
                    case 'LOUDNESS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_loudness');
                            break;
                        }

                        return 'this._device.loudness';

                    case 'X_ACCELERATION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_x_acceleration');
                            break;
                        }

                        return 'this._device.accelerationX';

                    case 'Y_ACCELERATION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_y_acceleration');
                            break;
                        }

                        return 'this._device.accelerationY';

                    case 'Z_ACCELERATION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_z_acceleration');
                            break;
                        }

                        return 'this._device.accelerationZ';

                    case 'X_INCLINATION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_x_inclination');
                            break;
                        }

                        return 'this._device.inclinationX';

                    case 'Y_INCLINATION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_y_inclination');
                            break;
                        }

                        return 'this._device.inclinationY';

                    case 'COMPASS_DIRECTION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_compass_direction');
                            break;
                        }

                        return 'this._device.compassDirection';

                        //geo location
                    case 'LATITUDE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_latitude');
                            break;
                        }

                        return 'this._device.geoLatitude';

                    case 'LONGITUDE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_longitude');
                            break;
                        }

                        return 'this._device.geoLongitude';

                    case 'ALTITUDE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_altitude');
                            break;
                        }

                        return 'this._device.geoAltitude';

                    case 'ACCURACY':
                    case 'LOCATION_ACCURACY':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_location_accuracy');
                            break;
                        }

                        return 'this._device.geoAccuracy';

                        //touch
                    case 'FINGER_X':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_finger_x');
                            break;
                        }

                        return 'this._device.getTouchX(this._device.lastTouchIndex)';

                    case 'FINGER_Y':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_finger_y');
                            break;
                        }

                        return 'this._device.getTouchY(this._device.lastTouchIndex)';

                    case 'FINGER_TOUCHED':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_is_finger_touching');
                            break;
                        }

                        return 'this._device.isTouched(this._device.lastTouchIndex)';

                    case 'LAST_FINGER_INDEX':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_index_of_last_finger');
                            break;
                        }

                        return 'this._device.lastTouchIndex';

                    //face detection
                    case 'FACE_DETECTED':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_face_detected');
                            break;
                        }

                        return 'this._device.faceDetected';

                    case 'FACE_SIZE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_face_size');
                            break;
                        }

                        return 'this._device.faceSize';

                    case 'FACE_X_POSITION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_face_x_position');
                            break;
                        }

                        return 'this._device.facePositionX';

                    case 'FACE_Y_POSITION':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_face_y_position');
                            break;
                        }

                        return 'this._device.facePositionY';

                        //date and time
                    case 'CURRENT_YEAR':
                        if (uiString)
                            return 'year';

                        return '(new Date()).getFullYear()';

                    case 'CURRENT_MONTH':
                        if (uiString)
                            return 'month';

                        return '(new Date()).getMonth()';

                    case 'CURRENT_DATE':
                        if (uiString)
                            return 'day';

                        return '(new Date()).getDate()';

                    case 'CURRENT_DAY_OF_WEEK':
                        if (uiString)
                            return 'weekday';

                        return '((new Date()).getDay() > 0 ? (new Date()).getDay() : 7)';

                    case 'CURRENT_HOUR':
                        if (uiString)
                            return 'hour';

                        return '(new Date()).getHours()';

                    case 'CURRENT_MINUTE':
                        if (uiString)
                            return 'minute';

                        return '(new Date()).getMinutes()';

                    case 'CURRENT_SECOND':
                        if (uiString)
                            return 'second';

                        return '(new Date()).getSeconds()';

                        //case 'DAYS_SINCE_2000':
                        //    if (asUiObject)
                        //        return 'days_since_2000';

                        //    return '(new Date() - new Date(2000, 0, 1, 0, 0, 0, 0)) / 86400000';

                        //case 'TIMER':
                        //    if (asUiObject)
                        //        return 'timer';

                        //    return 'this._sprite.projectTimerValue';
                        
                    //sprite
                    case 'OBJECT_BRIGHTNESS':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_brightness');
                            break;
                        }

                        return 'this._sprite.brightness';

                    case 'OBJECT_TRANSPARENCY':
                    case 'OBJECT_GHOSTEFFECT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_transparency');
                            break;
                        }

                        return 'this._sprite.transparency';

                    case 'OBJECT_COLOR':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_color');
                            break;
                        }

                        return 'this._sprite.colorEffect';

                    case 'OBJECT_BACKGROUND_NUMBER':
                        if (uiString)
                            return 'background_number';
                    case 'OBJECT_LOOK_NUMBER':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_look_number');
                            break;
                        }
                        return 'this._sprite.currentLookNumber';

                    case 'OBJECT_BACKGROUND_NAME':
                        if (uiString)
                            return 'background_name';
                    case 'OBJECT_LOOK_NAME':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_look_name');
                            break;
                        }
                        return 'this._sprite.currentLookName';

                    case 'OBJECT_LAYER':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_layer');
                            break;
                        }

                        return 'this._sprite.layer';

                    case 'OBJECT_ROTATION': //=direction
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_rotation');
                            break;
                        }

                        return 'this._sprite.direction';

                    case 'OBJECT_SIZE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_size');
                            break;
                        }

                        return 'this._sprite.size';

                    case 'OBJECT_X':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_x');
                            break;
                        }

                        return 'this._sprite.positionX';

                    case 'OBJECT_Y':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_y');
                            break;
                        }

                        return 'this._sprite.positionY';

                    //case 'OBJECT_DISTANCE_TO':    //TODO
                    //    if (uiString)
                    //        return 'position_y';

                    //    return 'this._sprite.positionY';

                    //collision
                    case 'COLLIDES_WITH_EDGE':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_collides_with_edge');
                            break;
                        }

                        return 'this._sprite.collidesWithEdge';

                    case 'COLLIDES_WITH_FINGER':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_function_touched');
                            break;
                        }

                        return 'this._sprite.collidesWithPointer';

                    //physics
                    case 'OBJECT_X_VELOCITY':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_x_velocity');
                            break;
                        }

                        return 'this._sprite.velocityX';    //TODO: physics

                    case 'OBJECT_Y_VELOCITY':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_y_velocity');
                            break;
                        }

                        return 'this._sprite.velocityY';    //TODO: physics

                    case 'OBJECT_ANGULAR_VELOCITY':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_object_angular_velocity');
                            break;
                        }

                        return 'this._sprite.velocityAngular';  //TODO: physics

                    //nxt
                    case 'NXT_SENSOR_1':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_lego_nxt_1');
                            break;
                        }

                        return 'this._device.nxt1';

                    case 'NXT_SENSOR_2':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_lego_nxt_2');
                            break;
                        }

                        return 'this._device.nxt2';

                    case 'NXT_SENSOR_3':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_lego_nxt_3');
                            break;
                        }

                        return 'this._device.nxt3';

                    case 'NXT_SENSOR_4':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_sensor_lego_nxt_4');
                            break;
                        }

                        return 'this._device.nxt4';

                        //phiro
                    case 'PHIRO_FRONT_LEFT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_front_left');
                            break;
                        }

                        return 'this._device.phiroFrontLeft';

                    case 'PHIRO_FRONT_RIGHT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_front_right');
                            break;
                        }

                        return 'this._device.phiroFrontRight';

                    case 'PHIRO_SIDE_LEFT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_side_left');
                            break;
                        }

                        return 'this._device.phiroSideLeft';

                    case 'PHIRO_SIDE_RIGHT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_side_right');
                            break;
                        }

                        return 'this._device.phiroSideRight';

                    case 'PHIRO_BOTTOM_LEFT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_bottom_left');
                            break;
                        }

                        return 'this._device.phiroBottomLeft';

                    case 'PHIRO_BOTTOM_RIGHT':
                        if (asUiObject){
                            this._addKeyRecursive(jsonFormula, 'formula_editor_phiro_sensor_bottom_right');
                            break;
                        }

                        return 'this._device.phiroBottomRight';

                    default:
                        throw new Error('formula parser: unknown sensor: ' + jsonFormula.value);      //TODO: do we need an onError event? -> new and unsupported operators? PHIRO?
                }
            },
            /* override */
            dispose: function () {
                //static class: cannot be disposed
            },
        });

        return FormulaParser;
    })(),

});

//static class: constructor override (keeping code coverage enabled)
PocketCode.FormulaParser = new PocketCode.FormulaParser();

