/*
    加载器类
*/
void function (TeaJs) {
    "use strict";

    function Loader() {
        /// <summary>加载器对象构造器</summary>

        if (!arguments.length) return;
        constructor(this, arguments);
    }

    // 创建加载器类构造器
    var constructor = new TeaJs.Function();

    constructor.add([String, Array], function (loaderName, formatList) {
        /// <summary>加载器构造函数</summary>
        /// <param name="loaderName" type="String">加载器名称</param>
        /// <param name="formatList" type="Array">加载器支持文件后缀列表</param>

        this.loaderName = loaderName;
        this.formatList = formatList;
        this.itemList = [];
        this.loadNum = 0;
        this.loadDoneNum = 0;
    });

    // 缓存原型对象
    var loader = Loader.prototype;

    loader.load = function (name, fileName, callback) {
        /// <summary>加载资源</summary>
        /// <param name="name" type="String">标记名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>

        throw new Error(this.loaderName + " Function \"load\" is not implemented.");
    };

    loader.get = function (name) {
        /// <summary>获取资源</summary>
        /// <param name="name" type="String">标记名称</param>
        /// <returns type="Object">加载器对应类型对象</returns>

        var list = this.itemList;
        for (var i = 0; i < list.length; i++) {
            if (list[i].name == name) {
                return list[i].object;
            }
        }
    };

    loader.remove = function (name) {
        /// <summary>移除资源</summary>
        /// <param name="name" type="String">标记名称</param>

        var list = this.itemList;
        for (var i = 0; i < list.length; i++) {
            if (list[i].name == name) {
                list[i].unload && list[i].unload();
                this.itemList = list.remove(i);
                return true;
            }
        }
    };

    loader.checkFormat = function (format) {
        /// <summary>检查支持的格式</summary>
        /// <param name="format" type="String">格式后缀</param>
        /// <returns type="Boolean">是否支持</returns>

        return this.formatList.join().indexOf(format) >= 0;
    };

    TeaJs.Loader = Loader;
}(TeaJs);