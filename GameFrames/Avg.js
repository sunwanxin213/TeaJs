/*
    Avg游戏框架
*/
void function (TeaJs) {
    "use strict";

    function Avg() {
        /// <summary>Avg游戏对象构造器</summary>
        /// <returns type="Avg">Avg游戏对象</returns>

        constructor(this, arguments);
    }

    // 创建Avg游戏框架对象构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer.Canvas2D, Array], function (renderer, devices) {
        /// <summary>Avg游戏对象构造函数</summary>
        /// <param name="renderer" type="Canvas2DRenderer">Canvas2D渲染器</param>
        /// <param name="devices" type="Array">设备列表</param>
        /// <returns type="Avg">Avg游戏对象</returns>

        // 设置渲染器对象
        this.renderer = renderer;

        // 当前状态
        this.status = "title";

        // 设备列表
        this.devices = devices;

        // 是否按下按键
        this.isClick = false;
    });

    // 缓存Avg游戏原型对象
    var avg = Avg.prototype;

    // 游戏设置
    avg.settings = {
        // 显示标题界面
        showTitle: true,
        // 标题设置
        titleSettings: {
            // 背景[可用值为：颜色、Image对象、Video对象、Canvas对象]
            background: "rgb(100, 149, 237)",
            // 字体
            font: "Bold 36px 微软雅黑,黑体",
            // 开始游戏按钮参数
            startButton: {
                text: "开始游戏",
                rectangle: new TeaJs.Rectangle(200, 200, 200, 50),
                background: "#fff",
                hoverBackground: "#888",
                color: "#000"
            },
            // 继续游戏按钮参数
            continueButton: {
                text: "继续游戏",
                rectangle: new TeaJs.Rectangle(200, 300, 200, 50),
                background: "#fff",
                hoverBackground: "#888",
                color: "#000"
            },
            // 游戏设置按钮参数
            settingsButton: {
                text: "游戏设置",
                rectangle: new TeaJs.Rectangle(200, 400, 200, 50),
                background: "#fff",
                hoverBackground: "#888",
                color: "#000"
            },
            // 退出游戏按钮参数
            exitButton: {
                text: "退出游戏",
                rectangle: new TeaJs.Rectangle(200, 500, 200, 50),
                background: "#fff",
                hoverBackground: "#888",
                color: "#000"
            }
        }
    };

    avg.drawTitle = function () {
        /// <summary>绘制默认标题</summary>

        // 缓存渲染器
        var r = this.renderer;

        // 缓存标题设置对象
        var ts = this.settings.titleSettings;

        // 整体背景
        var bg = ts.background;

        // 按钮列表
        var buttonList = [];
        for (var btn in ts) {
            if (btn.indexOf("Button") >= 0) {
                buttonList.push(ts[btn]);
            }
        }

        // 绘制整体背景
        if (typeof bg == "string") {
            r.fillRect(0, 0, r.width, r.height, bg);
        }
        else if (bg instanceof HTMLCanvasElement || bg instanceof Image) {
            r.draw(bg, 0, 0, r.width, r.height);
        }

        // 缓存按钮对象
        var button,
            buttonBg,
            buttonRect,
            textSize;

        for (var i = 0; i < buttonList.length; i++) {
            button = buttonList[i];
            buttonBg = buttonList[i].background;
            buttonRect = button.rectangle;
            textSize = r.getTextSize(button.text, ts.font);
            // 绘制按钮背景
            if (typeof buttonBg == "string") {
                button.rectangle.draw(r, button.background);
            }
            else if (buttonBg instanceof HTMLCanvasElement || buttonBg instanceof Image) {
                r.draw(buttonBg, buttonRect.x, buttonRect.y, buttonRect.width, buttonRect.height);
            }

            // 绘制按钮文字
            r.fillText(button.text,
                       buttonRect.x + (buttonRect.width - textSize.width) / 2,
                       buttonRect.y + textSize.height / 4 + buttonRect.height / 2,
                       button.color, ts.font);
        }
    };

    avg.draw = function (currentTime) {
        if (avg.settings.showTitle && this.status == "title") {
            this.drawTitle();
        }
    };

    avg.updateDevices = function () {
        this.devices.forEach(function (obj, index) {
            if (obj instanceof TeaJs.Mouse) {

            } else if (obj instanceof TeaJs.Keyboard) {

            } else if (obj instanceof Array) {

            }
        });
    };

    avg.update = function (currecntTime) {
        this.updateDevices();
    };

    TeaJs.GameFrames.Avg = Avg;
}(TeaJs);