/*exported Complex*/
var Complex = (function() {
  'use strict';

  var TAU = 2 * Math.PI;

  var Complex = {};

  Complex.create = function() {
    return new Float32Array(2);
  };

  Complex.clone = function( a ) {
    var out = new Float32Array(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
  };

  Complex.from = function( real, imag ) {
    var out = new Float32Array(2);
    out[0] = real;
    out[1] = imag;
    return out;
  };

  Complex.mul = function( out, a, b ) {
    out[0] = a[0] * b[0] - a[1] * b[1];
    out[1] = a[0] * b[1] - a[1] * b[0];
    return out;
  };

  Complex.phaseFactor = function( out, k, n ) {
    var x = ( TAU * k ) / n;
    out[0] = Math.cos( x );
    out[1] = Math.sin( x );
    return out;
  };

  Complex.polar = function( out, a ) {
    out[0] = Math.sqrt( a[0] * a[0] + a[1] * a[1] );
    out[1] = Math.atan2( a[1], a[0] );
    return out;
  };

  Complex.fracPow = function( out, a, n, k ) {
    // Polar form conversion.
    // Equivalent to Math.pow( Math.sqrt( length ), n ).
    var radius = Math.pow( out[0] * out[0] + out[1] * out[1], 0.5 * n );
    var angle = Math.atan2( a[1], a[0] );
    angle = ( angle  + TAU * k ) * n;

    out[0] = radius * Math.cos( angle );
    out[1] = radius * Math.sin( angle );

    return out;
  };

  Complex.exp = function( out, a ) {
    var exp = Math.exp( a[0] );
    out[0] = exp * Math.cos( a[1] );
    out[1] = exp * Math.sin( a[1] );
    return out;
  };

  return Complex;

}) ();
