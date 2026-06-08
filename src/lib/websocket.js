class WebSocketManager {
  constructor() {
    this.sockets = {};
    this.listeners = {};
  }

  connect(path, token) {
    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    const url = `${baseUrl}/${path}/?token=${token}`;

    if (this.sockets[path]) {
      this.sockets[path].close();
    }

    const socket = new WebSocket(url);
    this.sockets[path] = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const type = data.type;

      if (this.listeners[type]) {
        this.listeners[type].forEach((callback) => callback(data));
      }
    };

    socket.onclose = () => {
      delete this.sockets[path];
    };

    return socket;
  }

  disconnect(path) {
    if (this.sockets[path]) {
      this.sockets[path].close();
      delete this.sockets[path];
    }
  }

  disconnectAll() {
    Object.keys(this.sockets).forEach((path) => this.disconnect(path));
  }

  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);

    return () => {
      this.listeners[type] = this.listeners[type].filter((cb) => cb !== callback);
    };
  }

  send(path, data) {
    if (this.sockets[path] && this.sockets[path].readyState === WebSocket.OPEN) {
      this.sockets[path].send(JSON.stringify(data));
    }
  }
}

export const wsManager = new WebSocketManager();