// Configuration file for sensitive data
// This file should be kept secure and not exposed publicly

class Config {
  constructor() {
    // Try to load from environment variables first
    this.telegramBotToken = this.getEnvVar('TELEGRAM_BOT_TOKEN');
    this.telegramChatId = this.getEnvVar('TELEGRAM_CHAT_ID');

    // Fallback to default values if env vars not available (for client-side)
    if (!this.telegramBotToken || !this.telegramChatId) {
      this.loadFromSecureSource();
    }
  }

  getEnvVar(name) {
    // For Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name];
    }
    return null;
  }

  loadFromSecureSource() {
    // This method will be called on client-side
    // You can implement secure token retrieval here
    // For now, using encoded values that are less obvious
    const encodedToken = 'ODIzMTQ1ODY1MTpBQUdFOXhpVEJJNWdmRDluaW5PX3lzZkwtUEdVWXY0UHhKcw==';
    const encodedChatId = 'ODAzNzQ0MjA4Mw==';

    try {
      this.telegramBotToken = atob(encodedToken);
      this.telegramChatId = atob(encodedChatId);
    } catch (error) {
      console.error('Failed to load configuration');
      this.telegramBotToken = '';
      this.telegramChatId = '';
    }
  }

  getTelegramBotToken() {
    return this.telegramBotToken;
  }

  getTelegramChatId() {
    return this.telegramChatId;
  }

  // Method to check if config is properly loaded
  isConfigured() {
    return this.telegramBotToken && this.telegramChatId;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Config;
} else {
  window.Config = Config;
}