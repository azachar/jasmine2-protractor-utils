// Type definitions for protractor-screenshoter-plugin
// Project: https://github.com/azachar/protractor-screenshoter-plugin
// Definitions by: Sebastian Peischl <https://github.com/seopei>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/**
 * Add a new browser instance
 * @param name name of the browser instance
 * @param skipImageToAscii disable generating ASCII images (optional, default: false)
 * @returns {*} browser instance
 */
export declare function addScreenshotBrowser(name:string):any;

/**
 * Remove a browser instance
 * @param name browser name to remove
 */
export declare function removeScreenshotBrowser(name:string):any;

/**
 * Remove all browser instances (cleanup)
 */
export declare function removeAllScreenshotBrowsers():void;
