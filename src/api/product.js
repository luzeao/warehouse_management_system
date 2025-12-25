import { dbUtils } from '@/utils/db'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const productApi = {
  async getList() {
    await delay()
    return dbUtils.getAll('products')
  },

  async create(data) {
    await delay()
    return dbUtils.add('products', data)
  },

  async update(data) {
    await delay()
    return dbUtils.put('products', data)
  },

  async delete(id) {
    await delay()
    return dbUtils.delete('products', id)
  }
}
