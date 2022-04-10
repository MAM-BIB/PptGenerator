export interface Preset {
    path: string;
    sections: PresetSection[];
    placeholders: Placeholder[];
}

export interface PresetSection {
    name: string;
    includedSlides: { uid: string; position: number }[];
    ignoredSlides: string[];
}

export interface Placeholder {
    name: string;
    value: string;
}
