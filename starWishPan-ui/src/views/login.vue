<template>
    <div class="login-box">
        <div class="login-form-box">
            <div>
                <img src="@/assets/报表解说.png">
            </div>
            
            <router-view to="/login/loginForm"></router-view>
        </div>
    </div>
</template>
<script setup>
    
</script>

<style lang="scss" scoped>
    .login-box{
        width:100%;
        height: 100vh;
        margin: 0px auto;
        background: url('@/assets/登录背景.png') no-repeat;
        background-size: cover;
        overflow: hidden;
    }
    .login-form-box{
        width: 1100px;
        margin: 0px auto;
        margin-top: 40px;
        display: flex;
    }
    
</style>