void function (sui) {
    // 制定控件上图像的位置
    sui.imageLayout = {
        // 图像沿控件的矩形工作区顶部左对齐
        none: 0,
        // 图像沿控件的矩形工作区平铺
        tile: 1,
        // 图像在控件的矩形工作区居中显示
        center: 2,
        // 图像沿控件的矩形工作区拉伸
        stretch: 4,
        // 图像在控件的矩形工作区中放大
        zoom: 8
    };

    // 边框样式
    sui.borderStyle = {
        // 无边框
        none: 0,
        // 单行边框,
        fixedSingle: 1,
        // 三维边框
        fixed3D: 2
    };

    // 光标
    sui.cursors = {
        // 默认光标(通常是一个箭头)
        default: 0,
        // 默认，浏览器设置的光标
        auto: 1,
        // 光标呈现为十字线
        crosshair: 2,
        // 光标呈现为指示链接的指针(一只手)
        pointer: 4,
        // 此光标指示某对象可被移动
        move: 8,
        // 此光标指示矩形框的边缘可被向右(东)移动
        eResize: 16,
        // 此光标指示矩形框的边缘可被向上及向右移动(北/东)
        neResize: 32,
        // 此光标指示矩形框的边缘可被向上及向左移动(北/西)
        nwResize: 64,
        // 此光标指示矩形框的边缘可被向上(北)移动
        nResize: 128,
        // 此光标指示矩形框的边缘可被向下及向右移动(南/东)
        seResize: 256,
        // 此光标指示矩形框的边缘可被向下及向左移动(南/西)
        swResize: 512,
        // 此光标指示矩形框的边缘可被向下移动(南)
        sResize: 1024,
        // 此光标指示矩形框的边缘可被向左移动(西)
        wResize: 2048,
        // 此光标指示文本
        text: 4096,
        // 此光标指示程序正忙(通常是一只表或沙漏)
        wait: 8192,
        // 此光标指示可用的帮助(通常是一个问号或一个气球)
        help: 16384
    };

    // 制定绘图表面上内容的对齐方式
    sui.contentAlignment = {
        // 左上角
        topLeft: 0,
        // 靠上居中
        topCenter: 1,
        // 右上角
        topRight: 2,
        // 靠左垂直居中
        middleLeft: 4,
        // 居中
        middleCenter: 8,
        // 靠右垂直居中
        middleRight: 16,
        // 左下角
        bottomLeft: 32,
        // 靠下居中
        bottomCenter: 64,
        // 右下角
        bottomRight: 128
    };
}(StardustUI.prototype);