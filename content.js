const CSS = `
    body {
        background: #000000 !important;
    }
    img {
        cursor: default !important;
    }
`;

const STYLE = makeStyle();

function handleClick(event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
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

updateStyle(CSS);

document.addEventListener("click", handleClick, true);
