// 页面加载时获取产品列表
window.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    
    // 添加产品表单提交事件
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addProduct();
        });
    }
});

// 获取产品列表
async function fetchProducts() {
    try {
        const response = await fetchWithAuth('http://localhost:3000/api/admin/products');
        if (response.ok) {
            const data = await response.json();
            displayProducts(data.products);
        }
    } catch (error) {
        console.error('获取产品列表失败:', error);
        showMessage('获取产品列表失败，请稍后重试', 'error');
    }
}

// 显示产品列表
function displayProducts(products) {
    const container = document.getElementById('adminProductsContainer');
    
    container.innerHTML = products.map(product => `
        <div class="admin-product-card">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; margin-bottom: 10px;">` : ''}
            <h4>${product.name}</h4>
            <p class="product-price">¥${parseFloat(product.price).toFixed(2)}</p>
            <p class="product-stock">库存: ${product.stock}</p>
            <p>${product.description}</p>
            <div class="admin-actions">
                <button class="edit-btn" onclick="editProduct(${product.id})">编辑</button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">删除</button>
            </div>
        </div>
    `).join('');
}

// 添加产品
async function addProduct() {
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').value;
    
    try {
        const response = await fetchWithAuth('http://localhost:3000/api/admin/products', {
            method: 'POST',
            body: JSON.stringify({ name, description, price, stock, category, image })
        });
        
        if (response.ok) {
            showMessage('产品添加成功', 'success');
            // 重置表单
            document.getElementById('addProductForm').reset();
            // 更新产品列表
            fetchProducts();
        } else {
            const data = await response.json();
            showMessage('添加产品失败：' + data.message, 'error');
        }
    } catch (error) {
        console.error('添加产品失败:', error);
        showMessage('添加产品失败，请稍后重试', 'error');
    }
}

// 编辑产品
async function editProduct(productId) {
    try {
        // 获取产品详情（使用普通用户的产品详情API，因为它不需要管理员权限）
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        if (response.ok) {
            const product = await response.json();
            openEditModal(product);
        } else {
            showMessage('获取产品详情失败', 'error');
        }
    } catch (error) {
        console.error('获取产品详情失败:', error);
        showMessage('获取产品详情失败，请稍后重试', 'error');
    }
}

// 打开编辑模态框
function openEditModal(product) {
    // 创建模态框容器
    let modal = document.getElementById('editProductModal');
    
    // 如果模态框不存在，创建它
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editProductModal';
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        // 模态框内容
        modal.innerHTML = `
            <div class="modal-content" style="
                background-color: white;
                padding: 20px;
                border-radius: 5px;
                width: 500px;
                max-width: 90%;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                ">
                    <h3>编辑产品</h3>
                    <button id="closeModalBtn" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                    ">&times;</button>
                </div>
                
                <form id="editProductForm">
                    <input type="hidden" id="editProductId">
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductName" style="display: block; margin-bottom: 5px;">产品名称：</label>
                        <input type="text" id="editProductName" name="name" required style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 3px;
                        ">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductDescription" style="display: block; margin-bottom: 5px;">产品描述：</label>
                        <textarea id="editProductDescription" name="description" rows="3" required style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 3px;
                            resize: vertical;
                        "></textarea>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductPrice" style="display: block; margin-bottom: 5px;">产品价格：</label>
                        <input type="number" id="editProductPrice" name="price" step="0.01" required style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 3px;
                        ">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductStock" style="display: block; margin-bottom: 5px;">产品库存：</label>
                        <input type="number" id="editProductStock" name="stock" required style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 3px;
                        ">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductCategory" style="display: block; margin-bottom: 5px;">产品分类：</label>
                        <input type="text" id="editProductCategory" name="category" required style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 3px;
                        ">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="editProductImage" style="display: block; margin-bottom: 5px;">产品图片：</label>
                        <input type="text" id="editProductImage" name="image" placeholder="图片URL地址" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 3px;
                        ">
                    </div>
                    
                    <div class="form-group" style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" id="cancelEditBtn" style="
                            padding: 8px 16px;
                            background-color: #f1f1f1;
                            border: none;
                            border-radius: 3px;
                            cursor: pointer;
                        ">取消</button>
                        <button type="submit" style="
                            padding: 8px 16px;
                            background-color: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 3px;
                            cursor: pointer;
                        ">保存</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定关闭按钮事件
        document.getElementById('closeModalBtn').addEventListener('click', closeEditModal);
        document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);
        
        // 绑定表单提交事件
        document.getElementById('editProductForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
        
        // 点击模态框外部关闭模态框
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeEditModal();
            }
        });
    }
    
    // 填充表单数据
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductStock').value = product.stock;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductImage').value = product.image || '';
    
    // 显示模态框
    modal.style.display = 'flex';
}

// 关闭编辑模态框
function closeEditModal() {
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 保存产品编辑
async function saveProduct() {
    const productId = document.getElementById('editProductId').value;
    const name = document.getElementById('editProductName').value;
    const description = document.getElementById('editProductDescription').value;
    const price = parseFloat(document.getElementById('editProductPrice').value);
    const stock = parseInt(document.getElementById('editProductStock').value);
    const category = document.getElementById('editProductCategory').value;
    const image = document.getElementById('editProductImage').value;
    
    try {
        const response = await fetchWithAuth(`http://localhost:3000/api/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ name, description, price, stock, category, image })
        });
        
        if (response.ok) {
            showMessage('产品更新成功', 'success');
            closeEditModal();
            // 更新产品列表
            fetchProducts();
        } else {
            const data = await response.json();
            showMessage('更新产品失败：' + data.message, 'error');
        }
    } catch (error) {
        console.error('更新产品失败:', error);
        showMessage('更新产品失败，请稍后重试', 'error');
    }
}

// 删除产品
async function deleteProduct(productId) {
    if (confirm('确定要删除这个产品吗？')) {
        try {
            const response = await fetchWithAuth(`http://localhost:3000/api/admin/products/${productId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showMessage('产品删除成功', 'success');
                // 更新产品列表
                fetchProducts();
            } else {
                const data = await response.json();
                showMessage('删除产品失败：' + data.message, 'error');
            }
        } catch (error) {
            console.error('删除产品失败:', error);
            showMessage('删除产品失败，请稍后重试', 'error');
        }
    }
}