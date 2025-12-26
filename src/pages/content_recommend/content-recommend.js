
// export const getTaskList = () => {
//   return request ({
//     url: '/api/get-task-list',
//     method: 'get'
// })
// }

// export const getSourse = () => {
//     return request ({
//        url:'/recommend/get-sourse',
//        method: 'get'
//     })

// }

export const getAllSourse = () => {
  // return fetch('/api/tasks').then(res => res.json());
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功响应（贴合页面渲染的任务数据结构）
      resolve({
        code: 200,
        msg: '获取资源列表成功',
        data: [
          {
            id: 1, // 任务唯一标识
            title: '1个月掌握Vue3', 
            description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
            url: "https://example.com/vue3-tutorial.pdf",
            imgurl: "https://example.com/images/vue3-cover.jpg",
            category: "computer",
            subject: "前端开发"
          },
          {
            id: 4, // 任务唯一标识
            title: '4个月掌握Vue3', 
            description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
            url: "https://example.com/vue3-tutorial.pdf",
            imgurl: "https://example.com/images/vue3-cover.jpg",
            category: "computer",
            subject: "前端开发"
          },
          {
            id: 5, // 任务唯一标识
            title: '5个月掌握Vue3', 
            description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
            url: "https://example.com/vue3-tutorial.pdf",
            imgurl: "https://example.com/images/vue3-cover.jpg",
            category: "computer",
            subject: "前端开发"
          },
          {
            id: 2, // 任务唯一标识
            title: '2个月掌握Vue3', 
            description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
            url: "https://example.com/vue3-tutorial.pdf",
            imgurl: "https://example.com/images/vue3-cover.jpg",
            category: "basic",
            subject: "数学"
          },
          {
            id: 3, // 任务唯一标识
            title: '3个月掌握Vue3', 
            description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
            url: "https://example.com/vue3-tutorial.pdf",
            imgurl: "https://example.com/images/vue3-cover.jpg",
            category: "language",
            subject: "四级"
          }
          
          
        ]
      });
    }, 1000); // 模拟1秒接口延迟
  });
};
//
// {
//   "code": 200,
//   "message": "success",
//   "data": {[
//     "id": 1,
//      
//     "title": "Vue3入门教程",
//     "description": "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
//     "url": "https://example.com/vue3-tutorial.pdf",
//     "imgurl": "https://example.com/images/vue3-cover.jpg",
//     "category": "computer",
//     "subject": "前端开发"
//    ],
//    [
//     ]
//   },
// }





//详细
// {
//   "code": 200,
//   "message": "success",
//   "data": {
//     "id": 1,
//     "user_id": 123,
//     "title": "Vue3入门教程",
//     "description": "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
//     "url": "https://example.com/vue3-tutorial.pdf",
//     "imgurl": "https://example.com/images/vue3-cover.jpg",
//     "category": "computer",
//     "subject": "前端开发",
//     "estimated_minutes": 120,
//     "page_views": 1560,
//     "difficulty": "beginner",
//     "display_order": 1,
//     "created_at": "2024-01-15 10:30:00",
//     "updated_at": "2024-01-20 14:25:00",
//   
// }
















