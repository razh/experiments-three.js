uniform sampler2D tMatCap;

varying vec3 e;
varying vec3 n;

void main() {
  vec3 r = reflect( e, n );

  r.z += 1.0;
  float m = 2.0 * length( r );

  vec2 vN = r.xy / m + 0.5;

  vec3 base = texture2D( tMatCap, vN ).rgb;

  gl_FragColor = vec4( base, 1.0 );
}
