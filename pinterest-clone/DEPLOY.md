# Pinterest素材收集网站 - 部署指南

## 一、Supabase 数据库设置

### 1. 注册 Supabase 账号
1. 访问 https://supabase.com
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 填写项目信息：
   - Organization: 选择你的 GitHub 组织或个人
   - Name: pinterest-clone
   - Database Password: 设置密码（记住它）
   - Region: 选择亚洲区域 (Singapore)
5. 等待项目创建完成（约1分钟）

### 2. 获取项目配置
创建完成后：
1. 进入 Project Settings → API
2. 记录以下信息：
   - Project URL
   - anon public key (public)

### 3. 创建数据库表
在 Supabase SQL Editor 中执行：

```sql
-- 创建用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建图片素材表
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    url TEXT NOT NULL,
    title TEXT,
    is_local BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建点赞表
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    image_id UUID REFERENCES images(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, image_id)
);

-- 创建收藏表
CREATE TABLE saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    image_id UUID REFERENCES images(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, image_id)
);

-- 启用RLS策略（让所有人可读取）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

-- 创建读取策略
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read images" ON images FOR SELECT USING (true);
CREATE POLICY "Public read likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Public read saves" ON saves FOR SELECT USING (true);

-- 创建写入策略（仅登录用户）
CREATE POLICY "Users can insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert images" ON images FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert likes" ON likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can insert saves" ON saves FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 4. 开启文件存储
1. 进入 Storage → New bucket
2. Name: images
3. Public bucket: 开启
4. 点击保存

---

## 二、GitHub 仓库创建

### 1. 创建 GitHub 仓库
1. 访问 https://github.com/new
2. Repository name: pinterest-clone
3. 选择 Public
4. 点击 Create repository

### 2. 初始化本地 Git 并推送

在项目目录执行：
```bash
cd C:\Users\admin\.openclaw\workspace\pinterest-clone

# 初始化 git（如果还没初始化）
git init

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/pinterest-clone.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 推送到 GitHub
git push -u origin main
```

---

## 三、Vercel 部署

### 1. 注册 Vercel
1. 访问 https://vercel.com
2. 使用 GitHub 账号登录

### 2. 部署项目
1. 点击 "Add New..." → Project
2. 选择 pinterest-clone 仓库
3. 配置：
   - Framework Preset: Other
   - Build Command: （留空）
   - Output Directory: ./
4. 点击 Deploy

### 3. 配置环境变量
部署完成后：
1. 进入 Settings → Environment Variables
2. 添加：
   - VITE_SUPABASE_URL: 你的 Supabase Project URL
   - VITE_SUPABASE_ANON_KEY: 你的 anon key

---

## 四、修改代码连接 Supabase

需要更新 `script.js` 使用 Supabase SDK。运行部署后再进行此步骤。
