/* exported createPool */

function createPool( Constructor ) {
  'use strict';

  const pool = [];
  let count = 0;
  let length = 0;

  function get() {
    if ( count === length ) {
      const object = new Constructor();
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
    get,
    reset,
  };
}
