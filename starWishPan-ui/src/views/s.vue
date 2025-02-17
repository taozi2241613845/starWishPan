<template>
    <div>
        <div class="home-top">
            <div class="title">
                <img src="/logo.svg" style="width: 40px;height: 40px;" alt=""><span>星语云盘</span>
            </div>
        </div>
        <div style="display: flex;flex-direction: column;width:900px;margin: 0px auto;">
            <div
                style="font-size:14px;color:#636d7e;;padding: 10px 0px;align-items: center;display: flex;border-bottom: 1px solid #dddddd;">
                <img :src="user.qqAvatar" style="margin: 0px 10px;border-radius: 50px;width:50px;height:50px" />
                <div style="flex: 1;">
                    <span>{{user.nickName }}</span><span>分享于：{{shareInfo.createTime}}</span>
                    <div style="margin-top: 10px;">分享文件：{{fileInfo.fileName}}</div>
                </div>
                <div>
                    <!-- <el-button style="margin-right:10px;" type="primary" v-show="shareOwner" @click="cancelShare(shareInfo.shareId)">
                        取消分享
                    </el-button> -->

                    <el-button type="primary"  :disabled="selectionRowsCount == 0"
                    @click="showMoveFileDialg()">
                    <span class="iconfont icon-import"></span>批量转存
                </el-button>
                </div>
            </div>
            <div style="padding: 20px 20px;flex:1;display: flex;flex-direction: column;">
                <!-- 文件导航 -->
                <div class="file-nav" style="color:#06a7ff;display:flex;font-size: 14px;margin: 10px 0px;">
                    <div v-show="pathStack.length > 1">
                        <span style="cursor:pointer;" @click="returnLastLevel">返回上一级</span>
                        <span style="color:#dfdff4;">|</span>
                    </div>

                    <div v-for="(item, index) in pathStack">
                        <span
                            :class="{ 'file-nav-item': index != pathStack.length - 1, 'file-nav-item-disabled': index == pathStack.length - 1 }"
                            @click="moveToFileByIndex(index)">{{ item.fileName }}</span><span style="color:#dfdff4;"
                            v-show="index != pathStack.length - 1">></span>
                    </div>

                </div>
                <div style="flex:1;">
                    <el-table v-loading="fileListloading" ref="fileListTableRef" @cell-mouse-enter="tableRowMouseEnter"
                        @cell-mouse-leave="tableRowMouseLeave" :data="fileInfoVOList" style="width: 100%;height: 350px;"
                        :scrollbar-always-on="true">
                        <el-table-column type="selection" />
                        <el-table-column prop="fileName" label="文件名" width="200">
                            <template #default="scope">
                                <div style="display: flex; align-items: center;cursor:pointer;"
                                    @click="scope.row.folderType == 0 ? movePath(scope.row.fileId, scope.row.fileName) : null">
                                    <img :src="MediaUtil.getFileCover(scope.row.fileName, scope.row.folderType)"
                                        style="width: 32px;height:32px;">
                                    <span class="link-hover single-line-ellipsis"
                                        v-show="fileRenaming != scope.row.fileId" style="margin-left: 10px;">{{
                        scope.row.fileName }}</span>
                                    <div v-show="fileRenaming == scope.row.fileId">
                                        <el-input v-model="fileNewName" :id="scope.row.fileId + '-input'"></el-input>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column width="200">
                            <template #default="scope">
                                <div style="display: flex; align-items: center">
                                    <div class="fileOp-box"
                                        v-show="fileIdHover == scope.row.fileId && fileRenaming != scope.row.fileId">
                                        <span class="iconfont icon-import" @click="showMoveFileDialg(scope.row,true)    "></span>
                                        <span class="iconfont icon-download" v-show="scope.row.folderType == true"
                                            @click="toDownloadFile"></span>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="lastUpdateTime" label="修改时间" width="300" />
                        <el-table-column prop="fileSizeFormat" label="大小" />
                    </el-table>
                </div>
                <div class="bottom-pagination"
                    style="color:#636d7e;display: flex;align-items: center;justify-content: right;">
                    <div>共{{ totalRecords }}条</div>
                    <div>
                        <el-select v-model="pageSize" size="large" style="width: 140px" @change="pageSizeChange">
                            <el-option v-for="item in pageOpts" :key="item" :label="`${item}条/页`" :value="item">
                                <div style="text-align:center;">{{ item }}条/页</div>
                            </el-option>
                        </el-select>
                    </div>
                    <div>
                        <el-pagination background layout="prev, pager, next" @current-change="pageChangeFunc"
                            v-model:current-page="currentPage" :page-count="pages" />
                    </div>
                    <div>
                        前往<el-input style="width:50px;" @blur="goPageFunc()" v-model="goPage"></el-input>页
                    </div>
                </div>
            </div>

            <el-dialog v-model="moveFileDialgVisible" title="保存到自己的网盘" width="500" :before-close="moveFileDialgClose">
                <div>
                    <div class="file-nav" style="color:#06a7ff;display:flex;font-size: 14px;margin: 10px 0px;">
                        <div v-show="pathStackToMoveFile.length > 1">
                            <span style="cursor:pointer;" @click="returnLastLevelMoveDialg">返回上一级</span>
                            <span style="color:#dfdff4;">|</span>
                        </div>

                        <div v-for="(item, index) in pathStackToMoveFile">
                            <span
                                :class="{ 'file-nav-item': index != pathStackToMoveFile.length - 1, 'file-nav-item-disabled': index == pathStackToMoveFile.length - 1 }"
                                @click="moveByIndexInMoveDialog(index)">{{ item.fileName }}</span><span
                                style="color:#dfdff4;" v-show="index != pathStackToMoveFile.length - 1">></span>
                        </div>

                    </div>
                    <div v-loading="folderListLoding">
                        <div v-for="(item) in foldersToMoveFile">
                            <div @click="enterFolder(item.fileId, item.fileName)"
                                style="cursor:pointer;display:flex;align-items: center;">
                                <img :src="MediaUtil.getFileCover(item.fileName, item.folderType)"
                                    style="width: 32px;height:32px;">
                                <span class="link-hover single-line-ellipsis" style="margin: 10px;">{{ item.fileName
                                    }}</span>

                            </div>
                        </div>
                    </div>
                </div>

                <template #footer>
                    <div>
                        <el-button @click="moveFileDialgVisible = false">取消</el-button>
                        <el-button type="primary" @click="confirmMoveFile">
                            保存到此处
                        </el-button>
                    </div>
                </template>
            </el-dialog>
            <a ref="downloadLinkRef" style="display:none;"></a>
        </div>
    </div>

</template>
<script setup>
import { ref, reactive, onMounted, computed, nextTick, defineEmits, callWithAsyncErrorHandling, onBeforeMount } from 'vue'
import fileInfoApi from '@/api/fileInfo'
import {getUserByShare} from '@/api/userApi'
import shareApi from '@/api/share'
import { useRouter ,useRoute} from 'vue-router';
import uuid from '@/components/uuid'
import { useUploader } from '@/components/uploader';
import MediaUtil from '@/components/MediaUtil'
import { useUserStore } from '@/store/store'
const shareInfo = ref({});
const fileInfo = ref({})
const emit = defineEmits(['onUpload'])
const downloadLinkRef = ref(null)
const fileRenaming = ref(null);
const fileNewName = ref('');
const route = useRoute()
const router = useRouter()
const uploaderRef = ref(null)


const userStore = useUserStore();
const loginUser = computed(()=>{
    return userStore.user;
})
const shareOwner = ref(false)
const user = ref({
    nickName:'',
    qqAvatar:''
});
const fileInfoVOList = ref([]);
const pageOpts = ref([7, 15, 30, 50, 100]);
const pageSize = ref(pageOpts.value[0]);
const currentPage = ref(1);
const pages = ref(1);
const totalRecords = ref(0);
const currentPathPid = ref(0);
const goPage = ref(null);
const fileIdHover = ref(null);
const fileListTableRef = ref(null);
const fileIdsSelected = ref([])
const moveFileDialgVisible = ref(false)
const pathStackToMoveFile = ref([
    { fileId: 0, fileName: '全部文件' }
])
const currentFilePidToMoveFile = ref(0)
const foldersToMoveFile = ref([])
const fileListloading = ref(false)
const folderListLoding = ref(false)
const shareDialogVisible = ref(false)
function getFileNameFromHeader(headers) {
    let contentDisposition = headers['content-disposition'] || '';
    let matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
    return matches != null && matches[1] ? decodeURIComponent(matches[1].replace(/['"]/g, '')) : null;
}
const toDownloadFile = async () => {
    let response = await shareApi.downloadShareFile(route.params.share,route.query.pwd,fileIdHover.value);
    const blob = new Blob([response.data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    let a = downloadLinkRef.value
    a.href = url;
    const fileName = getFileNameFromHeader(response.headers);
    a.download = fileName;
    a.click();
}
const pwd = ref('');
const cancelShare = async (id) => {
    let res;
    res = await shareApi.removeShare([id])
    if (res.data.code == 0) {
        ElMessage({
            type: 'success',
            message: '取消分享成功'
        })
    }
    router.push({name:"homePage"})
}
const confirmMoveFile = async () => {
    let result = await fileInfoApi.importFile(fileIdsSelected.value, currentFilePidToMoveFile.value,route.params.share,route.query.pwd)
    if (result.data.code == 0) {
        ElMessage({
            type: 'success',
            message: '保存文件或文件夹成功'
        })
        changePage();
    } else {
        ElMessage({
            type: 'error',
            message: result.data.msg
        })
    }
    moveFileDialgVisible.value = false
}
const returnLastLevelMoveDialg = () => {
    if (pathStackToMoveFile.value.length <= 1) {
        return;
    }
    pathStackToMoveFile.value.pop()
    console.log(pathStackToMoveFile.value)
    let folder = pathStackToMoveFile.value[pathStackToMoveFile.value.length - 1]
    currentFilePidToMoveFile.value = folder.fileId
    getFolders();
}
const enterFolder = (fileId, fileName) => {
    currentFilePidToMoveFile.value = fileId
    pathStackToMoveFile.value.push({ fileId, fileName })
    getFolders();
}
const moveByIndexInMoveDialog = (index) => {
    let len = pathStackToMoveFile.value.length;
    if (index == len - 1) {
        return;
    }
    pathStackToMoveFile.value.splice(index + 1, len - index + 1)
    let folder = pathStackToMoveFile.value[index]
    currentFilePidToMoveFile.value = folder.fileId;
    getFolders();
}
const moveFileDialgClose = () => {
    moveFileDialgVisible.value = false;
}
const showMoveFileDialg = (row, isSingle = false) => {
    if(loginUser.value.nickName == null){
        ElMessage({
            type:'info',
            message:'请先登录'
        })
        router.push({name:'loginForm',query:{'back':true}})
        return;
    }
    currentFilePidToMoveFile.value = 0;
    fileIdsSelected.value = [];
    pathStackToMoveFile.value = [
        { fileId: 0, fileName: '全部文件' }
    ]
    if (isSingle) {
        fileIdsSelected.value = [row.fileId];
        console.log("single:" + fileIdsSelected.value[0])
    } else {
        let rows = fileListTableRef.value.getSelectionRows();
        fileIdsSelected.value = rows.map(row => row.fileId)
        console.log(fileIdsSelected.value[0] + fileIdsSelected.value[1])
    }
    moveFileDialgVisible.value = true;
    getFolders();
}

const getFolders = async () => {
    folderListLoding.value = true;
    let result = await fileInfoApi.getFolders(currentFilePidToMoveFile.value);
    foldersToMoveFile.value = result.data.data;
    folderListLoding.value = false;
}
//路径栈，每个元素有两个属性 1.fileId  2.fileName
const pathStack = ref([
    { fileId: 0, fileName: '全部文件' }
])
const moveToFileByIndex = (index) => {
    let len = pathStack.value.length;
    if (index == len - 1) {
        return;
    }
    pathStack.value.splice(index + 1, len - index + 1)
    let folder = pathStack.value[index]
    currentPathPid.value = folder.fileId;
    changePage();
}
const movePath = (fileId, fileName) => {
    currentPathPid.value = fileId;
    pathStack.value.push({ fileId, fileName })
    console.log(pathStack.value[0])
    changePage();
}
const returnLastLevel = () => {
    if (pathStack.value.length <= 1) {
        return;
    }
    pathStack.value.pop()
    console.log(pathStack.value)
    let folder = pathStack.value[pathStack.value.length - 1]
    currentPathPid.value = folder.fileId
    changePage();
}
const selectionRowsCount = computed(() => {
    if (fileListTableRef.value == null) return 0;
    return fileListTableRef.value.getSelectionRows().length;
})
const tableRowHovered = ref(null)
const tableRowMouseEnter = (row, column) => {
    fileIdHover.value = row.fileId;
    tableRowHovered.value = row;
}
const tableRowMouseLeave = (row, column) => {
    if (fileIdHover.value = row.fileId) {
        fileIdHover.value = null;
    };
}

const pageSizeChange = () => {
    changePage()
}
const goPageFunc = async () => {
    const isPositiveInteger = /^\d+$/;
    if (!goPage.value || !isPositiveInteger.test(goPage.value) || goPage.value > pages.value) return;
    currentPage.value = goPage.value;
    changePage();
}
const changePage = async () => {
    try {
        fileListloading.value = true;
        let result = await shareApi.filePageList(currentPathPid.value,pwd.value,route.params.share, currentPage.value, pageSize.value);
        if(result.data.code !=0){
            returnCheckPwd();
        }
        fileListloading.value = false;
        fileInfoVOList.value = result.data.data;
        currentPage.value = result.data.currentPage;
        pages.value = result.data.pages;
        totalRecords.value = result.data.totalRecords;
        pageSize.value = result.data.pageSize;
    } catch (error) {

    }
}
const returnCheckPwd = ()=>{
    let shareId = route.params.share;
        router.push({
            name:'shareInit',
            params:{
                shareId
            }
    })
}
onMounted(async () => {
    // 不支持就用不了    
    if(route.query.pwd == null){
        returnCheckPwd();
    }
    pwd.value = route.query.pwd;
    let result = await getUserByShare(route.params.share);
    if(result.data.code == 0){
        user.value = result.data.data
        shareInfo.value = result.data.shareInfo
        fileInfo.value = result.data.fileInfo
        shareOwner.value = result.data.owner;
    }
    changePage();
})
const pageChangeFunc = () => {
    changePage(currentPathPid)
}
</script>

<style lang="scss" scoped>
.home-top {
    display: flex;
    justify-content: space-between;

    .title {
        display: flex;
        width:900px;
        margin: 0px auto;
        align-items: center;
        font-size: 26px;
        color: #1296db;
        font-weight: 900;
    }

    padding: 10px 30px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}

.share-dialog {
    padding: 10px 30px;

    >div {
        >div {
            margin: 0px 10px;
        }

        display: flex;
        align-items: center;
    }
}

.file-nav {
    >div>span {
        margin-right: 7px;
    }

    .file-nav-item {
        cursor: pointer;
    }

    .file-nav-item-disabled {
        color: #818999;
    }
}

.single-line-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.link-hover:hover {
    color: #06a7ff;

}

.renameFileOpBtn {
    >span {
        background-color: #06a7ff;
        border-radius: 3px;
        font-size: 16px;
        color: white;
        display: inline-block;
        margin: 0px 5px;
        padding: 3px 7px;
        cursor: pointer;
    }
}

.fileOp-box {
    margin-left: 20px;

    >span {
        cursor: pointer;
        color: #409eff;
        margin: 0px 5px;
    }
}

.bottom-pagination {
    div {
        margin: 0px 5px;
    }
}

.file-type {
    >div {
        padding: 10px;
        text-align: center;
        color: #636d7e;
        cursor: pointer;
        border-radius: 4px;

        >span {
            margin-right: 20px;
        }
    }

    >div:hover {
        background-color: #f3f3f3;
    }
}

.file-type-active {
    color: #05a1f5 !important;
    background-color: #eef9fe;
}

.share-link-dialog {
    >div {
        margin-bottom: 12px;

        :first-child {
            width: 70px;
        }

        >div {
            margin-right: 8px;
        }
    }

}
</style>