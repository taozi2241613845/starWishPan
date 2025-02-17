import { defineStore } from "pinia"
export const useUserStore = defineStore('storeId', {
    state: () => ({
        user:{
            nickName:'用户',
            qqAvatar:'../src/aseets/head.png',
        }
    }),
    getters: {
        
    },
    actions: {
        setUser(user){
            this.user = user;    
        },
        removeUser(){
            this.user = {};
        }
    },
    persist : true,
})