<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像部分 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 表单部分 -->
            <el-form label-width="0px" class="loginForm" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
                </el-form-item>
                <!-- 密码 -->
                 <el-form-item prop="password">
                    <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password"></el-input>
                </el-form-item>
                <!-- 按钮部分 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
import { log } from 'util';
export default {
    data () {
        return {
            name: 'login',
           loginForm: {
                username: 'admin',
                password: '123456'
           },
           // 验证规则
           loginFormRules: {
               username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
               ],
               password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
               ]
           }
        };
    },
    methods:{   
        reset() {
            // 重置功能
            this.$refs.loginFormRef.resetFields();
        },
        login() {
            // 登录验证
            this.$refs.loginFormRef.validate(async valid=>{
                if(!valid) return this.$message.warning('验证失败');
                const {data: res} = await this.$http.post('login', this.loginForm);
                if(res.meta.status != 200) return this.$message.error('登录失败');
                this.$message.success('登录成功');

                // token保存到sessionStorage中
                window.sessionStorage.setItem('token',res.data.token);
                this.$router.push('/home');
            })
        }
    }
}
</script>
<style scoped lang="less">
    .login_container {
        height: 100%;
        background-color: #2b4b6b;
        .login_box {
            width: 450px;
            height: 300px;
            background-color: #fff;;
            border-radius: 3px;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            .avatar_box {
                width: 130px;
                height: 130px;
                padding: 10px;
                background-color: #fff;
                border: 1px solid #eee;
                border-radius: 50%;
                position: absolute;
                left: 50%;
                top: 0;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 10px #ddd;
                img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background-color: #eee;
                }
            }
        }
    }
    .loginForm {
        padding: 20px;
        position: absolute;
        bottom: 0;
        left: 0;
        box-sizing: border-box;
        width: 100%;
        .btns {
            float: right;
        }
    }
</style>