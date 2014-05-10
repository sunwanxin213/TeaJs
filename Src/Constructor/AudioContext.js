/*
    音频对象构造器
*/
void function (TeaJs) {
    "use strict";

    function Audio() {
        /// <summary>音频对象构造函数</summary>
        /// <returns type="Audio">音频对象</returns>

        // 缓冲数据
        this.buffer = null;

        // 时间点
        this.time = 0;

        // 音频上下文
        this.context = new window.AudioContext();

        // 音频源
        this.source = null;

        // 合成器缓冲
        this.effectBuffer = null;

        // 分析器
        this.analyser = null;

        // 频率
        this.freqs = null;

        // 时间点
        this.times = null;

        // 起始时间
        this.startTime = 0;

        // 起始偏移量
        this.startOffset = 0;

        // 是否正在播放
        this.isPlaying = false;

        // 是否循环播放
        this.isLoop = false;

        // 是否使用分析器
        this.useAnalyser = false;
    }

    // 缓存原型对象
    var audio = Audio.prototype;

    audio.play = function () {
        /// <summary>播放音频</summary>

        // 设置开始时间
        this.startTime = this.context.currentTime;

        // 创建音频源
        this.source = this.context.createBufferSource();

        // 设置缓冲
        this.source.buffer = this.buffer;

        // 设置源计数模式
        this.source.channelCountMode = "explicit";

        // 设置源解析频道
        this.source.channelInterpretation = "discrete";

        if (this.effectBuffer) {
            // 创建合成器
            var effect = this.context.createConvolver();

            // 设置合成器缓冲
            effect.buffer = this.effectBuffer;

            // 连接合成器
            this.source.connect(effect);

            // 连接目标
            effect.connect(this.context.destination);
        } else {
            // 连接目标
            this.source.connect(this.context.destination);
        }

        if (this.useAnalyser) {
            // 设置分析器
            this.analyser = this.context.createAnalyser();

            // 最小分贝值
            this.analyser.minDecibels = -140;

            // 最大分贝值
            this.analyser.maxDecibels = 0;

            // 平滑值
            this.analyser.smoothingTimeConstant = 0.8;

            // FFT长度
            this.analyser.fftSize = 2048;

            // 设置计数模式
            this.analyser.channelCountMode = "explicit";

            // 设置解析频道
            this.analyser.channelInterpretation = "discrete";

            // 频率
            this.freqs = new Uint8Array(this.analyser.frequencyBinCount);

            // 时间点
            this.times = new Uint8Array(this.analyser.frequencyBinCount);

            // 连接分析器
            this.source.connect(this.analyser);

            // 分析器连接目标
            this.analyser.connect(this.context.destination);
        }

        // 设置循环
        this.source.loop = this.isLoop;

        // 开始播放，但是要确保留在缓冲区内
        this.source.start(0, this.startOffset % this.buffer.duration);

        this.isPlaying = true;
    };

    audio.pause = function () {
        /// <summary>暂停播放</summary>

        this.source.noteOff(0);
        this.startOffset += this.context.currentTime - this.startTime;
        this.isPlaying = false;
    };

    audio.stop = function () {
        /// <summary>停止播放</summary>

        this.source.stop(0);
        this.isPlaying = false;
    };

    audio.getFrequencyValue = function () {
        /// <summary>获取频率</summary>
        /// <returns type="Number">频率</returns>

        var nyquist = this.context.sampleRate / 2;
        var index = Math.round(this.freq / nyquist * this.freqs.length);
        return this.freqs[index];
    };

    TeaJs.AudioContext = Audio;
}(TeaJs);
