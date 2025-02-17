<template>
    <div class="home-container">
        <div class="home-top">
            <div class="title">
                <img src="/logo.svg" style="width: 40px;height: 40px;" alt=""><span>星语云盘</span>
            </div>
            <div class="end" style="display: flex;align-items: center;position: relative;">

                <span @click="showTransferDialog = !showTransferDialog" class="iconfont icon-transfer"
                    style="color: #636d7e;font-size: 18px;cursor: pointer;"></span>
                <div v-show="showTransferDialog"
                    style="display:flex;flex-direction: column;width: 700px;background-color: white;height: 400px;position: absolute;right: 20px;top: 75px;z-index: 10;border-radius: 5px;box-shadow: 0 2px 8px 0 rgba(0,0,0,.16);">
                    <div
                        style="font-size: 15px;font-weight:bold;color:#454d5a;padding: 20px 20px;border-bottom:2px #fbfbfb solid;">
                        上传完成{{ successCount + '/' + uploadList.length }} </div>
                    <div style="flex:1;overflow-y: auto;">
                        <div v-for="(item, index) in uploadList"
                            style="display: flex;align-items: center;border-bottom:2px #fbfbfb solid;padding: 10px 0px;">
                            <img style="width: 40px;height: 40px;margin: 0px 10px;"
                                :src="MediaUtil.getFileCover(item.file.name, true)">
                            <div style="flex:1;">
                                <div style="font-weight:500;">{{ item.file.name }}</div>
                                <div v-show="item.progres != 100"><el-progress :percentage="item.progress" /></div>
                                <div style="display: flex;justify-content: space-between;font-size: 14px;">
                                    <div style="color:#aaa1b3;">{{ MediaUtil.formatFileSize(item.file.size) }}</div>
                                    <div style="color:#06a7ff;">{{ item.uploadSpeed }}</div>
                                </div>
                            </div>
                            <div class="upload-ctrl-btn" style="width:100px;">
                                <img src="@/assets/icon-image/pause.png" v-show="item.state == UPLOAD_STATE.UPLOADING"
                                    @click="() => { uploader.pause(index) }" />
                                <img src="@/assets/icon-image/upload.png" v-show="item.state == UPLOAD_STATE.READY"
                                    @click="() => { uploader.resume(index) }" />
                                <img src="@/assets/icon-image/del.png" v-show="item.state != UPLOAD_STATE.COMPLETE"
                                    @click="() => { uploader.close(index); chunkApi.removeChunk(item.fileId) }" />
                                <img src="@/assets/icon-image/clean.png" v-show="item.state == UPLOAD_STATE.COMPLETE"
                                    @click="() => { uploader.close(index); }" />
                            </div>
                        </div>
                    </div>

                </div>
                <el-tooltip placement="top" effect="light">
                    <template #content>
                        <div class="top-right-tooltip">
                            <div @click="modifyPwdDialogShow = true">修改密码</div>
                            <div @click="modifyAvatarDialogShow = true">上传头像</div>
                            <div @click="logoutFunc()">退出登录</div>
                        </div>
                    </template>
                    <div style="display: flex;align-items: center;cursor: pointer;margin-left: 28px;">
                        <img :src="userStore.user.qqAvatar" style="height: 46px;width: 46px;border-radius:46px;">
                        <span style="margin-left: 10px;">{{ userStore.user.nickName}}</span>
                    </div>
                </el-tooltip>
            </div>
        </div>
        <div class="home-main">
            <div class="nav">
                <router-link to="/home/homePage" :class="{ activeNav: activeNavIndex == 0 }" @click="activeNavIndex = 0">
                    <span class="iconfont icon-cloude"></span>
                    <div>首页</div>
                </router-link>
                <router-link to="/home/share" :class="{ activeNav: activeNavIndex == 1 }" @click="activeNavIndex = 1">
                    <span class="iconfont icon-share"></span>
                    <div>分享</div>
                </router-link>
                <router-link to="/home/recovery" :class="{ activeNav: activeNavIndex == 2 }" @click="activeNavIndex = 2">
                    <span class="iconfont icon-del"></span>
                    <div>回收站</div>
                </router-link>
            </div>
            <router-view @onUpload="showTransferDialog = true" class="content" style="flex:1;"
                to="/home/homePage"></router-view>
        </div>
        <el-dialog v-model="modifyPwdDialogShow" title="修改密码" width="500"
            :before-close="resetForm()"><!--Object.assign(modifyPwdData,{ oldPwd:'',newPwd:'',checkNewPwd:'',})-->
            <el-form :rules="modifyPwdRules" :model="modifyPwdData" style="padding: 10px 40px;" ref="modifyPwdFormRef">
                <el-form-item prop="oldPwd" label="旧密码">
                    <el-input v-model="modifyPwdData.oldPwd" type="password"></el-input>
                </el-form-item>
                <el-form-item prop="newPwd" label="新密码">
                    <el-input v-model="modifyPwdData.newPwd" type="password"></el-input>
                </el-form-item>
                <el-form-item prop="checkNewPwd" label="确定密码">
                    <el-input v-model="modifyPwdData.checkNewPwd" type="password"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="modifyPwdDialogShow = false">关闭</el-button>
                    <el-button type="primary" @click="modifyPwdFunc()">
                        确认
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-model="modifyAvatarDialogShow" title="修改头像" width="500" :before-close="resetForm()">
            <div style="border-top:1px solid #e7e7e7;padding:10px 30px;" class="modifyAvatarBox">
                <div>
                    <div>昵称</div>
                    <div>{{ userStore.user.nickName }}</div>
                </div>
                <div>
                    <div style="align-self:center;">头像</div>
                    <div>
                        <el-image style="width:150px;height:150px;" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2"
                            :preview-src-list="[userStore.user.qqAvatar]" fit="cover"
                            :src="userStore.user.qqAvatar" />
                    </div>
                    <div>
                        <input type="file" ref="avatarUploaderRef" @change="toUploadAvatar" style="display:none;"/>
                        <el-button type="primary" @click="avatarUploaderRef.click()" style="position: absolute;">选择</el-button>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="modifyAvatarDialogShow = false">关闭</el-button>
                    <el-button type="primary" @click="modifyAvatarDialogShow = false">
                        确认
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed, onBeforeMount } from 'vue'
import { logout, modifyPwd,uploadAvatar,queryUser} from '@/api/userApi'
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/store'
import MediaUtil from '@/components/MediaUtil'
import { useUploader, UPLOAD_STATE } from '@/components/uploader'
const avatarUploaderRef = ref(null);
const modifyAvatarDialogShow = ref(false);
const activeNavIndex = ref(0);
const showTransferDialog = ref(false);
const userStore = useUserStore()
const defaultAvatar = '../../src/assets/head.jpg'


const refreshUser = async()=>{
    let result = await queryUser();
    if(result.data.code == 0){
        console.log(result.data.user)
        userStore.setUser(result.data.user)
    }else{
        ElMessage({
            type:'info',
            message:'请先登录'
        })
        router.push({name:'loginForm'})
    }
}

const toUploadAvatar = async()=>{
    if(avatarUploaderRef.value.files.length != 1) return
    let result = await uploadAvatar(avatarUploaderRef.value.files[0])
    if(result.data.code == 0) {
        ElMessage({
            type:'success',
            message:'上传头像成功'
        })
        refreshUser();
    }
}
const modifyPwdData = reactive({
    oldPwd: '',
    newPwd: '',
    checkNewPwd: '',
})
const router = useRouter()
const modifyPwdFormRef = ref(null);
const modifyPwdDialogShow = ref(false);
const successCount = computed(() => {
    let count = 0;
    for (const item of uploadList.value) {
        console.log('state' + item.state)
        console.log('uploadState' + UPLOAD_STATE.COMPLETE)
        if (item.state == UPLOAD_STATE.COMPLETE)
            count++;
    }
    return count;
})
const uploader = computed(() => {
    return useUploader().uploader;
})
const uploadList = computed(() => {
    return useUploader().uploadList.value;
})

onBeforeMount(async () => {

    
})
const logoutFunc = async () => {
    let result = await logout();
    if (result.data.code == 0) {
        userStore.setUser(null)
        localStorage.removeItem("tokenExpireTime")
        localStorage.removeItem("token")
        ElMessage({
            type:'success',
            message:'退出登录成功'
            
        })
        router.replace({ name: 'loginForm' })
    }
}
const resetForm = () => {

}
const modifyPwdFunc = async () => {
    let formValid = false;
    await modifyPwdFormRef.value.validate((valid, fields) => {
        formValid = valid
    })
    if (!formValid) return; 
    let data = new FormData();
    data.append('oldPwd', modifyPwdData.oldPwd);
    data.append('newPwd', modifyPwdData.newPwd);
    modifyPwd(data).then((result) => {
        if (result.data.code == 0) {
            ElMessage({
                type: 'success',
                message: '修改成功!'
            })
            modifyPwdDialogShow.value = false;
        } else {
            ElMessage({
                type: 'error',
                message: '错误，请检查密码和网络'
            })
        }
    }).catch((err) => {

    });

}

const oldPwdValidator = (rule, value, callback) => {
    const reg = /^[A-Za-z0-9._~!@#$^&*]{8,18}$/;
    if (value === '') {
        callback(new Error('请输入旧密码'))
    } else if (!reg.test(value)) {
        callback(new Error('密码只能是数字，字母，特殊字符 8-18位'))
    } else {
        if (modifyPwdData.newPwd !== '') {
            modifyPwdFormRef.value.validateField('newPwd', () => null)
        }
        callback()
    }
}
const newPwdValidator = (rule, value, callback) => {
    const reg = /^[A-Za-z0-9._~!@#$^&*]{8,18}$/;
    if (value === '') {
        callback(new Error('请输入新密码'))
    } else if (!reg.test(value)) {
        callback(new Error('密码只能是数字，字母，特殊字符 8-18位'))
    } else if (modifyPwdData.oldPwd == value) {
        callback(new Error('新密码和旧密码不能一样'))
    } else {
        if (modifyPwdData.checkNewPwd !== '') {
            modifyPwdFormRef.value.validateField('checkNewPwd', () => null)
        }
        callback()
    }
}
const checkNewPwdValidator = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入新密码'))
    } else if (value != modifyPwdData.newPwd) {
        callback(new Error('两次的密码输入不一致'))
    } else {
        callback()
    }
}
const modifyPwdRules = reactive({
    oldPwd: [{ validator: oldPwdValidator, trigger: 'blur', }],
    newPwd: [{ validator: newPwdValidator, trigger: 'blur', }],
    checkNewPwd: [{ validator: checkNewPwdValidator, trigger: 'blur', }],
})
</script>

<style lang="scss" scoped>
.modifyAvatarBox {

    >div {
        display: flex;

        >div {
            margin: 8px 8px;
            display: flex;
            align-items: flex-end;
        }
    }
}

.upload-ctrl-btn {
    >img {
        width: 30px;
        height: 30px;
        margin-left: 10px;
        cursor: pointer;
    }
}

.top-right-tooltip {
    font-size: 16px;

    >div {
        margin: 8px 0px;
        cursor: pointer;
    }

    >div:hover {
        color: #06a7ff;
    }
}

.home-container {
    display: flex;
    height: 100vh;
    flex-direction: column;
}

.home-top {
    display: flex;
    justify-content: space-between;

    .title {
        display: flex;
        align-items: center;
        font-size: 26px;
        color: #1296db;
        font-weight: 900;
    }

    padding: 10px 30px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.home-main {
    display: flex;
    flex: 1;

    .nav {
        box-shadow: 1px 0px 1px rgba(0, 0, 0, 0.1);
        width: 80px;

        >a {
            color: #636d7e;
            display: block;
            padding: 20px 0px;
            text-align: center;

            .iconfont {
                font-size: 28px;
            }

            >div {
                font-weight: bold;
            }
        }

        >a:hover {
            background-color: #f3f3f3;
        }
    }
}

.activeNav {
    color: #1296db !important;
}
</style>