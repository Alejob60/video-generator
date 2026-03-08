export declare enum ExtractionMode {
    FULL = "full",
    VISUAL = "visual",
    CONTENT = "content",
    STRUCTURE = "structure"
}
export declare class ExtractWebsiteDnaDto {
    url: string;
    html_structure?: string;
    extraction_mode?: ExtractionMode;
    plan: string;
    screenshot_base64?: string;
}
