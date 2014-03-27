/*
    媒体设备
*/
void function (TeaJs) {
    "use strict";

    function MediaDevice(name, tagName, autoPlay, callInit) {
        /// <summary>媒体设备构造函数</summary>
        /// <param name="name" type="String">设备名称</param>
        /// <param name="tagName" type="String">标签名称</param>
        /// <param name="autoPlay" type="Boolean">自动播放</param>
        /// <param name="callInit" type="Function">初始化函数</param>
        /// <returns type="MeidaDevice">媒体设备对象</returns>

        if (!arguments.length) {
            return;
        }

        // 是否启用
        this.isEnable = false;

        // 设备名称
        this.name = name;

        // 标签名称
        this.tagName = tagName;

        // 是否自动播放
        this.autoPlay = autoPlay;

        // 元素对象
        this.object = null;

        // 初始化函数
        this.callInit = callInit;
    }

    // 缓存原型对象
    var media = MediaDevice.prototype;

    media.enable = function (callback) {
        /// <summary>启用媒体</summary>
        /// <param name="callback" type="Function">回调函数</param>

        var _this = this;

        if (!navigator.getUserMedia) {
            throw new Error("Does not support the " + this.name.toLowerCase() + " drive.");
        }

        // 创建元素
        this.object = document.createElement(this.tagName);
        this.callInit && this.callInit(this.object);

        this.object.addEventListener("loadeddata", function () {
            _this.isEnable = true;
        }, false);

        navigator.getUserMedia(this.tagName == "video" ? { video: true } : { audio: true }, goStream, noStream);

        // 启用媒体
        function goStream(stream) {
            // 摄像头停用
            _this.stop = function () {
                if (!_this.isEnable) return;
                _this.isEnable = false;
                if (navigator.mozGetUserMedia) _this.object.mozSrcObject = null;
                else stream.stop();
            };

            // 设置错误事件
            _this.object.onerror = function () {
                _this.isEnable = false;
                if (navigator.mozGetUserMedia) _this.object.mozSrcObject = null;
                else stream.stop();
                streamError();
            };

            try {
                // 设置摄像头源
                if (navigator.mozGetUserMedia) {
                    _this.object.mozSrcObject = stream;
                } else {
                    _this.object.src = window.URL.createObjectURL(stream) || stream;
                }
                _this.autoPlay && _this.object.play();
                callback && callback(_this.object);
            }
            catch (e) {
                alert(e);
                _this.isEnable = false;
                noStream();
            }
        }

        // 找不到摄像头
        function noStream() {
            _this.isEnable = false;
            throw new Error("Unable to get " + _this.name.toLowerCase() + ".");
        }

        // 流错误
        function streamError() {
            _this.isEnable = false;
            throw new Error(_this.name + " exception.");
        }
    };

    TeaJs.Camera = function () {
        /// <summary>添加摄像头设备</summary>

        return new MediaDevice("Camera", "video", true, function (obj) {
            obj.width = 640;
            obj.height = 480;
        });
    };

    TeaJs.Microphone = function () {
        /// <summary>添加麦克风设备</summary>

        return new MediaDevice("Microphone", "audio", false);
    };

    TeaJs.MediaDevice = MediaDevice;
}(TeaJs);