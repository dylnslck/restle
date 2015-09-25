import Restle from '../../../dist/lib';
import schemas from '../fixtures/restle-schemas';

// FIXME: figure out local Mongo url
const restle = new Restle({
  port: 1337,
  database: 'mongodb://test:test@ds047440.mongolab.com:47440/laddr-dev',
  namespace: '/api',
});

restle.register('person', schemas.person);
restle.register('animal', schemas.animal);
restle.register('computer', schemas.computer);

export default restle;
