import { SET_BORROWED_NOT_RETURNED_BOOKS, BORROWED_RETURNED }
  from './../actions/types';

// Declare the initial state for borrowing
const initialState = {
  returns: []
};

/**
 * Borrowing Reducer
 *
 * @description Return each action by its type
 *
 * @param {object} state - The state passed to the returnsReducer
 * @param {object} action - The action passed to the returnsReducer
 *
 * @returns {object} - Borrowed/Returned Book(s)
 */
const returnsReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_BORROWED_NOT_RETURNED_BOOKS:
      return { ...state, returns: action.bookList };
    case BORROWED_RETURNED:
      const booksAfterReturning =
      state.returns.filter(borrowedBook => borrowedBook.id !== action.book.id);
      return { ...state, returns: booksAfterReturning };
    default:
      return state;
  }
};

export default returnsReducer;
