import { dbUtils } from '@/utils/db'

// 模拟网络延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const userApi = {
  async login(username, password) {
    await delay()
    const user = await dbUtils.getByIndex('users', 'username', username)
    if (user && user.password === password) {
      // 模拟返回 token 和用户信息
      return {
        token: 'mock-token-' + Date.now(),
        user: {
            username: user.username,
            role: user.role,
            name: user.name
        }
      }
    }
    throw new Error('用户名或密码错误')
  },

  async register(data) {
    await delay()
    // 检查是否存在
    const existing = await dbUtils.getByIndex('users', 'username', data.username)
    if (existing) {
        throw new Error('用户已存在')
    }
    return dbUtils.add('users', {
        ...data,
        role: 'staff', // 默认角色
        created_at: new Date().toISOString()
    })
  },

  async getUserInfo(token) {
    // 简单模拟，实际应该根据 token 查
    // 这里假设前端已经存了用户信息，或者根据 localStorage 里的 username 查
    // 为了接口完整性，这里可以写一个空实现或者根据 username 查
    return {} 
  }
}
