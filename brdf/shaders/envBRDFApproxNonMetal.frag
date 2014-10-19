precision mediump float;

float envBRDFApproxNonmetal(float roughness, float NdotV ) {
  const vec2 c0 = vec2( -1.0, -0.0275 );
  const vec2 c1 = vec2( 1.0, 0.0425 );
  // Same as envBRDFApprox( 0.04, roughness, NdotV ).
  vec2 r = roughness * c0 + c1;
  return min( r.x * r.x, exp2( -9.28 * NdotV ) ) * r.x + r.y;
}
