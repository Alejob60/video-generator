// 📁 src/types/video-generation-options.ts

export interface VideoGenerationOptions {
  prompt: string;             // 🧠 Prompt original ingresado por el usuario
  script: string;             // 📝 Libreto mejorado por IA (transformado por LLM)
  image: string | null;       // 🖼️ Imagen base (nombre del archivo) si el usuario subió una
  useVoice: boolean;          // 🔊 ¿Generar narración TTS?
  useSubtitles: boolean;      // 💬 ¿Generar subtítulos automáticos?
  useMusic: boolean;          // 🎵 ¿Agregar música de fondo? (pendiente versión 2)
  useSora: boolean;           // 🎥 ¿Usar Sora para generar el video base?
  plan: string;               // 💼 Plan del usuario actual (FREE, CREATOR, PRO, etc.)
  n_seconds: number;          // ⏱️ Duración deseada del video en segundos
  userId?: string;            // 🆔 ID del usuario autenticado (opcional para auditoría)
  timestamp?: number;         // 🕒 Timestamp de la solicitud
}
