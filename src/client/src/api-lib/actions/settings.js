import {
  downloadFilePost,
  downloadFile,
  fetch,
  uploadFile
} from './index';

import store from '../reducers';

export function loadSettings(){
  return fetch(
    '/setting',
    {
      type: 'GET'
    }
  );
}

export function patchSettings(tree, value, key=null){
  const payload = {
    type: 'PATCH',
    tree: tree,
    value: value
  };
  if (key !== null){
    payload.key = key;
  }
  const state = store.getState();
  // Exclude guest from sending settings patch
  if (
    state &&
    state.hasOwnProperty('core_user') &&
    state.core_user.authentication !== null &&
    state.core_user.authentication.username === 'guest'
  ) {
    return {
      path: '/setting',
      ...payload
    };
  } else {
    return fetch('/setting', payload);
  }
}

export function patchEditorSettings(tree, value, key=null){
  const payload = {
    type: 'EPATCH',
    tree: tree,
    value: value
  };
  if (key !== null){
    payload.key = key;
  }
  return fetch('/setting', payload);
}

export function exportDatabase(workgroups){
  return downloadFilePost(
    '/setting/export',
    {
      action: 'EXPORT',
      workgroup: workgroups
    }
  );
}

export function exportDatabaseStatus(){
  return fetch(
    '/setting/export',
    {
      action: 'EXPORT_STATUS'
    }
  );
}

export function exportDatabaseCancel(){
  return fetch(
    '/setting/export',
    {
      action: 'EXPORT_CANCEL'
    }
  );
}

export function exportDatabaseAsync(workgroups){
  return fetch(
    '/setting/export',
    {
      action: 'DATABASE.EXPORT',
      workgroup: workgroups
    }
  );
}

export function exportDownload(params) {
  return downloadFile(
    '/setting/export/download', params
  );
};

export function exportDatabaseById(ids) {
  return downloadFilePost(
    '/setting/export',
    {
      action: 'EXPORT_BY_ID',
      ids: ids
    }
  );
}

export function importDatabaseWorkgroup(id, file) {
  return uploadFile(
    '/setting/import',
    {
      action: 'IMPORT_INTO_WORKGROUP',
      id: id
    },
    file
  );
}

export function importDatabaseSupplier(id, file) {
  return uploadFile(
    '/setting/import',
    {
      action: 'IMPORT_INTO_SUPPLIER',
      id: id
    },
    file
  );
}

export function importDatabaseNewSupplier(name, file) {
  return uploadFile(
    '/setting/import',
    {
      action: 'IMPORT_INTO_NEW_SUPPLIER',
      name: name
    },
    file
  );
}
