import { openDB } from 'idb'

const DB_NAME = 'InventorySystemDB'
const DB_VERSION = 2

/**
 * 初始化数据库
 * 创建所需的 Object Stores
 */
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // 用户表: id, username, password, role, name, created_at
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true })
        userStore.createIndex('username', 'username', { unique: true })
        
        // 初始化管理员账号
        userStore.add({
          username: 'admin',
          password: 'password', // 实际项目中应加密
          role: 'admin',
          name: '系统管理员',
          created_at: new Date().toISOString()
        })
      }

      // 商品表: id, name, sku, category, price, stock, created_at, updated_at
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true })
        productStore.createIndex('sku', 'sku', { unique: true })
      }

      // 入库单: id, order_no, type(in/out), items[{productId, quantity}], operator_id, created_at, status
      // 为了简单，我们将入库和出库都放在 orders 表中，用 type 区分
      if (!db.objectStoreNames.contains('orders')) {
        const orderStore = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true })
        orderStore.createIndex('order_no', 'order_no', { unique: true })
        orderStore.createIndex('type', 'type', { unique: false })
      }

      // 日志表: id, user_id, action, details, created_at
      if (!db.objectStoreNames.contains('logs')) {
        const logStore = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true })
        logStore.createIndex('created_at', 'created_at', { unique: false })
      }
    },
  })
}

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION)
}

// 通用增删改查工具
export const dbUtils = {
  async add(storeName, item) {
    const db = await getDB()
    item.created_at = new Date().toISOString()
    return db.add(storeName, item)
  },

  async put(storeName, item) {
    const db = await getDB()
    item.updated_at = new Date().toISOString()
    return db.put(storeName, item)
  },

  async get(storeName, key) {
    const db = await getDB()
    return db.get(storeName, key)
  },

  async getAll(storeName) {
    const db = await getDB()
    return db.getAll(storeName)
  },

  async delete(storeName, key) {
    const db = await getDB()
    return db.delete(storeName, key)
  },

  async getByIndex(storeName, indexName, value) {
    const db = await getDB()
    return db.getFromIndex(storeName, indexName, value)
  }
}
