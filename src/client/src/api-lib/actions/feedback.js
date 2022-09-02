import {
  fetch
} from './index';

export function createFeedback(message, tag) {
  return fetch(
    '/feedback',
    {
      "action": 'CREATE',
      "message": message,
      "tag": tag
    }
  );
}
