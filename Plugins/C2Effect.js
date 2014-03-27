/*
    模糊效果滤镜
*/
void function (TeaJs) {
    "use strict";

    /*
        模糊效果滤镜对象构造器
    */
    function Blur() {
        /// <summary>模糊效果滤镜对象构造器</summary>
        /// <returns type="BlurEffect">模糊效果对象</returns>

        constructor(this, arguments);
    }

    // 获得Canvas2D效果构造器函数
    Blur.prototype = new TeaJs.C2Effect();

    // 创建模糊效果滤镜构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer.Canvas2D], function (renderer) {
        /// <summary>模糊效果滤镜构造函数</summary>
        /// <param name="renderer" type="CanvasRenderer">Canvas渲染器</param>
        /// <returns type="Blur">模糊效果滤镜对象</returns>

        var args = [renderer, "Globa"];

        // 获得Canvas2D效果构造器属性
        TeaJs.C2Effect.apply(this, args);
    });

    // 缓存模糊效果滤镜原型对象
    var blur = Blur.prototype;

    blur.process = function () {
        /// <summary>处理画布效果</summary>

        var r = this.renderer,
            _this = this,
            w = r.width,
            h = r.height;

        r.processPiexls(0, 0, w, h, function (data) {
            /// <summary>处理像素数据</summary>
            /// <param name="data" type="Uint8Array">像素数据数组</param>

            var matrix = [0, 1, 0,
                          1, 1, 1,
                          0, 1, 0];

            _this.convolutionMatrix(data, w, h, matrix, 5, 0);
        });
    };

    TeaJs.C2Effect.Blur = Blur;
}(TeaJs);

/*
    增加对比度效果滤镜
*/
void function (TeaJs) {
    "use strict";

    /*
        增加对比度效果滤镜对象构造器
    */
    function Contrast() {
        /// <summary>增加对比度效果滤镜对象构造器</summary>
        /// <returns type="ContrastEffect">增加对比度效果对象</returns>

        constructor(this, arguments);
    }

    // 获得Canvas2D效果构造器函数
    Contrast.prototype = new TeaJs.C2Effect();

    // 创建增加对比度效果滤镜构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer.Canvas2D], function (renderer) {
        /// <summary>增加对比度效果滤镜构造函数</summary>
        /// <param name="renderer" type="CanvasRenderer">Canvas渲染器</param>
        /// <returns type="Contrast">增加对比度效果滤镜对象</returns>

        var args = [renderer, "Globa"];

        // 获得Canvas2D效果构造器属性
        TeaJs.C2Effect.apply(this, args);
    });

    // 缓存增加对比度效果滤镜原型对象
    var contrast = Contrast.prototype;

    contrast.process = function () {
        /// <summary>处理画布效果</summary>

        var r = this.renderer,
            _this = this,
            w = r.width,
            h = r.height;

        r.processPiexls(0, 0, w, h, function (data) {
            /// <summary>处理像素数据</summary>
            /// <param name="data" type="Uint8Array">像素数据数组</param>

            var matrix = [0, 0, 0,
                          0, 2, 0,
                          0, 0, 0];

            _this.convolutionMatrix(data, w, h, matrix, 1, -255);
        });
    };

    TeaJs.C2Effect.Contrast = Contrast;
}(TeaJs);

/*
    黑白效果滤镜
*/
void function (TeaJs) {
    "use strict";

    function Desaturate() {
        /// <summary>黑白效果滤镜对象构造器</summary>

        constructor(this, arguments);
    }

    // 获得Canvas2D效果构造器函数
    Desaturate.prototype = new TeaJs.C2Effect();

    // 创建黑白效果滤镜构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer.Canvas2D], function (renderer) {
        /// <summary>黑白效果滤镜构造函数</summary>
        /// <param name="renderer" type="CanvasRenderer">Canvas渲染器</param>
        /// <returns type="DesaturateEffect">黑白效果滤镜对象</returns>

        var args = [renderer, "Globa"];

        // 获得Canvas2D效果构造器属性
        TeaJs.C2Effect.apply(this, args);
    });

    // 缓存黑白效果滤镜原型对象
    var desaturate = Desaturate.prototype;

    desaturate.process = function () {
        /// <summary>处理画布效果</summary>

        var r = this.renderer;

        r.processPiexls(0, 0, r.width, r.height, processPixels);
    };

    function processPixels(data) {
        /// <summary>处理像素数据</summary>
        /// <param name="data" type="Uint8Array">像素数据数组</param>

        var i = data.length;
        while ((i -= 4) > 0) {
            data[i] = data[i + 1] = data[i + 2] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        }
    }

    TeaJs.C2Effect.Desaturate = Desaturate;
}(TeaJs);

/*
    反色效果滤镜
*/
void function (TeaJs) {
    "use strict";

    function Inverting() {
        /// <summary>反色效果滤镜对象构造器</summary>
        /// <returns type="InvertingEffect">反色效果滤镜对象</returns>

        constructor(this, arguments);
    }

    // 获得Canvas2D效果构造器函数
    Inverting.prototype = new TeaJs.C2Effect();

    // 创建反色效果滤镜构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer.Canvas2D], function (renderer) {
        /// <summary>反色效果滤镜构造函数</summary>
        /// <param name="renderer" type="CanvasRenderer">Canvas渲染器</param>
        /// <returns type="InvertingEffect">反色效果滤镜对象</returns>

        var args = [renderer, "Globa"];

        // 获得Canvas2D效果构造器属性
        TeaJs.C2Effect.apply(this, args);
    });

    // 缓存反色效果滤镜原型对象
    var inverse = Inverting.prototype;

    inverse.process = function () {
        /// <summary>处理画布效果</summary>

        var r = this.renderer;

        r.processPiexls(0, 0, r.width, r.height, processPixels);
    };

    function processPixels(data) {
        /// <summary>处理像素数据</summary>
        /// <param name="data" type="Uint8Array">像素数据数组</param>

        var i = data.length;
        var ff = 0xff;
        while ((i -= 4) > 0) {
            data[i] ^= ff;
            data[i + 1] ^= ff;
            data[i + 2] ^= ff;
        }
    }

    TeaJs.C2Effect.Inverting = Inverting;
}(TeaJs);

/*
    浮雕效果滤镜
*/
void function (TeaJs) {
    "use strict";

    function Relief(args) {
        /// <summary>浮雕效果滤镜对象构造器</summary>
        /// <returns type="ReliefEffect">浮雕效果滤镜对象</returns>

        constructor(this, arguments);
    }

    // 获得Canvas2D效果构造器函数
    Relief.prototype = new TeaJs.C2Effect();

    // 创建浮雕效果滤镜构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer.Canvas2D], function (renderer) {
        /// <summary>浮雕效果滤镜对象构造函数</summary>
        /// <param name="renderer" type="CanvasRenderer">Canvas渲染器</param>
        /// <returns type="ReliefEffect">浮雕效果滤镜对象</returns>

        var args = [renderer, "Globa"];

        // 获得Canvas2D效果构造器属性
        TeaJs.C2Effect.apply(this, args);

        // 浮雕值
        this.amount = .9;
    });

    // 缓存浮雕效果滤镜原型对象
    var relief = Relief.prototype;

    relief.process = function () {
        /// <summary>处理画布效果</summary>

        var r = this.renderer,
            _this = this,
            w = r.width,
            h = r.height;

        r.processPiexls(0, 0, w, h, function (data) {
            /// <summary>处理像素数据</summary>
            /// <param name="data" type="Uint8Array">像素数据数组</param>

            var matrix = [1, 1, 1,
                          1, _this.amount, -1,
                          -1, -1, -1];

            _this.convolutionMatrix(data, w, h, matrix, 1, 0);
        });
    };

    TeaJs.C2Effect.Relief = Relief;
}(TeaJs);

/*
    锐化效果滤镜
*/
void function (TeaJs) {
    "use strict";

    function Sharpen() {
        /// <summary>锐化效果滤镜对象构造器</summary>
        /// <returns type="SharpenEffect">锐化效果滤镜对象</returns>

        constructor(this, arguments);
    }

    // 获得Canvas2D效果构造器函数
    Sharpen.prototype = new TeaJs.C2Effect();

    // 创建锐化效果滤镜构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer.Canvas2D], function (renderer) {
        /// <summary>锐化效果滤镜构造函数</summary>
        /// <param name="renderer" type="CanvasRenderer">Canvas渲染器</param>
        /// <returns type="SharpenEffect">锐化效果滤镜对象</returns>

        var args = [renderer, "Globa"];

        // 获得Canvas2D效果构造器属性
        TeaJs.C2Effect.apply(this, args);

        // 锐化值
        this.amount = 5;
    });

    // 缓存锐化效果滤镜原型对象
    var sharpen = Sharpen.prototype;

    sharpen.process = function () {
        /// <summary>处理画布效果</summary>

        var r = this.renderer,
            _this = this,
            w = r.width,
            h = r.height;

        r.processPiexls(0, 0, w, h, function (data) {
            /// <summary>处理像素数据</summary>
            /// <param name="data" type="Uint8Array">像素数据数组</param>

            // 计算锐化矩阵
            var mete_1 = -(_this.amount - 1) / 4;
            var mete_2 = 0;
            var matrix =
            [
                mete_2, mete_1, mete_2,
                mete_1, _this.amount, mete_1,
                mete_2, mete_1, mete_2
            ];

            _this.convolutionMatrix(data, w, h, matrix, 1, 0);
        });
    };

    TeaJs.C2Effect.Sharpen = Sharpen;
}(TeaJs);

/*
    阴影效果处理器
*/
void function (TeaJs) {
    "use strict";

    function Shadow(args) {
        /// <summary>阴影效果处理器对象构造器</summary>
        /// <returns type="ShadowEffect">阴影效果处理器对象</returns>

        constructor(this, arguments);
    }

    // 获得Canvas2D效果构造器函数
    Shadow.prototype = new TeaJs.C2Effect();

    // 创建阴影效果处理器类构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer.Canvas2D], function (renderer) {
        /// <summary>阴影效果处理器构造函数</summary>
        /// <param name="renderer" type="CanvasRenderer">Canvas渲染器</param>
        /// <returns type="ShadowEffect">阴影效果对象</returns>

        var args = [renderer, "Image"];

        // 获得Canvas2D效果构造器属性
        TeaJs.C2Effect.apply(this, args);

        // 旧上下文
        this.oldCtx = renderer.context;

        // 阴影颜色
        this.color = "rgba(0,0,0,0.5)";

        // 南北角度
        this.angleNS = 20;

        // 东西角度
        this.angleEW = 30;

        // 缓存列表
        this.cacheList = [];

        // 缓冲画布
        this.buffCanvas = document.createElement("canvas");

        // 临时画布
        this.tempCanvas = document.createElement("canvas");
        this.tempCanvasCtx = this.buffCanvas.getContext("2d");
    });

    // 缓存阴影原型对象
    var shadow = Shadow.prototype;

    shadow.begin = function (image, x, y, w, h, x1, y1, w1, h1) {
        /// <summary>开始绘制处理</summary>
        /// <param name="image" type="Image">图像对象</param>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">绘制宽度</param>
        /// <param name="h" type="Number">绘制高度</param>
        /// <param name="x1" type="Number">剪裁X位置</param>
        /// <param name="y1" type="Number">剪裁Y位置</param>
        /// <param name="w1" type="Number">剪裁宽度</param>
        /// <param name="h1" type="Number">剪裁高度</param>

        // 防止误使用插件
        if (arguments.length != 9) return;

        // 范围限定
        if (this.angleNS > 45) this.angleNS = 45;
        else if (this.angleNS < -45) this.angleNS = -45;
        if (this.angleEW > 45) this.angleEW = 45;
        else if (this.angleEW < -45) this.angleEW = -45;

        // 绘制图像到缓冲画布
        var imageWidth = w || image.width,
            imageHeight = h || image.height;

        // 设置影子大小
        var stageWidth = imageWidth * 3,
            stageHeight = imageHeight * 3;

        // 确保宽高够用
        if (stageHeight < stageWidth) stageHeight += stageWidth;
        else stageWidth += stageHeight;

        // 设置中心点位置
        var imageX = ((stageWidth - imageWidth) / 2) >> 0,
            imageY = ((stageHeight - imageHeight) / 2) >> 0;

        // 设置缓冲画布大小
        this.buffCanvas.width = stageWidth;
        this.buffCanvas.height = stageHeight;

        // 如果阴影不在屏幕范围内则不绘制
        if (!(this.renderer.width >= x - imageX &&
           this.renderer.height >= y - imageY &&
           x - imageX + stageWidth >= 0 &&
           y - imageY + stageHeight >= 0)) {
            return;
        }

        // 绘制图像到中心点
        if (h1) {
            this.getTempImage(image, imageX, imageY, imageWidth, imageHeight, x1, y1, w1, h1);
        } else {
            this.tempCanvasCtx.drawImage(image, imageX, imageY, imageWidth, imageHeight);
        }

        // 转换图像到数据
        var tempImageData = this.tempCanvasCtx.getImageData(0, 0, stageWidth, stageHeight);

        // 图像数据宽高
        var dataWidth = tempImageData.width,
            dataHeight = tempImageData.height;

        // 缓存用校验和
        var listSum = this.cacheListSum(tempImageData, dataWidth, dataHeight);

        // 查找缓存列表
        for (var i = 0; i < this.cacheList.length; i += 2) {
            if (this.cacheList[i] == listSum) {
                this.oldCtx.drawImage(this.cacheList[i + 1], x - imageX, y - imageY);
                return;
            }
        }

        // 设置线段参数
        this.tempCanvasCtx.lineWidth = 2;
        this.tempCanvasCtx.strokeStyle = this.color;

        // 倾斜图像数据
        var point = tilt(contour(tempImageData, dataWidth, dataHeight), this.angleNS, this.angleEW);

        // 清空画布并绘入阴影数据
        this.tempCanvasCtx.clearRect(0, 0, stageWidth, stageHeight);

        var ponitLength = point.length;
        var ponitSign = 0;
        var x1, y1, x2, y2;

        // 开始画线
        this.tempCanvasCtx.beginPath();

        // 填充阴影
        for (ponitSign = 0; ponitSign < ponitLength; ponitSign += 4) {
            x1 = point[ponitSign + 0];
            y1 = point[ponitSign + 1];
            x2 = point[ponitSign + 2];
            y2 = point[ponitSign + 3];

            this.tempCanvasCtx.moveTo(x1, y1);
            this.tempCanvasCtx.lineTo(x2, y2);
        };

        this.tempCanvasCtx.stroke();

        // 创建缓存图片
        var img = new Image();
        img.src = this.buffCanvas.toDataURL("image/png");

        // 添加到缓存列表
        this.cacheList.push(
            listSum, img
            );

        this.oldCtx.drawImage(this.buffCanvas, x - imageX, y - imageY);
    };

    function getRgbaSum(data, loc) {
        /// <summary>获取RGBA校验值</summary>
        /// <param name="data" type="ImageData">像素数据</param>
        /// <param name="loc" type="Number">索引</param>
        /// <returns type="String">校验值</returns>

        return [data[loc], data[loc + 1], data[loc + 2], data[loc + 3]].join();
    }

    shadow.cacheListSum = function (imageData, width, height) {
        /// <summary>缓存列表和计算</summary>
        /// <param name="imageData" type="ImageData">像素数据</param>
        /// <param name="width" type="Number">宽度</param>
        /// <param name="height" type="Number">高度</param>
        /// <returns type="String">校验和</returns>

        var data = imageData.data;

        var centerY = (height / 2) + 1,
            centerX = (width / 2) + 1;

        return [width, height, this.angleEW, this.angleNS,
                getRgbaSum(data, ((width * (centerY) + centerX) << 2)),
                getRgbaSum(data, ((width * (height - 1) + centerX) << 2)),
                getRgbaSum(data, ((width * (centerY) + width - 1) << 2))].join();
    };

    shadow.getTempImage = function (img, x, y, w, h, x1, y1, w1, h1) {
        /// <summary>获取临时图像</summary>
        /// <param name="img" type="Image">图像对象</param>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="w" type="Number">宽度</param>
        /// <param name="h" type="Number">高度</param>
        /// <param name="x1" type="Number">剪裁X位置</param>
        /// <param name="y1" type="Number">剪裁Y位置</param>
        /// <param name="w1" type="Number">剪裁宽度</param>
        /// <param name="h1" type="Number">剪裁高度</param>

        this.tempCanvas.width = w;
        this.tempCanvas.height = h;
        this.tempCanvasCtx.clearRect(0, 0, w, h);
        this.tempCanvasCtx.drawImage(img, x1, y1, w1, h1, x, y, w, h);
    };

    function contour(imageData, width, height) {
        /// <summary>获取轮廓</summary>
        /// <param name="imageData" type="ImageData">像素数据</param>
        /// <param name="width" type="Number">宽度</param>
        /// <param name="height" type="Number">高度</param>
        /// <returns type="Array">点数组</returns>

        var data = imageData.data,
            length = data.length,
            sign = 0;

        var point = [];

        var x, y, alpha, node;
        var p = 0;

        for (y = 0; y < height; y++) {
            node = true;
            p = width * y;

            // 逐行寻找轮廓点
            for (x = 1; x <= width; x++) {
                alpha = data[(width * y + x) * 4 + 3];

                // 寻找点的开始和结束位置，用透明度判断
                if (node && alpha > 20) {
                    point.push(x, y);
                    node = false;
                }
                else if (!node && alpha < 20) {
                    point.push(x - 1, y);
                    node = true;
                }
            }
        }

        return point;
    };

    function tilt(point, angleNS, angleEW) {
        /// <summary>倾斜轮廓</summary>
        /// <param name="point" type="Array">点数组</param>
        /// <param name="angleNS" type="Number">南北角度</param>
        /// <param name="angleEW" type="Number">东西角度</param>
        /// <returns type="Array">点数组</returns>

        var squeeze = Math.sin(angleNS * TeaJs.MathHelper.pi / 180);
        var slant = Math.tan(angleEW * TeaJs.MathHelper.pi / 180);

        var max = point.slice(-1);
        var correction = max * (1 - squeeze);

        var x, y;

        for (var ponitSign = 0, len = point.length; ponitSign < len; ponitSign += 2) {
            x = point[ponitSign + 0];
            y = point[ponitSign + 1];

            point[ponitSign + 0] = (x + (max - y) * slant) >> 0;
            point[ponitSign + 1] = (y * squeeze + correction) >> 0;
        };

        return point;
    };

    TeaJs.C2Effect.Shadow = Shadow;
}(TeaJs);

/*
    过渡图效果
*/
void function (TeaJs) {
    "use strict";

    function Transition() {
        /// <summary>过渡图效果构造器</summary>
        /// <returns type="TransitionEffect">过渡图效果对象</returns>

        constructor(this, arguments);
    }

    // 创建过渡图效果构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer.Canvas2D], function (renderer) {
        /// <summary>效果图效果构造函数</summary>
        /// <param name="renderer" type="Canvas2DRenderer">Canvas2D渲染器</param>
        /// <returns type="TransitionEffect">过渡图效果对象</returns>

        // 设置渲染器
        this.renderer = renderer;

        // 设置旧上下文
        this.oldContext = renderer.context;

        // 当前偏移量
        this.currentOffset = 255;

        // 是否正在执行
        this.isRun = false;

        // 设置画布
        var osc = document.createElement("canvas");
        var tsc = document.createElement("canvas");

        // 设置就场景图画布
        this.oldScreenCanvas = osc;
        this.oldScreenContext = osc.getContext("2d");

        // 设置过渡图画布
        this.transitionCanvas = tsc;
        this.transitionContext = tsc.getContext("2d");
    });

    // 缓存过渡图效果原型对象
    var transition = Transition.prototype;

    transition.ready = function () {
        /// <summary>准备进入过渡</summary>

        var osc = this.oldScreenCanvas,
            tsc = this.transitionCanvas,
            r = this.renderer;

        // 设置画布大小
        osc.width = tsc.width = r.width;
        osc.height = tsc.height = r.height;

        this.oldScreenContext.drawImage(r.canvas, 0, 0, r.width, r.height);
    };

    transition.run = function (img, sp) {
        /// <summary>执行过渡</summary>
        /// <param name="img" type="Image">过渡图</param>
        /// <param name="sp" type="Number">速度(毫秒)</param>

        var r = this.renderer,
            _this = this;

        this.transitionContext.drawImage(img, 0, 0, r.width, r.height);
        this.currentOffset = 255;
        this.isRun = true;

        var timer = setInterval(function () {
            _this.currentOffset--;
            if (_this.currentOffset <= 0) {
                _this.isRun = false;
                clearInterval(timer);
            }
        }, sp / 255);
    };

    transition.draw = function () {
        /// <summary>绘制过渡效果</summary>

        if (!this.isRun) return;
        this.setOffset();
        this.renderer.draw(this.oldScreenCanvas);
    };

    transition.setOffset = function () {
        /// <summary>设置偏移</summary>

        var osc = this.oldScreenContext,
            tsc = this.transitionContext,
            r = this.renderer;

        var pix = osc.getImageData(0, 0, r.width, r.height);
        var pix1 = tsc.getImageData(0, 0, r.width, r.height);
        var iD = pix.data;
        var iD1 = pix1.data;

        var i = iD.length;
        while ((i -= 4) >= 0) {
            if ((iD1[i] + iD1[i + 1] + iD1[i + 2]) / 3 > this.currentOffset) {
                iD[i + 3] = this.currentOffset;
            }
        }

        osc.putImageData(pix, 0, 0);
    };

    TeaJs.C2Effect.Transition = Transition;
}(TeaJs);

/*
    水效果
*/
void function (TeaJs) {
    "use strict";

    function Water() {
        /// <summary>水效果对象构造器</summary>
        /// <returns type="WaterEffect">水效果对象</returns>

        constructor(this, arguments);
    }

    // 获得Canvas2D效果构造器函数
    Water.prototype = new TeaJs.C2Effect();

    // 创建水效果构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer.Canvas2D, Number], function (renderer, height) {
        /// <summary>水效果构造函数</summary>
        /// <param name="renderer" type="CanvasRenderer">Canvas渲染器</param>
        /// <param name="height" type="Number">高度</param>
        /// <returns type="WaterEffect">水效果对象</returns>

        var args = [renderer, "Other"];

        // 获得Canvas2D效果构造器属性
        TeaJs.C2Effect.apply(this, args);

        this.vertexes = [];
        this.diffPt = [];
        this.autoDiff = 100;
        this.verNum = 250;
        this.xx = 150;
        this.dd = 15;

        var cw = renderer.width;
        for (var i = 0; i < this.verNum; i++)
            this.vertexes[i] = new Vertex(cw / (this.verNum - 1) * i, height, height);
        this.initDiffPt();
    });

    function Vertex(x, y, baseY) {
        this.baseY = baseY;
        this.x = x;
        this.y = y;
        this.vy = 0;
        this.targetY = 0;
        this.friction = 0.15;
        this.deceleration = 0.95;
    }

    Vertex.prototype.updateY = function (diffVal) {
        this.targetY = diffVal + this.baseY;
        this.vy += this.targetY - this.y
        this.y += this.vy * this.friction;
        this.vy *= this.deceleration;
    }

    // 缓存水效果原型对象
    var water = Water.prototype;

    water.initDiffPt = function () {
        for (var i = 0; i < this.verNum; i++)
            this.diffPt[i] = 0;
    }

    water.draw = function (color, currentTime) {
        /// <summary>绘制效果</summary>
        /// <param name="color" type="String">颜色</param>
        /// <param name="currentTime" type="Number">当前游戏时间</param>

        var cw = this.renderer.width;
        var randomX = (Math.random() * cw) >> 0;

        this.autoDiff = 200;
        if (randomX < cw - 2) {
            this.xx = 1 + Math.floor((this.verNum - 2) * randomX / cw);
            this.diffPt[this.xx] = this.autoDiff;
        }

        this.autoDiff -= this.autoDiff * 0.9;
        this.diffPt[this.xx] = this.autoDiff;
        //左侧
        //差分，使得每个点都是上一个点的下一次的解，由于差分函数出来的解是一个曲线，且每次迭代后，曲线相加的结果形成了不断地波浪
        for (var i = this.xx - 1; i > 0; i--) {
            var d = this.xx - i;
            if (d > this.dd) d = this.dd;
            this.diffPt[i] -= (this.diffPt[i] - this.diffPt[i + 1]) * (1 - 0.01 * d);
        }

        var d;
        //右侧
        for (var i = this.xx + 1; i < this.verNum; i++) {
            d = i - this.xx;
            if (d > this.dd) d = this.dd;
            this.diffPt[i] -= (this.diffPt[i] - this.diffPt[i - 1]) * (1 - 0.01 * d);
        }

        if (!currentTime || (currentTime | 0) % 2 == 1) {
            //更新点Y坐标
            for (var i = 0; i < this.vertexes.length; i++) {
                this.vertexes[i].updateY(this.diffPt[i]);
                if ((this.diffPt[i] | 0) >= 9) this.diffPt[i] = 0;
            }
        }

        // 绘制水波
        var list = [];
        list.push({ x: 0, y: this.renderer.height });
        for (var i = 0; i < this.vertexes.length; i++) {
            list.push({
                x: this.vertexes[i].x,
                y: this.vertexes[i].y
            });
        }
        list.push({ x: this.renderer.width, y: this.renderer.height });
        list.push({ x: 0, y: this.renderer.height });
        this.renderer.fillPolygon(list, color);
    };

    TeaJs.C2Effect.Water = Water;
}(TeaJs);