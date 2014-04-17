/// <reference path="../TeaJs-api-vsdoc.js" />
/*
    Be-Music Source加载器
*/
void function (TeaJs) {
    "use strict";

    function Bms() {
        /// <summary>Bms加载器构造函数</summary>
        /// <returns type="BmsLoader">Bms加载器</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "Bms", "bms".split(" "));
    }

    // 获得加载器构造器函数
    Bms.prototype = new TeaJs.Loader();

    // 缓存原型对像
    var bms = Bms.prototype;

    bms.load = function (name, fileName, callback) {
        /// <summary>加载文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>

        var _this = this;

        TeaJs.loadFile(fileName, true, null, function (str) {
            var bmsObj = BMS.parse(str.replace(/(\r|\r\n|\n)+/g, "\n"));

            // 加入到项列表中
            _this.itemList.push({
                name: name,
                object: bmsObj
            });

            // 执行回调函数
            callback && callback(bmsObj);
        });
    };

    var BMS = function () {
        var bms = {};

        bms.parse = function (str) {
            /// <summary>从字符串解析BMS的数据</summary>
            /// <param name="str" type="String">要转换的字符串</param>
            /// <returns type="Object">包含BMS数据的对象</returns>

            var lines = str.split(/\n/).
                            map(function (x) { return x.replace(/^\s+|\s+$/g, '') }).
                            filter(function (x) { return x.match(/^#/) });

            var headers = {},
                events = [],
                measureSizes = {},
                eventLinesToParse = [],
                bpms = {},
                keysounds = {},
                autoKeysoundChannels = {};

            // 遍历每一行
            lines.forEach(function (line) {
                var match;
                if ((match = line.match(/^#(\d\d\d)(\d\d):(.+)/))) {
                    // 事件行，排队供以后处理
                    var measureNumber = parseInt(match[1], 10);
                    var channelNumber = parseInt(match[2], 10);
                    eventLinesToParse.push({
                        measure: measureNumber,
                        channel: channelNumber,
                        content: match[3]
                    });
                } else if ((match = line.match(/^#wav(..)\s+(.+)$/i))) {
                    // 添加关键音定义
                    keysounds[match[1].toUpperCase()] = match[2];
                } else if ((match = line.match(/^#bpm(..)\s+(.+)$/i))) {
                    // 添加BPM定义
                    var bpm = parseFloat(match[2]);
                    if (isNaN(bpm)) {
                        throw new Error('invalid bpm : ' + match[2]);
                    }
                    bpms[match[1].toUpperCase()] = bpm
                } else if ((match = line.match(/^#(\w+)\s+(.+)$/))) {
                    // 添加头信息
                    headers[match[1].toLowerCase()] = match[2];
                }
            })

            // 解析每个事件行
            eventLinesToParse.forEach(function (line) {
                parseEvent(line.measure, line.channel, line.content);
            })

            function parseEvent(measure, channel, content) {
                if (channel == 2) {
                    // 测量尺寸
                    var measureSize = parseFloat(content);
                    if (isNaN(measureSize)) {
                        throw new Error('invalid measure size');
                    }
                    measureSizes[measure] = measureSize;
                    return
                }
                if (channel == 1) {
                    // auto keysound -- adjust its channel (> 100)
                    channel = autoKeysoundChannels[measure] = (autoKeysoundChannels[measure] || 100) + 1;
                }

                // 通过每个对象循环
                var count = Math.floor(content.length / 2);
                for (var i = 0; i < count; i++) {

                    var text = content.substr(i * 2, 2),
                        position = i / count;
                    if (text != '00') {
                        var obj = { measure: measure, position: position };
                        if (channel == 3) {
                            // bpm (hex)
                            obj.channel = 8;
                            obj.value = parseInt(text, 16);
                            if (isNaN(obj.value)) throw new Error('invalid bpm: ' + text);
                        } else if (channel == 8) {
                            // bpm (ref)
                            obj.channel = 8;
                            obj.value = bpms[text.toUpperCase()];
                            if (!obj.value) throw new Error('invalid bpmref: ' + text);
                        } else {
                            // other
                            obj.channel = channel;
                            obj.value = text.toUpperCase();
                        }
                        events.push(obj);
                    }
                }
            }

            return {
                headers: headers,
                events: events,
                measureSizes: measureSizes,
                keysounds: keysounds
            }

        }

        function stringify(bms) {
            /// <summary>将BMS对象转换成字符串</summary>
            /// <param name="bms" type="Object">包含BMS数据的对象</param>
            /// <returns type="String">BMS字符串</returns>

            var lines = [],
                k;

            // pad with zero (3 digits)
            function pad(x) {
                var d = '000' + x;
                return d.substr(d.length - 3);
            }

            // pad with zero (2 digits)
            function two(x) {
                var d = '00' + x;
                return d.substr(d.length - 2);
            }

            // 添加头数据
            for (k in bms.headers) {
                lines.push('#' + String(k).toUpperCase() + ' ' + bms.headers[k]);
            }

            // 添加关键音数据
            for (k in bms.keysounds) {
                lines.push('#WAV' + String(k).toUpperCase() + ' ' + bms.keysounds[k]);
            }

            // 添加测量尺寸数据
            for (k in bms.measureSizes) {
                if (Number(bms.measureSizes[k]) !== 1) {
                    lines.push('#' + pad(k) + '02:' + bms.measureSizes[k]);
                }
            }

            // 建立BPM的定义
            var bpms = {},
                nextBpm = 1;
            function allocBpm(bpm) {
                var id = two((nextBpm++).toString(36).toUpperCase());
                lines.push('#BPM' + id + ' ' + bpm);
                return id;
            }

            var events = bms.events.map(function (event) {
                // process bpm events, convert them to either hex or ref bpm
                if (event.channel != 8) return event;

                if (Math.abs(event.value - Math.round(event.value)) < 1.0e-5) {
                    if (event.value > 0 && event.value <= 255) {
                        // hex bpm
                        return {
                            measure: event.measure,
                            position: event.position,
                            channel: 3,
                            value: two(Math.round(event.value).toString(16).toUpperCase())
                        }
                    }
                }

                // ref bpm
                var bpm = String(event.value),
                    id = bpms[bpm] || (bpms[bpm] = allocBpm(bpm));
                return {
                    measure: event.measure,
                    position: event.position,
                    channel: 3,
                    value: id
                }
            });

            // hold output lines, but for notes
            var noteLines = [];

            // 遍历每一个小节
            eventMeasures.forEach(function (measureNumber) {
                var measureEvents = eventsByMeasure[measureNumber];
                noteLines.push('');

                // for each channel,
                var lastAK = 101;
                channels.forEach(function (channelIndex) {

                    var channelText = two(channelIndex + '');
                    if (channelIndex > 100) channelText = '01';

                    // pad with blank autokeysound channel
                    while (channelIndex > lastAK) {
                        noteLines.push('#' + pad(measureNumber) + '01:00');
                        lastAK++;
                    }

                    // build position map
                    var map = {},
                        positions = [];
                    byChannel[channelIndex].forEach(function (event) {
                        var intPosition = Math.round(event.position * measureCount);
                        positions.push(intPosition);
                        map[intPosition] = event;
                    })

                    // generate the actual bms data string
                    var increment = positions.reduce(TeaJs.MathHelper.gcd, measureCount),
                        string = '';
                    for (var i = 0; i < measureCount; i += increment) {
                        if (map[i]) {
                            var data = '00' + map[i].value;
                            string += data.substr(data.length - 2);
                        } else {
                            string += '00';
                        }
                    }

                    noteLines.push('#' + pad(measureNumber) + channelText + ':' + string);
                });
            });

            return lines.concat(noteLines).join('\n');
        }
        bms.stringify = stringify;

        // compute and return a stat object for bms.
        function stat(bms) {
            var object = {};

            // 查找最大小节数
            (function () {
                var maxMeasure = 0
                bms.events.forEach(function (event) {
                    maxMeasure = Math.max(maxMeasure, event.measure);
                });
                (function () {
                    for (var id in bms.measureSizes) {
                        var measure = parseInt(id, 10);
                        maxMeasure = Math.max(maxMeasure, measure);
                    }
                })();
                object.maxMeasure = maxMeasure;
            })();

            // row calculator table
            (function () {
                var data = [],
                    start = 0,
                    size = 192;
                for (var i = 0; i <= object.maxMeasure; i++) {
                    size = Math.round(bms.measureSizes[i] ? bms.measureSizes[i] * 192 : 192);
                    data[i] = { start: start, size: size, end: start + size };
                    start += size;
                }
                object.measureStart = function (index) {
                    return index < data.length ?
                           data[index].start :
                           data[data.length - 1].start +
                           data[data.length - 1].size +
                           (index - data.length + 1) * 192;
                }
                object.measureSize = function (index) {
                    return index < data.length ? data[index].size : 192;
                }
                object.row = function (measure, position) {
                    if (typeof measure == 'object') {
                        if (measure.measure != null && measure.position != null) {
                            return object.row(measure.measure, measure.position);
                        }
                    }
                    return object.measureStart(measure) + Math.round(object.measureSize(measure) * position);
                }
                object.fromRow = function (row) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].start <= row && row < data[i].end) {
                            return {
                                measure: i,
                                position: (row - data[i].start) / data[i].size
                            }
                        }
                    }
                    var start = data[data.length - 1].end;
                    return {
                        measure: Math.floor((row - start) / 192),
                        position: ((row - start) % 192) / 192
                    }
                }
            })();

            return object;
        }
        bms.stat = stat;

        // 检查一个事件是否为音符事件
        bms.isNote = function (event) {
            return 10 < event.channel && event.channel < 30
                || 50 < event.channel && event.channel < 70
                || 100 < event.channel;
        }

        return bms;
    }();

    TeaJs.Loader.Bms = Bms;
}(TeaJs);