<template>
    <div style="display: flex;">
        <div
            style="width: 200px;padding: 20px 10px;display: flex;flex-direction: column;justify-content: space-between; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);">
            <div class="file-type">
                <div :class="{ 'file-type-active': activeFileType == 0 }" @click="fileTypeChange(0)"><span
                        class="iconfont icon-all"></span>全部</div>
                <div :class="{ 'file-type-active': activeFileType == 1 }" @click="fileTypeChange(1)"><span
                        class="iconfont icon-video"></span>视频</div>
                <div :class="{ 'file-type-active': activeFileType == 2 }" @click="fileTypeChange(2)"><span
                        class="iconfont icon-music"></span>音频</div>
                <div :class="{ 'file-type-active': activeFileType == 3 }" @click="fileTypeChange(3)"><span
                        class="iconfont icon-image"></span>图片</div>
                <div :class="{ 'file-type-active': activeFileType == 4 }" @click="fileTypeChange(4)"><span
                        class="iconfont icon-doc"></span>文档</div>
                <div :class="{ 'file-type-active': activeFileType == 5 }" @click="fileTypeChange(5)"><span
                        class="iconfont icon-more"></span>其他</div>
            </div>
            <div style="color:#606297;font-size: 14px;">
                <div>空间使用</div>
                <el-progress :percentage="(user.userSpace / user.totalSpace * 100).toFixed(2)" />
                <div>{{ spacePercentageInfo }}<span style="float: right;cursor: pointer;"
                        class="iconfont icon-refresh" @click="refreshUser"></span></div>
            </div>
        </div>
        <div style="padding: 20px 20px;flex:1;display: flex;flex-direction: column;">
            <div>
                <input type="file" multiple ref="uploaderRef" @change="uploadFiles" style="display:none;">
                <el-button type="primary" ref="uploadBtnRef" @click="uploaderRef.click()">
                    <span class="iconfont icon-upload"></span>上传
                </el-button>

                <el-button type="success" @click="createFolder" :disabled="tmpFolderId != null">
                    <span class="iconfont icon-folder-add"></span>新建文件夹
                </el-button>
                <el-button type="danger" :disabled="selectionRowsCount === 0" @click="batchDelFile">
                    <span class="iconfont icon-del"></span>批量删除
                </el-button>
                <el-button type="warning" :disabled="selectionRowsCount === 0" @click="showMoveFileDialg">
                    <span class="iconfont icon-move"></span>批量移动
                </el-button>
                <el-input v-model="searchKeyword" placeholder="请输入文件名搜索" style="width:300px;margin-left: 15px;">
                    <template #suffix>
                        <span class="iconfont icon-search" style="cursor:pointer;" @click="keywordChange"></span>
                    </template>
                </el-input>
                <span class="iconfont icon-refresh" @click="changePage"
                    style="color:#636d7e;margin: 15px;cursor: pointer;"></span>
            </div>
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
                                <span class="link-hover single-line-ellipsis" v-show="fileRenaming != scope.row.fileId"
                                    style="margin-left: 10px;">{{
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
                                    <span class="iconfont icon-share1" @click="shareDialogVisible = true"></span>
                                    <span class="iconfont icon-download" v-show="scope.row.folderType == true"
                                        @click="toDownloadFile"></span>
                                    <span class="iconfont icon-del" @click="delSingleFile(scope.row)"></span>
                                    <span class="iconfont icon-edit" @click="renameFileFunc(scope.row)"></span>
                                    <span class="iconfont icon-move" @click="showMoveFileDialg(scope.row, true)"></span>
                                </div>
                                <div class="renameFileOpBtn" v-show="fileRenaming == scope.row.fileId"
                                    style="margin-left:10px;">
                                    <span class="iconfont icon-right1" @click="confirmRenameFile"></span>
                                    <span class="iconfont icon-error"
                                        @click="() => { fileNewName = ''; fileRenaming = null; removeById(fileInfoVOList, tmpFolderId); tmpFolderId = null }"></span>
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
        <el-dialog v-model="delDialogShow" title="删除" width="500" :before-close="delDialogClose">
            <span v-if="fileIdsSelected.length == 1 && delFileName != null">是否要删除文件{{ delFileName }}</span>
            <span v-else>是否要删除这{{ fileIdsSelected.length }}个文件或文件夹</span>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="delDialogShow = false">取消</el-button>
                    <el-button type="danger" @click="delFileConfirm">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <el-dialog v-model="moveFileDialgVisible" title="移动文件或文件夹" width="500" :before-close="moveFileDialgClose">
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
                        移动到此处
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-model="shareDialogVisible" title="分享" width="500"
            :before-close="() => { shareDialogVisible = false }">
            <div class="share-dialog">
                <div style="display: flex;">
                    <div>文件</div>
                    <div>{{ tableRowHovered.fileName }}</div>
                </div>
                <div style="display: flex;">
                    <div>有效期</div>
                    <div>
                        <el-radio-group v-model="shareValidDate" class="ml-4">
                            <el-radio :value="1" size="large">1天</el-radio>
                            <el-radio :value="7" size="large">7天</el-radio>
                            <el-radio :value="30" size="large">30天</el-radio>
                            <el-radio :value="-1" size="large">永久有效</el-radio>
                        </el-radio-group>
                    </div>
                </div>
                <div style="display: flex;">
                    <div>提取码</div>
                    <div>
                        <el-radio-group v-model="sharePwdType" class="ml-4">
                            <el-radio :value="0" size="large">自定义</el-radio>
                            <el-radio :value="1" size="large">系统生成</el-radio>
                        </el-radio-group>
                    </div>
                </div>
                <div>
                    <el-input v-show="sharePwdType == 0" maxlength="4" v-model="sharePwd" style="width:130px;"
                        placeholder="请输入4位提取码"></el-input>
                </div>

            </div>

            <template #footer>
                <div>
                    <el-button @click="shareDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="shareFunc">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <el-dialog v-model="shareLinkVisible" title="分享链接" width="500" :before-close="handleClose">
            <div class="share-link-dialog">
                <div style="display:flex;">
                    <div>分享链接</div>
                    <div style="width:200px;">{{shareUrl}}</div>
                </div>
                <div style="display:flex;">
                    <div>提取码</div>
                    <div>{{sharePass}}</div>
                </div>
            </div>
            <template #footer>
                <div>
                    <el-button @click="shareLinkVisible = false">
                        关闭
                    </el-button>
                    <el-button type="primary" @click="copyShareLlink">
                        复制分享链接
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <a ref="downloadLinkRef" style="display:none;"></a>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed, nextTick, defineEmits, callWithAsyncErrorHandling } from 'vue'
import { useUserStore } from '@/store/store'
import {queryUser} from '@/api/userApi'
import fileInfoApi from '@/api/fileInfo'
import shareApi from '@/api/share'
import { useRouter } from 'vue-router';
import uuid from '@/components/uuid'
import { useUploader } from '@/components/uploader';
import MediaUtil from '@/components/MediaUtil'
const emit = defineEmits(['onUpload'])
const downloadLinkRef = ref(null)
const fileRenaming = ref(null);
const fileNewName = ref('');
const activeFileType = ref(0);
const searchKeyword = ref('');
const router = useRouter()
const uploaderRef = ref(null)
const userStore = useUserStore();
const uploadBtnRef = ref(null);
const fileInfoVOList = ref([]);
const pageOpts = ref([7, 15, 30, 50, 100]);
const pageSize = ref(pageOpts.value[0]);
const currentPage = ref(1);
const pages = ref(1);
const totalRecords = ref(0);
const currentPathPid = ref(0);
const goPage = ref(null);
const fileIdHover = ref(null);
const tmpFolderId = ref(null);
const delDialogShow = ref(false);
const delFileName = ref(null);
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
const shareValidDate = ref(1);
const sharePwdType = ref(0)
const sharePwd = ref('')
const shareLinkVisible = ref(false)
const shareLink = ref('');
const shareUrl = ref('')
const sharePass = ref('')
const user =computed(()=>{
    return userStore.user;
})
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
function getFileNameFromHeader(headers) {
    let contentDisposition = headers['content-disposition'] || '';
    let matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
    return matches != null && matches[1] ? decodeURIComponent(matches[1].replace(/['"]/g, '')) : null;
}
const toDownloadFile = async () => {

    let response = await fileInfoApi.downloadFile(fileIdHover.value);
    const blob = new Blob([response.data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    let a = downloadLinkRef.value
    a.href = url;
    const fileName = getFileNameFromHeader(response.headers);
    a.download = fileName;
    a.click();
}
const shareFunc = async () => {
    console.log(shareValidDate.value)
    console.log(sharePwd.value);
    console.log(tableRowHovered.value.fileId)
    let result =await shareApi.createShare(shareValidDate.value,sharePwd.value,tableRowHovered.value.fileId);
    if(result.data.code == 0){
        shareLink.value = result.data.shareLink;
        shareUrl.value = result.data.link;
        sharePass.value = result.data.sharePwd;
        shareDialogVisible.value = false;
        shareLinkVisible.value = true
    }
}
const copyShareLlink = async ()=>{
    await navigator.clipboard.writeText(shareLink.value);
    ElMessage({
        type:'success',
        message:'已成功复制到剪切板,快去分享给朋友吧'
    })
}
const keywordChange = () => {
    currentPage.value = 1;
    changePage();
}
const confirmMoveFile = async () => {
    console.log(fileIdsSelected.value)
    let result = await fileInfoApi.moveFiles(fileIdsSelected.value, currentFilePidToMoveFile.value)
    if (result.data.code == 0) {
        ElMessage({
            type: 'success',
            message: '移动文件或文件夹成功'
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
    if (fileRenaming) {

    }
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
const removeById = (arr, id) => {
    if (id == null) return
    let indexToRemove = arr.findIndex(item => item.fileId == id);
    arr.splice(indexToRemove, 1)
}
const selectionRowsCount = computed(() => {
    if (fileListTableRef.value == null) return 0;
    return fileListTableRef.value.getSelectionRows().length;
})
const delFileConfirm = async () => {
    try {
        let result = await fileInfoApi.delete(fileIdsSelected.value)
        if (result.data.code == 0) {
            ElMessage({
                type: 'success',
                message: '删除成功'
            })
            changePage();
        } else {
            ElMessage({
                type: 'error',
                message: '删除失败'
            })
        }
    } catch (error) {

    }

    delDialogShow.value = false;

}
const delDialogClose = () => {
    delFileName.value = null;
    fileIdsSelected.value = [];
    delDialogShow.value = false;
}
const batchDelFile = () => {
    let rows = fileListTableRef.value.getSelectionRows();
    fileIdsSelected.value = rows.map(row => row.fileId)
    delDialogShow.value = true;
}
const delSingleFile = async (row) => {
    delFileName.value = row.fileName;
    fileIdsSelected.value = [row.fileId];
    delDialogShow.value = true;
}
const createFolder = async () => {
    tmpFolderId.value = uuid();
    fileInfoVOList.value.push({
        fileId: tmpFolderId,
        fileName: '',
        folderType: false,
    })
    fileRenaming.value = tmpFolderId.value
    fileNewName.value = ''
    await nextTick();
    let inputDom = document.getElementById(tmpFolderId.value + "-input");
    inputDom.focus()

}
const confirmRenameFile = async () => {
    if (fileNewName.value.length == 0) {
        ElMessage({
            type: 'error',
            message: '文件或文件夹名不能为空'
        })
        return;
    }
    if (tmpFolderId.value != null) {
        try {
            let result = await fileInfoApi.createFolder(fileRenaming.value, currentPathPid.value, fileNewName.value)
            if (result.data.code == 0) {
                ElMessage({
                    type: 'success',
                    message: '添加文件夹成功'
                })
                changePage();
                fileRenaming.value = null;
                fileNewName.value = ''
                tmpFolderId.value = null;
            } else {
                ElMessage({
                    type: 'error',
                    message: result.data.msg
                })
            }
            return;
        } catch (error) {

        }
    }
    try {
        let result = await fileInfoApi.rename(fileRenaming.value, fileNewName.value)

        if (result.data.code == 0) {
            changePage();
            fileRenaming.value = null;
            fileNewName.value = ''
        } else {
            ElMessage({
                type: 'error',
                message: result.data.msg
            })
        }


    } catch (error) {

    }
}
const renameFileFunc = async (row) => {
    removeById(fileInfoVOList.value, tmpFolderId.value)
    //防止有人在新建文件夹时重命名文件
    tmpFolderId.value = null;
    fileRenaming.value = fileIdHover.value;
    fileNewName.value = row.fileName;
    await nextTick();
    let inputDom = document.getElementById(row.fileId + "-input");
    inputDom.focus()
    let dotPos = fileNewName.value.lastIndexOf('.')
    inputDom.setSelectionRange(0, dotPos == -1 ? fileNewName.value.length : dotPos)
}
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
const fileTypeChange = (fileType) => {
    activeFileType.value = fileType;
    changePage();
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
        let result = await fileInfoApi.list(currentPathPid.value, currentPage.value, pageSize.value, activeFileType.value, searchKeyword.value);
        fileListloading.value = false;
        fileInfoVOList.value = result.data.data;
        currentPage.value = result.data.currentPage;
        pages.value = result.data.pages;
        totalRecords.value = result.data.totalRecords;
        pageSize.value = result.data.pageSize;
    } catch (error) {

    }
}

onMounted(async () => {
    // 不支持就用不了
    changePage();
})
const pageChangeFunc = () => {
    changePage(currentPathPid)
}
const uploadFiles = async () => {
    emit('onUpload')
    useUploader().uploader.addFiles(uploaderRef.value.files,currentPathPid.value)
}
const spacePercentageInfo = computed(() => {
    let totalSpaceInfo = MediaUtil.formatFileSize(user.value.totalSpace);
    let userSpaceInfo = MediaUtil.formatFileSize(user.value.userSpace);
    return userSpaceInfo+"/"+totalSpaceInfo;
})
</script>

<style lang="scss" scoped>
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
.share-link-dialog{
    >div{
        margin-bottom:12px;
        :first-child{
            width:70px;
        }
        >div{
            margin-right:8px;
        }
    }

}
</style>