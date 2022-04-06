import { getConfig, setConfig } from "../helper/config";

const config = getConfig();
// Adds event listener if the shift key is pressed
let shiftPressed = false;

let ctrlPressed = false;
let zoom = config.imgZoom;

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

document.addEventListener("keyup", (event) => {
    if (event.key === "Control") {
        ctrlPressed = false;
    }
});

export function addZoomListener() {
    setImgSize();
    document.addEventListener("wheel", (event) => {
        if (ctrlPressed) {
            zoom = Math.min(Math.max(zoom + event.deltaY * -0.1, 0), 100);
            setImgSize();
            config.imgZoom = zoom;
            setConfig(config);
        }
    });
}

function setImgSize() {
    const root = document.documentElement;
    if (zoom < 10) {
        root.style.setProperty("--hide", "none");
    } else {
        root.style.setProperty("--hide", "block");
    }
    root.style.setProperty("--zoom", `${zoom}%`);
}
