import api from "./api"

const shareApi = {
    createShare : (validDate,sharePwd,fileId) => { 
        let data = new FormData()
        data.append('validDate',validDate)
        data.append("sharePwd",sharePwd);
        data.append("fileId",fileId)
        return api.post("/share/create", data) 
    },
    getComplete : (shareId)=>api.get("/share/get/complete",{
        params:{shareId}
    }),
    getShare : (shareId)=>api.get("/share/get/share",{
        params:{shareId}
    }),
    listPage : (page,pageSize)=> api.get("/share/page/list",{ params:{page,pageSize}}),
    removeShare:(ids)=>{
        let data = new FormData()
        data.append('ids',ids)
        return api.post("/share/remove", data) 
    },
    checkPwd:(shareId,pwd)=>{
        let data = new FormData()
        data.append('shareId',shareId)
        data.append('pwd',pwd)
        return api.post("/share/check/pwd", data) 
    },
    filePageList : (filePid,pwd,shareId,page,pageSize)=>{
        return api.get("/share/file/page/list",{ 
            params:{filePid,shareId,pwd,page,pageSize}
        })
    },
    downloadShareFile:(shareId,pwd,fileId)=>{
        return api.get("/share/download",{ 
            params:{shareId,pwd,fileId}
        })
    }

} 
export default shareApi