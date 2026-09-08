import bcrypt from 'bcryptjs';

// In-Memory Document Store Fallback for resilient zero-dependency execution
class MemoryCollection {
  constructor(name, defaultData = []) {
    this.name = name;
    this.data = [...defaultData];
  }

  generateId() {
    return 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }

  matches(doc, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;

    for (const key in filter) {
      if (key === '$or') {
        const anyMatch = filter.$or.some(subFilter => this.matches(doc, subFilter));
        if (!anyMatch) return false;
        continue;
      }

      const filterVal = filter[key];
      const docVal = doc[key];

      if (filterVal && typeof filterVal === 'object') {
        if (filterVal.$in && Array.isArray(filterVal.$in)) {
          if (!filterVal.$in.includes(docVal)) return false;
        } else if (filterVal.$gte !== undefined) {
          if (new Date(docVal) < new Date(filterVal.$gte)) return false;
        } else if (filterVal.$exists !== undefined) {
          const exists = docVal !== undefined && docVal !== null;
          if (exists !== filterVal.$exists) return false;
        }
      } else if (docVal !== filterVal) {
        // Match stringified _id or id
        if ((key === '_id' || key === 'id') && String(doc._id || doc.id) === String(filterVal)) {
          continue;
        }
        return false;
      }
    }
    return true;
  }

  async countDocuments(filter = {}) {
    return this.data.filter(d => this.matches(d, filter)).length;
  }

  async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      this.data = [];
      return { deletedCount: this.data.length };
    }
    const initialLen = this.data.length;
    this.data = this.data.filter(d => !this.matches(d, filter));
    return { deletedCount: initialLen - this.data.length };
  }

  async findByIdAndDelete(id) {
    const idx = this.data.findIndex(d => String(d._id) === String(id) || String(d.id) === String(id));
    if (idx === -1) return null;
    const deleted = this.data.splice(idx, 1)[0];
    return this.wrapDoc(deleted);
  }

  find(filter = {}) {
    let result = this.data.filter(d => this.matches(d, filter)).map(d => ({ ...d }));

    const queryObj = {
      populate: (field) => {
        return queryObj;
      },
      sort: (sortSpec) => {
        if (sortSpec) {
          const key = Object.keys(sortSpec)[0];
          const dir = sortSpec[key];
          result.sort((a, b) => {
            if (a[key] < b[key]) return dir === 1 ? -1 : 1;
            if (a[key] > b[key]) return dir === 1 ? 1 : -1;
            return 0;
          });
        }
        return queryObj;
      },
      select: (fields) => {
        return queryObj;
      },
      then: (resolve, reject) => {
        return Promise.resolve(result).then(resolve, reject);
      },
    };

    return queryObj;
  }

  async findOne(filter = {}) {
    const doc = this.data.find(d => this.matches(d, filter));
    if (!doc) return null;
    return this.wrapDoc({ ...doc });
  }

  async findById(id) {
    const doc = this.data.find(d => String(d._id) === String(id) || String(d.id) === String(id));
    if (!doc) return null;
    return this.wrapDoc({ ...doc });
  }

  async create(docOrDocs) {
    if (Array.isArray(docOrDocs)) {
      const created = [];
      for (const d of docOrDocs) {
        created.push(await this.createSingle(d));
      }
      return created;
    }
    return await this.createSingle(docOrDocs);
  }

  async createSingle(doc) {
    const newDoc = {
      _id: doc._id || this.generateId(),
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
      ...doc,
    };

    if (newDoc.password && !newDoc.password.startsWith('$2a$') && !newDoc.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      newDoc.password = await bcrypt.hash(newDoc.password, salt);
    }

    this.data.unshift(newDoc);
    return this.wrapDoc(newDoc);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const idx = this.data.findIndex(d => String(d._id) === String(id) || String(d.id) === String(id));
    if (idx === -1) return null;

    const current = this.data[idx];
    const updated = {
      ...current,
      ...(update.$set || update),
      updatedAt: new Date(),
    };

    if (update.$inc) {
      for (const k in update.$inc) {
        updated[k] = (updated[k] || 0) + update.$inc[k];
      }
    }

    this.data[idx] = updated;
    return this.wrapDoc(updated);
  }

  wrapDoc(doc) {
    if (!doc) return null;
    doc.id = doc._id;
    const self = this;

    doc.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };

    doc.save = async function () {
      const idx = self.data.findIndex(d => String(d._id) === String(doc._id) || String(d.id) === String(doc.id));
      if (idx !== -1) {
        self.data[idx] = { ...self.data[idx], ...doc, updatedAt: new Date() };
      }
      return doc;
    };

    doc.populate = async function () {
      return doc;
    };

    doc.deleteOne = async function () {
      const idx = self.data.findIndex(d => String(d._id) === String(doc._id) || String(d.id) === String(doc.id));
      if (idx !== -1) {
        self.data.splice(idx, 1);
      }
      return { deletedCount: 1 };
    };

    return doc;
  }
}

export const memoryStore = {
  users: new MemoryCollection('users'),
  counters: new MemoryCollection('counters'),
  tokens: new MemoryCollection('tokens'),
};
