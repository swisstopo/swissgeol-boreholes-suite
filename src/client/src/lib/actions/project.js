import {
  fetch
} from './index';

export function loadProjects(page = undefined, limit = undefined, filter = undefined){
  return fetch(
    '/borehole/project',
    {
      type: 'LIST',
      page: page,
      limit: limit,
      ...filter
    }
  );
}

export function createProject(name){
  return fetch(
    '/borehole/project',
    {
      action: 'CREATE',
      name: name
    }
  );
}
