import { Config } from "@remotion/cli/config";

// The bundled headless shell hangs on this Mac; the installed Chrome works.
Config.setBrowserExecutable("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
Config.setChromeMode("chrome-for-testing");
