import request from '@/utils/request';
// 获取用户列表

// export function register(data) {
//   return request({
//     url: '/register',
//     method: 'post',
//     data
//   });
// }

// export const sendCode = async (data) => {
//   return request({
//     url: '/sendCode',
//     method: 'get',
//     data
//   });
// }

export const register = async (data) => {

  
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功响应
      resolve({
        success: true,
        userId: `user_${Date.now()}`,
        message: '注册成功',
        token: 'mock_jwt_token_here' // 如果有token的话
      })
      
    
      // resolve({
      //   success: false,
      //   message: '用户名已存在'
      // })
    }, 1000)
  })
}
