const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: import.meta.env.VITE_APP_PROXY_HOST_API,
      changeOrigin: true,
    }),
  );
};
