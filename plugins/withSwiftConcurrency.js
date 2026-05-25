const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SWIFT_CONCURRENCY_FIX = `
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
    end
  end`;

function withSwiftConcurrency(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let podfile = fs.readFileSync(podfilePath, "utf-8");

      if (!podfile.includes("SWIFT_STRICT_CONCURRENCY")) {
        podfile = podfile.replace(
          /(post_install do \|installer\|)/,
          `$1${SWIFT_CONCURRENCY_FIX}`,
        );
        fs.writeFileSync(podfilePath, podfile);
      }

      return config;
    },
  ]);
}

module.exports = withSwiftConcurrency;
