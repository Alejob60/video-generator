"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfluencerModule = void 0;
const common_1 = require("@nestjs/common");
const service_bus_service_1 = require("../services/service-bus.service");
const mock_influencer_service_1 = require("../services/mock-influencer.service");
const influencer_service_1 = require("../../application/services/influencer.service");
const influencer_controller_1 = require("../../interfaces/controllers/influencer.controller");
const influencer_queue_consumer_service_1 = require("../services/influencer-queue-consumer.service");
let InfluencerModule = class InfluencerModule {
};
exports.InfluencerModule = InfluencerModule;
exports.InfluencerModule = InfluencerModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [
            influencer_controller_1.InfluencerController,
        ],
        providers: [
            influencer_service_1.InfluencerService,
            mock_influencer_service_1.MockInfluencerService,
            service_bus_service_1.ServiceBusService,
            influencer_queue_consumer_service_1.InfluencerQueueConsumerService,
            common_1.Logger,
        ],
        exports: [
            influencer_service_1.InfluencerService,
            mock_influencer_service_1.MockInfluencerService,
        ],
    })
], InfluencerModule);
//# sourceMappingURL=influencer.module.js.map