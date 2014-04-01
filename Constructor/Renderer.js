/*
    渲染器对象构造器
*/
void function (TeaJs) {
    "use strict";

    function Renderer() {
        /// <summary>渲染器对象构造器</summary>
        /// <returns type="Renderer">渲染器对象</returns>

        if (!arguments.length) return;
        constructor(this, arguments);

        var _this = this;

        // 宽高比
        this.ratio = this.width / this.height;

        // 禁止右键菜单
        this.canvas.oncontextmenu = function () { return false; };

        // 禁止拖拽
        this.canvas.setAttribute("draggable", "false");

        var isAutoSize = false;
        // 是否自动缩放属性
        Object.defineProperty(this, "autoSize", {
            get: function () { return isAutoSize; },
            set: function (value) { if (isAutoSize != (value = !!value)) autoSize(_this, isAutoSize = value); }
        });

        // 输出调试信息
        if (TeaJs.isDebug && this.canvas.id) {
            console.log("Element \"%s\" has been constructed using %s renderer.", this.canvas.id, this.rendererMode);
        }
    }

    function setCanvasStyle(canvas) {
        /// <summary>设置画布样式</summary>
        /// <param name="canvas" type="Render">Svg或Canvas元素</param>

        // 追加画布样式
        canvas.style.cssText += "-webkit-user-select:none;" +
                                "-webkit-tap-highlight-color:rgba(0,0,0,0);";
    }

    // 创建渲染器类构造器
    var constructor = new TeaJs.Function();

    constructor.add([SVGSVGElement, String], function (canvas, rendererMode) {
        /// <summary>Svg渲染器构造函数</summary>
        /// <param name="canvas" type="SVGSVGElement">Svg元素</param>
        /// <param name="rendererMode" type="String">渲染模式</param>
        /// <returns type="SvgRenderer">Svg渲染器</returns>

        this.rendererMode = rendererMode;
        this.canvas = canvas;

        this.width = canvas.width,
        this.height = canvas.height;

        setCanvasStyle(this.canvas);
    });

    constructor.add([HTMLElement, String, Array], function (canvas, rendererMode, contextList) {
        /// <summary>Canvas渲染器构造函数</summary>
        /// <param name="canvas" type="HTMLCanvasElement or HTMLObjectElement">Canvas元素</param>
        /// <param name="rendererMode" type="String">渲染模式</param>
        /// <param name="contextList" type="Array">上下文列表</param>
        /// <returns type="CanvasRenderer">Canvas渲染器</returns>

        this.rendererMode = rendererMode;
        this.canvas = canvas;
        this.context = null;

        this.width = canvas.width,
        this.height = canvas.height;

        setCanvasStyle(this.canvas);

        // 尝试获取上下文
        for (var i = 0; i < contextList.length && !this.context; i++) {
            this.context = canvas.getContext(contextList[i]);
        }

        if (!this.context) {
            throw new Error("Failed to create \"" + rendererMode + "\" context.");
        }
    });

    // 缓存渲染器原型对象
    var renderer = Renderer.prototype;

    renderer.clear = function () {
        /// <summary>清空画布</summary>

        throw new Error(this.rendererMode + " Function \"clear\" is not implemented.");
    };

    renderer.resize = function (w, h) {
        /// <summary>重新设置尺寸</summary>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>

        var c = renderer.canvas;

        this.width = c.width = w;
        this.height = c.height = h;
    };

    function autoSize(renderer, isAuto) {
        /// <summary>自动调整尺寸</summary>
        /// <param name="renderer" type="Render">SvgRenderer或CanvasRenderer</param>
        /// <param name="isAuto" type="Boolean">是否启用自动调整</param>

        var _this = renderer;
        var pe = (renderer.canvas.parentElement || renderer.canvas.parentNode || document.body);

        function resize() {
            var c = _this.canvas,
                pw = pe.clientWidth,
                ph = pe.clientHeight,
                w = _this.width,
                h = _this.height;

            var scaling = Math.min(pw / w, ph / h);

            if (_this.rendererMode.toLowerCase().indexOf("svg") >= 0) {
                // Svg专用自动设置大小
                c.setAttribute("viewBox", "0 0 " + w + " " + h);
                c.setAttribute("width", (w * scaling) + "px");
                c.setAttribute("height", (h * scaling) + "px");
            } else {
                // Canvas专用自动设置大小
                c.style.width = (w * scaling) + "px";
                c.style.height = (h * scaling) + "px";
            }
            if (pe == document.body) {
                c.style.marginTop = (ph / 2 - (h * scaling) / 2) + "px";
                c.style.marginLeft = (pw / 2 - (w * scaling) / 2) + "px";
            }
        }

        if (isAuto) {
            // 窗口大小改变更改画布大小
            window.addEventListener("resize", resize, false);
            if (pe == document.body) {
                // 强制使用单屏应用方式
                var ss = document.createElement("style");
                ss.innerHTML = "html,body {" +
                               "margin: 0;" +
                               "padding: 0;" +
                               "width: 100%;" +
                               "height: 100%;" +
                               "overflow: hidden;}";
                document.getElementsByTagName("head").item(0).appendChild(ss);
                if (TeaJs.checkInfo.system == "android") {
                    document.body.style.overflow = "visible";
                    document.body.style.WebkitTransform = "translateZ(0)";
                }
            }
            resize();
        } else {
            window.removeEventListener("resize", resize, false);
        }
    };

    TeaJs.Renderer = Renderer;
}(TeaJs);