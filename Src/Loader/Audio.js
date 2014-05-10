/*
    音频加载器
*/
void function (TeaJs) {
    "use strict";

    function Audio() {
        /// <summary>音频加载器构造函数</summary>
        /// <returns type="AudioLoader">音频加载器</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "Audio", TeaJs.checkInfo.audioFormats);

        if (window.AudioContext && audio.isDecode) {
            // 加载效果文件
            this.loadEffect();
        }
    }

    // 获得加载器构造器函数
    Audio.prototype = new TeaJs.Loader();

    // 缓存原型对象
    var audio = Audio.prototype;

    // 效果列表
    audio.effectList = [];

    // 首选格式
    audio.format = TeaJs.checkInfo.audioFormats[0];

    // 是否解析
    audio.isDecode = false;

    // 效果文件列表
    var effectFile = ["telephone.ogg", "telephone.mp3",
                      "spring.ogg", "spring.mp3",
                      "muffler.ogg", "muffler.mp3"];

    audio.loadEffect = function () {
        /// <summary>加载效果文件</summary>

        var _this = this;
        var loadDone = [];

        effectFile.forEach(function (i) {
            if (loadDone.join().indexOf(i.split(".")[0]) >= 0) return;
            try {
                _this.load("TeaJs-SoundEffect-" + i.split(".")[0],
                           TeaJs.path + "Resources/SoundEffect/" + i,
                           function (obj) {
                               _this.effectList.forEach(function (ei) {
                                   if (ei == i) {
                                       return;
                                   }
                               });
                               _this.effectList.push(i.split(".")[0], obj.buffer);
                           });
                loadDone.push(i.split(".")[0]);
            } catch (e) { }
        });
    };

    audio.load = function (name, fileName, callback) {
        /// <summary>加载文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>

        if (!document.createElement("audio").canPlayType) {
            return;
        }

        if (!this.isDecode || !window.AudioContext || !TeaJs.AudioContext) {
            this.oldLoad(name, fileName, callback);
            return;
        }

        var audioObj = new TeaJs.AudioContext(),
            _this = this;

        // 使用Ajax加载音频数据
        TeaJs.loadFile(fileName, true, "arraybuffer", function (arr) {
            audioObj.context.decodeAudioData(
                arr,
                function (buffer) {
                    if (!buffer) {
                        console.error("Error decoding file data: " + fileName);
                        return;
                    }

                    // 设置缓冲
                    audioObj.buffer = buffer;

                    // 加入到项列表中
                    _this.itemList.push({
                        name: name,
                        object: audioObj,
                        unload: function () {
                            audioObj.stop();
                            for (var i in audioObj) audioObj[i] = null;
                            audioObj = null;
                        }
                    });

                    // 执行回调函数
                    callback && callback(audioObj);
                },
                function (error) {
                    throw new Error(error);
                }
            );
        });
    };

    audio.oldLoad = function (name, fileName, callback) {
        /// <summary>Html音频对象加载器</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>

        var _this = this;

        var o = document.createElement("audio");

        o.setAttribute("preload", "preload");

        o.addEventListener("pause", function () {
            this.isPlaying = false;
        }, false);

        o.addEventListener("play", function () {
            this.isPlaying = true;
        }, false);

        o.addEventListener("ended", function () {
            if (this.isLoop) {
                this.stop();
                this.play();
            }
        }, false);

        // 加载完成后触发
        o.addEventListener("canplaythrough", function () {
            // 加入到项列表中
            _this.itemList.push({
                name: name,
                object: o,
                unload: function () {
                    o.stop();
                }
            });

            // 执行回调函数
            callback && callback(o);
        }, false);

        o.addEventListener("error", function (e) {
            if (this.error.code == 4) {
                callback && callback(o);
            } else {
                throw new Error(e);
            }
        }, false);

        o.src = fileName;

        o.load();
    }

    if (TeaJs.AudioContext) TeaJs.AudioContext.prototype.setEffect = function (name) {
        /// <summary>设置效果</summary>
        /// <param name="name" type="String">效果名称</param>

        if (!name) {
            this.effectBuffer = null;
            return;
        }
        var efList = audio.effectList;
        for (var i = 0; i < efList.length; i += 2) {
            if (name == efList[i]) {
                this.effectBuffer = efList[i + 1];
                break;
            }
        }
    };

    TeaJs.Loader.Audio = Audio;
}(TeaJs);
