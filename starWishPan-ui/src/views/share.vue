<template>
    <div style="display: flex;">
        <div
            style="width: 200px;padding: 20px 10px;display: flex;flex-direction: column;justify-content: space-between; box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);">
            <div class="file-type">
                <div :class="{ 'file-type-active': activeFileType == 0 }"><span></span>分享链接</div>
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
                <el-button type="primary" :disabled="selectionRowsCount > 1 || selectionRowsCount == 0"
                    @click="copyLink(fileListTableRef.getSelectionRows()[0].shareLink)">
                    <span class="iconfont icon-link"></span>复制链接
                </el-button>
                <el-button type="primary" @click="cancelShare">
                    <span class="iconfont icon-cancel"></span>取消分享
                </el-button>
            </div>
            <!-- 文件导航 -->

            <div style="flex:1;">
                <el-table v-loading="fileListloading" ref="fileListTableRef" @cell-mouse-enter="tableRowMouseEnter"
                    @cell-mouse-leave="tableRowMouseLeave" :data="shareList" style="width: 100%;height: 350px;"
                    :scrollbar-always-on="true">
                    <el-table-column type="selection" />
                    <el-table-column prop="fileName" label="分享文件" width="240">
                        <template #default="scope">
                            <div style="display: flex; align-items: center;">
                                <img :src="MediaUtil.getFileCover(scope.row.fileName, scope.row.folderType)"
                                    style="width: 32px;height:32px;">
                                <span class="link-hover single-line-ellipsis" style="margin-left: 10px;">{{
                    scope.row.fileName }}</span>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column prop="createTime" label="分享时间" />
                    <el-table-column prop="expireTime" label="过期时间">
                        <template #default="scope">
                            <div v-show="rowIdHovered != scope.row.shareId">{{ scope.row.expireTime }}</div>
                            <div class="fileOp-box" v-show="rowIdHovered == scope.row.shareId">
                                <span class="iconfont icon-link" @click="copyLink(scope.row.shareLink)">复制链接</span>
                                <span class="iconfont icon-cancel" @click="cancelShare(scope.row.shareId)">取消分享</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="visitCount" label="浏览次数" />
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
import shareApi from '@/api/share'
import { useRouter } from 'vue-router';
import MediaUtil from '@/components/MediaUtil'
const emit = defineEmits(['onUpload'])
const fileRenaming = ref(null);
const fileNewName = ref('');
const activeFileType = ref(0);
const router = useRouter()
const userStore = useUserStore();
const shareList = ref([]);
const pageOpts = ref([7, 15, 30, 50, 100]);
const pageSize = ref(pageOpts.value[0]);
const currentPage = ref(1);
const pages = ref(1);
const totalRecords = ref(0);
const currentPathPid = ref(0);
const goPage = ref(null);
const rowIdHovered = ref(null);
const fileListTableRef = ref(null);
const shareIdsSelected = ref([])
const fileListloading = ref(false)
const tableRowHovered = ref(null)
const user = computed(()=>{
    return userStore.user;
})
const cancelShare = async (id) => {
    let res;
    if (id == null) {
        res = await shareApi.removeShare([id])
    } else {
        let rows = fileListTableRef.value.getSelectionRows();
        let ids = rows.map((row) => row.shareId);
        res = await shareApi.removeShare(ids)
    }
    if (res.data.code == 0) {
        ElMessage({
            type: 'success',
            message: '取消分享成功'
        })
    }
    changePage();
}
const copyLink = async (linkText) => {
    ElMessage({
        type: 'success',
        message: '已成功复制分享链接，快去告诉你的朋友吧'
    })
    await navigator.clipboard.writeText(linkText);
}
const tableRowMouseEnter = (row, column) => {
    rowIdHovered.value = row.shareId;
    tableRowHovered.value = row;
}
const tableRowMouseLeave = (row, column) => {
    if (rowIdHovered.value = row.shareId) {
        rowIdHovered.value = null;
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
        console.log(currentPage.value)
        let result = await shareApi.listPage(currentPage.value, pageSize.value);
        fileListloading.value = false;
        shareList.value = result.data.data;
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
    changePage()
}
const spacePercentageInfo = computed(() => {
    let totalSpaceInfo = MediaUtil.formatFileSize(user.value.totalSpace);
    let userSpaceInfo = MediaUtil.formatFileSize(user.value.userSpace);
    return userSpaceInfo+"/"+totalSpaceInfo;
})
const selectionRowsCount = computed(() => {
    if (fileListTableRef.value == null) return 0;
    return fileListTableRef.value.getSelectionRows().length;
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