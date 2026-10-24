const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA = {
  users: [],
  buyerProfiles: [],
  manufacturers: [],
  requirements: [],
  quotes: [],
  samples: [],
  orders: [],
  reviews: [],
  verificationChecks: [],
  disputes: [],
  auditLogs: []
};

class DatabaseStore {
  constructor() {
    this.data = { ...INITIAL_DATA };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = { ...INITIAL_DATA, ...JSON.parse(fileContent) };
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('DB init warning, using memory store:', err.message);
      this.data = { ...INITIAL_DATA };
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB to file:', err.message);
    }
  }

  collection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return {
      find: (filter = {}) => {
        return this.data[name].filter(item => {
          return Object.entries(filter).every(([k, v]) => {
            if (v === undefined) return true;
            if (typeof v === 'object' && v !== null) {
              if (v.$lte !== undefined && item[k] > v.$lte) return false;
              if (v.$gte !== undefined && item[k] < v.$gte) return false;
              if (v.$in !== undefined && (!Array.isArray(item[k]) ? !v.$in.includes(item[k]) : !item[k].some(x => v.$in.includes(x)))) return false;
              return true;
            }
            if (Array.isArray(item[k])) {
              return item[k].includes(v);
            }
            return item[k] === v;
          });
        });
      },
      findOne: (filter = {}) => {
        return this.collection(name).find(filter)[0] || null;
      },
      findById: (id) => {
        return this.data[name].find(item => item._id === id || item.id === id) || null;
      },
      create: (doc) => {
        const newDoc = {
          _id: doc._id || uuidv4(),
          ...doc,
          createdAt: doc.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.data[name].push(newDoc);
        this.save();
        return newDoc;
      },
      findByIdAndUpdate: (id, updateDoc) => {
        const index = this.data[name].findIndex(item => item._id === id || item.id === id);
        if (index === -1) return null;
        this.data[name][index] = {
          ...this.data[name][index],
          ...updateDoc,
          updatedAt: new Date().toISOString()
        };
        this.save();
        return this.data[name][index];
      },
      findByIdAndDelete: (id) => {
        const index = this.data[name].findIndex(item => item._id === id || item.id === id);
        if (index === -1) return null;
        const deleted = this.data[name].splice(index, 1)[0];
        this.save();
        return deleted;
      },
      count: (filter = {}) => {
        return this.collection(name).find(filter).length;
      },
      clear: () => {
        this.data[name] = [];
        this.save();
      }
    };
  }

  logAudit({ actorId, entityType, entityId, action, before = null, after = null }) {
    this.collection('auditLogs').create({
      actorId,
      entityType,
      entityId,
      action,
      before,
      after
    });
  }
}

const db = new DatabaseStore();
module.exports = db;
