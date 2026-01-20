import request from '@/utils/request';
// 获取用户列表

// export function register(data) {
//   return request({
//     url: '/api/register',
//     method: 'post',
//     data
//   });
// }
// export const sendCode = async (data) => {
//   return request({
//     url: '/api/sendCode',
//     method: 'get',
//     data
//   });
// }

export const register = async (data) => {

  
   
  return new Promise((resolve) => {
    setTimeout(() => {
       
      resolve({
        success: true,
        userId: `user_${Date.now()}`,
        message: '注册成功',
        token: 'mock_jwt_token_here' 
      })
      
    
      // resolve({
      //   success: false,
      //   message: '用户名已存在'
      // })
    }, 1000)
  })
}
