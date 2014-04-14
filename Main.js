/*
    框架入口
*/
void function (window) {
    "use strict";

    // 文件列表
    var fileList = [
        // 系统支持文件列表
        ["System", "ApiCompatible", "CheckInfo", "Function"],
        // 构造器文件列表
        ["Constructor", "Renderer", "Loader", "C2Effect", "AudioContext", "Vector2", "Vector3", "Rectangle"],
        // 工具文件列表
        ["Tools", "MathHelper", "Color", "Bounds", "Lzw"],
        // 渲染器文件列表
        ["Renderer", "Canvas2D", "Svg2D", "WebGL3D"],
        // 输入设备文件列表
        ["Input", "Mouse", "Touch", "Keyboard", "Media", "Gamepad"],
        // 加载器文件列表
        ["Loader", "Texture", "TextureDds", "Video", "Audio", "Shader", "ObjModel", "FrameAnimation", "TileMap"],
        // 语音操作文件列表
        ["Voice", "Speech", "TTS"],
        // 管理器文件列表
        ["Manager", "Content", "Screen", "Game"],
        // 游戏框架列表
        ["Plugins", "C2Effect", "QQMusic", "Map45Degrees", "Rpg"]
    ];

    function TeaJs(path, isDebug, callback) {
        /// <summary>初始化框架</summary>
        /// <param name="path" type="String">框架路径</param>
        /// <param name="isDebug" type="Boolean">是否启用调试</param>
        /// <param name="callback" type="Function">回调函数</param>

        if (typeof HTMLCanvasElement == "undefined" && typeof SVGElement == "undefined") {
            throw new Error("Browser version is too low.");
        }

        // 是否启用调试
        TeaJs.isDebug = isDebug;

        // 检查框架路径
        path = !!path ? (path + "/") : "";

        // 框架路径
        TeaJs.path = path;

        // 开始循环加载文件
        for (var i = 0; i < fileList.length; i++) {
            for (var fi = 1; fi < fileList[i].length; fi++) {
                TeaJs.loadScript(path + fileList[i][0] + "/" + fileList[i][fi]);
            }
        }

        fileList = null;

        callback && callback();
    };

    // 插件对象命名空间
    TeaJs.Plugins = {};
    // 是否启用调试
    TeaJs.isDebug = false;
    // 框架版本
    TeaJs.version = "0.1.5";

    TeaJs.getQueryString = function (name) {
        /// <summary>获取页面参数</summary>
        /// <param name="name" type="String">参数名称</param>
        /// <returns type="String">参数值</returns>

        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return "";
    };

    TeaJs.loadFile = function (url, syne, type, callback, onerror) {
        /// <summary>Ajax加载文件</summary>
        /// <param name="url" type="String">文件地址</param>
        /// <param name="syne" type="Boolean">是否异步加载</param>
        /// <param name="type" type="String">Mime类型</param>
        /// <param name="callback" type="Function">回调函数</param>
        /// <param name="onerror" type="Function">自定义错误处理函数</param>

        var xmlHttp = new XMLHttpRequest();
        if (syne == null) {
            syne = true;
        }

        if (type == null) {
            type = 'text/plain';
        }

        if (!("withCredentials" in xmlHttp)) {
            xmlHttp = new XDomainRequest();
            xmlHttp.onload = function () {
                callback(this.responseText);
            };
            xmlHttp.open("GET", url);
        } else {
            xmlHttp.open('GET', url, syne);

            //定义传输的文件HTTP头信息
            xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        }

        // 文本格式不支持设置responseType
        if (type.indexOf("text") < 0) {
            xmlHttp.responseType = type;
        }
        xmlHttp.onerror = onerror || function () {
            throw new Error("File \"" + url + "\" failed to load.");
        };
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status == 404) {
                    this.onerror();
                }
                if (callback) {
                    if (type.indexOf("text") < 0) {
                        callback(xmlHttp.response);
                    } else {
                        callback(xmlHttp.responseText);
                    }
                }
                this.onreadystatechange = null;
                this.onerror = null;
                xmlHttp = null;
                callback = null;
            }
        };
        xmlHttp.send(null);
    };

    TeaJs.loadScript = function (src) {
        /// <summary>加载脚本</summary>
        /// <param name="src" type="String">文件地址</param>

        var doc = document;

        // 检测文件路径
        var jpath;
        jpath = (src.lastIndexOf(".js") !== (src.length - 2) &&
                 src.lastIndexOf(".JS") != (src.length - 2)) ? src + ".js" : src;
        jpath += "?ver=" + TeaJs.version;
        if (TeaJs.isDebug) {
            jpath += "&random=" + Math.random();
        }

        // 创建Script标签
        var script = doc.createElement('script');

        // 使用Ajax加载文件
        TeaJs.loadFile(jpath, false, null, function (text) {
            script.id = src;
            script.innerHTML = text;
            doc.getElementsByTagName('head')[0].appendChild(script);
            doc.getElementsByTagName('head')[0].removeChild(script);
        });
    };

    window.TeaJs = TeaJs;
}(window);