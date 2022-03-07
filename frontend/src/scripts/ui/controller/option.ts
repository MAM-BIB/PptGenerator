import { ipcRenderer } from "electron";

const cancelBtn = document.querySelector(".cancel-btn") as HTMLButtonElement;
console.log(cancelBtn);

// If the Cancel Button is clicked then he give a message to the menu.ts ipcMain
cancelBtn.addEventListener("click", (e) => {
    console.log("Click");
    ipcRenderer.invoke("closeFocusedWindow");
});
