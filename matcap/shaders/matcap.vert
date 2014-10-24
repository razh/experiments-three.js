uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

attribute vec3 position;
attribute vec3 normal;

varying vec2 vN;

void main() {
  // Position.
  vec4 p = vec4( position, 1.0 );

  // Eye vector.
  vec3 e = normalize( vec3( modelViewMatrix * p ) );
  // Normal vector.
  vec3 n = normalize( normalMatrix * normal );

  vec3 r = reflect( e, n);

  // Use straight multiplication instead of pow() due to iOS 8 artifacts.
  float m = 2.0 * sqrt(
    r.x * r.x +
    r.y * r.y +
    ( r.z + 1.0 ) * ( r.z + 1.0 )
  );

  vN = r.xy / m + 0.5;

  gl_Position = projectionMatrix * modelViewMatrix * p;
}
