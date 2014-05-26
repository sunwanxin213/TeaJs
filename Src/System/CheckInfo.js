void function check() {
    "use strict";

    if (document.body == null) { return (window.attachEvent || window.addEventListener)((!!window.attachEvent ? "on" : "") + "load", check, false); }

    var ua = navigator.userAgent.substr(0, 256).toLowerCase();

    // 信息对象
    var tci = null;
    (window.TeaJs = window.TeaJs || {}).checkInfo = tci = {
        ua: navigator.userAgent.substr(0, 256),
        language: (navigator.language || navigator.userLanguage || navigator.systemLanguage || navigator.browserLanguage).toLowerCase(),
        browser: "unkown",
        browserVersion: "unkown",
        network: "unkown",
        usePhoneData: false,
        system: "unkown",
        cpuClass: (testUa("WOW64") || testUa("86_64") || testUa("X64")) ? "x64" : testUa("arm;") ? "arm" : "x86",
        resolution: "[" + screen.width + ", " + screen.height + "]",
        canvas: {
            isSupported: !!window.CanvasRenderingContext2D,
            level: 0,
            isSupportedText: false
        },
        webgl: {
            isSupported: !!window.WebGLRenderingContext,
            isEnable: false,
            level: 0,
            supportedContextNames: [],
            isIEWebGL: false,
            hasProblems: false,
            isSupportedAntialias: false,
            isUsingDirect3D: false,
            maxAnisotropy: "Not available",
            supportedExtensions: []
        }
    };

    function testUa(name) {
        /// <summary>检测用户代理字符串</summary>

        return -1 < ua.indexOf(name.toLowerCase());
    }

    // 浏览器前缀
    var prefixs = ["", "WEBKIT_", "MOZ_", "MS_", "O_"];

    void function checkBrowser() {
        /// <summary>检测浏览器</summary>

        try {
            if (testUa("OPR/") || "undefined" !== typeof window.opera) {
                tci.browser = "opera";
                tci.browserVersion = tci.ua.split("OPR/")[1] || window.opera.version();
            }
            else if (testUa("Firefox/")) {
                tci.browser = "firefox";
                tci.browserVersion = tci.ua.split("Firefox/")[1];
            }
            else if (testUa("Chrome/")) {
                tci.browser = "chrome";
                tci.browserVersion = tci.ua.split("Chrome/")[1].split(" ")[0];
            }
            else if (testUa("Safari/")) {
                tci.browser = "safari";
                tci.browserVersion = tci.ua.split("Version/")[1];
            }
            else if (eval("/*@cc_on!@*/!1")) {
                tci.browser = "msie";
                tci.browserVersion = navigator.appVersion.split("MSIE ")[1].split(";")[0];
            } else if (testUa("Trident/")) {
                tci.browser = "msie";
                tci.browserVersion = navigator.appVersion.split("rv:")[1].split(")")[0];
            }
            tci.browserVersion = parseFloat(tci.browserVersion);
        } catch (e) {
            tci.browser = tci.browserVersion = "unkown";
        }

        if (tci.browser == "msie") {
            if ("undefined" == typeof document.documentMode) {
                tci.browserVersion = tci.ieDocumentMode = 6;
            } else {
                tci.ieDocumentMode = document.documentMode;
            }
        }
    }();

    void function checkNetwork() {
        /// <summary>检查网络</summary>

        if (navigator.connection) {
            switch (navigator.connection.type) {
                case 1:
                    tci.network = "ethernet";
                    break;
                case 2:
                    tci.network = "wifi";
                    break;
                case 3:
                    tci.network = "2g";
                    tci.usePhoneData = true;
                    break;
                case 4:
                    tci.network = "3g";
                    tci.usePhoneData = true;
                    break;
            }
        }
    }();

    void function checkSystem() {
        /// <summary>检查系统</summary>

        var isWindows = (navigator.platform == "Win32") || (navigator.platform == "Windows");

        if (isWindows) {
            if (testUa("win98")) { tci.system = "windows 98"; }
            else if (testUa("windows nt 5.0")) { tci.system = "windows 2000"; }
            else if (testUa("windows nt 5.1")) { tci.system = "windows xp"; }
            else if (testUa("windows nt 5.2")) { tci.system = "windows server 2003"; }
            else if (testUa("windows nt 6.0")) {
                tci.system = "windows vista";
                tci.browser == "msie" && (tci.browserVersion = tci.browserVersion < 7 ? 7 : tci.browserVersion);
            }
            else if (testUa("windows nt 6.1")) {
                tci.system = "windows 7";
                tci.browser == "msie" && (tci.browserVersion = tci.browserVersion < 8 ? 8 : tci.browserVersion);
            }
            else if (testUa("windows nt 6.2")) {
                tci.system = "windows 8";
                tci.browser == "msie" && (tci.browserVersion = tci.browserVersion < 10 ? 10 : tci.browserVersion);
            }
            else if (testUa("windows nt 6.3")) {
                tci.system = "windows 8.1";
                tci.browser == "msie" && (tci.browserVersion = tci.browserVersion < 11 ? 11 : tci.browserVersion);
            }
            else if (testUa("windows phone")) {
                tci.system = "windows phone" + ua.split("windows phone")[1].split(";")[0].split(")")[0];
            }
        }
        if (testUa("iphone") || testUa("ipad")) { tci.system = "ios"; }
        else if (testUa("android")) { tci.system = "android"; }
        else if (testUa("mac")) { tci.system = "mac"; }
        else if (testUa("linux")) { tci.system = "linux"; }
        else if (testUa("x11")) { tci.system = "unix"; }
    }();

    void function checkMedia() {
        /// <summary>检查媒体格式</summary>

        // 音频格式列表
        var audioFormatList = {
            "audio/ogg": "ogg",
            "audio/mpeg": "mp3",
            "audio/wav": "wav",
            "audio/aac": "aac"
        };
        // 支持音频格式列表
        var audioSupportFormats = [];
        // 检查支持音频格式
        var audio = document.createElement("audio");
        if (audio.canPlayType) {
            for (var i in audioFormatList) {
                if (audio.canPlayType(i)) {
                    audioSupportFormats.push(audioFormatList[i]);
                }
            }
        }
        tci.audioFormats = audioSupportFormats;

        // 视频格式列表
        var videoFormatList = {
            "video/mp4": "mp4",
            "video/ogg": "ogv",
            "video/webm": "webm"
        };
        // 支持视频格式列表
        var videoSupportFormats = [];
        // 检查视频支持格式
        var video = document.createElement("video");
        if (video.canPlayType) {
            for (var i in videoFormatList) {
                if (video.canPlayType(i)) {
                    videoSupportFormats.push(videoFormatList[i]);
                }
            }
        }
        tci.videoFormats = videoSupportFormats;
    }();

    void function checkCanvas2d() {
        /// <summary>检测2D画布对象信息</summary>

        if (tci.canvas.isSupported) {
            // 创建临时画布
            var canvas2d = document.createElement("canvas");
            var canvas2dCtx = canvas2d.getContext("2d");

            // 检测支持级别
            tci.canvas.level = "undefined" !== typeof canvas2dCtx.imageSmoothingEnabled ? 2 : 1;
            // 检测是否支持TextApi
            tci.canvas.isSupportedText = typeof canvas2dCtx.fillText == "function";
        }
    }();

    void function checkWebgl() {
        /// <summary>检测WebGL对象信息</summary>

        // WebGL上下文
        var glCtx;

        if (!tci.webgl.isSupported) {
            glCtx = document.createElement("object");
            glCtx.setAttribute("type", "application/x-webgl");
            glCtx.style.display = "none";
            document.body.appendChild(glCtx);
            if ("undefined" !== typeof glCtx.getContext) {
                tci.webgl.isSupported = tci.webgl.isIEWebGL = true;

                try {
                    glCtx = glCtx.getContext("webgl");
                    tci.webgl.supportedContextNames.push("webgl");
                    tci.webgl.isSupported = tci.webgl.isIEWebGL = tci.webgl.isEnable = true;
                } catch (e) {
                    glCtx = null;
                }
            }
        }

        if (tci.webgl.isSupported) {
            // WebGL已知上下文名称列表
            var webglContextNameList = ["webgl2", "experimental-webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl", "3d"];

            for (var i = webglContextNameList.length; i-- && !tci.webgl.isIEWebGL;) {
                // 检测支持的上下文名称
                if (function () {
                    var tempCtx = document.createElement("canvas").getContext(webglContextNameList[i]);
                    glCtx = glCtx || tempCtx;
                    return tempCtx;
                }()) {
                    if ("WebGL2RenderingContext" in window && glCtx instanceof WebGL2RenderingContext) tci.webgl.level = 2;
                    else if ("WebGLRenderingContext" in window && glCtx instanceof WebGLRenderingContext) tci.webgl.level = 1;
                    tci.webgl.supportedContextNames.push(webglContextNameList[i]);
                    tci.webgl.isEnable = true;
                }
            }

            // 检测是否存在问题
            if (tci.webgl.hasProblems = glCtx == null || ("function" != typeof glCtx.getParameter && "object" != typeof glCtx.getParameter)) return;

            // WebGL对象列表
            var webglObjList = ["VERSION", "SHADING_LANGUAGE_VERSION", "VENDOR", "RENDERER", "MAX_VERTEX_ATTRIBS", "MAX_VERTEX_UNIFORM_VECTORS", "MAX_VERTEX_TEXTURE_IMAGE_UNITS", "MAX_VARYING_VECTORS", "ALIASED_LINE_WIDTH_RANGE", "ALIASED_POINT_SIZE_RANGE", "MAX_FRAGMENT_UNIFORM_VECTORS", "MAX_TEXTURE_IMAGE_UNITS", "MAX_RENDERBUFFER_SIZE", "MAX_VIEWPORT_DIMS", "MAX_TEXTURE_SIZE", "MAX_CUBE_MAP_TEXTURE_SIZE", "MAX_COMBINED_TEXTURE_IMAGE_UNITS"];

            // 检查WebGL对象详情
            for (var i = 0; i < webglObjList.length; i++) {
                var result = glCtx.getParameter(glCtx[webglObjList[i]]);
                if ("object" == typeof result && null != result) {
                    result = "[" + result[0] + ", " + result[1] + "]";
                }

                // 将对象添加到信息对象中
                tci.webgl[webglObjList[i].toString().toLowerCase().replace(/_[a-z]/g, function (m) { return m.substr(1, 1).toUpperCase(); })] = result;
            }

            // 检测是否支持抗锯齿
            tci.webgl.isSupportedAntialias = function () {
                try {
                    return glCtx.getContextAttributes().antialias;
                } catch (e) {
                    return false;
                }
            }();

            // 检测是否使用Angle中间件
            tci.webgl.isUsingDirect3D = function () {
                return "Win32" === navigator.platform &&
                       function (m) {
                           return "[" + m[0] + ", " + m[1] + "]";
                       }(glCtx.getParameter(glCtx.ALIASED_LINE_WIDTH_RANGE)) === "[1, 1]";
            }();

            // 检测支持的WebGL扩展
            try {
                var exts = glCtx.getSupportedExtensions();
                for (var i = 0; i < exts.length; i++) {
                    //var w3cExtName = exts[i];
                    //for (var n = 0; n < prefixs.length; n++) w3cExtName = w3cExtName.replace(prefixs[n], "");
                    // link: "http://www.khronos.org/registry/webgl/extensions/" + w3cExtName
                    tci.webgl.supportedExtensions.push(exts[i]);
                }
            } catch (e) {
                tci.webgl.supportedExtensions = "Unable to get";
            }

            // 检测各向异性过滤支持度
            tci.webgl.maxAnisotropy = function () {
                var obj;
                var textureMaxAnisotropyExt = "Not available";

                for (var i = 0; i < prefixs.length; i++) {
                    if (obj = glCtx.getExtension(prefixs[i] + "EXT_texture_filter_anisotropic")) break;
                }

                if (obj) {
                    textureMaxAnisotropyExt = glCtx.getParameter(obj.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                    if (0 === textureMaxAnisotropyExt) textureMaxAnisotropyExt = 2;
                }

                return textureMaxAnisotropyExt;
            }();

            // 检测渲染器浮点精度
            tci.webgl["vertextPrecision"] = getPrecision(glCtx.VERTEX_SHADER);
            tci.webgl["fragmentPrecision"] = getPrecision(glCtx.FRAGMENT_SHADER);
        }

        function getPrecision(obj) {
            /// <summary>获取浮点数精度</summary>
            /// <param name="obj" type="Object">要获取的对象</param>
            /// <returns type="Object or String">包含精度的对象或字符串</returns>

            var highPrecision;

            try {
                var high = glCtx.getShaderPrecisionFormat(obj, glCtx.HIGH_FLOAT);
                var medium = glCtx.getShaderPrecisionFormat(obj, glCtx.MEDIUM_FLOAT);
                var low = glCtx.getShaderPrecisionFormat(obj, glCtx.LOW_FLOAT);
                if (0 === high.precision) { highPrecision = medium; }
                else if (0 === medium.precision) { highPrecision = low; }
                else { highPrecision = high; }

                return function (h) {
                    return "[-" + ("2^" + h.rangeMin) + ", " + ("2^" + h.rangeMax) + "](" + h.precision + ")";
                }(highPrecision);
            }
            catch (e) {
                return "Not available";
            }
        }
    }();
}();