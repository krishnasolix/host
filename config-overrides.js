var path = require("path");
const { dependencies } = require("./package.json");
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;

const { override, babelInclude } = require("customize-cra");

module.exports = function (config, env) {
  config.plugins.push(
    new ModuleFederationPlugin(
      (module.exports = {
        name: "host",
        remotes: {
          remote: `promise new Promise(resolve => {
            // This part depends on how you plan on hosting and versioning your federated modules
            const remoteUrlWithVersion = "http://localhost:3001/remoteEntry.js"
            const script = document.createElement('script')
            script.src = remoteUrlWithVersion
  
            script.onload = () => {
              // the injected script has loaded and is available on window
              // we can now resolve this Promise
              const proxy = {
                get: (request) => {
                  // Note the name of the module
                  return window.remote.get(request);
                },
                init: (arg) => {
                  try {
                    // Note the name of the module
                    return window.remote.init(arg)
                  } catch(e) {
                    console.log('remote container already initialized')
                  }
                }
              }
              resolve(proxy)
            }
            script.onerror = (error) => {
              console.error('error loading remote container')
              const proxy = {
                get: (request) => {
                  console.error(error)
                  // If the service is down it will render this content
                  return Promise.resolve(() => () => 'contactSales');
                },
                init: (arg) => {
                  console.log(arg);
                  return;
                }
              }
              resolve(proxy)
            }
            // inject this script with the src set to the versioned remoteEntry.js
            document.head.appendChild(script);
          })
          `,
        },
        shared: {
          ...dependencies,
          react: {
            singleton: true,
            requiredVersion: dependencies["react"],
          },
          "react-dom": {
            singleton: true,
            requiredVersion: dependencies["react-dom"],
          },
        },
      })
    )
  );
  config.output.publicPath = "auto";
  return Object.assign(
    config,
    override(
      babelInclude([
        /* transpile (converting to es5) code in src/ and shared component library */
        path.resolve("src"),
        path.resolve("../remote/src/components"),
      ])
    )(config, env)
  );
};
