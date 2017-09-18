/// <reference path="../../qunit/qunit-2.1.1.js" />
/// <reference path="../../../Client/smartJs/sj.js" />
/// <reference path="../../../Client/smartJs/sj-event.js" />
/// <reference path="../../../Client/smartJs/sj-core.js" />
/// <reference path="../../../Client/smartJs/sj-components.js" />
/// <reference path="../../../Client/smartJs/sj-ui.js" />
/// <reference path="../../../Client/pocketCode/scripts/ui/deviceEmulator.js" />

"use strict";

QUnit.module("ui/deviceEmulator.js");

QUnit.test("DeviceEmulator UI: Expander tests", function (assert) {

    var soundmanager = new PocketCode.SoundManager();
    var device = new PocketCode.DeviceEmulator(soundmanager);
    var deviceEmulator = new PocketCode.Ui.DeviceEmulator(device);

    var expanderBody = deviceEmulator._container.__container;

    //instance check
    assert.ok(deviceEmulator instanceof PocketCode.Ui.DeviceEmulator && deviceEmulator instanceof SmartJs.Ui.Control, "instance check");

    //open & close check
    assert.equal(expanderBody.className, "pc-expanderBody", "DeviceEmulator closed by default");
    deviceEmulator._container._onChangeHandler({checked: true});
    assert.equal(expanderBody.className, "pc-expanderBody pc-bodyVisible", "DeviceEmulator opened by click");
    deviceEmulator._container._onChangeHandler({checked: false});
    assert.equal(expanderBody.className, "pc-expanderBody", "DeviceEmulator closed by click");

    //Resize change test
    var dom = document.getElementById("qunit-fixture");
    dom.appendChild(deviceEmulator._dom);

    deviceEmulator.dispose();
    assert.ok(deviceEmulator._disposed, "deviceEmulator disposed");

});

QUnit.test("DeviceEmulator UI: Slider tests", function (assert) {

    var soundmanager = new PocketCode.SoundManager();
    var device = new PocketCode.DeviceEmulator(soundmanager);
    var deviceEmulator = new PocketCode.Ui.DeviceEmulator(device);
    var accSlider = deviceEmulator._accSlider;
    var maxDegreeSlider = deviceEmulator._maxSlider;
    //var flashSlider = deviceEmulator._flashSlider;

    //instance Checks for sliders
    assert.ok(accSlider instanceof PocketCode.Ui.Slider, "Acceleration slider instance check");
    assert.ok(maxDegreeSlider instanceof PocketCode.Ui.Slider, "Degree slider instance check");

   //accSlider event check
    assert.ok(accSlider.onChange instanceof SmartJs.Event.Event, "Acceleration slider: event accessor check");
    //maxSlider event check
    assert.ok(maxDegreeSlider.onChange instanceof SmartJs.Event.Event, "Degree slider: event accessor check");

    //check for change event for Degree slider
    // var changeCount = 0;
    // var changeEvents = function (e) {
    //     console.log("triggered");
    //     changeCount++;
    // };
    // deviceEmulator._maxSlider._onChange.addEventListener(new SmartJs.Event.EventListener(changeEvents, this));

    assert.equal(maxDegreeSlider.value, 90, "onChange Event not triggered: no Degree change");
    deviceEmulator._maxDegreeChangeHandler({target: {value: 45}});

    assert.equal(deviceEmulator._device.degreeChangeValue, 45, "onChange Event triggered: Degree Slider change");

    //check of change event for Acceleration slider
    assert.equal(accSlider.value, 5, "onChange Event not triggered: no Acceleration change");
    deviceEmulator._maxAccChangeHandler({target: {value: 10}});

    assert.equal(deviceEmulator._device.accelerationChangeValue, 5, "onChange Event triggered: Acceleration Slider change");

    /*assert.equal(flashSlider.value, 0, "onChange Event not triggered: no Flash change");
    deviceEmulator._flashChangeHandler({target: {value: 1}});
    assert.equal(flashSlider.value, 1, "onChange Event triggered: Flash change");*/


    assert.ok(false, "TODO slider");

});

QUnit.test("DeviceEmulator UI: image Transformation tests", function (assert) {

    var soundmanager = new PocketCode.SoundManager();
    var device = new PocketCode.DeviceEmulator(soundmanager);
    var deviceEmulator = new PocketCode.Ui.DeviceEmulator(device);

    //imgTransformation test
    var done = assert.async();

    var validateSingleKeyLeft = function () {
        //deviceEmulator._imgTransformation();
        assert.ok(deviceEmulator._device._keyPress, "image Transformation: key pressed");
        deviceEmulator._device._keyUp({keyCode: device._keyCode.LEFT});
        //deviceEmulator._resetImgTransformation();
        assert.equal(deviceEmulator._device.inclinationX, 0, "reset image Transformation: key released");
        done();
    }
    deviceEmulator._device._keyDown({keyCode: device._keyCode.LEFT});
    setTimeout(validateSingleKeyLeft, 20);

    assert.ok(false, "TODO image transformation");

});
