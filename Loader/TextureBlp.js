/*
    材质加载器
*/
void function (TeaJs) {
    "use strict";

    function TextureBlp() {
        /// <summary>材质加载器构造函数</summary>
        /// <returns type="TextureBlpLoader">材质加载器对象</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "TextureBlp", "blp".split(" "));
    }

    // 获得加载器构造器函数
    TextureBlp.prototype = new TeaJs.Loader();

    // 缓存原型对象
    var textureBlp = TextureBlp.prototype;

    textureBlp.load = function (name, fileName, callback, gl) {
        /// <summary>加载材质文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>
        /// <param name="gl" type="WebGLContext">WebGL上下文</param>

        var _this = this;

        TeaJs.loadFile(fileName, true, "arraybuffer", function (obj) {
            // 解析材质
            var texture = analyzer(obj, gl);

            // 将对象添加到项列表中
            _this.itemList.push({
                name: name,
                object: texture,
                unload: function () {
                    gl.deleteTextureBlp(texture);
                }
            });

            callback && callback(texture);
        });
    };

    var analyzer = function () {

        var gl = null,
            p = 0,
            totalSize = 0,
            dataView = null;

        function Blp() {
            this.fourCC = "";
            this.compression = 0;
            this.flags = 0;
            this.width = 0;
            this.height = 0;
            this.pictureType = 0;
            this.pictureSubType = 0;
            this.mipMapOffset = [];
            this.mipMapSize = [];
            this.version = 0;
        }

        function loadTextureFromBuffer(buffer, webgl) {
            gl = webgl,
            p = 0,
            totalSize = buffer.byteLength,
            dataView = new DataView(buffer);

            var blp = new Blp();
            getBlpHeader(blp);
            if (blp.pictureType == 3 || blp.pictureType == 4) {
                blpUncompressed1(blp);
            } else if (blp.pictureType == 5) {
                blpUncompressed2(blp);
            }
            else {
                blpJpeg(blp);
            }

            console.dir(blp);
        }

        function getBlpHeader(blp) {
            /// <summary>获取BLP头</summary>
            /// <param name="blp" type="BLP">BLP对象</param>

            blp.fourCC = dataView.getString([p, p += 4][0], 4);
            if (!/BLP(1|2)/.test(blp.fourCC)) throw new TypeError("数据格式错误");
            if (blp.fourCC == "BLP1") blp.version = 1;
            else if (blp.fourCC == "BLP2") blp.version = 2;
            blp.compression = dataView.getUint32([p, p += 4][0], 4);
            blp.flags = dataView.getUint32([p, p += 4][0], 4);
            blp.width = dataView.getUint32([p, p += 4][0], 4);
            blp.height = dataView.getUint32([p, p += 4][0], 4);
            blp.pictureType = dataView.getUint32([p, p += 4][0], 4);
            blp.pictureSubType = dataView.getUint32([p, p += 4][0], 4);
            for (var i = 0; i < 16; i++) {
                blp.mipMapOffset[i] = dataView.getUint32([p, p += 4][0], 4);
            }
            for (var i = 0; i < 16; i++) {
                blp.mipMapSize[i] = dataView.getUint32([p, p += 4][0], 4);
            }
            // 头大小为156位
        }

        function blpJpeg(blp) {

        }

        function blpUncompressed1(blp) {

        }

        function blpUncompressed2(blp) {

        }

        return loadTextureFromBuffer;
    }();

    TeaJs.Loader.TextureBlp = TextureBlp;
}(TeaJs);