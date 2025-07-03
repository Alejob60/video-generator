"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const dotenv = __importStar(require("dotenv"));
const common_1 = require("@nestjs/common");
async function bootstrap() {
    dotenv.config();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public', 'videos'), {
        prefix: '/videos/',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public/audio'), {
        prefix: '/audio/',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public/subtitles'), {
        prefix: '/subtitles/',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public/uploads'), {
        prefix: '/uploads/',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public/avatars'), {
        prefix: '/avatars/',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public/campaigns'), {
        prefix: '/campaigns/',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public/image'), {
        prefix: '/image/',
    });
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`🎬 Microservicio de video escuchando en http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map