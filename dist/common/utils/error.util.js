"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeErrorMessage = safeErrorMessage;
function safeErrorMessage(err) {
    if (!err)
        return '❌ Error desconocido';
    if (err instanceof Error)
        return err.message;
    if (typeof err === 'string')
        return err;
    if (err?.response?.data?.error?.message)
        return err.response.data.error.message;
    if (err?.response?.data?.message)
        return err.response.data.message;
    if (err?.message)
        return err.message;
    return '⚠️ Error no serializable';
}
//# sourceMappingURL=error.util.js.map