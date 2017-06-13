const IMAGE_FILE_URL = /file:\/\/.+\.(gif|gifv|jpg|jpeg|png|svg|webm)/;

let knownImageURLs = new Set();

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
            file: "content.js",
            runAt: "document_start",
        }
    );
}
