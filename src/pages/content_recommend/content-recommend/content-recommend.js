
// export const getTaskList = () => {
//   return request ({
//     url: '/api/get-task-list',
//     method: 'get'
// })
// }

import { provide } from "vue";

// export const getSourse = () => {
//     return request ({
//        url:'/api/recommend/get-sourse',
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
            id: "bas_1", // 任务唯一标识
            title: '1个月掌握Vue3',
            description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
            url: "https:www.baidu.com",
            imgurl: "https://example.com/images/vue3-cover.jpg",
            category: "basic",
            subject: "数学",
            page_views: 1990,
            updateTime: "2025-12-29 11:45:00",
            difficulty:3.5,
            recommendRat:"87%",
            favorites: true
          },
          {
            id: "bas_4", // 任务唯一标识
            title: '4个月掌握Vue3',
            description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
            url: "https://example.com/vue3-tutorial.pdf",
            imgurl: "https://example.com/images/vue3-cover.jpg",
            category: "basic",
            subject: "数学",
            page_views: 190,
            updateTime: "2024-12-29 11:45:00",
            difficulty:3,
            recommendRat:"8%",
            favorites: false
          },
          {
            id: "bas_23", // 任务唯一标识
            title: '5个月掌握Vue3',
            description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
            url: "https://example.com/vue3-tutorial.pdf",
            imgurl: "https://example.com/images/vue3-cover.jpg",
            category: "basic",
            subject: "数学",
            page_views: 990,
            updateTime: "2015-12-29 11:45:00",
            difficulty:3,
            recommendRat:"99%",
            favorites: true
          },
          {
            id: "com_98", // 任务唯一标识
            title: '2个月掌握Vue3',
            description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
            url: "https://example.com/vue3-tutorial.pdf",
            imgurl: "https://example.com/images/vue3-cover.jpg",
            category: "computer",
            subject: "前端",
            page_views: 1990,
            updateTime: "2025-12-29 11:45:00",
            difficulty:4,
            recommendRat:"90%",
            favorites: true
          },
          {
            id: "lan_77", // 任务唯一标识
            title: '3个月掌握Vue3',
            description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
            url: "https://example.com/vue3-tutorial.pdf",
            imgurl: "https://example.com/images/vue3-cover.jpg",
            category: "language",
            subject: "四级",
            page_views: 1990,
            updateTime: "2025-12-29 11:45:00",
            difficulty: 2,
            recommendRat:"56%",
            favorites: false
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

// export const getAiCommend = (param) =>{
//   return Request({
//     url:"api/commend/get-ai-commend",
//     method:'get',
//     data
//   })
// }

export const getAiCommend = (param) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功响应（贴合页面渲染的任务数据结构）
      resolve({
        code: 200,
        msg: '获取资源列表成功',
        data: [
          {
            summary: "根据您的喜好，以下为“python”相关推荐",
            subject: "python",
            recommendContent: [
              {
                id: "bas_90",
                title: 'Python数据分析实战',
                description: '使用Python进行数据处理、分析和可视化，掌握Pandas、NumPy等核心库',
                url: 'https://example.com/images/python-data.jpg',
                imgurl:'https://img0.baidu.com/it/u=2695853134,1241643150&fm=253&app=138&f=JPEG?w=828&h=800',
                category: 'computer',
                subject: 'python',
                matchRate: 92,
                estimatedTime: '45小时',
                tags: ['Python', '数据分析', '实战'],
                provider: '慕课网',
                learningOutcomes: [
                  '掌握数据分析核心技能',
                  '能够独立完成数据项目',
                  '具备数据思维'
                ],
                difficulty:3.5,
                recommendRat:"87%",
                page_views:190,
                commendReason: "与您收藏的Python基础入门完美衔接,检测到您对数据分析有2次收藏记录,基于您对Python编程的偏好",
                studyPlan: [],
                favorites:false,
              },
              {
                id: "com_004",
                title: 'Python数据分析实战2',
                description: '使用Python进行数据处理、分析和可视化，掌握Pandas、NumPy等核心库',
                url: 'https://example.com/images/python-data.jpg',
                imgurl: "https://img1.baidu.com/it/u=614515106,1105209309&fm=253&fmt=auto&app=120&f=JPEG?w=667&h=500",
                category: 'computer',
                subject: 'python',
                matchRate: 92,
                estimatedTime: '45小时',
                tags: ['Python', '数据分析', '实战'],
                provider: '慕课网',
                learningOutcomes: [
                  '掌握数据分析核心技能',
                  '能够独立完成数据项目',
                  '具备数据思维'
                ],
                difficulty:3,
                recommendRat:"98%",
                page_views:1900,
                commendReason: "与您收藏的Python基础入门完美衔接,检测到您对数据分析有2次收藏记录,基于您对Python编程的偏好",
                studyPlan: [],
                favorites:false,
              }
            ]
          },
          {
            summary: "根据您的喜好，以下为“人工智能”相关推荐",
            subject: "人工智能",
            recommendContent: [
              {
                id: 'com_002',
                title: '深度学习入门',
                description: '从零开始理解深度学习原理，配有大量实例和代码实现',
                url: 'https://example.com/images/dl-book.jpg',
                imgurl:'https://img1.baidu.com/it/u=907744811,2082137021&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=800',
                category: 'computer',
                subject: '人工智能',
                matchRate: 88,
                estimatedTime: '80小时',
                tags: ['深度学习', '神经网络', 'AI'],
                provider: '人民邮电出版社',
                learningOutcomes: [],
                difficulty:2,
                recommendRat:"80%",
                page_views:890,
                commendReason: "发现您收藏过数学相关课程，已具备学习前提,您之前收藏过AI相关资源,掌握深度学习能显著提升职业竞争力",
                studyPlan: [],
                favorites:false,
              },
              {
                id: 'com_002',
                title: '深度学习入门',
                description: '从零开始理解深度学习原理，配有大量实例和代码实现2',
                url: 'https://example.com/images/dl-book.jpg',
                imgurl:'https://qcloud.dpfile.com/pc/wf4-6xCT4F4DHJBvgxFQZL7zc7NUdVS_tZFJf-UtgUKetTJPCukyTGns-vo8-MYZ.jpg',
                category: 'computer',
                subject: '人工智能',
                matchRate: 88,
                estimatedTime: '80小时',
                tags: ['深度学习', '神经网络', 'AI'],
                provider: '人民邮电出版社',
                learningOutcomes: [],
                difficulty:5,
                recommendRat:"40%",
                page_views:45,
                commendReason: "发现您收藏过数学相关课程，已具备学习前提,您之前收藏过AI相关资源,掌握深度学习能显著提升职业竞争力",
                studyPlan: [],
                favorites:false,
              },
            ]
          }
        ]
      })
      
    }, 1000); // 模拟1秒接口延迟
  });
};




export const AddViews = (param) =>{
  return new Promise((resolve)=>{
    setTimeout(() => {
      resolve({
        code:200,
        msg:"",
        
      })
    }, 1000);
  })
}











        //     {
        //       id: 'rec_003',
        //       title: '雅思听力高分技巧',
        //       description: '专业老师讲解雅思听力考试技巧，包含真题分析和模拟训练',
        //       url: 'https://example.com/images/ielts.jpg',
        //       category: 'language',
        //       subject: '雅思',
        //       matchRate: 95,
        //       estimatedTime: '30小时',
        //       tags: ['雅思', '听力', '英语'],
        //       provider: "",
        //       learningOutcomes: [],
        //       commendReason: "",
        //       studyPlan: ""
        //     },
        //     {
        //       id: 'rec_004',
        //       title: 'PMP项目管理认证',
        //       description: '全球认可的项目管理专业人士认证，提升职业竞争力',
        //       url: 'https://example.com/images/pmp.jpg',
        //       imgurl: 'https://example.com/images/pmp.jpg',
        //       category: 'certification',
        //       subject: '项目管理',
        //       matchRate: 85,
        //       estimatedTime: '120小时',
        //       tags: ['PMP', '项目管理', '认证'],
        //       provider: "",
        //       learningOutcomes: [],
        //       commendReason: "与您收藏的Python基础入门完美衔接,检测到您对数据分析有2次收藏记录,基于您对Python编程的偏好",
        //       studyPlan: ""
        //     },
        //     {
        //       id: 'rec_005',
        //       title: '前端开发实战训练',
        //       description: '通过真实项目练习HTML、CSS、JavaScript，提升前端开发能力',
        //       url: 'https://example.com/images/frontend.jpg',
        //       imgurl: 'https://example.com/images/frontend.jpg',
        //       category: '技能提升',
        //       subject: '前端开发',
        //       matchRate: 90,
        //       estimatedTime: '60小时',
        //       tags: ['前端', '实战', '练习'],
        //       provider: "",
        //       learningOutcomes: [],
        //       commendReason: "",
        //       studyPlan: ""
        //     }
        //   ]
        // }