/*exported createPool*/
function createPool( Constructor ) {
  'use strict';

  var pool = [];
  var count = 0;
  var length = 0;

  function get() {
    if ( count === length ) {
      var object = new Constructor();
      pool.push( object );
      length++;
      count++;
      return object;
    }

    return pool[ count++ ];
  }

  function reset() {
    count = 0;
  }

  return {
    get: get,
    reset: reset
  };
}
