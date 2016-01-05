/**
 * This utility configures CORS for the Restle app.
 *
 * @todo Make the CORS more configurable via some sort of options object.
 * @private
 * @param {String} name
 * @return {String}
 */
export default (instance) => {
  instance.app.use((req, res, next) => {
    const cors = instance.cors;
    const origin = req.get('origin');

    if (!cors)
      return next();

    const isOriginAllowed = cors === '*' ||
      (Array.isArray(cors) ? cors.indexOf(origin) > -1 : origin === cors);

    if (isOriginAllowed) {
      const allowedHeaders = [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
      ];

      const allowedMethods = [
        'OPTIONS',
        'GET',
        'POST',
        'PATCH',
        'DELETE',
      ];

      res.set('access-control-allow-origin', origin);
      res.set('access-control-allow-headers', allowedHeaders);
      res.set('access-control-allow-methods', allowedMethods);
    }

    if (req.method === 'OPTIONS')
      return res.sendStatus(isOriginAllowed ? 200 : 403);

    return next();
  });
}
