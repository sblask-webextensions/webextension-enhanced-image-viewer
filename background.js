const OPTION_BACKGROUND_COLOR = "backgroundColor";
const OPTION_SIZE_STATES = "sizeStates";

const OPTION_REMEMBER_LAST_ROTATION = "rememberLastRotation";
const OPTION_REMEMBER_LAST_SIZE_STATE = "rememberLastSizeState";

const AVAILABLE_SIZE_STATES = [
    "fitUnlessSmaller",
    "noFit",
    "fitToHeight",
    "fitToHeightUnlessSmaller",
    "fitToWidth",
    "fitToWidthUnlessSmaller",
];

const IMAGE_FILE_URL = /file:\/\/.+\.(gif|gifv|jpg|jpeg|png|svg|webm)/;

let knownImageURLs = new Set();

browser.storage.local.get([
    OPTION_BACKGROUND_COLOR,
    OPTION_REMEMBER_LAST_ROTATION,
    OPTION_REMEMBER_LAST_SIZE_STATE,
    OPTION_SIZE_STATES,
])
    .then(
        (result) => {
            if (result[OPTION_SIZE_STATES] === undefined) {
                browser.storage.local.set({[OPTION_SIZE_STATES]: AVAILABLE_SIZE_STATES});
            }
            if (result[OPTION_BACKGROUND_COLOR] === undefined) {
                browser.storage.local.set({[OPTION_BACKGROUND_COLOR]: "#000000"});
            }
            if (result[OPTION_REMEMBER_LAST_ROTATION] === undefined) {
                browser.storage.local.set({[OPTION_REMEMBER_LAST_ROTATION]: true});
            }
            if (result[OPTION_REMEMBER_LAST_SIZE_STATE] === undefined) {
                browser.storage.local.set({[OPTION_REMEMBER_LAST_SIZE_STATE]: true});
            }
        }
    );

// not fired for file:// URLs
browser.webRequest.onHeadersReceived.addListener(
    checkForImageURL,
    {
        types: ["main_frame"],
        urls: ["<all_urls>"],
    },
    ["responseHeaders"]
);

browser.webNavigation.onCommitted.addListener(maybeModifyTab);

function checkForImageURL(details) {
    if (knownImageURLs.has(details.url)) {
        return;
    }

    for (let header of details.responseHeaders) {
        if (header.name.toLowerCase() === "content-type" && header.value.indexOf("image/") === 0) {
            knownImageURLs.add(details.url);
            return;
        }
    }
}

function maybeModifyTab(details) {
    if (!knownImageURLs.has(details.url) && !details.url.match(IMAGE_FILE_URL) || details.frameId !== 0) {
        return;
    }

    modifyTab(details.tabId);
}

function modifyTab(tabId) {
    browser.tabs.executeScript(
        tabId,
        {
            file: "browser-polyfill.js",
            runAt: "document_start",
        }
    ).then(
        browser.tabs.executeScript(
            tabId,
            {
                file: "content.js",
                runAt: "document_start",
            }
        ));
}
