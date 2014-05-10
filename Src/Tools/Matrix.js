/*
    矩阵类
*/
void function (TeaJs) {
    "use strict";

    function Matrix4x3() {
        /// <summary>4X3矩阵</summary>

        this.d = new Float32Array(16);
        for (var i = 0; i <= 15; i += 5) this.d[i] = 1;
    }

    // 缓存4x3矩阵原型对象
    var m4x3 = Matrix4x3.prototype;

    m4x3.make = function (x1, x2, x3, y1, y2, y3, z1, z2, z3, t1, t2, t3) {
        this.d[0] = x1;
        this.d[1] = x2;
        this.d[2] = x3;
        this.d[4] = y1;
        this.d[5] = y2;
        this.d[6] = y3;
        this.d[8] = z1;
        this.d[9] = z2;
        this.d[10] = z3;
        this.d[12] = t1;
        this.d[13] = t2;
        this.d[14] = t3;
        return this;
    };

    m4x3.makeIdentity = function () {
        return this.make(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0);
    };

    m4x3.makeRotate = function (angle, x, y, z) {
        var invlen = 1 / Math.sqrt(x * x + y * y + z * z);
        var n = { x: invlen * x, y: invlen * y, z: invlen * z };
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        var t = 1 - c;
        this.d[0] = t * n.x * n.x + c;
        this.d[1] = t * n.x * n.y + s * n.z;
        this.d[2] = t * n.x * n.z - s * n.y;
        this.d[4] = t * n.x * n.y - s * n.z;
        this.d[5] = t * n.y * n.y + c;
        this.d[6] = t * n.y * n.z + s * n.x;
        this.d[8] = t * n.x * n.z + s * n.y;
        this.d[9] = t * n.y * n.z - s * n.x;
        this.d[10] = t * n.z * n.z + c;
        this.d[12] = this.d[13] = this.d[14] = 0;
        return this;
    };

    m4x3.multiply = function (m) {
        this.make(
            this.d[0] * m.d[0] + this.d[4] * m.d[1] + this.d[8] * m.d[2],
            this.d[1] * m.d[0] + this.d[5] * m.d[1] + this.d[9] * m.d[2],
            this.d[2] * m.d[0] + this.d[6] * m.d[1] + this.d[10] * m.d[2],

            this.d[0] * m.d[4] + this.d[4] * m.d[5] + this.d[8] * m.d[6],
            this.d[1] * m.d[4] + this.d[5] * m.d[5] + this.d[9] * m.d[6],
            this.d[2] * m.d[4] + this.d[6] * m.d[5] + this.d[10] * m.d[6],

            this.d[0] * m.d[8] + this.d[4] * m.d[9] + this.d[8] * m.d[10],
            this.d[1] * m.d[8] + this.d[5] * m.d[9] + this.d[9] * m.d[10],
            this.d[2] * m.d[8] + this.d[6] * m.d[9] + this.d[10] * m.d[10],

            this.d[0] * m.d[12] + this.d[4] * m.d[13] + this.d[8] * m.d[14] + this.d[12],
            this.d[1] * m.d[12] + this.d[5] * m.d[13] + this.d[9] * m.d[14] + this.d[13],
            this.d[2] * m.d[12] + this.d[6] * m.d[13] + this.d[10] * m.d[14] + this.d[14]
            );
        return this;
    };

    m4x3.makeInverseRigidBody = function (m) {
        var it0 = -m.d[12];
        var it1 = -m.d[13];
        var it2 = -m.d[14];

        this.d[12] = m.d[0] * it0 + m.d[1] * it1 + m.d[2] * it2;
        this.d[13] = m.d[4] * it0 + m.d[5] * it1 + m.d[6] * it2;
        this.d[14] = m.d[8] * it0 + m.d[9] * it1 + m.d[10] * it2;

        this.d[0] = m.d[0];
        this.d[1] = m.d[4];
        this.d[2] = m.d[8];
        this.d[4] = m.d[1];
        this.d[5] = m.d[5];
        this.d[6] = m.d[9];
        this.d[8] = m.d[2];
        this.d[9] = m.d[6];
        this.d[10] = m.d[10];

        return this;
    };

    function Matrix4x4() {
        /// <summary>4x4矩阵</summary>

        this.d = new Float32Array(16);
        for (var i = 0; i <= 15; i += 5) this.d[i] = 1;
    }

    // 缓存4x4矩阵原型对象
    var m4x4 = Matrix4x4.prototype;

    m4x4.make = function (x1, x2, x3, x4, y1, y2, y3, y4, z1, z2, z3, z4, t1, t2, t3, t4) {
        this.d[0] = x1;
        this.d[1] = x2;
        this.d[2] = x3;
        this.d[3] = x4;
        this.d[4] = y1;
        this.d[5] = y2;
        this.d[6] = y3;
        this.d[7] = y4;
        this.d[8] = z1;
        this.d[9] = z2;
        this.d[10] = z3;
        this.d[11] = z4;
        this.d[12] = t1;
        this.d[13] = t2;
        this.d[14] = t3;
        this.d[15] = t4;
        return this;
    };

    m4x4.makeIdentity = function () {
        return this.make(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    };

    m4x4.makePerspective = function (fovy, aspect, znear, zfar) {
        var top = znear * Math.tan(fovy * Math.PI / 360.0);
        var bottom = -top;
        var left = bottom * aspect;
        var right = top * aspect;

        var X = 2 * znear / (right - left);
        var Y = 2 * znear / (top - bottom);
        var A = (right + left) / (right - left);
        var B = (top + bottom) / (top - bottom);
        var C = -(zfar + znear) / (zfar - znear);
        var D = -2 * zfar * znear / (zfar - znear);

        this.make(X, 0, 0, 0, 0, Y, 0, 0, A, B, C, -1, 0, 0, D, 0);
        return this;
    };

    var globaGLMatrixState = {
        modelMatrix: [new Matrix4x3(), new Matrix4x3()],
        projectionMatrix: new Matrix4x4().makePerspective(45, 1, 0.01, 100),
        viewMatrix: new Matrix4x3(),
        modelStackTop: 0
    }

    function modelMatrix() {
        return globaGLMatrixState.modelMatrix[globaGLMatrixState.modelStackTop];
    }

    function projectionMatrix() {
        return globaGLMatrixState.projectionMatrix;
    }

    function viewMatrix() {
        return globaGLMatrixState.viewMatrix;
    }

    function pushModelMatrix() {
        ++globaGLMatrixState.modelStackTop;
        if (globaGLMatrixState.modelStackTop == globaGLMatrixState.modelMatrix.length) {
            globaGLMatrixState.modelMatrix.push(new Matrix4x3());
        }
        var top = globaGLMatrixState.modelMatrix[globaGLMatrixState.modelStackTop];
        var parent = globaGLMatrixState.modelMatrix[globaGLMatrixState.modelStackTop - 1];
        for (var j = 0; j < 16; ++j) {
            top.d[j] = parent.d[j];
        }
        return top;
    }

    function popModelMatrix() {
        --globaGLMatrixState.modelStackTop;

    }
}(TeaJs);