/*
    TTS语音合成
*/
void function (TeaJs) {
    "use strict";

    // 语言列表
    var ttsList = {
        englishTTS: '/cgi-bin/espeak.pl?cache=1&text=',
        mandarinTTS: '/cgi-bin/ekho.pl?voice=mandarin&cache=1&text=',
        fastMandarinTTS: '/cgi-bin/ekho.pl?voice=fast_mandarin&cache=1&text=',
        hindiTTS: '/cgi-bin/espeak.pl?voice=hi&cache=1&text=',
        frenchTTS: '/cgi-bin/espeak.pl?voice=fr&cache=1&text=',
        germanTTS: '/cgi-bin/espeak.pl?voice=de&cache=1&text=',
        cantoneseTTS: '/cgi-bin/ekho.pl?voice=cantonese&cache=1&text=',
        fastCantoneseTTS: '/cgi-bin/ekho.pl?voice=fast_cantonese&cache=1&text='
    };

    function TTS() {
        /// <summary>语音合成构造器</summary>
        /// <returns type="TTS">语音合成对象</returns>

        constructor(this, arguments);
    }

    // 创建TTS语音合成类构造器
    var constructor = new TeaJs.Function();

    constructor.add([], function () {
        /// <summary>语音合成构造函数</summary>
        /// <returns type="TTS">语音合成对象</returns>

        var list = ["Mandarin"];
        constructor(this, list);
    });

    constructor.add([String], function (lang) {
        /// <summary>语音合成构造函数</summary>
        /// <param name="lang" type="String">语言</param>
        /// <returns type="TTS">语音合成对象</returns>

        if (!(new Audio().canPlayType("audio/mpeg"))) {
            throw new Error("Does not support \"TTS\".");
        }

        // 语言
        this.language = lang;

        // 朗读服务器
        this.speechServer = "http://wa.eguidedog.net";

        // 朗读列表
        this.speechQueue = [];

        // 朗读索引
        this.speechId = 0;

        // 服务器
        this.ttsServer = ttsList.mandarinTTS;

        switch (this.language) {
            // 汉语
            case 'Mandarin': this.ttsServer = ttsList.mandarinTTS; break;
                // 快速汉语
            case 'FastMandarin': this.ttsServer = ttsList.fastMandarinTTS; break;
            case 'Hindi': this.ttsServer = ttsList.hindiTTS; break;
            case 'French': this.ttsServer = ttsList.frenchTTS; break;
            case 'German': this.ttsServer = ttsList.germanTTS; break;
                // 粤语
            case 'Cantonese': this.ttsServer = ttsList.cantoneseTTS; break;
                // 快速粤语
            case 'FastCantonese': this.ttsServer = ttsList.fastCantoneseTTS; break;
                // 英语
            case 'English': // keep English last as default
            default: this.ttsServer = ttsList.englishTTS;
        }
    });

    // 缓存语音合成对象
    var tts = TTS.prototype;

    tts.play = function (text) {
        /// <summary>朗读</summary>
        /// <param name="text" type="String">文本</param>

        var _this = this;

        // 生成音频对象
        var audio = new Audio();

        // 当可以播放时触发
        audio.oncanplaythrough = function () {
            audio.addEventListener("ended", function () {
                _this.speechQueue[_this.speechId] = null;
                _this.speechId++;
                audio = null;
                if (_this.speechId != _this.speechQueue.length) {
                    _this.speechQueue[_this.speechId].play();
                }
            });
        };

        audio.src = this.speechServer + this.ttsServer + escape(text);

        this.speechQueue.push(audio);
        if (_this.speechId != _this.speechQueue.length) {
            _this.speechQueue[_this.speechId].play();
        }
    };

    TeaJs.TTS = TTS;
}(TeaJs);