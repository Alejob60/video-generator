// src/types/queue-message.interface.ts

export interface QueueVideoMessage {
  jobId: string;             // 🆔 ID del job en Sora
  audioId: number;           // 🎧 ID del audio generado (si aplica)
  script: string;            // 📝 Libreto generado por IA
  prompt?: string;           // 🧠 Prompt original (opcional)
  n_seconds?: number;        // ⏱️ Duración deseada del video
  narration?: boolean;       // 🔊 ¿Incluir narración TTS?
  subtitles?: boolean;       // 💬 ¿Incluir subtítulos?
}
