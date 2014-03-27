/*
    函数类
*/
void function (TeaJs) {
    "use strict";

    function Function() {
        /// <summary>函数构造器</summary>

        // 构造函数列表
        var list = [];

        var Obj = function (obj, args) {
            // 检查是否存在至少一个构造函数
            if (!list.length) {
                throw new ReferenceError("Can not call the constructor.");
            }

            // 查找构造器
            findConstructor: for (var i = 0; i < list.length; i += 2) {
                // 如果参数数量不匹配则跳过此次查找
                if (list[i].length != args.length) continue;

                for (var n = 0; n < list[i].length; n++) {

                    // 如果为Null值则尝试使用该类型的默认值
                    try {
                        if (args[n] == null) {
                            args[n] = new list[i][n]();
                        }
                    }
                    catch (ex) { }

                    var typeName = list[i][n].toString().split(" ")[1].toLowerCase().replace("()", "");

                    // 如果参数类型不匹配则跳过查找
                    if (args[n] === null ||
                        args[n] === "undefined" ||
                        (!(args[n] instanceof list[i][n]) &&
                        typeof args[n] !== typeName)) {
                        continue findConstructor;
                    }
                }

                // 查找到后传递参数到相应构造函数
                return list[i + 1].apply(obj, args);
            }

            // 没有找到相应构造函数
            throw new TypeError("Invalid parameter used to construct the \"" + obj.constructor.name + "\" object.");
        };

        Obj.add = function (types, callback) {
            /// <summary>添加构造器</summary>
            /// <param name="types" type="Array">类型列表</param>
            /// <param name="callback" type="Function">回调函数</param>

            list.push(types, callback);
        };

        return Obj;
    }

    TeaJs.Function = Function;
}(TeaJs);