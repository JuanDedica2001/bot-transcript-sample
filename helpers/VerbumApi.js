const WebSocket = require('ws');
const apiKey = '85f6a18bb6b9d46a32653f3a2cd4663b';
const webSocketUrl = 'wss://verbumapi.onemeta.ai:3001/ws/';


class VerbumApiHelper {
  constructor() {
    this.socket = new WebSocket(webSocketUrl + apiKey);
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

  executeTextToText(text, outputLanguage) {
    const dataToSend = `{
      "text": "${text}",
      "languageTo": "${outputLanguage}"
    }`;
    this.socket.send(dataToSend);
  }

  close() {
    this.socket.close();
  }
}

export default VerbumApiHelper;














