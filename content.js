const OPTION_BACKGROUND_COLOR = "backgroundColor";
const OPTION_SIZE_STATES = "sizeStates";

const OPTION_LAST_ROTATION = "lastRotation";
const OPTION_REMEMBER_LAST_ROTATION = "rememberLastRotation";

const OPTION_LAST_SIZE_STATE = "lastSizeState";
const OPTION_REMEMBER_LAST_SIZE_STATE = "rememberLastSizeState";

const IMAGE = document.getElementsByTagName("img")[0];

const STYLE = makeStyle();
const INFO = makeInfo();
const SCROLLBAR_WIDTH = getScrollbarWidth();

const SIZES = {
    fitUnlessSmaller: {
        cssOriginalOrientation: () => { return " img { max-width: 100%;  max-height: 100%; }"; },
        cssChangedOrientation:  () => { return getRotatedCSS(...getFitDimensions(true)); },
        description: browser.i18n.getMessage("fitUnlessSmaller"),
    },

    noFit: {
        cssOriginalOrientation: () => { return ""; },
        cssChangedOrientation:  () => { return getRotatedCSS(IMAGE.naturalWidth, IMAGE.naturalHeight, window.innerWidth, window.innerHeight); },
        description: browser.i18n.getMessage("noFit"),
    },

    fitToWidthUnlessSmaller: {
        cssOriginalOrientation: () => { return "body { display: flex; height: 100%; } img { max-width: 100%; position: unset; }"; },
        cssChangedOrientation:  () => { return getRotatedCSS(...getFitToWidthDimensions(true)); },
        description: browser.i18n.getMessage("fitToWidthUnlessSmaller"),
    },

    fitToWidth: {
        cssOriginalOrientation: () => { return "body { display: flex; height: 100%; } img { width: 100%; position: unset; }"; },
        cssChangedOrientation:  () => { return getRotatedCSS(...getFitToWidthDimensions()); },
        description: browser.i18n.getMessage("fitToWidth"),
    },

    fitToHeightUnlessSmaller: {
        cssOriginalOrientation: () => { return "img { max-height: 100%; }"; },
        cssChangedOrientation:  () => { return getRotatedCSS(...getFitToHeightDimensions(true)); },
        description: browser.i18n.getMessage("fitToHeightUnlessSmaller"),
    },

    fitToHeight: {
        cssOriginalOrientation: () => { return "img { height: 100%; }"; },
        cssChangedOrientation:  () => { return getRotatedCSS(...getFitToHeightDimensions()); },
        description: browser.i18n.getMessage("fitToHeight"),
    },
};

let justGainedFocus = false;

let backgroundColor = undefined;
let rotation = undefined;
let sizeStates = undefined;
let currentSizeState = undefined;

function handleClick(event) {
    if (event.button !== 0) {
        return;
    }

    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();

    if (justGainedFocus) {
        justGainedFocus = false;
        return;
    }

    currentSizeState = sizeStates[(sizeStates.indexOf(currentSizeState) + 1) % sizeStates.length];
    browser.storage.local.set({[OPTION_LAST_SIZE_STATE]: currentSizeState});
}

function handleKey(event)  {
    if (event.ctrlKey) {
        return;
    }

    switch (event.key) {
        case "i":
            toggleInfo();
            break;
        case "r":
            rotation = (rotation + 90 + 360) % 360;
            browser.storage.local.set({[OPTION_LAST_ROTATION]: rotation});
            break;
        case "l":
            rotation = (rotation - 90 + 360) % 360;
            browser.storage.local.set({[OPTION_LAST_ROTATION]: rotation});
            break;
    }
}

function getFitDimensions(maxNatural=false) {
    let [newImageWidth, newImageHeight, viewportWidth, viewportHeight] = getFitToWidthDimensions(maxNatural);

    if (newImageWidth > window.innerHeight) {
        [newImageWidth, newImageHeight, viewportWidth, viewportHeight] = getFitToHeightDimensions(maxNatural);
    }

    return [newImageWidth, newImageHeight, viewportWidth, viewportHeight];
}

function getFitToWidthDimensions(maxNatural=false) {
    function newHeight(viewportWidth) {
        if (maxNatural) {
            return Math.min(IMAGE.naturalHeight, viewportWidth);
        } else {
            return viewportWidth;
        }
    }

    let ratio = IMAGE.naturalWidth / IMAGE.naturalHeight;

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    let newImageHeight = newHeight(viewportWidth);
    let newImageWidth = newImageHeight * ratio;

    if (newImageWidth > viewportHeight) {
        viewportWidth = viewportWidth - SCROLLBAR_WIDTH;
        newImageHeight = newHeight(viewportWidth);
        newImageWidth = newImageHeight * ratio;
    }

    return [newImageWidth, newImageHeight, viewportWidth, viewportHeight];
}

function getFitToHeightDimensions(maxNatural=false) {
    function newWidth(viewportHeight) {
        if (maxNatural) {
            return Math.min(IMAGE.naturalWidth, viewportHeight);
        } else {
            return viewportHeight;
        }
    }

    let ratio = IMAGE.naturalWidth / IMAGE.naturalHeight;

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    let newImageWidth = newWidth(viewportHeight);
    let newImageHeight = newImageWidth / ratio;

    if (newImageHeight > viewportWidth) {
        viewportHeight = viewportHeight - SCROLLBAR_WIDTH;
        newImageWidth = newWidth(viewportHeight);
        newImageHeight = newImageWidth / ratio;
    }

    return [newImageWidth, newImageHeight, viewportWidth, viewportHeight];
}

function getScrollbarWidth() {
    let css = `
        .scrollbar-measure {
            height: 100px;
            overflow: scroll;
            position: absolute;
            top: -9999px;
            width: 100px;
        }
    `;

    let style = makeStyle();
    style.appendChild(document.createTextNode(css));

    let div = document.createElement("div");
    div.className = "scrollbar-measure";
    document.body.appendChild(div);

    let scrollbarWidth = div.offsetWidth - div.clientWidth;

    document.body.removeChild(div);
    document.head.removeChild(style);
    return scrollbarWidth;
}

function makeStyle() {
    let style = document.createElement("style");
    style.type = "text/css";
    document.head.appendChild(style);
    return style;
}

function updateStyle() {
    while (STYLE.hasChildNodes()) {
        STYLE.removeChild(STYLE.firstChild);
    }

    STYLE.appendChild(document.createTextNode(makeCSS()));

    updateInfo();
}

function makeInfo() {
    let info = document.createElement("div");
    info.id = "info";
    info.classList.add("delayed");
    document.body.appendChild(info);

    return info;
}

function updateInfo() {
    let text = "";
    text += SIZES[currentSizeState].description;
    text += " ";
    text += `(${IMAGE.naturalWidth}x${IMAGE.naturalHeight} to ${IMAGE.width}x${IMAGE.height})`;

    INFO.textContent = text;
}

function toggleInfo() {
    INFO.classList.remove("delayed");
    INFO.classList.toggle("show");
}

function makeCSS() {
    let cssOverride = SIZES[currentSizeState].cssOriginalOrientation();

    if (rotation === 90 || rotation === 270) {
        cssOverride = SIZES[currentSizeState].cssChangedOrientation();
    }

    return `
    body {
        background: ${backgroundColor};
    }
    img {
        cursor: default;
        height: auto;
        margin: auto;
        position: absolute;
        transform-origin: center;
        transform: perspective(999px) rotate(${rotation}deg);
        width: auto;
    }
    #info {
        background: black;
        border-radius: 15px;
        border: 2px solid #555;
        color: white;
        opacity: 0;
        padding: 5px 10px;
        position: fixed;
        right: 20px;
        top: 20px;
        transition: opacity .5s ease-in-out;
    }
    #info.delayed {
        transition-delay: 2s;
    }
    #info.show {
        opacity: 1;
    }
    ${cssOverride}
    `.replace(/;/g, "!important;");
}

function getRotatedCSS(newImageWidth, newImageHeight, viewportWidth, viewportHeight) {
    let rotationAdjust = Math.abs(newImageHeight - newImageWidth) / 2;
    let horizontalSpace = Math.max(0, (viewportWidth  - newImageHeight) / 2);
    let verticalSpace   = Math.max(0, (viewportHeight - newImageWidth)  / 2);
    if (newImageHeight > newImageWidth) {
        return `
            img {
                height: ${newImageHeight}px;
                left:   ${ rotationAdjust + horizontalSpace}px;
                margin: 0;
                top:    ${-rotationAdjust + verticalSpace}px;
            }
        `;
    } else {
        return `
            img {
                height: ${newImageHeight}px;
                left:   ${-rotationAdjust + horizontalSpace}px;
                margin: 0;
                top:    ${ rotationAdjust + verticalSpace}px;
            }
        `;
    }
}

function onPreferencesChanged(changes) {
    browser.storage.local.get([
        OPTION_LAST_SIZE_STATE,
        OPTION_REMEMBER_LAST_SIZE_STATE,
    ]).then(
        (result) => {
            if (changes[OPTION_BACKGROUND_COLOR]) {
                backgroundColor = changes[OPTION_BACKGROUND_COLOR].newValue;
            }
            if (changes[OPTION_LAST_ROTATION]) {
                rotation = changes[OPTION_LAST_ROTATION].newValue;
            }

            if (changes[OPTION_SIZE_STATES]) {
                let lastSizeState = changes[OPTION_LAST_SIZE_STATE] ?
                    changes[OPTION_LAST_SIZE_STATE].newValue : result[OPTION_LAST_SIZE_STATE];
                let rememberLastSizeState = changes[OPTION_REMEMBER_LAST_SIZE_STATE] ?
                    changes[OPTION_REMEMBER_LAST_SIZE_STATE].newValue : result[OPTION_REMEMBER_LAST_SIZE_STATE];

                sizeStates = changes[OPTION_SIZE_STATES].newValue;
                if (rememberLastSizeState && sizeStates.indexOf(lastSizeState) >= 0) {
                    currentSizeState = lastSizeState;
                } else {
                    currentSizeState = sizeStates[0];
                    browser.storage.local.set({[OPTION_LAST_SIZE_STATE]: currentSizeState});
                }
            }
            updateStyle();
        }
    );
}

function initFromPreferences() {
    browser.storage.local.get([
        OPTION_BACKGROUND_COLOR,
        OPTION_LAST_ROTATION,
        OPTION_LAST_SIZE_STATE,
        OPTION_REMEMBER_LAST_ROTATION,
        OPTION_REMEMBER_LAST_SIZE_STATE,
        OPTION_SIZE_STATES,
    ]).then(
        (result) => {
            backgroundColor = result[OPTION_BACKGROUND_COLOR];
            sizeStates = result[OPTION_SIZE_STATES];

            if (result[OPTION_REMEMBER_LAST_SIZE_STATE] && sizeStates.indexOf(result[OPTION_LAST_SIZE_STATE]) >= 0) {
                currentSizeState = result[OPTION_LAST_SIZE_STATE];
            } else {
                currentSizeState = sizeStates[0];
                browser.storage.local.set({[OPTION_LAST_SIZE_STATE]: currentSizeState});
            }

            if (result[OPTION_REMEMBER_LAST_ROTATION] && result[OPTION_LAST_ROTATION] !== undefined) {
                rotation = result[OPTION_LAST_ROTATION];
            } else {
                rotation = 0;
                browser.storage.local.set({[OPTION_LAST_ROTATION]: rotation});
            }

            updateStyle();
        }
    );
}

browser.storage.onChanged.addListener(onPreferencesChanged);
initFromPreferences();

document.addEventListener("click", handleClick, true);
document.addEventListener("keyup", handleKey);

window.addEventListener("focus", () => { justGainedFocus = true; }, true);
window.addEventListener("resize", updateStyle, true);
