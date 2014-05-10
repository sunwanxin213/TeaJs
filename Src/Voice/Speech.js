/*
    语音识别
*/
void function (TeaJs) {
    "use strict";

    function Speech() {
        /// <summary>语音识别对象构造器</summary>
        /// <returns type="Speech">语音识别对象</returns>

        constructor(this, arguments);
    }

    // 创建语音识别类构造器
    var constructor = new TeaJs.Function();

    constructor.add([String, Function, Function], function (lang, callback, onError) {
        /// <summary>语音识别构造函数</summary>
        /// <param name="lang" type="String">语言</param>
        /// <param name="callback" type="Function">识别后的回调函数</param>
        /// <param name="onError" type="Function">出现错误的回调函数</param>
        /// <returns type="Speech">语音识别对象</returns>

        if (!window.SpeechRecognition) {
            onError("Does not support \"SpeechRecognition API\".");
        }

        var _this = this;

        // 实例化语音识别对象
        this.recognition = new window.SpeechRecognition();

        // 返回最匹配的5个结果
        this.recognition.maxAlternatives = 5;

        // 设置默认语言
        lang = lang || "zh-cn";

        // 修正中文字符串
        lang = lang.toLowerCase();
        if (lang.indexOf("zh")) {
            switch (lang) {
                case "zh-cn":
                    lang = "cmn-Hans-CN";
                    break;
                case "zh-tw":
                    lang = "cmn-Hant-TW";
                    break;
                case "zh-hk":
                    lang = "yue-Hant-HK";
                    break;
            }
        }

        // 设置语言
        this.recognition.land = lang;

        // 持续聆听
        this.recognition.continuous = true;

        // 不改变结果
        this.recognition.interimResults = false;

        // 事件列表
        var eventList = [
            // 正在接收语音
            { name: "audiostart", status: _this.status.LISTENING },
            // 无法识别
            { name: "nomatch", status: _this.status.UNRECOGNIZED },
            // 发生错误
            {
                name: "error", status: _this.status.ERROR, callback: function (e) {
                    onError(e);
                }
            },
            // 语音识别结束
            {
                name: "end", status: _this.status.STOP, callback: function () {
                    _this.isEnable = false;
                }
            },
            // 识别到了结果
            {
                name: "result", status: _this.status.RESULT, callback: function (event) {
                    if (event.results && event.results.length > 0) {
                        var results = event.results[event.results.length - 1],
                            topResult = results[0];

                        if (topResult.confidence > _this.filter) {
                            var commandWords = topResult.transcript.trim();
                            callback && callback(commandWords);
                        } else {
                            _this.currentStatus = _this.status.UNRECOGNIZED;
                        }
                    }
                }
            }
        ];

        for (var i = 0; i < eventList.length; i++) {
            var el = eventList[i];
            this.recognition["on" + el.name] = function (evt) {
                if (typeof el.status != "undefined") {
                    _this.currentStatus = el.status;
                }
                if (el.callback) {
                    el.callback(evt);
                }
            };
        }

        // 当前状态
        this.currentStatus = this.status.STOP;

        // 匹配程度
        this.filter = 0.5;

        // 是否已启用
        this.isEnable = false;

        // 回调函数
        this.callback = null;
    });

    // 状态
    Speech.prototype.status = {
        // 错误
        ERROR: -1,
        // 停止
        STOP: 0,
        // 正在说话
        LISTENING: 1,
        // 无法识别
        UNRECOGNIZED: 2,
        // 已返回结果
        RESULT: 3
    };

    Object.freeze(Speech.prototype.status);

    // 缓存原型对象
    var speech = Speech.prototype;

    speech.start = function () {
        /// <summary>开始识别</summary>

        // 开始识别
        this.recognition.start();

        // 设置为启用
        this.isEnable = true;
    };

    speech.stop = function () {
        /// <summary>停止识别</summary>

        if (this.isEnable) {
            this.recognition.stop();
            this.isEnable = false;
        }
    };

    TeaJs.Speech = Speech;
}(TeaJs);