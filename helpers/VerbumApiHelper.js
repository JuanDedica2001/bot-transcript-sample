const WebSocket = require('ws');
const apiKey = 'deea639f9a49012ada9577105056e490';
const webSocketUrl = 'wss://verbumapi.onemeta.ai:3001/ws/';


class VerbumApiHelper {
  constructor() {
    this.socket = new WebSocket(webSocketUrl + apiKey, {
      rejectUnauthorized: false
    });
  }

  onOpen(callback) {
    this.socket.on('open', callback);
  }

  onClose(callback) {
    this.socket.on('close', callback);
  }

  onError(callback) {
    this.socket.on('error', callback);
  }

  async executeTextToText(text, outputLanguage) {
    console.log({text})
    const dataToSend = `{
      "text": "${text}",
      "languageTo": "${outputLanguage}"
    }`;

    this.socket.send(dataToSend);
    return new Promise((resolve) => {
      this.socket.on('message', (data) => {
        const textData = data.toString();
        resolve(textData);
      });
    });

  }

  close() {
    this.socket.close();
  }
}


module.exports = {
  VerbumApiHelper
}


