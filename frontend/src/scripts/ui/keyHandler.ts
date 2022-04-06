import { getConfig, setConfig } from "../helper/config";

// Adds event listener if the shift key is pressed
let shiftPressed = false;

let ctrlPressed = false;

document.addEventListener("keydown", (event) => {
    if (event.key === "Shift") {
        shiftPressed = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
        shiftPressed = false;
    }
});

/**
 * This function checks if shift is pressed.
 * @returns A boolean if shift is pressed
 */
export default function isShiftPressed(): boolean {
    return shiftPressed;
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Control") {
        ctrlPressed = true;
    }
});

document.addEventListener("focusout", () => {
    shiftPressed = false;
    ctrlPressed = false;
    setConfig(getConfig());
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Control") {
        ctrlPressed = false;
        setConfig(getConfig());
    }
});

export function addZoomListener() {
    setImgSize();
    document.addEventListener("wheel", (event) => {
        if (ctrlPressed) {
            getConfig().imgZoom = Math.min(Math.max(getConfig().imgZoom + event.deltaY * -0.1, 0), 100);
            setImgSize();
        }
    });
}

function setImgSize() {
    const root = document.documentElement;
    if (getConfig().imgZoom < 10) {
        root.style.setProperty("--hide", "none");
    } else {
        root.style.setProperty("--hide", "block");
    }
    root.style.setProperty("--zoom", `${getConfig().imgZoom}%`);
}
