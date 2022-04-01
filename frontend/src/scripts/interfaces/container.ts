import { Slide } from "./presentation";

export interface PathWithSlides {
    slide: Slide;
    path: string;
}

export interface UidsWithSlides {
    [uid: string]: PathWithSlides[];
}

export interface SlidesWithPath {
    path: string;
    slides: Slide[];
}

export interface DuplicatedUids {
    uid?: UidsWithSlides;
    existingUids?: string[];
    answer?: boolean | string;
}
