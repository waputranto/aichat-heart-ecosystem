/**
 * AlPipe service stub
 *
 * This module provides a simple AI response generation layer for the current
 * backend. It is intentionally isolated so we can later plug in a proper AI
 * provider or chatbot pipeline without changing the main Express routes.
 */

async function generateAiResponse(message) {
  const normalized = message.trim();

  if (!normalized) {
    return 'Harap masukkan pesan yang valid untuk menerima respons AI.';
  }

  // Placeholder response logic.
  // Replace this with real AI integration when AlPipe is available.
  return `AlPipe memproses permintaan Anda: "${normalized}". Sistem ini akan segera diupdate dengan AI cerdas untuk membantu manajemen inventaris.`;
}

module.exports = {
  generateAiResponse,
};
