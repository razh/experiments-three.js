varying vec2 vN;

void main() {
  // Position.
  vec4 p = vec4( position, 1.0 );

  // Eye vector.
  vec3 e = normalize( vec3( modelViewMatrix * p ) );
  // Normal vector.
  vec3 n = normalize( normalMatrix * normal );

  vec3 r = reflect( e, n );

  r.z += 1.0;
  float m = 2.0 * length( r );

  vN = r.xy / m + 0.5;

  gl_Position = projectionMatrix * modelViewMatrix * p;
}
