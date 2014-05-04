/*
    Mdx格式模型加载器
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
            var model = analyzer(obj, fileName.substr(0, fileName.lastIndexOf("/") + 1), gl);

            model.format = "mdx";

            // 加入到项列表中
            _this.itemList.push({
                name: name,
                object: model,
                unload: null
            });

            // 执行回调函数
            callback && callback(model);
        });
    };

    var analyzer = (function () {
        var MDX = {};

        var modelBaseUrl = "";

        var gl = null;

        // 序列动画结构大小
        var SequenceAnimStructSize = 80 + 4 * 7 + 4 * 3 + 4 * 3;

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
            this.GeosetID = 0;
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

            this.loadingObject = [];
        }

        var model = Model.prototype;

        // 当前动画信息
        model.currentAnimInfo = {
            // 当前动画索引
            currentAnim: 0,
            // 开始帧索引
            startFrame: 0,
            // 结束帧索引
            endFrame: 0,
            // 当前帧索引
            currentFrame: 0,
            // 是否更新
            update: false
        };

        model.GetAnimAlpha = function (geoID, animInfo) {
            if (geoID > this.numGeosetAnim - 1 || geoID < 0) return 1.0;

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

        model.Skeleton_CalcTransformMatrixInternal = function (animInfo, parentMatrix, parentID) {
            for (var i = 0 ; i < this.numBone ; i++) {
                if (this.bones[i].parentID == parentID) {
                    //骨块原点为骨块指向的关节点
                    var center = vec3.create(this.pivotPoints[this.bones[i].objectID]);

                    //计算骨块变换矩阵
                    this.bones[i].CalcTransformMatrix(center, animInfo, parentMatrix);

                    //获取骨块透明度
                    var alpha = this.GetAnimAlpha(this.bones[i].geosetAnimID, animInfo);
                    this.bones[i].geosetAnimAlpha = alpha;

                    //继续计算骨块的子节点
                    this.Skeleton_CalcTransformMatrixInternal(animInfo, this.bones[i].transformMatrix, this.bones[i].objectID);
                }
            }
        }

        model.Skeleton_CalcTransformMatrix = function (animInfo) {
            var mat = mat4.create();

            //变换矩阵从 1 开始
            mat4.identity(mat);

            //遍历计算所有骨块
            this.Skeleton_CalcTransformMatrixInternal(animInfo, mat, -1);

            debug_switch = false;
        };

        Model.prototype.GetTransformMatrix = function (matrix, animAlpha, groupMatrix, index, count) {
            mat4.set(this.bones[groupMatrix[index]].transformMatrix, matrix);
            animAlpha = this.bones[groupMatrix[index]].geosetAnimAlpha;

            if (count > 1) {
                for (var k = 1 ; k < count ; ++k) {
                    mat4.set(mat4.add(matrix, this.bones[groupMatrix[index + k]].transformMatrix), matrix);
                    animAlpha += this.bones[groupMatrix[index + k]].geosetAnimAlpha;
                }

                for (var mat_i = 0 ; mat_i < matrix.length ; ++mat_i) {
                    matrix[mat_i] *= 1.0 / count;
                }
                animAlpha *= 1.0 / count;
            }

            return animAlpha;
        };

        var binited = false;
        Model.prototype.Render = function () {
            //当前动画帧信息
            //TODO 
            if (binited == false) {
                binited = true;

                this.currentAnimInfo.currentAnim = 0;
                var anim = this.sequences[this.currentAnimInfo.currentAnim];
                this.currentAnimInfo.currentFrame = anim.startFrame;
                this.currentAnimInfo.startFrame = anim.startFrame;
                this.currentAnimInfo.endFrame = anim.endFrame;
            }
            else {
                this.currentAnimInfo.currentFrame += 10;

                if (this.currentAnimInfo.currentFrame >= this.currentAnimInfo.endFrame) {
                    this.currentAnimInfo.currentFrame = this.currentAnimInfo.startFrame;
                }
            }

            //根据当前动画帧计算当前骨架的变换矩阵集
            this.Skeleton_CalcTransformMatrix(this.currentAnimInfo);

            var render_mask = [0, 1, 1, 0, 0];
            for (var model_index = 0 ; model_index < this.numChunks ; ++model_index) {
                //渲染模型部件
                //if( render_mask[model_index] == 1 )
                this.chunks[model_index].Render(this);
            }
        };

        function Bone() {
            this.transformMatrix = mat4.create();
            mat4.identity(this.transformMatrix);
            this.geosetAnimAlpha = 1.0;
            this.geosetID = -1;
            this.geosetAnimID = -1;
        }

        var bone = Bone.prototype;

        bone.GetRotationMatrix = function (animInfo) {
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

        bone.GetTransferMatrix = function (animInfo) {
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

        bone.CalcTransformMatrix = function (center, animInfo, parentMatrix) {
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
                translation = this.GetTransferMatrix(animInfo);
            }

            if (this.keyFrameCount[MotionType.KGRT] > 0) {
                rotation = this.GetRotationMatrix(animInfo);
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

        function GeoChunk() {
            this.materialID = -1;
        }

        var geoChunk = GeoChunk.prototype;

        geoChunk.CalcGroupMatrix = function (mdx_model) {
            if (this.matrixes == undefined) {
                this.matrixes = [];
                for (var i = 0 ; i < this.numGroups ; ++i) {
                    this.matrixes[i] = mat4.create();
                }

                this.AnimAlphas = new Float32Array(this.numGroups);
            }

            var index = 0;
            for (var i = 0 ; i < this.numGroups ; i++) {
                var matrixCount = this.groups[i];

                mdx_model.GetTransformMatrix(this.matrixes[i], this.AnimAlphas[i], this.matrixGroups, index, matrixCount);

                index += matrixCount;
            }
        };

        geoChunk.Render = function (mdx_model) {
            var mat = mdx_model.materials[this.materialID < 0 ? 0 : this.materialID];

            this.CalcGroupMatrix(mdx_model);

            for (var L = 0 ; L < mat.numLayers ; ++L) {
                var alpha = 1.0;//mat->getFrameAlpha( animInfo.currentFrame , l );
                var useLight = true;
                var useModelColor = false;

                //texture
                var bindTex = mdx_model.bitmaps[mat.layers[L].textureID].texture;

                var modelColor = vec3.create([1.0, 0.0, 0.0]);

                //if (bindTex == 0) {
                //    if (mat.layers[L].filterMode != 3) {
                //        //设置模型颜色
                //        //D3DXCOLOR *color = model->GetModelColor( );
                //        //glColor4f( color->r , color->g , color->b , 1.0f );
                //    }

                //    //			gl.bindTexture( gl.TEXTURE_2D , null );
                //}
                //else {
                //    //			gl.activeTexture( gl.TEXTURE0 );
                //    //			gl.bindTexture( gl.TEXTURE_2D , bindTex );
                //    //			gl.uniform1i( shaderProgram.samplerUniform , 0 );
                //}

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

                    //if (mdx_model.bitmaps[mat.layers[L].textureID].replaceableID != 2) // ! team glow
                    //{
                    //    //glEnable(GL_COLOR_MATERIAL);
                    //    //glColor4f(0.4f,0.4f,0.4f,alpha/2.0f);
                    //    //gl.enable(GL_LIGHTING);
                    //    //useLight = true;
                    //}
                    //else {
                    //    //glColor4f( 1.0f , 1.0f , 1.0f , 1.0f );
                    //}
                    //continue;

                }
                else {
                    gl.disable(gl.BLEND);
                }

                //triangles : 待渲染的三角形顶点索引
                // v0 , v1 , v2  就是一个三角形
                // vertexGroups[index] 顶点index所属的顶点分组id

                //draw primitives
                var rVertices = new Float32Array(this.numVertices * 3);
                for (var i = 0 ; i < this.numVertices * 3 ; ++i)
                    rVertices[i] = this.vertices[i];;

                var rNormals = new Float32Array(this.numVertices * 3);
                for (var i = 0 ; i < this.numVertices * 3 ; ++i)
                    rNormals[i] = this.normals[i];


                //for (var i = 0 ; i < this.numGroups ; ++i) {
                //    var mat = this.matrixes[i];

                //    for (var j = 0 ; j < this.numTriangles * 3 ; ++j) {
                //        var v = this.triangles[j];

                //        if (this.vertexGroups[v] == i) {
                //            vec3_transformCood2(rVertices, 3 * v, mat);
                //            vec3_transformNormal2(rNormals, 3 * v, mat);
                //        }
                //    }
                //}

                var realVertices = new Float32Array(this.numTriangles * 3 * 3);
                var realNormals = new Float32Array(this.numTriangles * 3 * 3);
                var realUVs = new Float32Array(this.numTriangles * 3 * 2);

                for (var i = 0 ; i < this.numTriangles ; ++i) {
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

                //for (var i = 0 ; i < this.numTriangles ; ++i) {
                //    var index;
                //    var v0 = this.triangles[3 * i];
                //    var v1 = this.triangles[3 * i + 1];
                //    var v2 = this.triangles[3 * i + 2];

                //    index = this.vertexGroups[v0];
                //    vec3_transformCoord(rVertices, 3 * v0, this.matrixes[index]);
                //    vec3_transformNormal(rNormals, 3 * v0, this.matrixes[index]);

                //    index = this.vertexGroups[v1];
                //    vec3_transformCoord(rVertices, 3 * v1, this.matrixes[index]);
                //    vec3_transformNormal(rNormals, 3 * v1, this.matrixes[index]);

                //    index = this.vertexGroups[v2];
                //    vec3_transformCoord(rVertices, 3 * v2, this.matrixes[index]);
                //    vec3_transformNormal(rNormals, 3 * v2, this.matrixes[index]);
                //}

                //console.log( "\t\t chunk primitivecount = " + this.trianglesBuffer.numItems );

                //gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
                //gl.bufferData(gl.ARRAY_BUFFER, rVertices, gl.STATIC_DRAW);
                //gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.verticesBuffer.itemSize, gl.FLOAT, false, 0, 0);

                //gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
                //gl.bufferData(gl.ARRAY_BUFFER, rNormals, gl.STATIC_DRAW);
                //gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.normalsBuffer.itemSize, gl.FLOAT, false, 0, 0);

                ////gl.bindBuffer( gl.ARRAY_BUFFER , triangleVertexColorBuffer );
                ////gl.vertexAttribPointer( shaderProgram.vertexColorAttribute , triangleVertexColorBuffer.itemSize , gl.FLOAT , false , 0 , 0 );

                //gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer);
                //gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.uvsBuffer.itemSize, gl.FLOAT, false, 0, 0);


                //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);


                //useLight = true;
                //useModelColor = true;
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
            if (this.loadingObject[name] != undefined) {
                this.loadingObject[name] = undefined;
            }

            if (type == "texture") {
                this.loadingObject[name] = obj.image;
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
            var geochunk = new GeoChunk();
            var n = 0;
            var p = inPos;
            while ((p < inPos + inSize) && (n < 8)) {
                var tag = dataview.getString(p, 4);
                p += 4;

                switch (tag) {
                    case 'VRTX': // vertex
                        n++;

                        geochunk.numVertices = dataview.getUint32(p, true);
                        p += 4;
                        geochunk.vertices = new Float32Array(geochunk.numVertices * 3);//( D3DXVECTOR3* ) p.c;

                        for (var id = 0 ; id < geochunk.numVertices * 3 ; id++) {
                            geochunk.vertices[id] = dataview.getFloat32(p, true);
                            p += 4;
                        }

                        geochunk.verticesBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, geochunk.verticesBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, geochunk.vertices, gl.STATIC_DRAW);
                        geochunk.verticesBuffer.itemSize = 3;
                        geochunk.verticesBuffer.numItems = geochunk.numVertices;
                        break;
                    case 'NRMS': // normal
                        n++;

                        geochunk.NumNormals = dataview.getUint32(p, true);
                        p += 4;

                        if (geochunk.numVertices != geochunk.NumNormals) {
                            throw new Error("geochunk.numVertices != geochunk.NumNormal =" + geochunk.NumNormals);
                        }

                        geochunk.normals = new Float32Array(geochunk.NumNormals * 3);

                        for (var id = 0 ; id < geochunk.NumNormals * 3 ; ++id) {
                            geochunk.normals[id] = dataview.getFloat32(p, true);
                            p += 4;
                        }

                        geochunk.normalsBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, geochunk.normalsBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, geochunk.normals, gl.STATIC_DRAW);
                        geochunk.normalsBuffer.itemSize = 3;
                        geochunk.normalsBuffer.numItems = geochunk.NumNormals;
                        break;
                    case 'PTYP': // PLANE_TYPE
                        n++;

                        var size = dataview.getUint32(p, true);
                        p += 4;

                        if (dataview.getUint32(p, true) != 4) // == Triangles
                        {
                            throw new Error("dataview.getUint32( p ) != 4");
                        }

                        p += size * 4;
                        break;
                    case 'PCNT': // primitives count
                        n++;

                        var size = dataview.getUint32(p, true);
                        p += 4;

                        if (size == 1) {
                            geochunk.numTriangles = (dataview.getUint32(p, true)) / 3;
                            p += 4;
                        }
                        else {
                            geochunk.numTriangles = size;
                            p += size * 4;
                        }
                        break;
                    case 'PVTX': // primitives vertices
                        n++;

                        var size = dataview.getUint32(p, true);
                        p += 4;

                        geochunk.triangles = new Uint16Array(size);

                        for (var i = 0 ; i < size ; i++) {
                            geochunk.triangles[i] = dataview.getUint16(p, true);
                            p += 2;
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

                        var size = dataview.getUint32(p, true);
                        p += 4;

                        if (geochunk.numVertices != size) {
                            throw new Error("geochunk.numVertices != size");
                        }

                        geochunk.vertexGroups = new Uint8Array(size);
                        for (var i = 0 ; i < size ; ++i) {
                            geochunk.vertexGroups[i] = dataview.getInt8(p, true);
                            p += 1;
                        }
                        break;
                    case 'MTGC': // group matrix counts
                        // this is the number of vertices defined by GNDX for each matrix
                        n++;

                        geochunk.numGroups = dataview.getUint32(p, true);
                        p += 4;

                        geochunk.groups = new Uint32Array(geochunk.numGroups);
                        for (var i = 0 ; i < geochunk.numGroups ; i++) {
                            geochunk.groups[i] = dataview.getInt32(p, true);
                            p += 4;
                        }
                        break;
                    case 'MATS': // matrices
                        n++;

                        geochunk.numMatrixGroups = dataview.getUint32(p, true);
                        p += 4;

                        geochunk.matrixGroups = new Int32Array(geochunk.numMatrixGroups);
                        for (var i = 0 ; i < geochunk.numMatrixGroups ; i++) {
                            geochunk.matrixGroups[i] = dataview.getInt32(p, true);
                            p += 4;
                        }
                        break;
                    default:
                        var size = dataview.getUint32(p, true);
                        p += 4 + size;
                        break;
                }
            }

            if (p < inPos + inSize) {
                geochunk.materialID = dataview.getUint32(p, true);
                p += 4 * 3;
                geochunk.boundsRadius = dataview.getFloat32(p, true);
                p += 4;

                geochunk.mins = new Float32Array(3);
                geochunk.maxs = new Float32Array(3);

                for (var i = 0 ; i < 3 ; i++) {
                    geochunk.mins[i] = dataview.getFloat32(p, true);
                    p += 4;
                }

                for (var i = 0 ; i < 3 ; i++) {
                    geochunk.maxs[i] = dataview.getFloat32(p, true);
                    p += 4;
                }

                //	struct AnimExtent{
                //		D3DXVECTOR3		MinimumExtent;
                //		D3DXVECTOR3		MaximumExtent;
                //		float			BoundsRadius;	
                //	};
                geochunk.numAnimExtent = dataview.getUint32(p, true);
                p += 4;

                geochunk.animExtents = new Float32Array(7 * geochunk.numAnimExtent);
                for (var j = 0 ; j < geochunk.numAnimExtent ; j++) {
                    for (var i = 0 ; i < 7 ; ++i) {
                        geochunk.animExtents[j * 7 + i] = dataview.getFloat32(p, true);
                        p += 4;
                    }
                }

                var tag = dataview.getString(p, 4);
                p += 4;

                if (tag == 'UVAS') {
                    var uvas_size = dataview.getUint32(p, true); // no skip
                    p += 4;

                    if (dataview.getString(p, 4) == 'UVBS') {
                        p += 4;

                        var size = dataview.getUint32(p, true);
                        p += 4;

                        geochunk.uvs = new Float32Array(size * 2);

                        for (var i = 0 ; i < size * 2 ; ++i) {
                            geochunk.uvs[i] = dataview.getFloat32(p, true);
                            p += 4;
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
            var p = inPos;

            var bone = new Bone();

            var ireader = 0;

            bone.boneName = dataview.getString(p, 80);
            p += 80;

            bone.objectID = dataview.getUint32(p, true);
            p += 4;

            bone.parentID = dataview.getInt32(p, true);
            p += 4;

            bone.nodeType = dataview.getUint32(p, true);
            p += 4;

            bone.keyFrameCount = [];
            bone.lineType = [];
            bone.keyFrames = [];

            var nextP = inPos + inSize;

            while ((p < inPos + inSize) && (ireader < 3)) {
                var tag = dataview.getString(p, 4);

                var framesType = -1;
                var vectorCount = -1;

                if (tag.indexOf("KG") < 0) {
                    framesType = -1;
                    break;
                }

                p += 4;
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
                    bone.keyFrameCount[framesType] = dataview.getUint32(p, true);
                    p += 4;

                    bone.lineType[framesType] = dataview.getUint32(p, true);
                    p += 4 * 2;

                    bone.keyFrames[framesType] = [];
                    if (bone.lineType[framesType] > LineType.LINEAR)//non linear trasfer
                    {
                        for (var i = 0 ; i < bone.keyFrameCount[framesType]; i++) {
                            var frame = new KeyFrame();

                            frame.type = "MDX_NoLinearKeyFrame" + vectorCount;

                            frame.frameNum = dataview.getInt32(p, true);
                            p += 4;

                            frame.vec = dataview.getVectorN(p, vectorCount);
                            p += 4 * vectorCount;

                            frame.inTan = dataview.getVectorN(p, vectorCount);
                            p += 4 * vectorCount;

                            frame.outTan = dataview.getVectorN(p, vectorCount);
                            p += 4 * vectorCount;

                            bone.keyFrames[framesType][i] = frame;
                        }
                    }
                    else {
                        for (var i = 0 ; i < bone.keyFrameCount[framesType]; i++) {
                            var frame = new KeyFrame();

                            frame.type = "LinearKeyFrame" + vectorCount;

                            frame.frameNum = dataview.getInt32(p, true);
                            p += 4;

                            frame.vec = dataview.getVectorN(p, vectorCount);
                            p += 4 * vectorCount;

                            bone.keyFrames[framesType][i] = frame;
                        }
                    }
                }
            }

            if (p < inPos + inSize - 4) {
                bone.geosetID = dataview.getUint32(p, true);
                p += 4;
                bone.geosetAnimID = dataview.getUint32(p, true);
                p += 4;
            }

            return bone;
        }

        function mdx_read_material(dataview, inPos, inSize) {
            var p = inPos;
            var material = new Material();
            p += 8;
            if (dataview.getString(p, 4) != "LAYS") {
                throw new Error("dataview.getString( p , 4 ) != LAYS");
                return;
            }
            p += 4;
            material.numLayers = dataview.getUint32(p, true);
            p += 4;

            material.layers = [];

            for (var i = 0 ; i < material.numLayers ; ++i) {
                var startP = p;
                material.layers[i] = new MaterialLayer();
                material.layers[i].layersSize = dataview.getUint32(p, true);
                p += 4;
                material.layers[i].filterMode = dataview.getUint32(p, true);
                p += 4;
                material.layers[i].shading = dataview.getUint32(p, true);
                p += 4;
                material.layers[i].textureID = dataview.getUint32(p, true);
                p += 4;
                material.layers[i].unk5 = dataview.getInt32(p, true);
                p += 4;
                material.layers[i].unk6 = dataview.getInt32(p, true);
                p += 4;
                material.layers[i].alpha = dataview.getFloat32(p, true);
                p += 4;

                if (dataview.getString(p, 4) == 'KMTA') {
                    p += 4;

                    material.layers[i].existKMTA = true;
                    material.layers[i].KMTA = new MaterialLayoutAlpha();
                    material.layers[i].KMTA.chunkNum = dataview.getUint32(p, true);
                    p += 4;
                    material.layers[i].KMTA.LineType = dataview.getUint32(p, true);
                    p += 4;
                    material.layers[i].KMTA.data = dataview.buffer.slice(p, material.layers[i].layersSize - (p - startP));
                }
                else {
                    material.layers[i].existKMTA = false;
                }
                p = startP += material.layers[i].layersSize;
            }

            return material;
        }

        function mdx_load_model_from_buff(databuff, modelUrl, webgl) {
            modelBaseUrl = modelUrl;
            gl = webgl;

            var mdxModel = new Model();

            var dataview = new DataView(databuff);
            dataview.getString = function (pos, length) {
                var str = new String();

                var u8 = new Uint8Array(1);
                for (var i = pos ; i < pos + length ; ++i) {
                    u8[0] = this.getUint8(i);
                    if (u8[0] == 0) break;
                    str += String.fromCharCode(u8[0]);
                }
                return str;
            };

            dataview.getVectorN = function (pos, n) {
                var vec = new Float32Array(n);

                for (var i = 0 ; i < n ; ++i) {
                    vec[i] = this.getFloat32(pos + i * 4, true);
                }

                return vec;
            };

            //1. flag检测

            var p = 0; //数据指针
            var totalSize = databuff.byteLength;

            var mdx_flag = dataview.getString(p, 4);

            if (mdx_flag != "MDLX") {
                throw new TypeError("数据标识错误");
            }

            p += 4;

            while (p < totalSize) {
                var chunkTag = dataview.getString(p, 4);
                p += 4;
                var chunkSize = dataview.getUint32(p, true);
                p += 4;

                var funList = ["HELP", "mdx_read_skeleton_helpers",
                               "BONE", "mdx_read_skeleton_bones",
                               "GEOA", "mdx_read_skeleton_geosets_anims",
                               "GEOS", "mdx_read_geosets",
                               "SEQS", "mdx_read_sequences",
                               "TEXS", "mdx_read_textures",
                               "MTLS", "mdx_read_materialmap",
                               "PIVT", "mdx_read_skeleton_pivotpoints"];

                switch (chunkTag) {
                    case 'ATCH':
                        //attachs.Read(p,size);
                        break;
                    case 'VERS':
                        mdxModel.version = dataview.getUint32(p, true);
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
            return mdxModel;
        }

        MDX.mdx_read_geosets = function (mdxModel, dataview, inPos, inSize) {
            mdxModel.numChunks = 0;
            mdxModel.chunks = [];

            var p = inPos;

            while (p < inPos + inSize) {
                var geochunkSize = dataview.getUint32(p, true) - 4;
                p += 4;
                mdxModel.chunks[mdxModel.numChunks] = mdx_read_geochunk(dataview, p, geochunkSize);
                p += geochunkSize;
                mdxModel.numChunks++;
            }
        };

        MDX.mdx_read_skeleton_geosets_anims = function (mdxModel, dataview, inPos, inSize) {
            var p = inPos;

            mdxModel.numGeosetAnim = 0;
            mdxModel.geosetAnim = [];
            mdxModel.geosetAlpha = [];

            while (p < inPos + inSize) {
                var nextp = p;

                var size = dataview.getUint32(p, true);
                p += 4;
                nextp += size;

                var geoa = new GEOA();

                geoa.unk0 = dataview.getFloat32(p, true);
                p += 4;
                geoa.type = dataview.getInt32(p, true);
                p += 4;
                geoa.blue = dataview.getFloat32(p, true);
                p += 4;
                geoa.green = dataview.getFloat32(p, true);
                p += 4;
                geoa.red = dataview.getFloat32(p, true);
                p += 4;
                geoa.GeosetID = dataview.getUint32(p, true);
                p += 4;

                mdxModel.geosetAnim[mdxModel.numGeosetAnim] = geoa;

                var kgao = new KGAO();

                if (dataview.getString(p, 4) == 'KGAO') {
                    p += 4;

                    kgao.chunkNum = dataview.getInt32(p, true);
                    p += 4;
                    kgao.lineType = dataview.getInt32(p, true);
                    p += 4;
                    p += 4;

                    kgao.data = [];
                    for (var chunkI = 0; chunkI < kgao.chunkNum ; ++chunkI) {
                        var a = new AnimAlpha();
                        a.frameNum = dataview.getInt32(p, true);
                        p += 4;

                        a.alphaValue = dataview.getFloat32(p, true);
                        p += 4;

                        kgao.data[chunkI] = a;
                    }
                }
                else {
                    kgao.chunkNum = 0;
                    kgao.lineType = 0;
                    kgao.data = null;
                }
                mdxModel.geosetAlpha[mdxModel.numGeosetAnim] = kgao;
                mdxModel.numGeosetAnim++;
                p = nextp;
            }
        };

        MDX.mdx_read_sequences = function (mdxModel, dataview, inPos, inSize) {
            /// <summary>读取序列动画数据</summary>
            /// <param name="mdxModel" type="Object">模型对象</param>
            /// <param name="dataview" type="Object"></param>
            /// <param name="inPos" type="Number"></param>
            /// <param name="inSize" type="Number"></param>

            var p = inPos;

            // 序列动画数量
            mdxModel.numSequences = inSize / SequenceAnimStructSize;

            // 定义序列动画数组
            mdxModel.sequences = [];

            for (var i = 0 ; i < mdxModel.numSequences ; i++) {
                mdxModel.sequences[i] = new SequenceAnim();

                mdxModel.sequences[i].name = dataview.getString(p, 80);
                p += 80;

                mdxModel.sequences[i].startFrame = dataview.getInt32(p, true);
                p += 4;

                mdxModel.sequences[i].endFrame = dataview.getInt32(p, true);
                p += 4;

                mdxModel.sequences[i].moveSpeed = dataview.getInt32(p, true);
                p += 4;

                mdxModel.sequences[i].nonLooping = dataview.getInt32(p, true);
                p += 4;

                mdxModel.sequences[i].rarity = dataview.getInt32(p, true);
                p += 4;

                mdxModel.sequences[i].unk6 = dataview.getInt32(p, true);
                p += 4;

                mdxModel.sequences[i].boundsRadius = dataview.getFloat32(p, true);
                p += 4;

                mdxModel.sequences[i].mins = dataview.getVectorN(p, 3);
                p += 4 * 3;

                mdxModel.sequences[i].maxs = dataview.getVectorN(p, 3);
                p += 4 * 3;
            }
        };

        MDX.mdx_read_skeleton_helpers = function (mdxModel, dataview, inPos, inSize) {
            var p = inPos;

            if (mdxModel.numBone == undefined) {
                mdxModel.numBone = 0;

                mdxModel.bones = [];
            }

            while (p < inPos + inSize) {
                var size = dataview.getUint32(p, true);
                p += 4;

                mdxModel.bones[mdxModel.numBone] = mdx_read_bone(dataview, p, size);

                mdxModel.numBone++;

                p += size - 4;
            }

        };

        MDX.mdx_read_skeleton_bones = function (mdxModel, dataview, inPos, inSize) {
            var p = inPos;

            if (mdxModel.numBone == undefined) {
                mdxModel.numBone = 0;

                mdxModel.bones = [];
            }

            while (p < inPos + inSize) {
                var size = dataview.getUint32(p, true);
                p += 4;

                mdxModel.bones[mdxModel.numBone] = mdx_read_bone(dataview, p, size + 4);

                mdxModel.numBone++;

                p += size + 4;
            }
        };

        MDX.mdx_read_materialmap = function (mdxModel, dataview, inPos, inSize) {
            var p = inPos;

            mdxModel.numMaterials = 0;

            mdxModel.materials = [];

            while (p < inPos + inSize) {
                var size = dataview.getUint32(p, true) - 4;
                p += 4;

                mdxModel.materials[mdxModel.numMaterials] = mdx_read_material(dataview, p, size);
                p += size;

                mdxModel.numMaterials++;
            }
        };

        MDX.mdx_read_skeleton_pivotpoints = function (mdxModel, dataview, inPos, inSize) {
            var p = inPos;

            mdxModel.numPivotPoint = inSize / (3 * 4);
            mdxModel.pivotPoints = [];

            for (var i = 0 ; i < mdxModel.numPivotPoint ; i++) {
                mdxModel.pivotPoints[i] = dataview.getVectorN(p, 3);
                p += 3 * 4;
            }
        };

        MDX.mdx_read_textures = function (mdxModel, dataview, inPos, inSize) {
            var p = inPos;

            // 读取数据块
            mdxModel.numBitmaps = inSize / (256 + 4 * 3);

            // 定义模型贴图数组
            mdxModel.bitmaps = [];

            for (var i = 0 ; i < mdxModel.numBitmaps ; ++i) {
                var bitmap = new TextureBitmap();

                bitmap.replaceableID = dataview.getInt32(p, true);
                p += 4;
                bitmap.texturePath = dataview.getString(p, 256);
                p += 256;
                bitmap.unk0 = dataview.getInt32(p, true);
                p += 4;
                bitmap.unk1 = dataview.getInt32(p, true);
                p += 4;
                if (bitmap.replaceableID == 2) {
                    bitmap.texturePath = "ReplaceableTextures\\TeamGlow\\TeamGlow00.blp";
                }

                if (bitmap.texturePath != "") {
                    //纹理
                    var tex = gl.createTexture();
                    tex.image = new Image();
                    tex.image.src = modelBaseUrl + bitmap.texturePath;
                    tex.image.type = "texture";
                    tex.image.texture = tex;
                    tex.image.onload = function () {
                        loadOver.apply(mdxModel, [this.type, this.src, this.texture]);
                    };

                    mdxModel.loadingObject[tex.image.src] = true;

                    bitmap.texture = tex;
                }

                mdxModel.bitmaps[i] = bitmap;
            }
        };

        return mdx_load_model_from_buff;
    }());

    TeaJs.Loader.MdxModel = MdxModel;
}(TeaJs);