import { BadRequestError, ConflictError } from 'restle-error';

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

  if (req.params.id !== req.body.data.id) {
    const conflictError = new ConflictError({
      first: req.params.id,
      second: req.body.data.id,
    });

    return {
      status: conflictError.status,
      json: conflictError.serialize(),
    }
  }
}
