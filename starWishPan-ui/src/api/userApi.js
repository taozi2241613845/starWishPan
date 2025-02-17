import api from "./api"
export const getImageVerifyCode = (anonymousId) => api.get("/userInfo/checkCode",{responseType:'blob',params:{'type':1,anonymousId}})
export const getEmailVerifyCode = (verifyCode,email,anonymousId) => api.get("/userInfo/checkCode",{'params':{'type':2,verifyCode,email,anonymousId}})
export const getAnonymousId = () => api.get("/userInfo/getAnonymousId")
export const createUser = (userInfo) => api.post("/userInfo/createUser",userInfo)
export const verifyUser = (data) => api.post("/userInfo/login",data)
export const resetPass = (data) => api.post("/userInfo/resetPwd",data)
export const sendEmailVerifyCode = (email) => api.get("/userInfo/send/emailVerifyCode",{'params':{email}})
export const queryUser = () => api.get("/userInfo/get/user")
export const modifyPwd = (data) => api.post("/userInfo/modify/pwd",data)
export const logout = () => api.get("/userInfo/logout")
export const uploadAvatar = (avatar) => {
    let data = new FormData()
    data.append('avatar',avatar)
    return api.post("/userInfo/upload/avatar",data)
}
export const getUserByShare = (shareId) => {
    return api.get("/userInfo/getUserByShare",{params:{shareId}})
}