<template>
    <el-form class="login-form" :rules="rules" :model="formData" ref="loginForm">
        <div style="text-align: center;font-weight: bold;color:gray;margin:20px 0px;">星语云盘</div>
        <el-form-item prop="email">
            <el-input size="large" v-model="formData.email" :prefix-icon="User" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item prop="password">
            <el-input size="large" v-model="formData.password" :prefix-icon="Lock"
                type="password" placeholder="请输入密码" />
        </el-form-item>
        <div style="display:flex;">
            <div  style="width:50%;"><router-link to="/login/resetPwd" class="link-color">忘记密码</router-link></div>
            <div style="text-align:right;width:50%;"><router-link class="link-color"  to="/login/register">没有账号</router-link></div>
        </div>
        <div style="margin:20px 0px;"><el-button type="primary" size="large" style="width:100%;" @click="loginBtnClick">登录</el-button></div>
        <div style="text-align: center;">快捷登录<img src="@/assets/QQ.png" style="width: 30px;height:30px;"></div>
    </el-form>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { User, Lock, CircleCheck } from "@element-plus/icons-vue"
import {verifyUser} from '@/api/userApi.js'
import { useRouter ,useRoute} from 'vue-router';
import {useUserStore} from "../store/store.js";
const loginForm = ref(null)
const route = useRoute();
const userStore = useUserStore();
const formData = reactive({
    email: '',
    password: ''
})
const fileVOList = reactive(null);
const router = useRouter();
const rules = ref({
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur', },
    { type: 'email', message: '请输入正确的邮箱', trigger: ['blur'] }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur', },
    { min: 8,max:18, message: '密码只能是数字，字母，特殊字符 8-18位', trigger: ['blur'], }],
})
const loginBtnClick = async ()=>{
    let formItemValid = false;  
    await loginForm.value.validate((valid,fields)=>{
        formItemValid = valid;
    })
    if(!formItemValid)return;
    let data = new FormData();
    data.append('email' , formData.email);
    data.append('password', formData.password)
    verifyUser(data).then((result) => {
        if(result.data.code == '0') {
            ElMessage({
                type:'success',
                message:'登录成功'
            })
            localStorage.setItem('token',result.data.token)
          console.log("user:" + result.data.user);
          userStore.setUser(result.data.user);
            let tokenExpireTime = new Date().getTime() + (20 * 1000 * 60);
            localStorage.setItem('tokenExpireTime',tokenExpireTime);
            console.log(`tokenExpireTime:${tokenExpireTime}`)
            console.log(localStorage.getItem('token'));

            if(route.query.back){
                router.go(-1)
            }
            router.push({name:'homePage'})
        }else{
            ElMessage({
                message:result.data.msg,
                type:'error'
            })
        }
        
        
    }).catch((err) => {

    });
}
</script>

<style lang="scss" scoped>
.login-form {
    padding: 10px 20px;
    width: 350px;
    border-radius: 6px;
    background-color: white;
}
</style>