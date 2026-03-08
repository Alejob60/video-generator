"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractWebsiteDnaDto = exports.ExtractionMode = void 0;
const class_validator_1 = require("class-validator");
var ExtractionMode;
(function (ExtractionMode) {
    ExtractionMode["FULL"] = "full";
    ExtractionMode["VISUAL"] = "visual";
    ExtractionMode["CONTENT"] = "content";
    ExtractionMode["STRUCTURE"] = "structure";
})(ExtractionMode || (exports.ExtractionMode = ExtractionMode = {}));
class ExtractWebsiteDnaDto {
}
exports.ExtractWebsiteDnaDto = ExtractWebsiteDnaDto;
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: 'La URL debe ser válida' }),
    (0, class_validator_1.Length)(1, 2048, { message: 'La URL no puede exceder 2048 caracteres' }),
    __metadata("design:type", String)
], ExtractWebsiteDnaDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La estructura HTML debe ser una cadena de texto' }),
    __metadata("design:type", String)
], ExtractWebsiteDnaDto.prototype, "html_structure", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ExtractionMode, {
        message: `Modo de extracción inválido. Valores permitidos: ${Object.values(ExtractionMode).join(', ')}`
    }),
    __metadata("design:type", String)
], ExtractWebsiteDnaDto.prototype, "extraction_mode", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El plan es requerido' }),
    (0, class_validator_1.IsEnum)(['FREE', 'CREATOR', 'PRO'], {
        message: 'Plan inválido. Valores permitidos: FREE, CREATOR, PRO'
    }),
    __metadata("design:type", String)
], ExtractWebsiteDnaDto.prototype, "plan", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExtractWebsiteDnaDto.prototype, "screenshot_base64", void 0);
//# sourceMappingURL=extract-website-dna.dto.js.map