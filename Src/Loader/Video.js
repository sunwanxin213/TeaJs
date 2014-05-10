/*
    视频加载器
*/
void function (TeaJs) {
    "use strict";

    function Video() {
        /// <summary>视频加载器构造函数</summary>
        /// <returns type="VideoLoader">视频加载器</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "Video", TeaJs.checkInfo.videoFormats);
    }

    // 获得加载器构造器函数
    Video.prototype = new TeaJs.Loader();

    // 首选格式
    Video.prototype.format = TeaJs.checkInfo.videoFormats[0];

    // 缓存原型对象
    var video = Video.prototype;

    video.load = function (name, fileName, callback) {
        /// <summary>加载视频文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>

        var o = document.createElement("video");
        if (!o.canPlayType) {
            return;
        }

        var _this = this;

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
        o.addEventListener("loadedmetadata", function () {
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
    };

    TeaJs.Loader.Video = Video;
}(TeaJs);
