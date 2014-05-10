/*
    触摸设备
*/
void function (TeaJs) {
    "use strict";

    function Touch(canvas) {
        /// <summary>触摸设备构造函数</summary>
        /// <param name="canvas" type="HTMLCanvasElement">画布元素</param>
        /// <returns type="TouchList">触摸列表</returns>

        // 对象检查
        if (typeof canvas == "undefined" ||
            !(canvas instanceof HTMLCanvasElement) &&
            !(canvas instanceof SVGSVGElement)) {
            throw new Error("Object is not a canvas or svg.");
        }

        // 画布对象
        this.object = canvas;

        // 触摸列表
        this.list = [];

        // 为canvas绑定事件
        this.bind(canvas);

        // 输出调试信息
        if (TeaJs.isDebug) {
            console.log("For the element \"%s\" bind touch events successful.", canvas.id);
        }
    }

    // 缓存原型对象
    var touch = Touch.prototype;

    touch.setStatus = function (e, isDown) {
        /// <summary>设置触摸状态</summary>
        /// <param name="e" type="EventArgument">事件参数</param>
        /// <param name="isDown" type="Boolean">是否按下</param>

        // 获取触摸列表
        var evt = (typeof (event) != "undefined" ? event : e),
            touches = evt.targetTouches || evt.touches,
            t = e.changedTouches[0];


        if (isDown) {
            this.list.push({
                id: t.identifier
            });
            this.setLocation(e);
        } else {
            for (var i = 0; i < this.list.length; i++) {
                if (t.identifier == this.list[i].id) {
                    this.list = this.list.remove(i);
                    break;
                }
            }
        }
    };

    touch.setLocation = function (e) {
        /// <summary>设置触摸位置</summary>
        /// <param name="e" type="EventArgument">事件参数</param>

        // 获取触摸列表
        var t = e.changedTouches[0];

        // 更改被移动的触摸点位置
        for (var i = 0; i < this.list.length; i++) {
            if (t.identifier == this.list[i].id) {
                var p = this.calcPosition(t.clientX, t.clientY);
                if (!(p.x < 0 || p.y < 0 || p.x > this.object.width || p.y > this.object.height)) {
                    this.list[i].x = p.x;
                    this.list[i].y = p.y;
                }
                break;
            }
        }
    };

    touch.calcPosition = function (x, y) {
        /// <summary>计算位置</summary>
        /// <param name="x" type="Number">X位置</param>
        /// <param name="y" type="Number">Y位置</param>
        /// <returns type="Point">点对象</returns>

        var obj = this.object,
            styleWidth = (obj.style.width.replace(/\px/g, "")) | 0,
            styleHeight = (obj.style.height.replace(/\px/g, "")) | 0;

        // 如果当前没有在全屏状态的话则减去元素当前的位置
        if (TeaJs.Screen.fsElement !== obj) {
            x -= obj.offsetLeft;
            y -= obj.offsetTop;
        }
        if (styleWidth) x = (x * (obj.width / styleWidth));
        if (styleHeight) y = (y * (obj.height / styleHeight));

        return {
            x: x | 0,
            y: y | 0
        };
    };

    touch.bind = function (obj) {
        /// <summary>绑定到元素</summary>
        /// <param name="obj" type="Element">要绑定到的元素</param>

        var _this = this;

        // 不显示右键菜单
        obj.oncontextmenu = function () { return false; };

        // 绑定触摸按下事件
        obj.addEventListener('touchstart', function (e) {
            if (event && event.preventDefault) {
                event.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            _this.setStatus(e, true);
        }, false);

        // 绑定触摸松开事件
        obj.addEventListener('touchend', function (e) {
            if (event && event.preventDefault) {
                event.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            _this.setStatus(e, false);
        }, false);

        // 绑定触摸移动事件
        obj.addEventListener('touchmove', function (e) {
            if (event && event.preventDefault) {
                event.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            _this.setLocation(e);
        }, false);
    };

    TeaJs.Touch = Touch;
}(TeaJs);