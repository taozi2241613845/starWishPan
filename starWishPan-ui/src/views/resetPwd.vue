<template>
    <el-form class="login-form" :rules="rules" :model="formData" ref="loginForm">
        <div style="text-align: center;font-weight: bold;color:gray;margin:20px 0px;">星语云盘</div>
        <el-form-item prop="email">
            <el-input size="large" v-model="formData.email" :prefix-icon="User" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item prop="emailVerifyCode" ref="emailVerifyCodeFormItem">
            <el-row style="width: 100%;">
                <el-col :span="14">
                    <el-input size="large" v-model="formData.emailVerifyCode" :prefix-icon="CircleCheck" placeholder="请输入验证码" />
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="9">
                    <el-button size="large" :disabled="emailSending" @click="sendEmailVerifyCodeEvent" type="primary" style="width: 100%;">{{emailSending?`请在${sendWaitTime}秒后重试`:"获取验证码"}}</el-button>
                </el-col>
            </el-row>
        </el-form-item>
        <div style="margin:10px 0px;">
            <el-tooltip effect="light" content="Left Top prompts info" placement="left-start">
                <template #content> 1、在垃圾箱中查找邮箱验证码<br />2、在邮箱中头像->设置->反垃圾->白名单->设置邮件地址白名单<br>3、将邮箱【2241613845@qq.com】添加到白名单不知道怎么设置？</template>
                <a href="javascript:void(0);" class="link-color">未收到邮箱验证码？</a></el-tooltip>
        </div>
        <el-form-item prop="password"><el-input size="large" v-model="formData.password" :prefix-icon="Lock"
                type="password" placeholder="请输入密码" /></el-form-item>
        <el-form-item prop="checkPassword">
            <el-input size="large" v-model="formData.checkPassword" :prefix-icon="Lock" type="password"
                placeholder="请再次输入密码" />
        </el-form-item>
        <div>
            <router-link to="/login/loginForm" style="color:#007fff;">去登录？</router-link>
        </div>
        <div style="margin:20px 0px;"><el-button type="primary" size="large" style="width:100%;" @click="resetPwdEvent">重置密码</el-button>
        </div>
    </el-form>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { User, Lock, CircleCheck } from "@element-plus/icons-vue"
import {resetPass,sendEmailVerifyCode} from '@/api/userApi.js'
import {useRouter} from 'vue-router'
const loginForm = ref(null)
const emailSending = ref(false)
const sendWaitTime = ref(30)
const emailVerifyCodeFormItem = ref(null)
const formData = reactive({
    email: '',
    emailVerifyCode: '',
    password: '',
    checkPassword:'',
})
const router = useRouter()
const checkPassword = ref(null)
const passwordValidator = (rule, value, callback) => {
    const reg = /^[A-Za-z0-9._~!@#$^&*]{8,18}$/;
    if (value === '') {
        callback(new Error('请输入密码'))
    } else if (!reg.test(value)) {
        callback(new Error('密码只能是数字，字母，特殊字符 8-18位'))
    } else {
        if (checkPassword.value !== '') {
            loginForm.value.validateField('checkPassword', () => null)
        }
        callback()
    }
}
const sendEmailVerifyCodeEvent = ()=>{
    emailSending.value = true;
    let clock = setInterval(()=>{
            sendWaitTime.value--;
            if(sendWaitTime.value <= 0){
                clearInterval(clock)
                emailSending.value = false;
                sendWaitTime.value = 30;
            }
        },1000)
    sendEmailVerifyCode(formData.email).then((result) => {
        
    }).catch((err) => {
        emailVerifyCodeFormItem.value.validateMessage="发送验证码失败，请检查邮箱或网络"
    });
}
const resetPwdEvent = async ()=>{
    let formValid = false;
    await loginForm.value.validate((valid,fields)=>{
        console.log(valid)
        formValid = valid;
    })
    if(!formValid){
        console.log("验证失败")
        return;
    }
    let data = new FormData()
    data.append('email',formData.email)
    data.append('password',formData.password)
    data.append('emailVerifyCode',formData.emailVerifyCode)
    resetPass(data).then((result) => {
        // 启动计时器，阻止用户连点发送邮件
        if(result.data.code == '0'){
            ElMessage({
                type:'success',
                message:'密码重置成功'
            })
            router.replace({name:'loginForm'})
        }else{
            ElMessage({
            type:'error',
            message:'密码重置失败'
            })
        }
        
    }).catch((err) => {
        
    })
}
const passCheckValidator = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value != formData.password) {
        callback(new Error('两次的密码输入不一致'))
    } else {
        callback()
    }
}

const rules = ref({
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur', },
    { type: 'email', message: '请输入正确的邮箱', trigger: ['blur', 'change'] }],
    password: [{ validator: passwordValidator, trigger: 'blur', }],
    emailVerifyCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur', }],
    checkPassword: [{ validator: passCheckValidator, trigger: 'blur', }],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur', }],
})
</script>

<style lang="scss" scoped>
.login-form {
    padding: 10px 20px;
    width: 350px;
    border-radius: 6px;
    background-color: white;
}
</style>