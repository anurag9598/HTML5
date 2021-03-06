﻿/// <reference path="../../../smartJs/sj.js" />
/// <reference path="../../../smartJs/sj-event.js" />
/// <reference path="../core.js" />
'use strict';


PocketCode.PublishSubscribeBroker = (function () {
    //a pocketCode specigic bublish-subscribe implementation where only 1 running broadcast is allowed

    function PublishSubscribeBroker() {
        this._subscriptions = {};
        this._pendingOps = {};
        //this._calls = 0;
    }

    //methods
    PublishSubscribeBroker.prototype.merge({
        subscribe: function (id, handler) {
            if (typeof id !== 'string')
                throw new Error('invalid argument: message id, expected type: string');
            if (typeof handler !== 'function')
                throw new Error('invalid argument: subscription handler, expected type: function');

            this._subscriptions[id] || (this._subscriptions[id] = []);
            this._subscriptions[id].push(handler);
        },
        unsubscribe: function (id, handler) {
            if (typeof id !== 'string')
                throw new Error('invalid argument: message id, expected type: string');
            if (typeof handler !== 'function')
                throw new Error('invalid argument: subscription handler, expected type: function');

            var subs = this._subscriptions[id];
            if (subs && subs instanceof Array)
                subs.remove(handler);
        },
        publish: function (id, waitCallback) {//, threadId) {
            if (typeof id !== 'string')
                throw new Error('invalid argument: message id not found');
            if (waitCallback && typeof waitCallback !== 'function')
                throw new Error('invalid argument: publish callback');

            //handle unknown messages or empty subscription list
            var subs = this._subscriptions[id];
            if (!subs || subs.length == 0) {
                if (waitCallback)
                    waitCallback(false);
                return;
            }

            var po,
                execTime = Date.now();

            //stop running tasks with same message id - notify them to stop
            po = this._pendingOps[id];
            if (po)
                po.waitCallback(po.loopDelay);

            //this._calls++;
            if (waitCallback) {
                var po = this._pendingOps[id] = { count: 0, waitCallback: waitCallback, loopDelay: false };
                for (var i = 0, l = subs.length; i < l; i++) {
                    po.count++;
                    //if (this._calls < PocketCode.threadCounter)
                    //    subs[i].call(this, execTime, new SmartJs.Event.EventListener(this._scriptExecutedCallback, this), id);
                    //else
                        window.setTimeout(subs[i].bind(this, execTime, new SmartJs.Event.EventListener(this._scriptExecutedCallback, this), id), 0);
                }
            }
            else {
                for (var i = 0, l = subs.length; i < l; i++) {
                    //if (this._calls < PocketCode.threadCounter)
                    //    subs[i].call(this, execTime);
                    //else
                        window.setTimeout(subs[i].bind(this, execTime), 0);
                }
            }
            //this._calls = 0;
        },
        _scriptExecutedCallback: function (e) { //{ id: threadId, loopDelay: loopD }
            var po = this._pendingOps[e.id];
            if (!po) //stopped
                return;

            po.count--;
            po.loopDelay = po.loopDelay || e.loopDelay;

            if (po.count == 0) {
                delete this._pendingOps[e.id];
                po.waitCallback(po.loopDelay);
            }
        },
        dispose: function () {
            this._subscriptions = {};
            this._pendingOps = {};
        },
    });

    return PublishSubscribeBroker;
})();

PocketCode.BroadcastManager = (function () {
    BroadcastManager.extends(PocketCode.PublishSubscribeBroker, false);

    function BroadcastManager(broadcasts) {
        PocketCode.PublishSubscribeBroker.call(this);

        this.init(broadcasts);
    }

    //methods
    BroadcastManager.prototype.merge({
        init: function (broadcasts) {
            this._pendingOps = {};

            this._subscriptions = {};
            for (var i = 0, l = broadcasts.length; i < l; i++) {
                this._subscriptions[broadcasts[i].id] = [];
            }
        },
        subscribe: function (bcId, handler) {
            if (!this._subscriptions[bcId])
                throw new Error('invalid argument: invalid (unknown) broadcast id');

            PocketCode.PublishSubscribeBroker.prototype.subscribe.call(this, bcId, handler);
        },
        publish: function (bcId, waitCallback) {
            if (!this._subscriptions[bcId])
                throw new Error('invalid argument: invalid (unknown) broadcast id');

            PocketCode.PublishSubscribeBroker.prototype.publish.call(this, bcId, waitCallback);
        },
    });

    return BroadcastManager;
})();
