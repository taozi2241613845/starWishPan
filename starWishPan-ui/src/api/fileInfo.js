import api from "./api"
 const fileInfoApi = {
    list:(filePid = 0,page = 0,pageSize = 5,fileType = 0,keyword) => api.get("/fileInfo/list",{params:{filePid,page,pageSize,fileType,keyword}}),
    listRecovery:(page = 0,pageSize = 5) => api.get("/fileInfo/list/recovery",{params:{page,pageSize}}),
    rename:(fileId,fileNewName) => api.get("/fileInfo/rename",{params:{fileId,fileNewName}}),
    createFolder:(fileId,filePid,folderName) => {
        let data = new FormData();
        data.append('fileId',fileId)
        data.append('filePid',filePid)
        data.append('folderName',folderName)
        return api.post("/fileInfo/create/folder",data)
    },
    delete:(fileIds) => {
        let data = new FormData();
        data.append('fileIds',fileIds) 
        return api.post("/fileInfo/delete",data)
    },
    getFolders:(filePid)=>api.get("/fileInfo/get/folders",{params:{filePid}}),
    moveFiles:(fileIds,filePid)=>{
        let data = new FormData();
        data.append('fileIds',fileIds)
        data.append('filePid',filePid)
        return api.post('/fileInfo/move',data);
    },
    downloadFile:(fileId)=>
         api.get(
            '/fileInfo/download',
            {params:{fileId},
            responseType: 'blob'},
        )
    ,
    revert:(ids)=>{
        let data = new FormData();
        data.append('ids',ids)
        return api.post('/fileInfo/revert',data);
    },
    delFile:(ids)=>{
        let data = new FormData();
        data.append('ids',ids)
        return api.post('/fileInfo/del/file',data);
    },
    clearRecovery:()=>{
        return api.post('/fileInfo/clear/recovery');
    },
    importFile:(ids,filePid = 0,shareId,pwd)=>{
        let data = new FormData();
        data.append('ids',ids)
        data.append('filePid',filePid)
        data.append('shareId',shareId)
        data.append('pwd',pwd)
        return api.post('/fileInfo/import',data);
    }
}
export default fileInfoApi