import axios from 'axios';

const botToken = '7350032544:AAG9w7OxVesnNISo_zntiGYjiCPSq2lQOv4';
const chatId = '-1002173130256'; // ID del grupo de Telegram
const defaultImageUrl = 'https://pbs.twimg.com/media/Fz4hsZrXwAA6lG4.jpg';

/**
 * Envía un mensaje a un grupo de Telegram con una imagen opcional.
 * @param {string} message - El texto del mensaje.
 * @param {string} photoUrl - URL de la imagen a enviar (opcional).
 * @param {number} threadId - ID del hilo en Telegram (opcional).
 * @returns {Promise<void>} - Promesa que resuelve cuando el mensaje es enviado.
 */
export const sendTelegramMessage = async (message, photoUrl = defaultImageUrl, threadId) => {
  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;

  try {
    await axios.post(telegramApiUrl, {
      chat_id: chatId,
      photo: photoUrl,
      caption: message,
      message_thread_id: threadId,
    });
    console.log('Mensaje enviado correctamente a Telegram.');
  } catch (error) {
    console.error('Error al enviar mensaje a Telegram:', error);
    throw error;
  }
};
