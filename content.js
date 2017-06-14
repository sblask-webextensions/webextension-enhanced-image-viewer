const IMAGE = document.getElementsByTagName("img")[0];

const STYLE = makeStyle();
const INFO = makeInfo();

const SIZES = {
    fitUnlessSmaller: {
        css: "max-width: 100%; max-height: 100%;",
        description: "Fit to browser window unless smaller",
    },

    fitToWidthUnlessSmaller: {
        css: "max-width: 100%; width: auto; height: auto;",
        description: "Fit to width unless smaller",
    },
    fitToHeightUnlessSmaller: {
        css: "max-height: 100%; width: auto; height: auto;",
        description: "Fit to height unless smaller",
    },

    fitToWidth: {
        css: "width: 100%; height: auto;",
        description: "Fit to width",
    },
    fitToHeight: {
        css: "width: auto; height: 100%;",
        description: "Fit to height",
    },

    noFit: {
        css: "width: auto; height: auto;",
        description: "Natural size",
    },
};

let infoTimeout = undefined;

let justGainedFocus = false;

let sizeStates = Object.keys(SIZES);
let currentSizeState = sizeStates[0];

function handleClick(event) {
    if (event.buttons !== 0) {
        return;
    }

    if (justGainedFocus) {
        justGainedFocus = false;
        return;
    }

    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();

    currentSizeState = sizeStates[(sizeStates.indexOf(currentSizeState) + 1) % sizeStates.length];

    updateStyle();
    showInfo();
}

function handleKey(event)  {
    if (event.ctrlKey) {
        return;
    }

    switch (event.key) {
        case "i":
            toggleInfo();
    }
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
}

function makeInfo() {
    let info = document.createElement("div");
    info.id = "info";
    document.body.appendChild(info);
    return info;
}

function showInfo() {
    if (infoTimeout) {
        clearTimeout(infoTimeout);
        infoTimeout = undefined;
    }

    let text = "";
    text += SIZES[currentSizeState].description;
    text += " ";
    text += `(${IMAGE.naturalWidth}x${IMAGE.naturalHeight} to ${IMAGE.width}x${IMAGE.height})`;

    INFO.textContent = text;
    INFO.classList.add("show");

    infoTimeout = setTimeout(
        function() {
            clearTimeout(infoTimeout);
            INFO.classList.remove("show");
        },

        2000
    );
}

function toggleInfo() {
    if (infoTimeout) {
        clearTimeout(infoTimeout);
        infoTimeout = undefined;
    }

    INFO.classList.toggle("show");
}

function makeCSS() {
    return `
    body {
        background: #000000;
    }
    img {
        cursor: default;
        ${SIZES[currentSizeState].css}
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
    #info.show {
        opacity: 1;
    }
    `.replace(/;/g, "!important;");
}

updateStyle();
showInfo();

document.addEventListener("click", handleClick, true);
document.addEventListener("keyup", handleKey);

window.addEventListener("focus", () => { justGainedFocus = true; }, true);
