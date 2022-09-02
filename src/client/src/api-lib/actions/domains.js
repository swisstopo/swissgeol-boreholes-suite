import {
  fetch
} from './index';

export function loadDomains(){
  return fetch(
    '/borehole/codes',
    {
      type: 'LIST'
    }
  );
}

export function patchCodeConfig(tree, value, key=null){
  const payload = {
    type: 'PATCH',
    tree: tree,
    value: value
  };
  if (key !== null){
    payload.key = key;
  }
  return fetch('/borehole/codes', payload);
}
