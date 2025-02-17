const MediaUtil = {
    VIDEO_FORMAT: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'],
    AUDIO_FORMAT: ['mp3', 'flac', 'wav'],
    IMAGE_FORMAT: ['jpg', 'jpeg', 'png', 'bmp', 'webp'],
    DOC_FORMAT: ['doc', 'docx', 'txt', 'rtf', 'pdf', 'md'],
    CODE_FORMAT: ['java', 'c', 'cpp', 'py', 'rb', 'js'],
    CATEGORY_VIDEO: 1,
    CATEGORY_AUDIO: 2,
    CATEGORY_IMAGE: 3,
    CATEGORY_DOC: 4,
    CATEGORY_OTHER: 5,
    TYPE_VIDEO: 1,
    TYPE_AUDIO: 2,
    TYPE_IMAGE: 3,
    TYPE_PDF: 4,
    TYPE_DOC: 5,
    TYPE_EXCEL: 6,
    TYPE_TXT: 7,
    TYPE_CODE: 8,
    TYPE_OTHER:0,
    /**
     * 判断文件的种类，返回一个枚举类型
     * @param {string} format 文件的格式（不包括点）
     * @returns {string} 文件枚举类
     */
    getFileCategory(format) {
      if (!format) {
        return this.CATEGORY_OTHER;
      }
      if (this.VIDEO_FORMAT.includes(format.toLowerCase())) {
        return this.CATEGORY_VIDEO;
      }
      if (this.AUDIO_FORMAT.includes(format.toLowerCase())) {
        return this.CATEGORY_AUDIO;
      }
      if (this.IMAGE_FORMAT.includes(format.toLowerCase())) {
        return this.CATEGORY_IMAGE;
      }
      if (this.DOC_FORMAT.includes(format.toLowerCase())) {
        return this.CATEGORY_DOC;
      }
      return this.CATEGORY_OTHER;
    },
  
    /**
     * 获取文件的类型，有视频，音频，pdf，doc等，返回一个枚举类型，如果不包含这种类型，则返回null
     * @param {string} format
     * @returns {string | null} 文件类型的枚举
     */
    getFileType(format) {
      if (!format) {
        return this.TYPE_OTHER;
      }
      if (this.VIDEO_FORMAT.includes(format.toLowerCase())) {
        return this.TYPE_VIDEO;
      }
      if (this.AUDIO_FORMAT.includes(format.toLowerCase())) {
        return this.TYPE_AUDIO;
      }
      if (this.IMAGE_FORMAT.includes(format.toLowerCase())) {
        return this.TYPE_IMAGE;
      }
      if (format.toLowerCase() === 'pdf') {
        return this.TYPE_PDF;
      }
      if (format.toLowerCase() === 'doc' || format.toLowerCase() === 'docx') {
        return this.TYPE_DOC;
      }
      if (format.toLowerCase() === 'excel') {
        return this.TYPE_EXCEL;
      }
      if (format.toLowerCase() === 'txt') {
        return this.TYPE_TXT;
      }
      if (this.CODE_FORMAT.includes(format.toLowerCase())) {
        return this.TYPE_CODE;
      }
      return this.TYPE_OTHER;
    }, 
    getFileNameExtension(fileName) {
        const lastDotIndex = fileName.lastIndexOf('.');
      
        if (lastDotIndex === -1) {
          // 如果未找到句点（即没有后缀名）
          return '';
        }
      
        // 提取从最后一个句点到字符串结尾的部分作为后缀名
        return fileName.substring(lastDotIndex + 1);
    },
    typeCoverFileNameMap:[
        'others.png','video.png','music.png','image.png','pdf.png','word.png','excel.png','txt.png','code.png'
    ],
    getFileCover(fileName,folderType){
      let typeCoverFileName;
      if(folderType){
        let extName = this.getFileNameExtension(fileName)
        let fileType = this.getFileType(extName)
        typeCoverFileName = this.typeCoverFileNameMap[fileType]
      }else{
        typeCoverFileName = 'folder.png'
      }
        
        const path = new URL(`../assets/icon-image/${typeCoverFileName}`, import.meta.url).href;
        return path;
    }, formatFileSize(fileSize) {
      if (fileSize < 1024) {
        return fileSize + "B";
      } else if (fileSize < 1024 * 1024) {
        return (fileSize / 1024.0).toFixed(2) + "KB";
      } else if (fileSize < 1024 * 1024 * 1024) {
        return (fileSize / 1024.0 / 1024).toFixed(2) + "MB";
      } else {
        return (fileSize / 1024.0 / 1024 / 1024).toFixed(2) + "GB";
      }
    }
  };
  
  export default MediaUtil;