/// <reference path="../../TeaJs/TeaJs-api-vsdoc.js" />
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

    Rpg.prototype.Person = function (rpg, content, name, pictureName, animationName) {
        /// <summary>人物类</summary>
        /// <param name="content" type="Content">内容管理器</param>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="pictureName" type="String"></param>
        /// <returns type="Person">人物对象</returns>

        var _this = this;

        this.frame = rpg;
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
        // 所用的人物动画图片
        this.picture = null;
        content.load("TeaJs-Rpg-Person" + new Date().getTime() + Math.random(), pictureName, function (img) {
            _this.picture = img;
        });
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
        if (1.0 > this.moveProcess)
            return;

        // 获得移动的方向
        var vector = getMoveVector(this.direction);

        // 如果进度已经满了，则让英雄前进到目标点
        this.location.x += vector.x;
        this.location.y += vector.y;
        this.moveProcess = 0.0;
        this.isRunning = false;
    };

    Rpg.prototype.Person.prototype.moveTo = function (location, fun) {
        /// <summary>移动到指定位置</summary>
        /// <param name="location" type="Vector2">目标位置</param>
        /// <param name="fun" type="Function" optional="true">到达目的地后执行函数</param>


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
        });
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

        var keyboard;
        for (var i = this.devices.length; i--;) {
            if (this.devices[i] instanceof TeaJs.Keyboard) keyboard = this.devices[i];
        }

        if (keyboard && this.checkKeyboard(keyboard)) return;
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
                    if (p.fun && p.location.x == heroDirLocation.x && p.location.y == heroDirLocation.y) {
                        p.direction = this.player.direction + 2;
                        if (p.direction > 3) p.direction -= 4;
                        p.fun(p);
                    }
                }

                // 手动触发事件
                var event;
                for (var i = this.eventList.length; i--;) {
                    event = this.eventList[i];
                    if (event.location.x == heroDirLocation.x && event.location.y == heroDirLocation.y && event.triggerMode == this.triggerMode.click) {
                        event.fun && event.fun();
                    }
                }
            }
            this.isEventDown = false;
        }

        // 自动触发事件
        var event;
        for (var i = this.eventList.length; i--;) {
            event = this.eventList[i];
            if (event.location.x == heroDirLocation.x && event.location.y == heroDirLocation.y && !event.isTrigger && event.triggerMode == this.triggerMode.auto) {
                event.fun && event.fun();
                event.isTrigger = true;
            } else if (event.isTrigger && (event.location.x != heroDirLocation.x || event.location.y != heroDirLocation.y)) {
                event.isTrigger = false;
            }
        }

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

    TeaJs.GameFrames.Rpg = Rpg;
}(TeaJs);