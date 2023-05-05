const WebSocket = require('ws');
const apiKey = 'd9630c77e9c39a9d828a308ec8eece74';
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
    this.socket.on('error', 
      (err) => {
        console.log(err);
        callback &&callback(err);
      }
    );
  }

  async executeTextToText(text, outputLanguage) {
    console.log({ outputLanguage })
    const dataToSend = `{
      "text": "${text}",
      "languageTo": "${outputLanguage}"
    }`;

    this.socket.send(dataToSend);
    return new Promise((resolve) => {
      this.socket.on('message', (data) => {
        const textData = data.toString();
        console.log(textData);
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


