const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/v1",
    createProxyMiddleware({
      target: process.env.REACT_APP_PROXY_HOST_API_v1,
      changeOrigin: true,
    })
  );

  app.use(
    "/api/v2",
    createProxyMiddleware({
      target: process.env.REACT_APP_PROXY_HOST_API_v2,
      changeOrigin: true,
    })
  );
};
