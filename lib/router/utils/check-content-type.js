export default function(req) {
  return req.get('content-type') === 'application/vnd.api+json';
}
