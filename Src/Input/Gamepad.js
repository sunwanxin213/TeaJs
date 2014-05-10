/*
    游戏手柄设备
*/
void function (TeaJs) {
    "use strict";

    function Gamepad() {
        /// <summary>手柄设备构造函数</summary>
        /// <returns type="Gamepad">手柄设备</returns>

        bindList(this);
    }

    // 缓存游戏手柄原型对象
    var gamepad = Gamepad.prototype;

    function bindList(obj) {
        /// <summary>绑定游戏手柄列表</summary>
        /// <param name="obj" type="Object">要绑定到的对象</param>

        // 添加手柄设备列表属性
        Object.defineProperty(obj, "list", {
            get: function () {
                var controllers = navigator.getGamepads(),
                    controller;
                var list = [];
                for (var j = 0; j < controllers.length; j++) {
                    controller = controllers[j];
                    if (!controller) continue;
                    list[controller.index] = {
                        // 设备名称
                        id: controller.id,
                        // 按钮列表
                        buttons: function () {
                            var btnList = [];
                            for (var i = 0; i < controller.buttons.length; i++) {
                                var value, pressed, percentage;
                                value = controller.buttons[i];
                                pressed = (value == 1.0);
                                if (typeof (value) == "object") {
                                    pressed = value.pressed;
                                    value = value.value;
                                }
                                percentage = Math.round(value * 100);
                                btnList.push({
                                    pressed: pressed,
                                    value: value,
                                    percentage: percentage
                                });
                            }
                            return btnList;
                        }(),
                        // 摇杆列表
                        axes: function () {
                            var axeList = [];
                            var num = 0;
                            for (var i = 0; i < controller.axes.length; i++) {
                                num = controller.axes[i].toFixed(4);
                                if (num < -0.5) num = -1;
                                else if (num > 0.5) num = 1;
                                else num = 0;
                                axeList.push(num);
                            }
                            return axeList;
                        }()
                    };
                }
                return list;
            }
        });
    }

    TeaJs.Gamepad = Gamepad;
}(TeaJs);