/*
    屏幕管理器
*/
void function () {
    "use strict";

    function Screen() {
        /// <summary>屏幕管理器构造函数</summary>
        /// <returns type="Screen">屏幕管理器</returns>

        // 当前全屏元素
        this.fsElement = null;

        // 原尺寸
        this.sourceSize = { width: 0, height: 0 };
    }

    // 禁止页面选择
    window.onselectstart = function () { return false; };
    document.body.style.cssText += "-moz-user-select:none;" +
                                   "-webkit-user-select:none;" +
                                   "-ms-user-select: none;" +
                                   "user-select: none;";


    // 屏幕管理器原型对象
    var s = Screen.prototype;

    s.lockDirection = function (direction) {
        /// <summary>锁定屏幕方向</summary>
        /// <param name="direction" type="Number">要锁定的方向&#10;0为不锁定&#10;1为横屏&#10;2为竖屏</param>
        /// <returns type="Boolean">是否锁定成功</returns>

        if (!screen.lockOrientation || !screen.unlockOrientation) return false;
        switch (direction) {
            case 1:
                // 锁定为横屏
                screen.lockOrientation(["landscape-primary", "landscape-secondary"]);
                break;
            case 2:
                // 锁定为竖屏
                screen.lockOrientation(["portrait-primary", "portrait-secondary"]);
                break;
            case 0:
                // 解锁屏幕方向
                screen.unlockOrientation();
                break;
        }
        return true;
    };

    s.capture = function (canvas, type) {
        /// <summary>截取游戏屏幕</summary>
        /// <param name="canvas" type="CanvasRenderer">Canvas渲染器</param>
        /// <param name="type" type="String" optional="true">图像格式</param>
        /// <returns type="String">Base64图像字符串</returns>

        if (canvas instanceof HTMLCanvasElement) {
            return canvas.toDataURL("image/" + (type || "png"));
        }
        return "";
    };

    s.captureToImage = function (canvas, type) {
        /// <summary>截取游戏屏幕到图像</summary>
        /// <param name="canvas" type="CanvasRenderer">Canvas渲染器</param>
        /// <param name="type" type="String" optional="true">图像格式</param>
        /// <returns type="Image">图像对象</returns>

        var img = new Image();
        img.src = this.capture(canvas, type);
        return img;
    };

    s.fullscreen = function (element) {
        /// <summary>全屏</summary>
        /// <param name="element" type="Element" optional="true">要全屏的Html元素</param>

        element = element || document.documentElement;
        if (!element.requestFullscreen) return;
        this.fsElement = element;
        this.sourceSize.width = element.style.width;
        this.sourceSize.height = element.style.height;
        element.style.width = screen.width + "px";
        element.style.height = screen.height + "px";
        element.requestFullscreen();
    };

    s.exitFullscreen = function () {
        /// <summary>退出全屏</summary>

        if (!this.fsElement) return;
        this.fsElement.style.width = this.sourceSize.width;
        this.fsElement.style.height = this.sourceSize.height;
        this.fsElement = null;
        document.exitFullscreen();
    }

    function fullscreenChange() {
        /// <summary>全屏状态被更改</summary>

        var obj = TeaJs.Screen.fsElement;
        var apiList = ["webkitFullscreenElement",
                      "mozFullscreenElement",
                      "mozFullScreenElement",
                      "oFullscreenElement",
                      "msFullscreenElement",
                      "fullscreenElement"];
        for (var i in apiList) {
            if (document[apiList[i]] == obj) {
                return;
            }
        }
        TeaJs.Screen.exitFullscreen();
    }

    document.addEventListener('fullscreenchange', fullscreenChange, false);
    document.addEventListener('mozfullscreenchange', fullscreenChange, false);
    document.addEventListener('webkitfullscreenchange', fullscreenChange, false);

    TeaJs.Screen = new Screen();
}(TeaJs);