/*
    数学运算器
*/
void function (TeaJs) {
    "use strict";

    // 数学运算器对象
    var MathHelper = {
        pi: 3.14,
        twoPi: 6.28,
        piOver2: 1.57,
        piOver4: 0.78,
        e: 2.71,
        log10E: 0.43,
        log2E: 1.44
    };

    MathHelper.toRadian = function (degress) {
        /// <summary>角度转弧度</summary>
        /// <param name="degress" type="Number">角度值</param>
        /// <returns type="Number">弧度值</returns>

        return degress * this.pi / 180;
    };

    MathHelper.toDegrees = function (radian) {
        /// <summary>弧度转角度</summary>
        /// <param name="radian" type="Number">弧度值</param>
        /// <returns type="Number">弧度值</returns>

        return radian * 180 / this.pi;
    };

    MathHelper.getPointingRotation = function (origin, target) {
        /// <summary>获取指向旋转值</summary>
        /// <param name="origin" type="Vector2">源对象向量</param>
        /// <param name="target" type="Vector2">目标对象向量</param>
        /// <returns type="Number">弧度值</returns>

        return Math.atan2(target.y - origin.y, target.x - origin.x);
    };

    MathHelper.distance = function (p1, p2) {
        /// <summary>计算距离</summary>
        /// <param name="p1" type="Vector2">向量1</param>
        /// <param name="p2" type="Vector2">向量2</param>
        /// <returns type="Number">距离</returns>

        var dx = p2.x - p1.x,
            dy = p2.y - p1.y;

        if (p1.z && p2.z) {
            var dz = p2.z - p1.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }

        return Math.sqrt(dx * dx + dy * dy);
    };

    MathHelper.decimalToHex = function (num) {
        /// <summary>十进制转十六进制</summary>
        /// <param name="num" type="Number">数值</param>
        /// <returns type="String">十六进制字符串</returns>

        return num.toString(16);
    };

    MathHelper.hexToDecimal = function (num) {
        /// <summary>十六进制转十进制</summary>
        /// <param name="num" type="String">十六进制字符串</param>
        /// <returns type="Number">十进制数值</returns>

        return parseInt(num, 16);
    };

    // 随机数构造函数
    var randomStruc = new TeaJs.Function();

    randomStruc.add([Number], function (max) {
        /// <summary>随机数构造函数</summary>
        /// <param name="max" type="Number">最大值</param>
        /// <returns type="Number">随机数</returns>

        return Math.random() * max;
    });

    randomStruc.add([Number, Number], function (min, max) {
        /// <summary>随机数构造函数</summary>
        /// <param name="min" type="Number">最小值</param>
        /// <param name="max" type="Number">最大值</param>
        /// <returns type="Number">随机数</returns>

        return Math.random() * (max - min) + min;
    });

    MathHelper.random = function () {
        /// <summary>获得随机数</summary>
        /// <returns type="Number">随机数</returns>

        return randomStruc(this, arguments) >> 0;
    };

    TeaJs.MathHelper = MathHelper;
}(TeaJs);