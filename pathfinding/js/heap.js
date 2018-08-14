// https://github.com/mbostock
export function minHeap(compare) {
  var array = [];
  var size = 0;

  function up(value, i) {
    while (i > 0) {
      var j = ((i + 1) >> 1) - 1;
      var parent = array[j];
      if (compare(value, parent) >= 0) break;
      array[i] = parent;
      array[i = j] = value;
    }
  }

  function down(value, i) {
    while (true) {
      var r = (i + 1) << 1;
      var l = r - 1;
      var j = i;
      var child = array[j];
      if (l < size && compare(array[l], child) < 0) child = array[j = l];
      if (r < size && compare(array[r], child) < 0) child = array[j = r];
      if (j === i) break;
      array[i] = child;
      array[i = j] = value;
    }
  }

  return {
    empty() {
      return !size;
    },

    push(value) {
      up(array[size] = value, size++);
      return size;
    },

    pop() {
      if (size <= 0) return;
      var removed = array[0], value;
      if (--size > 0) value = array[size], down(array[0] = value, 0);
      return removed;
    },
  };
}
