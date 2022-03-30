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

export interface TitlebarOptions {
    resizable?: boolean;
    menuHidden?: boolean;
    title?: string;
    closeBtnMsg?: string;
}
