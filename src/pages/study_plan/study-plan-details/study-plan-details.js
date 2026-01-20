
//发送今日累计学习时间
// export const sendDayStu  = (data) => {
//   return Request({
//     url: '/api/study-plan',
//     method: 'post',
//     data
//   })
// }
export const sendDayStu = (data) =>{
 return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data
      });
    }, 800);
  });
}

/*
const studySessionData = {
  // 必需参数
  userId: 123,                      // 用户ID（后端可从token获取更安全）
  planId: 456,                      // 学习计划ID（可为空）
  subTaskId: 789,                   // 子任务ID（可为空）
  
  // 会话信息
  sessionType: 'manual',            // 记录方式: 'manual'手动 / 'auto'自动 / 'timer'计时器
  action: 'start',                  // 动作: 'start'开始 / 'pause'暂停 / 'resume'恢复 / 'end'结束
  
  // 时间信息（根据action不同而不同）
  startTime: '2024-01-15T09:00:00', // 开始时间（ISO格式）
  endTime: '2024-01-15T09:30:00',   // 结束时间（ISO格式，暂停/结束时发送）
  durationMinutes: 30,              // 本次持续分钟数
  
  // 会话状态相关
  previousSessionId: null,          // 上一个会话ID（用于暂停后恢复）
  sessionId: 'session_abc123',      // 当前会话唯一ID（前端生成）
  deviceId: 'web_chrome_xyz',       // 设备标识
  
  
  // 页面状态（用于判断学习有效性）
  pageVisibility: 'visible',        // 'visible'可见 / 'hidden'隐藏
  appState: 'active',               // 'active'活跃 / 'background'后台 / 'inactive'
  
  // 用于心跳检查
  isHeartbeat: false,               // 是否为心跳请求
  lastActivityTime: '2024-01-15T09:29:50' // 最后活跃时间
}
*/
