import axios from 'axios';
import store from '../../src/index';

const SET_BOOKS = 'SET_BOOKS';
const ADD_BOOK = 'ADD_BOOK';
const BOOK_DELETED = 'BOOK_DELETED';
const BOOK_UPDATED = 'BOOK_UPDATED';

const token = localStorage.getItem('jwtToken');

function setBooks(books) {
  return {
    type: SET_BOOKS,
    books,
  };
}

function addBook(book) {
  return {
    type: ADD_BOOK,
    book,
  };
}

function deleteSuccess(bookId) {
  return {
    type: BOOK_DELETED,
    bookId,
  };
}

export function gameUpdated(book) {
  return {
    type: BOOK_UPDATED,
    book,
  };
}

function fetchBooks() {
  return ((dispatch) => {
    axios.get('/api/v1/books', { 'x-access-token': token })
      .then((res) => {
        dispatch(setBooks(res.data));
      })
      .catch(err => err);
  });
}

function saveBook(data) {
  return axios.post('/api/v1/books', data, { 'x-access-token': token })
    .then((res) => {
      store.dispatch(addBook(res.data.book));
      return { res: res.data, isDone: true };
    })
    .catch(err =>
      ({ errors: err.response.data, isDone: false }),
    );
}

function updateBook(data) {
  return axios
    .put(`/api/v1/books/${data.id}`, data)
    .then((res) => {
      store.dispatch(gameUpdated(res.data.book));
      return {
        isDone: true,
        result: res.data,
      };
    })
    .catch(err => ({ hasError: true, result: err.response.data }),
    );
}

function deleteBook(dataId) {
  axios.delete(`/api/v1/books/${dataId}`, { 'x-access-token': token })
    .then((res) => {
      store.dispatch(deleteSuccess(res.data.book.id));
    })
    .catch(err => err);
}

export {
  fetchBooks,
  setBooks,
  saveBook,
  deleteBook,
  updateBook,
  BOOK_DELETED,
  BOOK_UPDATED,
  SET_BOOKS,
  ADD_BOOK,
};
