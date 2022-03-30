// Adds event listener if the shift key is pressend
let shiftPressed = false;

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
