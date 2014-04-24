/// <reference path="../Main.js" />
/// <reference path="Renderer.js" />
/// <reference path="../Renderer/Canvas2D.js" />

/*
    三角形对象构造器
*/
void function (TeaJs) {
    "use strict";

    function Triangle() {
        /// <summary>三角形对象构造器</summary>

        constructor(this, arguments);

        // 光系数属性
        Object.defineProperty(this, "lightFactor", {
            get: function () {
                var ab = {
                    x: this.pointA.x - this.pointB.x,
                    y: this.pointA.y - this.pointB.y,
                    z: this.pointA.z - this.pointB.z
                };
                var bc = {
                    x: this.pointB.x - this.pointC.x,
                    y: this.pointB.y - this.pointC.y,
                    z: this.pointB.z - this.pointC.z
                };
                var norm = {
                    x: (ab.y * bc.z) - (ab.z * bc.y),
                    y: -((ab.x * bc.z) - (ab.z * bc.x)),
                    z: (ab.x * bc.y) - (ab.y * bc.x)
                };
                var dotProd = norm.x * this.light.x +
                              norm.y * this.light.y +
                              norm.z * this.light.z;
                var normMag = Math.sqrt(norm.x * norm.x +
                                        norm.y * norm.y +
                                        norm.z * norm.z);
                var lightMag = Math.sqrt(this.light.x * this.light.x +
                                        this.light.y * this.light.y +
                                        this.light.z * this.light.z);
                return (Math.acos(dotProd / (normMag * lightMag)) / Math.PI) * this.light.brightness;
            }
        });

        // 深度值属性
        Object.defineProperty(this, "depth", {
            get: function () {
                return Math.min(this.pointA.z, this.pointB.z, this.pointC.z);
            }
        });

        // 调整后的颜色属性
        Object.defineProperty(this, "adjustedColor", {
            get: function () {
                var color = TeaJs.Color.hexToDecimal(this.color),
                    red = color >> 16,
                    green = color >> 8 & 0xff,
                    blue = color & 0xff,
                    lightFactor = this.lightFactor;

                red *= lightFactor;
                green *= lightFactor;
                blue *= lightFactor;
                return TeaJs.Color.numberToRgb(red << 16 | green << 8 | blue, this.alpha);
            }
        });
    }

    // 创建三角形类构造器
    var constructor = new TeaJs.Function();

    constructor.add([TeaJs.Point3, TeaJs.Point3, TeaJs.Point3, String], function (pointA, pointB, pointC, color) {
        /// <summary>三角形构造函数</summary>
        /// <param name="pointA" type="Point3">顶点A</param>
        /// <param name="pointB" type="Point3">顶点B</param>
        /// <param name="pointC" type="Point3">顶点C</param>
        /// <param name="color" type="String">颜色值</param>
        /// <returns type="Triangle">三角形对象</returns>

        this.pointA = pointA;
        this.pointB = pointB;
        this.pointC = pointC;
        this.color = color;
        this.lineWidth = 1;
        this.alpha = 1.0;
        this.light = null;
    });

    // 缓存三角形原型对象
    var triangle = Triangle.prototype;

    triangle.isBackface = function () {
        /// <summary>确定三角形是否在背面</summary>
        /// <returns type="Boolean">是否为背面</returns>

        var cax = this.pointC.sx - this.pointA.sx,
            cay = this.pointC.sy - this.pointA.sy,
            bcx = this.pointB.sx - this.pointC.sx,
            bcy = this.pointB.sy - this.pointC.sy;
        return (cax * bcy > cay * bcx);
    };

    triangle.draw = function (renderer, isFill) {
        /// <summary>绘制三角形</summary>
        /// <param name="renderer" type="TeaJs.Renderer.Canvas2D">2D渲染器</param>

        if (this.isBackface()) return;

        var color = this.light ? this.adjustedColor : TeaJs.Color.numberToRgb(this.color, this.alpha);
        var list = ["A", "B", "C"];
        for (var i = 0; i < list.length; i++) {
            var p = this["point" + list[i]];
            list[i] = { x: p.sx, y: p.sy };
        }
        isFill !== false && renderer.fillPolygon(list, color);
        this.lineWidth && renderer.drawPolygon(list, color, this.lineWidth);
    };

    TeaJs.Triangle = Triangle;
}(TeaJs);