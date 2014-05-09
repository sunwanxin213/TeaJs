/*
    Mdx格式模型加载器

    感谢"小兵葛革"提供MDX模型导入代码
*/
void function (TeaJs) {
    "use strict";

    function MdxModel() {
        /// <summary>Mdx格式模型加载器构造函数</summary>
        /// <returns type="MdxModelLoader">Mdx格式模型加载器对象</returns>

        // 获得加载器构造器属性
        TeaJs.Loader.call(this, "MdxModel", "mdx".split(" "));
    }

    // 获得加载器构造器函数
    MdxModel.prototype = new TeaJs.Loader();

    // 缓存原型对象
    var mdxModel = MdxModel.prototype;

    mdxModel.load = function (name, fileName, callback, gl) {
        /// <summary>加载Mdx格式模型</summary>
        /// <param name="name" type="String">标识名称</param>
        /// <param name="fileName" type="String">文件路径</param>
        /// <param name="callback" type="Function">回调函数</param>
        /// <param name="gl" type="WebGLContext">WebGL上下文</param>

        if (!gl) throw new Error("WebGL context not found.");

        var _this = this;

        // 使用Ajax加载Mdx格式模型文件
        TeaJs.loadFile(fileName, true, "arraybuffer", function (obj) {
            // 解析模型
            var model = analyzer(obj, fileName.substr(0, fileName.lastIndexOf("/") + 1), gl, _this);

            model.format = "MDX";

            // 加入到项列表中
            _this.itemList.push({
                name: name,
                object: model,
                unload: function () {
                    for (var i = 0; i < model.bitmaps.length; i++) {
                        _this._manager.remove(model.bitmaps[i].textureUrl);
                    }
                }
            });

            // 执行回调函数
            callback && callback(model);
        });
    };

    var analyzer = function () {
        var MDX = {};

        var gl = null;

        var loaderManager = null;

        var modelBaseUrl = "";

        // 序列动画结构大小
        var sequenceAnimStructSize = 80 + 4 * 7 + 4 * 3 + 4 * 3;

        var LineType = {
            NOT_INTERP: 0,
            LINEAR: 1,
            HERMITE: 2,
            BEZIER: 3
        };

        var MotionType = {
            KGTR: 0,
            KGRT: 1,
            KGSC: 2,
            MAX_MOTION: 3
        };

        var GeoaType = {
            NONE: 0,
            DROP_SHADOW: 1,
            STATIC_COLOR: 2
        };

        function KeyFrame() { }

        function LinearKeyFrame3() {
            this.structSize = 4 + 12;
        }

        function NonLinearKeyFrame3() {
            this.structSize = 4 + 12 * 3;
        }

        function LinearKeyFrame4() {
            this.structSize = 4 + 16;
        }

        function NonLinearKeyFrame4() {
            this.structSize = 4 + 16 * 3;
        }

        function GEOA() {
            this.unk0 = 0;
            this.type = GeoaType.NONE;
            this.blue = 0.0;
            this.green = 0.0;
            this.red = 0.0;
            this.geosetID = 0;
        }

        function KGAO() {
            this.chunkNum = 0;
            this.lineType = LineType.NOT_INTERP;
            this.flag = 0xFFFFFFFF;
            this.data = null;
        }

        function AnimAlpha() {
            this.frameNum = 0;
            this.alphaValue = 1.0;
        }

        function MaterialLayoutAlpha() {
            this.chunkNum = 0;
            this.lineType = LineType.NOT_INTERP;
            this.data = null;
        }

        function Material() { }

        function MaterialLayer() { }

        function TextureBitmap() {
            this.replaceableID = 0;
            this.texturePath = "";
            this.unk0 = 0;
            this.unk1 = 0;
        }

        function SequenceAnim() {
            /// <summary>序列动画</summary>

            // 动画名称
            this.name = "";
            // 开始帧索引
            this.startFrame = 0;
            // 结束帧索引
            this.endFrame = 0;
            // 移动速度
            this.moveSpeed = 0;
            // 不是环接
            this.nonLooping = 0;
            // 罕见
            this.rarity = 0;
            this.unk6 = 0;
            // 边界半径
            this.boundsRadius = 0.0;
            this.mins = { x: 0, y: 0, z: 0 };
            this.maxs = { x: 0, y: 0, z: 0 };
        }

        function Model() {
            /// <summary>MDX模型</summary>

            var _this = this;

            // 当前帧索引
            var currentFrame = 0;
            Object.defineProperty(this.animInfo, "currentFrame", {
                get: function () { return currentFrame; },
                set: function (value) {
                    currentFrame = value;
                    var cai = _this.animInfo;
                    if (currentFrame >= cai.endFrame || currentFrame < cai.startFrame) {
                        currentFrame = cai.startFrame;
                    }
                    //根据当前动画帧计算当前骨架的变换矩阵集
                    _this.skeletoncalcTransformMatrix(cai);
                }
            });
        }

        var model = Model.prototype;

        // 当前动画信息
        model.animInfo = {
            // 当前动画索引
            currentAnim: -1,
            // 开始帧索引
            startFrame: 0,
            // 结束帧索引
            endFrame: 0
        };

        model.getAnimAlpha = function (geoID, animInfo) {
            /// <summary>获取动画Alpha值</summary>
            /// <param name="geoID" type="Number">几何编号</param>
            /// <param name="animInfo" type="Object">动画信息</param>
            /// <returns type="Number"></returns>

            if (geoID > this.geosetAnim.length - 1 || geoID < 0) return 1.0;

            var alpha = this.geosetAlpha[geoID].data;

            if (alpha == null) return 1.0;

            var max_num = this.geosetAlpha[geoID].chunkNum - 1;
            if (alpha[max_num].frameNum <= animInfo.currentFrame) {
                if (animInfo.startFrame == alpha[max_num].frameNum) {
                    return alpha[max_num].alphaValue;
                }
                else {
                    return 1.0;
                }
            }

            if (alpha[0].frameNum > animInfo.currentFrame) return 1.0;

            for (var i = 0 ; i < max_num ; i++) {
                if (alpha[i].frameNum <= animInfo.currentFrame &&
                    alpha[i + 1].frameNum >= animInfo.currentFrame) {
                    if (alpha[i].frameNum >= animInfo.startFrame &&
                        alpha[i].frameNum <= animInfo.endFrame) {
                        return alpha[i].alphaValue;
                    }
                }
            }
            return 1.0;
        };

        model.skeletoncalcTransformMatrixInternal = function (animInfo, parentMatrix, parentID) {
            for (var i = 0 ; i < this.bones.length ; i++) {
                if (this.bones[i].parentID == parentID) {
                    //骨块原点为骨块指向的关节点
                    var center = vec3.create(this.pivotPoints[this.bones[i].objectID]);

                    //计算骨块变换矩阵
                    this.bones[i].calcTransformMatrix(center, animInfo, parentMatrix);

                    //获取骨块透明度
                    var alpha = this.getAnimAlpha(this.bones[i].geosetAnimID, animInfo);
                    this.bones[i].geosetAnimAlpha = alpha;

                    //继续计算骨块的子节点
                    this.skeletoncalcTransformMatrixInternal(animInfo, this.bones[i].transformMatrix, this.bones[i].objectID);
                }
            }
        }

        model.skeletoncalcTransformMatrix = function (animInfo) {
            var mat = mat4.create();

            //变换矩阵从 1 开始
            mat4.identity(mat);

            //遍历计算所有骨块
            this.skeletoncalcTransformMatrixInternal(animInfo, mat, -1);

            debug_switch = false;
        };

        model.getTransformMatrix = function (matrix, animAlpha, groupMatrix, index, count) {
            mat4.set(this.bones[groupMatrix[index]].transformMatrix, matrix);
            animAlpha = this.bones[groupMatrix[index]].geosetAnimAlpha;

            if (count > 1) {
                for (var k = 1 ; k < count ; k++) {
                    mat4.set(mat4.add(matrix, this.bones[groupMatrix[index + k]].transformMatrix), matrix);
                    animAlpha += this.bones[groupMatrix[index + k]].geosetAnimAlpha;
                }

                for (var mat_i = 0 ; mat_i < matrix.length ; mat_i++) {
                    matrix[mat_i] *= 1.0 / count;
                }
                animAlpha *= 1.0 / count;
            }

            return animAlpha;
        };

        model.setCurrentAnim = function (name) {
            /// <summary>设置当前动画</summary>
            /// <param name="name" type="String">动画名称</param>

            var currAnim = this.animInfo;
            currAnim.currentAnim = -1;
            for (var i = this.sequences.length; i--;) {
                if (this.sequences[i].name == name) {
                    currAnim.currentAnim = i;
                    break;
                }
            }
            var anim = this.sequences[currAnim.currentAnim];
            currAnim.currentFrame = anim.startFrame;
            currAnim.startFrame = anim.startFrame;
            currAnim.endFrame = anim.endFrame;
        };

        function Bone() {
            this.transformMatrix = mat4.create();
            mat4.identity(this.transformMatrix);
            this.geosetAnimAlpha = 1.0;
            this.geosetID = -1;
            this.geosetAnimID = -1;
        }

        var bone = Bone.prototype;

        bone.getRotationMatrix = function (animInfo) {
            var frameCount = this.keyFrameCount[MotionType.KGRT];
            var type = this.lineType[MotionType.KGRT];
            var vec = null;
            var p = this.keyFrames[MotionType.KGRT];

            if (animInfo.startFrame == p[frameCount - 1].frameNum) {
                return p[frameCount - 1].vec;
            }

            for (var i = 0 ; i < frameCount - 1 ; i++) {
                var startP = p[i];
                var endP = p[i + 1];

                if (animInfo.currentFrame == startP.frameNum) {
                    return startP.vec;
                }
                else if (animInfo.currentFrame == endP.frameNum) {
                    return endP.vec;
                }
                else if (startP.frameNum < animInfo.currentFrame && animInfo.currentFrame < endP.frameNum) {
                    if (animInfo.startFrame > startP.frameNum && animInfo.endFrame < endP.frameNum) {
                        return null;
                    }

                    if (animInfo.startFrame <= startP.frameNum && animInfo.endFrame >= endP.frameNum) {
                        var step = (animInfo.currentFrame - startP.frameNum) / (endP.frameNum - startP.frameNum);

                        if (type == LineType.LINEAR) {
                            var quat = quat4.create();
                            quat4.slerp(quat, startP.vec, endP.vec, step);
                            quat4.normalize(quat);
                            return quat;
                        }
                        else if (type == LineType.HERMITE) {
                            var A = quat4.create();
                            var B = quat4.create();
                            var C = quat4.create();
                            var quat = null;
                            quat4.squadSetup(A, B, C, startP.vec, startP.inTan, endP.vec, endP.outTan);
                            quat = quat4.squad(startP.vec, A, B, C, step);
                            return quat;
                        }
                        return null;
                    }
                    else {
                        return startP.vec;
                    }
                }
            }
            return null;
        };

        bone.getTransferMatrix = function (animInfo) {
            var frameCount = this.keyFrameCount[MotionType.KGTR];
            var type = this.lineType[MotionType.KGTR];
            var vec = null;

            var p = this.keyFrames[MotionType.KGTR];

            if (animInfo.startFrame == p[frameCount - 1].frameNum) {
                vec = p[frameCount - 1].vec;
                return vec;
            }

            for (var i = 0 ; i < frameCount - 1 ; i++) {
                var startP = p[i];
                var endP = p[i + 1];

                if (animInfo.currentFrame == startP.frameNum) {
                    return startP.vec;
                }
                else if (animInfo.currentFrame == endP.frameNum) {
                    return endP.vec;
                }
                else if (startP.frameNum < animInfo.currentFrame && animInfo.currentFrame < endP.frameNum) {
                    if (animInfo.startFrame > startP.frameNum && animInfo.endFrame < endP.frameNum) {
                        return null;
                    }

                    if (animInfo.startFrame <= startP.frameNum && animInfo.endFrame >= endP.frameNum) {
                        var step = (animInfo.currentFrame - startP.frameNum) / (endP.frameNum - startP.frameNum);
                        if (type == LineType.LINEAR) {
                            vec = vec3.lerp(startP.vec, endP.vec, step);
                        }
                        else if (type == LineType.HERMITE) {
                            vec = vec3.hermite(startP.vec, startP.vec, endP.vec, endP.vec, step);
                        }
                        else if (type == LineType.BEZIER) {
                            vec = vec3.bezier(startP.vec, startP.vec, endP.vec, endP.vec, step);
                        }
                        else {
                            return null;
                        }
                    }
                    else {
                        vec = startP.vec;
                    }
                    return vec;
                }
            }
            return null;
        };

        bone.calcTransformMatrix = function (center, animInfo, parentMatrix) {
            //计算变化矩阵
            var scaling = null;		//缩放
            var rotation = null;		//旋转
            var translation = null;	//平移

            //billboarded
            if (this.nodeType == 264) {
                this.transformMatrix = mat4.create();
                return this.transformMatrix;

                //TRANSLATE

                var new_center = vec3.transformCoord(center, parentMatrix);

                translation = vec3.subtract(new_center, center);

                //SCALE
                var scale_vector = vec3.create([center[0] + 1, center[1], center[2]]);
                scale_vector = vec3.transformCoord(scale_vector, parentMatrix);
                scale_vector = vec3.subtract(scale_vector, new_center);
                var mat = mat4.create(mvMatrix);
                var sight_normal = vec3.create([mat[2], mat[6], mat[10]]);
                var sight_right = vec3.create([mat[0], mat[4], mat[8]]);
                var d1 = -Math.asin(sight_normal[2]);
                var d2 = Math.acos(sight_normal[0] / Math.sqrt(sight_normal[0] * sight_normal[0] + sight_normal[1] * sight_normal[1]));
                if (sight_normal[1] < 0) {
                    d2 = Math.PI * 2 - d2;
                }

                var rotZ = mat4.create();
                var rotAxis = mat4.create();

                rotZ = mat4.rotateZ(rotZ, d2);
                rotAxis = mat4.rotate(rotAxis, d1, sight_right);
                mat = mat4.multiply(rotAxis, rotZ);

                rotation = quat4.quaternionRotationMatrix(mat);

                mat = mat4.translate(mat, [-new_center[0], -new_center[1], -new_center[2]]);

                mat = mat4.multiply(mat, parentMatrix);

                MatrixResolve(mat, null, null, scaling);

                this.transformMatrix = mat4.transformation(center, null, scaling, center, rotation, translation);

                return this.transformMatrix;
            }

            if (this.keyFrameCount[MotionType.KGTR] > 0) {
                translation = this.getTransferMatrix(animInfo);
            }

            if (this.keyFrameCount[MotionType.KGRT] > 0) {
                rotation = this.getRotationMatrix(animInfo);
            }

            if (this.keyFrameCount[MotionType.KGSC] > 0) {
                //		console.log( "[TODO] KGSC");
                //		if(CheckHideByScale(animInfo))
                //		{
                //			pScaling=&scaling;
                //		}
            }

            //对transformMatrix进行变形，输入参数： center , 
            this.transformMatrix = mat4.transformation(center, null, scaling, center, rotation, translation);

            //变换矩阵要乘parentMatrix继承父节点位置
            this.transformMatrix = mat4.multiply(this.transformMatrix, parentMatrix);

            //输出变换矩阵
            return this.transformMatrix;
        };

        function Mesh() {
            this.materialID = -1;
        }

        var mesh = Mesh.prototype;

        mesh.calcGroupMatrix = function (mdx_model) {
            /// <summary>计算矩阵组</summary>
            /// <param name="mdx_model" type="Model">模型对象</param>

            if (this.matrixes == undefined) {
                this.matrixes = [];
                for (var i = 0 ; i < this.numGroups ; i++) {
                    this.matrixes[i] = mat4.create();
                }

                this.AnimAlphas = new Float32Array(this.numGroups);
            }

            var index = 0;
            for (var i = 0 ; i < this.numGroups ; i++) {
                var matrixCount = this.groups[i];

                mdx_model.getTransformMatrix(this.matrixes[i], this.AnimAlphas[i], this.matrixGroups, index, matrixCount);

                index += matrixCount;
            }
        };

        mesh.draw = function () {
            var mdx_model = this._model;

            var mat = mdx_model.materials[this.materialID < 0 ? 0 : this.materialID];

            this.calcGroupMatrix(mdx_model);

            for (var L = 0 ; L < mat.numLayers ; L++) {
                var alpha = 1.0;//mat->getFrameAlpha( animInfo.currentFrame , l );
                var useLight = true;
                var useModelColor = false;

                //texture
                var bindTex = mdx_model.bitmaps[mat.layers[L].textureID].texture;

                var modelColor = vec3.create([0.0, 0.0, 1.0]);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, bindTex);
                gl.uniform1i(shaderProgram.samplerUniform, 0);

                //alpha,depth options
                if (mat.numLayers - 1 > L) {
                    useLight = true;
                }
                else {
                    useLight = true;
                }

                gl.depthFunc(gl.LEQUAL);
                gl.depthMask(true);

                //(0:none;1:transparent;2:blend;3:additive)
                if (mat.layers[L].filterMode == 0)               // 0:none
                {
                    useModelColor = true;
                    gl.disable(gl.BLEND);
                }
                else if (mat.layers[L].filterMode == 1)           // transparent
                {
                    gl.enable(gl.BLEND);
                    gl.depthMask(true);

                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                }
                else if (mat.layers[L].filterMode == 2)		// blend
                {
                    gl.enable(gl.BLEND);

                    gl.depthFunc(gl.LEQUAL);
                    gl.depthMask(false);

                    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                }
                else if (mat.layers[L].filterMode == 3)          // additive
                {
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.ONE, gl.ONE);

                    gl.depthMask(false);
                }
                else {
                    gl.disable(gl.BLEND);
                }

                //triangles : 待渲染的三角形顶点索引
                // v0 , v1 , v2  就是一个三角形
                // vertexGroups[index] 顶点index所属的顶点分组id

                //draw primitives
                var rVertices = new Float32Array(this.numVertices * 3);
                for (var i = 0 ; i < this.numVertices * 3 ; i++)
                    rVertices[i] = this.vertices[i];;

                var rNormals = new Float32Array(this.numVertices * 3);
                for (var i = 0 ; i < this.numVertices * 3 ; i++)
                    rNormals[i] = this.normals[i];

                var realVertices = new Float32Array(this.numTriangles * 3 * 3);
                var realNormals = new Float32Array(this.numTriangles * 3 * 3);
                var realUVs = new Float32Array(this.numTriangles * 3 * 2);

                for (var i = 0 ; i < this.numTriangles ; i++) {
                    var index, v;

                    v = this.triangles[3 * i];//三角形顶点之一的顶点索引
                    index = this.vertexGroups[v];//顶点所属组合
                    vec3_transformCood4(realVertices, i * 9, rVertices, v * 3, this.matrixes[index]);
                    vec3_transformNormal4(realNormals, i * 9, rNormals, v * 3, this.matrixes[index]);
                    realUVs[i * 6] = this.uvs[v * 2];
                    realUVs[i * 6 + 1] = this.uvs[v * 2 + 1];

                    v = this.triangles[3 * i + 1];//三角形顶点之一的顶点索引
                    index = this.vertexGroups[v];//顶点所属组合
                    vec3_transformCood4(realVertices, i * 9 + 3, rVertices, v * 3, this.matrixes[index]);
                    vec3_transformNormal4(realNormals, i * 9 + 3, rNormals, v * 3, this.matrixes[index]);
                    realUVs[i * 6 + 2] = this.uvs[v * 2];
                    realUVs[i * 6 + 3] = this.uvs[v * 2 + 1];

                    v = this.triangles[3 * i + 2];//三角形顶点之一的顶点索引
                    index = this.vertexGroups[v];//顶点所属组合
                    vec3_transformCood4(realVertices, i * 9 + 6, rVertices, v * 3, this.matrixes[index]);
                    vec3_transformNormal4(realNormals, i * 9 + 6, rNormals, v * 3, this.matrixes[index]);
                    realUVs[i * 6 + 4] = this.uvs[v * 2];
                    realUVs[i * 6 + 5] = this.uvs[v * 2 + 1];
                }

                var realNormalsBuffer = gl.createBuffer(); //创建buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, realNormalsBuffer); //绑定当前操作的buffer
                gl.bufferData(gl.ARRAY_BUFFER, realNormals, gl.STATIC_DRAW);
                realNormalsBuffer.itemSize = 3; //每个顶点占用字节数
                realNormalsBuffer.numItems = this.numTriangles * 3; //共有多少个顶点
                gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, realNormalsBuffer.itemSize, gl.FLOAT, false, 0, 0);

                var realUVsBuffer = gl.createBuffer(); //创建buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, realUVsBuffer); //绑定当前操作的buffer
                gl.bufferData(gl.ARRAY_BUFFER, realUVs, gl.STATIC_DRAW);
                realUVsBuffer.itemSize = 2; //每个顶点占用字节数
                realUVsBuffer.numItems = this.numTriangles * 3; //共有多少个顶点
                gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, realUVsBuffer.itemSize, gl.FLOAT, false, 0, 0);

                var realBuffer = gl.createBuffer(); //创建buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, realBuffer); //绑定当前操作的buffer
                gl.bufferData(gl.ARRAY_BUFFER, realVertices, gl.STATIC_DRAW);
                realBuffer.itemSize = 3; //每个顶点占用字节数
                realBuffer.numItems = this.numTriangles * 3; //共有多少个顶点
                gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, realBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.uniform1i(shaderProgram.useModelColorUniform, useModelColor);
                gl.uniform1i(shaderProgram.useLightingUniform, useLight);

                if (useModelColor) {
                    gl.uniform3fv(shaderProgram.modelColorUniform, modelColor);
                }

                if (useLight) {
                    gl.uniform3f(shaderProgram.ambientColorUniform, 0.1, 0.1, 0.1);

                    var lightingDirection = vec3.create([1.0, 1.0, 1.0]);

                    gl.uniform3fv(shaderProgram.lightingDirectionUniform, vec3.normalize(lightingDirection));

                    gl.uniform3f(shaderProgram.directionalColorUniform, 1.0, 1.0, 1.0);
                }

                gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
                gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
                gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
                gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, normalMatrix);

                gl.drawArrays(gl.TRIANGLES, 0, realBuffer.numItems);
            }
        };

        function MatrixResolve(mat, t, r, s) {
            if (t == null) {
                t = vec3.create([mat[8], mat[9], mat[10]]);
            }
            if (s != null) {
                s[0] = Math.sqrt(mat[0] * mat[0] + mat[4] * mat[4] + mat[8] * mat[8]);
                s[1] = Math.sqrt(mat[1] * mat[1] + mat[5] * mat[5] + mat[9] * mat[9]);
                s[2] = Math.sqrt(mat[2] * mat[2] + mat[6] * mat[6] + mat[10] * mat[10]);
            }
            if (r != null) {
                var ca = Math.sqrt(mat[0] * mat[0] + mat[1] * mat[1]);
                r[1] = Math.atan2(-mat[2], ca);

                if (ca == 0.0) {
                    r[0] = 0.0;
                    r[2] = Math.atan2(-mat[4], mat[5]);
                }
                else {
                    r[0] = Math.atan2(mat[6] / ca, mat[10] / ca);
                    r[2] = Math.atan2(mat[1] / ca, mat[0] / ca);
                }
            }
            return true;
        }

        function loadOver(type, name, obj) {
            /// <summary>加载完成<summary>
            /// <param name="type" type="String">文件类型</param>
            /// <param name="name" type="String">文件名</param>
            /// <param name="obj" type="Object">对象</param>

            if (type == "texture") {
                gl.bindTexture(gl.TEXTURE_2D, obj);

                gl.pixelStorei(gl.UNPACK_ALIGNMENT, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, obj.image);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

                gl.bindTexture(gl.TEXTURE_2D, null);
            }

            if (this.onload != undefined) {
                this.onload();
            }
        }

        function vec3_transformCoord(v_arr, offset, m4) {
            var v4 = vec4.create([v_arr[offset], v_arr[offset + 1], v_arr[offset + 2], 1.0]);

            vec4.transform(v4, m4);

            v_arr[offset] = v4[0] / v4[3];
            v_arr[offset + 1] = v4[1] / v4[3] + 0.5;
            v_arr[offset + 2] = v4[2] / v4[3];
        }

        function vec3_transformNormal(v_arr, offset, m4) {
            var A = v_arr[offset];
            var B = v_arr[offset + 1];
            var C = v_arr[offset + 2];

            v_arr[offset] = m4[0] * A + m4[4] * B + m4[8] * C;
            v_arr[offset + 1] = m4[1] * A + m4[5] * B + m4[9] * C;
            v_arr[offset + 2] = m4[2] * A + m4[6] * B + m4[10] * C;
        }

        function vec3_transformCood2(v_arr, offset, m) {
            var norm;
            var A = v_arr[offset];
            var B = v_arr[offset + 1];
            var C = v_arr[offset + 2];

            norm = m[3] * A + m[7] * B + m[11] * C + m[15];

            if (norm) {
                v_arr[offset + 0] = (m[0] * A + m[4] * B + m[8] * C + m[12]) / norm;
                v_arr[offset + 1] = (m[1] * A + m[5] * B + m[9] * C + m[13]) / norm;
                v_arr[offset + 2] = (m[2] * A + m[6] * B + m[10] * C + m[14]) / norm;
            }
            else {
                v_arr[offset + 0] = v_arr[offset + 1] = v_arr[offset + 2] = 0.0;
            }
        }

        function vec3_transformNormal2(v_arr, offset, m) {
            var A = v_arr[offset];
            var B = v_arr[offset + 1];
            var C = v_arr[offset + 2];

            v_arr[offset + 0] = (m[0] * A + m[4] * B + m[8] * C + m[12]);
            v_arr[offset + 1] = (m[1] * A + m[5] * B + m[9] * C + m[13]);
            v_arr[offset + 2] = (m[2] * A + m[6] * B + m[10] * C + m[14]);
        }

        function vec3_transformCood4(dst_arr, dst_offset, v_arr, offset, m) {
            var norm;
            var A = v_arr[offset];
            var B = v_arr[offset + 1];
            var C = v_arr[offset + 2];

            norm = m[3] * A + m[7] * B + m[11] * C + m[15];

            if (norm) {
                dst_arr[dst_offset + 0] = (m[0] * A + m[4] * B + m[8] * C + m[12]) / norm;
                dst_arr[dst_offset + 1] = (m[1] * A + m[5] * B + m[9] * C + m[13]) / norm;
                dst_arr[dst_offset + 2] = (m[2] * A + m[6] * B + m[10] * C + m[14]) / norm;
            }
            else {
                dst_arr[dst_offset + 0] = dst_arr[dst_offset + 1] = dst_arr[dst_offset + 2] = 0.0;
            }
        }

        function vec3_transformNormal4(dst_arr, dst_offset, v_arr, offset, m) {
            var A = v_arr[offset];
            var B = v_arr[offset + 1];
            var C = v_arr[offset + 2];

            dst_arr[dst_offset + 0] = (m[0] * A + m[4] * B + m[8] * C);
            dst_arr[dst_offset + 1] = (m[1] * A + m[5] * B + m[9] * C);
            dst_arr[dst_offset + 2] = (m[2] * A + m[6] * B + m[10] * C);
        }

        function mdx_read_geochunk(dataview, inPos, inSize) {
            /// <summary>读取几何数据区</summary>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            var geochunk = new Mesh();
            var n = 0;
            var p = inPos;
            while ((p < inPos + inSize) && (n < 8)) {
                var tag = dataview.getString([p, p += 4][0], 4);

                switch (tag) {
                    case 'VRTX':
                        // 顶点数据
                        n++;

                        geochunk.numVertices = dataview.getUint32([p, p += 4][0], true);
                        geochunk.vertices = new Float32Array(geochunk.numVertices * 3);//( D3DXVECTOR3* ) p.c;

                        for (var id = 0 ; id < geochunk.numVertices * 3 ; id++) {
                            geochunk.vertices[id] = dataview.getFloat32([p, p += 4][0], true);
                        }

                        geochunk.verticesBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, geochunk.verticesBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, geochunk.vertices, gl.STATIC_DRAW);
                        geochunk.verticesBuffer.itemSize = 3;
                        geochunk.verticesBuffer.numItems = geochunk.numVertices;
                        break;
                    case 'NRMS':
                        // 法线数据
                        n++;

                        geochunk.NumNormals = dataview.getUint32([p, p += 4][0], true);

                        if (geochunk.numVertices != geochunk.NumNormals) {
                            throw new Error("geochunk.numVertices != geochunk.NumNormal =" + geochunk.NumNormals);
                        }

                        geochunk.normals = new Float32Array(geochunk.NumNormals * 3);

                        for (var id = 0 ; id < geochunk.NumNormals * 3 ; id++) {
                            geochunk.normals[id] = dataview.getFloat32([p, p += 4][0], true);
                        }

                        geochunk.normalsBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, geochunk.normalsBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, geochunk.normals, gl.STATIC_DRAW);
                        geochunk.normalsBuffer.itemSize = 3;
                        geochunk.normalsBuffer.numItems = geochunk.NumNormals;
                        break;
                    case 'PTYP': // PLANE_TYPE
                        n++;

                        var size = dataview.getUint32([p, p += 4][0], true);
                        if (dataview.getUint32([p, p += size * 4][0], true) != 4) // == Triangles
                        {
                            throw new Error("dataview.getUint32( p ) != 4");
                        }
                        break;
                    case 'PCNT':
                        // 图元数量
                        n++;

                        var size = dataview.getUint32([p, p += 4][0], true);
                        if (size == 1) {
                            geochunk.numTriangles = (dataview.getUint32([p, p += 4][0], true)) / 3;
                        }
                        else {
                            geochunk.numTriangles = size;
                            p += size * 4;
                        }
                        break;
                    case 'PVTX':
                        // 顶点索引
                        n++;

                        var size = dataview.getUint32([p, p += 4][0], true);
                        geochunk.triangles = new Uint16Array(size);

                        for (var i = 0 ; i < size ; i++) {
                            geochunk.triangles[i] = dataview.getUint16([p, p += 2][0], true);
                        }

                        if (size / 3 != geochunk.numTriangles) {
                            throw new Error("size / 3 != geochunk.numTriangles");
                        }

                        geochunk.trianglesBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geochunk.trianglesBuffer);
                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geochunk.triangles, gl.STATIC_DRAW);
                        geochunk.trianglesBuffer.itemSize = 2;
                        geochunk.trianglesBuffer.numItems = geochunk.numTriangles * 3;
                        break;
                    case 'GNDX': // vertex group indices
                        // links every vertex to a matrix
                        n++;

                        var size = dataview.getUint32([p, p += 4][0], true);

                        if (geochunk.numVertices != size) {
                            throw new Error("geochunk.numVertices != size");
                        }

                        geochunk.vertexGroups = new Uint8Array(size);
                        for (var i = 0 ; i < size ; i++) {
                            geochunk.vertexGroups[i] = dataview.getInt8([p, p++][0], true);
                        }
                        break;
                    case 'MTGC': // group matrix counts
                        // this is the number of vertices defined by GNDX for each matrix
                        n++;

                        geochunk.numGroups = dataview.getUint32([p, p += 4][0], true);
                        geochunk.groups = new Uint32Array(geochunk.numGroups);
                        for (var i = 0 ; i < geochunk.numGroups ; i++) {
                            geochunk.groups[i] = dataview.getInt32([p, p += 4][0], true);
                        }
                        break;
                    case 'MATS':
                        // 矩阵信息
                        n++;

                        geochunk.numMatrixGroups = dataview.getUint32([p, p += 4][0], true);
                        geochunk.matrixGroups = new Int32Array(geochunk.numMatrixGroups);
                        for (var i = 0 ; i < geochunk.numMatrixGroups ; i++) {
                            geochunk.matrixGroups[i] = dataview.getInt32([p, p += 4][0], true);
                        }
                        break;
                    default:
                        var size = dataview.getUint32([p, p += 4 + size][0], true);
                        break;
                }
            }

            if (p < inPos + inSize) {
                geochunk.materialID = dataview.getUint32([p, p += 4 * 3][0], true);
                geochunk.boundsRadius = dataview.getFloat32([p, p += 4][0], true);

                geochunk.mins = new Float32Array(3);
                geochunk.maxs = new Float32Array(3);

                for (var i = 0 ; i < 3 ; i++) {
                    geochunk.mins[i] = dataview.getFloat32([p, p += 4][0], true);
                }

                for (var i = 0 ; i < 3 ; i++) {
                    geochunk.maxs[i] = dataview.getFloat32([p, p += 4][0], true);
                }

                geochunk.numAnimExtent = dataview.getUint32([p, p += 4][0], true);
                geochunk.animExtents = new Float32Array(7 * geochunk.numAnimExtent);
                for (var j = 0 ; j < geochunk.numAnimExtent ; j++) {
                    for (var i = 0 ; i < 7 ; i++) {
                        geochunk.animExtents[j * 7 + i] = dataview.getFloat32([p, p += 4][0], true);
                    }
                }

                var tag = dataview.getString([p, p += 4][0], 4);

                if (tag == 'UVAS') {
                    var uvas_size = dataview.getUint32([p, p += 4][0], true); // no skip
                    if (dataview.getString([p, p += 4][0], 4) == 'UVBS') {
                        // 贴图坐标

                        var size = dataview.getUint32([p, p += 4][0], true);
                        geochunk.uvs = new Float32Array(size * 2);

                        for (var i = 0 ; i < size * 2 ; i++) {
                            geochunk.uvs[i] = dataview.getFloat32([p, p += 4][0], true);
                        }

                        geochunk.uvsBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, geochunk.uvsBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, geochunk.uvs, gl.STATIC_DRAW);
                        geochunk.uvsBuffer.itemSize = 2;
                        geochunk.uvsBuffer.numItems = size;
                    }
                }
            }
            return geochunk;
        }

        function mdx_read_bone(dataview, inPos, inSize) {
            /// <summary>读取骨骼信息</summary>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            var p = inPos;

            var bone = new Bone();

            var ireader = 0;

            bone.boneName = dataview.getString([p, p += 80][0], 80);
            bone.objectID = dataview.getUint32([p, p += 4][0], true);
            bone.parentID = dataview.getInt32([p, p += 4][0], true);
            bone.nodeType = dataview.getUint32([p, p += 4][0], true);
            bone.keyFrameCount = [];
            bone.lineType = [];
            bone.keyFrames = [];

            var nextP = inPos + inSize;

            while ((p < inPos + inSize) && (ireader < 3)) {
                var tag = dataview.getString([p, p += 4][0], 4);

                var framesType = -1;
                var vectorCount = -1;

                if (tag.indexOf("KG") < 0) {
                    framesType = -1;
                    break;
                }

                ireader++;
                var tagList = ["KGTR", 3,//transfer
                               "KGRT", 4,//rotate
                               "KGSC", 3];//scale
                for (var i = 0; i < tagList.length; i += 2) {
                    if (tag == tagList[i]) {
                        framesType = MotionType[tagList[i]];
                        vectorCount = tagList[i + 1];
                        break;
                    }
                }

                if (framesType != -1) {
                    bone.keyFrameCount[framesType] = dataview.getUint32([p, p += 4][0], true);
                    bone.lineType[framesType] = dataview.getUint32([p, p += 4 * 2][0], true);

                    bone.keyFrames[framesType] = [];
                    if (bone.lineType[framesType] > LineType.LINEAR)//non linear trasfer
                    {
                        for (var i = 0 ; i < bone.keyFrameCount[framesType]; i++) {
                            var frame = new KeyFrame();

                            frame.type = "MDX_NoLinearKeyFrame" + vectorCount;

                            frame.frameNum = dataview.getInt32([p, p += 4][0], true);
                            frame.vec = dataview.getVectorN([p, p += 4 * vectorCount][0], vectorCount);
                            frame.inTan = dataview.getVectorN([p, p += 4 * vectorCount][0], vectorCount);
                            frame.outTan = dataview.getVectorN([p, p += 4 * vectorCount][0], vectorCount);
                            bone.keyFrames[framesType][i] = frame;
                        }
                    }
                    else {
                        for (var i = 0 ; i < bone.keyFrameCount[framesType]; i++) {
                            var frame = new KeyFrame();

                            frame.type = "LinearKeyFrame" + vectorCount;

                            frame.frameNum = dataview.getInt32([p, p += 4][0], true);
                            frame.vec = dataview.getVectorN([p, p += 4 * vectorCount][0], vectorCount);
                            bone.keyFrames[framesType][i] = frame;
                        }
                    }
                }
            }

            if (p < inPos + inSize - 4) {
                bone.geosetID = dataview.getUint32([p, p += 4][0], true);
                bone.geosetAnimID = dataview.getUint32([p, p += 4][0], true);
            }
            return bone;
        }

        function mdx_read_material(dataview, inPos, inSize) {
            /// <summary>读取纹理信息</summary>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            var p = inPos;
            var material = new Material();
            p += 8;
            if (dataview.getString([p, p += 4][0], 4) != "LAYS") {
                throw new Error("dataview.getString( p , 4 ) != LAYS");
                return;
            }
            material.numLayers = dataview.getUint32([p, p += 4][0], true);
            material.layers = [];

            for (var i = 0 ; i < material.numLayers ; i++) {
                var startP = p;
                material.layers[i] = new MaterialLayer();
                material.layers[i].layersSize = dataview.getUint32([p, p += 4][0], true);
                material.layers[i].filterMode = dataview.getUint32([p, p += 4][0], true);
                material.layers[i].shading = dataview.getUint32([p, p += 4][0], true);
                material.layers[i].textureID = dataview.getUint32([p, p += 4][0], true);
                material.layers[i].unk5 = dataview.getInt32([p, p += 4][0], true);
                material.layers[i].unk6 = dataview.getInt32([p, p += 4][0], true);
                material.layers[i].alpha = dataview.getFloat32([p, p += 4][0], true);

                if (dataview.getString([p, p += 4][0], 4) == 'KMTA') {

                    material.layers[i].existKMTA = true;
                    material.layers[i].KMTA = new MaterialLayoutAlpha();
                    material.layers[i].KMTA.chunkNum = dataview.getUint32([p, p += 4][0], true);
                    material.layers[i].KMTA.LineType = dataview.getUint32([p, p += 4][0], true);
                    material.layers[i].KMTA.data = dataview.buffer.slice(p, material.layers[i].layersSize - (p - startP));
                }
                else {
                    material.layers[i].existKMTA = false;
                }
                p = startP += material.layers[i].layersSize;
            }
            return material;
        }

        function loadModelFromBuff(databuff, modelUrl, webgl, loader) {
            /// <summary>从ArrayBuffer加载模型</summary>
            /// <param name="databuff" type="ArrayBuffer">二进制缓冲数组</param>
            /// <param name="modelUrl" type="String">模型路径</param>
            /// <param name="webgl" type="WebGLRenderingContext">WebGL上下文</param>

            loaderManager = loader;

            gl = webgl;

            modelBaseUrl = modelUrl;

            var mdxModel = new Model();

            var dataview = new DataView(databuff);
            dataview.getString = function (pos, length) {
                var str = new String();

                var u8 = new Uint8Array(1);
                for (var i = pos ; i < pos + length ; i++) {
                    u8[0] = this.getUint8(i);
                    if (u8[0] == 0) break;
                    str += String.fromCharCode(u8[0]);
                }
                return str;
            };

            dataview.getVectorN = function (pos, n) {
                var vec = new Float32Array(n);

                for (var i = 0 ; i < n ; i++) {
                    vec[i] = this.getFloat32(pos + i * 4, true);
                }

                return vec;
            };

            //1. flag检测

            var p = 0; //数据指针
            var totalSize = databuff.byteLength;

            var mdx_flag = dataview.getString([p, p += 4][0], 4);

            if (mdx_flag != "MDLX") {
                throw new TypeError("The data format is not supported.");
            }

            while (p < totalSize) {
                var chunkTag = dataview.getString([p, p += 4][0], 4);
                var chunkSize = dataview.getUint32([p, p += 4][0], true);

                var funList = ["HELP", "readSkeletonHelpers",
                               "BONE", "readSkeletonBones",
                               "GEOA", "readSkeletonGeosetsAnims",
                               "GEOS", "readGeosets",
                               "SEQS", "readSequences",
                               "TEXS", "readTextures",
                               "MTLS", "readMaterialmap",
                               "PIVT", "readSkeletonPivotpoints"];

                switch (chunkTag) {
                    case 'ATCH':
                        //attachs.Read(p,size);
                        break;
                    case 'VERS':
                        //mdxModel.version = dataview.getUint32(p, true);
                        break;
                    case 'MODL':
                        break;
                    case 'CAMS':
                        //cameras.Read( p , size );
                        break;
                    case 'PRE2':
                        //skeleton.BlizEmitters2.Read( p , size );
                        break;
                    default:
                        for (var i = 0; i < funList.length; i += 2) {
                            if (funList[i] == chunkTag) {
                                MDX[funList[i + 1]].apply(mdxModel, [mdxModel, dataview, p, chunkSize]);
                                break;
                            }
                        }
                        break;
                }
                p += chunkSize;
            }

            // 删除不使用的变量
            var deleteList = ["bitmapsCount",
                              "bonesCount",
                              "meshesCount",
                              "geosetAnimCount",
                              "materialsCount",
                              "pivotPointsCount",
                              "sequencesCount"];
            for (var i in deleteList) {
                delete mdxModel[deleteList[i]];
            }

            return mdxModel;
        }

        MDX.readGeosets = function (mdxModel, dataview, inPos, inSize) {
            /// <summary>读取几何数据</summary>
            /// <param name="mdxModel" type="Model">模型对象</param>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            mdxModel.meshesCount = 0;
            mdxModel.meshes = [];

            var p = inPos;

            while (p < inPos + inSize) {
                var geochunkSize = dataview.getUint32([p, p += 4][0], true) - 4;
                mdxModel.meshes[mdxModel.meshesCount] = mdx_read_geochunk(dataview, [p, p += geochunkSize][0], geochunkSize);
                mdxModel.meshes[mdxModel.meshesCount]._model = mdxModel;
                mdxModel.meshesCount++;
            }
        };

        MDX.readSkeletonGeosetsAnims = function (mdxModel, dataview, inPos, inSize) {
            /// <summary>读取几何动画</summary>
            /// <param name="mdxModel" type="Model">模型对象</param>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            var p = inPos;

            mdxModel.geosetAnimCount = 0;
            mdxModel.geosetAnim = [];
            mdxModel.geosetAlpha = [];

            while (p < inPos + inSize) {
                var nextp = p;

                var size = dataview.getUint32([p, p += 4][0], true);
                nextp += size;

                var geoa = new GEOA();

                geoa.unk0 = dataview.getFloat32([p, p += 4][0], true);
                geoa.type = dataview.getInt32([p, p += 4][0], true);
                geoa.blue = dataview.getFloat32([p, p += 4][0], true);
                geoa.green = dataview.getFloat32([p, p += 4][0], true);
                geoa.red = dataview.getFloat32([p, p += 4][0], true);
                geoa.geosetID = dataview.getUint32([p, p += 4][0], true);

                mdxModel.geosetAnim[mdxModel.geosetAnimCount] = geoa;

                var kgao = new KGAO();

                if (dataview.getString([p, p += 4][0], 4) == 'KGAO') {
                    kgao.chunkNum = dataview.getInt32([p, p += 4][0], true);
                    kgao.lineType = dataview.getInt32([p, p += 8][0], true);

                    kgao.data = [];
                    for (var chunkI = 0; chunkI < kgao.chunkNum ; chunkI++) {
                        var a = new AnimAlpha();
                        a.frameNum = dataview.getInt32([p, p += 4][0], true);
                        a.alphaValue = dataview.getFloat32([p, p += 4][0], true);
                        kgao.data[chunkI] = a;
                    }
                }
                else {
                    kgao.chunkNum = 0;
                    kgao.lineType = 0;
                    kgao.data = null;
                }
                mdxModel.geosetAlpha[mdxModel.geosetAnimCount] = kgao;
                mdxModel.geosetAnimCount++;
                p = nextp;
            }
        };

        MDX.readSequences = function (mdxModel, dataview, inPos, inSize) {
            /// <summary>读取序列动画数据</summary>
            /// <param name="mdxModel" type="Model">模型对象</param>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            var p = inPos;

            // 序列动画数量
            mdxModel.sequencesCount = inSize / sequenceAnimStructSize;

            // 定义序列动画数组
            mdxModel.sequences = [];

            var sequence = null;
            for (var i = 0 ; i < mdxModel.sequencesCount ; i++) {
                mdxModel.sequences[i] = new SequenceAnim();
                sequence = mdxModel.sequences[i];

                sequence.name = dataview.getString([p, p += 80][0], 80);
                sequence.startFrame = dataview.getInt32([p, p += 4][0], true);
                sequence.endFrame = dataview.getInt32([p, p += 4][0], true);
                sequence.moveSpeed = dataview.getInt32([p, p += 4][0], true);
                sequence.nonLooping = dataview.getInt32([p, p += 4][0], true);
                sequence.rarity = dataview.getInt32([p, p += 4][0], true);
                sequence.unk6 = dataview.getInt32([p, p += 4][0], true);
                sequence.boundsRadius = dataview.getFloat32([p, p += 4][0], true);
                sequence.mins = dataview.getVectorN([p, p += 4 * 3][0], 3);
                sequence.maxs = dataview.getVectorN([p, p += 4 * 3][0], 3);
            }
        };

        MDX.readSkeletonHelpers = function (mdxModel, dataview, inPos, inSize) {
            /// <summary>读取骨骼数据的工具函数</summary>
            /// <param name="mdxModel" type="Model">模型对象</param>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            var p = inPos;

            // 如果模型没有定义骨骼
            if (typeof mdxModel.bonesCount == "undefined") {
                mdxModel.bonesCount = 0;
                mdxModel.bones = [];
            }

            while (p < inPos + inSize) {
                var size = dataview.getUint32([p, p += 4][0], true);
                mdxModel.bones[mdxModel.bonesCount] = mdx_read_bone(dataview, [p, p += size - 4][0], size);
                mdxModel.bonesCount++;
            }

        };

        MDX.readSkeletonBones = function (mdxModel, dataview, inPos, inSize) {
            /// <summary>读取骨骼数据</summary>
            /// <param name="mdxModel" type="Model">模型对象</param>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            var p = inPos;

            if (mdxModel.bonesCount == undefined) {
                mdxModel.bonesCount = 0;
                mdxModel.bones = [];
            }

            while (p < inPos + inSize) {
                var size = dataview.getUint32([p, p += 4][0], true);
                mdxModel.bones[mdxModel.bonesCount] = mdx_read_bone(dataview, [p, p += size + 4][0], size + 4);
                mdxModel.bonesCount++;
            }
        };

        MDX.readMaterialmap = function (mdxModel, dataview, inPos, inSize) {
            /// <summary>读取多级材质</summary>
            /// <param name="mdxModel" type="Model">模型对象</param>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            var p = inPos;

            mdxModel.materialsCount = 0;
            mdxModel.materials = [];

            while (p < inPos + inSize) {
                var size = dataview.getUint32([p, p += 4][0], true) - 4;
                mdxModel.materials[mdxModel.materialsCount] = mdx_read_material(dataview, [p, p += size][0], size);
                mdxModel.materialsCount++;
            }
        };

        MDX.readSkeletonPivotpoints = function (mdxModel, dataview, inPos, inSize) {
            /// <summary>读取骨骼顶点</summary>
            /// <param name="mdxModel" type="Model">模型对象</param>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            var p = inPos;

            mdxModel.pivotPointsCount = inSize / (3 * 4);
            mdxModel.pivotPoints = [];

            for (var i = 0 ; i < mdxModel.pivotPointsCount ; i++) {
                mdxModel.pivotPoints[i] = dataview.getVectorN([p, p += 3 * 4][0], 3);
            }
        };

        MDX.readTextures = function (mdxModel, dataview, inPos, inSize) {
            /// <summary>读取材质</summary>
            /// <param name="mdxModel" type="Model">模型对象</param>
            /// <param name="dataview" type="Object">数据视图对象</param>
            /// <param name="inPos" type="Number">起始数据索引</param>
            /// <param name="inSize" type="Number">数据长度</param>

            var p = inPos;

            // 计算贴图数量
            mdxModel.bitmapsCount = inSize / (256 + 4 * 3);

            // 定义模型贴图数组
            mdxModel.bitmaps = [];

            for (var i = 0 ; i < mdxModel.bitmapsCount ; i++) {
                var bitmap = new TextureBitmap();

                bitmap.replaceableID = dataview.getInt32([p, p += 4][0], true);
                bitmap.texturePath = dataview.getString([p, p += 256][0], 256);
                bitmap.unk0 = dataview.getInt32([p, p += 4][0], true);
                bitmap.unk1 = dataview.getInt32([p, p += 4][0], true);
                //if (bitmap.replaceableID == 2) {
                //    bitmap.texturePath = "ReplaceableTextures\\TeamGlow\\TeamGlow00.blp";
                //}
                if (bitmap.texturePath != "") {
                    //纹理
                    var tex = gl.createTexture();
                    switch (bitmap.texturePath.split(".")[bitmap.texturePath.split(".").length - 1].toLowerCase()) {
                        case "png":
                        case "jpg":
                        case "jpeg":
                        case "bmp":
                        case "gif":
                            tex.image = new Image();
                            tex.image.src = modelBaseUrl + bitmap.texturePath;
                            tex.image.type = "texture";
                            tex.image.texture = tex;
                            tex.image.onload = function () {
                                loadOver.apply(mdxModel, [this.type, this.src, this.texture]);
                            };
                            bitmap.texture = tex;
                            break;
                        case "dds":
                            var bit = bitmap;
                            loaderManager._manager.load(bit.texturePath, modelBaseUrl + bit.texturePath, function (texture) {
                                bit.texture = texture;
                            });
                        case "blp":
                            if (TeaJs.isDebug) console.error("暂不支持BLP贴图");
                            break;
                    }
                }
                bitmap.textureUrl = modelBaseUrl + bitmap.texturePath;
                mdxModel.bitmaps.push(bitmap);
            }
        };

        return loadModelFromBuff;
    }();

    TeaJs.Loader.MdxModel = MdxModel;
}(TeaJs);