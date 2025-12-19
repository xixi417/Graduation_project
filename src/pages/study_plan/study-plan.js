// study_plan.js
export const getTaskList = () => {
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
            title: '3个月掌握Vue3', // 主任务名称
            isExpanded: false, // 子任务展开状态（页面会重写，这里仅占位）
            subtasks: [ // 子任务列表
              { id: 101, content: '学习Vue3组合式API' },
              { id: 102, content: '完成3个实战案例' },
              { id: 103, content: '复盘组件化知识点' }
            ]
          },
          {
            id: 2,
            title: '每日英语打卡',
            isExpanded: false,
            subtasks: [
              { id: 201, content: '背50个单词' },
              { id: 202, content: '跟读15分钟听力' }
            ]
          },
          {
            id: 3,
            title: '数据结构刷题',
            isExpanded: false,
            subtasks: [
              { id: 301, content: '每日2道链表题' },
              { id: 302, content: '周末复盘错题' }
            ]
          }
        ]
      });
    }, 1000); // 模拟1秒接口延迟
  });
};
// export const deleteTask = (taskId) => {
//   // return fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
// };
// export const updateTask = (taskId, taskData) => {
//   return fetch(`/api/tasks/${taskId}`, {
//     method: 'POST', // 或PUT
//     body: JSON.stringify(taskData),
//     headers: { 'Content-Type': 'application/json' }
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

export const updateTask = (taskId, taskData) => {
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