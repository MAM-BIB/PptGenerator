export interface Presentation {
    Path: string;
    Sections: Section[];
}

export interface Section {
    Name: string;
    Slides: Slide[];
}

export interface Slide {
    RelationshipId: string;
    Uid: string;
    Position: number;
    Title: string;
    IsHidden: boolean;
    IsSelected: boolean;
    Placeholders: string[];
}

// Config interfaces
export interface PresentationMaster {
    lang: string;
    paths: string[];
}

export interface Config {
    metaJsonPath: string;
    metaPicsPath: string;
    coreApplication: string;
    presetPath: string;
    presentationMasters: PresentationMaster[];
    ignoreHiddenSlides: boolean;
    basePath: string;
    defaultExportPath: string;
    backupPath: string;
    showTutorial: boolean;
}

export interface Preset {
    path: string;
    sections: PresetSection[];
    placeholders: Placeholder[];
}

export interface PresetSection {
    name: string;
    includedSlides: string[];
    ignoredSlides: string[];
}

export interface PopupOptions {
    title?: string;
    heading?: string;
    text?: string;
    primaryButton?: string;
    primaryTooltip?: string;
    secondaryButton?: string;
    secondaryTooltip?: string;
    answer?: boolean | string;
}

export interface Placeholder {
    name: string;
    value: string;
}

export interface TitlebarOptions {
    resizable?: boolean;
    menuHidden?: boolean;
    title?: string;
    closeBtnMsg?: string;
}

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
