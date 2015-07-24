import parseModelName from '../../utils/parse-model-name';
import _ from 'lodash';

// TODO: error handling for bad type
export default function(router, type) {
  const fields = router.fields;
  const modelName = parseModelName(type);

  return _.keys(fields[modelName].relationships).join(' ');
}
