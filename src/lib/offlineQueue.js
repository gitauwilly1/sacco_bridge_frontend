// src/lib/offlineQueue.js

import { openDB } from 'idb';

const DB_NAME = 'sacco-bridge-offline';
const DB_VERSION = 1;

let db;

async function getDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('queue')) {
          const store = database.createObjectStore('queue', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('status', 'status');
          store.createIndex('createdAt', 'createdAt');
        }
        if (!database.objectStoreNames.contains('cache')) {
          database.createObjectStore('cache', { keyPath: 'key' });
        }
      },
    });
  }
  return db;
}

export const offlineQueue = {
  async add(mutation) {
    const database = await getDB();
    await database.add('queue', {
      ...mutation,
      status: 'pending',
      createdAt: Date.now(),
      retryCount: 0,
    });
  },

  async getAll() {
    const database = await getDB();
    return database.getAllFromIndex('queue', 'status');
  },

  async getPending() {
    const database = await getDB();
    const all = await database.getAllFromIndex('queue', 'status');
    return all.filter((item) => item.status === 'pending');
  },

  async markComplete(id) {
    const database = await getDB();
    const item = await database.get('queue', id);
    if (item) {
      item.status = 'completed';
      await database.put('queue', item);
    }
  },

  async markFailed(id, error) {
    const database = await getDB();
    const item = await database.get('queue', id);
    if (item) {
      item.status = 'failed';
      item.error = error;
      item.retryCount = (item.retryCount || 0) + 1;
      await database.put('queue', item);
    }
  },

  async remove(id) {
    const database = await getDB();
    await database.delete('queue', id);
  },

  async clearCompleted() {
    const database = await getDB();
    const all = await database.getAllFromIndex('queue', 'status');
    const completed = all.filter((item) => item.status === 'completed');
    for (const item of completed) {
      await database.delete('queue', item.id);
    }
  },

  async getPendingCount() {
    const pending = await this.getPending();
    return pending.length;
  },

  async processQueue() {
    if (!navigator.onLine) return;
    
    const pending = await this.getPending();
    for (const item of pending) {
      try {
        const { method, url, data } = item;
        const { default: apiClient } = await import('./apiClient');
        
        let response;
        if (method === 'POST') {
          response = await apiClient.post(url, data);
        } else if (method === 'PATCH') {
          response = await apiClient.patch(url, data);
        } else if (method === 'DELETE') {
          response = await apiClient.delete(url, data);
        }
        
        await this.markComplete(item.id);
      } catch (error) {
        if (item.retryCount >= 3) {
          await this.markFailed(item.id, error.message);
        } else {
          await this.markFailed(item.id, error.message);
        }
      }
    }
  },
};

export const offlineCache = {
  async set(key, data) {
    const database = await getDB();
    await database.put('cache', {
      key,
      data,
      timestamp: Date.now(),
    });
  },

  async get(key) {
    const database = await getDB();
    const cached = await database.get('cache', key);
    if (!cached) return null;
    
    // Check if cache is expired (30 minutes)
    if (Date.now() - cached.timestamp > 30 * 60 * 1000) {
      await database.delete('cache', key);
      return null;
    }
    
    return cached.data;
  },

  async remove(key) {
    const database = await getDB();
    await database.delete('cache', key);
  },

  async clear() {
    const database = await getDB();
    await database.clear('cache');
  },
};

// Listen for online/offline events to process queue
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineQueue.processQueue();
  });
}