/*
    45度角2D地图对象


    3D普通无缝贴图转换成2D 45度角贴图方法
    1.图像缩放为原先的70%，画布大小不变并将图像调整到中心位置。
    2.围绕中心点旋转45度、-45度、135度或-135度。
    3.将图片高度调整为原先的一半。
*/
void function (TeaJs) {
    "use strict";

    function Map45Degrees() {
        /// <summary>45度角2D地图构造器</summary>
        /// <returns type="Map45Degrees">45度角2D地图对象</returns>

        constructor(this, arguments);
    }

    // 创建45度角2D地图对象构造器
    var constructor = new TeaJs.Function();

    /*
        构造函数
        参数:
          --Canvas2D渲染器
          --资源管理器
          --行数
          --列数
          --图像列表
          --坐标列表
    */
    constructor.add([TeaJs.Renderer.Canvas2D], function (renderer) {
        /// <summary>45度角2D地图构造函数</summary>
        /// <param name="renderer" type="Canvas2DRenderer">Canvas2D渲染器</param>
        /// <returns type="Map45Degrees">45度角2D地图对象</returns>

        // 设置渲染器对象
        this.renderer = renderer;

        // 设置资源管理器
        this.content = null;

        // 行数
        this.rows = 0;

        // 列数
        this.columns = 0;

        // 图像列表
        this.images = null;

        // 坐标列表
        this.points = null;

        // 缓存图像
        this.catchImage = null;

        // 图块宽度
        this.tileWidth = 0;

        // 图块高度
        this.tileHeight = 0;

        // 默认模式为交错
        this.mode = this.modes.STAGGERED;
    });

    // 缓存45度角2D地图对象原型对象
    var map45Degrees = Map45Degrees.prototype;

    /*
        地图模式
    */
    map45Degrees.modes = {
        // 交错
        STAGGERED: 1,
        // 滑动
        SLIDE: 2,
        // 菱形
        DIAMOND: 3
    };

    Object.freeze(map45Degrees.modes);

    // 数学助手对象
    var math = TeaJs.MathHelper;

    map45Degrees.load = function (content, obj) {
        /// <summary>加载地图</summary>
        /// <param name="content" type="内容管理器"></param>
        /// <param name="obj" type="Object">地图数据对象</param>

        if (!obj["points"] || !obj["images"]) throw new TypeError("Map data errors.");

        this.rows = obj["points"].length;
        for (var i = 0; i < this.rows; i++) {
            this.columns = Math.max(this.columns, obj["points"][i].length);
        }

        this.content = content;
        // 图像名称数组
        this.images = obj["images"];
        // 点数组
        this.points = obj["points"];
        // 小图块宽度
        this.tileWidth = obj["width"] | 0;
        // 小图块高度
        this.tileHeight = obj["height"] | 0;
        this.catchImage = null;
        // 整体方向
        this.setDirection(obj["direction"]);
    };

    map45Degrees.setDirection = function (dir) {
        /// <summary>设置方向</summary>
        /// <param name="dir" type="Number">方向值</param>

        dir |= 0;
        dir = dir || -1;
        if (dir % 2 == 0) dir++;
        this.direction = dir * 45;
    };

    map45Degrees.process = function () {
        /// <summary>处理地图图像</summary>

        var list = [];
        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d"),
            oldCtx = this.renderer.context,
            width = this.tileWidth,
            height = this.tileHeight,
            r = this.renderer,
            imgs = this.images, img;

        r.context = ctx;

        for (var i = 0; i < imgs.length; i++) {
            img = this.content.get(imgs[i]);

            canvas.width = width || (width = img.width);
            canvas.height = height || (height = img.height);

            r.clear();
            r.draw(img, 0, 0, width, height);
            var pixs = r.context.getImageData(0, 0, width, height);
            var iD = pixs.data;
            if (iD[((1 * width + 1) << 2) + 3] && iD[((height - 1 * width + width - 1) << 2) + 3]) {
                r.clear();
                r.beginConvert(math.toRadian(this.direction), 0.7, 0.7);
                r.draw(img, 0, 0, width, height);
                r.endConvert();
            }
            var bit = new Image();
            bit.src = canvas.toDataURL();
            list.push(bit);
        }

        r.context = oldCtx;

        this.tileWidth = width;
        this.tileHeight = height;

        this.images = list;

        this.catch();
    };

    map45Degrees.catch = function () {
        /// <summary>缓存处理</summary>

        var r = this.renderer;
        var tw = this.tileWidth,
            th = this.tileHeight,
            px = 0,
            py = 0;

        var canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d"),
            oldCtx = r.context;
        var size = this.getSize();
        canvas.width = size.width;
        canvas.height = size.height;

        r.context = ctx;

        var img = null;
        for (var x = 0; x < this.columns; x++) {
            for (var y = 0; y < this.rows; y++) {
                if (this.points.length - y <= 0 || this.points[y].length - x <= 0) continue;
                var imgIndex = this.points[y][x];
                var cf = imgIndex.toString().split(".")[1];
                imgIndex |= 0;

                img = this.images[imgIndex];

                var tileCenter = (x * th) + tw / 2;
                px = tileCenter + (y & 1) * tw / 2;
                py = (y + 1) * (th / 2 - th / 4 - 2) - th / 4 + 2;

                cf && r.beginConvert(math.toRadian(4 * 45));

                r.draw(img, px, py, tw, th / 2);

                cf && r.endConvert();
            }
        }

        r.context = oldCtx;

        var img = new Image();
        img.src = canvas.toDataURL();
        this.catchImage = img;
    };

    map45Degrees.getSize = function () {
        /// <summary>获取地图尺寸</summary>
        /// <returns type="Size">尺寸对象</returns>

        return {
            width: this.tileWidth * this.rows,
            height: this.tileHeight * this.columns
        };
    };

    map45Degrees.draw = function (px, py, width, height) {
        /// <summary>绘制地图</summary>
        /// <param name="px" type="Number">X坐标</param>
        /// <param name="py" type="Number">Y坐标</param>
        /// <param name="width" type="Number">宽度</param>
        /// <param name="height" type="Number">高度</param>

        !this.catchImage && this.process();

        var r = this.renderer;
        var img = this.catchImage;

        px = px || 0,
        py = py || 0;
        width = width || r.width;
        height = height || r.height;

        r.draw(img, px, py);
    };

    TeaJs.Plugins.Map45Degrees = Map45Degrees;
}(TeaJs);