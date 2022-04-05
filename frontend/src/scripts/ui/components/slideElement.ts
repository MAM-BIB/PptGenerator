import path from "path";
import { getConfig } from "../../helper/config";
import { Slide } from "../../interfaces/presentation";
import checkForImg from "../controller/imageLoader";

/**
 * This class is used to display and add functionality to the slides inside the sections.
 */
export default class SlideElement {
    public slide: Slide;
    public element: HTMLDivElement;

    constructor(slide: Slide, imgPath?: string) {
        this.element = document.createElement("div") as HTMLDivElement;
        this.slide = slide;
        this.slide.IsSelected = false;
        if (imgPath) {
            this.createSlide(path.join(getConfig().metaPicsPath, imgPath, `${slide.Position + 1}.jpg`));
        } else {
            this.createSlide();
        }
    }

    /**
     * This functions adds th selected class and calls the selected event
     * @returns A boolean if the slide is selected.
     */
    public select(): boolean {
        if (this.slide.IsSelected) {
            return false;
        }

        this.slide.IsSelected = true;
        this.element.classList.add("selected");
        this.element.dispatchEvent(new Event("selected"));
        return true;
    }

    /**
     * This function removes the class selected and calls the deselect event.
     * @returns A boolean if the slide is selected.
     */
    public deselect(): boolean {
        if (!this.slide.IsSelected) {
            return false;
        }

        this.slide.IsSelected = false;
        this.element.classList.remove("selected");
        this.element.dispatchEvent(new Event("deselected"));
        return true;
    }

    /**
     * This functions toggle the selection of a slide
     */
    public toggleSelection() {
        this.slide.IsSelected = !this.slide.IsSelected;
        if (this.slide.IsSelected) {
            this.element.classList.add("selected");
            this.element.dispatchEvent(new Event("selected"));
        } else {
            this.element.classList.remove("selected");
            this.element.dispatchEvent(new Event("deselected"));
        }
    }

    /**
     * This function creates a Slide that will be displayed in the GUI and has all functionalities
     * @param imgSrc The ImgSrc is the Source of the Image
     */
    private createSlide(imgSrc?: string) {
        this.element.classList.add("slide");
        if (this.slide.IsHidden) this.element.classList.add("hidden-slide");
        this.element.textContent = `${this.slide.Title === "" ? "No Title" : this.slide.Title}`;
        this.element.title = `slide:
            title: ${this.slide.Title},
            uid: ${this.slide.Uid},
            position: ${this.slide.Position},
            isHidden: ${this.slide.IsHidden},
            hash: ${this.slide.Hash.substring(0, 19)}...`;

        this.addClickListener();

        if (imgSrc) {
            const img = document.createElement("img");
            img.alt = "";
            img.style.display = "none";
            img.loading = "lazy";
            img.addEventListener("error", () => {
                checkForImg(img, imgSrc, true);
            });
            img.addEventListener("load", () => {
                img.style.display = "";
            });
            checkForImg(img, imgSrc);
            this.element.append(img);
        }

        // function checkForImg(img: HTMLImageElement, src: string, wait = false) {
        //     if (wait || !fs.existsSync(src)) {
        //         // eslint-disable-next-line no-promise-executor-return
        //         new Promise((r) => setTimeout(r, 2000)).then(() => {
        //             checkForImg(img, src);
        //         });
        //     } else {
        //         // eslint-disable-next-line no-promise-executor-return
        //         new Promise((r) => setTimeout(r, 1000)).then(() => {
        //             // eslint-disable-next-line no-param-reassign
        //             img.src = path.resolve(src);
        //         });
        //     }
        // }
    }

    /**
     * Adds the functionality to click a slide
     */
    protected addClickListener() {
        this.element.tabIndex = 0;
        this.element.addEventListener("click", () => {
            this.toggleSelection();
        });
        this.element.addEventListener("keydown", (e) => {
            if ((e as KeyboardEvent).key === "Enter") {
                this.toggleSelection();
            }
        });
    }
}
