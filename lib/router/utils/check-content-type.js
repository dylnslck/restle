/**
 * Checks to whether the request content-type header is www.jsonapi.org.
 *
 * @private
 * @param {Object} req
 * @return {Boolean}
 */
export default function checkContentType(req) {
  return req.get('content-type') === 'application/vnd.api+json';
}
