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
}
