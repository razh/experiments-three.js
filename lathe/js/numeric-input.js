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
    return Number( number.toFixed( precision ) );
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
    function getDirection( event ) {
      if ( event.keyCode === UP ) {
        return 1;
      } else if ( event.keyCode === DOWN ) {
        return -1;
      } else if ( event.type === 'wheel' ) {
        return Math.sign( event.deltaY );
      }

      return 0;
    }

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

      step *= getDirection( event );
      if ( !step ) {
        return;
      }

      // Calculate selection range of first number.
      const range = expandSelection(
        input.value,
        [ input.selectionStart, input.selectionStart ],
        string => NUMBER_REGEX.test( string )
      );

      // Calculate new number.
      const number = parseFloat( input.value.slice( range[0], range[1] ) );
      if ( isNaN( number ) ) {
        return;
      }

      const numberString = String( round( number + step, 6 ) );

      // Highlight first number.
      input.setSelectionRange( range[0], range[1] );

      // Insert number string into selection.
      document.execCommand( 'insertText', false, numberString );

      // Highlight current selection.
      input.setSelectionRange( range[0], range[0] + numberString.length );

      // Force default arrow-key actions.
      event.preventDefault();
    }

    input.addEventListener( 'keydown', onInput );
    input.addEventListener( 'wheel', onInput );

    return function destroy() {
      input.removeEventListener( 'keydown', onInput );
      input.removeEventListener( 'wheel', onInput );
    };
  };
})();
