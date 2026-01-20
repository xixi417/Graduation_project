// export const getPassword = (username) => {
//   return request ({
//     url: '/api/get-password',
//     method: 'get',
//     params: { username }

import { el } from "element-plus/es/locales.mjs";

//   });
// }
// export const updatePassword = (data) => {
//   return request({
//     url: '/api/update-password',
//     method: 'post',
//     data, 
//   });
// };

export const getPassword = (userid) => {
  if(userid == "xixi")
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: '获取密码成功',
                data: {
                    userid: "xixi",
                    password: "123456"
                } 
            });
        }, 800);   
    })
  else if(userid == "admin")
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: '获取密码成功',
                data: {
                    userid: "admin",
                    password: "admin123"
                } 
            });
        }, 800);  
    })
    else
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: 'success',
                data: {
                    userid: 1,
                    password: "000000"
                } 
            });
        }, 800);  
    })
  
} 
export const updatePassword = async (data) => {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve({
              code: 200,
              msg: '密码更新成功',
          });
      }, 800);  
  });
};

// export const getUserInfo = async (account) => {
//     return Request({
//         url:'/api/get-user-info',
//         method:'get',
//         account
//     })
// }

export const getUserInfo = async (account) => {
    return new Promise((resolve) => {
      setTimeout(() => {
          resolve({
              code: 200,
              msg: '成功获取信息',
              data: {
                userid: 1,
                username: 'ssss',
                email: 'xxx@x.com',
                avatarUrl: 'https://img1.baidu.com/it/u=3599536915,1146967&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=800',
                bio:'加油',
                learning_preferences:'111',
                created_at :'111',
                status:'active'
              }
          });
      }, 800);  
  });



}
// export const uploadAvatarH5 = async (param) =>{
//   return Request({
//     url:'/api/upload-avatar-H5',
//     method:'post',
//     data
//   })
// }
export const uploadAvatarH5 = async (param) =>{
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve({
              code: 200,
              msg: '成功上传信息',
              data:{
                avatarUrl:'https://img1.baidu.com/it/u=3599536915,1146967&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=800'
              }
          });
      }, 800);  
});
}


// export const getFavoriteList = async (param) =>{
//     return Request({
//         url:'/api/get-favorite-list',
//         method:'get',
//         data
//     })
// }

export const getFavoriteList = async (param) =>{
    return new Promise((resolve)=>{
        setTimeout(() => {
            resolve({
                code:200,
                msg:"",
                data:[
                    {
                        id:"bas_90",
                        title:"三年级数学"
                    },
                    {
                        id: "ai_112",
                        title: 'Python数据分析实战',
                    },
                    {
                        id: 'ai_002',
                        title: '深度学习入门',
                    }
                ]
            })
        }, 1000);
    })

}











/*
id: 1,
username: 'ssss',
email: 'xxx@x.com',
avatarUrl: '',
bio:'',
learning_preferences:'',
created_at :'',
status:'active'









*/


//发送今日累计学习时间
// export const sendNewInfo  = (param) => {
//   return Request({
//     url: '/api/userinfo',
//     method: 'post',
//     param
//   })
// }
export const sendNewInfo = (data) =>{
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
// export const getInProgress = (param) =>{
//     return Request({
//         url:'/api/get-inprogress-plan',
//         method:'get',
//         param
//     })
// }
// export const getPaused = (param) =>{
//     return Request({
//         url:'/api/get-paused-plan',
//         method:'get',
//         param
//     })
// }
// export const getCompleted = (param) =>{
//     return Request({
//         url:'/api/get-completed-plan',
//         method:'get',
//         param
//     })
// }
export const getInProgress = (param) =>{
 return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data:[
        {
            id:1,
            planName: '3个月掌握Vue3'
        },
        {
            id:46,
            planName:"2个月掌握Vue3"
        },
        {
            id:77,
            planName:"1个月掌握Vue3"
        }]
      });
    }, 800);
  });
}
export const getNotStarted = (param) =>{
 return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data:[
        {
            id:2,
            planName: '每日英语打卡'
        },
        {
            id:5,
            planName:"每2日英语打卡"
        },
        ]
      });
    }, 800);
  });
}
export const getCompleted = (param) =>{
 return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data:[
        {
            id:4,
            planName: '每日英语数据结构刷题打卡'
        },
        {
            id:6,
            planName:"数据1结构刷题"
        },
        {
            id:7,
            planName:"数据2结构刷题"
        }]
      });
    }, 800);
  });
}