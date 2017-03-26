/* exported Complex */
var Complex = (function() {
  'use strict';

  var TAU = 2 * Math.PI;

  return {
    create() {
      return new Float32Array(2);
    },

    clone( a ) {
      var out = new Float32Array(2);
      out[0] = a[0];
      out[1] = a[1];
      return out;
    },

    from( real, imag ) {
      var out = new Float32Array(2);
      out[0] = real;
      out[1] = imag;
      return out;
    },

    mul( out, a, b ) {
      out[0] = a[0] * b[0] - a[1] * b[1];
      out[1] = a[0] * b[1] - a[1] * b[0];
      return out;
    },

    phaseFactor( out, k, n ) {
      var x = ( TAU * k ) / n;
      out[0] = Math.cos( x );
      out[1] = Math.sin( x );
      return out;
    },

    polar( out, a ) {
      out[0] = Math.sqrt( a[0] * a[0] + a[1] * a[1] );
      out[1] = Math.atan2( a[1], a[0] );
      return out;
    },

    fracPow( out, a, n, k ) {
      // Polar form conversion.
      // Equivalent to Math.pow( Math.sqrt( length ), n ).
      var radius = Math.pow( out[0] * out[0] + out[1] * out[1], 0.5 * n );
      var angle = Math.atan2( a[1], a[0] );
      angle = ( angle + TAU * k ) * n;

      out[0] = radius * Math.cos( angle );
      out[1] = radius * Math.sin( angle );

      return out;
    },

    exp( out, a ) {
      var exp = Math.exp( a[0] );
      out[0] = exp * Math.cos( a[1] );
      out[1] = exp * Math.sin( a[1] );
      return out;
    },
  };
}());
