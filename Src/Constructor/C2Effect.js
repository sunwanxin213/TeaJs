/*
    Canvas2D效果对象构造器
*/
void function (TeaJs) {
    "use strict";

    function C2Effect() {
        /// <summary>Canvas2D效果对象构造器</summary>
        /// <returns type="Canvas2DEffect">Canvas2D效果对象</returns>

        if (!arguments.length) return;
        constructor(this, arguments);
    }

    // 创建Canvas2D效果构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Renderer, String], function (renderer, type) {
        /// <summary>Canvas2D效果对象构造函数</summary>
        /// <param name="renderer" type="CanvasRenderer">Canvas渲染器</param>
        /// <param name="type" type="String">插件类型</param>
        /// <returns type="Canvas2DEffect">Canvas2D效果对象</returns>

        // 渲染器对象
        this.renderer = renderer;

        // 插件类型
        this.type = type;

        // 是否启用
        this.isEnable = false;

        renderer.plugins.push(this);
    });

    // 缓存插件原型对象
    var plugin = C2Effect.prototype;

    // 处理函数
    plugin.begin = new Function();
    plugin.end = new Function();
    plugin.process = new Function();

    plugin.destroy = function () {
        /// <summary>销毁插件对象</summary>

        var plugins = this.renderer.plugins;
        if (this.renderer) {
            for (var i = plugins.length; i--;) {
                if (plugins[i] == this) {
                    this.renderer.plugins = plugins.remove(i);
                    return;
                }
            }
        }
    };

    plugin.convolutionMatrix = function (inputData, w, h, matrix, divisor, offset) {
        /// <summary>计算卷积矩阵</summary>
        /// <param name="input" type="ImageData">像素数据</param>
        /// <param name="matrix" type="Array">矩阵</param>
        /// <param name="divisor" type="Number">除数</param>
        /// <param name="offset" type="Number">偏移量</param>
        /// <returns type="ImageData">像素数据</returns>

        // 拷贝一份源数据
        var bufferData = new Uint8Array(inputData);

        var m = matrix;
        var currentPoint = 0;
        var wb = (w << 2);

        // 对除了边缘的点之外的内部点的 RGB 进行操作
        for (var y = 1; y < h - 1; y += 1) {
            for (var x = 1; x < w - 1; x += 1) {
                currentPoint = ((y * w + x) << 2);
                // 如果为全透明则跳过该像素
                if (inputData[currentPoint + 3] == 0) {
                    continue;
                }

                // 进行计算
                for (var c = 0; c < 3; c += 1) {
                    var i = currentPoint + c;
                    inputData[i] = offset
                        + (m[0] * bufferData[i - wb - 4] + m[1] * bufferData[i - wb] + m[2] * bufferData[i - wb + 4]
                        + m[3] * bufferData[i - 4] + m[4] * bufferData[i] + m[5] * bufferData[i + 4]
                        + m[6] * bufferData[i + wb - 4] + m[7] * bufferData[i + wb] + m[8] * bufferData[i + wb + 4])
                        / divisor;
                }
                inputData[currentPoint + 3] = bufferData[currentPoint + 3];
            }
        }
    };

    TeaJs.C2Effect = C2Effect;
}(TeaJs);