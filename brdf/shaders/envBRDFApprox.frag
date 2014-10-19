precision mediump float;

vec3 envBRDFApprox( vec3 specularColor, float roughness, float NdotV ) {
  const vec4 c0 = vec4( -1.0, -0.0275, -0.572, 0.022 );
  const vec4 c1 = vec4( 1.0, 0.0425, 1.04, -0.04 );
  vec4 r = roughness * c0 + c1;
  float a004 = min( r.x * r.x, exp( -9.28 * NdotV ) ) * r.x + r.y;
  vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
  return specularColor * AB.x + AB.y;
}
