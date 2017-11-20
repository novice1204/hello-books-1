import model from '../models';
import helper from '../helpers/index';

const Book = model.Book;

/**
 * @class BookController
 * @description Book operations
 */
class BookController {
  /**
   * @static
   * @description Adds new book to the library
   * @param {object} req
   * @param {object} res
   * @returns {object} //Success, Message & Created book
   * @memberOf BookController
   */
  static create(req, res) {
    // Ensure user has administrative priviledges to create book
    if (!helper.isAdmin(req)) {
      return res.status(403).send({ success: false,
        message: 'Permission Denied' });
    }

    // Validates every input by the user.
    if (!helper.isDefined(req)) {
      return res.status(400).send({ success: false,
        message: 'All fields must exist' });
    }

    // Error(s) is/are outputted if any is pushed to the array
    const { isValid, errors } = helper.inputValidation(req);
    if (!isValid) return res.status(400).send({ success: false, errors });

    // Searches if book exists in the database
    return Book.findOne({
      where: { isbn: req.body.isbn },
    })
      .then((foundBook) => {
        if (foundBook) {
          return res.status(409)
            .send({ success: false,
              message: `Conflict! ${req.body.title} exists already`,
              foundBook });
        }
        // If book does not exist, create new book.
        return Book
          .create({
            isbn: req.body.isbn,
            title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            image: req.body.image,
            status: 1,
            quantity: req.body.quantity,
            categoryId: req.body.category,
          })
          .then((book) => {
            res.status(200).send({ success: true,
              message: `${book.title}, successfully added`,
              book });
          })
          .catch(() => res.status(500).send({
            success: false,
            message: 'Internal Server Error'
          }));
      })
      .catch((err) => res.status(500).send({
        success: false,
        message: err.message
      }));
  }
  /**
   * @static
   * @description Modifies existing book in the library
   * @param {object} req
   * @param {object} res
   * @returns {object} //Success, Message with Updated book
   * @memberOf BookController
   */
  static update(req, res) {
    // Ensure user has administrative priviledges to create book
    if (!helper.isAdmin(req)) {
      return res.status(403).send({ success: false,
        message: 'Permission Denied' });
    }

    // Validates every input by the user.
    if (!helper.isDefined(req)) {
      return res.status(400).send({
        success: false,
        message: 'All fields must exist' });
    }

    // Error(s) is/are outputted if any is pushed to the array
    const { isValid, errors } = helper.inputValidation(req);
    if (!isValid) return res.status(400).send({ success: false, errors });

    // Checks if book exists in the database
    return Book
      .findOne({
        where: {
          id: req.params.bookId,
        },
      })
      .then((book) => {
        if (!book) {
          return res.status(404).send({ success: false,
            message: 'Book not found' });
        }
        // If book exists, update the book.
        return Book
          .update({
            isbn: req.body.isbn,
            title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            image: req.body.image,
            status: 1,
            quantity: req.body.quantity,
            categoryId: req.body.category,
          }, {
            where: {
              id: req.params.bookId,
            },
          })
          .then(() => {
            Book.findById(req.params.bookId).then(newBook =>
              res.status(200).send({ success: true,
                message: `${book.title}` +
                ` successfully updated to ${req.body.title}`,
                old: book,
                book: newBook }),
            );
          })
          .catch(() => res.status(500).send({
            success: true,
            message: 'Internal Server Error'
          }));
      });
  }
  /**
   * @static
   * @description Deletes book from the library
   * @param {object} req
   * @param {object} res
   * @returns {object} // Success either true/false with message
   * @memberOf BookController
   */
  static destroy(req, res) {
    // Ensures user has administrative priviledges to delete book
    if (!helper.isAdmin(req)) {
      return res.status(403).send({
        success: false,
        message: 'Permission Denied'
      });
    }
    // Ensures Book ID is present in the path
    if (req.params.bookId === 'undefined') {
      return res.status(400).send({
        success: false,
        message: 'Ensure book ID is present'
      });
    }
    // Searches for book in the database
    return Book
      .find({
        where: {
          id: req.params.bookId,
        },
      })
      .then((book) => {
        if (!book) {
          return res.status(404).send({
            success: false,
            message: 'Book not found'
          });
        }
        // If book is found, delete
        book.destroy();
        return res.status(200).send({
          success: true,
          message: 'Book successfully deleted',
          book
        });
      })
      .catch(() => res.status(500).send({
        success: false,
        message: 'Internal Server Error'
      }));
  }
  /**
   * @static
   * @description Lists all books in the library
   * @param {object} req
   * @param {object} res
   * @returns {object} // Success, Message and List of books
   * @memberOf BookController
   */
  static list(req, res) {
    const limit = 4; // number of records per page
    const { page } = req.query; // page number
    const offset = limit * (page - 1);
    return Book.findAndCountAll({
      order: [
        ['title', 'ASC'],
      ],
      limit,
      offset,
    })
      .then((books) => {
        const pages = Math.ceil(books.count / limit);
        if (books.rows.length < 1) {
          return res.status(404).send({
            success: false,
            message: 'Books not available, check back later.',
            numberOfPages: 0
          });
        }
        return res.status(200).send({
          success: true,
          books: books.rows,
          numberOfPages: pages
        });
      })
      .catch(() =>
        res.status(400).send({
          success: false,
          message: 'Ooops! something happened,' +
            'check your inputs and try again.'
        }));
  }

  /**
   * @static
   * @description Gets a single book from the database
   * @param {object} req
   * @param {object} res
   * @returns {object} // Success, Message, Found book
   * @memberof BookController
   */
  static findBook(req, res) {
    if (!req.params.bookId || isNaN(req.params.bookId)) {
      return res.status(400).send({
        success: false,
        message: 'Ensure book ID is supplied'
      });
    }
    return Book
      .findOne({
        where: {
          id: req.params.bookId,
        },
      }).then((book) => {
        if (book !== null) {
          return res.status(200).send(book);
        }
        return res.status(404).send({
          success: false,
          message: 'Book not found'
        });
      })
      .catch(() => {
        res.status(500).send({
          success: false,
          message: 'Internal Server Error'
        });
      });
  }

  /**
   * @static
   * @description Gets a single book from the database
   * @param {object} req
   * @param {object} res
   * @returns {object} // Success, Message, Found book
   * @memberof BookController
   */
  static filterBooks(req, res) {
    return Book
      .findAll({
        where: {
          categoryId: req.query.categoryId
        }
      }).then((books) => {
        if (books.length > 0) {
          return res.status(200).send({
            success: true,
            books
          });
        }
        return res.status(404).send({
          success: false,
          message: 'No book(s) in this category',
          books: []
        });
      });
  }
}

export default BookController;
