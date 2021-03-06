﻿/*
    2D向量对象构造器
*/
void function (TeaJs) {
    "use strict";

    function Vector2(args) {
        /// <summary>2D向量对象构造器</summary>
        /// <returns type="Vector2">2D向量对象</returns>

        constructor(this, arguments);
    }

    // 创建2D向量类构造器
    var constructor = new TeaJs.Function();

    constructor.add([], function () {
        /// <summary>2D向量构造函数</summary>
        /// <returns type="Vector2">2D向量对象</returns>

        this.x = 0,
        this.y = 0;
    });

    constructor.add([Number, Number], function (x, y) {
        /// <summary>2D向量构造函数</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <returns type="Vector2">2D向量对象</returns>

        this.x = x,
        this.y = y;
    });

    constructor.add([TeaJs.Vector2], function (vector2) {
        /// <summary>2D向量构造函数</summary>
        /// <param name="vector2" type="Vector2">2D向量</param>
        /// <returns type="Vector2">2D向量对象</returns>

        this.x = vector2.x,
        this.y = vector2.y;
    });

    // 缓存2D向量原型对象
    var vector2 = Vector2.prototype;

    vector2.clone = function () {
        /// <summary>克隆对象</summary>
        /// <returns type="Vector2">2D向量对象</returns>

        return new TeaJs.Vector2(this);
    };

    vector2.offset = function (x, y) {
        /// <summary>向量相加</summary>
        /// <param name="x" type="Number">X偏移</param>
        /// <param name="y" type="Number">Y偏移</param>
        /// <returns type="Vector2">2D向量对象</returns>

        return new TeaJs.Vector2(this.x + x, this.y + y);
    };

    TeaJs.Vector2 = Vector2;
}(TeaJs);