/*
    WebGL3D渲染器类
*/
void function (TeaJs) {
    "use strict";

    // 上下文列表
    var contextList = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl", "3d"];

    function WebGL3D() {
        /// <summary>WebGL3D渲染器构造器</summary>
        /// <returns type="WebGL3DRenderer">WebGL3D渲染器</returns>

        constructor(this, arguments);
    }

    // 获得渲染器构造器函数
    WebGL3D.prototype = new TeaJs.Renderer();

    // 创建WebGL3D类构造器
    var constructor = new TeaJs.Function();

    constructor.add([HTMLElement], function (canvas) {
        /// <summary>WebGL3D渲染器构造函数</summary>
        /// <param name="canvas" type="HTMLCanvasElement or HTMLObjectElement">Canvas元素</param>
        /// <returns type="WebGL3DRenderer">WebGL3D渲染器</returns>

        // 获得渲染器构造器属性
        TeaJs.Renderer.call(this, canvas, "WebGL3D", contextList);

        this.init();
    });

    // 缓存原型对象
    var renderer = WebGL3D.prototype;

    renderer.init = function () {
        /// <summary>初始化渲染器</summary>

        // 缓存上下文对象
        var ctx = this.context;

        function setViewport() {
            ctx.viewportWidth = ctx.canvas.width;
            ctx.viewportHeight = ctx.canvas.height;
            ctx.viewport(0, 0, ctx.viewportWidth, ctx.viewportHeight);
            return setViewport;
        }
        setViewport();

        // 窗口大小改变视野也改变
        window.addEventListener("resize", setViewport, false);

        // 设置初始化参数
        ctx.clearColor(0.0, 0.0, 0.0, 0.0);
        ctx.enable(ctx.DEPTH_TEST);
        ctx.depthFunc(ctx.LEQUAL);

        // 加载初始资源
        this.loadInitRes();
    };

    renderer.loadInitRes = function () {
        /// <summary>加载初始资源</summary>

        var _this = this,
            ctx = this.context;

        function loadEffect(fileName, type, callback) {
            // 使用Ajax加载Shader文件
            TeaJs.loadFile(TeaJs.path + "Resources/Shader/" + fileName, false, null, function (str) {
                var obj = ctx.createShader(ctx[type]);
                ctx.shaderSource(obj, str);
                ctx.compileShader(obj);
                callback(obj);
            });
        }

        loadEffect("baseEffect.vs", "VERTEX_SHADER", function (vs) {
            loadEffect("baseEffect.fs", "FRAGMENT_SHADER", function (fs) {
                _this.baseEffect = _this.getProgram(vs, fs);
            });
        });
    };

    renderer.clear = function () {
        /// <summary>清空画布</summary>

        var ctx = this.context;
        ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
    };

    renderer.getProgram = function (vs, fs) {
        /// <summary>获取着色器程序</summary>
        /// <param name="vs" type="VertexShader">顶点着色器</param>
        /// <param name="fs" type="FramentShader">片段着色器</param>
        /// <returns type="ShaderProgram">着色器程序</returns>

        var gl = this.context;
        var p = gl.createProgram();
        // 附加顶点着色器和片断着色器
        gl.attachShader(p, vs);
        gl.attachShader(p, fs);
        gl.linkProgram(p);
        var error = gl.getError();
        if (error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL) {
            throw error;
        }
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
            throw gl.getProgramInfoLog(p);
        }
        return p;
    };

    renderer.freeProgram = function (p) {
        /// <summary>释放着色器程序</summary>
        /// <param name="p" type="ShaderProgram">着色器程序</param>

        this.context.deleteProgram(p);
    };

    renderer.bindTexture = function (texture) {
        /// <summary>绑定材质</summary>
        /// <param name="texture" type="Texture">材质对象</param>

        this.context.bindTexture(this.context.TEXTURE_2D, texture);
    };

    renderer.processVectexBuffer = function (vectexArray) {
        /// <summary>创建顶点缓冲区</summary>
        /// <param name="vectexArray" type="Array">顶点数组</param>

        var gl = this.context;

        var typeArray = new Float32Array(vectexArray);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, typeArray, gl.STATIC_DRAW);
        vectexArray = buf;
    };

    renderer.processIndexBuffer = function (indexArray) {
        /// <summary>创建索引缓冲区</summary>
        /// <param name="indexArray" type="Array">索引数组</param>

        var gl = this.context;

        var index = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
        indexArray = index;
    };

    renderer.screenQuad = function () {
        /// <summary>创建四边形</summary>
        /// <returns type="ArrayBuffer">顶点数组</returns>

        var gl = this.context;

        //创建缓冲区
        var vertexPosBuffer = gl.createBuffer();
        //绑定缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        //三角形位置缓冲
        var vertices = [-1, -1, 1, -1, -1, 1, 1, 1];
        //合成缓冲数据
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        //设置多少个顶点为一组
        vertexPosBuffer.itemSize = 2;
        //设置绘制多少个顶点
        vertexPosBuffer.numItems = 4;

        return vertexPosBuffer;
    };

    TeaJs.Renderer.WebGL3D = WebGL3D;
}(TeaJs);