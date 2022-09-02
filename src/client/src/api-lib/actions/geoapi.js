import {
  fetch
} from './index';

export function loadMunicipalities(){
  return fetch(
    '/geoapi/municipality',
    {
      type: 'LIST'
    }
  );
}

export function getMunicipality(id){
  return fetch(
    '/geoapi/municipality',
    {
      action: 'GET',
      id: id
    }
  );
}

export function loadCantons(){
  return fetch(
    '/geoapi/canton',
    {
      type: 'LIST'
    }
  );
}

export function getCanton(id){
  return fetch(
    '/geoapi/canton',
    {
      action: 'GET',
      id: id
    }
  );
}

export function getWmts(language = 'en'){
  return fetch(
    '/geoapi/wmts',
    {
      action: 'WMTS_GETCAPABILITIES',
      params: {
        lang: language
      }
    }, 'get'
  );
};

// export function getWms(language = 'en', auth = null){
export function getWms(language = 'en', url){
  return fetch(
    '/geoapi/wms/swisstopo',
    {
      action: 'WMS_GETCAPABILITIES',
      params: {
        lang: language,
        name: 'swisstopo',
        url: url
      }
    }, 'get'//, auth 
  );
};
