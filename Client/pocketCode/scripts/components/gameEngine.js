﻿/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-ui.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
/// <reference path="../model/userVariableHost.js" />
/// <reference path="imageStore.js" />
/// <reference path="../model/userVariable.js" />
/// <reference path="../model/scene.js" />
/// <reference path="publishSubscribe.js" />
/// <reference path="soundManager.js" />
'use strict';

PocketCode.GameEngine = (function () {
    GameEngine.extends(PocketCode.Model.UserVariableHost, false);

    function GameEngine(minLoopCycleTime) {
        PocketCode.Model.UserVariableHost.call(this, PocketCode.UserVariableScope.GLOBAL);

        this._executionState = PocketCode.ExecutionState.INITIALIZED;
        this._minLoopCycleTime = minLoopCycleTime || 20; //ms
        this._resourceTotalSize = 0;
        this._resourceLoadedSize = 0;
        this._resourcesLoaded = false;
        this._bricksCount = 0;
        this._bricksLoaded = 0;
        this._scenesLoaded = false;

        this._id = '';
        this.title = '';
        this.description = '';
        this.author = '';
        this._originalScreenHeight = undefined;
        this._originalScreenWidth = undefined;
        this.resourceBaseUrl = '';

        this._imageStore = new PocketCode.ImageStore();
        this._imageStore.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
        this._imageStore.onLoadingError.addEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
        this._imageStore.onLoad.addEventListener(new SmartJs.Event.EventListener(this._imageStoreLoadHandler, this));
        this.__sounds = {};

        this._soundManager = new PocketCode.SoundManager();
        this._soundManager.onLoadingProgress.addEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
        this._soundManager.onLoadingError.addEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
        this._soundManager.onLoad.addEventListener(new SmartJs.Event.EventListener(this._soundManagerLoadHandler, this));

        this._loadingAlerts = {
            invalidSoundFiles: [],
            unsupportedBricks: [],
            deviceUnsupportedFeatures: [],
            deviceEmulation: false,
            deviceLockRequired: false,
        };

        this._scenes = {};
        this._currentScene = undefined;
        this._startScene = undefined;

        //rendering cache
        this._viewStates = {};
        //^^ viewStates are stored per scene if a scene gets paused while starting another
        //it includes current visibility states of global resources used by the scene, eg. global variable visibility states or the current state of the device
        //so these settings can be restored as soon a scene is resumed

        //events
        this._onLoadingProgress = new SmartJs.Event.Event(this);
        //this._onScenesInitialized = new SmartJs.Event.Event(this);
        this._onSceneChange = new SmartJs.Event.Event(this);
        this._onLoadingError = new SmartJs.Event.Event(this);
        this._onLoad = new SmartJs.Event.Event(this);

        this._onBeforeProgramStart = new SmartJs.Event.Event(this);
        //this._onProgramStart = new SmartJs.Event.Event(this);
        this._onProgramExecuted = new SmartJs.Event.Event(this);
        this._onSpriteUiChange = new SmartJs.Event.Event(this); //defined here: dispatched in bricks and sprites
        this._onVariableUiChange = new SmartJs.Event.Event(this);
        this._onCameraUsageChange = new SmartJs.Event.Event(this);
        //map the base class (global variable host) to our public event
        this._onVariableChange.addEventListener(new SmartJs.Event.EventListener(function (e) { this._onVariableUiChange.dispatchEvent(e); }, this));
    }

    //events
    Object.defineProperties(GameEngine.prototype, {
        onLoadingProgress: {
            get: function () { return this._onLoadingProgress; },
        },
        //onScenesInitialized: {
        //    get: function () { return this._onScenesInitialized; },
        //},
        onSceneChange: {
            get: function () { return this._onSceneChange; },
        },
        onLoad: {
            get: function () { return this._onLoad; },
        },
        onLoadingError: {
            get: function () { return this._onLoadingError; },
        },
        onBeforeProgramStart: {
            get: function () { return this._onBeforeProgramStart; },
        },
        //onProgramStart: {
        //    get: function () { return this._currentScene.onProgramStart; }, //todo
        //},
        onProgramExecuted: {
            get: function () { return this._onProgramExecuted; },
        },
        onSpriteUiChange: {
            get: function () { return this._onSpriteUiChange; },
        },
        onVariableUiChange: {
            get: function () { return this._onVariableUiChange; },
        },
        //onSpriteTappedAction: {
        //    get: function () { return this._currentScene.onSpriteTappedAction; },
        //},
        onTouchStartAction: {
            get: function () { return this._onTouchStartAction; },
        },
        onCameraUsageChange: {
            get: function () {
                return this._onCameraUsageChange;  //TODO: in use?
            }
        },
    });

    //properties
    Object.defineProperties(GameEngine.prototype, {
        //project execution
        executionState: {
            get: function () {
                if (this._currentScene)
                    return this._currentScene._executionState;
                return this._executionState;
            },
        },
        projectLoaded: {
            get: function () {
                return this._resourcesLoaded && this._scenesLoaded;
            },
        },
        //projectScreenSize: {
        //    get: function () {
        //        return { width: this._originalScreenWidth, height: this._originalScreenHeight };
        //    },
        //},
        muted: {
            set: function (value) {
                this._soundManager.muted = value;
            },
        },
        soundCollectionId: {
            get: function () {
                return this._soundManager.soundCollectionId;
            },
        },
        _sounds: {
            set: function (sounds) {
                if (!(sounds instanceof Array))
                    throw new Error('setter expects type Array');

                for (var i = 0, l = sounds.length; i < l; i++)
                    this.__sounds[sounds[i].id] = sounds[i];

                this._soundManager.loadSounds(this._resourceBaseUrl, sounds);
            },
        },
    });

    //methods
    GameEngine.prototype.merge({
        loadProject: function (jsonProject) {
            if (this._disposing || this._disposed)
                return;
            if (this.executionState == PocketCode.ExecutionState.PAUSED || this.executionState == PocketCode.ExecutionState.RUNNING)
                this.stopProject();

            if (typeof jsonProject != 'object')
                throw new Error('invalid argument: json project');
            else
                this._jsonProject = jsonProject;

            this._scenesLoaded = false;
            this._resourcesLoaded = false;
            this._loadingAlerts = {
                invalidSoundFiles: [],
                unsupportedBricks: [],
                deviceUnsupportedFeatures: [],
                deviceEmulation: false,
                deviceLockRequired: false,
            };

            this._id = jsonProject.id;
            var header = jsonProject.header;
            this.title = header.title;
            this.description = header.description;
            this.author = header.author;
            this._originalScreenHeight = header.device.screenHeight;
            this._originalScreenWidth = header.device.screenWidth;

            //resource sizes
            this._resourceTotalSize = 0;
            this._resourceLoadedSize = 0;
            var i, l;
            for (i = 0, l = jsonProject.images.length; i < l; i++) {
                this._resourceTotalSize += jsonProject.images[i].size;
            }
            for (i = 0, l = jsonProject.sounds.length; i < l; i++) {
                this._resourceTotalSize += jsonProject.sounds[i].size;
            }

            this._onLoadingProgress.dispatchEvent({ progress: 0 });
            if (this._resourceTotalSize === 0)
                this._resourcesLoaded = true;
            else {
                this._resourceBaseUrl = jsonProject.resourceBaseUrl;
                this._imageStore.loadImages(this._resourceBaseUrl, jsonProject.images);
                //sounds are loaded after images using the image stores onLoad event
            }

            //make sure vars and lists are defined before creating bricks and sprites
            this._variables = jsonProject.variables || [];
            this._lists = jsonProject.lists || [];

            if (this._device)
                this._device.dispose();
            this._device = SmartJs.Device.isMobile ? new PocketCode.MediaDevice() : new PocketCode.DeviceEmulator();

            this._device.onInactive.addEventListener(new SmartJs.Event.EventListener(this._deviceOnInactiveHandler, this));
            this._device.onSpaceKeyDown.addEventListener(new SmartJs.Event.EventListener(this._deviceOnSpaceKeyDownHandler, this));
            this._device.onCameraChange.addEventListener(new SmartJs.Event.EventListener(this._deviceOnCameraChangeHandler, this));

            this._viewStates = {};
            this._currentScene = undefined;
            for (var id in this._scenes) {
                this._scenes[id].dispose();
                delete this._scenes[id];
            }

            this._spritesLoadingProgress = 0;
            this._bricksCount = jsonProject.header.bricksCount;

            if (!jsonProject.scenes || jsonProject.scenes.length < 1)
                throw new Error('No scene found in project');

            var broadcasts = jsonProject.broadcasts || [];
            var jsonScenes = jsonProject.scenes,
                scene;

            for (var i = 0, l = jsonScenes.length; i < l; i++) {
                scene = new PocketCode.Model.Scene(this, this._device, broadcasts, this._minLoopCycleTime);
                scene.onProgressChange.addEventListener(new SmartJs.Event.EventListener(this._sceneOnProgressChangeHandler, this));
                scene.onUnsupportedBricksFound.addEventListener(new SmartJs.Event.EventListener(this._sceneUnsupportedBricksHandler, this));
                scene.onUiChange.addEventListener(new SmartJs.Event.EventListener(this._dispatchOnSceneChange, this));
                this._scenes[jsonScenes[i].id] = scene; //id not set until loaded

                scene.onExecuted.addEventListener(new SmartJs.Event.EventListener(this._sceneExecutedHandler, this));
                scene.load(jsonScenes[i]);

                if (i == 0)
                    this._startScene = scene;
            }

            this._scenesLoaded = true;
            this._sceneOnProgressChangeHandler({ bricksLoaded: 0 });

            if (!this._device.initialized)    //divice ready?
                this._device.onInit.addEventListener(new SmartJs.Event.EventListener(this._deviceInitHandler, this));
        },
        //loading handler
        _sceneOnProgressChangeHandler: function (e) {
            this._bricksLoaded += e.bricksLoaded;

            if (this._scenesLoaded) {
                if (this._resourcesLoaded && this._device.initialized)
                    this._handleLoadingComplete();
            }
            else {
                this._dispatchLoadingProgress();
            }
        },
        _sceneUnsupportedBricksHandler: function (e) {
            this._loadingAlerts.unsupportedBricks = this._loadingAlerts.unsupportedBricks.concat(e.unsupportedBricks);
        },
        _sceneExecutedHandler: function (e) {
            if (e.target == this._currentScene) {
                this._viewStates = {};
                this._currentScene = undefined;
                if (!this._device.hasActiveFeatures) {
                    this._executionState = PocketCode.ExecutionState.STOPPED;
                    this._onProgramExecuted.dispatchEvent();
                }
            }
        },
        _resourceProgressChangeHandler: function (e) {
            if (!e.file || !e.file.size)
                return;

            var size = e.file.size;
            this._resourceLoadedSize += size;
            this._dispatchLoadingProgress();
        },
        _dispatchLoadingProgress: function () {
            var sceneProgress = this._bricksCount > 0 ? Math.round(this._bricksLoaded / this._bricksCount * 1000) / 10 : 100;
            var resourceProgress = Math.round(this._resourceLoadedSize / this._resourceTotalSize * 1000) / 10;
            this._onLoadingProgress.dispatchEvent({ progress: Math.min(resourceProgress, sceneProgress) });
        },
        _imageStoreLoadHandler: function (e) {
            this._sounds = this._jsonProject.sounds || [];
        },
        _soundManagerLoadHandler: function (e) {
            if (this._resourceLoadedSize !== this._resourceTotalSize)
                return; //load may trigger during loading single (cached) dynamic sound files (e.g. tts)
            this._resourcesLoaded = true;
            if (this._scenesLoaded && this._device.initialized) {
                this._handleLoadingComplete();
            }
        },
        _handleLoadingComplete: function () {
            //init scene sprites
            for (var id in this._scenes)
                this._scenes[id].initializeSprites();
            //this._currentScene = this._startScene;

            var loadingAlerts = this._loadingAlerts;
            var device = this._device;

            loadingAlerts.deviceUnsupportedFeatures = device ? device.unsupportedFeatures : [];
            loadingAlerts.deviceEmulation = device ? device.emulationInUse : [];
            loadingAlerts.deviceLockRequired = device ? device.mobileLockRequired : [];

            if (loadingAlerts.deviceEmulation ||
                loadingAlerts.deviceLockRequired ||
                loadingAlerts.invalidSoundFiles.length != 0 ||
                loadingAlerts.unsupportedBricks.length != 0 ||
                loadingAlerts.deviceUnsupportedFeatures.length != 0) {
                    this._onLoadingProgress.dispatchEvent({ progress: 100 });       //update ui progress to hide loading indicator
                    this._onLoad.dispatchEvent({ loadingAlerts: loadingAlerts, device: loadingAlerts.deviceEmulation ? device : undefined });   //dispatch warnings
            }
            else {
                this._onLoad.dispatchEvent();
            }
        },
        _resourceLoadingErrorHandler: function (e) {
            if (e.target === this._soundManager)
                this._loadingAlerts.invalidSoundFiles.push(e.file);
            else
                this._onLoadingError.dispatchEvent({ files: [e.file] });
        },
        //device
        _deviceInitHandler: function () {
            if (this._scenesLoaded && this._resourcesLoaded)
                this._handleLoadingComplete();
        },
        _deviceOnInactiveHandler: function () {
            if (!this._currentScene) {
                this._executionState = PocketCode.ExecutionState.STOPPED;
                this._onProgramExecuted.dispatchEvent();
            }
        },
        _deviceOnSpaceKeyDownHandler: function (e) {
            var cs = this._currentScene;
            if (cs.executionState === PocketCode.ExecutionState.RUNNING && cs.background)
                cs.onSpriteTappedAction.dispatchEvent({ sprite: cs.background });
        },
        _deviceOnCameraChangeHandler: function (e) {
            this._onCameraUsageChange.dispatchEvent(e);
        },
        //project interaction
        runProject: function () {
            if (this.executionState === PocketCode.ExecutionState.RUNNING)
                return;
            if (!this.projectLoaded)
                throw new Error('no project loaded');

            if (this.executionState === PocketCode.ExecutionState.PAUSED)
                return this.resumeProject();

            if (this.executionState !== PocketCode.ExecutionState.INITIALIZED) {  //check if terminated and restarted
                this._device.reset();
                this._resetVariables();  //global
                this._viewStates = {};
            }
            this._onBeforeProgramStart.dispatchEvent();  //indicates the project was loaded and rendering objects can be generated

            this._executionState = PocketCode.ExecutionState.RUNNING;
            this.startScene(this._startScene.id);   //calls reinit() if needed
        },
        restartProject: function () {
            this.stopProject();
            window.setTimeout(this.runProject.bind(this), 50);   //some time needed to update callstack (running methods), as this method is called on a system (=click) event
        },
        pauseProject: function () {
            if (this._device)
                this._device.pauseFeatures();
            if (this._currentScene)
                return this._currentScene.pause();
            return false;
        },
        resumeProject: function () {
            if (this._device)
                this._device.resumeFeatures();
            if (this._currentScene)
                return this._currentScene.resume();
            return false;
        },
        stopProject: function () {
            for (var id in this._scenes)
                this._scenes[id].stop();
            this._viewStates = {};
            this._executionState = PocketCode.ExecutionState.STOPPED;
            this._currentScene = undefined;
        },
        getLookImage: function (id) {
            //used by the sprite to access an image during look init
            return this._imageStore.getImage(id);
        },
        handleUserAction: function (e) {
            if (this._currentScene)
                this._currentScene.handleUserAction(e);
        },
        //scene
        _dispatchOnSceneChange: function (reinit) {
            if (!this._currentScene)    //restart
                return; 
            //notifies the UI to reinit sprites and texts
            var scene = this._currentScene,
                globalVars = this._getRenderingVariables(this._id);

            this._onSceneChange.dispatchEvent({
                id: scene.id,
                renderingSprites: scene.renderingSprites,
                renderingTexts: globalVars.concat(scene.renderingVariables), //global + local
                screenSize: scene.screenSize,
                reinit: reinit,
            });
        },
        _getSceneById: function (id) {
            if (!this._scenes[id])
                throw new Error('No Scene with id = ' + id + ' found');
            return this._scenes[id];
        },
        startScene: function (sceneId) {
            var cs = this._currentScene,
                scene = this._getSceneById(sceneId);
            if (cs && cs.id == sceneId)
                return false;   //already  running
            if (cs) {
                cs.pause();
                this._viewStates[cs.id] = {
                    variables: {}.merge(this._variableViewStates),   //do not store a reference
                    device: this._device.viewState,
                };
                //reset to defaults
                this._variableViewStates = {};
                this._device.reset();
            }

            this._currentScene = scene;
            if (scene.executionState != PocketCode.ExecutionState.INITIALIZED) {
                scene.stop();
                scene.reinitializeSprites();    //including local variables
                if (this._viewStates[scene.id])
                    delete this._viewStates[scene.id];
            }
            this._dispatchOnSceneChange(true);
            scene.start();
            return true;
        },
        resumeOrStartScene: function (sceneId) {    //change scene brick
            var cs = this._currentScene,
                scene = this._getSceneById(sceneId);
            if (scene.executionState != PocketCode.ExecutionState.PAUSED)
                return this.startScene(sceneId);
            if (cs && cs.id == sceneId) {
                scene.resume();
                return false;   //already running
            }

            if (cs) {
                cs.pause();
                this._viewStates[cs.id] = {
                    variables: {}.merge(this._variableViewStates),   //do not store a reference
                    device: this._device.viewState,
                };
                this._device.reset();
            }

            this._currentScene = scene;
            var vs = this._viewStates[scene.id];
            this._variableViewStates = vs.variables;
            this._device.viewState = vs.device;
            this._dispatchOnSceneChange(false);

            scene.resume();
            return true;
        },

        /* override */
        dispose: function () {
            if (this._disposed)
                return; //may occur when dispose on error

            this.stopProject();

            if (this._device) {
                this._device.onInactive.removeEventListener(new SmartJs.Event.EventListener(this._deviceOnInactiveHandler, this));
                this._device.onSpaceKeyDown.removeEventListener(new SmartJs.Event.EventListener(this._deviceOnSpaceKeyDownHandler, this));
                this._device.onCameraChange.removeEventListener(new SmartJs.Event.EventListener(this._deviceOnCameraChangeHandler, this));
            }
            this._imageStore.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
            this._imageStore.onLoadingError.removeEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
            this._imageStore.onLoad.removeEventListener(new SmartJs.Event.EventListener(this._imageStoreLoadHandler, this));
            this._imageStore.abortLoading();

            var scene;
            for (var id in this._scenes) {
                scene = this._scenes[id];
                scene.onExecuted.removeEventListener(new SmartJs.Event.EventListener(this._sceneExecutedHandler, this));
                scene.dispose();
                delete this._scenes[id];
            }

            this._soundManager.onLoadingProgress.removeEventListener(new SmartJs.Event.EventListener(this._resourceProgressChangeHandler, this));
            this._soundManager.onLoadingError.removeEventListener(new SmartJs.Event.EventListener(this._resourceLoadingErrorHandler, this));
            this._soundManager.onLoad.removeEventListener(new SmartJs.Event.EventListener(this._soundManagerLoadHandler, this));

            //call super
            PocketCode.Model.UserVariableHost.prototype.dispose.call(this);
        },
    });

    return GameEngine;
})();