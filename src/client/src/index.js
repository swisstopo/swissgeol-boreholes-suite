import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import './index.css';
import 'ol/ol.css';
import App from './App';
// import { unregister as unregisterServiceWorker } from './registerServiceWorker';

import 'semantic-ui-css/semantic.css';

import store from './reducers';

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <App />
    </Provider>
  </I18nextProvider>,
  document.getElementById('root')
);
// unregisterServiceWorker();
