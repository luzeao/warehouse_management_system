import { dbUtils } from '@/utils/db'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const inventoryApi = {
  async getOrders(type) {
    await delay()
    const all = await dbUtils.getAll('orders')
    if (type) {
        return all.filter(o => o.type === type).reverse()
    }
    return all.reverse()
  },

  async createOrder(orderData) {
    await delay()
    // 这是一个事务性操作，虽然 IndexedDB 支持事务，但 idb 库的简易封装可能需要手动处理
    // 这里简单处理，依次调用
    
    // 1. 保存订单
    await dbUtils.add('orders', orderData)

    // 2. 更新库存
    // 注意：这里并发可能会有问题，但在单用户本地模拟场景下通常没事
    // 更严谨的做法是在 dbUtils 里暴露 transaction 接口
    const products = await dbUtils.getAll('products') // 获取最新库存
    
    for (const item of orderData.items) {
        const product = products.find(p => p.id === item.productId)
        if (product) {
            if (orderData.type === 'inbound') {
                product.stock = (Number(product.stock) || 0) + item.quantity
            } else {
                product.stock = (Number(product.stock) || 0) - item.quantity
            }
            await dbUtils.put('products', product)
        }
    }
    
    return true
  }
}
