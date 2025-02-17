import api from "@/api/api";
import {reactive,ref} from "vue"
import SparkMD5 from "spark-md5";
export const UPLOAD_STATE = {
    'READY':0,
    'UPLOADING' : 1,
    'COMPLETE' : 2,
};
const uploadList = ref([])
class FileListItem{
    constructor(fileId,file,filePid,totalChunks){
        this.fileId = fileId
        this.file = file
        this.filePid = filePid
        this.fileMd5 = null;
        this.state = UPLOAD_STATE.READY;
        this.totalChunks = totalChunks
        this.chunkIndex = 0;
        this.progress = 0.0;
        this.uploadSpeed = '0KB/S';//秒为单位，每秒上传的速度，直接返回字符串
        this.okCount = 0;
    }
}
export class SliceUploader {
    uuid() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 32; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23];
        var uuid = s.join("");
        console.log("uuid"+uuid)
        return uuid;
    }
    constructor(opts) {
        if(!SliceUploader.instance){
            SliceUploader.instance = this;
            SliceUploader.instance.target = opts.target;
            SliceUploader.instance.chunkSize = opts.chunkSize || 1024 * 1024;
            SliceUploader.instance.uploading = false;
            SliceUploader.instance.maxUploading = 100;
            SliceUploader.instance.activeUploading = 0;
            
        }
        return SliceUploader.instance;
    }
    async getChunkFile(chunk){
        return new Promise((resolve,reject)=>{
            const reader = new FileReader();
            reader.readAsArrayBuffer(chunk);
            reader.onload = function (e) {
                resolve(e.target.result);
            }
        })
    }
    sliceFile(file,i) {
        const start = i * SliceUploader.instance.chunkSize;
        const end = Math.min(start + SliceUploader.instance.chunkSize, file.size);
        const chunk = file.slice(start, end); // 分割文件
        return chunk;
    }
    async computeTotalFileMd5(file){
        let spark = new SparkMD5();
        if(file.size < 6){
            spark.append(file);
            return spark.end();
        }
        spark.append(file.slice(0,2));
        spark.append(file.slice(file.size/2,file.size/2+2))
        spark.append(file.slice(file.size - 2,file.size))
        let fileMd5 =  spark.end();
        return fileMd5;
    }

    async testMd5(fileItem){
        return api.get(SliceUploader.instance.target,{
            params:{
                'fileId':fileItem.fileId,
                'fileName':fileItem.file.name,
                'filePid':fileItem.filePid, 
                'fileMd5':fileItem.fileMd5
            }
        })
        //返回文件MD5以及
    }
    async addFiles(files,filePid = 0){
        for(const file of files){
            SliceUploader.instance.addFile(file,filePid);
        }
    }
    async addFile(file,filePid = 0){
        let uploader =  SliceUploader.instance;
        let fileId = SliceUploader.instance.uuid();
        let totalChunks = Math.ceil(file.size / uploader.chunkSize);
        let fileItem =  new FileListItem(fileId,file,filePid,totalChunks);
        console.log("fileItemAdded:"+fileItem)
        uploadList.value.push(fileItem)
        if(!uploader.uploading){
            let index = uploadList.value.length - 1;
            uploader.uploadFile(index)
        }
    }
    pause(index){
        uploadList.value[index].state = UPLOAD_STATE.READY
        SliceUploader.instance.uploading = false;
    }
    resume(index){
        if(!SliceUploader.instance.uploading){
            SliceUploader.instance.uploadFile(index);
        }
    }
    close(index){
        uploadList.value.splice(index,1);
        let target = uploadList.value.findIndex((item)=>item.state == UPLOAD_STATE.UPLOADING)
        if(uploadList.value.length == 0){
            SliceUploader.instance.uploading = false;
        }
        if(target == index){
            SliceUploader.instance.uploading = false;
            uploadNext(index)
        }
        
    }
    uploadNext(source){
        let fileItem = uploadList.value.find((item)=>item.state==UPLOAD_STATE.READY);
        for(let i = 0 ; i < uploadList.value.length; i++){
            if(i != source && uploadList.value[i].state == UPLOAD_STATE.READY){
                SliceUploader.instance.uploadFile(i)
                return;
            }
        }
        SliceUploader.instance.uploading = false;
    }

    formatUploadSpeed(Bps){
        if(Bps < 1024){
            return Bps.toFixed(2)+"B/s";
        }else if(Bps < 1024 * 1024){
            return (Bps/1024).toFixed(2)+"KB/s"
        }else {
            return (Bps/1024/1024).toFixed(2)+"MB/s"
        }
    }

    async uploadFile(index) {
        console.log("uploading+"+SliceUploader.instance.uploading)
        if(SliceUploader.instance.uploading)return;
        SliceUploader.instance.uploading = true;
        let uploader =  SliceUploader.instance;
        let fileItem = uploadList.value[index]
        console.log('.uploading....:'+fileItem.file.fileName)

        //计算文件md5会导致用户的上传时间增加，md5的计算应该在后端进行
        // if(fileItem.fileMd5 == null)
        //     fileItem.fileMd5 = await uploader.computeTotalFileMd5(fileItem.file);
        fileItem.fileMd5="dont'computeMd5"
        //状态改成上传
        fileItem.state = UPLOAD_STATE.UPLOADING;
        //启动一个定时任务监听上传速度
        let startTime = new Date().getTime();
        let countUploaded = 0;

        let listenUploadSpeed = setInterval(
            ()=>{
                let endTime = new Date().getTime();
                let spendTime = endTime - startTime;
                let bps = countUploaded*SliceUploader.instance.chunkSize*1000/spendTime;
                //传入一个每秒能上传的字节数，由格式化函数自动转化
                fileItem.uploadSpeed = SliceUploader.instance.formatUploadSpeed(bps);
                console.log("uploadSpeed:" + fileItem.uploadSpeed )
                fileItem.progress = (fileItem.chunkIndex+1 == fileItem.totalChunks)?100:(( (fileItem.chunkIndex/fileItem.totalChunks) * 100).toFixed(2))
                console.log("progress:" + fileItem.progress )
                if(fileItem.progress==100){
                    clearInterval(listenUploadSpeed)
                }
            },1000)
        if(fileItem.chunkIndex == 0){
            let result = await uploader.testMd5(fileItem)
            if(result.data.checkResult){
                fileItem.state = UPLOAD_STATE.COMPLETE;
                fileItem.progress = 100;
                SliceUploader.instance.uploading = false;
                SliceUploader.instance.uploadNext(index)
                return;
            }
        }
        while(fileItem.chunkIndex < fileItem.totalChunks) {
            if(fileItem.state == UPLOAD_STATE.READY){
                //同时关闭定时任务
                clearInterval(listenUploadSpeed)
                SliceUploader.instance.uploadNext(index);
                return;//状态为暂停，结束上传
            } 
            console.log('index:' + fileItem.chunkIndex)
            const chunk = uploader.sliceFile(fileItem.file,fileItem.chunkIndex);
            //组装上传对象
            const formData = new FormData();
            formData.append('chunkIndex', fileItem.chunkIndex); // 可能需要附加分片索引给后端
            formData.append('chunkFile', chunk); // 添加分片到formData
            formData.append('totalChunks',fileItem.totalChunks);
            formData.append('chunkSize',uploader.chunkSize)
            formData.append('currentChunkSize',chunk.size)
            formData.append('fileId',fileItem.fileId);
            formData.append('fileName',fileItem.file.name);
            formData.append('fileMd5',fileItem.fileMd5);
            formData.append('filePid',fileItem.filePid);
            // let startTime = new Date().getTime();
            try {
                let result = await api.post(uploader.target,formData)
                if(result.data.code == 0){
                    countUploaded++;
                    // let spendTime = new Date().getTime() - startTime;//毫秒级别
                    // fileItem.uploadSpeed = SliceUploader.instance.formatUploadSpeed(spendTime)
                    // console.log("uploadSpeed:" + fileItem.uploadSpeed )
                    // console.log("chunkSize"+chunk.size)
                    // console.log("fileSize"+fileItem.file.size)    
                    // fileItem.progress = (fileItem.chunkIndex+1 == fileItem.totalChunks)?100:(( (fileItem.chunkIndex/fileItem.totalChunks) * 100).toFixed(2))
                    // console.log("progress:" + fileItem.progress )
                    if(fileItem.chunkIndex == fileItem.totalChunks - 1){
                        fileItem.state = UPLOAD_STATE.COMPLETE;
                        //可能提前关闭导致最后的进度展现失败
                        
                        //上传完成，尝试上传下一个非暂停任务
                        SliceUploader.instance.uploading = false;
                        SliceUploader.instance.uploadNext(index)
                        return;
                    }
                }
                fileItem.chunkIndex++;
                
            } catch (error) {
                break;
            }
            
            
        }
    }
}
 const uploader = new SliceUploader({
    target:'/chunkInfo/chunk'
});
export  function useUploader() {
    return {
      uploader,uploadList
    }
  }