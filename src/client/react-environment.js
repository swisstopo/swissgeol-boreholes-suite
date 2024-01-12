const getEnvJsContent = env => {
  var clientEnvVariables = Object.entries(env)
    .filter((key, _) => key.toString().startsWith("REACT_APP_CLIENT_"))
    .map(([key, value]) => [
      key.toString().replace("REACT_APP_CLIENT_", ""),
      value,
    ]);
  return (
    "window.env = " +
    JSON.stringify(Object.fromEntries(clientEnvVariables)) +
    ";"
  );
};

//write file env.js to public folder
const writeEnvJs = () => {
  const fs = require("fs");
  const path = require("path");
  require("dotenv").config();
  fs.writeFileSync(
    path.join(__dirname, "public", "env.js"),
    getEnvJsContent(process.env),
  );
};

module.exports = { getEnvJsContent, writeEnvJs };
