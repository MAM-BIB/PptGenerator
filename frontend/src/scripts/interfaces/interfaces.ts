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
}

export interface Preset{
    path: string;
    sections: PresetSection[];
}

export interface PresetSection{
    name: string;
    includedSlides: string[];
    ignoredSlides: string[];
}
