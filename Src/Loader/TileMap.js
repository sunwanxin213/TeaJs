/*
    瓷砖地图加载器
*/
void function (TeaJs) {
    "use strict";

    function TileMap() {
        /// <summary>瓷砖地图加载器构造函数</summary>
        /// <returns type="TileMapLoader">瓷砖地图加载器对象</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "TileMap", "ttm.js".split(" "));
    }

    // 获得加载器构造器函数
    TileMap.prototype = new TeaJs.Loader();

    // 缓存原型对象
    var tileMap = TileMap.prototype;

    tileMap.load = function (name, fileName, callback) {
        /// <summary>加载瓷砖地图文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>

        var _this = this;

        TeaJs.loadFile(fileName, false, null, function (str) {
            var m = new Map(eval('(' + TeaJs.Lzw.decompress(str) + ')'));

            var img = new Image();
            img.onload = function () {
                img.onload = null;
                m.usePicture = img;
                TeaJs.loadFile(img.src, true, null, function (str) {
                    m.globaBlocks = getData(str, "Blocks");
                    m.globaLevel = getData(str, "Level");
                    m.generate();
                    // 加入到项列表中
                    _this.itemList.push({
                        name: name,
                        object: m,
                        unload: function () {
                            m.data.clear();
                            m.layouts.clear();
                            m.usePicture = null;
                            m = null;
                        }
                    });

                    // 执行回调函数
                    callback && callback(m);
                });
            };
            img.onerror = function () {
                throw new Error("Tile map material is lost.");
            };
            img.src = fileName.replace(fileName.split("/").pop(), "") + m.usePictureName;
        });
    };

    function getData(source, name) {
        /// <summary>获取地图附加数据</summary>
        /// <param name="source" type="String">源数据</param>
        /// <param name="name" type="String">要获取的数据名</param>
        /// <returns type="Object">数据</returns>

        var obj = eval("/<tile" + name + ">[\\s\\S]*<\\/tile" + name + ">/").exec(source);
        return eval("(" + (obj && (obj = obj[0].replace(/<[^>].*?>/g, "").replace(/(\r\n)+|(\r)+|(\n)+/, "\n"))) + ")");
    }

    function Map(obj) {
        /// <summary>地图类</summary>
        /// <param name="obj" type="Object">地图数据对象</param>

        // 网格信息
        this.grid = { columns: obj.columnCount, rows: obj.rowCount };
        // 瓷砖大小
        this.tileSize = { width: obj.width, height: obj.height };
        // 地图数据
        this.data = obj.data;
        // 地图大小
        this.size = { width: this.tileSize.width * this.grid.columns, height: this.tileSize.height * this.grid.rows };
        // 使用的地图图像名称
        this.usePictureName = obj.mapBitmapName;
        // 使用的地图图像
        this.usePicture = null;
        // 图层
        this.layouts = [];

        this.generate = function () {
            /// <summary>生成地图</summary>

            this.layouts.clear();

            var tw = this.tileSize.width,
                th = this.tileSize.height;
            var _this = this;
            var rl = function () {
                var list = [];
                for (var i = 0; i < 6; i++) {
                    var c = document.createElement("canvas");
                    c.width = tw * _this.grid.columns;
                    c.height = tw * _this.grid.rows;
                    list.push(new TeaJs.Renderer.Canvas2D(c));
                }
                return list;
            }();

            if (this.globaLevel) {
                var sl = [];
                var blk;
                var layoutNum = this.data[0].layoutTileX.length;
                for (var d = 0, num = this.data.length; d < num; d++) {
                    blk = this.data[d];
                    sl.clear();
                    for (var l = 0; l < layoutNum; l++) {
                        if (blk.layoutTileX[l] == null) continue;
                        if (this.data[d].isBlock == true) {
                            if (this.globaBlocks[blk.layoutTileX[l] * (this.usePicture.height / th) + blk.layoutTileY[l]] == 0) {
                                this.data[d].isBlock = false;
                            }
                        }
                        // 获得当前图块层级
                        sl.push({ layout: l, level: this.globaLevel[blk.layoutTileX[l] * (this.usePicture.height / th) + blk.layoutTileY[l]], obj: blk });
                    }
                    // 对层级进行排序
                    sl.sort(function (a, b) {
                        if (a.level > b.level || (a.level == b.level && a.layout > b.layout)) {
                            return 1;
                        } else if (a.level < b.level || (a.level == b.level) && a.layout < b.layout) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                    // 绘制图块到不同层中
                    for (var n = 0; n < sl.length; n++) {
                        var obj = sl[n].obj;
                        rl[sl[n].level].draw(this.usePicture, obj.showX * tw, obj.showY * th, tw, th, obj.layoutTileX[sl[n].layout] * tw, obj.layoutTileY[sl[n].layout] * th, tw, th);
                    }
                }
                // 将层保存为图片进行缓存
                for (var i = 0; i < rl.length; i++) {
                    this.layouts.push(TeaJs.Screen.captureToImage(rl[i].canvas));
                }
                rl.clear();
            } else {
                // 没有层级设定时默认使用图层绘制
                for (var i = 0; i < this.data[0].layoutTileX.length; i++) {
                    rl[0].clear();
                    for (var n = 0; n < this.data.length; n++) {
                        if (this.data[n].layoutTileX[i] == null) continue;
                        rl[0].draw(this.usePicture,
                               this.data[n].showX * tw, this.data[n].showY * th, tw, th,
                               this.data[n].layoutTileX[i] * tw, this.data[n].layoutTileY[i] * th, tw, th);
                    }
                    this.layouts.push(TeaJs.Screen.captureToImage(rl[0].canvas));
                }
            }
        };

        this.checkBlock = function (x, y) {
            /// <summary>检查是否可通行</summary>
            /// <param name="x" type="Number">地图图块X索引</param>
            /// <param name="y" type="Number">地图图块Y索引</param>
            /// <returns type="Boolean">指示是否可通行</returns>

            var index = (x * this.grid.rows + y);
            if (index < 0 || index >= this.data.length) return false;
            return !!!this.data[index].isBlock;
        };
    }

    TeaJs.Loader.TileMap = TileMap;
}(TeaJs);