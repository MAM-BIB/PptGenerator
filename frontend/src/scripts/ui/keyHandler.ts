// Adds event listener if the shift key is pressend
let shiftPressed = false;
let ctrlPressed = false;
let zoom = 100;
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

document.addEventListener("wheel", (event) => {
    const root = document.documentElement;
    if (ctrlPressed) {
        zoom = Math.min(Math.max(zoom + event.deltaY * 0.1, 0), 100);
        root.style.setProperty("--zoom", `${zoom}%`);
    }
});
