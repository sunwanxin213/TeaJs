/*
    颜色工具
*/
void function (TeaJs) {
    "use strict";

    // 颜色对象
    var Color = {};

    // 缓存数学运算器对象
    var math = TeaJs.MathHelper;

    Color.decimalToHex = function (num) {
        /// <summary>十进制转十六进制</summary>
        /// <param name="num" type="Number">十进制颜色值</param>
        /// <returns type="String">十六进制颜色值</returns>

        return "#" + math.decimalToHex(num);
    };

    Color.hexToDecimal = function (num) {
        /// <summary>十六进制转十进制</summary>
        /// <param name="num" type="String">十六进制颜色值</param>
        /// <returns type="Number">十进制颜色值</returns>

        var r = math.hexToDecimal(num.slice(1));

        return r;
    };

    Color.rgbToDecimal = function (r, g, b) {
        /// <summary>三原色转十进制颜色值</summary>
        /// <param name="r" type="Number">红色值</param>
        /// <param name="g" type="Number">绿色值</param>
        /// <param name="b" type="Number">蓝色值</param>
        /// <returns type="Number">十进制颜色值</returns>

        return (r << 16 | g << 8 | b);
    };

    Color.numberToRgb = function (num, alpha) {
        /// <summary>颜色值转RGB</summary>
        /// <param name="num" type="Number">颜色值</param>
        /// <param name="alpha" type="Number" optional="true">Alpha值</param>
        /// <returns type="String">RGB字符串</returns>

        if (typeof num === "string" && num[0] === "#") {
            num = this.hexToDecimal(num);
        }
        var r = num >> 16 & 0xFF,
            g = num >> 8 & 0xFF,
            b = num & 0xFF;
        alpha = (alpha === undefined) ? 1 : alpha;
        alpha = (alpha < 0) ? 0 : ((alpha > 1) ? 1 : alpha);

        if (alpha === 1) {
            return "rgb(" + r + "," + g + "," + b + ")";
        } else {
            return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
        }
    };

    TeaJs.Color = Color;
}(TeaJs);