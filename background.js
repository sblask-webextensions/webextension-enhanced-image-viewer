const OPTION_BACKGROUND_COLOR = "backgroundColor";
const OPTION_SIZE_STATES = "sizeStates";

const OPTION_REMEMBER_LAST_ROTATION = "rememberLastRotation";
const OPTION_REMEMBER_LAST_SIZE_STATE = "rememberLastSizeState";

const AVAILABLE_SIZE_STATES = [
    "fitUnlessSmaller",
    "noFit",
    "fit",
    "fitToHeight",
    "fitToHeightUnlessSmaller",
    "fitToWidth",
    "fitToWidthUnlessSmaller",
];

const IMAGE_FILE_OR_DATA_URL = /(file:\/\/.+\.(gif|gifv|jpg|jpeg|png|svg|webm)|(data:image\/.+))/;

const KNOWN_IMAGE_URL_SESSION_KEY = "known-image-url";

const MESSAGE_GET_ZOOM = "getZoom";
const MESSAGE_ZOOM_CHANGED = "zoomChanged";

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

// browser.tabs.getZoom is not available in content scripts, make it accessible through messages
browser.runtime.onMessage.addListener(getZoom);
function getZoom(message, sender) {
    if (
        sender.id !== browser.runtime.id
        || message.type !== MESSAGE_GET_ZOOM
        || sender.tab?.id === undefined
    ) {
        return undefined;
    }

    return browser.tabs.getZoom(sender.tab.id);
}
browser.tabs.onZoomChange.addListener(notifyZoomChanged);
function notifyZoomChanged({tabId, newZoomFactor}) {
    browser.tabs.sendMessage(tabId, {
        type: MESSAGE_ZOOM_CHANGED,
        zoomFactor: newZoomFactor,
    }).catch(() => {
        // The tab does not contain this extension's content script.
    });
}

function getKnownImageURLStorageKey(url) {
    return `${KNOWN_IMAGE_URL_SESSION_KEY}:${url}`;
}

async function checkForImageURL(details) {
    for (const header of details.responseHeaders) {
        if (header.name.toLowerCase() === "content-type" && header.value.indexOf("image/") === 0) {
            const storageKey = getKnownImageURLStorageKey(details.url);
            await browser.storage.session.set({[storageKey]: true});
            return;
        }
    }
}

async function isKnownImageURL(url) {
    const storageKey = getKnownImageURLStorageKey(url);
    const result = await browser.storage.session.get(storageKey);
    return result[storageKey] === true;
}

async function maybeModifyTab(details) {
    if (details.frameId !== 0) {
        return;
    }

    if (!await isKnownImageURL(details.url) && !details.url.match(IMAGE_FILE_OR_DATA_URL)) {
        return;
    }

    const target = {tabId: details.tabId};
    try {
        await browser.scripting.insertCSS({
            target,
            files: ["content-scripts/content.css"],
        });
        await browser.scripting.executeScript({
            target,
            files: ["content-scripts/content.js"],
            injectImmediately: true,
        });
    } catch (error) {
        console.warn(`Unable to enhance ${details.url}`, error);
    }
}
