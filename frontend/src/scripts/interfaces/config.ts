export interface PresentationMaster {
    lang: string;
    paths: string[];
}

export interface Config {
    metaJsonPath: string;
    metaPicsPath: string;
    coreApplication: string;
    picsApplication: string;
    presetPath: string;
    presentationMasters: PresentationMaster[];
    ignoreHiddenSlides: boolean;
    basePath: string;
    defaultExportPath: string;
    backupPath: string;
    showTutorial: boolean;
    imgZoom: number;
}
