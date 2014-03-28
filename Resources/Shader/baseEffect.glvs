// 顶点属性
attribute vec3 po;

// 投射矩阵
uniform mat4 pro;

// 旋转矩阵
uniform mat4 rot;

// 平移矩阵
uniform mat4 mov;

void main () {
    gl_Position = pro * mov * rot * vec4(po, 1.0);
}