import request from '@/utils/request';
// 获取用户列表

// export function login(data) {
//   return request({
//     url: '/login',
//     method: 'post',
//     data
//   });
//}
export const login = async (data) => {
  // TODO: 根据你的实际后端接口调整
  // 这里是一个示例实现，你需要替换为实际的API调用
  
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