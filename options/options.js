const BACKGROUND_COLOR = "backgroundColor";
const SIZE_STATES = "sizeStates";

function restoreOptions() {
    browser.storage.local.get([
        BACKGROUND_COLOR,
        SIZE_STATES,
    ]).then(
        result => {
            for (let state of result[SIZE_STATES]) {
                document.getElementById(state).checked = true;
            }
            document.getElementById("backgroundColor").value = result[BACKGROUND_COLOR];
        }
    );
}

function enableAutosave() {
    for (let input of document.querySelectorAll("input:not([type=radio]):not([type=checkbox]), textarea")) {
        input.addEventListener("input", saveOptions);
    }
    for (let input of document.querySelectorAll("input[type=radio], input[type=checkbox]")) {
        input.addEventListener("change", saveOptions);
    }
}

function loadTranslations() {
    for (let element of document.querySelectorAll("[data-i18n]")) {
        if (typeof browser === "undefined") {
            element.textContent = element.getAttribute("data-i18n");
        } else {
            element.textContent = browser.i18n.getMessage(element.getAttribute("data-i18n"));
        }
    }
}

function saveOptions(event) {
    event.preventDefault();

    let sizeStates = [].map.call(document.querySelectorAll("#modes input:checked"), (node) => node.id);
    if (sizeStates.length == 0)
        sizeStates = [document.querySelector("#modes input").id];

    browser.storage.local.set({
        [BACKGROUND_COLOR]: document.getElementById("backgroundColor").value,
        [SIZE_STATES]: sizeStates,
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.addEventListener("DOMContentLoaded", enableAutosave);
document.addEventListener("DOMContentLoaded", loadTranslations);
document.querySelector("form").addEventListener("submit", saveOptions);

browser.storage.onChanged.addListener(restoreOptions);
