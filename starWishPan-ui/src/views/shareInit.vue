<template>
    <div  style="display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;height:100vh;width: 100%;background-color: #eef2f6;">
        <div>
            <div class="title">
                <img src="/logo.svg" style="width:80px;height: 80px;" alt=""><span>星语云盘</span>
            </div>
            <div style="width: 400px;" v-loading.fullscreen.lock="pageLoading">
                <div style="display: flex;align-items: center;cursor: pointer;border-radius:6px 6px 0px 0px;background-color: #409eff;padding: 10px 20px;">
                    <img :src="user.qqAvatar" style="height: 46px;width: 46px;border-radius:46px;">
                    <span style="margin-left: 10px;font-size: 16px;color:white;font-weight: bold">{{ user.nickName }}</span>
                </div>
                <div style="border-radius:0px 0px 6px 6px;padding:30px 20px;height: 120px;background-color: #ffffff;">
                    <div style="color:#666666;margin-bottom: 20px;font-weight: bold">请输入提取码：</div>
                    <el-form-item>
                        <el-row :gutter="10">
                            <el-col :span="17">
                                <el-input v-model="pwd" />
                            </el-col>
                            <el-col :span="7" >
                                <el-button type="primary" @click="checkPwd">
                                    提取文件
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive,onMounted} from 'vue'
import { useRoute,useRouter} from 'vue-router'
import {getUserByShare} from '@/api/userApi'
import shareApi from '@/api/share'
const pwd = ref('')
const route = useRoute();
const router = useRouter();
const user = ref({
    nickName:'',
    qqAvatar:'',
})
const checkPwd=async ()=>{
    let shareId = route.params.shareId;
    let result = await shareApi.checkPwd(shareId,pwd.value);
    if(result.data.code == 0){
        router.push({path:`/s/${shareId}`,query:{'pwd':pwd.value}})
    }else{
        ElMessage({
            type:'error',
            message:'提取码错误'
        })
    }
    

}
const pageLoading = ref(false)
onMounted(async ()=>{
    pageLoading.value = false;
    pwd.value = route.query.pwd;
    let result = await getUserByShare(route.params.shareId);
    if(result.data.code == 0){
        user.value = result.data.data
    }
    
})
</script>

<style lang="scss" scoped>
.title {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: black;
    font-weight: bold;
    margin-bottom: 50px;
}
</style>