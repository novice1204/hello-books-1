import model from '../models';
import helper from '../helpers/index';

const Category = model.Category;

/**
 *
 */
class CatController {
  /**
   *
   *
   * @static
   * @description Adds new category to the library
   * @param {any} req
   * @param {any} res
   * @returns
   *
   * @memberOf CatController
   */
  static create(req, res) {
    // Ensure user has administrative priviledges to create book
    if (!helper.isAdmin(req)) {
      return res.status(403).send({ success: false, message: 'Permission Denied' });
    }

    // Error(s) is/are outputted if any
    if (req.body.title === (undefined || null || '') || /^\s+$/.test(req.body.title)) {
      return res.status(400).send({ success: false, message: 'All fields must exist' });
    }

    // Searches if Category exists in the database
    return Category.findOne({
      where: { title: req.body.title },
    })
      .then((foundCat) => {
        if (foundCat) {
          return res.status(409).send({ success: false, messsage: `Conflict! ${req.body.title} exists already`, foundCat });
        }
        // If book does not exist, create new book.
        return Category
          .create({
            title: req.body.title,
          })
          .then((category) => {
            res.status(200).send({ success: true, message: `${category.title}, successfully added` });
          })
          .catch(error => res.send(error.message));
      })
      .catch(error => res.send(error.message));
  }
}

export default CatController;
