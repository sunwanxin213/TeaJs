function loadFile(url, syne, type, callback, onerror) {
    /// <summary>Ajax加载文件</summary>
    /// <param name="url" type="String">文件地址</param>
    /// <param name="syne" type="Boolean">是否异步加载</param>
    /// <param name="type" type="String">Mime类型</param>
    /// <param name="callback" type="Function">回调函数</param>
    /// <param name="onerror" type="Function">自定义错误处理函数</param>

    var xmlHttp = new XMLHttpRequest();
    if (syne == null) {
        syne = true;
    }

    if (type == null) {
        type = 'text/plain';
    }

    if (!("withCredentials" in xmlHttp)) {
        xmlHttp = new XDomainRequest();
        xmlHttp.onload = function () {
            callback(this.responseText);
        };
        xmlHttp.open("GET", url);
    } else {
        xmlHttp.open('GET', url, syne);

        //定义传输的文件HTTP头信息
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
    }

    // 文本格式不支持设置responseType
    if (type.indexOf("text") < 0) {
        xmlHttp.responseType = type;
    }
    xmlHttp.onerror = onerror || function () {
        throw new Error("File \"" + url + "\" failed to load.");
    };
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4) {
            if (xmlHttp.status == 404) {
                this.onerror();
            }
            if (callback) {
                if (type.indexOf("text") < 0) {
                    callback(xmlHttp.response);
                } else {
                    callback(xmlHttp.responseText);
                }
            }
            this.onreadystatechange = null;
            this.onerror = null;
            xmlHttp = null;
            callback = null;
        }
    };
    xmlHttp.send(null);
}

function getQueryString(name) {
    /// <summary>获取页面参数</summary>
    /// <param name="name" type="String">参数名称</param>
    /// <returns type="String">参数值</returns>

    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return "";
}