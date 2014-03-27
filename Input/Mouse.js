/*
    鼠标设备
*/
void function (TeaJs) {
    "use strict";

    function Mouse(canvas) {
        /// <summary>鼠标设备构造函数</summary>
        /// <param name="canvas" type="HTMLCanvasElement">Canvas元素</param>
        /// <returns type="Mouse">鼠标设备对象</returns>

        // 对象检查
        if (typeof canvas == "undefined" ||
            !(canvas instanceof HTMLCanvasElement) &&
            !(canvas instanceof SVGSVGElement)) {
            throw new Error("Object is not a canvas or svg.");
        }

        var _this = this;

        // 是否被锁定
        this.isLocked = false;

        // 画布对象
        this.object = canvas;

        // 模拟不可能存在的触控点
        this.id = -1;

        // 按键状态
        this.leftButton = false;
        this.rightButton = false;
        this.middleButton = false;

        // 当前位置
        this.x = 0;
        this.y = 0;

        // 清空鼠标位置
        this.clear = function () {
            this.x = this.y = 0;
        };

        // 为canvas绑定事件
        this.bind(canvas);

        // 输出调试信息
        if (TeaJs.isDebug) {
            console.log("For the element \"%s\" bind mouse events successful.", canvas.id);
        }
    }

    // 缓存原型对象
    var mouse = Mouse.prototype;

    mouse.lock = function (isLock) {
        /// <summary>锁定鼠标</summary>
        /// <param name="isLock" type="Boolean">是否锁定</param>
        /// <returns type="Boolean">是否已锁定</returns>

        if (!this.object.requestPointerLock || !document.exitPointerLock) {
            return false;
        }
        if (isLock || typeof isLock == "undefined") {
            this.object.requestPointerLock();
            mouse.lockObject = this;
        }
        else {
            document.exitPointerLock();
            return false;
        }
        return true;
    };

    mouse.lockChange = function () {
        /// <summary>锁定状态被更改</summary>

        this.isLocked = document.pointerLockElement == this.object ||
                        document.mozPointerLockElement == this.object ||
                        document.webkitPointerLockElement == this.object;
        if (this == mouse.lockObject && !this.isLocked) {
            mouse.lockObject = null;
        }
    };

    mouse.setButtonState = function (e, state) {
        /// <summary>设置按钮状态</summary>
        /// <param name="e" type="EventArgument">事件参数</param>
        /// <param name="state" type="Boolean">状态</param>

        if (!+"\v1") {
            switch (e.button) {
                case 1: this.leftButton = state; break;
                case 2: this.rightButton = state; break;
                case 4: this.middleButton = state; break;
            }
        }
        else {
            switch (e.which) {
                case 1: this.leftButton = state; break;
                case 2: this.middleButton = state; break;
                case 3: this.rightButton = state; break;
            }
        }
    };

    mouse.setMouseLocation = function (e) {
        /// <summary>设置鼠标位置</summary>
        /// <param name="e" type="EventArgument">事件参数</param>

        var _this = this;

        // 如果为锁定状态则只修改为偏移量
        if (this.isLocked) {
            this.x = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            this.y = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
            return;
        }

        // 元素位置
        var obj = this.object,
            styleWidth = (obj.style.width.replace(/\px/g, "")) | 0,
            styleHeight = (obj.style.height.replace(/\px/g, "")) | 0;

        if (e.pageX || e.pageY) {
            this.x = e.pageX;
            this.y = e.pageY;
        }
        else {
            this.x = e.clientX + document.body.scrollLeft +
                     document.documentElement.scrollLeft;
            this.y = e.clientY + document.body.scrollTop +
                     document.documentElement.scrollTop;
        }

        // 如果当前没有在全屏状态的话则减去元素当前的位置
        if (TeaJs.Screen.fsElement !== obj) {
            this.x -= obj.offsetLeft;
            this.y -= obj.offsetTop;
        }
        if (styleWidth) this.x = (this.x * (obj.width / styleWidth));
        if (styleHeight) this.y = (this.y * (obj.height / styleHeight));
        this.x |= 0;
        this.y |= 0;
    };

    mouse.bind = function (obj) {
        /// <summary>绑定到元素</summary>
        /// <param name="obj" type="Element">要绑定到的元素</param>

        var _this = this;

        // 绑定鼠标锁定事件
        document.addEventListener('pointerlockchange', function () { _this.lockChange(); }, false);
        document.addEventListener('mozpointerlockchange', function () { _this.lockChange(); }, false);
        document.addEventListener('webkitpointerlockchange', function () { _this.lockChange(); }, false);

        // 不显示右键菜单
        obj.oncontextmenu = function () { return false; };

        // 绑定鼠标按下事件
        obj.addEventListener('mousedown', function (e) {
            _this.setMouseLocation(e);
            _this.setButtonState(e, true);
        }, false);

        // 绑定鼠标松开事件
        obj.addEventListener('mouseup', function (e) {
            _this.setMouseLocation(e);
            _this.setButtonState(e, false);
        }, false);

        // 绑定鼠标移动事件
        obj.addEventListener('mousemove', function (e) {
            _this.setMouseLocation(e);
        }, false);
    };

    TeaJs.Mouse = Mouse;
}(TeaJs);