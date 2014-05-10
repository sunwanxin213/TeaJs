/// <reference path="../TeaJs/TeaJs0.1.5.min.js" />
void function (TeaJs) {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        TeaJs("../../Src", true, init);
    }, false);

    // 画布元素对象
    var canvas;

    // 游戏状态对象
    var gs;

    // 共享数据对象
    var sd;

    function init() {
        /// <summary>初始化</summary>

        // 引入自定义Rpg扩展
        TeaJs.loadScript("scripts/RpgFrameAvgExpand");

        // 实例化渲染器
        canvas = document.getElementById("gameCanvas");

        // 设置共享数据对象
        sd = {
            // 初始化Canvas2D渲染器并绑定到画布元素对象
            renderer: new TeaJs.Renderer.Canvas2D(canvas),
            // 初始化鼠标对象并绑定到画布元素对象
            mouse: new TeaJs.Mouse(canvas),
            // 初始化触控对象并绑定到画布元素对象
            touches: new TeaJs.Touch(canvas),
            // 初始化键盘捕获器
            keyboard: new TeaJs.Keyboard(),
            // 初始化游戏手柄管理器
            gamepad: new TeaJs.Gamepad(),
            // 初始化资源管理器
            content: new TeaJs.Content("resources"),
            // 初始化游戏管理器
            game: new TeaJs.Game(void 0, update, draw, drawLoader)
        };

        // 实例化Rpg游戏框架
        sd.rpg = new TeaJs.Plugins.Rpg(sd.renderer, sd.content, [sd.mouse, sd.touches, sd.keyboard]);

        // 设置游戏状态对象
        gs = {
            // 更新事件
            onUpdate: void 0,
            // 绘制事件
            onDraw: void 0,
            // 卸载事件
            onUnload: void 0
        };

        window.changeStatus = function (onLoad, onUpdate, onDraw, onUnload) {
            /// <summary>更改游戏状态</summary>
            /// <param name="onLoad" type="Function">加载函数</param>
            /// <param name="onUpdate" type="Function">更新函数</param>
            /// <param name="onDraw" type="Function">绘制函数</param>
            /// <param name="onUnload" type="Function">卸载函数</param>

            // 若已存在某种状态并且需要卸载则首先卸载
            gs.onUnload && gs.onUnload(sd);

            // 改变当前状态使用的函数
            gs.onUpdate = onUpdate;
            gs.onDraw = onDraw;
            gs.onUnload = onUnload;

            // 如果需要更改到的状态需要加载则开始加载
            onLoad && onLoad(sd);
        };

        // 同比缩放
        sd.renderer.autoSize = true;

        // 开始游戏
        sd.game.start() && loadContent();

        // 加载游戏脚本
        TeaJs.loadScript("scripts/status/title");
    };

    function loadContent() {
        /// <summary>加载通用资源函数</summary>

        /* TODO:在此添加您的代码 */
    }

    function update() {
        /// <summary>全局数据更新函数</summary>

        // 如果当前状态需要更新数据则触发更新
        gs.onUpdate && gs.onUpdate(sd);
    }

    function draw() {
        /// <sumaary>全局画面绘制函数</summary>

        // 清空画布
        sd.renderer.clear();

        // 如果当前状态需要绘制画面则触发绘制
        gs.onDraw && gs.onDraw(sd);
    }

    function drawLoader() {
        /// <summary>全局加载时画面绘制函数</summary>

        // 缓存渲染器对象
        var r = sd.renderer;

        r.clear();
        var text = "正在加载并解压地图数据",
        textFont = "36px bold 宋体",
        textSize = r.getTextSize(text, textFont),
        textCenter = {
            x: (r.width - textSize.width) / 2,
            y: (r.height - textSize.height) / 2
        };
        r.fillText(text, textCenter.x, textCenter.y, "#000", textFont);
    }
}(TeaJs);