void function (TeaJs) {
    "use strict";

    // 画布元素对象
    var canvas = null;

    // 共享数据对象
    var shareData = {
        // 渲染器
        renderer: null,
        // 鼠标
        mouse: null,
        // 触摸列表
        touches: [],
        // 键盘
        keyboard: null,
        // 资源管理器
        content: null,
        // 游戏管理器
        game: null
    };

    // 游戏状态对象
    var gameState = {
        // 更新事件
        onUpdate: null,
        // 绘制事件
        onDraw: null,
        // 卸载事件
        onUnload: null
    };

    window.changeStatus = function (onLoad, onUpdate, onDraw, onUnload) {
        /// <summary>更改游戏状态</summary>
        /// <param name="onLoad" type="Function">加载函数</param>
        /// <param name="onUpdate" type="Function">更新函数</param>
        /// <param name="onDraw" type="Function">绘制函数</param>
        /// <param name="onUnload" type="Function">卸载函数</param>

        // 若已存在某种状态并且需要卸载则首先卸载
        gameState.onUnload && gameState.onUnload(shareData);

        // 如果需要更改到的状态需要加载则开始加载
        onLoad && onLoad(shareData);

        // 改变当前状态使用的函数
        gameState.onUpdate = onUpdate;
        gameState.onDraw = onDraw;
        gameState.onUnload = onUnload;
    };

    document.addEventListener("DOMContentLoaded", function () {
        /// <summary>页面加载完成后触发</summary>

        // 初始化TeaJs框架
        TeaJs("../../Src", true, init);
    }, true);

    function init() {
        /// <summary>初始化游戏数据</summary>

        // 获取画布元素对象
        canvas = document.getElementById("gameCanvas");

        // 设置渲染器
        shareData.renderer = new TeaJs.Renderer.Canvas2D(canvas);
        shareData.renderer.autoSize = true;

        // 设置鼠标
        shareData.mouse = new TeaJs.Mouse(canvas);

        // 设置触摸
        shareData.touches = new TeaJs.Touch(canvas);

        // 设置键盘
        shareData.keyboard = new TeaJs.Keyboard();

        // 设置资源加载器
        shareData.content = new TeaJs.Content("resources");

        // 设置游戏管理器
        shareData.game = new TeaJs.Game(load, update, draw, drawLoader);
        shareData.game.start();
    }

    function load() {
        /// <summary>加载通用资源函数</summary>

        // 缓存内容管理器对象
        var c = shareData.content;

        /* TODO:在此添加您的代码 */

        // 加载游戏脚本
        TeaJs.loadScript("scripts/status/index");
    }

    function update() {
        /// <summary>全局数据更新函数</summary>

        // 如果当前状态需要更新数据则触发更新
        gameState.onUpdate && gameState.onUpdate(shareData);
    }

    function draw() {
        /// <sumaary>全局画面绘制函数</summary>

        // 清空画布
        shareData.renderer.clear();

        // 如果当前状态需要绘制画面则触发绘制
        gameState.onDraw && gameState.onDraw(shareData);
    }

    function drawLoader() {
        /// <summary>全局加载时画面绘制函数</summary>

        // 缓存渲染器对象
        var r = shareData.renderer;

        /* TODO:在此添加您的代码 */
    }

}(TeaJs);