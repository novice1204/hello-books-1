import { setCurrentPage } from '../actions/bookActions';

/**
 * Get paginated data from the server
 *
 * @description An helper function for getting
 *
 * data from the database in a paginated format
 *
 * @param {object} getData
 * @param {number} pageId
 * @param {number} userId
 * @param {boolean} notify
 *
 * @returns {object} // Returns the number of pages and the page ID
 */
const paginate = (getData, pageId, userId, notify) =>
  (dispatch) => {
    if (pageId === null || pageId === undefined) pageId = 1;
    return getData(pageId, userId, notify)
      .then((getDataResponse) => {
        const { numberOfPages } = getDataResponse;
        const pages = Array.from(Array(numberOfPages)).map((e, i) => i + 1);
        const pageDetails = { pages, pageId };
        dispatch(setCurrentPage(pageDetails));
      });
  };

export default paginate;
