// study_plan.js





// export const getTaskList = (userid) => {
//   return request ({
//     url: '/api/get-task-list',
//     method: 'get'
//     userid
// })
// }

export const getTaskList = (params) => {
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
            isExpanded: false, // 子任务展开状态
            status:"not_started",
            subtasks: [ // 子任务列表
              { id: 101, planName: '学习Vue3组合式API', preId: 1 , status:"not_started",targetHours:10},
              { id: 102, planName: '完成3个实战案例', preId: 1, status:"not_started", targetHours:189 },
              { id: 103, planName: '复盘组件化知识点', preId: 1, status:"not_started",targetHours:45  }
            ]
          },
          {
            id: 2,
            planName: '每日英语打卡',
            isExpanded: false,
            status:"in_progress",
            subtasks: [
              { id: 201, planName: '背50个单词', preId: 2, status:"in_progress",targetHours:100 },
              { id: 202, planName: '跟读15分钟听力', preId: 2, status:"not_started",targetHours:50}
            ]
          },
          {
            id: 3,
            planName: '数据结构刷题',
            isExpanded: false,
            status:"abandoned",
            subtasks: [
              { id: 301, planName: '每日2道链表题', preId: 3,status:"abandoned", targetHours:15  },
              { id: 302, planName: '周末复盘错题', preId: 3, status:"abandoned", targetHours:18  }
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
export const deleteTask = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: `删除任务成功`,
        
      });
    }, 800);
  });
};
export const deleteSubTask = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: `删除子任务成功`,
        
      });
    }, 800);
  });
};

export const updateTask = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: `更新任务成功`,
        
      });
    }, 800);
  });
};

export const updateSubTask = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: `更新任务成功`,
        
      });
    }, 800);
  });
};

export const addNewSubplan = (params) =>{
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: `添加子任务成功`,
       
      });
    }, 800);
  });
}
export const getAiSubtaskRecommendations = (params) =>{
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: `获得ai推荐成功`,
        data:{
           ai_recommended_minutes: 120,
           ai_recommended_daily_minutes: 30,
           ai_prerequisites: '["高等数学基础", "线性代数", "概率论"]'

        }
      });
    }, 800);
  });
}
















//添加
/*
计划名称
学习内容描述
总目标分钟数（必填，同时显示换算的小时数）
弹性设置{
每周学习几天
每日最少分钟
每日最多分钟
}
推荐子任务{
......}
提醒时间


*/


// export const getAiCom = (prompt) => {
//   return Request({
//     url: '/api/ai-completion',
//     method: 'get',
//     data: { prompt }
//   })
// }

export const getAiCom = (prompt) => {

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data:{
          planName:'四级',
          description:'四级600分',
          targetMinutes:6000,
          flexibleSettings: {
            learningDaysPerWeek: 5,
            minDailyMinutes: 30,
            maxDailyMinutes: 480
          },
          recommendedSubTasks: [
            {
              id: 101,                    // 子任务ID
              title: '阅读',              // 子任务标题
              estimatedMinutes: 120,      // 预估分钟数
              description: '完成阅读材料学习', // 描述
              difficulty: 2,              // 难度等级
              prerequisites: [],          // 前置要求
              order: 1,                    // 排序
            },
            {
              id: 102,
              title: '听力',
              estimatedMinutes: 180,
              description: '听力训练和技巧',
              difficulty: 3,
              prerequisites: [],
              order: 2
            },
            {
              id: 103,  
              title: '作文',
              estimatedMinutes: 240,    
              description: '写作练习和批改',    
              difficulty: 4,    
              prerequisites: ['阅读', '听力'],    
              order: 3
            }   
          ],
          reminderTime: '19:00'
        }
      });
    }, 800);
  });
}
/*
// 后端响应

planName: '',
  notes: '',
  // 目标设定
  targetMinutes: null,
  // 弹性设置（嵌套对象）
  flexibleSettings: {
    learningDaysPerWeek: null,
    minDailyMinutes: null,
    maxDailyMinutes: null
  },
  // 推荐子任务（数组对象）
  recommendedSubTasks: [],
  // 提醒设置
  reminderTime: ''
*/


// export const sendTask = (data) =>{
//   return Request({
//     url:'/api/sendnewTask',
//     method:'post',
//     data
//   })
// }
export const sendTask = (data) =>{
  return new Promise((resolve) =>{
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
      });
    },800);
  })
}


