/*
    3D点对象构造器
*/
void function (TeaJs) {
    "use strict";

    function Point3() {
        /// <summary>3D点对象构造器</summary>

        constructor(this, arguments);

        // 屏幕显示点X属性
        Object.defineProperty(this, "sx", {
            get: function () {
                var scale = this.fl / (this.fl + this.z + this.cZ);
                return this.vpX + (this.cX + this.x) * scale;
            }
        });

        // 屏幕显示点Y属性
        Object.defineProperty(this, "sy", {
            get: function () {
                var scale = this.fl / (this.fl + this.z + this.cZ);
                return this.vpY + (this.cY + this.y) * scale;
            }
        });
    }

    // 创建3D点类构造器
    var constructor = new TeaJs.Function();

    constructor.add([], function () {
        /// <summary>3D点构造函数</summary>
        /// <returns type="Point3">3D点对象</returns>

        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.fl = 250;
        this.vpX = 0;
        this.vpY = 0;
        this.cX = 0;
        this.cY = 0;
        this.cZ = 0;
    });

    constructor.add([Number, Number, Number], function (x, y, z) {
        /// <summary>3D点构造函数</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="z" type="Number">Z位置</param>
        /// <returns type="Point3">3D点对象</returns>

        this.x = x;
        this.y = y;
        this.z = z;
        this.fl = 250;
        this.vpX = 0;
        this.vpY = 0;
        this.cX = 0;
        this.cY = 0;
        this.cZ = 0;
    });

    constructor.add([TeaJs.Point3], function (point3) {
        /// <summary>3D点</summary>
        /// <param name="point3" type="Point3">3D点对象</param>
        /// <returns type="Point3">3D点对象</returns>

        this.x = point3.x;
        this.y = point3.y;
        this.z = point3.z;
        this.fl = point3.fl;
        this.vpX = point3.vpX;
        this.vpY = point3.vpY;
        this.cX = point3.cX;
        this.cY = point3.cY;
        this.cZ = point3.cZ;
    });

    // 缓存3D点原型对象
    var point3 = Point3.prototype;

    point3.setVanishingPoint = function (vpX, vpY) {
        /// <summary>设置灭点</summary>
        /// <param name="vpX" type="Number">灭点X坐标</param>
        /// <param name="vpX" type="Number">灭点Y坐标</param>

        this.vpX = vpX;
        this.vpY = vpY;
    };

    point3.setCenter = function (cX, cY, cZ) {
        /// <summary>设置中心位置</summary>
        /// <param name="cX" type="Number">X坐标</param>
        /// <param name="cY" type="Number">Y坐标</param>
        /// <param name="cZ" type="Number">Z坐标</param>

        this.cX = cX;
        this.cY = cY;
        this.cZ = cZ;
    };

    point3.rotateX = function (angleX) {
        /// <summary>绕X轴旋转</summary>
        /// <param name="angleX" type="Number">角度</param>

        var cosX = Math.cos(angleX),
            sinX = Math.sin(angleX),
            y1 = this.y * cosX - this.z * sinX,
            z1 = this.z * cosX + this.y * sinX;

        this.y = y1;
        this.z = z1;
    };

    point3.rotateY = function (angleY) {
        /// <summary>绕Y轴旋转</summary>
        /// <param name="angleY" type="Number">角度</param>

        var cosY = Math.cos(angleY),
               sinY = Math.sin(angleY),
               x1 = this.x * cosY - this.z * sinY,
               z1 = this.z * cosY + this.x * sinY;

        this.x = x1;
        this.z = z1;
    };

    point3.rotateZ = function (angleZ) {
        /// <summary>绕Z轴旋转</summary>
        /// <param name="angleZ" type="Number">角度</param>

        var cosZ = Math.cos(angleZ),
               sinZ = Math.sin(angleZ),
               x1 = this.x * cosZ - this.y * sinZ,
               y1 = this.y * cosZ + this.x * sinZ;

        this.x = x1;
        this.y = y1;
    };

    point3.clone = function () {
        /// <summary>克隆对象</summary>
        /// <returns type="Point3">3D点对象</returns>

        return new TeaJs.Point3(this);
    };

    point3.offset = function (x, y, z) {
        /// <summary>点相加</summary>
        /// <param name="x" type="Number">X偏移</param>
        /// <param name="y" type="Number">Y偏移</param>
        /// <param name="z" type="Number">Z偏移</param>
        /// <returns type="Point3">3D点对象</returns>

        return new TeaJs.Point3(this.x + x, this.y + y, this.z + z);
    };

    TeaJs.Point3 = Point3;
}(TeaJs);