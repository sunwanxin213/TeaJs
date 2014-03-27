/*
    材质加载器
*/
void function (TeaJs) {
    "use strict";

    function Texture() {
        /// <summary>材质加载器构造函数</summary>
        /// <returns type="TextureLoader">材质加载器对象</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "Texture", "jpg jpeg png bmp gif".split(" "));
    }

    // 获得加载器构造器函数
    Texture.prototype = new TeaJs.Loader();

    // 缓存原型对象
    var texture = Texture.prototype;

    texture.load = function (name, fileName, callback, gl) {
        /// <summary>加载材质文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>
        /// <param name="gl" type="WebGLContext">WebGL上下文</param>

        var _this = this;

        // 创建图像对象
        var img = new Image();

        // 创建材质
        var texture = gl && gl.createTexture();

        // 将对象添加到项列表中
        this.itemList.push({
            name: name,
            object: gl ? texture : img,
            unload: function () {
                if (gl) {
                    gl.deleteTexture(texture);
                }
            }
        });

        img.onload = function () {
            /// <summary>加载完成后将图像添加到列表中</summary>

            // 如果是WebGL材质则绑定
            if (gl) {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                // 控制滤波
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

                var error = gl.getError();
                if (error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL) {
                    throw new Error(error);
                }
            }

            callback && callback(texture || img);
        };
        img.onerror = function () {
            throw new Error(_this.loaderName + " \"" + fileName + "\" failed to load.");
        };
        img.src = fileName;
    };

    TeaJs.Loader.Texture = Texture;
}(TeaJs);