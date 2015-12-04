import { BadRequestError, ConflictError } from 'restle-error';
import parseModelName from '../../utils/parse-model-name';

/**
 * Checks if the incoming request data is not conflicting.
 *
 * @private
 * @param {Object} req
 * @return {Boolean}
 */
export default function checkPost(req, res) {
  if (!(req.body && req.body.data && req.body.data.type)) {
    const badRequestError = new BadRequestError({
      detail: `A primary data object with a matching type key is required when creating a resource.`,
    });

    return {
      status: badRequestError.status,
      json: badRequestError.serialize(),
    }
  }

  if (parseModelName(req.body.data.type) !== parseModelName(req.params.type)) {
    const conflictError = new ConflictError({
      first: parseModelName(req.body.data.type),
      second: parseModelName(req.params.type),
    });

    return {
      status: conflictError.status,
      json: conflictError.serialize(),
    }
  }
}
