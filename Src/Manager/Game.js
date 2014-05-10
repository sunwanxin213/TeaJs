/*
    游戏管理器
*/
void function (TeaJs) {
    "use strict";

    function Game() {
        /// <summary>游戏管理器构造器</summary>
        /// <returns type="Game">游戏管理器</returns>

        constructor(this, arguments);
    }

    // 创建游戏管理器类构造器
    var constructor = new TeaJs.Function();

    constructor.add([Function, Function, Function, Function], function (onLoad, onUpdate, onDraw, onDrawLoading) {
        /// <summary>游戏管理器构造函数</summary>
        /// <param name="onLoad" type="Function" optional="true">加载函数</param>
        /// <param name="onUpdate" type="Function" optional="true">更新函数</param>
        /// <param name="onDraw" type="Function" optional="true">绘制函数</param>
        /// <param name="onDrawLoading" type="Function" optional="true">加载中使用的绘制函数</param>
        /// <returns type="Game">游戏管理器</returns>

        // 设置函数
        onLoad();
        this.onUpdate = onUpdate;
        this.onDraw = onDraw;
        this.onDrawLoading = onDrawLoading;

        // 是否已开始游戏
        this.isStart = false;

        // 当前FPS值
        this.fps = 0;

        // FPS计数器
        this.fpsNum = 0;

        // 上一个Fps统计时间点
        this.previousFrameTimeStamp = 0;

        // 缓存内容管理器原型对象
        this.content = TeaJs.Content.prototype;

        // 缓存鼠标原型对象
        this.mouse = TeaJs.Mouse.prototype;
    });

    // 缓存游戏管理器原型对象
    var game = Game.prototype;

    // 缓存动画帧对象
    var timer = null;

    game.start = function (speed) {
        /// <summary>开始游戏</summary>
        /// <param name="speed" type="Number" optional="true">游戏帧数</param>

        var _this = this;

        this.isStart = true;

        if (speed) {
            timer = function (callback) { setTimeout(callback, 1000 / speed); };
        }
        else {
            timer = window.requestAnimationFrame;
        }

        timer(function (currentTime) {
            _this.run(currentTime);
        });
    };

    game.run = function (currentTime) {
        /// <summary>执行游戏</summary>
        /// <param name="currentTime" type="Number">游戏当前时间</param>

        var _this = this;

        if (!this.isStart) return;

        this.fpsStats(currentTime);

        if (this.content.isLoading) {
            this.onDrawLoading && this.onDrawLoading(currentTime);
        }
        else {
            this.onUpdate && this.onUpdate(currentTime);
            this.onDraw && this.onDraw(currentTime);
            this.mouse.lockObject && this.mouse.lockObject.clear();
        }

        timer(function (currentTime) {
            _this.run(currentTime);
        });
    };

    game.stop = function () {
        /// <summary>停止游戏</summary>

        this.isStart = false;
        window.cancelAnimationFrame(timer);
    };

    game.fpsStats = function (currentTime) {
        /// <summary>统计Fps</summary>
        /// <param name="currentTime" type="Number">游戏当前时间</param>

        if (currentTime === undefined) {
            currentTime = new Date();
        }

        if (currentTime - this.previousFrameTimeStamp >= 1000) {
            this.previousFrameTimeStamp = currentTime;

            // 更新Fps
            this.fps = this.fpsNum;
            this.fpsNum = 0;
        }

        this.fpsNum++;
    };

    TeaJs.Game = Game;
}(TeaJs);