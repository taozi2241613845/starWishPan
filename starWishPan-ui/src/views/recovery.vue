<template>
    <div style="display: flex;">
        <div
            style="width: 200px;padding: 20px 10px;display: flex;flex-direction: column;justify-content: space-between; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);">
            <div class="file-type">
                <div :class="{ 'file-type-active': activeFileType == 0 }" @click="fileTypeChange(0)"><span
                       ></span>回收站</div>
            </div>
            <div style="color:#606297;font-size: 14px;">
                <div>空间使用</div>
                <el-progress :percentage="(user.userSpace / user.totalSpace * 100).toFixed(2)" />
                <div>{{ spacePercentageInfo }}<span style="float: right;cursor: pointer;"
                        class="iconfont icon-refresh"></span></div>
            </div>
        </div>
        <div style="padding: 20px 20px;flex:1;display: flex;flex-direction: column;">
            <div>
                <el-button type="primary" @click="clearRecoveryFunc">
                    <span class="iconfont icon-del"></span>清空回收站
                </el-button>
                <el-button type="primary" @click="delFileFunc()">
                    <span class="iconfont icon-del"></span>批量删除
                </el-button>
                <el-button type="primary"  @click="revertFunc()">
                    <span class="iconfont icon-revert"></span>恢复文件
                </el-button>
             </div>
            <!-- 文件导航 -->
            
            <div style="flex:1;">
                <el-table v-loading="fileListloading" ref="fileListTableRef" @cell-mouse-enter="tableRowMouseEnter"
                    @cell-mouse-leave="tableRowMouseLeave" :data="fileInfoVOList" style="width: 100%;height: 350px;"
                    :scrollbar-always-on="true">
                    <el-table-column type="selection" />
                    <el-table-column prop="fileName" label="分享文件" width="350">
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
                    
                    <el-table-column prop="fileSizeFormat" label="大小">
                    </el-table-column>
                    <el-table-column prop="recoveryTime" label="删除时间">
                        <template #default="scope">
                            <div v-show="fileIdHover != scope.row.fileId">
                                {{scope.row.recoveryTime}}
                            </div>
                            <div class="fileOp-box"
                                    v-show="fileIdHover == scope.row.fileId">
                                    <span class="iconfont icon-del" @click="delFileFunc(scope.row.fileId)">删除</span>
                                    <span class="iconfont icon-revert" @click="revertFunc(scope.row.fileId)">还原</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="有效时间" >
                        <template #default="scope">
                            <div >{{scope.row.validDays}}天</div>
                            
                        </template>
                    </el-table-column>
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
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed, nextTick, defineEmits } from 'vue'
import { useUserStore } from '@/store/store'
import fileInfoApi from '@/api/fileInfo'
import { useRouter } from 'vue-router';
import MediaUtil from '@/components/MediaUtil'
const emit = defineEmits(['onUpload'])
const fileRenaming = ref(null);
const fileNewName = ref('');
const activeFileType = ref(0);
const searchKeyword = ref('');
const router = useRouter()
const userStore = useUserStore();
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
const fileListloading = ref(false)
const tableRowHovered = ref(null)
const revertFunc = async (id) => {
    let res;
    if (id != null) {
        res = await fileInfoApi.revert([id])
    } else {
        let rows = fileListTableRef.value.getSelectionRows();
        let ids = rows.map((row) => row.fileId);
        res = await fileInfoApi.revert(ids)
    }
    if (res.data.code == 0) {
        ElMessage({
            type: 'success',
            message: '还原文件成功'
        })
    }
    changePage();
}
const user = computed(()=>{
    return userStore.user;
})
const delFileFunc = async (id) => {
    let res;
    console.log("id"+id)
    if (id != null) {
        res = await fileInfoApi.delFile([id])
    } else {
        let rows = fileListTableRef.value.getSelectionRows();
        let ids = rows.map((row) => row.fileId);
        alert(ids[0])
        res = await fileInfoApi.delFile(ids)
    }
    if (res.data.code == 0) {
        ElMessage({
            type: 'success',
            message: '删除文件成功'
        })
    }
    changePage();
}
const clearRecoveryFunc = async()=>{
    let res = await fileInfoApi.clearRecovery();
    if(res.data.code == 0){
        ElMessage({
            type:'success',
            message:'清除回收站成功'
        })
        changePage();
    }
}
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
        let result = await fileInfoApi.listRecovery( currentPage.value, pageSize.value);
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
const spacePercentageInfo = computed(() => {
    let totalSpaceInfo = MediaUtil.formatFileSize(user.value.totalSpace);
    let userSpaceInfo = MediaUtil.formatFileSize(user.value.userSpace);
    return userSpaceInfo+"/"+totalSpaceInfo;
})
</script>

<style lang="scss" scoped>
.share-dialog{
    padding: 10px 30px;
    
    >div{
        >div{
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

.fileOp-box {
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
</style>