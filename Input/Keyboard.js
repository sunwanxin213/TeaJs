/*
    键盘设备
*/
void function (TeaJs) {
    "use strict";

    function Keyboard() {
        /// <summary>键盘设备构造函数</summary>
        /// <returns type="Keyboard">键盘设备</returns>

        var _this = this;

        // 按键列表
        this.keyList = [];

        // 绑定键盘按下事件
        document.addEventListener("keydown", function (e) {
            var curKey = 0,
                e = e || event;
            curKey = e.keyCode || e.which || e.charCode;
            _this.setKeyState(curKey, true);
        }, false);

        // 绑定键盘抬起事件
        document.addEventListener("keyup", function (e) {
            var curKey = 0,
                e = e || event;
            curKey = e.keyCode || e.which || e.charCode;
            _this.setKeyState(curKey, false);
        }, false);

        // 页面失去焦点
        window.addEventListener("blur", function () {
            _this.keyList.length = 0;
        }, false);
    }

    // 缓存原型对象
    var keyboard = Keyboard.prototype;

    keyboard.setKeyState = function (keyCode, state) {
        /// <summary>设置按键状态</summary>
        /// <param name="keyCode" type="KeyCode">按键</param>
        /// <param name="state" type="Boolean">状态</param>

        if (state) {
            for (var i = this.keyList.length; i--;) {
                if (this.keyList[i] === keyCode) return;
            }
            this.keyList.push(keyCode);
        }
        else {
            for (var i = this.keyList.length; i--;) {
                if (this.keyList[i] === keyCode) {
                    this.keyList = this.keyList.remove(i);
                }
            }
        }
    };

    keyboard.isKeyDownStruc = new TeaJs.Function();

    keyboard.isKeyDownStruc.add([Array, Boolean], function (arr, isBottom) {
        /// <summary>判断传入的按键中的一个按键</summary>
        /// <param name="arr" type="Array"></param>
        /// <param name="isBottom" type="Boolean"></param>

        for (var i = this.keyList.length; i--;) {
            if (isBottom) {
                for (var k = arr.length; k--;) {
                    if (this.keyList[i] == arr[k]) return arr[k];
                }
            } else {
                for (var k = 0; k < arr.length; k++) {
                    if (this.keyList[i] == arr[k]) return arr[k];
                }
            }
        }

        return this.keys.none;
    });

    keyboard.isKeyDownStruc.add([Number], function (keyCode) {
        /// <summary>判断按键是否按下</summary>
        /// <param name="keyCode" type="KeyCode">按键</param>
        /// <returns type="Boolean">是否按下</returns>

        for (var i = this.keyList.length; i--;) {
            if (this.keyList[i] === keyCode) {
                return true;
            }
        }
        return false;
    });

    keyboard.isKeyDown = function () {
        /// <summary>判断按键是否按下</summary>
        return this.isKeyDownStruc(this, arguments);
    };

    // 按键索引表
    keyboard.keys = {
        none: 0,
        back: 8,
        tab: 9,
        enter: 13,
        pause: 19,
        capslock: 20,
        kana: 21,
        kanji: 25,
        escape: 27,
        imeconvert: 28,
        imenoconvert: 29,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        select: 41,
        print: 42,
        execute: 43,
        printscreen: 44,
        insert: 45,
        del: 46,
        help: 47,
        d0: 48,
        d1: 49,
        d2: 50,
        d3: 51,
        d4: 52,
        d5: 53,
        d6: 54,
        d7: 55,
        d8: 56,
        d9: 57,
        a: 65,
        b: 66,
        c: 67,
        d: 68,
        e: 69,
        f: 70,
        g: 71,
        h: 72,
        i: 73,
        j: 74,
        k: 75,
        l: 76,
        m: 77,
        n: 78,
        o: 79,
        p: 80,
        q: 81,
        r: 82,
        s: 83,
        t: 84,
        u: 85,
        v: 86,
        w: 87,
        x: 88,
        y: 89,
        z: 90,
        leftwindows: 91,
        rightwindows: 92,
        apps: 93,
        sleep: 95,
        numpad0: 96,
        numpad1: 97,
        numpad2: 98,
        numpad3: 99,
        numpad4: 100,
        numpad5: 101,
        numpad6: 102,
        numpad7: 103,
        numpad8: 104,
        numpad9: 105,
        multiply: 106,
        add: 107,
        separator: 108,
        subtract: 109,
        decimal: 110,
        divide: 111,
        f1: 112,
        f2: 113,
        f3: 114,
        f4: 115,
        f5: 116,
        f6: 117,
        f7: 118,
        f8: 119,
        f9: 120,
        f10: 121,
        f11: 122,
        f12: 123,
        f13: 124,
        f14: 125,
        f15: 126,
        f16: 127,
        f17: 128,
        f18: 129,
        f19: 130,
        f20: 131,
        f21: 132,
        f22: 133,
        f23: 134,
        f24: 135,
        numlock: 144,
        scroll: 145,
        leftshift: 160,
        rightshift: 161,
        leftcontrol: 162,
        rightcontrol: 163,
        leftalt: 164,
        rightalt: 165,
        browserback: 166,
        browserforward: 167,
        browserrefresh: 168,
        browserstop: 169,
        browsersearch: 170,
        browserfavorites: 171,
        browserhome: 172,
        volumemute: 173,
        volumedown: 174,
        volumeup: 175,
        medianexttrack: 176,
        mediaprevioustrack: 177,
        mediastop: 178,
        mediaplaypause: 179,
        launchmail: 180,
        selectmedia: 181,
        launchapplication1: 182,
        launchapplication2: 183,
        oemsemicolon: 186,
        oemplus: 187,
        oemcomma: 188,
        oemminus: 189,
        oemperiod: 190,
        oemquestion: 191,
        oemtilde: 192,
        chatpadgreen: 202,
        chatpadorange: 203,
        oemopenbrackets: 219,
        oempipe: 220,
        oemclosebrackets: 221,
        oemquotes: 222,
        oem8: 223,
        oembackslash: 226,
        processkey: 229,
        oemcopy: 242,
        oemauto: 243,
        oemenlw: 244,
        attn: 246,
        crsel: 247,
        exsel: 248,
        eraseeof: 249,
        play: 250,
        zoom: 251,
        pa1: 253,
        oemclear: 254
    };

    // 锁定Keys枚举
    Object.freeze(keyboard.keys);

    TeaJs.Keyboard = Keyboard;
}(TeaJs);