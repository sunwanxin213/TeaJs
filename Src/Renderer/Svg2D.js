/*
    Svg2D渲染器类
*/
void function (TeaJs) {
    "use strict";

    function Svg2D() {
        /// <summary>Svg2D渲染器构造器</summary>
        /// <returns type="Svg2DRenderer">Svg2D渲染器</returns>

        constructor(this, arguments);
    }

    // 获得渲染器构造器函数
    Svg2D.prototype = new TeaJs.Renderer();

    // 创建Svg2D类构造器
    var constructor = new TeaJs.Function();

    // 命名空间
    var xmlnsSvg = "http://www.w3.org/2000/svg",
        xmlnsLink = "http://www.w3.org/1999/xlink",
        xmlnsEv = "http://www.w3.org/2001/xml-events";

    constructor.add([SVGSVGElement], function (canvas) {
        /// <summary>Svg2D渲染器构造函数</summary>
        /// <param name="canvas" type="SVGSVGElement">Svg画布元素</param>
        /// <returns type="Svg2DRenderer">Svg2D渲染器</returns>

        // 获得渲染器构造器属性
        TeaJs.Renderer.call(this, canvas, "Svg2D");

        // 缓存上下文对象
        var canvas = this.canvas;

        // 渐变数量
        this.gradientNum = 0;

        // 设置宽度高度
        this.width = canvas.width.baseVal.value;
        this.height = canvas.height.baseVal.value;

        // 设置Svg声明属性和命名空间
        canvas.setAttribute("version", "1.1");
        canvas.setAttribute("baseProfile", "full");
        canvas.setAttribute("xmlns", xmlnsSvg);
        canvas.setAttribute("xmlns:xlink", xmlnsLink);
        canvas.setAttribute("xmlns:ev", xmlnsEv);

        // 添加定义空间
        var defs = document.createElementNS(xmlnsSvg, "defs");
        canvas.appendChild(defs);

        // 如果不是IE浏览器就使用鼠标事件穿透
        if (navigator.userAgent.toLowerCase().indexOf('msie') < 0) {
            canvas.style.cssText += "pointer-events:none;";
        }
    });

    SVGElement.prototype.bindEvent = function (eventName, callback) {
        /// <summary>绑定事件</summary>
        /// <param name="eventName" type="String">事件名称</param>
        /// <param name="callback" type="Function">回调函数</param>
        /// <returns type="Svg2DRenderer">Svg2D渲染器</returns>

        if (navigator.userAgent.toLowerCase().indexOf('msie') < 0) {
            // 如果不是IE浏览器就不允许鼠标事件穿透
            this.style.cssText += "pointer-events:auto;";
        }
        this.addEventListener(eventName, callback, false);
        return this;
    };

    SVGElement.prototype.removeEvent = function (eventName, callback) {
        /// <summary>移除事件</summary>
        /// <param name="eventName" type="String">事件名称</param>
        /// <param name="callback" type="Function">回调函数</param>
        /// <returns type="Svg2DRenderer">Svg2D渲染器</returns>

        if (navigator.userAgent.toLowerCase().indexOf('msie') < 0) {
            // 如果不是IE浏览器就允许鼠标事件穿透
            this.style.cssText += "pointer-events:none;";
        }
        this.removeEventListener(eventName, callback, false);
        return this;
    };

    SVGElement.prototype.addAnimation = function () {
        /// <summary>添加动画</summary>
        /// <returns type="Svg2DRenderer">Svg2D渲染器</returns>

        var animation = null,
            obj = null;

        for (var i = arguments.length; i--;) {
            obj = arguments[i];

            // 设置属性
            obj.attributeType = "xml";
            obj.attributeName = obj["name"];
            delete obj["name"];
            obj.dur = obj["end"];
            delete obj["end"];

            // 检查是否存在循环
            if (obj["loop"]) {
                obj["loop"] = obj["loop"] == -1 ? "indefinite" : obj["loop"];
                obj.repeatCount = obj["loop"];
                delete obj["loop"];
            }

            // 检查颜色过渡
            if (obj["attributeName"] == "color") {
                obj["attributeName"] = (this.getAttribute("fill") && this.getAttribute("fill") != "rgba(0,0,0,0)") ?
                                        "fill" : "stroke";
            }

            // 创建并添加元素
            animation = document.createElementNS(xmlnsSvg, obj["path"] ? "animateMotion" : "animate");
            animation.id = obj["id"] || null;
            animation.setAttributeNS(null, "fill", "freeze");

            for (var a in obj) {
                animation.setAttributeNS(null, a, obj[a]);
            }
            this.appendChild(animation);
        }
        return this;
    };

    SVGElement.prototype.clearAnimation = function () {
        /// <summary>清空动画</summary>

        while (this.lastChild) {
            this.removeChild(this.lastChild);
        }
    };

    // 缓存原型对象
    var renderer = Svg2D.prototype;

    renderer.addGradient = function (obj, objs) {
        /// <summary>添加一个渐变</summary>
        /// <param name="obj" type="SvgElement">Svg元素</param>
        /// <param name="objs" type="Object">参数...</param>
        /// <returns type="String">渐变效果Id</returns>

        this.gradientNum++;
        var item = document.createElementNS(xmlnsSvg, obj.type + "Gradient");
        item.id = "TeaJs_Svg2D_Gradient" + this.gradientNum;
        for (var i in obj) {
            if (i != "type") {
                item.setAttributeNS(xmlnsSvg, i, obj[i]);
            }
        }
        var stop = null;
        for (var i = 1; i < arguments.length; i++) {
            stop = document.createElementNS(xmlnsSvg, "stop");
            stop.setAttribute('offset', (arguments[i]["offset"] || "0%"));
            stop.setAttribute('stop-color', (arguments[i]["color"] || "#000"));
            stop.setAttribute('stop-opacity', (arguments[i]["opacity"] || "1"));
            item.appendChild(stop);
        }
        this.canvas.getElementsByTagName("defs")[0].appendChild(item);
        return "url(#" + item.id + ")";
    };

    renderer.createItem = function (type, objs) {
        /// <summary>创建项</summary>
        /// <param name="type" type="String">类型</param>
        /// <param name="objs" type="Object">参数对象</param>
        /// <returns type="SvgElement">Svg元素</returns>

        var item = document.createElementNS(xmlnsSvg, type);
        for (var i in objs) {
            if ((i == "fill" || i == "stroke") && objs[i].indexOf("url") >= 0) {
                item.setAttribute('fill', objs[i]);
                continue;
            }
            item.setAttributeNS(i == "href" ? xmlnsLink : null, i, objs[i]);
        }
        this.canvas.appendChild(item);
        return item;
    };

    renderer.removeItem = function (obj) {
        /// <summary>移除项</summary>
        /// <param name="obj" type="Element">要移除的元素</param>

        this.canvas.removeChild(obj);
    };

    renderer.clear = function () {
        /// <summary>清空画布</summary>

        var canvas = this.canvas;
        while (canvas.lastChild) {
            if (canvas.lastChild.tagName != "defs") {
                canvas.removeChild(canvas.lastChild);
            }
        }
        this.canvas.getElementsByTagNameNS(xmlnsSvg, "defs")[0].textContent = "";
    };

    renderer.draw = function (src, x, y, w, h) {
        /// <summary>绘制图像</summary>
        /// <param name="src" type="String">链接地址</param>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <returns type="SvgElement">Svg元素</returns>

        return this.createItem("image", {
            href: src,
            x: x,
            y: y,
            width: w + "px",
            height: h + "px"
        });
    };

    renderer.drawRect = function (x, y, w, h, color, strokeWidth, rx, ry) {
        /// <summary>绘制空心矩形</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="strokeWidth" type="Number" optional="true">画笔宽度</param>
        /// <param name="rx" type="Number" optional="true">圆角X</param>
        /// <param name="ry" type="Number" optional="true">圆角Y</param>
        /// <returns type="SvgElement">Svg元素</returns>

        return this.createItem("rect", {
            x: x,
            y: y,
            width: w + "px",
            height: h + "px",
            stroke: color || "#000",
            "stroke-width": strokeWidth || 1,
            rx: rx || 0,
            ry: ry || 0,
            fill: "rgba(0,0,0,0)"
        });
    };

    renderer.fillRect = function (x, y, w, h, color, rx, ry) {
        /// <summary>绘制实心矩形</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="rx" type="Number" optional="true">圆角X</param>
        /// <param name="ry" type="Number" optional="true">圆角Y</param>
        /// <returns type="SvgElement">Svg元素</returns>

        return this.createItem("rect", {
            x: x,
            y: y,
            width: w + "px",
            height: h + "px",
            fill: color || "#000",
            rx: rx || 0,
            ry: ry || 0
        });
    };

    renderer.drawCircle = function (x, y, r, color, strokeWidth) {
        /// <summary>绘制空心正圆</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="r" type="Number">半径</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="strokeWidth" type="Number" optional="true">画笔宽度</param>
        /// <returns type="SvgElement">Svg元素</returns>

        return this.createItem("circle", {
            cx: x + r,
            cy: y + r,
            r: r + "px",
            stroke: color || "#000",
            "stroke-width": strokeWidth || 1,
            fill: "rgba(0,0,0,0)"
        });
    };

    renderer.fillCircle = function (x, y, r, color) {
        /// <summary>绘制实心正圆</summary>
        /// <param name="x" type="Number">X坐标</param>
        /// <param name="y" type="Number">Y坐标</param>
        /// <param name="r" type="Number">半径</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <returns type="SvgElement">Svg元素</returns>

        return this.createItem("circle", {
            cx: x + r,
            cy: y + r,
            r: r + "px",
            fill: color || "#000"
        });
    };

    renderer.drawEllipse = function (x, y, width, height, color, strokeWidth) {
        /// <summary>绘制空心椭圆</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="width" type="Number">宽度</param>
        /// <param name="height" type="Number">高度</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="strokeWidth" type="Number" optional="true">画笔宽度</param>
        /// <returns type="SvgElement">Svg元素</returns>

        return this.createItem("ellipse", {
            cx: x + width,
            cy: y + height,
            rx: width + "px",
            ry: height + "px",
            stroke: color || "#000",
            "stroke-width": strokeWidth || 1,
            fill: "rgba(0,0,0,0)"
        });
    };

    renderer.fillEllipse = function (x, y, width, height, color, strokeWidth) {
        /// <summary>绘制实心椭圆</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="width" type="Number">宽度</param>
        /// <param name="height" type="Number">高度</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="strokeWidth" type="Number" optional="true">画笔宽度</param>
        /// <returns type="SvgElement">Svg元素</returns>

        return this.createItem("ellipse", {
            cx: x + width,
            cy: y + height,
            rx: width + "px",
            ry: height + "px",
            fill: color || "#000"
        });
    };

    renderer.drawLine = function (x1, y1, x2, y2, color, strokeWidth) {
        /// <summary>绘制线条</summary>
        /// <param name="x1" type="Number">第一个X坐标</param>
        /// <param name="y1" type="Number">第一个Y坐标</param>
        /// <param name="x2" type="Number">第二个X坐标</param>
        /// <param name="y2" type="Number">第二个Y坐标</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="strokeWidth" type="Number" optional="true">画笔宽度</param>
        /// <returns type="SvgElement">Svg元素</returns>

        return this.createItem("line", {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            stroke: color || "#000",
            "stroke-width": strokeWidth || 1
        });
    };

    renderer.drawPolygon = function (points, color, strokeWidth) {
        /// <summary>绘制空心多边形</summary>
        /// <param name="points" type="Array">点数组</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="strokeWidth" type="Number" optional="true">画笔宽度</param>
        /// <returns type="SvgElement">Svg元素</returns>

        var pointsStr = "";
        for (var i = 0; i < points.length; i++) {
            pointsStr += points[i].x + "," + points[i].y + " ";
        }
        return this.createItem("polygon", {
            points: pointsStr,
            stroke: color || "#000",
            "stroke-width": strokeWidth || 1,
            fill: "rgba(0,0,0,0)"
        });
    };

    renderer.fillPolygon = function (points, color) {
        /// <summary>绘制实心多边形</summary>
        /// <param name="points" type="Array">点数组</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <returns type="SvgElement">Svg元素</returns>

        var pointsStr = "";
        for (var i = 0; i < points.length; i++) {
            pointsStr += points[i].x + "," + points[i].y + " ";
        }
        return this.createItem("polygon", {
            points: pointsStr,
            fill: color || "#000"
        });
    };

    renderer.drawPolyline = function (points, color, strokeWidth) {
        /// <summary>绘制折线</summary>
        /// <param name="points" type="Array">点数组</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="strokeWidth" type="画笔宽度" optional="true">画笔宽度</param>
        /// <returns type="SvgElement">Svg元素</returns>

        var pointsStr = "";
        for (var i = 0; i < points.length; i++) {
            pointsStr += points[i].x + "," + points[i].y + " ";
        }
        return this.createItem("polyline", {
            points: pointsStr,
            stroke: color || "#000",
            "stroke-width": strokeWidth || 1,
            fill: "rgba(0,0,0,0)"
        });
    };

    renderer.drawPath = function (d, color, strokeWidth) {
        /// <summary>绘制空心路径</summary>
        /// <param name="d" type="String">命令集</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="strokeWidth" type="Number">画笔宽度</param>
        /// <returns type="SvgElement">Svg元素</returns>

        if (d instanceof Array) {
            var commandStr = "";
            for (var i = 0; i < d.length; i++) {
                commandStr += d[i].split(",").join(" ");
            }
        }
        return this.createItem("path", {
            d: commandStr || d,
            stroke: color || "#000",
            "stroke-width": strokeWidth || 1,
            fill: "rgba(0,0,0,0)"
        });
    };

    renderer.fillPath = function (d, color) {
        /// <summary>绘制实心路径</summary>
        /// <param name="d" type="String">命令集</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <returns type="SvgElement">Svg元素</returns>

        if (d instanceof Array) {
            var commandStr = "";
            for (var i = 0; i < d.length; i++) {
                commandStr += d[i].split(",").join(" ");
            }
        }
        return this.createItem("path", {
            d: commandStr || d,
            fill: color || "#000"
        });
    };

    renderer.drawText = function (str, x, y, color, size, family) {
        /// <summary>绘制空心文字</summary>
        /// <param name="str" type="String">字符串</param>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="size" type="Number" optional="true">文字大小</param>
        /// <param name="family" type="String" optional="true">字体</param>
        /// <returns type="SvgElement">Svg元素</returns>

        var se = this.createItem("text", {
            x: x,
            y: y,
            stroke: color || "#000",
            fill: "rgba(0,0,0,0)",
            "font-size": size || 14,
            "font-family": family || "宋体"
        });
        se.textContent = str;
        return se;
    };

    renderer.fillText = function (str, x, y, color, size, family) {
        /// <summary>绘制实心文字</summary>
        /// <param name="str" type="String">字符串</param>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="color" type="String" optional="true">颜色</param>
        /// <param name="size" type="Number" optional="true">文字大小</param>
        /// <param name="family" type="String" optional="true">字体</param>
        /// <returns type="SvgElement">Svg元素</returns>

        var se = this.createItem("text", {
            x: x,
            y: y,
            stroke: color || "#000",
            fill: color || "#000",
            "font-size": size || 14,
            "font-family": family || "宋体",
        });
        se.textContent = str;
        return se;
    };

    TeaJs.Renderer.Svg2D = Svg2D;
}(TeaJs);