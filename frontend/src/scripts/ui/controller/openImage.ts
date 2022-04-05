import { ipcRenderer } from "electron";
import initTitlebar from "../components/titlebar";
import checkForImg from "./imageLoader";

const imageDiv = document.getElementById("image") as HTMLDivElement;

initTitlebar({
    resizable: true,
    menuHidden: true,
});

ipcRenderer.on("data", (event, data) => {
    createImg(data);
});

function createImg(imgSrc: string) {
    const img = document.createElement("img");
    img.alt = "";
    img.style.display = "none";
    img.src = imgSrc;
    img.style.width = "100%";
    img.style.margin = "0";
    img.addEventListener("error", () => {
        checkForImg(img, imgSrc, true);
    });
    img.addEventListener("load", () => {
        img.style.display = "";
    });

    imageDiv.appendChild(img);
}
