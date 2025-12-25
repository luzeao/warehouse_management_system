import { dbUtils } from '@/utils/db'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const logApi = {
  async getLogs() {
    await delay()
    const logs = await dbUtils.getAll('logs')
    return logs.reverse()
  },

  async addLog(action, details) {
    // 日志通常不 await，后台执行
    dbUtils.add('logs', {
        user_id: localStorage.getItem('username') || 'system',
        action,
        details,
        created_at: new Date().toISOString()
    })
  }
}
