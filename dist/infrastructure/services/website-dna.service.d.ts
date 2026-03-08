import { ExtractWebsiteDnaDto } from '../../interfaces/dto/extract-website-dna.dto';
export declare class WebsiteDnaService {
    private readonly logger;
    private readonly openai;
    constructor();
    extractDna(dto: ExtractWebsiteDnaDto, userId: string): Promise<any>;
    private scrapeWebsiteContent;
    private getSystemPrompt;
    private getUserPrompt;
    private getModeDescription;
    private parseAndValidateDnaResponse;
}
