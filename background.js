const BACKGROUND_COLOR = "backgroundColor";
const SIZE_STATES = "sizeStates";

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
    BACKGROUND_COLOR,
    SIZE_STATES,
])
    .then(
        (result) => {
            if (result[SIZE_STATES] === undefined) {
                browser.storage.local.set({[SIZE_STATES]: AVAILABLE_SIZE_STATES});
            }
            if (result[BACKGROUND_COLOR] === undefined) {
                browser.storage.local.set({[BACKGROUND_COLOR]: "#000000"});
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
