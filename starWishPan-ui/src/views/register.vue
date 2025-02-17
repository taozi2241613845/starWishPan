<template>
    <el-form class="login-form" :rules="rules" :model="formData" ref="loginForm">
        <div style="text-align: center;font-weight: bold;color:gray;margin:20px 0px;">星语云盘

        </div>
        <el-form-item prop="email">
            <el-input size="large" v-model="formData.email" :prefix-icon="User" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item prop="verifyCode">
                <el-col :span="13"><el-input size="large" v-model="formData.verifyCode" :prefix-icon="CircleCheck" placeholder="请输入验证码" /></el-col>
                <el-col :span="1"></el-col>
                <el-col :span="10" ><img style="cursor: pointer" ref="imageVerifyCode" @click="setImageVerifyCode"></el-col>
        </el-form-item>
        <el-form-item prop="emailVerifyCode"  ref="emailVerifyFormItem">
                <el-col :span="13"><el-input size="large" v-model="formData.emailVerifyCode" :prefix-icon="CircleCheck" placeholder="请输入邮箱验证码" /></el-col>
                <el-col :span="1"></el-col>
                <el-col :span="10"><el-button size="large" :disabled="emailVerifyBtnDisabled" type="primary" style="width:100%;" ref="emailCodeBtn"@click="emailVerifyCodeClick()">{{emailVerifyBtnRecoveryTime?'验证码已发送'+emailVerifyBtnRecoveryTime:'获取邮箱验证码'}}</el-button></el-col>
        </el-form-item>
        <el-form-item prop="nickName">
            <el-input required size="large" v-model="formData.nickName" :prefix-icon="User" placeholder="请输入昵称" />
        </el-form-item>
        <div style="margin:10px 0px;">
            <el-tooltip effect="light" content="Left Top prompts info" placement="left-start">
                <template #content>
                    1、在垃圾箱中查找邮箱验证码<br />2、在邮箱中头像->设置->反垃圾->白名单->设置邮件地址白名单<br>3、将邮箱【2241613845@qq.com】添加到白名单不知道怎么设置？</template>
                <a href="javascript:void(0);" class="link-color">未收到邮箱验证码？</a></el-tooltip>
        </div>
        <el-form-item prop="password"><el-input size="large" v-model="formData.password" :prefix-icon="Lock"
                type="password" placeholder="请输入密码" /></el-form-item>
        <el-form-item prop="passwordRepeat">
            <el-input size="large" v-model="formData.passwordRepeat" :prefix-icon="Lock" type="password"
                placeholder="请再次输入密码" />
        </el-form-item>

        <div>
            <router-link to="/login/loginForm" style="color:#007fff;">已有账号？</router-link>
        </div>
        <div style="margin:20px 0px;"><el-button type="primary" size="large" style="width:100%;" @click="submitRegister(loginForm)">注册</el-button>
        </div>
    </el-form>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { User, Lock, CircleCheck } from "@element-plus/icons-vue"
import { getImageVerifyCode, getEmailVerifyCode ,getAnonymousId,createUser} from '@/api/userApi'
const route = useRoute()
const router = useRouter()
const imageVerifyCode = ref(null);
const loginForm = ref(null)
const emailCodeBtn = ref(null)
const emailVerifyBtnDisabled = ref(false);
const emailVerifyBtnRecoveryTime = ref(0);
const formData = reactive({
    email: '',
    emailVerifyCode: '',
    nickName: '',
    password: '',
    passwordRepeat: '',
    verifyCode: '',
})
const anonymousId = ref(null);
const verifyCodeValid = ref(true);
const setImageVerifyCode = () => {
    getImageVerifyCode(anonymousId.value).then((result) => {
        imageVerifyCode.value.src = window.URL.createObjectURL(result.data);
    }).catch((err) => {
        console.log(err)
    })
}
const emailVerifyFormItem = ref(null);
const intervalShowButton = (refTimeInfo,time,fallback)=>{
    refTimeInfo.value = time;
    console.log(refTimeInfo.value)
    const timer = setInterval(()=>{
        refTimeInfo.value--;
        if(refTimeInfo.value == 0){
            clearInterval(timer)
            fallback();
        }
    },1000)
}
const emailVerifyCodeClick = async ()=>{
    //邮箱是否通过验证
    let passValid = false;
    await loginForm.value.validateField('email',(valid,vv)=>{ 
        passValid = valid;
    })
    await loginForm.value.validateField('verifyCode',(valid,vv)=>{ 
        passValid = passValid && valid;
    })
    if(!passValid) return;
    emailVerifyBtnDisabled.value = true;
    //从后端验证验证码是否正确
    await getEmailVerifyCode(formData.verifyCode,formData.email,anonymousId.value).then((res) => {
        if(res.data.code == '0'){
        //验证码正确自动发送邮件，错误则提示用户错误
            intervalShowButton(emailVerifyBtnRecoveryTime,30,()=>{
                emailVerifyBtnDisabled.value = false;
            })
        }else{
            verifyCodeValid.value = false;
            loginForm.value.validateField('verifyCode',(valid,vv)=>{})
            emailVerifyBtnDisabled.value = false;
            
        }
    }).catch((err) => {
        emailVerifyFormItem.value.validateMessage="邮箱验证超时，请检查邮箱或网络"
        emailVerifyBtnDisabled.value = false;
    });
}
onMounted(async () => {
    await getAnonymousId().then((res) => {
        anonymousId.value = res.data.anonymousId;
    }).catch((err) => {

    });
    setImageVerifyCode(anonymousId.value);
})

const passwordValidator = (rule, value, callback) => {
    const reg = /^[A-Za-z0-9._~!@#$^&*]{8,18}$/;
    if (value === '') {
        callback(new Error('请输入密码'))
    } else if (!reg.test(value)) {
        callback(new Error('密码只能是数字，字母，特殊字符 8-18位'))
    } else {
        if (formData.passwordRepeat !== '') {
            loginForm.value.validateField('passwordRepeat', () => null)
        }
        callback()
    }
}
const passwordRepeatValidator = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value != formData.password) {
        callback(new Error('两次的密码输入不一致'))
    } else {
        callback()
    }
}
const verifyCodeValidator = (rule,value ,callback) =>{
    if (value === '') {
        callback(new Error('请输入验证码'))
    } else if (!verifyCodeValid.value) {
        verifyCodeValid.value = true;
        callback(new Error('验证码错误'))
        
    } else {
        callback()
    }
}
const rules = ref({
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur', },
    { type: 'email', message: '请输入正确的邮箱', trigger: ['blur'] }],
    password: [{ validator: passwordValidator, trigger: 'blur', }],
    nickName: [{ required: true, message: '请输入昵称', trigger: 'blur', }],
    emailVerifyCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur', }],
    passwordRepeat: [{ validator: passwordRepeatValidator, trigger: 'blur', }],
    verifyCode: [{ validator:verifyCodeValidator, trigger: 'blur', }],
})
const submitRegister = async (formEl) => {
    console.log(formEl)
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      let userInfoDO = {
        email: formData.email,
        emailVerifyCode: formData.emailVerifyCode,
        nickName: formData.nickName,
        password: formData.password,
      }
      console.log(userInfoDO)
      createUser(userInfoDO).then((res) => {
        if(res.data.code == 0){
            ElMessage({
                type:'success',
                message:'注册成功'
            })
        }
        router.replace({name:'loginForm'})
      }).catch((err) => {
        ElMessage({
            type: 'error',
            message: `注册失败`, 
        })  
      });
    } else {
      
    }
  })
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