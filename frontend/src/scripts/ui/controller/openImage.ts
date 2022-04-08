import { ipcRenderer } from "electron";
import initTitlebar from "../components/titlebar";
import checkForImg from "../../helper/imageLoader";

const imageDiv = document.getElementById("image") as HTMLDivElement;

initTitlebar({
    resizable: true,
    menuHidden: true,
});

/**
 * This will be called when the window opens
 */
ipcRenderer.on("data", (event, data) => {
    createImg(data);
});

/**
 * This function create the Image
 * @param imgSrc The ImgSrc is the Source of the Image
 */
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
