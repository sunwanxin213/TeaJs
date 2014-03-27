/*
    QQ音乐插件
*/
void function (TeaJs) {

    // QQ音乐对象
    var QQMusic = {};

    setInterval(function getJurisdiction() {
        /// <summary>申请QQ音乐服务器访问权限</summary>

        injectScript("http://qzone-music.qq.com/fcg-bin/fcg_set_musiccookie.fcg?fromtag=31");
        return getJurisdiction;
    }(), 3 * 60 * 1000);

    function injectScript(url) {
        /// <summary>引用脚本</summary>
        /// <param name="url" type="String">地址</param>

        var oScript = document.createElement("script");
        oScript.src = url;
        oScript.charset = 'gb2312';
        document.body.appendChild(oScript);
        document.body.removeChild(oScript);
    }

    function getCookie(name) {
        /// <summary>获取Cookie</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <returns type="String">内容</returns>

        var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)");
        var m = window.document.cookie.match(r);
        return (!m ? "" : m[1]);
    }

    function getCookieUin() {
        /// <summary>获取Cookie中的Uin</summary>
        /// <returns type="Object">Uin值或null</returns>

        var cookieUin = getCookie("uin");
        return cookieUin ? parseInt(cookieUin.substr(1), 10) : null;
    }

    function getAlbumPicture(albumId) {
        /// <summary>获取专辑图片</summary>
        /// <param name="albumId" type="Number">专辑编号</param>
        /// <returns type="String">专辑图片地址</returns>

        return "http://imgcache.qq.com/music/photo/album/" + parseInt(albumId) % 100 + "/albumpic_" + albumId + "_0.jpg";
    }

    function getSingerPicture(singerId) {
        /// <summary>获取歌手图片</summary>
        /// <param name="singerId" type="Number">歌手编号</param>
        /// <returns type="String">歌手图片地址</returns>

        return "http://imgcache.qq.com/music/photo/singer/" + parseInt(singerId) % 100 + "/singerpic_" + singerId + "_0.jpg";
    }

    // 回调函数
    var cb = null;

    QQMusic.getGuessYouLike = function (callback) {
        /// <summary>获取猜你喜欢列表</summary>
        /// <param name="callback" type="Function">回调函数</param>

        var lableId = [];
        for (var i = 118; i < 142; i++) {
            lableId.push(i);
        }
        lableId.push(150, 160);

        window.JsonCallBack = window.SongRecCallback = listAnalysis;

        cb = callback;

        injectScript("http://radio.cloud.music.qq.com/fcgi-bin/qm_guessyoulike.fcg?labelid=" + lableId[(lableId.length * Math.random()) | 0] + "&start=0&num=20&rnd=" + new Date().getTime());
    };

    QQMusic.searchSongs = function (key, callback) {
        /// <summary>搜索歌曲</summary>
        /// <param name="key" type="String">关键字</param>
        /// <param name="callback" type="Function">回调函数</param>

        cb = callback;

        key = encodeURI(key);

        window.MusicJsonCallBack = searchAnalysis;

        injectScript("http://s.plcloud.music.qq.com/fcgi-bin/smartbox.fcg?o_utf8=1&utf8=1&key=" + key + "&inCharset=GB2312&outCharset=utf-8");
    };

    QQMusic.getSongInfo = function (song, callback) {
        /// <summary>获取歌曲信息</summary>
        /// <param name="key" type="Object">歌曲对象</param>
        /// <param name="callback" type="Function">回调函数</param>

        cb = function (info) {
            info.name = song.name;
            info.singer = song.singer;
            info.imgUrl = getAlbumPicture(song.albumId);
            callback(info);
        };

        window.JsonCallback = musicAnalysis;

        injectScript("http://qzone-music.qq.com/fcg-bin/fcg_mv_getinfo_bysongid.fcg?mids=" + song.mid + "&uin=10000&loginUin=0&hostUin=0&outCharset=utf-8");
    };

    function listAnalysis(data) {
        /// <summary>随机音乐列表解析</summary>
        /// <param name="data" type="Array">随机列表数据</param>

        var playList = [];
        var regexp = new RegExp('(upload|stream)(\\d+)\\.(music\\.qzone\\.soso\\.com|qqmusic\\.qq\\.com)\\/(\\d+)\\.wma');
        var replacement = function (word, x, a, y, b) {
            return 'stream' + (10 + Number(a)) + '.qqmusic.qq.com/' + (18000000 + Number(b)) + '.mp3';
        };
        var songs = data.songs;
        for (var i = 0; i < songs.length; ++i) {
            var song = songs[i];
            var args = decodeURIComponent(song.data).replace(/\+/g, ' ').split('|');
            var singerId = args[2];
            var albumId = args[4];
            var name = args[1];
            var singer = args[3];
            playList.push({
                name: name,
                singer: singer,
                url: decodeURIComponent(song.url).replace(regexp, replacement),
                imgUrl: getAlbumPicture(albumId),
                singerImgUrl: getSingerPicture(singerId)
            });
        }
        cb && cb(playList);
    };

    function searchAnalysis(data) {
        /// </summary>搜索列表解析</summary>
        /// <param name="data" type="Array">搜索列表数据</param>

        var songs = data.tips.song;
        var albums = data.tips.album;
        for (var i = songs.length; i--;) {
            songs[i] = {
                id: songs[i].id,
                mid: songs[i].mid,
                name: songs[i].name,
                singer: songs[i].singer_name,
                albumId: function () {
                    for (var n = 0; n < albums.length; n++) {
                        if (albums[n].singer_name == songs[i].singer_name) {
                            return albums[n].id;
                        }
                    }
                }()
            };
        }
        cb && cb(songs);
    };

    function musicAnalysis(data) {
        /// <summary>单曲音乐解析</summary>
        /// <param name="data" type="Object">单曲音乐源数据</param>

        cb && cb({
            url: 'http://stream' + (10 + Number(data.num)) + '.qqmusic.qq.com/' + (30000000 + Number(data.mvlist[0].songid)) + '.mp3'
        });
    };

    TeaJs.Plugins.QQMusic = QQMusic;
}(TeaJs);