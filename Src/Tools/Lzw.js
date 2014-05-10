void function (TeaJs) {
    var Lzw = {};

    function Binary(initData, p, l, bl) {
        var data = initData && initData.constructor == Array ? initData.slice() : [], p = p | 0, l = l | 0, bl = Math.max((bl || 8) | 0, 1), mask = m(bl), _m = 0xFFFFFFFF; //数据，指针，长度，位长度，遮罩

        this.data = function (index, value) {
            if (!isNaN(value)) data[index] = (value | 0) || 0;
            if (!isNaN(index)) return data[index];
            else return data.slice();
        }

        this.read = function () {
            var re;
            if (p >= l) return 0;
            if (32 - (p % 32) < bl) {
                re = (((data[p >> 5] & m(32 - (p % 32))) << ((p + bl) % 32)) | (data[(p >> 5) + 1] >>> (32 - ((p + bl) % 32)))) & mask;
            } else {
                re = (data[p >> 5] >>> (32 - (p + bl) % 32)) & mask;
            }
            p += bl;
            return re;
        }

        this.write = function (i) {
            var i, hi, li;
            i &= mask;
            if (32 - (l % 32) < bl) {
                data[l >> 5] |= i >>> (bl - (32 - (l % 32)));
                data[(l >> 5) + 1] |= (i << (32 - ((l + bl) % 32))) & _m;
            } else {
                data[l >> 5] |= (i << (32 - ((l + bl) % 32))) & _m;
            }
            l += bl;
        }

        this.eof = function () { return p >= l; }

        this.reset = function () { p = 0; mask = m(bl); }
        this.resetAll = function () { data = []; p = 0; l = 0; bl = 8; mask = m(bl); _m = 0xFFFFFFFF; }

        this.setBitLength = function (len) {
            bl = Math.max(len | 0, 1);
            mask = m(bl);
        }

        this.toHexString = function () {
            var re = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i] < 0) {
                    re.push(pad((data[i] >>> 16).toString(16), 4) + pad((data[i] & 0xFFFF).toString(16), 4));
                } else {
                    re.push(pad(data[i].toString(16), 8));
                }
            }
            return re.join("");
        }

        this.toBinaryString = function () {
            var re = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i] < 0) {
                    re.push(pad((data[i] >>> 1).toString(2), 31) + (data[i] & 1));
                } else {
                    re.push(pad(data[i].toString(2), 32));
                }
            }
            return re.join("").substring(0, l);
        }

        this.toCString = function () {
            var _p = p, _bl = bl, re = [];
            this.setBitLength(13);
            this.reset();
            while (p < l) re.push(C(this.read()));
            this.setBitLength(_bl);
            p = _p;
            return C(l >>> 13) + C(l & m(13)) + re.join("");
        }

        this.fromCString = function (str) {
            this.resetAll();
            this.setBitLength(13);
            for (var i = 2; i < str.length; i++) this.write(D(str, i));
            l = (D(str, 0) << 13) | (D(str, 1) & m(13));
            return this;
        }

        this.clone = function () { return new Binary(data, p, l, bl); }
        function m(len) { return (1 << len) - 1; }
        function pad(s, len) { return (new Array(len + 1)).join("0").substring(s.length) + s; }
        function C(i) { return String.fromCharCode(i + 0x4e00); }
        function D(s, i) { return s.charCodeAt(i) - 0x4e00; }
    }

    Lzw.compress = function (str) {
        /// <summary>压缩</summary>
        /// <param name="str" type="String">要压缩的字符串</param>
        /// <returns type="String">压缩后的字符串</returns>

        var b = new Binary(), code_index = -1, char_len = 8;
        var str = str.replace(/[\u0100-\uFFFF]/g, function (s) {
            return "\&\#u" + pad(s.charCodeAt(0).toString(16), 4) + ";";
        });
        var dic = {}, cp = [], cpi, bl = 8;
        b.setBitLength(bl);
        for (var i = 0; i < (1 << char_len) + 2; i++) dic[i] = ++code_index;
        cp[0] = str.charCodeAt(0);
        for (var i = 1; i < str.length; i++) {
            cp[1] = str.charCodeAt(i);
            cpi = (cp[0] << 16) | cp[1];
            if (dic[cpi] == undefined) {
                dic[cpi] = (++code_index);
                if (cp[0] > m(bl)) { b.write(0x80); b.setBitLength(++bl); }
                b.write(cp[0]);
                cp[0] = cp[1];
            } else {
                cp[0] = dic[cpi];
            }
        }
        b.write(cp[0]);
        function pad(s, len) { return (new Array(len + 1)).join("0").substring(s.length) + s; }
        function m(len) { return (1 << len) - 1; }
        return b.toCString();
    };

    Lzw.decompress = function (str) {
        /// <summary>解压缩</summary>
        /// <param name="str" type="String">要解压的字符串</param>
        /// <returns type="String">解压缩后的字符串</returns>

        var b = new Binary();
        b.fromCString(str);
        b.reset();
        var result = [], dic_code = -1;
        var dic = {}, cp = [], bl = 8;
        for (i = 0; i < (1 << bl) + 2; i++) dic[i] = String.fromCharCode(++dic_code); //init the dic
        b.setBitLength(bl);
        cp[0] = b.read();
        while (!b.eof()) {
            cp[1] = b.read();
            if (cp[1] == 0x80) { b.setBitLength(++bl); cp[1] = b.read(); }
            if (dic[cp[1]] == undefined) dic[++dic_code] = dic[cp[0]] + dic[cp[0]].charAt(0);
            else dic[++dic_code] = dic[cp[0]] + dic[cp[1]].charAt(0);
            result.push(dic[cp[0]]);
            cp[0] = cp[1];
        }
        result.push(dic[cp[0]]);
        return result.join("").replace(/\&\#u[0-9a-fA-F]{4};/g, function (w) {
            return String.fromCharCode(parseInt(w.substring(3, 7), 16));
        });
    };

    TeaJs.Lzw = Lzw;
}(TeaJs);