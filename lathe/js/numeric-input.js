/* eslint-env es6 */
/* exported createNumericInput */
const createNumericInput = (() => {
  'use strict';

  /*
    In order:

      - Optional minus sign.
      - Any number of digits.
      - Optional decimal separator.
      - Any number of digits.

    Note: This will accept the empty string, '-', '.', and '-.'.
   */
  const NUMBER_REGEX = /^-?\d*\.?\d*$/;

  const UP = 38;
  const DOWN = 40;

  function round( number, precision ) {
    return parseFloat( number.toFixed( precision ) );
  }

  function isModified( event, modifiers ) {
    return [ 'shiftKey', 'ctrlKey', 'altKey', 'metaKey' ].every( modifier => {
      if ( modifiers.includes( modifier ) ) {
        return event[ modifier ];
      }

      return !event[ modifier ];
    });
  }

  function expandSelection( string, range, callback ) {
    let [ start, end ] = range;

    while ( start > 0 && callback( string.slice( start - 1, end ) ) ) {
      start--;
    }

    while ( end < string.length && callback( string.slice( start, end + 1 ) ) ) {
      end++;
    }

    return [ start, end ];
  }

  return function create( input ) {
    function onInput( event ) {
      let step;

      // Check modifier keys.
      if ( isModified( event, [ 'ctrlKey' ] ) ) {
        step = 1;
      } else if ( isModified( event, [ 'altKey' ] ) ) {
        step = 0.1;
      } else if ( isModified( event, [ 'altKey', 'metaKey' ] ) ) {
        step = 10;
      } else {
        return;
      }

      if ( event.keyCode === DOWN ) {
        step = -step;
      } else if ( event.keyCode !== UP ) {
        return;
      }

      // Calculate selection range of number.
      const range = expandSelection(
        input.value,
        [ input.selectionStart, input.selectionEnd ],
        string => NUMBER_REGEX.test( string )
      );

      // Calculate new number.
      const number = parseFloat( input.value.slice( range[0], range[1] ) );
      if ( isNaN( number ) ) {
        return;
      }

      const numberString = String( round( number + step, 6 ) );

      // Insert number string into current string.
      input.value = (
        input.value.slice( 0, range[0] ) +
        numberString +
        input.value.slice( range[1] )
      );

      // Highlight current number.
      input.setSelectionRange( range[0], range[0] + numberString.length );

      // Force update on input event.
      event.preventDefault();
      input.dispatchEvent( new Event( 'input' ) );
    }

    input.addEventListener( 'keydown', onInput );

    return function destroy() {
      input.removeEventListener( 'keydown', onInput );
    };
  };
})();