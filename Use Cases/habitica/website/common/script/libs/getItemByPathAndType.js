import get from 'lodash/get';
import content from '../content';

export default function getItemByPathAndType (type, path) {
  let item = get(content, path);

  if (type === 'timeTravelersStable') {
    const [, animalType, key] = path.split('.');

    item = {
      key,
      type: animalType,
    };
  }

  return item;
}
