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
exports.GeneratedImageEntity = void 0;
const typeorm_1 = require("typeorm");
let GeneratedImageEntity = class GeneratedImageEntity {
};
exports.GeneratedImageEntity = GeneratedImageEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GeneratedImageEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedImageEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedImageEntity.prototype, "prompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GeneratedImageEntity.prototype, "textOverlay", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedImageEntity.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GeneratedImageEntity.prototype, "azureUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'READY' }),
    __metadata("design:type", String)
], GeneratedImageEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 24 }),
    __metadata("design:type", Number)
], GeneratedImageEntity.prototype, "expiresInHours", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GeneratedImageEntity.prototype, "createdAt", void 0);
exports.GeneratedImageEntity = GeneratedImageEntity = __decorate([
    (0, typeorm_1.Entity)('generated_images')
], GeneratedImageEntity);
//# sourceMappingURL=generated-image.entity.js.map