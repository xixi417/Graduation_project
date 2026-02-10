// export const getAIDetails = async (param) =>{
//     return Request({
//         url:'/api/get-ai-details',
//         method:'get',
//         data
//     })
// }
export const getAIDetails = async (param) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: "",
                data: {
                    id: param.id,
                    title: 'Python数据分析实战',
                    description: '使用Python进行数据处理、分析和可视化，掌握Pandas、NumPy等核心库',
                    url: 'https://example.com/images/python-data.jpg',
                    imgurl: 'https://img0.baidu.com/it/u=2695853134,1241643150&fm=253&app=138&f=JPEG?w=828&h=800',
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
                    difficulty: 3.5,
                    recommendRat: "87%",
                    page_views: 190,
                    commendReason: "与您收藏的Python基础入门完美衔接,检测到您对数据分析有2次收藏记录,基于您对Python编程的偏好",
                    studyPlan: [
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
                    favorites: false,
                }
            })
        }, 1000);
    })
}



// export const getNormalDetails = async (param) =>{
//     return Request({
//         url:'/api/get-normal-details',
//         method:'get',
//         data
//     })
// }



export const getNormalDetails = async (param) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: "",
                data: {
                    id: param.id,
                    title: '3个月掌握Vue3',
                    description: "从零开始学习Vue3框架，包含组合式API、响应式原理等核心概念",
                    url: "https://example.com/vue3-tutorial.pdf",
                    imgurl: "https://example.com/images/vue3-cover.jpg",
                    category: "language",
                    subject: "四级",
                    page_views: 1990,
                    updateTime: "2025-12-29 11:45:00",
                    difficulty: 2,
                    recommendRat: "56%",
                    favorites: false,
                }
            })
        }, 1000);
    })
}


// // export const sendNewStudyPlan = async (param) =>{
// //     return Request({
// //         url:'/api/send-new-plan',
// //         method:'post',
// //         data
// //     })
// // }

// export const sendNewStudyPlan = async (param) =>{
//     return new Promise((resolve)=>{
//         setTimeout(() => {
//             resolve({
//                 code: 200,
//                 msg: "",
//             })
//         }, 1000);
//     })
// }
 
// export const updateFavorites = async (param) =>{
//     return Request({b
//         url:'/api/update-favorites',
//         method:'post',
//         data
//     })
// }
export const updateFavorites = async (param) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: "",
            })
        }, 1000);
    })
}