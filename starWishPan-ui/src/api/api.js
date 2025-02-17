import axios from 'axios'
import resultEnum from './resultEnum'
const request = axios.create({
    baseURL: '/api', // 请求的公共地址部分
    timeout: 10000, // 请求超时时间 当请求时间超过5秒还未取得结果时 提示用户请求超时
    withCredentials: true
})
// interceptors axios的拦截器对象
request.interceptors.request.use(config => {
    // config 请求的信息
    let token = localStorage.getItem('token')
    console.log('token:\n'+token)
    if(token){
        config.headers['token'] = token
    }
   
   return config // 将配置完成的config对象返回出去 如果不返回 请求则不会进行
}, err => {
   // 请求发生错误时的处理 抛出错误
   console.log("timeout")   
  return Promise.reject(err)
})
request.interceptors.response.use(res => {
    // 我们一般在这里处理，请求成功后的错误状态码 例如状态码是500，404，403
    // res 是所有相应的信息
    if(res.data.code == resultEnum.NotLoginError.code){
        //TODO 需要返回到登录页面
    }
    console.log(res)
   return Promise.resolve(res)
}, err => {
    // 服务器响应发生错误时的处理
    Promise.reject(err)
})
export default request

