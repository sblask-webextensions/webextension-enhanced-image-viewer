const STYLE = makeStyle();
const SIZES = {
    fit:                      "max-width:  100% !important; max-height: 100% !important;",

    fitToWidthUnlessSmaller:  "max-width:  100% !important; width: auto !important; height: auto !important;",
    fitToHeightUnlessSmaller: "max-height: 100% !important; width: auto !important; height: auto !important;",

    fitToWidth:               "width: 100% !important; height: auto !important;",
    fitToHeight:              "width: auto !important; height: 100% !important;",

    noFit:                    "width: auto !important; height: auto !important;",
};

let sizeStates = Object.keys(SIZES);
let currentSizeState = sizeStates[0];

function handleClick(event) {
    if (event.buttons !== 0) {
        return;
    }

    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();

    currentSizeState = sizeStates[(sizeStates.indexOf(currentSizeState) + 1) % sizeStates.length];
    updateStyle(makeCSS());
}

function makeStyle() {
    let style = document.createElement("style");
    style.type = "text/css";
    document.head.appendChild(style);
    return style;
}

function updateStyle(css) {
    while (STYLE.hasChildNodes()) {
        STYLE.removeChild(STYLE.firstChild);
    }

    STYLE.appendChild(document.createTextNode(css));
}

function makeCSS() {
    return `
        body {
            background: #000000 !important;
        }
        img {
            cursor: default !important;
            ${SIZES[currentSizeState]}
        }
    `;
}

updateStyle(makeCSS());

document.addEventListener("click", handleClick, true);
