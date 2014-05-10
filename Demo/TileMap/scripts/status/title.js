void function (TeaJs) {
    "use strict";

    function load(shareData) {
        /// <summary>加载资源函数</summary>
        /// <param name="shareData" type="Object">共享数据对象</param>

        // 缓存内容管理器对象
        var c = shareData.content;

        // 缓存渲染器对象
        var r = shareData.renderer;

        TeaJs.loadScript("scripts/status/plots/1");
    }

    function update(shareData) {
        /// <summary>更新数据函数</summary>
        /// <param name="shareData" type="Object">共享数据对象</param>

        // 缓存鼠标对象
        var m = shareData.mouse;

        // 缓存键盘对象
        var k = shareData.keyboard;

        // 缓存触摸对象
        var t = shareData.touches;

        /* TODO:在此添加您的代码 */
    }

    function draw(shareData) {
        /// <summary>绘制画面数据</summary>
        /// <param name="shareData" type="Object">共享数据对象</param>

        // 缓存内容管理器对象
        var c = shareData.content;

        // 缓存渲染器对象
        var r = shareData.renderer;

        /* TODO:在此添加您的代码 */
    }

    function unload(shareData) {
        /// <summary>卸载资源函数</summary>
        /// <param name="shareData" type="Object">共享数据对象</param>

        // 缓存内容管理器对象
        var c = shareData.content;

        /* TODO:在此添加您的代码 */
    }

    // 更改游戏状态至当前状态
    changeStatus(load, update, draw, unload);

}(TeaJs);