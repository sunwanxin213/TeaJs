void function (TeaJs) {
    "use strict";

    function load(shareData) {
        /// <summary>加载资源函数</summary>
        /// <param name="shareData" type="Object">共享数据对象</param>

        // 缓存内容管理器对象
        var c = shareData.content;

        // 缓存渲染器对象
        var r = shareData.renderer;

        // 缓存Rpg框架对象
        var rpg = shareData.rpg;

        rpg.changeMap("map/2.ttm.js");
        rpg.setPlayer("初音ミク", "animation/miku.png", "animation/person.tfa.js", { x: 10, y: 21 });

        rpg.addNpc("カイト", "animation/kaito.png", "animation/person.tfa.js", { x: 9, y: 18 }, 2, function (person) {
            var player = rpg.getPerson("初音ミク");
            player.say("カイトさん，又见面了!~(哈~好帅，好开心)", "player1");
            person.say("ミクちゃん，最近有没有好好学习音乐知识啊？", "kaito");
            player.say("嘻嘻，人家当然有好好学啊~", "player1");
            person.say("那不如让哥哥来检查一下，看看你是不是真的有在好好学。(邪恶的笑)", "kaito");
            player.say("喵~又要考试~~~~", "player2");
            person.say("哦~看来你是有偷懒哦！", "kaito");
            player.say("人家、人家才没有偷懒！~~~~不就是考试嘛~考就是啦~（唔。。死定了……）", "player3");
            person.say("嘛，准备好了来跟我说下。", "kaito");
            player.say("知道了啦~", "player1");
            player.say("（唔……怎么办怎么办！~）", "player3");
            person.fun = function () {
                person.say("额~没做完，所以……（邪恶的笑），去散散步吧。", "kaito", function () {
                    player.moveTo(33, 9, function () {
                        player.say("尼玛啊！坑老娘啊！散你妹的步啊！", "player3");
                    });
                });
            };
        });

        c.load("player1", "images/miku_m_1_059.png");
        c.load("player2", "images/miku_m_1_105.png");
        c.load("player3", "images/miku_m_1_101.png");
        c.load("kaito", "images/kaito.png");

        //c.load("bgMusic", "music/Flower Dance." + TeaJs.checkInfo.audioFormats[0], function (audio) {
        //    audio.play();
        //});

        //rpg.addEvent(1, rpg.triggerMode.auto, { x: 9, y: 20 }, function () {

        //});
    }

    function update(shareData) {
        /// <summary>更新数据函数</summary>
        /// <param name="shareData" type="Object">共享数据对象</param>

        // 缓存鼠标对象
        var m = shareData.mouse;

        // 缓存键盘对象
        var k = shareData.keyboard;

        // 缓存触摸对象
        var t = shareData.touches;

        shareData.rpg.update();
    }

    function draw(shareData) {
        /// <summary>绘制画面数据</summary>
        /// <param name="shareData" type="Object">共享数据对象</param>

        // 缓存内容管理器对象
        var c = shareData.content;

        // 缓存渲染器对象
        var r = shareData.renderer;

        shareData.rpg.draw();
    }

    function unload(shareData) {
        /// <summary>卸载资源函数</summary>
        /// <param name="shareData" type="Object">共享数据对象</param>

        // 缓存内容管理器对象
        var c = shareData.content;

        /* TODO:在此添加您的代码 */
    }

    // 更改游戏状态至当前状态
    changeStatus(load, update, draw, unload);

}(TeaJs);