/*
    边界检测工具
*/
void function (TeaJs) {
    "use strict";

    // 边界检测对象
    var Bounds = {};

    // 矩形检测构造函数
    var intersectsStruc = new TeaJs.Function();

    intersectsStruc.add([TeaJs.Rectangle, TeaJs.Rectangle], function (rect1, rect2) {
        /// <summary>矩形检测构造函数</summary>
        /// <param name="rect1" type="Rectangle">矩形对象1</param>
        /// <param name="rect2" type="Rectangle">矩形对象2</param>
        /// <returns type="Boolean">是否碰撞</returns>

        return !(rect1.x + rect1.width < rect2.x ||
                 rect2.x + rect2.width < rect1.x ||
                 rect1.y + rect1.height < rect2.y ||
                 rect2.y + rect2.height < rect1.y);
    });

    intersectsStruc.add([Number, Number, Number, Number, Number, Number, Number, Number],
        function (x1, y1, w1, h1, x2, y2, w2, h2) {
            /// <summary>矩形检测构造函数</summary>
            /// <param name="x1" type="Number">矩形1X位置</param>
            /// <param name="y1" type="Number">矩形1Y位置</param>
            /// <param name="w1" type="Number">矩形1宽度</param>
            /// <param name="h1" type="Number">矩形1高度</param>
            /// <param name="x2" type="Number">矩形2X位置</param>
            /// <param name="y2" type="Number">矩形2Y位置</param>
            /// <param name="w2" type="Number">矩形2宽度</param>
            /// <param name="h2" type="Number">矩形2高度</param>
            /// <returns type="Boolean">是否碰撞</returns>

            return !(x1 + w1 < x2 ||
                     x2 + w2 < x1 ||
                     y1 + h1 < y2 ||
                     y2 + h2 < y1);
        });

    Bounds.intersects = function () {
        /// <summary>矩形检测</summary>
        /// <returns type="Boolean">是否碰撞</returns>

        return intersectsStruc(this, arguments);
    };

    TeaJs.Bounds = Bounds;
}(TeaJs);