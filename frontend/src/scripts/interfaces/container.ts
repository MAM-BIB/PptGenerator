import { Slide } from "./presentation";

export interface SlideWithPath {
    slide: Slide;
    path: string;
}

export interface UidsWithSlides {
    [uid: string]: SlideWithPath[];
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

export interface ScanData {
    newSlides: SlideWithPath[];
    updateUids: { [uid: string]: SlideWithPath[] };
}
