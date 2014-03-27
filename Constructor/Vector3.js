/*
    3D向量类
*/
void function (TeaJs) {
    "use strict";

    function Vector3() {
        /// <summary>3D向量对象构造器</summary>

        constructor(this, arguments);
    }

    // 创建3D向量类构造器
    var constructor = new TeaJs.Function();

    constructor.add([], function () {
        /// <summary>3D向量构造函数</summary>
        /// <returns type="Vector3">3D向量对象</returns>

        this.x = 0,
        this.y = 0;
        this.z = 0;
    });

    constructor.add([Number, Number, Number], function (x, y, z) {
        /// <summary>3D向量构造函数</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <param name="z" type="Number">Z位置</param>
        /// <returns type="Vector3">3D向量对象</returns>

        this.x = x,
        this.y = y;
        this.z = z;
    });

    constructor.add([TeaJs.Vector3], function (vector3) {
        /// <summary>3D向量</summary>
        /// <param name="vector3" type="Vector3">3D向量对象</param>
        /// <returns type="Vector3">3D向量对象</returns>

        this.x = vector3.x;
        this.y = vector3.y;
        this.z = vector3.z;
    });

    // 缓存3D向量原型对象
    var vector3 = Vector3.prototype;

    vector3.toString = function () {
        /// <summary>转换为字符串</summary>
        /// <returns type="String">格式化后的字符串</returns>

        return "{X:" + this.x + " Y:" + this.y + " Z:" + this.z + "}";
    };

    vector3.clone = function () {
        /// <summary>克隆对象</summary>
        /// <returns type="Vector3">3D向量对象</returns>

        return new TeaJs.Vector3(this);
    };

    vector3.offset = function (x, y, z) {
        /// <summary>向量相加</summary>
        /// <param name="vector3" type="Vector3">3D向量对象</param>
        /// <returns type="Vector3">3D向量对象</returns>

        return new TeaJs.Vector3(this.x + vector3.x, this.y + vector3.y, this.z + vector3.z);
    };

    TeaJs.Vector3 = Vector3;
}(TeaJs);