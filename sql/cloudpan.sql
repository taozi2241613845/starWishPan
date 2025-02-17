CREATE DATABASE cloudpan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chunk_info` (  
  `chunk_id` VARCHAR(255) NOT NULL COMMENT '文件块ID',  
  `chunk_size` BIGINT NULL COMMENT '文件块大小',  
  `total_chunks` INT NULL COMMENT '总文件块数',  
  `create_time` DATETIME NULL COMMENT '创建时间',  
  `file_id` VARCHAR(255) NULL COMMENT '文件ID',  
  `chunk_index` INT NULL COMMENT '文件块索引',  
  `chunk_path` VARCHAR(255) NULL COMMENT '文件块路径',  
  `current_chunk_size` BIGINT NULL COMMENT '当前文件块大小',  
  `file_name` VARCHAR(255) NULL COMMENT '文件名',  
  `file_pid` VARCHAR(255) NULL COMMENT '文件父ID',  
  `file_md5` VARCHAR(255) NULL COMMENT '文件MD5',  
  PRIMARY KEY (`chunk_id`)  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件块信息表';

CREATE TABLE `file_info` (  
  `file_id` VARCHAR(255) NOT NULL COMMENT '文件ID',  
  `user_id` VARCHAR(255) NULL COMMENT '用户ID',  
  `file_md5` VARCHAR(255) NULL COMMENT '文件MD5',  
  `file_pid` VARCHAR(255) NULL COMMENT '文件父ID',  
  `file_size` BIGINT NULL COMMENT '文件大小',  
  `file_name` VARCHAR(255) NULL COMMENT '文件名',  
  `file_cover` VARCHAR(255) NULL COMMENT '文件封面',  
  `file_path` VARCHAR(255) NULL COMMENT '文件路径',  
  `create_time` DATETIME NULL COMMENT '创建时间',  
  `last_update_time` DATETIME NULL COMMENT '最后更新时间',  
  `folder_type` TINYINT(1) NULL COMMENT '文件夹类型：0.文件夹 ；1.文件',  
  `file_category` INT NULL COMMENT '文件类型：1.视频 2.音频 3.图片 4.文档 5.其他',  
  `file_type` INT NULL COMMENT '具体文件类型：1.视频 2.音频 3.图片 4.pdf 5.doc 6.excel 7.txt 8.code 9.zip 10.其他',  
  `status` INT NULL COMMENT '状态：0转码成功 1.转码中 2.转码成功',  
  `recovery_time` DATETIME NULL COMMENT '进入回收站时间',  
  `del_flag` TINYINT(1) NULL COMMENT '删除标志：0删除 1回收中 2正常',  
  PRIMARY KEY (`file_id`)  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件信息表';

CREATE TABLE `share` (  
  `share_id` VARCHAR(255) NOT NULL COMMENT '分享ID',  
  `file_id` VARCHAR(255) NULL COMMENT '文件ID',  
  `create_time` DATETIME NULL COMMENT '创建时间',  
  `expire_time` DATETIME NULL COMMENT '过期时间',  
  `user_id` VARCHAR(255) NULL COMMENT '用户ID',  
  `share_pwd` VARCHAR(255) NULL COMMENT '分享密码',  
  `visit_count` INT NULL DEFAULT 0 COMMENT '访问次数',  
  `share_link` VARCHAR(255) NULL COMMENT '分享链接',  
  `valid_days` INT NULL COMMENT '有效天数',  
  PRIMARY KEY (`share_id`)  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分享信息表';

CREATE TABLE `user_info` (  
  `user_id` VARCHAR(255) NOT NULL COMMENT '用户id',  
  `nick_name` VARCHAR(255) NOT NULL COMMENT '昵称',  
  `user_space` BIGINT NULL COMMENT '已经使用的空间',  
  `total_space` BIGINT NULL COMMENT '用户拥有的总空间',  
  `email` VARCHAR(255) NOT NULL COMMENT '邮箱',  
  `qq_open_id` VARCHAR(255) NULL COMMENT '判断用户是否已经通过QQ注册',  
  `qq_avatar` VARCHAR(255) NULL COMMENT 'QQ头像',  
  `password` VARCHAR(255) NOT NULL COMMENT '密码',  
  `join_time` DATETIME NULL COMMENT '用户创建时间',  
  `last_login_time` DATETIME NULL COMMENT '上次登录时间',  
  `status` TINYINT(1) NULL COMMENT '0:禁用 1:启用',  
  PRIMARY KEY (`user_id`)  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';