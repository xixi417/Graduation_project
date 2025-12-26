// study_plan.js





// export const getTaskList = () => {
//   return request ({
//     url: '/api/get-task-list',
//     method: 'get'
// })
// }

export const getTaskList = (username) => {
  // return fetch('/api/tasks').then(res => res.json());
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功响应（贴合页面渲染的任务数据结构）
      resolve({
        code: 200,
        msg: '获取任务列表成功',
        data: [
          {
            id: 1, // 任务唯一标识
            planName: '3个月掌握Vue3', // 主任务名称
            isExpanded: false, // 子任务展开状态（页面会重写，这里仅占位）
            subtasks: [ // 子任务列表
              { id: 101, planName: '学习Vue3组合式API', preId: 1 },
              { id: 102, planName: '完成3个实战案例', preId: 1 },
              { id: 103, planName: '复盘组件化知识点', preId: 1  }
            ]
          },
          {
            id: 2,
            planName: '每日英语打卡',
            isExpanded: false,
            subtasks: [
              { id: 201, planName: '背50个单词', preId: 2  },
              { id: 202, planName: '跟读15分钟听力', preId: 2  }
            ]
          },
          {
            id: 3,
            planName: '数据结构刷题',
            isExpanded: false,
            subtasks: [
              { id: 301, planName: '每日2道链表题', preId: 3  },
              { id: 302, planName: '周末复盘错题', preId: 3  }
            ]
          }
        ]
      });
    }, 1000); // 模拟1秒接口延迟
  });
};
// export const deleteTask = (taskId) => {
//   return request ({
//     url: `/api/delete-task/${taskId}`,
//     method: 'delete'
// })
// }
// export const deleteSubTask = (taskId, subTaskId) => {
//   return request ({
//     url: `/api/delete-subtask/${taskId}/subtask/${subTaskId}`,
//     method: 'delete'
// })
// }
// export const updateTask = (taskId, taskData) => {
//   return request ({
//     url: `/api/update-task/${taskId}`,
//     method: 'put',
//     data: taskData
// })
// }
// export const updateSubTask = (taskId, subTaskId, subTaskData) => {
//   return request({
//     url: `/api/update-subtask/${taskId}/subtask/${subTaskId}`, // 路径拼接主/子任务ID
//     method: 'PUT',
//     data: subTaskData, 
//   });
// };


// 补充其他模拟方法（deleteTask/updateTask），保持接口一致性
export const deleteTask = (taskId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: `删除任务${taskId}成功`,
        data: true
      });
    }, 800);
  });
};
export const deleteSubTask = (taskId, subTaskId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: `删除子任务${subTaskId}成功`,
        data: true
      });
    }, 800);
  });
};

export const updateTask = (taskId,taskData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: `更新任务${taskId}成功`,
        data: taskData
      });
    }, 800);
  });
};

export const updateSubTask = (taskId, subTaskId, subtaskData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: `更新任务${taskId}成功`,
        data: subtaskData
      });
    }, 800);
  });
};




export const getAiCom = (prompt) => {
  return Request({
    url: '/api/ai-completion',
    method: 'get',
    data: { prompt }
  })
}
/*
// 后端响应
{
  "success": true,
  "data": {
    "difficulty": "中等",
    "recommendedTotalHours": 45,
    "recommendedDailyHours": 2.5,
    "estimatedDays": 18,
    "focusPoints": [
      "重点学习Composition API",
      "掌握Vue3响应式原理",
      "完成一个综合项目实战"
    ],
    "challenges": [
      "从Options API过渡可能需要适应期",
      "TypeScript集成可能遇到类型问题"
    ]
  }


}


*/


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