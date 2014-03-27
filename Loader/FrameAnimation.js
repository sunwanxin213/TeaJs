/*
    帧动画加载器
*/
void function (TeaJs) {
    "use strict";

    function FrameAnimation() {
        /// <summary>帧动画加载器构造函数</summary>
        /// <returns type="FrameAnimationLoader">帧动画加载器对象</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "FrameAnimation", "tfa.js".split(" "));
    }

    // 获得加载器构造器函数
    FrameAnimation.prototype = new TeaJs.Loader();

    // 缓存原型对象
    var frameAnimation = FrameAnimation.prototype;

    frameAnimation.load = function (name, fileName, callback) {
        /// <summary>加载帧动画文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>

        var _this = this;

        TeaJs.loadFile(fileName, false, null, function (str) {
            // 实例化动画对象
            var frameObject = new FrameObject(eval('(' + str.toLowerCase() + ')'));

            // 加入到项列表中
            _this.itemList.push({
                name: name,
                object: frameObject,
                unload: function () {
                    frameObject.stop();
                }
            });

            // 执行回调函数
            callback && callback(frameObject);
        });
    };

    function FrameObject(obj) {
        /// <summary>帧动画对象</summary>
        /// <param name="obj" type="Object">数据对象</param>

        var interval = 100;
        var playName = "";
        var currentSubIndex = 0;

        // 动画计时器
        var timer = null;

        this.run = function () {
            /// <summary>执行动画</summary>

            if (!playName || !obj[playName]) return;
            var d = obj[playName];
            if (currentSubIndex++ >= d.length - 1) {
                currentSubIndex = 0;
            }
        }

        this.play = function (callback, name, speed) {
            /// <summary>播放动画</summary>
            /// <param name="callback" type="Function">回调函数</param>
            /// <param name="name" type="String">要更改的动画名称</param>
            /// <param name="speed" type="Number">要更改的播放速度</param>

            if (!name && !playName) return;
            if (name && name.toLowerCase() != playName.toLowerCase()) {
                currentSubIndex = 0;
                playName = name.toLowerCase();
            }
            if (speed && interval != speed) {
                interval = speed;
                this.stop();
            }
            if (!timer) {
                timer = setInterval(this.run, interval);
            }

            var d = obj[playName][currentSubIndex];
            var rect = new TeaJs.Rectangle(d.x, d.y, d.width, d.height);
            callback && callback(rect);
        };

        this.stop = function () {
            /// <summary>停止动画</summary>

            clearInterval(timer);
            timer = null;
        };
    }

    TeaJs.Loader.FrameAnimation = FrameAnimation;
}(TeaJs);