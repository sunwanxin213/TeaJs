/*
    着色器加载器
*/
void function (TeaJs) {
    "use strict";

    function Shader() {
        /// <summary>着色器加载器构造函数</summary>
        /// <returns type="ShaderLoader">着色器加载器对象</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "Shader", "glvs glfs".split(" "));
    }

    // 获得加载器构造器函数
    Shader.prototype = new TeaJs.Loader();

    // 缓存原型对象
    var shader = Shader.prototype;

    shader.load = function (name, fileName, callback, gl) {
        /// <summary>加载着色器</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>
        /// <param name="gl" type="WebGLContext">WebGL上下文</param>

        if (!gl) throw new Error("WebGL context not found.");

        var shaderObj = null,
            _this = this;

        // 着色器类型
        var type = null;

        // 判断类型
        if (fileName.indexOf(".vs") >= 0) {
            type = "VERTEX_SHADER";
        } else {
            type = "FRAGMENT_SHADER";
        }

        // 使用Ajax加载Shader文件
        TeaJs.loadFile(fileName, true, null, function (str) {
            // 编译Shader
            shaderObj = gl.createShader(gl[type]);
            gl.shaderSource(shaderObj, str);
            gl.compileShader(shaderObj);

            // 检查错误
            var error = gl.getError();
            if (error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL) {
                throw new Error(error);
            }
            if (!gl.getShaderParameter(shaderObj, gl.COMPILE_STATUS)) {
                throw new Error("Shader \"" + fileName + "\" compile error" + ":\r\n" + gl.getShaderInfoLog(shaderObj));
            }

            shaderObj.type = gl[type];

            // 加入到项列表中
            _this.itemList.push({
                name: name,
                object: shaderObj,
                unload: function () {
                    gl.deleteShader(shaderObj);
                }
            });

            // 执行回调函数
            callback && callback(shaderObj);
        });
    };

    TeaJs.Loader.Shader = Shader;
}(TeaJs);