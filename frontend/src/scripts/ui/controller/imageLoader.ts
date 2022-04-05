import fsBase from "fs";
import path from "path";

export default function checkForImg(img: HTMLImageElement, src: string, wait = false) {
    if (wait || !fsBase.existsSync(src)) {
        // eslint-disable-next-line no-promise-executor-return
        new Promise((r) => setTimeout(r, 2000)).then(() => {
            checkForImg(img, src);
        });
    } else {
        // eslint-disable-next-line no-promise-executor-return
        new Promise((r) => setTimeout(r, 1000)).then(() => {
            // eslint-disable-next-line no-param-reassign
            img.src = path.resolve(src);
        });
    }
}
