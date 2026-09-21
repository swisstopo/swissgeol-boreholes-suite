declare const __BDMS_INITIAL_BRANCH__: string;

// Narrows the variables this app reads out of Vite's env, which is otherwise indexed as `any`.
interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
}
