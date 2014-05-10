/**
 * @fileoverview dds - Utilities for loading DDS texture files
 * @author Brandon Jones
 * @version 0.1
 *
 * @修改者 Nivk
 * @修改内容如下
 * @修改为TeaJs内容加载器
 */

/*
 * Copyright (c) 2012 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

/*
    Dds材质加载器
*/
void function (TeaJs) {
    "use strict";

    function TextureDds() {
        /// <summary>DDS材质加载器构造函数</summary>
        /// <returns type="TextureDdsLoader">DDS材质加载器</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "DDS_Texture", ["dds"]);
    }

    // 获得加载器构造器函数
    TextureDds.prototype = new TeaJs.Loader();

    // 缓存原型对象
    var dds = TextureDds.prototype;

    // 所有的值都引用自这里:
    // http://msdn.microsoft.com/en-us/library/bb943991.aspx/

    // 文件头标记
    var DDS_MAGIC = 0x20534444;

    var DDSD_CAPS = 0x1,
        DDSD_HEIGHT = 0x2,
        DDSD_WIDTH = 0x4,
        DDSD_PITCH = 0x8,
        DDSD_PIXELFORMAT = 0x1000,
        DDSD_MIPMAPCOUNT = 0x20000,
        DDSD_LINEARSIZE = 0x80000,
        DDSD_DEPTH = 0x800000;

    var DDSCAPS_COMPLEX = 0x8,
        DDSCAPS_MIPMAP = 0x400000,
        DDSCAPS_TEXTURE = 0x1000;

    var DDSCAPS2_CUBEMAP = 0x200,
        DDSCAPS2_CUBEMAP_POSITIVEX = 0x400,
        DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800,
        DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000,
        DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000,
        DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000,
        DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000,
        DDSCAPS2_VOLUME = 0x200000;

    var DDPF_ALPHAPIXELS = 0x1,
        DDPF_ALPHA = 0x2,
        DDPF_FOURCC = 0x4,
        DDPF_RGB = 0x40,
        DDPF_YUV = 0x200,
        DDPF_LUMINANCE = 0x20000;

    function FourCCToInt32(value) {
        return value.charCodeAt(0) +
            (value.charCodeAt(1) << 8) +
            (value.charCodeAt(2) << 16) +
            (value.charCodeAt(3) << 24);
    }

    function Int32ToFourCC(value) {
        return String.fromCharCode(
            value & 0xff,
            (value >> 8) & 0xff,
            (value >> 16) & 0xff,
            (value >> 24) & 0xff
        );
    }

    var FOURCC_DXT1 = FourCCToInt32("DXT1");
    var FOURCC_DXT1NotA = 2001;
    var FOURCC_DXT3 = 2003;
    var FOURCC_DXT5 = FourCCToInt32("DXT5");

    // 头长度为32位整数
    var headerLengthInt = 31;

    // 头数组偏移量
    var off_magic = 0;

    var off_size = 1;
    var off_flags = 2;
    var off_height = 3;
    var off_width = 4;

    var off_mipmapCount = 7;

    var off_pfFlags = 20;
    var off_pfFourCC = 21;

    function uploadDDSLevels(gl, ext, arrayBuffer, loadMipmaps) {
        /// <summary>解析DDS文件</summary>
        /// <param name="gl" type="WebGLContext">WebGL上下文</param>
        /// <param name="ext" type="webgl_compressed_texture_s3tc">s3tc压缩材质扩展对象</param>
        /// <param name="arrayBuffer" type="ArrayBuffer">DDS文件数据</param>
        /// <param name="loadMipmaps" type="Boolean">是否加载所有Mipmap</param>
        /// <returns type="Number">Mipmap数量</returns>

        // 获取文件头
        var header = new Int32Array(arrayBuffer, 0, headerLengthInt),
            fourCC, blockBytes, internalFormat,
            width, height, dataLength, dataOffset,
            byteArray, mipmapCount, i;

        // 文件头错误
        if (header[off_magic] != DDS_MAGIC) {
            throw new Error("Invalid magic number in DDS header.");
        }

        // 格式不支持
        if (!header[off_pfFlags] & DDPF_FOURCC) {
            throw new Error("Unsupported format, must contain a FourCC code.");
        }

        fourCC = header[off_pfFourCC];
        // 设置格式类型
        switch (fourCC) {
            case FOURCC_DXT1NotA:
                blockBytes = 8;
                internalFormat = ext.COMPRESSED_RGB_S3TC_DXT1_EXT;
                break;
            case FOURCC_DXT1:
                blockBytes = 8;
                internalFormat = ext.COMPRESSED_RGBA_S3TC_DXT1_EXT;
                break;
            case FOURCC_DXT3:
                blockBytes = 16;
                internalFormat = ext.COMPRESSED_RGBA_S3TC_DXT3_EXT;
                break;
            case FOURCC_DXT5:
                blockBytes = 16;
                internalFormat = ext.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                break;

            default:
                // 不支持的FourCC码
                throw new Error("Unsupported FourCC code:" + Int32ToFourCC(fourCC));
        }

        // 至少也有一张Mipmap
        mipmapCount = 1;

        // 如果加载所有的Mipmap则先获取数量
        if (header[off_flags] & DDSD_MIPMAPCOUNT && loadMipmaps !== false) {
            mipmapCount = Math.max(1, header[off_mipmapCount]);
        }

        width = header[off_width];
        height = header[off_height];
        dataOffset = header[off_size] + 4;

        // 对所有Mipmap进行压缩处理
        for (i = 0; i < mipmapCount; ++i) {
            dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes;
            byteArray = new Uint8Array(arrayBuffer, dataOffset, dataLength);
            // 压缩材质
            gl.compressedTexImage2D(gl.TEXTURE_2D, i, internalFormat, width, height, 0, byteArray);
            dataOffset += dataLength;
            width *= 0.5;
            height *= 0.5;
        }

        return mipmapCount;
    }

    dds.load = function (name, fileName, callback, gl) {
        /// <summary>加载DDS文件</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>
        /// <param name="gl" type="WebGLContext">WebGL上下文</param>

        if (!gl) throw new Error("WebGL context not found.");

        var texture = gl.createTexture(),
            _this = this;

        // 获取扩展对象
        var s3tcExtension = gl.getExtension("WEBGL_compressed_texture_s3tc") ||
                            gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
                            gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") ||
                            gl.getExtension("MS_WEBGL_compressed_texture_s3tc");

        if (!s3tcExtension) {
            throw new Error("Does not support WebGLTextureS3tc extended.");
        }

        // 使用Ajax加载DDS文件
        TeaJs.loadFile(fileName, true, "arraybuffer", function (arr) {
            // 加载完成后绑定材质
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // 进行验证并处理
            var mipmaps = uploadDDSLevels(gl, s3tcExtension, arr);

            // 控制滤波
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmaps > 1 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); 

            // 加入到项列表中
            _this.itemList.push({
                name: name,
                object: texture,
                unload: function () {
                    gl.deleteTexture(texture);
                }
            });

            // 执行回调函数
            callback && callback(texture);
        });
    };

    TeaJs.Loader.TextureDds = TextureDds;
}(TeaJs);