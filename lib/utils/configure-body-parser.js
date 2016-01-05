import bodyParser from 'body-parser';

export default ({ app } = instance) => {
  // enable JSON api specification
  app.use(bodyParser.json({ type: 'application/*+json' }));

  // TODO: determine if this should be allowed
  app.use(bodyParser.urlencoded({ extended: true }));
}
