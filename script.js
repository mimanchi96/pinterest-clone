// ===== Pinterest素材收集网站 - script.js (Supabase版) =====

// ===== Supabase 配置 =====
const SUPABASE_URL = 'https://uprhclavqpfrrbqlaake.supabase.co';
const SUPABASE_KEY = 'sb_publishable_axC72otqGsnuScheHoyjgw_sjj_-lrh';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== 全局状态 =====
const state = {
    images: [],
    currentUser: null,
    page: 1,
    isLoading: false,
    hasMore: true,
    likes: {},
    saves: {},
    uploadedFile: null
};

// ===== 模拟图片数据（数据库无数据时备用）=====
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
    imgFile: document.getElementById('imgFile'),
    fileUploadArea: document.getElementById('fileUploadArea'),
    filePreview: document.getElementById('filePreview'),
    previewImg: document.getElementById('previewImg'),
    removeFile: document.getElementById('removeFile'),
    urlPanel: document.getElementById('urlPanel'),
    filePanel: document.getElementById('filePanel')
};

// ===== 初始化 =====
async function init() {
    await loadUserState();
    await loadInteractionState();
    await loadImages();
    bindEvents();
    setupInfiniteScroll();
    setupFileUpload();
}

// ===== 从数据库加载图片 =====
async function loadImages() {
    if (state.isLoading || !state.hasMore) return;
    
    state.isLoading = true;
    elements.loader.style.display = 'flex';
    
    try {
        const { data: images, error } = await supabase
            .from('images')
            .select('*')
            .order('created_at', { ascending: false })
            .range((state.page - 1) * 12, state.page * 12 - 1);
        
        if (error) throw error;
        
        if (!images || images.length === 0) {
            // 如果数据库没有图片，使用示例图片
            if (state.page === 1) {
                sampleImages.forEach((img, index) => {
                    const imgData = {
                        id: index + 1,
                        url: img.url,
                        title: img.title
                    };
                    state.images.push(imgData);
                    renderImageCard(imgData);
                });
                state.page++;
            }
            state.hasMore = false;
            elements.noMore.style.display = 'block';
        } else {
            images.forEach(imgData => {
                state.images.push(imgData);
                renderImageCard(imgData);
            });
            state.page++;
            
            if (images.length < 12) {
                state.hasMore = false;
                elements.noMore.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('加载图片失败:', error);
        // 降级使用示例图片
        if (state.page === 1) {
            sampleImages.forEach((img, index) => {
                const imgData = {
                    id: index + 1,
                    url: img.url,
                    title: img.title
                };
                state.images.push(imgData);
                renderImageCard(imgData);
            });
            state.page++;
        }
        state.hasMore = false;
        elements.noMore.style.display = 'block';
    }
    
    state.isLoading = false;
    elements.loader.style.display = 'none';
}

// ===== 渲染图片卡片 =====
function renderImageCard(imgData) {
    const card = document.createElement('div');
    card.className = 'masonry-item';
    card.dataset.id = imgData.id;
    
    const isLiked = state.likes[imgData.id];
    const isSaved = state.saves[imgData.id];
    
    card.innerHTML = `
        <div class="image-container">
            <div class="image-placeholder"></div>
            <img src="${imgData.url}" alt="${imgData.title}" loading="lazy" 
                onerror="this.style.display='none'; this.previousElementSibling.style.display='block';"
                onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none';">
        </div>
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
    
    const likeBtn = card.querySelector('.like');
    const saveBtn = card.querySelector('.save');
    const img = card.querySelector('img');
    
    // 图片加载完成处理
    if (img.complete) {
        img.classList.add('loaded');
        img.previousElementSibling.style.display = 'none';
    }
    
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
async function toggleLike(id, btn) {
    if (!state.currentUser) {
        alert('请先登录');
        elements.loginModal.classList.add('active');
        return;
    }
    
    try {
        const isLiked = state.likes[id];
        
        if (isLiked) {
            // 取消点赞
            await supabase
                .from('likes')
                .delete()
                .eq('image_id', id)
                .eq('user_id', state.currentUser.id);
        } else {
            // 添加点赞
            await supabase
                .from('likes')
                .insert({
                    image_id: id,
                    user_id: state.currentUser.id
                });
        }
        
        state.likes[id] = !isLiked;
        btn.textContent = isLiked ? '🤍' : '❤️';
        btn.classList.toggle('liked', !isLiked);
        
    } catch (error) {
        console.error('点赞操作失败:', error);
    }
}

// ===== 收藏功能 =====
async function toggleSave(id, btn) {
    if (!state.currentUser) {
        alert('请先登录');
        elements.loginModal.classList.add('active');
        return;
    }
    
    try {
        const isSaved = state.saves[id];
        
        if (isSaved) {
            // 取消收藏
            await supabase
                .from('saves')
                .delete()
                .eq('image_id', id)
                .eq('user_id', state.currentUser.id);
        } else {
            // 添加收藏
            await supabase
                .from('saves')
                .insert({
                    image_id: id,
                    user_id: state.currentUser.id
                });
        }
        
        state.saves[id] = !isSaved;
        btn.textContent = isSaved ? '☆' : '★';
        btn.classList.toggle('saved', !isSaved);
        
    } catch (error) {
        console.error('收藏操作失败:', error);
    }
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
async function loadUserState() {
    const savedUser = localStorage.getItem('pinterest_user');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        // 从数据库获取最新用户信息
        const { data: users } = await supabase
            .from('users')
            .select('*')
            .eq('username', userData.username)
            .limit(1);
        
        if (users && users.length > 0) {
            state.currentUser = users[0];
            updateUserUI();
        } else {
            localStorage.removeItem('pinterest_user');
        }
    }
}

async function login(username, password) {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .limit(1);
        
        if (error) throw error;
        
        if (users && users.length > 0) {
            state.currentUser = users[0];
            localStorage.setItem('pinterest_user', JSON.stringify(users[0]));
            updateUserUI();
            closeModals();
            
            // 加载用户的点赞和收藏
            await loadInteractionState();
            alert('登录成功');
        } else {
            alert('用户名或密码错误');
        }
    } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败，请重试');
    }
}

async function register(username, password, confirmPassword) {
    if (password !== confirmPassword) {
        alert('两次密码输入不一致');
        return;
    }
    
    try {
        // 检查用户名是否已存在
        const { data: existing } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .limit(1);
        
        if (existing && existing.length > 0) {
            alert('用户名已存在');
            return;
        }
        
        // 创建新用户
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                username: username,
                password: password
            })
            .select()
            .limit(1);
        
        if (error) throw error;
        
        state.currentUser = newUser[0];
        localStorage.setItem('pinterest_user', JSON.stringify(newUser[0]));
        updateUserUI();
        closeModals();
        alert('注册成功');
    } catch (error) {
        console.error('注册失败:', error);
        alert('注册失败，请重试');
    }
}

function logout() {
    state.currentUser = null;
    state.likes = {};
    state.saves = {};
    localStorage.removeItem('pinterest_user');
    updateUserUI();
    alert('已退出登录');
}

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

// ===== 加载用户的点赞和收藏 =====
async function loadInteractionState() {
    if (!state.currentUser) return;
    
    try {
        // 加载点赞
        const { data: likes } = await supabase
            .from('likes')
            .select('image_id')
            .eq('user_id', state.currentUser.id);
        
        if (likes) {
            likes.forEach(like => {
                state.likes[like.image_id] = true;
            });
        }
        
        // 加载收藏
        const { data: saves } = await supabase
            .from('saves')
            .select('image_id')
            .eq('user_id', state.currentUser.id);
        
        if (saves) {
            saves.forEach(save => {
                state.saves[save.image_id] = true;
            });
        }
    } catch (error) {
        console.error('加载互动状态失败:', error);
    }
}

// ===== 本地文件上传功能 =====
function setupFileUpload() {
    const uploadTabs = document.querySelectorAll('.upload-tab');
    uploadTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.dataset.tab;
            uploadTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tabType === 'url') {
                elements.urlPanel.style.display = 'block';
                elements.filePanel.style.display = 'none';
            } else {
                elements.urlPanel.style.display = 'none';
                elements.filePanel.style.display = 'block';
            }
        });
    });
    
    elements.fileUploadArea.addEventListener('click', () => {
        elements.imgFile.click();
    });
    
    elements.imgFile.addEventListener('change', handleFileSelect);
    
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
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        state.uploadedFile = e.target.result;
        elements.previewImg.src = state.uploadedFile;
        elements.fileUploadArea.querySelector('.upload-placeholder').style.display = 'none';
        elements.filePreview.style.display = 'block';
    };
    reader.onerror = () => {
        alert('文件读取失败');
    };
    reader.readAsDataURL(file);
}

// ===== 上传图片到Supabase Storage =====
async function uploadImage(url, title) {
    if (!state.currentUser) {
        alert('请先登录');
        elements.loginModal.classList.add('active');
        return;
    }
    
    try {
        let imgUrl = url;
        let imgTitle = title || '用户上传';
        
        // 如果有本地上传的文件，上传到Supabase Storage
        if (state.uploadedFile) {
            // 提取base64数据
            const base64Data = state.uploadedFile.split(',')[1];
            const fileExt = state.uploadedFile.split(';')[0].split('/')[1];
            const fileName = `${Date.now()}.${fileExt}`;
            
            // 上传到Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, decodeBase64(base64Data), {
                    contentType: `image/${fileExt}`
                });
            
            if (uploadError) throw uploadError;
            
            // 获取公开URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);
            
            imgUrl = publicUrl;
            imgTitle = title || '本地上传';
        } else if (!url) {
            alert('请选择图片或输入URL');
            return;
        }
        
        // 保存到数据库
        const { data: newImage, error } = await supabase
            .from('images')
            .insert({
                user_id: state.currentUser.id,
                url: imgUrl,
                title: imgTitle,
                is_local: !!state.uploadedFile
            })
            .select()
            .limit(1);
        
        if (error) throw error;
        
        // 立即显示新上传的图片
        state.images.unshift(newImage[0]);
        renderImageCard(newImage[0]);
        
        // 清空上传状态
        state.uploadedFile = null;
        elements.filePreview.style.display = 'none';
        elements.fileUploadArea.querySelector('.upload-placeholder').style.display = 'flex';
        
        elements.uploadForm.reset();
        closeModals();
        alert('上传成功');
        
    } catch (error) {
        console.error('上传失败:', error);
        alert('上传失败，请重试');
    }
}

// 辅助函数：base64转Blob
function decodeBase64(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'image/jpeg' });
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

// ===== 绑定事件 =====
function bindEvents() {
    elements.loginBtn.addEventListener('click', () => {
        openModal(elements.loginModal);
    });
    
    elements.registerBtn.addEventListener('click', () => {
        openModal(elements.registerModal);
    });
    
    elements.uploadBtn.addEventListener('click', () => {
        openModal(elements.uploadModal);
    });
    
    elements.logoutBtn.addEventListener('click', logout);
    
    elements.closeLogin.addEventListener('click', () => {
        elements.loginModal.classList.remove('active');
    });
    
    elements.closeRegister.addEventListener('click', () => {
        elements.registerModal.classList.remove('active');
    });
    
    elements.closeUpload.addEventListener('click', () => {
        elements.uploadModal.classList.remove('active');
    });
    
    [elements.loginModal, elements.registerModal, elements.uploadModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        login(username, password);
    });
    
    elements.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        register(username, password, confirmPassword);
    });
    
    elements.uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('imgUrl').value;
        const title = document.getElementById('imgTitle').value;
        uploadImage(url, title);
    });
    
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
