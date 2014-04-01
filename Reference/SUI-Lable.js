void function (sui) {
    // Lable控件数量
    var number = 1;

    function Lable() {
        sui.Control.apply(this, arguments);
        // 设置代码中用来标识该对象的名称
        this.name = "lable" + number;
        // 设置默认文本
        this.text = "lable" + number;
        // 设置为自动调整大小
        this.autoSize = true;
        // 设置控件默认宽度
        this.size.width = 350;
        // 设置控件默认高度
        this.size.height = 120;
        // 设置控件内容文本对齐方式
        this.textAlign = sui.contentAlignment.topLeft;

        number++;
    }

    Lable.prototype = new SUI.prototype.Control();

    // 缓存Lable对象原型
    var lable = Lable.prototype;

    lable.onSet = function () {
        this.bufferCanvas.width = this.size.width = sui.util.getTextWidth(this.text, this.font);
        this.bufferCanvas.height = this.size.height = sui.util.getTextHeight(this.text, this.font);
    };

    lable.onPaint = function (canvas, ctx) {
        // 绘制背景
        ctx.fillStyle = this.foreColor;
        ctx.font = this.font;
        ctx.textBaseline = "top";
        ctx.fillText(this.text, 0, 0);
    };

    sui.Lable = Lable;
}(StardustUI.prototype);