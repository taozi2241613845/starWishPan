import { createRouter,createWebHistory } from "vue-router";
const router = createRouter(
    {
        history: createWebHistory(import.meta.env.BASE_URL),
        routes: [
            {
                path:'/',
                redirect:'/home/homePage',
            },
            {
                path: '/home',
                name: 'home',
                meta:{requiresAuth:true},
                component: () => import("@/views/home.vue"),
                children:
                [
                    {
                        path: '/home/homePage',
                        name: 'homePage',
                        meta:{requiresAuth:true},
                        component: () => import("@/views/homePage.vue"),
                    },
                    {
                        path: '/home/share',
                        name: 'share',
                        meta:{requiresAuth:true},
                        component: () => import("@/views/share.vue"),
                    },
                    {
                        path: '/home/recovery',
                        name: 'recovery',
                        meta:{requiresAuth:true},
                        component: () => import("@/views/recovery.vue"),
                    }
                ]
            },
            {
                path: '/login',
                name: 'login',
                component: () => import("@/views/login.vue"),
                children:
                [   
                    {
                        path: '/login/loginForm',
                        name: 'loginForm',
                        component: () => import("@/views/loginForm.vue"),
                    }, 
                    {
                        path: '/login/register',
                        name: 'register',
                        component: () => import("@/views/register.vue"),
                    },
                    {
                        path: '/login/resetPwd',
                        name: 'resetPwd',
                        component: () => import("@/views/resetPwd.vue"),
                    }
                ]
            },
            {
                path: '/s/:share',
                name: 's',
                component: () => import("@/views/s.vue"),
            },
            ,
            {
                path: '/share/init/:shareId',
                name: 'shareInit',
                component: () => import("@/views/shareInit.vue"),
            }              
        ]
    }
)
router.beforeEach(async (to, from) => {
    console.log("to.Path:" + to.path + "---" + "to.requireAuth:" + to.meta.requiresAuth);
    if(to.meta.requiresAuth){
        let token = localStorage.getItem('token');
        let tokenExpireTime = localStorage.getItem("tokenExpireTime")
        let nowDate = new Date();
        let isAuthenticated = token != null && parseInt(tokenExpireTime,10) > nowDate.getTime();
        if(!isAuthenticated && to.name != 'loginForm'){
            // 将用户重定向到登录页面
            return { name: 'loginForm' }
        }
    }

  })
export default router