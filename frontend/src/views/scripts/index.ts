const sectionContainer = document.querySelector(
    ".presentation-slide-container.left",
) as HTMLElement;

const selectedSectionContainer = document.querySelector(
    ".presentation-slide-container.right",
) as HTMLElement;

interface Slide {
    rlid: string;
    uid: string;
    pos: number;
    isHidden: boolean;
}

interface Section {
    title: string;
    slides: Slide[];
}

function createSection(section: Section): HTMLElement {
    const sectionElement = document.createElement("div");
    sectionElement.classList.add("section");

    const header = document.createElement("h2");
    sectionElement.append(header);
    header.textContent = section.title;
    header.title = `show/hide slides of ${section.title}`;
    header.addEventListener("click", () => {
        sectionElement.classList.toggle("open");
    });

    for (const slide of section.slides) {
        sectionElement.append(createSlide(slide));
    }

    return sectionElement;
}

function createSlide(slide: Slide): HTMLElement {
    const slideElement = document.createElement("div");
    slideElement.classList.add("slide");
    slideElement.textContent = `UID:${slide.uid}`;
    slideElement.title = `slide:
        UID:${slide.uid},
        pos:${slide.pos},
        rlid:${slide.rlid},
        isHidden:${slide.isHidden}`;
    return slideElement;
}

const section: Section = {
    title: "Title 1",
    slides: [
        {
            rlid: "RLSDJN",
            uid: "DFLH8KH5DFSBS4FIA3HBGHJHGJGF",
            pos: 42,
            isHidden: false,
        },
        {
            rlid: "RLSDJN",
            uid: "DFLG7KJ3SDFIASDFSD7GFDSHBKDF",
            pos: 53,
            isHidden: false,
        },
        {
            rlid: "RLSDJN",
            uid: "DFLFDSDJHFO43ZB7DFIASHBGJJGD",
            pos: 2,
            isHidden: false,
        },
    ],
};

sectionContainer.append(createSection(section));
sectionContainer.append(createSection(section));
sectionContainer.append(createSection(section));
sectionContainer.append(createSection(section));
sectionContainer.append(createSection(section));

selectedSectionContainer.append(createSection(section));
selectedSectionContainer.append(createSection(section));
selectedSectionContainer.append(createSection(section));
selectedSectionContainer.append(createSection(section));

console.log("Hello world!");
