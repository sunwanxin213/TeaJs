/*
    内容管理器类
*/
void function (TeaJs) {
    "use strict";

    function Content() {
        /// <summary>内容管理器构造器</summary>
        /// <returns type="Content">内容管理器对象</returns>

        constructor(this, arguments);
    }

    // 创建内容管理器类构造器
    var constructor = new TeaJs.Function();

    // 资源管理器原型对象
    var content = Content.prototype;

    constructor.add([String], function (path) {
        /// <summary>内容管理器构造函数</summary>
        /// <param name="path" type="String" optional="true">默认资源路径</param>
        /// <returns type="Content">内容管理器对象</returns>

        // 资源根目录
        this.path = path || "";

        // 路径检测
        if (this.path.lastIndexOf("/") != this.path.length - 1) {
            this.path += "/";
        }

        // 加载器列表
        this.loaderList = [];

        // 是否正在加载
        this.isLoading = false;

        // 资源管理器索引
        this.index = content.contentNum;

        // 异步加载文件数
        this.asynNum = 0;

        // 加载进度百分比
        this.percentage = 100;

        // 加载器名称列表
        var loaderNames = [];

        // 导入加载器
        for (var i in TeaJs.Loader) {
            var loader = new TeaJs.Loader[i]();
            if (loaderNames.join().indexOf(loader.loaderName) < 0) {
                this.loaderList.push(loader);
                loaderNames.push(loader.loaderName);
            }
        }

        content.contentNum++;

        content.contentList.push(this);
    });

    // 加载器数量
    content.contentNum = 0;

    // 是否正在加载
    content.isLoading = false;

    // 加载器列表
    content.contentList = [];

    // 缓存内容管理器原型对象
    var content = Content.prototype;

    // 创建加载函数构造器
    var loadStruc = new TeaJs.Function();

    function load(name, fileName, callback, renderer) {
        /// <summary>加载文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>
        /// <param name="renderer" type="WebGLRenderer" optional="true">WebGL渲染器</param>

        if (fileName.indexOf("http://") != 0) {
            if (this.path) fileName = this.path + fileName;
        }

        fileName = fileName.replace(/(\\+)/g, "/");

        var _this = this;

        // 获取后缀名
        //var format = fileName.split("/").pop().split(".").pop().toLowerCase();
        var format = fileName.split("/").pop().replace(fileName.split("/").pop().split(".")[0] + ".", "").toLowerCase();

        // 缓存列表
        var list = this.loaderList;

        // 调试模式下检查标记重名
        if (TeaJs.isDebug) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].get(name)) {
                    throw new Error("Failed to load \"" + name + "\" mark repetitions.");
                }
            }
        }

        // 检查支持格式并导入
        for (var i = 0; i < list.length; i++) {
            if (list[i].checkFormat(format)) {
                // 指示该文件加载状态
                list[i].loadNum++;
                var isLoaded = false;

                list[i].load(name, fileName, function (obj) {
                    // 判断该文件是否加载完成
                    if (isLoaded) return;
                    isLoaded = true;
                    list[i].loadDoneNum++;
                    checkLoading(_this);

                    // 调用用户自定义回调函数
                    callback && callback(obj);

                    // 如果启用调试则输出加载成功
                    if (TeaJs.isDebug) {
                        console.log("%s%s \"%s\" Loaded.", renderer ? "WebGL_" : "", list[i].loaderName, fileName);
                    }
                }, renderer && renderer.context);
                checkLoading(_this);
                return;
            }
        }

        // 未找到相应的导入器
        throw new Error("\"" + format + "\" file does not support the import.");
    }

    loadStruc.add([String, String], function (name, fileName) {
        /// <summary>加载文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>

        return load.apply(this, [name, fileName]);
    });

    loadStruc.add([String, String, Function], function (name, fileName, callback) {
        /// <summary>加载文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>

        return load.apply(this, [name, fileName, callback]);
    });

    loadStruc.add([String, String, Function, Boolean], function (name, fileName, isAsyn, callback) {
        /// <summary>加载文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="isAsyn" type="Boolean">是否异步，该值永远为true</param>
        /// <param name="callback" type="Function">回调函数</param>

        var _this = this;

        _this.asynNum++;

        return load.apply(this, [name, fileName, function (obj) {
            _this.asynNum--;
            callback(obj);
        }]);
    });

    loadStruc.add([String, String, TeaJs.Renderer], function (name, fileName, renderer) {
        /// <summary>加载文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="renderer" type="TeaJs.Renderer.WebGL3D">WebGL渲染器</param>

        if ("viewport" in renderer.context) {
            return load.apply(this, [name, fileName, null, renderer]);
        }
        else {
            throw new TypeError("Not recognize the renderer.");
        }
    });

    loadStruc.add([String, String, TeaJs.Renderer, Function], function (name, fileName, renderer, callback) {
        /// <summary>加载文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="renderer" type="TeaJs.Renderer.WebGL3D">WebGL渲染器</param>
        /// <param name="callback" type="Function">回调函数</param>

        if ("viewport" in renderer.context) {
            return load.apply(this, [name, fileName, callback, renderer]);
        }
        else {
            throw new TypeError("Not recognize the renderer.");
        }
    });

    loadStruc.add([String, String, Boolean, TeaJs.Renderer, Function], function (name, fileName, isAsyn, renderer, callback) {
        /// <summary>加载文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="isAsyn" type="Boolean">是否异步，该值永远为true</param>
        /// <param name="renderer" type="TeaJs.Renderer.WebGL3D">WebGL渲染器</param>
        /// <param name="callback" type="Function">回调函数</param>

        var _this = this;

        _this.asynNum++;

        if ("viewport" in renderer.context) {
            return load.apply(this, [name, fileName, function (obj) {
                _this.asynNum--;
                callback(obj);
            }, renderer]);
        }
        else {
            throw new TypeError("Not recognize the renderer.");
        }
    });

    content.load = function () {
        /// <summary>加载资源文件</summary>

        return loadStruc(this, arguments);
    };

    content.get = function (name) {
        /// <summary>获取资源</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <returns type="Object">资源对象</returns>

        // 缓存列表
        var list = this.loaderList;

        // 获取资源
        for (var i = 0; i < list.length; i++) {
            if (list[i].get(name)) {
                return list[i].get(name);
            }
        }

        return false;
    };

    content.remove = function (name) {
        /// <summary>移除资源</summary>
        /// <param name="name" type="String">标识名称</param>

        // 缓存列表
        var list = this.loaderList;

        for (var i = 0; i < list.length; i++) {
            if (list[i].remove(name) === true) {
                break;
            }
        }
    };

    content.getLoadingLoader = function () {
        /// <summary>获取正在加载中的加载器</summary>
        /// <returns type="Array">加载器列表</returns>

        var list = this.loaderList;
        var loadingList = [];
        for (var i in list) {
            if (list[i].loadNum != list[i].loadDoneNum) {
                loadingList.push(list[i]);
            }
        }
        return loadingList;
    };

    function checkLoading(_this) {
        /// <summary>检查是否正在加载</summary>
        /// <param name="_this" type="Content">内容管理器</param>

        // 缓存列表
        var list = _this.loaderList;

        var l = 0,
            d = 0;

        // 获取资源
        for (var i = 0; i < list.length; i++) {
            if (list[i].loadNum < list[i].loadDoneNum) {
                list[i].loadDoneNum = list[i].loadNum;
            }
            l += list[i].loadNum;
            d += list[i].loadDoneNum;
        }

        _this.isLoading = (l !== (d + _this.asynNum));
        _this.percentage = d / l * 100;

        // 检查是否所有的加载器都加载完毕
        var contentList = content.contentList;
        var isLoading = false;
        for (var i = 0; i < contentList.length; i++) {
            isLoading = contentList[i].isLoading;
            if (isLoading) break;
        }
        content.isLoading = isLoading;
    }

    TeaJs.Content = Content;
}(TeaJs);