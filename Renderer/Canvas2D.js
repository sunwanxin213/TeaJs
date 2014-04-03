/*
    Canvas2D渲染器类
*/
void function (TeaJs) {
    "use strict";

    // 上下文列表
    var contextList = ["2d"];

    function Canvas2D() {
        /// <summary>Canvas2D对象构造器</summary>
        /// <returns type="Canvas2D">Canvas2D渲染器</returns>

        constructor(this, arguments);
    }

    // 获得渲染器构造器函数
    Canvas2D.prototype = new TeaJs.Renderer();

    // 创建Canvas2D类构造器
    var constructor = new TeaJs.Function();

    constructor.add([HTMLElement], function (canvas) {
        /// <summary>Canvas2D渲染器构造函数</summary>
        /// <param name="canvas" type="HTMLCanvasElement">Canvas元素</param>
        /// <returns type="Canvas2DRenderer">Canvas2D渲染器</returns>

        // 获得渲染器构造器属性
        TeaJs.Renderer.call(this, canvas, "Canvas2D", contextList);

        if (TeaJs.checkInfo.system == "android") {
            document.body.style.overflow = "visible";
            document.body.style.WebkitTransform = "translateZ(0)";
        }

        // 图片处理插件
        this.plugins = [];
    });

    // 缓存原型对象
    var renderer = Canvas2D.prototype;

    // 是否开始变换
    var isBeginConvert = false;

    // 变换参数
    var convertArrs = {
        rotate: null,
        scaleX: null,
        scaleY: null
    };

    renderer.clear = function () {
        /// <summary>清空画布</summary>

        this.context.clearRect(0, 0, this.width, this.height);
    };

    Canvas2D.crateBufferRenderer = renderer.crateBufferRenderer = function (width, height) {
        /// <summary>创建缓冲渲染器</summary>
        /// <param name="width" type="Number">画布宽度</param>
        /// <param name="height" type="Number">画布高度</param>

        var c = document.createElement("canvas");
        c.width = width,
        c.height = height;
        return new TeaJs.Renderer.Canvas2D(c);
    };

    var textMetricElement = document.createElement("span");
    textMetricElement.style.cssText = "position:absolute;top:-1000px;left:0;z-index:-1000;color:transparent;";
    document.body.appendChild(textMetricElement);
    renderer.getTextHeight = function (str, font) {
        /// <summary>获取文本高度</summary>
        /// <param name="str" type="String">要获取的字符串</param>
        /// <param name="font" type="String" optional="true">字体</param>
        /// <returns type="Number">高度</returns>

        textMetricElement.style.font = tolerantFont(font) || this.context.font;
        textMetricElement.textContent = str;
        return textMetricElement.offsetHeight;
    };

    renderer.getTextWidth = function (str, font) {
        /// <summary>获取文字宽度</summary>
        /// <param name="str" type="String">要获取的字符串</param>
        /// <param name="font" type="String" optional="true">字体</param>
        /// <returns type="Number">宽度</returns>

        textMetricElement.style.font = tolerantFont(font) || this.context.font;
        textMetricElement.textContent = str;
        return textMetricElement.offsetWidth;
    };

    renderer.getTextSize = function (str, font) {
        /// <summary>获取文字尺寸</summary>
        /// <param name="str" type="String">要获取的字符串</param>
        /// <param name="font" type="String" optional="true">字体</param>
        /// <returns type="Size">尺寸</returns>

        return {
            width: this.getTextWidth(str, font),
            height: this.getTextHeight(str, font)
        }
    };

    renderer.processPiexls = function (x, y, w, h, fun) {
        /// <summary>处理像素</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="fun" type="Function">处理函数</param>

        var pixs = this.context.getImageData(x, y, w, h);
        var data = pixs.data;
        fun && fun(data);
        this.context.putImageData(pixs, x, y);
    };

    renderer.getPattern = function (img, repeatMode, x, y, w, h) {
        /// <summary>获取贴图</summary>
        /// <param name="img" type="Image">图像对象</param>
        /// <param name="repeatMode" type="String">重复模式</param>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <returns type="Pattern">贴图</returns>

        if (typeof x != "undefined") {
            var c = document.createElement("canvas");
            c.width = w;
            c.height = h;
            var ctx = c.getContext("2d");
            ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
            return this.context.createPattern(c, repeatMode || "repeat");
        }
        else {
            return this.context.createPattern(img, repeatMode || "repeat");
        }
    };

    renderer.begin = function (alpha, composite) {
        /// <summary>开始绘制</summary>
        /// <param name="alpha" type="Number" optional="true">全局Alpha值</param>
        /// <param name="composite" type="String" optional="true">全局合成操作</param>

        var ctx = this.context;
        ctx.save();
        if (typeof alpha == "undefined" || alpha == null) { ctx.globalAlpha = 1.0; }
        else { ctx.globalAlpha = alpha; }
        ctx.globalCompositeOperation = composite || "source-over";
    };

    renderer.end = function () {
        /// <summary>结束绘制</summary>

        this.useEffect();

        this.context.restore();
    };

    renderer.useEffect = function () {
        var ps = this.plugins,
            p = null,
            ctx = this.context;

        // 处理插件效果
        for (var i = ps.length; i--;) {
            p = ps[i];
            if (p.isEnable && p.type == "Globa") { p.process(); }
        }
    };

    renderer.beginConvert = function (rotate, scaleX, scaleY) {
        /// <summary>开始变换</summary>
        /// <param name="rotate" type="Number" optional="true">旋转值</param>
        /// <param name="scaleX" type="Number" optional="true">X缩放值</param>
        /// <param name="scaleY" type="Number" optional="true">Y缩放值</param>

        isBeginConvert = true;
        convertArrs.scaleX = scaleX || 1;
        convertArrs.scaleY = scaleY || 1;
        convertArrs.rotate = rotate || 0;
    };

    renderer.endConvert = function () {
        /// <summary>结束变换</summary>

        isBeginConvert = false;
        convertArrs.scaleX = 0;
        convertArrs.scaleY = 0;
        convertArrs.rotate = 0;
    };

    renderer.useConvert = function (x, y, w, h, callback) {
        /// <summary>使用变换绘制</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="callback" type="Function">回调函数</param>

        var t = convertArrs,
            ctx = this.context;


        if (!isBeginConvert || (!x && !y && !w && !h)) {
            callback.call(this);
        } else {
            ctx.translate(x + w * 0.5, y + h * 0.5);
            ctx.scale(t.scaleX, t.scaleY);
            t.rotate && ctx.rotate(t.rotate);
            callback.call(this);
            t.rotate && ctx.rotate(-t.rotate);
            ctx.scale(1 / t.scaleX, 1 / t.scaleY);
            ctx.translate(-(x + w * 0.5), -(y + h * 0.5));
        }
    };

    renderer.setShadow = function (offsetX, offsetY, blur, color) {
        /// <summary>设置阴影</summary>
        /// <param name="offsetX" type="Number">偏移X坐标</param>
        /// <param name="offsetY" type="Number">偏移Y坐标</param>
        /// <param name="blur" type="Number">模糊度</param>
        /// <param name="color" type="String">颜色</param>

        var ctx = this.context;
        ctx.shadowOffsetX = offsetX || 0;
        ctx.shadowOffsetY = offsetY || 0;
        ctx.shadowBlur = blur || 0;
        ctx.shadowColor = color || "#000";
    };

    renderer.draw = function (obj, x1, y1, w1, h1, x2, y2, w2, h2) {
        /// <summary>绘制图像</summary>
        /// <param name="obj" type="Image">图像对象</param>
        /// <param name="x1" type="Number">X位置</param>
        /// <param name="y1" type="Number">Y位置</param>
        /// <param name="w1" type="Number">宽度</param>
        /// <param name="h1" type="Number">高度</param>
        /// <param name="x2" type="Number">剪裁X位置</param>
        /// <param name="y2" type="Number">剪裁Y位置</param>
        /// <param name="w2" type="Number">剪裁宽度</param>
        /// <param name="h2" type="Number">剪裁高度</param>

        var ctx = this.context,
            argsLength = arguments.length;

        x1 = x1 || 0;
        y1 = y1 || 0;
        w1 = w1 || obj.width;
        h1 = h1 || obj.height;

        // 使用变换函数绘制
        this.useConvert(x1, y1, w1, h1, function () {
            if (isBeginConvert) {
                x1 = -0.5 * w1;
                y1 = -0.5 * h1;
            }

            var ps = this.plugins,
                p = null;

            // 开始插件绘制
            for (var i = 0; i < ps.length; i++) {
                p = ps[i];
                if (p.type == "Image" && p.isEnable) {
                    p.begin(obj, x1, y1, w1, h1, x2, y2, w2, h2);
                }
            }

            ctx = this.context;
            switch (argsLength) {
                case 1:
                    ctx.drawImage(obj, 0, 0);
                    break;
                case 3:
                    ctx.drawImage(obj, x1, y1);
                    break;
                case 5:
                    ctx.drawImage(obj, x1, y1, w1, h1);
                    break;
                case 9:
                    ctx.drawImage(obj, x2, y2, w2, h2, x1, y1, w1, h1);
                    break;
            }

            // 结束插件绘制
            for (var i = 0; i < ps.length; i++) {
                p = ps[i];
                if (p.type == "Image" && p.isEnable) {
                    p.end(obj, x1, y1, w1, h1, x2, y2, w2, h2);
                }
            }
        });
    };

    renderer.drawLine = function (x1, y1, x2, y2, color, lineWidth, cap) {
        /// <summary>绘制线条</summary>
        /// <param name="x1" type="Number">点1的X坐标</param>
        /// <param name="y1" type="Number">点1的Y坐标</param>
        /// <param name="x2" type="Number">点2的X坐标</param>
        /// <param name="y2" type="Number">点2的Y坐标</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="lineWidth" type="Number" optional="true">线条宽度</param>
        /// <param name="cap" type="String" optional="true">闭合样式</param>

        var ctx = this.context;

        this.useConvert(null, null, null, null, function () {
            ctx.strokeStyle = color || "#000";
            ctx.lineWidth = lineWidth || 1.0;
            ctx.lineCap = cap || "butt";

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
        });
    };

    renderer.drawRect = function (x, y, w, h, color, lineWidth) {
        /// <summary>绘制空心矩形</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="lineWidth" type="Number" optional="true">线条宽度</param>

        var ctx = this.context;

        // 使用变换函数绘制
        this.useConvert(x, y, w, h, function () {
            ctx.strokeStyle = color || "#000";
            ctx.lineWidth = lineWidth || 1.0;

            if (isBeginConvert) {
                ctx.strokeRect(-0.5 * w, -0.5 * h, w, h);
            }
            else {
                ctx.strokeRect(x, y, w, h);
            }
        });
    };

    renderer.fillRect = function (x, y, w, h, color) {
        /// <summary>绘制实心矩形</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="color" type="String" optional="true">颜色</param>

        var ctx = this.context;

        // 使用变换函数绘制
        this.useConvert(x, y, w, h, function () {
            ctx.fillStyle = color || "#000";
            if (isBeginConvert) {
                ctx.fillRect(-0.5 * w, -0.5 * h, w, h);
            }
            else {
                ctx.fillRect(x, y, w, h);
            }
        });
    };

    renderer.drawRoundRect = function (x, y, w, h, r, color, lineWidth, isFill) {
        /// <summary>绘制空心圆角矩形</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="r" type="Number">圆角半径</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="lineWidth" type="Number" optional="true">线条宽度</param>

        var ctx = this.context;

        // 使用变换函数绘制
        this.useConvert(x, y, w, h, function () {
            // 检查半径是否合理
            r = w < (2 * r) ? (w / 2) : h < (2 * r) ? (h / 2) : r;

            color = color || "#000";

            if (isFill) ctx.fillStyle = color;
            else ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth || 1.0;

            if (isBeginConvert) {
                x *= -0.5;
                y *= -0.5;
            }
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
            if (isFill ? ctx.fill() : ctx.stroke()) { };
        });
    };

    renderer.fillRoundRect = function (x, y, w, h, r, color) {
        /// <summary>绘制实心矩形</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="r" type="Number">圆角半径</param>
        /// <param name="color" type="String" optional="true">颜色</param>

        this.drawRoundRect(x, y, w, h, r, color, null, true);
    };

    renderer.drawEllipse = function (x, y, w, h, color, lineWidth, isFill) {
        /// <summary>绘制空心椭圆</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="lineWidth" type="Number" optional="true">线条宽度</param>
        /// <param name="isFill" type="Boolean" optional="true">是否填充</param>

        var ctx = this.context;

        // 使用变换函数绘制
        this.useConvert(x, y, w, h, function () {
            if (isFill) ctx.fillStyle = color || "#000";
            else ctx.strokeStyle = color || "#000";
            ctx.lineWidth = lineWidth || 1.0;

            if (isBeginConvert) {
                x = -0.5 * w;
                y = -0.5 * h;
            }

            // 关键是bezierCurveTo中两个控制点的设置
            // 0.5和0.6是两个关键系数（在本函数中为试验而得）
            var ox = 0.5 * w,
                oy = 0.6 * h;

            ctx.beginPath();
            // 从椭圆纵轴下端开始逆时针方向绘制
            ctx.moveTo(0, h);
            ctx.bezierCurveTo(ox, h, w, oy, w, 0);
            ctx.bezierCurveTo(w, -oy, ox, -h, 0, -h);
            ctx.bezierCurveTo(-ox, -h, -w, -oy, -w, 0);
            ctx.bezierCurveTo(-w, oy, -ox, h, 0, h);
            ctx.closePath();
            (isFill) ? ctx.fill() : ctx.stroke();
        });
    };

    renderer.fillEllipse = function (x, y, w, h, color) {
        /// <summary>绘制实心椭圆</summary>
        /// <param name="x" type="Number">X坐标</param>
        /// <param name="y" type="Number">Y坐标</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="color" type="String" optional="true">颜色</param>

        this.drawEllipse(x, y, w, h, color, null, true);
    };

    renderer.drawCircle = function (x, y, radius, color, lineWidth, isFill) {
        /// <summary>绘制空心正圆</summary>
        /// <param name="x" type="Number">X坐标</param>
        /// <param name="y" type="Number">Y坐标</param>
        /// <param name="radius" type="Number">半径</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="lineWidth" type="Number" optional="true">线条宽度</param>
        /// <param name="isFill" type="Boolean">是否填充</param>

        var ctx = this.context;

        // 使用变换函数绘制
        this.useConvert(null, null, null, null, function () {
            if (isFill) ctx.fillStyle = color || "#000";
            else ctx.strokeStyle = color || "#000";
            ctx.lineWidth = lineWidth || 1.0;

            ctx.beginPath();
            ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, false);
            ctx.closePath();
            (isFill) ? ctx.fill() : ctx.stroke();
        });
    };

    renderer.fillCircle = function (x, y, radius, color) {
        /// <summary>绘制实心正圆</summary>
        /// <param name="x" type="Number">X坐标</param>
        /// <param name="y" type="Number">Y坐标</param>
        /// <param name="radius" type="Number">半径</param>
        /// <param name="color" type="String" optional="true">颜色</param>

        this.drawCircle(x, y, radius, color, null, true);
    };

    renderer.drawPolygon = function (list, color, lineWidth, lineJoin, isFill) {
        /// <summary>绘制空心多边形</summary>
        /// <param name="list" type="Array">点数组</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="lineWidth" type="Number" optional="true">线条宽度</param>
        /// <param name="lineJoin" type="String" optional="true">线条闭合样式</param>
        /// <param name="isFill" type="Boolean">是否填充</param>

        var ctx = this.context,
            x = list[0].x,
            y = list[0].y,
            w = list[0].x,
            h = list[0].y;

        if (isBeginConvert) {
            for (var i = list.length; i--;) {
                x = Math.min(list[i].x, x);
                y = Math.min(list[i].y, y);
                w = Math.max(list[i].x, w);
                h = Math.max(list[i].y, h);
            }
            w -= x;
            h -= y;
        }

        this.useConvert(x, y, w, h, function () {
            if (isFill) ctx.fillStyle = color || "#000000";
            else ctx.strokeStyle = color || "#000000";
            ctx.lineWidth = lineWidth || 1.0;
            ctx.lineJoin = lineJoin || "miter";

            ctx.beginPath();
            if (isBeginConvert) {
                for (var i = list.length; i--; ctx.lineTo((list[i].x - x) + (-0.5 * w), (list[i].y - y) + (-0.5 * h)));
            }
            else {
                ctx.moveTo(list[0].x, list[0].y);
                for (var i = list.length; i-- > 0; ctx.lineTo(list[i].x, list[i].y));
            }
            ctx.closePath();
            (isFill) ? ctx.fill() : ctx.stroke();
        });
    };

    renderer.fillPolygon = function (list, color) {
        /// <summary>绘制填充多边形</summary>
        /// <param name="list" type="Array">点数组</param>
        /// <param name="color" type="String" optional="true">颜色</param>

        this.drawPolygon(list, color || "#000000", null, null, true);
    };

    function tolerantFont(font) {
        /// <summary>字体字符串容错</summary>
        /// <param name="font" type="String">字体</param>
        /// <returns type="String">字体</returns>

        font = font || "";

        // 容错
        return font.toString()
            .toLowerCase()
            .replace("blod", "bold")
            .replace("xp", "px")
            .replace("bold", "bold ")
            .replace("px", "px ");
    }

    renderer.drawText = function (text, x, y, color, font) {
        /// <summary>绘制空心文字</summary>
        /// <param name="text" type="String">字符串</param>
        /// <param name="x" type="Number">X坐标</param>
        /// <param name="y" type="Number">Y坐标</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="font" type="String" optional="true">字体</param>

        var ctx = this.context;
        var _this = this;

        this.useConvert(null, null, null, null, function () {
            ctx.strokeStyle = color || "#000000";
            ctx.font = tolerantFont(font) || "Bold 14px Arial";

            var fontHeight = _this.getTextHeight(text, font);
            var strList = text.split("\r\n");
            for (var i = 0; i < strList.length; i++) {
                ctx.strokeText(strList[i], x, y + fontHeight * i);
            }
        });
    };

    renderer.fillText = function (text, x, y, color, font) {
        /// <summary>绘制填充文字</summary>
        /// <param name="text" type="String">字符串</param>
        /// <param name="x" type="Number">X坐标</param>
        /// <param name="y" type="Number">Y坐标</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="font" type="String" optional="true">字体</param>

        var ctx = this.context;
        var _this = this;

        this.useConvert(null, null, null, null, function () {
            ctx.fillStyle = color || "#000000";
            ctx.font = tolerantFont(font) || "Bold 14px Arial";

            var fontHeight = _this.getTextHeight(text, font);
            var strList = text.split("\r\n");
            for (var i = 0; i < strList.length; i++) {
                ctx.fillText(strList[i], x, y + fontHeight * i);
            }
        });
    };

    TeaJs.Renderer.Canvas2D = Canvas2D;
}(TeaJs);