/*
    Api兼容
*/
void function (window) {
    // 让不支持Html5标签的浏览器识别Html5标签
    var list = "abbr article aside audio bdi data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video".split(' ');
    for (var len = list.length; len--;) { document.createElement(list[len]); }

    window.addEventListener = (window.addEventListener || function (type, listener) {
        /// <summary>添加事件监听器</summary>
        /// <param name="type" type="String">事件类型</param>
        /// <param name="listener" type="EventListener">侦听函数</param>

        window.attachEvent("on" + type, listener);
    });

    // 性能
    window.performance = window.performance ||
                         window.msPerformance ||
                         window.webkitPerformance ||
                         window.mozPerformance;

    // 获取用户媒体
    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;

    // 获取MIDI数据对象
    navigator.requestMIDIAccess = navigator.requestMIDIAccess ||
                                  navigator.webkitRequestMIDIAccess ||
                                  navigator.mozRequestMIDIAccess ||
                                  navigator.msRequestMIDIAccess;

    // 电池状态
    navigator.battery = navigator.battery ||
                        navigator.webkitBattery ||
                        navigator.mozBattery ||
                        navigator.msBattery;

    // 游戏手柄
    if (!navigator.getGamepads) {
        navigator.getGamepads = function () {
            return (navigator.msGetGamepads && navigator.msGetGamepads()) ||
                   (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) ||
                   (navigator.mozGetGamepads && navigator.mozGetGamepads()) ||
                   navigator.msGamepads ||
                   navigator.webkitGamepads ||
                   navigator.mozGamepads ||
                   navigator.gamepads;
        };
    }

    // Url操作
    window.URL = window.URL || window.webkitURL;

    // 重力感应事件
    window.DeviceMotionEvent = window.mozDeviceMotionEvent ||
                               window.webkitDeviceMotionEvent ||
                               window.msDeviceMotionEvent ||
                               window.DeviceMotionEvent;

    // 获取鼠标锁
    var hce = HTMLCanvasElement.prototype;
    hce.requestPointerLock = hce.requestPointerLock ||
                             hce.mozRequestPointerLock ||
                             hce.webkitRequestPointerLock ||
                             hce.msRequestPointerLock;

    // 退出鼠标锁
    document.exitPointerLock = document.exitPointerLock ||
                               document.mozExitPointerLock ||
                               document.webkitExitPointerLock ||
                               document.msExitPointerLock;

    // 锁定屏幕方向
    screen.lockOrientation = screen.lockOrientation ||
                             screen.mozLockOrientation ||
                             screen.msLockOrientation ||
                             screen.webkitLockOrientation;

    // 取消锁定屏幕方向
    screen.unlockOrientation = screen.unlockOrientation ||
                               screen.mozUnlockOrientation ||
                               screen.msUnLockOrientation ||
                               screen.webkitUnLockOrientation;

    // 进入全屏
    var elList = [HTMLElement.prototype, SVGElement.prototype];
    for (var el in elList) {
        el = elList[el];

        el.requestFullscreen = el.requestFullscreen ||
                               el.mozRequestFullscreen ||
                               el.mozRequestFullScreen ||
                               el.webkitRequestFullscreen ||
                               el.msRequestFullscreen;
    }

    // 退出全屏
    document.exitFullscreen = document.exitFullscreen ||
                              document.webkitCancelFullScreen ||
                              document.mozCancelFullScreen ||
                              document.msCancelFullScreen;

    // 获取动画框架
    window.requestAnimationFrame = window.requestAnimationFrame ||
                                   window.mozRequestAnimationFrame ||
                                   window.webkitRequestAnimationFrame ||
                                   window.msRequestAnimationFrame ||
                                   function (callback) { setTimeout(callback, 16.67); };

    // 取消动画框架
    window.cancelAnimationFrame = window.cancelAnimationFrame ||
                                  window.webkitCancelAnimationFrame ||
                                  window.mozCancelAnimationFrame ||
                                  function (id) { window.clearTimeout(id); };

    // 音频上下文
    window.AudioContext = window.AudioContext ||
                          window.webkitAudioContext ||
                          window.mozAudioContext ||
                          window.msAudioContext;

    // 语音识别
    window.SpeechRecognition = window.SpeechRecognition ||
                        window.webkitSpeechRecognition ||
                        window.mozSpeechRecognition ||
                        window.msSpeechRecognition;

    // IndexedDB对象
    if ("webkitIndexedDB" in window) {
        window.indexedDB = window.webkitIndexedDB;
        window.IDBKeyRange = window.webkitIDBKeyRange;
        window.IDBTransaction = window.webkitIDBTransaction;
    }
    else if ("mozIndexedDB" in window) {
        window.indexedDB = window.mozIndexedDB;
    }
    else if ("msIndexedDB" in window) {
        window.indexedDB = window.msIndexedDB;
    }

    if (!window.createGUID) {
        // 创建GUID字符串
        window.createGUID = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16).toUpperCase();
            });
        };
    }

    Audio && (window.Audio.prototype.stop = HTMLAudioElement.prototype.stop = function () {
        /// <summary>设置停止播放音乐函数</summary>

        this.pause();
        this.currentTime = 0;
    });

    HTMLVideoElement && (HTMLVideoElement.prototype.stop = function () {
        /// <summary>设置停止播放视频函数</summary>

        this.pause();
        this.load();
    });

    Array.prototype.insert = function (value, index) {
        /// <summary>插入项</summary>
        /// <param name="value" type="Object">元素</param>
        /// <param name="index" type="Number">索引</param>
        /// <returns type="Array">数组</returns>

        var arrTemp = this;
        if (index > arrTemp.length) index = arrTemp.length;
        if (index < -arrTemp.length) index = 0;
        if (index < 0) index = arrTemp.length + index;
        for (var i = arrTemp.length; i > index; i--) {
            arrTemp[i] = arrTemp[i - 1];
        }
        arrTemp[index] = value;
        return arrTemp;
    };

    Array.prototype.remove = function (index) {
        /// <summary>移除项</summary>
        /// <param name="index" type="Number">索引</param>
        /// <returns type="Array">数组</returns>

        return (index < 0) ? this : this.slice(0, index).concat(this.slice(index + 1, this.length));
    };

    Array.prototype.clear = function () {
        /// <summary>清空数组</summary>

        this.length = 0;
    };

    String.prototype.format = function (arrs) {
        /// <summary>格式化字符串</summary>
        /// <returns type="String">格式化后的字符串</returns>
        var tempStr = this;

        for (var i = 0; i < arguments.length; i++) {
            tempStr = tempStr.replace("{" + i + "}", arguments[i]);
        }

        return tempStr;
    };
}(window);