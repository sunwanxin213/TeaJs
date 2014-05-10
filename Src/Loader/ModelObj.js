/*
    Obj格式模型加载器
*/
void function (TeaJs) {
    "use strict";

    function ObjModel() {
        /// <summary>Obj格式模型加载器构造函数</summary>
        /// <returns type="ObjModelLoader">Obj格式模型加载器对象</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "ObjModel", "obj".split(" "));
    }

    // 获得加载器构造器函数
    ObjModel.prototype = new TeaJs.Loader();

    // 缓存原型对象
    var objModel = ObjModel.prototype;

    objModel.load = function (name, fileName, callback, gl) {
        /// <summary>加载Obj格式模型</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>
        /// <param name="gl" type="WebGLContext">WebGL上下文</param>

        if (!gl) throw new Error("WebGL context not found.");

        var _this = this;

        // 使用Ajax加载Obj格式模型文件
        TeaJs.loadFile(fileName, true, null, function (obj) {

            function hasNaN(o) {
                /// <summary>判断指定参数的子项中是否存在NaN</summary>
                /// <param name="o" type="Object">要检查的对象</param>

                for (var k in o) {
                    if (NaN == o[k])
                        return true;
                }
                return false;
            }

            obj = obj.toString().trim();            // 除去整篇文档的前后空格
            obj = obj.replace(/\r\n/, "\n");        // 将整篇文档中的回车换行符替换成换行符
            obj = obj.replace(/\r/, "\n");          // 将整篇文档中的回车符替换成换行符
            obj = obj.replace(/#+[^\n]*\n/, "\n");  // 将整篇文档中的注释部分替换成换行符
            obj = obj.replace(/\\\n/, "");          // 将整篇文档中每行最后的斜线和换行符与下一行连接

            var objcmds = obj.split(/\s*\n+\s*/);

            obj = function () {
                var model = {
                    geometricVertices: [],
                    textureVertices: [],
                    vertexNormals: [],
                    parameterSpaceVertices: [],
                    groups: []
                };
                var curgroup = null;

                for (var i = 0; i < objcmds.length; i++) {
                    var cmdwords = objcmds[i].split(/\s+/);
                    var o;
                    switch (cmdwords[0]) {
                        case "v":
                            if (4 > cmdwords.length
                              || hasNaN(o = {
                                x: parseFloat(cmdwords[1]),
                                y: parseFloat(cmdwords[2]),
                                z: parseFloat(cmdwords[3])
                            }))
                                continue;
                            model.geometricVertices.push(o);
                            break;
                        case "vt":
                            if (3 > cmdwords.length
                              || hasNaN(o = {
                                u: parseFloat(cmdwords[1]),
                                v: parseFloat(cmdwords[2])
                            }))
                                continue;
                            model.textureVertices.push(o);
                            break;
                        case "vn":
                            if (4 > cmdwords.length
                              || hasNaN(o = {
                                x: parseFloat(cmdwords[1]),
                                y: parseFloat(cmdwords[2]),
                                z: parseFloat(cmdwords[3])
                            }))
                                continue;
                            model.vertexNormals.push(o);
                            break;
                        case "vp":
                            if (4 > cmdwords.length
                              || hasNaN(o = {
                                x: parseFloat(cmdwords[1]),
                                y: parseFloat(cmdwords[2]),
                                z: parseFloat(cmdwords[3])
                            }))
                                continue;
                            model.parameterSpaceVertices.push(o);
                            break;
                        case "p":
                            if (2 > cmdwords.length)
                                continue;
                            o = [];
                            for (var j = 1; j < 2; j++) {
                                o.push(parseInt(cmdwords[j]));
                            }
                            if (hasNaN(o))
                                continue;
                            if (curgroup)
                                curgroup.points.push(o);
                            break;
                        case "l":
                            if (3 > cmdwords.length)
                                continue;
                            o = [];
                            for (var j = 1; j < 3; j++) {
                                o.push(parseInt(cmdwords[j]));
                            }
                            if (hasNaN(o))
                                continue;
                            if (curgroup)
                                curgroup.lines.push(o);
                            break;
                        case "f":
                            if (4 > cmdwords.length)
                                continue;
                            o = [];
                            for (var j = 1; j < 4; j++) {
                                var m = cmdwords[j].match(/^(\d+)\/(\d+)\/(\d+)$/);
                                if (null != m) {
                                    o.push({ idxVertex: m[1], idxTexture: m[2], idxNormals: m[3] });
                                    continue;
                                }
                                o.push(parseInt(cmdwords[j]));
                            }
                            if (hasNaN(o))
                                continue;
                            if (curgroup)
                                curgroup.faces.push(o);
                            break;
                        case "g":
                            if (2 > cmdwords.length)
                                continue;
                            model.groups.push(curgroup = {
                                name: cmdwords[1],
                                points: [],
                                lines: [],
                                faces: []
                            });
                            break;
                    }
                }
                return model;
            }();

            obj = function (obj) {
                var model = {
                    materials: [],
                    indices: [],
                    vertexPositions: [],
                    vertexNormals: [],
                    vertexTextureCoords: []
                };
                var c = 0;
                for (var i = 0; i < obj.groups.length; i++) {
                    var mapping = [];
                    for (var j = 0; j < obj.groups[i].faces.length; j++) {
                        for (var k = 0; k < obj.groups[i].faces[j].length; k++) {
                            var o = obj.groups[i].faces[j][k];
                            var b = isNaN(o);
                            var v = b ? o.idxVertex : o;
                            var t = b ? o.idxTexture : 0.0;
                            var n = b ? o.idxNormals : 0.0;

                            var s = v + "/" + t + "/" + n;
                            if (undefined == mapping[s]) {
                                mapping[s] = {
                                    index: c++,
                                    vertex: 0 <= v - 1 ? obj.geometricVertices[v - 1] : null,
                                    texture: b && 0 <= t - 1 ? obj.textureVertices[t - 1] : null,
                                    normals: b && 0 <= n - 1 ? obj.vertexNormals[n - 1] : null
                                };
                                model.vertexPositions.push(mapping[s].vertex.x);
                                model.vertexPositions.push(mapping[s].vertex.y);
                                model.vertexPositions.push(mapping[s].vertex.z);
                                model.vertexNormals.push(mapping[s].normals.x);
                                model.vertexNormals.push(mapping[s].normals.y);
                                model.vertexNormals.push(mapping[s].normals.z);
                                model.vertexTextureCoords.push(mapping[s].texture.u);
                                model.vertexTextureCoords.push(mapping[s].texture.v);
                            }
                            model.indices.push(mapping[s].index);
                        }
                    }
                    model.materials.push({
                        numindices: obj.groups[i].faces.length * 3
                    });
                }

                model.vertexPositions = new Float32Array(model.vertexPositions);
                model.vertexNormals = new Float32Array(model.vertexNormals);
                model.indices = new Uint16Array(model.indices);

                return model;
            }(obj);

            obj.format = "OBJ";

            // 加入到项列表中
            _this.itemList.push({
                name: name,
                object: obj,
                unload: null
            });

            // 执行回调函数
            callback && callback(obj);
        });
    };

    TeaJs.Loader.ObjModel = ObjModel;
}(TeaJs);