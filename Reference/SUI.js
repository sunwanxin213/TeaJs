void function (w) {
    function SUI(ctx) {
        if (!(ctx instanceof CanvasRenderingContext2D)) {
            throw new Error("只能使用CanvasRenderingContext2D");
        }

        // 缓存上下文对象
        this.context = ctx;

        // 控件列表
        this.controlList = [];

        this.addControl = function (control) {
            /// <summary>添加控件</summary>
            /// <param name="control" type="SUI.prototype.Control">控件对象</param>

            if (!(control instanceof SUI.prototype.Control)) throw new Error("无法将其他类型对象做为控件添加");
            for (var i = this.controlList.length; i--;) {
                if (this.controlList[i].name == control.name) return;
            }
            this.controlList.push(control);
        };

        this.draw = function () {
            var list = this.controlList,
                c = null,
                canvas = null,
                ctx = null;
            for (var i = 0; i < list.length; i++) {
                c = list[i],
                canvas = c.bufferCanvas,
                ctx = c.bufferCtx;

                c.onSet && c.onSet();

                canvas.width = c.size.width,
                canvas.height = c.size.height;

                ctx.save();
                ctx.fillStyle = c.backColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                c.onPaint(canvas, ctx)
                this.context.drawImage(canvas, c.location.x, c.location.y);
                ctx.restore();
            }
        };
    }

    // 缓存SUI原型对象
    var sui = SUI.prototype;

    SUI.prototype.Control = function () {
        /// <summary>控件基础对象</summary>

        // 缓存画布
        this.bufferCanvas = document.createElement("canvas");
        // 缓存画布上下文
        this.bufferCtx = this.bufferCanvas.getContext("2d");

        // 指示代码中用来标识该对象的名称
        this.name = "";
        // 指示控件是否可以接受用户拖到它上面的数据
        this.allowDrow = false;
        // 指示当控件内容大于它的可见区域时是否自动显示滚动条
        this.autoScroll = false;
        // 指示当前控件是否可以根据内容自动调整大小
        this.autoSize = false;
        // 组件的背景色
        this.backColor = "#f0f0f0";
        // 用于该控件的背景图像
        this.backgroundImage = null;
        // 用于组件的背景图像布局
        this.backgroundImageLayout = sui.imageLayout.tile;
        // 指示面板是否应具有边框
        this.borderStyle = sui.borderStyle.none;
        // 当用户右击该控件时显示的快捷菜单
        this.contextMenuStrip = null;
        // 指针移过该控件时显示的光标
        this.cursor = sui.cursors.default;
        // 指示是否已启用该控件
        this.isEnable = true;
        // 用于显示控件中文本的字体
        this.font = "9pt 宋体";
        // 此组件的前景色,用于显示文本
        this.foreColor = "#000";
        // 控件左上角相对于其容器左上角的坐标
        this.location = { x: 0, y: 0 };
        // 控件的大小(以像素为单位)
        this.size = { width: 150, height: 150 };

        // 事件监听列表
        var listenerList = [];
        this.addEventListener = function (type, listener) {
            /// <summary>添加事件监听函数</summary>
            /// <param name="type" type="String">事件类型</param>
            /// <param name="listener" type="EventListener">事件监听函数</param>

            listener.eventRandomTag = "SUIEventListener" + new Date().getTime();
            listenerList.push({ name: type.toLowerCase(), callback: listener });
        };

        this.removeEventListener = function (type, listener) {
            /// <summary>移除事件监听函数</summary>
            /// <param name="type" type="String">事件类型</param>
            /// <param name="listener" type="EventListener">事件监听函数</param>

            for (var i = listenerList.length; i--;) if (listenerList[i].eventRandomTag == listener.eventRandomTag) return ((listenerList = listenerList.slice(0, i).concat(listenerList.slice(i + 1, listenerList.length))) && true);
        };
    }

    w.SUI = w.StardustUI = SUI;
}(window);