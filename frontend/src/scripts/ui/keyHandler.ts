// Shift pressed
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

export default function isShiftPressed(): boolean {
    return shiftPressed;
}
