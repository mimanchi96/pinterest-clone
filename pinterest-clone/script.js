// ===== Pinterest素材收集网站 - script.js =====

// ===== 全局状态 =====
const state = {
    images: [],
    currentUser: null,
    page: 1,
    isLoading: false,
    hasMore: true,
    likes: {},
    saves: {},
    uploadedFile: null  // 本地上传的图片数据
};

// ===== 模拟图片数据 =====
const sampleImages = [
    { url: 'https://fastly.picsum.photos/id/10/400/300', title: '森林' },
    { url: 'https://fastly.picsum.photos/id/15/400/500', title: '瀑布' },
    { url: 'https://fastly.picsum.photos/id/16/400/350', title: '海洋' },
    { url: 'https://fastly.picsum.photos/id/20/400/450', title: '木头' },
    { url: 'https://fastly.picsum.photos/id/28/400/280', title: '山丘' },
    { url: 'https://fastly.picsum.photos/id/29/400/400', title: '山峰' },
    { url: 'https://fastly.picsum.photos/id/35/400/320', title: '沙漠' },
    { url: 'https://fastly.picsum.photos/id/42/400/480', title: '城市' },
    { url: 'https://fastly.picsum.photos/id/48/400/360', title: '大海' },
    { url: 'https://fastly.picsum.photos/id/54/400/420', title: '天空' },
    { url: 'https://fastly.picsum.photos/id/58/400/380', title: '蚂蚁' },
    { url: 'https://fastly.picsum.photos/id/59/400/520', title: '星空' },
    { url: 'https://fastly.picsum.photos/id/60/400/340', title: '书桌' },
    { url: 'https://fastly.picsum.photos/id/64/400/460', title: '墙壁' },
    { url: 'https://fastly.picsum.photos/id/65/400/300', title: '摩托车' },
    { url: 'https://fastly.picsum.photos/id/68/400/440', title: '汽车' },
    { url: 'https://fastly.picsum.photos/id/69/400/310', title: '厨房' },
    { url: 'https://fastly.picsum.photos/id/70/400/490', title: '楼梯' },
    { url: 'https://fastly.picsum.photos/id/71/400/370', title: '马' },
    { url: 'https://fastly.picsum.photos/id/74/400/430', title: '船舶' },
    { url: 'https://fastly.picsum.photos/id/75/400/290', title: '火车' },
    { url: 'https://fastly.picsum.photos/id/76/400/510', title: '灯塔' },
    { url: 'https://fastly.picsum.photos/id/78/400/330', title: '咖啡' },
    { url: 'https://fastly.picsum.photos/id/84/400/470', title: '键盘' }
];

// ===== DOM元素 =====
const elements = {
    grid: document.getElementById('masonryGrid'),
    loader: document.getElementById('loader'),
    noMore: document.getElementById('noMore'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    uploadBtn: document.getElementById('uploadBtn'),
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userMenu: document.getElementById('userMenu'),
    userInfo: document.getElementById('userInfo'),
    userName: document.getElementById('userName'),
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    uploadModal: document.getElementById('uploadModal'),
    closeLogin: document.getElementById('closeLogin'),
    closeRegister: document.getElementById('closeRegister'),
    closeUpload: document.getElementById('closeUpload'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    uploadForm: document.getElementById('uploadForm'),
    // 文件上传相关
    imgFile: document.getElementById('imgFile'),
    fileUploadArea: document.getElementById('fileUploadArea'),
    filePreview: document.getElementById('filePreview'),
    previewImg: document.getElementById('previewImg'),
    removeFile: document.getElementById('removeFile'),
    urlPanel: document.getElementById('urlPanel'),
    filePanel: document.getElementById('filePanel')
};

// ===== 初始化 =====
function init() {
    loadUserState();
    loadInteractionState();
    loadUserUploads();  // 加载用户上传的图片
    loadImages();
    bindEvents();
    setupInfiniteScroll();
    setupFileUpload();
}

// ===== 加载图片 =====
function loadImages() {
    if (state.isLoading || !state.hasMore) return;
    
    state.isLoading = true;
    elements.loader.style.display = 'flex';
    
    // 模拟异步加载
    setTimeout(() => {
        const start = (state.page - 1) * 12;
        const end = start + 12;
        const newImages = sampleImages.slice(start, end);
        
        if (newImages.length === 0) {
            state.hasMore = false;
            elements.noMore.style.display = 'block';
        } else {
            newImages.forEach((img, index) => {
                const imgData = {
                    id: start + index + 1,
                    url: img.url,
                    title: img.title
                };
                state.images.push(imgData);
                renderImageCard(imgData);
            });
            state.page++;
        }
        
        state.isLoading = false;
        elements.loader.style.display = 'none';
    }, 500);
}

// ===== 渲染图片卡片 =====
function renderImageCard(imgData) {
    const card = document.createElement('div');
    card.className = 'masonry-item';
    card.dataset.id = imgData.id;
    
    const isLiked = state.likes[imgData.id];
    const isSaved = state.saves[imgData.id];
    
    card.innerHTML = `
        <img src="${imgData.url}" alt="${imgData.title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/><text fill=%22%23999%22 font-size=%2216%22 x=%22150%22 y=%22150%22>图片加载失败</text></svg>'">
        <div class="item-actions">
            <button class="action-btn like ${isLiked ? 'liked' : ''}" data-id="${imgData.id}" title="点赞">
                ${isLiked ? '❤️' : '🤍'}
            </button>
            <button class="action-btn save ${isSaved ? 'saved' : ''}" data-id="${imgData.id}" title="收藏">
                ${isSaved ? '★' : '☆'}
            </button>
        </div>
    `;
    
    elements.grid.appendChild(card);
    
    // 绑定卡片内按钮事件
    const likeBtn = card.querySelector('.like');
    const saveBtn = card.querySelector('.save');
    
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLike(imgData.id, likeBtn);
    });
    
    saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSave(imgData.id, saveBtn);
    });
}

// ===== 点赞功能 =====
function toggleLike(id, btn) {
    if (!state.currentUser) {
        alert('请先登录');
        elements.loginModal.classList.add('active');
        return;
    }
    
    const isLiked = state.likes[id];
    state.likes[id] = !isLiked;
    
    btn.textContent = isLiked ? '🤍' : '❤️';
    btn.classList.toggle('liked', !isLiked);
    
    saveInteractionState();
}

// ===== 收藏功能 =====
function toggleSave(id, btn) {
    if (!state.currentUser) {
        alert('请先登录');
        elements.loginModal.classList.add('active');
        return;
    }
    
    const isSaved = state.saves[id];
    state.saves[id] = !isSaved;
    
    btn.textContent = isSaved ? '☆' : '★';
    btn.classList.toggle('saved', !isSaved);
    
    saveInteractionState();
}

// ===== 无限滚动 =====
function setupInfiniteScroll() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (ticking) return;
        
        ticking = true;
        requestAnimationFrame(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            
            if (scrollTop + clientHeight >= scrollHeight - 200) {
                loadImages();
            }
            
            ticking = false;
        });
    });
}

// ===== 用户系统 =====
// 加载用户状态
function loadUserState() {
    const savedUser = localStorage.getItem('pinterest_user');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        updateUserUI();
    }
}

// 保存用户状态
function saveUserState() {
    if (state.currentUser) {
        localStorage.setItem('pinterest_user', JSON.stringify(state.currentUser));
    } else {
        localStorage.removeItem('pinterest_user');
    }
}

// 更新用户UI
function updateUserUI() {
    if (state.currentUser) {
        elements.userMenu.style.display = 'none';
        elements.userInfo.style.display = 'flex';
        elements.userName.textContent = state.currentUser.username;
    } else {
        elements.userMenu.style.display = 'flex';
        elements.userInfo.style.display = 'none';
    }
}

// 登录
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('pinterest_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        state.currentUser = { username: user.username };
        saveUserState();
        updateUserUI();
        closeModals();
        loadUserUploads();  // 登录后加载用户上传的图片
        alert('登录成功');
    } else {
        alert('用户名或密码错误');
    }
}

// 注册
function register(username, password, confirmPassword) {
    if (password !== confirmPassword) {
        alert('两次密码输入不一致');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('pinterest_users') || '[]');
    
    if (users.find(u => u.username === username)) {
        alert('用户名已存在');
        return;
    }
    
    users.push({ username, password });
    localStorage.setItem('pinterest_users', JSON.stringify(users));
    
    state.currentUser = { username };
    saveUserState();
    updateUserUI();
    closeModals();
    alert('注册成功');
}

// 登出
function logout() {
    state.currentUser = null;
    state.likes = {};
    state.saves = {};
    localStorage.removeItem('pinterest_user');
    saveInteractionState();
    updateUserUI();
    alert('已退出登录');
}

// ===== 交互状态 =====
function loadInteractionState() {
    const likes = localStorage.getItem('pinterest_likes');
    const saves = localStorage.getItem('pinterest_saves');
    
    state.likes = likes ? JSON.parse(likes) : {};
    state.saves = saves ? JSON.parse(saves) : {};
}

function saveInteractionState() {
    localStorage.setItem('pinterest_likes', JSON.stringify(state.likes));
    localStorage.setItem('pinterest_saves', JSON.stringify(state.saves));
}

// ===== 用户上传图片管理 =====
function saveUserUploads(imageData) {
    if (!state.currentUser) return;
    
    const key = `pinterest_uploads_${state.currentUser.username}`;
    const uploads = JSON.parse(localStorage.getItem(key) || '[]');
    uploads.unshift(imageData);
    localStorage.setItem(key, JSON.stringify(uploads));
}

function loadUserUploads() {
    if (!state.currentUser) return;
    
    const key = `pinterest_uploads_${state.currentUser.username}`;
    const uploads = JSON.parse(localStorage.getItem(key) || '[]');
    
    uploads.forEach(imgData => {
        state.images.push(imgData);
        renderImageCard(imgData);
    });
}

// ===== 弹窗操作 =====
function openModal(modal) {
    modal.classList.add('active');
}

function closeModals() {
    elements.loginModal.classList.remove('active');
    elements.registerModal.classList.remove('active');
    elements.uploadModal.classList.remove('active');
}

// ===== 本地文件上传功能 =====
function setupFileUpload() {
    // 切换上传方式标签
    const uploadTabs = document.querySelectorAll('.upload-tab');
    uploadTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            
            // 更新标签状态
            uploadTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 显示对应面板
            if (tabType === 'url') {
                elements.urlPanel.style.display = 'block';
                elements.filePanel.style.display = 'none';
            } else {
                elements.urlPanel.style.display = 'none';
                elements.filePanel.style.display = 'block';
            }
        });
    });
    
    // 点击上传区域触发文件选择
    elements.fileUploadArea.addEventListener('click', () => {
        elements.imgFile.click();
    });
    
    // 文件选择处理
    elements.imgFile.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    elements.fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.fileUploadArea.classList.add('dragover');
    });
    
    elements.fileUploadArea.addEventListener('dragleave', () => {
        elements.fileUploadArea.classList.remove('dragover');
    });
    
    elements.fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.fileUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
    
    // 移除文件
    elements.removeFile.addEventListener('click', (e) => {
        e.stopPropagation();
        state.uploadedFile = null;
        elements.imgFile.value = '';
        elements.filePreview.style.display = 'none';
        elements.fileUploadArea.querySelector('.upload-placeholder').style.display = 'flex';
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }
    
    // 验证文件大小 (最大5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
    }
    
    // 读取文件并转换为Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
        state.uploadedFile = e.target.result;
        
        // 显示预览
        elements.previewImg.src = state.uploadedFile;
        elements.fileUploadArea.querySelector('.upload-placeholder').style.display = 'none';
        elements.filePreview.style.display = 'block';
    };
    reader.onerror = () => {
        alert('文件读取失败');
    };
    reader.readAsDataURL(file);
}

// ===== 上传图片 =====
function uploadImage(url, title) {
    if (!state.currentUser) {
        alert('请先登录');
        elements.loginModal.classList.add('active');
        return;
    }
    
    // 如果有本地上传的文件，优先使用
    let imgUrl = url;
    let imgTitle = title || '用户上传';
    
    if (state.uploadedFile) {
        imgUrl = state.uploadedFile;
        imgTitle = title || '本地上传';
    } else if (!url) {
        alert('请选择图片或输入URL');
        return;
    }
    
    const newImage = {
        id: Date.now(),  // 使用时间戳作为唯一ID
        url: imgUrl,
        title: imgTitle
    };
    
    state.images.unshift(newImage);
    
    const card = document.createElement('div');
    card.className = 'masonry-item';
    card.dataset.id = newImage.id;
    card.innerHTML = `
        <img src="${newImage.url}" alt="${newImage.title}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/><text fill=%22%23999%22 font-size=%2216%22 x=%22150%22 y=%22150%22>图片加载失败</text></svg>'">
        <div class="item-actions">
            <button class="action-btn like" data-id="${newImage.id}" title="点赞">🤍</button>
            <button class="action-btn save" data-id="${newImage.id}" title="收藏">☆</button>
        </div>
    `;
    
    elements.grid.insertBefore(card, elements.grid.firstChild);
    
    const likeBtn = card.querySelector('.like');
    const saveBtn = card.querySelector('.save');
    
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLike(newImage.id, likeBtn);
    });
    
    saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSave(newImage.id, saveBtn);
    });
    
    // 保存到用户上传记录
    saveUserUploads(newImage);
    
    // 清空上传状态
    state.uploadedFile = null;
    elements.filePreview.style.display = 'none';
    elements.fileUploadArea.querySelector('.upload-placeholder').style.display = 'flex';
    
    alert('上传成功');
}

// ===== 绑定事件 =====
function bindEvents() {
    // 登录按钮
    elements.loginBtn.addEventListener('click', () => {
        openModal(elements.loginModal);
    });
    
    // 注册按钮
    elements.registerBtn.addEventListener('click', () => {
        openModal(elements.registerModal);
    });
    
    // 上传按钮
    elements.uploadBtn.addEventListener('click', () => {
        openModal(elements.uploadModal);
    });
    
    // 登出按钮
    elements.logoutBtn.addEventListener('click', logout);
    
    // 关闭弹窗
    elements.closeLogin.addEventListener('click', () => {
        elements.loginModal.classList.remove('active');
    });
    
    elements.closeRegister.addEventListener('click', () => {
        elements.registerModal.classList.remove('active');
    });
    
    elements.closeUpload.addEventListener('click', () => {
        elements.uploadModal.classList.remove('active');
    });
    
    // 点击弹窗外部关闭
    [elements.loginModal, elements.registerModal, elements.uploadModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // 登录表单
    elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        login(username, password);
    });
    
    // 注册表单
    elements.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        register(username, password, confirmPassword);
    });
    
    // 上传表单
    elements.uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('imgUrl').value;
        const title = document.getElementById('imgTitle').value;
        uploadImage(url, title);
        elements.uploadForm.reset();
        closeModals();
    });
    
    // 搜索功能
    elements.searchBtn.addEventListener('click', () => {
        const keyword = elements.searchInput.value.trim();
        if (keyword) {
            alert(`搜索功能：${keyword}\n（演示版本，搜索功能待实现）`);
        }
    });
    
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.searchBtn.click();
        }
    });
}

// ===== 启动 =====
document.addEventListener('DOMContentLoaded', init);
