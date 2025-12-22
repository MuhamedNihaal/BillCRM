module.exports = {
  apps: [
    {
      name: "server",
      script: "index.js",
      node_args: [
        "--import",
        "data:text/javascript,import { register } from 'node:module'; import { pathToFileURL } from 'node:url'; register('./alias-loader.mjs', pathToFileURL('./'));",
      ],
      watch: false,
    },
  ],
};
