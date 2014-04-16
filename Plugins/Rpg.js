/*
    Rpg游戏框架
*/
void function (TeaJs) {
    "use strict";

    // 人物方向
    var direction = ["up", "right", "down", "left"];

    // 触发模式
    Rpg.prototype.triggerMode = Rpg.triggerMode = {
        auto: 1,
        click: 2
    };

    // 缓存人物动画图片
    var catchPicture = [];

    Rpg.prototype.Person = function (rpg, content, name, pictureName, animationName) {
        /// <summary>人物类</summary>
        /// <param name="content" type="Content">内容管理器</param>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="pictureName" type="String"></param>
        /// <returns type="Person">人物对象</returns>

        var _this = this;

        this.frame = rpg;
        // 人物名称
        this.name = name;
        // 所在地图索引位置
        this.location = { x: 0, y: 0 },
        // 面向方向
        this.direction = 2,
        // 移动速度
        this.moveSpeed = 0.125 / 2,
        // 移动到目标位置的进度
        this.moveProcess = 0.0,
        // 是否为玩家操作
        this.isRunning = false,
        // 是否为中间插值状态
        this.isMoving = false;
        // 触发事件
        this.fun = null;
        // 人物所在像素位置
        this.position = { x: 0, y: 0 };
        // 行走路径
        this.path = null;
        // 自动行走回调
        this.autoRunFun = null;
        // 自动行走进度
        this.autoRunProcess = 0;
        // 所用的人物动画图片
        this.picture = function () {
            for (var i = 0; i < catchPicture.length; i += 2) {
                if (catchPicture[i] == pictureName) {
                    return catchPicture[i + 1];
                }
            }
        }();
        if (!this.picture) {
            content.load("TeaJs-Rpg-Person" + new Date().getTime() + Math.random(), pictureName, function (img) {
                _this.picture = img;
                catchPicture.push(pictureName, img);
            });
        }
        // 所用的人物动画列表
        this.animation = null;
        content.load("TeaJs-Rpg-Person" + new Date().getTime() + Math.random(), animationName, function (ani) {
            _this.animation = ani;
        });
    };

    Rpg.prototype.Person.prototype.move = function () {
        /// <summary>处理人物移动的过程</summary>

        if (!this.isRunning)
            return;

        // 增加英雄移动到目标的进度
        this.moveProcess += this.moveSpeed;
        if (1.0 > this.moveProcess) return;

        // 获得移动的方向
        var vector = getMoveVector(this.direction);

        // 如果进度已经满了，则让英雄前进到目标点
        this.location.x += vector.x;
        this.location.y += vector.y;
        this.moveProcess = 0.0;
        if (this.path) {
            this.autoRunProcess++;
            if (this.path.length != this.autoRunProcess) {
                this.isMoving = true;
                this.direction = this.path[this.autoRunProcess];
                return;
            }
            this.isMoving = false;
            this.autoRunFun();
        }
        this.isRunning = false;
    };

    Rpg.prototype.Person.prototype.moveTo = function (x, y, fun) {
        /// <summary>移动到指定位置</summary>
        /// <param name="location" type="Vector2">目标位置</param>
        /// <param name="fun" type="Function" optional="true">到达目的地后执行函数</param>

        var _this = this;

        function getDir(x1, y1, x2, y2) {
            if (y1 - y2 > 0) return 2;
            if (y2 - y1 > 0) return 0;
            if (x1 - x2 > 0) return 1;
            if (x2 - x1 > 0) return 3;
        }

        // 若要移动的点本身就是不可通行区域则不执行
        if (this.frame.map.checkBlock(x, y)) {
            return;
        }

        this.path = this.getMovePath(x, y);
        if (!this.path || !this.path.length) return (fun && fun(this));
        var tempPath = [];
        var offset = 0;
        for (var i = 0; i < this.path.length; i++) {
            if (i == 0) {
                if (this.path[i].x == this.location.x && this.path[i].y == this.location.y) {
                    offset++;
                    continue;
                }
                tempPath[i - offset] = getDir(this.path[i].x, this.path[i].y, this.location.x, this.location.y);
            } else {
                if (this.path[i].x == this.location.x && this.path[i].y == this.location.y) {
                    offset++;
                    continue;
                }
                tempPath[i - offset] = getDir(this.path[i].x, this.path[i].y, this.path[i - 1].x, this.path[i - 1].y);
            }
        }

        var p;
        for (var i = this.frame.personList.length; i--;) {
            p = this.frame.personList[i];
            if (p.location.x == this.path[this.path.length - 1].x && p.location.y == this.path[this.path.length - 1].y) {
                tempPath = tempPath.remove(tempPath.length - 1);
                break;
            }
        }

        this.autoRunFun = function () {
            _this.path = null;
            _this.autoRunProcess = 0;
            _this.frame.isInterrupt = false;
            fun && fun(_this);
            _this.autoRunFun = null;
        };

        if (!tempPath.length) return this.autoRunFun();

        this.path = tempPath;
        this.direction = this.path[0];
        this.frame.isInterrupt = true;
        this.isRunning = true;
    };

    function Rpg(renderer, content, devices) {
        /// <summary>Rpg游戏对象构造器</summary>
        /// <returns type="Rpg">Rpg游戏对象</returns>

        // 所使用的渲染器
        this.renderer = renderer;

        // 内容管理器
        this.content = content;

        // 可以使用的设备列表
        this.devices = devices || [];

        // 人物列表
        this.personList = [];

        // 当前所使用的地图对象
        this.map = null;

        // 玩家
        this.player = null;

        // 地图资源标识
        this.mapName = "TeaJs-Rpg-Map" + new Date().getTime() + Math.random();

        // 摄像机位置
        this.cameraPosition = { x: 0, y: 0 };

        // 是否按下了事件按键
        this.isEventDown = false;

        // 是否按下了鼠标
        this.isMouseDown = false;

        // 是否中断
        this.isInterrupt = false;

        // 事件列表
        this.eventList = [];
    }

    Rpg.prototype.changeMap = function (mapFileName) {
        /// <summary>更改地图</summary>
        /// <param name="mapFileName" type="String">所使用的地图文件名</param>

        var _this = this;

        this.content.remove(this.mapName);
        this.content.load(this.mapName, mapFileName, function (map) {
            _this.map = map;
            _this.cameraPosition = { x: 0, y: 0 };

            var data = [];
            for (var y = 0; y < map.grid.rows; y++) {
                for (var x = 0; x < map.grid.columns; x++) {
                    data.push(map.checkBlock(x, y) ? Number.MAX_VALUE : 1);
                }
            }
            _this.awf = new autoFindWay(data, { width: map.grid.columns, height: map.grid.rows });
        });
    };

    Rpg.prototype.Person.prototype.getMovePath = function (x, y) {
        var frame = this.frame;
        var awf = frame.awf;

        if (this.location.x == x && this.location.y == y) return null;

        return awf.GetWayPoints(newPoint(this.location.x, this.location.y), newPoint(x, y), newSize(frame.map.grid.columns, frame.map.grid.rows));
    };

    Rpg.prototype.setPlayer = function (name, pictureName, animationName, location, direction) {
        /// <summary>设置玩家<summary>
        /// <param name="name" type="String">玩家人物名称</summary>
        /// <param name="pictureName" type="String">所使用的图片文件名</summary>
        /// <param name="animationName" type="String">动画文件名</summary>
        /// <param name="location" type="Vector2" optional="true">人物初始位置</param>
        /// <param name="direction" type="Number" integer="true" optional="true">方向</param>
        /// <returns type="Person">人物对象</returns>

        if (this.player) {
            for (var i = this.personList.length; i--;) {
                if (this.personList[i] == this.player) {
                    this.personList = this.personList.remove(i);
                    break;
                }
            }
        }

        this.player = new this.Person(this, this.content, name, pictureName, animationName);
        this.player.location = location || { x: 0, y: 0 };
        this.player.direction = direction || 2;
        this.personList.push(this.player);
        return this.player;
    };

    Rpg.prototype.addNpc = function (name, pictureName, animationName, location, direction, fun) {
        /// <summary>添加系统人物<summary>
        /// <param name="name" type="String">系统人物名称</summary>
        /// <param name="pictureName" type="String">所使用的图片文件名</summary>
        /// <param name="animationName" type="String">动画文件名</summary>
        /// <param name="location" type="Vector2" optional="true">人物初始位置</param>
        /// <param name="direction" type="Number" integer="true" optional="true">方向</param>
        /// <returns type="Person">人物对象</returns>

        for (var i = this.personList.length; i--;) {
            if (this.personList[i].name == name) {
                throw new Error("Npc name \"" + name + "\" already exists.");
            }
        }

        var npc = new this.Person(this, this.content, name, pictureName, animationName);
        npc.location = location || { x: 0, y: 0 };
        npc.direction = direction || 2;
        npc.fun = fun;
        this.personList.push(npc);
        return npc;
    };

    Rpg.prototype.removeNpc = function (name) {
        /// <summary>移除系统人物</summary>
        /// <param name="name" type="String">系统人物名称</param>

        var npc = null;
        for (var i = this.personList.length; i--;) {
            if (this.personList[i].name == name) {
                npc = this.personList[i];
                this.personList = this.personList.remove(i);
                break;
            }
        }
        return npc;
    };

    Rpg.prototype.getPerson = function (name) {
        /// <summary>获取人物对象</summary>
        /// <param name="name" type="String">人物名称</param>
        /// <returns type="Person">人物对象</returns>

        for (var i = this.personList.length; i--;) {
            if (this.personList[i].name == name) {
                return this.personList[i];
            }
        }
        return null;
    };

    Rpg.prototype.addEvent = function (name, triggerMode, location, fun) {
        /// <summary>添加事件</summary>
        /// <param name="name" type="String">事件编号</param>
        /// <param name="triggerMode" type="Rpg.TriggerMode">触发模式</param>
        /// <param name="loation" type="Vector2">事件在地图上的索引位置</param>
        /// <param name="fun" type="Function">触发函数</param>

        this.eventList.push({
            name: name,
            triggerMode: triggerMode,
            location: location,
            fun: fun,
            isTrigger: false
        });
    };

    Rpg.prototype.removeEvent = function (name) {
        /// <summary>移除事件</summary>
        /// <param name="name" type="String">事件编号</param>

        for (var i = this.eventList.length; i--;) {
            if (this.eventList[i].name == name) {
                this.eventList = this.eventList.remove(i);
                break;
            }
        }
    };

    Rpg.prototype.checkPosition = function () {
        /// <summary>检查并计算人物当前所在像素位置</summary>

        var tileSize = this.map.tileSize;
        var p, vector;
        for (var i = this.personList.length; i--;) {
            p = this.personList[i];
            // 获得移动的方向
            vector = getMoveVector(p.direction);
            // 获得英雄在地图上的像素位置
            p.position = {
                x: (p.location.x + vector.x * p.moveProcess) * tileSize.width,
                y: (p.location.y + vector.y * p.moveProcess) * tileSize.height
            };
        }

        // 根据人物位置判断层级并进行排序
        this.personList.sort(function (a, b) {
            if (a && b && a.position && b.position) {
                return b.position.y - a.position.y;
            }
        });
    };

    Rpg.prototype.cameraFollow = function () {
        /// <summary>摄像头跟随英雄</summary>

        var renderer = this.renderer;

        var hero = this.player;

        var mapSize = this.map.size,
            tileSize = this.map.tileSize;

        var heroPosition = hero.position;

        // 推算出摄像头在地图上的像素位置
        var cameraPosition = {
            x: 0,
            y: 0
        };
        if (heroPosition.x < renderer.width / 2) cameraPosition.x = 0;
        else if (mapSize.width - heroPosition.x < renderer.width / 2) cameraPosition.x = mapSize.width - renderer.width;
        else cameraPosition.x = heroPosition.x - renderer.width / 2;
        if (heroPosition.y < renderer.height / 2) cameraPosition.y = 0;
        else if (mapSize.height - heroPosition.y < renderer.height / 2) cameraPosition.y = mapSize.height - renderer.height;
        else cameraPosition.y = heroPosition.y - renderer.height / 2;

        this.cameraPosition = cameraPosition;
    };

    Rpg.prototype.cannotMove = function (azimuth) {
        /// <summary>判断目标位置是否无法移动</summary>
        /// <param name="azimuth" type="int">要移动的方向</param>

        var map = this.map;

        // 获得移动的方向
        var vector = getMoveVector(azimuth);

        var targetpos = {
            x: this.player.location.x + vector.x,
            y: this.player.location.y + vector.y
        };

        if (0 > targetpos.x || map.size.width <= targetpos.x * map.tileSize.width ||
            0 > targetpos.y || map.size.height <= targetpos.y * map.tileSize.height)
            return true;

        var location;
        for (var i = this.personList.length; i--;) {
            location = this.personList[i].location;
            if (location.x == targetpos.x && location.y == targetpos.y) return true;
        }

        return map.checkBlock(targetpos.x, targetpos.y);
    }

    Rpg.prototype.checkInput = function () {
        /// <summary>检测用户输入</summary>

        var keyboard,
            mouse;
        for (var i = this.devices.length; i--;) {
            if (this.devices[i] instanceof TeaJs.Keyboard) keyboard = this.devices[i];
            if (this.devices[i] instanceof TeaJs.Mouse) mouse = this.devices[i];
        }

        if (mouse && this.checkMouse(mouse)) return;
        if (keyboard && this.checkKeyboard(keyboard)) return;
    };

    Rpg.prototype.checkMouse = function (mouse) {
        /// <summary>检测鼠标状态</summary>
        /// <param name="mouse" type="Mouse">鼠标对象</param>

        var _this = this;
        var hero = this.player;
        if (hero.isRunning) return;
        var vector = getMoveVector(hero.direction);
        var heroDirLocation = { x: (hero.location.x + vector.x), y: (hero.location.y + vector.y) };
        var tileIndexX = ((mouse.x + Math.abs(this.cameraPosition.x)) / this.map.tileSize.width) | 0;
        var tileIndexY = ((mouse.y + Math.abs(this.cameraPosition.y)) / this.map.tileSize.height) | 0;

        if (mouse.leftButton) {
            this.isMouseDown = true;
        } else {
            if (this.isMouseDown) {
                var fun = null;
                // 手动触发人物事件
                var p;
                for (var i = this.personList.length; i--;) {
                    p = this.personList[i];
                    if (p.location.x == tileIndexX && p.location.y == tileIndexY) {
                        fun = function () {
                            p.direction = hero.direction + 2;
                            if (p.direction > 3) p.direction -= 4;
                            p.fun(p);
                        };
                        break;
                    }
                }

                // 手动触发事件
                var event;
                for (var i = this.eventList.length; i--;) {
                    event = this.eventList[i];
                    if (((event.location.x == heroDirLocation.x && event.location.y == heroDirLocation.y) ||
                        (event.location.x == hero.location.x && event.location.y == hero.location.y)) &&
                        event.triggerMode == this.triggerMode.click) {
                        if (event) {
                            fun = event.fun;
                        }
                    }
                }

                hero.moveTo(tileIndexX, tileIndexY, function () {
                    _this.checkAutoEvent();
                    fun && fun();
                });
            }
            this.isMouseDown = false;
        }
    };

    Rpg.prototype.checkKeyboard = function (keyboard) {
        /// <summary>检测键盘状态</summary>
        /// <param name="keyboard" type="Keyboard">键盘对象</param>

        var keys = keyboard.keys;
        var hero = this.player;

        var vector = getMoveVector(hero.direction);
        var heroDirLocation = { x: (hero.location.x + vector.x), y: (hero.location.y + vector.y) };

        if (keyboard.isKeyDown(keys.space) || keyboard.isKeyDown(keys.enter)) {
            this.isEventDown = true;
        } else {
            if (this.isEventDown) {
                // 手动触发人物事件
                var p;
                for (var i = this.personList.length; i--;) {
                    p = this.personList[i];
                    if (p.fun && ((p.location.x == heroDirLocation.x && p.location.y == heroDirLocation.y) ||
                        (p.location.x == hero.location.x && p.location.y == hero.location.y))) {
                        p.direction = this.player.direction + 2;
                        if (p.direction > 3) p.direction -= 4;
                        p.fun(p);
                    }
                }

                // 手动触发事件
                var event;
                for (var i = this.eventList.length; i--;) {
                    event = this.eventList[i];
                    if (((event.location.x == heroDirLocation.x && event.location.y == heroDirLocation.y) ||
                        (event.location.x == hero.location.x && event.location.y == hero.location.y)) &&
                        event.triggerMode == this.triggerMode.click) {
                        event.fun && event.fun();
                    }
                }
            }
            this.isEventDown = false;
        }

        this.checkAutoEvent();

        do {
            // 英雄移动的时候，移动按键失效
            if (hero.isRunning) break;

            // 判断当前按下的所有按键中不存在方向键
            var key = keyboard.isKeyDown([keys.left, keys.up, keys.right, keys.down], true);
            if (keys.none == key) {
                hero.isMoving = false;
                break;
            }

            // 获得按键方向
            hero.direction = (key + 4 - keys.up) % 4;

            // 判断目标位置是否无法移动
            if (this.cannotMove(hero.direction)) {
                hero.isMoving = false;
                break;
            }

            // 设置英雄的移动状态
            hero.isRunning = true;
            hero.isMoving = true;
        } while (false);

        return hero.isRunning;
    };

    Rpg.prototype.checkAutoEvent = function () {
        /// <summary>检查自动事件</summary>

        var hero = this.player;

        var vector = getMoveVector(hero.direction);
        var heroDirLocation = { x: (hero.location.x + vector.x), y: (hero.location.y + vector.y) };

        // 自动触发事件
        var event;
        for (var i = this.eventList.length; i--;) {
            event = this.eventList[i];
            if (((event.location.x == heroDirLocation.x && event.location.y == heroDirLocation.y) ||
                (event.location.x == hero.location.x && event.location.y == hero.location.y)) &&
                !event.isTrigger && event.triggerMode == this.triggerMode.auto) {
                event.fun && event.fun();
                event.isTrigger = true;
            } else if (event.isTrigger && (event.location.x != heroDirLocation.x || event.location.y != heroDirLocation.y)) {
                event.isTrigger = false;
            }
        }
    };

    Rpg.prototype.update = function () {
        /// <summary>更新数据</summary>

        if (!this.personList.length) return;

        if (!this.isInterrupt) {
            this.checkInput();
        }

        for (var i = this.personList.length; i--;) {
            this.personList[i].move();
        }
        this.checkPosition();
        this.cameraFollow();
    };

    Rpg.prototype.draw = function () {
        /// <summary>绘制场景</summary>

        var renderer = this.renderer,
            _this = this,
            cameraPosition = this.cameraPosition,
            map = this.map;

        // 绘制游戏场景
        for (var i = 0; i < map.layouts.length; i++) {
            if (i == 1) {
                for (var n = _this.personList.length; n-- ;) {
                    // 绘制人物
                    _this.personList[n].animation.play(function (rect) {
                        var personPosition = _this.personList[n].position;

                        renderer.draw(_this.personList[n].picture,
                                      Math.round(personPosition.x + map.tileSize.width / 2 - rect.width / 2 - cameraPosition.x),
                                      Math.round(personPosition.y + map.tileSize.height / 2 - rect.height * 2 / 3 - cameraPosition.y),
                                      rect.width, rect.height,
                                      rect.x, rect.y, rect.width, rect.height);
                    }, direction[_this.personList[n].direction] + (_this.personList[n].isMoving ? "Run" : ""), 200);
                }
            }

            // 绘制地图
            renderer.draw(map.layouts[i], -Math.round(cameraPosition.x), -Math.round(cameraPosition.y));
        }
    };

    function getMoveVector(azimuth) {
        /// <summary>获得移动的方向</summary>
        /// <returns type="Vector2">方向向量</returns>

        return {
            x: 1 == (azimuth & 1) ? !((azimuth >> 1) & 1) * 2 - 1 : 0,
            y: 0 == (azimuth & 1) ? ((azimuth >> 1) & 1) * 2 - 1 : 0
        };
    }

    /*
        自动寻路函数开始
    */

    function newPoint(x, y) {
        return {
            x: Math.floor(x),
            y: Math.floor(y),
            equals: function (point) {
                return this.x == point.x && this.y == point.y;
            },
            offset: function (offsetx, offsety) {
                return newPoint(this.x + Math.floor(offsetx),
                  this.y + Math.floor(offsety));
            }
        };
    }

    function newSize(width, height) {
        return {
            width: Math.floor(width),
            height: Math.floor(height)
        };
    }

    function newRect(point, size) {
        return {
            x: Math.floor(point.x),
            y: Math.floor(point.y),
            width: Math.floor(size.width),
            height: Math.floor(size.height),
            left: function () { return this.x; },
            top: function () { return this.y; },
            right: function () { return this.x + this.width; },
            bottom: function () { return this.y + this.height; },
            copySize: function () { return { width: width, height: height } },
            isContainPoint: function (point) {
                return this.left() <= point.x && this.right() > point.x
                  && this.top() <= point.y && this.bottom() > point.y;
            },
            isContainRect: function (rect) {
                return this.left() <= rect.left() && this.right() >= rect.right()
                  && this.top() <= rect.top() && this.bottom() >= rect.bottom();
            }
        };
    }

    function autoFindWay(mapdata, mapsize) {

        // 地图
        var map = {
            data: mapdata,
            rect: newRect(newPoint(0, 0), mapsize)
        };

        // 创建权值表
        var createWeightTable = function (rect, fillfunc) {
            var t = new function () {
                var table = new Array(rect.width * rect.height);
                this.get = function (x, y) {
                    if (!rect.isContainPoint({ x: x, y: y }))
                        return null;
                    return table[(y - rect.y) * rect.width + x - rect.x];
                };
                this.set = function (x, y, value) {
                    if (!rect.isContainPoint({ x: x, y: y }))
                        return;
                    table[(y - rect.y) * rect.width + x - rect.x] = value;
                };
                for (var i = 0; i < table.length; i++) {
                    table[i] = fillfunc(i % rect.width + rect.x,
                      Math.floor(i / rect.width) + rect.y);
                }
            }();
            return t;
        };

        // 二分法查找新路径点权值并插入列表，列表按权值从小到大排列
        var dichotomyFindInsert = function (pathtable, fillingpoints, point) {

            var l = 0;                     // 左指针
            var r = fillingpoints.length;  // 右指针
            var p = 0;                     // 中指针

            // 获取指定点的路径权值，过高或过低则忽略掉
            var weight = pathtable.get(point.x, point.y);
            if (null == weight || weight < 0.0 || weight > 1048576.0)
                return;

            while (l < r) {
                // 二分法取中点获取权值
                p = Math.floor((l + r) / 2);
                var w1 = pathtable.get(fillingpoints[p].x, fillingpoints[p].y);
                if (null == w1)
                    return;

                if (w1 == weight) {
                    // 权值相等，直接将新点插入此位置
                    fillingpoints.splice(p, 0, point);
                    return;
                }

                // 权值不等，继续采用二分法寻点
                if (w1 < weight)
                    l = p + 1;
                else
                    r = p;
            }
            // 找到合适的插入点，将新点插入此位置
            fillingpoints.splice(l, 0, point);
        };

        // 为指定路径点填充相邻路径点
        var fillPathPointAdjacent = function (
          maptable, pathtable, fillingpoints, point) {

            // 获取指定点的路径权值，过高或过低则忽略掉
            var weight = pathtable.get(point.x, point.y);
            if (null == weight || weight < 0.0 || weight > 1048576.0)
                return;

            var pl = [
              point.offset(0, -1),
              point.offset(1, 0),
              point.offset(0, 1),
              point.offset(-1, 0),
            ];

            var w = maptable.get(point.x, point.y) / 2.0;
            if (null == w)
                return;

            weight += w;

            for (var k in pl) {
                var p = pl[k];
                var mpw = maptable.get(p.x, p.y);
                if (null == mpw || mpw < 0.0 || mpw > 1024.0)
                    continue;

                var pw = weight + mpw / 2.0;
                var ppw = pathtable.get(p.x, p.y)
                if (null == ppw || pw >= ppw)
                    continue;

                pathtable.set(p.x, p.y, pw);
                dichotomyFindInsert(pathtable, fillingpoints, p);
            }
        }

        // 找出指定路径点附近最小权值路径点
        var findMinAdjacentPoint = function (pathtable, point) {

            // 获取指定点的路径权值
            var weight = pathtable.get(point.x, point.y);
            if (null == weight || weight < 0.0 || weight > 1048576.0)
                return null;

            var pl = [
              point.offset(0, -1),
              point.offset(1, 0),
              point.offset(0, 1),
              point.offset(-1, 0),
            ];

            var mp = newPoint(point.x, point.y);
            var mpw = weight;
            for (var k in pl) {
                var ppw = pathtable.get(pl[k].x, pl[k].y);
                if (null == ppw || ppw < 0.0 || ppw > 1048576.0)
                    continue;

                if (ppw < mpw) {
                    mp = pl[k];
                    mpw = ppw;
                }
            }
            return mp;
        }

        // 将地图块索引转换为路径点权值
        var toWeight = function (w) {
            return w;
        };

        // 获取路径点列表
        this.GetWayPoints = function (startpoint, endpoint, size) {

            // 新建一个矩形对象，表示以 startpoint 为中心的矩形
            var rect = newRect(newPoint(0, 0), size);

            // 判断矩形对象和终点是否超出地图范围
            if (!map.rect.isContainRect(rect) || !map.rect.isContainPoint(endpoint)) return null;

            // 判断矩形对象是否包含终点
            if (!rect.isContainPoint(endpoint)) return null;

            // 地图权值表
            var maptable = createWeightTable(rect, function (x, y) {
                return toWeight(map.data[x + y * map.rect.width]);
            });

            // 路径权值表
            var pathtable = createWeightTable(rect, function (x, y) {
                return Number.MAX_VALUE;
            });

            // 指定路径权值表起点位置
            pathtable.set(startpoint.x, startpoint.y, 0.0);

            // 查找新路径点权值并插入列表
            var fillingpoints = [];
            dichotomyFindInsert(pathtable, fillingpoints, startpoint);
            while (0 < fillingpoints.length) {
                var p = fillingpoints[0];
                fillingpoints.splice(0, 1);
                fillPathPointAdjacent(maptable, pathtable, fillingpoints, p);
            }

            // 找出目标点附近最小权值路径点
            var p = findMinAdjacentPoint(pathtable, endpoint);
            if (null == p) return [];

            // 从目标点开始取出到起点的所有路径点，
            var pl = [];
            pl.push(endpoint);
            var last = endpoint;
            while (!p.equals(last)) {
                last = p;
                pl.push(last);
                p = findMinAdjacentPoint(pathtable, last);
            }

            // 颠倒点列表的项顺序并输出
            pl.reverse();
            return pl;
        }
    }

    /*
        自动寻路函数结束
    */

    TeaJs.Plugins.Rpg = Rpg;
}(TeaJs);