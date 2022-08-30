varying vec3  worldPosition;
uniform float uDistance;
uniform mat4  uMatrix;


void main() {
  vec3 pos = position.xzy * uDistance;
  pos.xz += cameraPosition.xz;
  worldPosition = pos;
  gl_Position = projectionMatrix * modelViewMatrix * uMatrix * vec4(pos, 1.0);
}
