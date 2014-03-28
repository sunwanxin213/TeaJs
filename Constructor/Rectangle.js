/*
    矩形对象构造器
*/
void function (TeaJs) {
    "use strict";

    function Rectangle() {
        /// <summary>矩形对象构造器</summary>
        /// <returns type="Rectangle">矩形对象</returns>

        constructor(this, arguments);

        var rp = Rectangle.prototype;

        if (!rp.drawStruc) {
            // 绘制矩形构造函数
            rp.drawStruc = new TeaJs.Function();

            rp.drawStruc.add([TeaJs.Renderer.Canvas2D, String, Number], function (r, c, l) {
                /// <summary>绘制矩形构造函数</summary>
                /// <param name="r" type="CanvasRenderer">Canvas渲染器</param>
                /// <param name="c" type="String">颜色</param>
                /// <param name="l" type="Number">线条宽度</param>

                r.drawRect(this.x, this.y, this.width, this.height, c, l);
            });

            rp.drawStruc.add([TeaJs.Renderer.Canvas2D, String], function (r, c) {
                /// <summary>绘制矩形构造函数</summary>
                /// <param name="r" type="CanvasRenderer">Canvas渲染器</param>
                /// <param name="c" type="String">颜色</param>

                r.fillRect(this.x, this.y, this.width, this.height, c);
            });

            rp.drawStruc.add([TeaJs.Renderer.Canvas2D, Number, String, Number], function (r, round, c, l) {
                /// <summary>绘制圆角矩形构造函数</summary>
                /// <param name="r" type="CanvasRenderer">Canvas渲染器</param>
                /// <param name="round" type="Number">圆角半径</param>
                /// <param name="c" type="String">颜色</param>
                /// <param name="l" type="Number">线条宽度</param>

                r.drawRoundRect(this.x, this.y, this.width, this.height, round, c, l);
            });

            rp.drawStruc.add([TeaJs.Renderer.Canvas2D, Number, String], function (r, round, c) {
                /// <summary>绘制圆角矩形构造函数</summary>
                /// <param name="r" type="CanvasRenderer">Canvas渲染器</param>
                /// <param name="round" type="Number">圆角半径</param>
                /// <param name="c" type="String">颜色</param>

                r.fillRoundRect(this.x, this.y, this.width, this.height, round, c);
            });
        }
    }

    // 创建矩形类构造器
    var constructor = new TeaJs.Function();

    constructor.add([], function () {
        /// <summary>矩形构造函数</summary>
        /// <returns type="Rectangle">矩形对象</returns>

        this.x = 0,
        this.y = 0;
        this.width = 1;
        this.height = 1;
    });

    constructor.add([Number, Number, Number, Number], function (x, y, w, h) {
        /// <summary>矩形构造函数</summary>
        /// <param name="x" type="Number">X坐标</param>
        /// <param name="y" type="Number">Y坐标</param>
        /// <param name="w" type="Number">矩形宽度</param>
        /// <param name="h" type="Number">矩形高度</param>
        /// <returns type="Rectangle">矩形对象</returns>

        this.x = x,
        this.y = y;
        this.width = w;
        this.height = h;
    });

    constructor.add([Rectangle], function (r) {
        /// <summary>矩形构造函数</summary>
        /// <param name="r" type="Rectangle">矩形对象</param>
        /// <returns type="Rectangle">矩形对象</returns>

        this.x = r.x,
        this.y = r.y;
        this.width = r.width;
        this.height = r.height;
    });

    // 缓存矩形原型对象
    var rectangle = Rectangle.prototype;

    rectangle.toString = function () {
        /// <summary>转换为字符串</summary>
        /// <returns type="String">格式化后的字符串</returns>

        return "{X:" + this.x + " Y:" + this.y + " Width:" + this.width + " Height:" + this.height + "}";
    };

    rectangle.clone = function () {
        /// <summary>克隆对象</summary>
        /// <returns type="Rectangle">矩形对象</returns>

        return new Rectangle(this);
    };

    /*
        判断矩形是否相交构造函数
    */
    rectangle.intersectsStruc = new TeaJs.Function();

    rectangle.intersectsStruc.add([Rectangle], function (rect) {
        /// <summary>判断矩形是否相交构造函数</summary>
        /// <param name="rect" type="Rectangle">矩形对象</param>
        /// <returns type="Boolean">是否相交</returns>

        return TeaJs.Bounds.intersects(this, rect);
    });

    rectangle.intersectsStruc.add([Number, Number], function (x, y) {
        /// <summary>判断矩形是否相交构造函数</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <returns type="Boolean">是否相交</returns>

        return TeaJs.Bounds.intersects(this.x, this.y, this.width, this.height, x, y, 1, 1);
    });

    rectangle.intersectsStruc.add([Number, Number, Number, Number], function (x, y, w, h) {
        /// <summary>判断矩形是否相交构造函数</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <returns type="Boolean">是否相交</returns>

        return TeaJs.Bounds.intersects(this.x, this.y, this.width, this.height, x, y, w, h);
    });

    rectangle.intersects = function () {
        /// <summary>判断矩形是否相交</summary>
        /// <returns type="Boolean">是否相交</returns>

        return this.intersectsStruc(this, arguments);
    };

    rectangle.draw = function () {
        /// <summary>绘制矩形</summary>

        this.drawStruc(this, arguments);
    };

    rectangle.offset = function (x, y, w, h) {
        /// <summary>矩形相加</summary>
        /// <param name="r" type="Rectangle">矩形对象</param>
        /// <returns type="Rectangle">矩形对象</returns>

        return new TeaJs.Rectangle(this.x + x, this.y + y, this.width + w, this.height + h);
    };

    TeaJs.Rectangle = Rectangle;
}(TeaJs);