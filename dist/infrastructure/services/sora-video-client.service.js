"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SoraVideoClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoraVideoClientService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let SoraVideoClientService = SoraVideoClientService_1 = class SoraVideoClientService {
    constructor() {
        this.logger = new common_1.Logger(SoraVideoClientService_1.name);
        this.endpoint = process.env.SORA_VIDEO_URL;
    }
    async requestVideo(prompt, duration) {
        const body = {
            prompt,
            n_seconds: duration,
            height: 720,
            width: 1280,
            n_variants: 1,
        };
        try {
            this.logger.log(`🎥 Enviando solicitud a microservicio Sora con prompt mejorado:\n${prompt}`);
            const response = await axios_1.default.post(`${this.endpoint}/video/generate`, body, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const { job_id, generation_id, video_url, file_name, duration } = response.data;
            if (!video_url || !job_id || !generation_id) {
                this.logger.error(`❌ Respuesta incompleta desde Sora: ${JSON.stringify(response.data)}`);
                throw new Error('La respuesta del microservicio Sora no contiene los campos esperados.');
            }
            this.logger.log(`✅ Video generado exitosamente: ${video_url}`);
            return {
                job_id,
                generation_id,
                video_url,
                file_name,
                duration,
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                this.logger.error('❌ Axios error al contactar Sora:', error.response?.data || error.message);
            }
            else if (error instanceof Error) {
                this.logger.error('❌ Error al contactar Sora:', error.message);
            }
            else {
                this.logger.error('❌ Error desconocido al contactar Sora:', error);
            }
            throw new Error('Error al generar video en el microservicio Sora.');
        }
    }
};
exports.SoraVideoClientService = SoraVideoClientService;
exports.SoraVideoClientService = SoraVideoClientService = SoraVideoClientService_1 = __decorate([
    (0, common_1.Injectable)()
], SoraVideoClientService);
//# sourceMappingURL=sora-video-client.service.js.map