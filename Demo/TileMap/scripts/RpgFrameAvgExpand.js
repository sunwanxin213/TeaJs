void function (TeaJs) {
    var rpgProto = TeaJs.Plugins.Rpg.prototype;
    var personProto = TeaJs.Plugins.Rpg.prototype.Person.prototype;
    var drawFun = rpgProto.draw;
    var updateFun = rpgProto.update;
    var sayDrawFunList = [];

    rpgProto.draw = function () {
        drawFun.call(this);

        sayDrawFunList.length && sayDrawFunList[0].call(this);
    };

    rpgProto.update = function () {
        if (sayDrawFunList.length) {
            this.isInterrupt = true;
            var keyboard,
                mouse,
                touch;
            for (var i = this.devices.length; i--;) {
                if (this.devices[i] instanceof TeaJs.Keyboard) keyboard = this.devices[i];
                if (this.devices[i] instanceof TeaJs.Mouse) mouse = this.devices[i];
                if (this.devices[i] instanceof TeaJs.Touch) touch = this.devices[i];
            }

            if (touch.list.length) {
                mouse = {
                    leftButton: true,
                    x: touch.list[0].x,
                    y: touch.list[0].y
                };
            }

            if (keyboard) {
                var keys = keyboard.keys;
                if (keyboard.isKeyDown(keys.space) || keyboard.isKeyDown(keys.enter)) {
                    this.isEventDown = true;
                } else {
                    if (this.isEventDown) {
                        sayDrawFunList[0].fun && sayDrawFunList[0].fun();
                        sayDrawFunList = sayDrawFunList.remove(0);
                    }
                    this.isEventDown = false;
                }
            }
            if (mouse) {
                if (mouse.leftButton) {
                    this.isMouseDown = true;
                } else {
                    if (this.isMouseDown) {
                        sayDrawFunList[0].fun && sayDrawFunList[0].fun();
                        sayDrawFunList = sayDrawFunList.remove(0);
                    }
                    this.isMouseDown = false;
                }
            }
        }
        else {
            this.isInterrupt = false;
        }

        updateFun.call(this);
    };

    personProto.say = function (str, bodyImg, fun) {
        /// <summary>人物说话</summary>
        /// <param name="str" type="String">对话内容</param>
        /// <param name="bodyImg" type="String" optional="true">立绘资源标识名称</param>
        /// <param name="fun" type="Function" optional="true">结束话语后触发的函数</param>

        var font = "16px bold 微软雅黑,黑体";
        var textSize = this.frame.renderer.getTextSize("哉", font);
        var textNumber = (600 / textSize.width) | 0;
        var beyondText = str.length > textNumber * 3 ? str.substring(textNumber * 3) : null;
        var _this = this;

        sayDrawFunList.push(function () {
            var renderer = this.renderer;

            if (bodyImg) {
                var body = this.content.get(bodyImg);
                var sourceSize = { width: 800, height: 600 };
                var imgScaleSize = { width: renderer.width / sourceSize.width * body.width * 0.8, height: renderer.height / sourceSize.height * body.height * 0.8 };

                var showX = function () {
                    switch (_this.direction) {
                        case 1: return (renderer.width / 4) - (imgScaleSize.width / 2);
                        case 3: return renderer.width - ((renderer.width / 4) - (imgScaleSize.width / 2)) - imgScaleSize.width;
                        default: return (renderer.width - imgScaleSize.width) / 2;
                    }
                }();

                renderer.draw(body, showX, renderer.height - imgScaleSize.height, imgScaleSize.width, imgScaleSize.height);
            }

            renderer.setShadow(1, 1, 1, "rgba(0,0,0,0.5)");
            renderer.fillRoundRect(20, 370, 600, 100, 10, "rgba(102,204,221,0.8)");
            renderer.fillRoundRect(20, 330, 120, 40, 10, "rgba(102,204,221,0.8)");
            var nameTextSize = renderer.getTextSize(_this.name, font)
            renderer.fillText(_this.name, 20 + (120 - nameTextSize.width) / 2, 330 + nameTextSize.height / 4 + 20, "#fff", font);
            renderer.fillText(str.substr(0, textNumber), 25, 395, "#fff", font);
            if (str.length > textNumber) {
                renderer.fillText(str.substr(textNumber, textNumber), 25, 425, "#fff", font);
                if (str.length > textNumber * 2) {
                    renderer.fillText(str.substr(textNumber * 2, textNumber), 25, 455, "#fff", font);
                }
            }
            renderer.setShadow();
        });
        sayDrawFunList[sayDrawFunList.length - 1].fun = fun;

        if (beyondText) {
            this.say(beyondText, bodyImg);
        }
    };
}(TeaJs);