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
