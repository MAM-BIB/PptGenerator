import { ipcRenderer } from "electron";

const cancelBtn = document.querySelector(".cancel-btn") as HTMLButtonElement;

// Send a message to the main-process if the cancel-button is clicked.
cancelBtn.addEventListener("click", () => {
    ipcRenderer.invoke("closeFocusedWindow");
});
