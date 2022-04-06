import { Slide } from "./presentation";

export interface SlideWithPath {
    slide: Slide;
    path: string;
}

export interface SlideWithPathAndImg {
    slide: Slide;
    path: string;
    imgPath: string;
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
    newSlides: SlideWithPathAndImg[];
    updateUids: { [uid: string]: SlideWithPathAndImg[] };
}

export interface SlidesMapMap {
    [inPath: string]: SlidesMap;
}

export interface SlidesMap {
    [outPath: string]: Slide[];
}
