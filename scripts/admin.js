(function () {
    // Auth Check
    const userStr = localStorage.getItem('finpulse_user');
    let user = null;
    
    if (userStr) {
        user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            alert('Access Denied. Admin privileges required.');
            window.location.href = 'index.html';
            return;
        }
    } else {
        window.location.href = 'index.html';
        return;
    }

    // Initialize UI
    const emailDisplay = document.getElementById('adminEmailDisplay');
    if (emailDisplay) emailDisplay.textContent = user.email;

    // Logout
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch("/api/auth/logout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email })
                });
            } catch(e) { console.error("Logout API failed", e) }

            localStorage.removeItem('finpulse_user');
            window.location.href = 'index.html';
        });
    }

    // Navigation Tabs
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('.admin-content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(sec => {
                if(sec.id === targetId) {
                    sec.classList.add('active');
                    if(targetId === 'dashboard' || targetId === 'activities') fetchDashboardData();
                    if(targetId === 'blogs') fetchBlogs();
                    if(targetId === 'clients') fetchClients();
                } else {
                    sec.classList.remove('active');
                }
            });
        });
    });

    // Data Fetching Helper
    const fetchWithAuth = async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
            ...(options.headers || {})
        };
        const response = await fetch(url, { ...options, headers });
        if(response.status === 401 || response.status === 403) {
            localStorage.removeItem('finpulse_user');
            window.location.href = 'index.html';
        }
        return response;
    };

    // Dashboard & Activities
    const fetchDashboardData = async () => {
        try {
            const res = await fetchWithAuth('/api/admin/dashboard');
            const data = await res.json();
            
            if(data.stats) {
                const statClients = document.getElementById('statClients');
                const statAdmins = document.getElementById('statAdmins');
                const statBlogs = document.getElementById('statBlogs');
                
                if (statClients) statClients.textContent = data.stats.totalClients;
                if (statAdmins) statAdmins.textContent = data.stats.totalAdmins;
                if (statBlogs) statBlogs.textContent = data.stats.totalBlogs;
            }

            if(data.activities) {
                const tbody = document.getElementById('activitiesTableBody');
                if (tbody) {
                    tbody.innerHTML = '';
                    data.activities.forEach(act => {
                        const tr = document.createElement('tr');
                        let roleBadge = act.role === 'admin' ? '<span class="badge badge-admin">Admin</span>' : '<span class="badge badge-client">Client</span>';
                        let actionBadge = act.action === 'login' ? '<span class="badge badge-login">Login</span>' : '<span class="badge badge-logout">Logout</span>';
                        let timeStr = new Date(act.timestamp).toLocaleString();
                        
                        tr.innerHTML = `
                            <td style="font-family: 'Inter', sans-serif;">${act.email}</td>
                            <td>${roleBadge}</td>
                            <td>${actionBadge}</td>
                            <td style="color: #94a3b8; font-size: 0.9rem;">${timeStr}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        }
    };

    // Blogs
    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/blogs'); // Blogs are public to fetch
            const blogs = await res.json();
            
            const tbody = document.getElementById('blogsTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                
                blogs.forEach(blog => {
                    const tr = document.createElement('tr');
                    const dateStr = new Date(blog.createdAt).toLocaleDateString();
                    tr.innerHTML = `
                        <td style="font-weight: 500; font-family: 'Inter', sans-serif;">${blog.title}</td>
                        <td style="color: #94a3b8;">${dateStr}</td>
                        <td>
                            <button class="delete-blog-btn" data-id="${blog._id}" style="background:rgba(239, 68, 68, 0.1); border:none; color:#ef4444; cursor:pointer; padding: 0.5rem; border-radius: 8px; transition: all 0.2s;" title="Delete Blog">
                                <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                if(window.lucide) window.lucide.createIcons();
                
                document.querySelectorAll('.delete-blog-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = e.currentTarget.getAttribute('data-id');
                        if(confirm('Are you sure you want to delete this blog?')) {
                            // Deletion is protected!
                            await fetchWithAuth(`/api/blogs/${id}`, { method: 'DELETE' });
                            fetchBlogs();
                        }
                    });
                });
            }

        } catch (error) {
            console.error('Failed to fetch blogs', error);
        }
    };

    // Clients
    const fetchClients = async () => {
        try {
            const res = await fetchWithAuth('/api/admin/clients');
            const clients = await res.json();
            
            const tbody = document.getElementById('clientsTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                
                clients.forEach(c => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="font-weight: 500; font-family: 'Inter', sans-serif;">${c.name}</td>
                        <td style="font-family: 'Outfit', sans-serif; font-weight: 600; color: #1d4ed8;">${c.clientId || 'N/A'}</td>
                        <td style="color: #64748b;">${c.email || 'None'}</td>
                        <td>
                            <button class="edit-client-pass-btn btn btn-outline" data-id="${c._id}" style="padding: 0.25rem 0.75rem; font-size: 0.8rem; height: auto;">Edit Pass</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                document.querySelectorAll('.edit-client-pass-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = e.currentTarget.getAttribute('data-id');
                        const newPass = prompt("Enter a new password for this client:");
                        if(newPass && newPass.trim() !== '') {
                            try {
                                const passRes = await fetchWithAuth(`/api/admin/clients/${id}`, {
                                    method: 'PUT',
                                    body: JSON.stringify({ password: newPass })
                                });
                                if(passRes.ok) {
                                    alert('Password modified successfully!');
                                } else {
                                    alert('Failed to change password.');
                                }
                            } catch (error) {
                                alert('Error communicating with server.');
                            }
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Failed to fetch clients', error);
        }
    };
    
    // Client Form logic
    const clientFormContainer = document.getElementById('clientFormContainer');
    const showClientFormBtn = document.getElementById('showClientFormBtn');
    const cancelClientBtn = document.getElementById('cancelClientBtn');
    const createClientForm = document.getElementById('createClientForm');

    if (showClientFormBtn && clientFormContainer) {
        showClientFormBtn.addEventListener('click', () => {
            clientFormContainer.style.display = 'block';
        });
    }
    
    if (cancelClientBtn && clientFormContainer) {
        cancelClientBtn.addEventListener('click', () => {
            clientFormContainer.style.display = 'none';
            if(createClientForm) createClientForm.reset();
        });
    }

    if (createClientForm) {
        createClientForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = e.target.querySelector('button[type="submit"]');
            const oText = btn.innerHTML;
            btn.innerHTML = 'Minting...';
            btn.disabled = true;

            const name = document.getElementById('clientName').value;
            const email = document.getElementById('clientEmail').value;
            const password = document.getElementById('clientPassword').value;

            try {
                const res = await fetchWithAuth('/api/admin/clients/create', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });

                if(res.ok) {
                    const data = await res.json();
                    alert(`Success! Generated Secure ID: ${data.clientId}`);
                    createClientForm.reset();
                    clientFormContainer.style.display = 'none';
                    fetchClients();
                    fetchDashboardData();
                } else {
                    const errData = await res.json();
                    alert('Error: ' + errData.message);
                }
            } catch(error) {
                alert('Connection error generating VIP client account.');
            } finally {
                btn.innerHTML = oText;
                btn.disabled = false;
            }
        });
    }

    // Form logic
    const blogFormContainer = document.getElementById('blogFormContainer');
    const showBlogFormBtn = document.getElementById('showBlogFormBtn');
    const cancelBlogBtn = document.getElementById('cancelBlogBtn');
    const createBlogForm = document.getElementById('createBlogForm');

    if (showBlogFormBtn && blogFormContainer) {
        showBlogFormBtn.addEventListener('click', () => {
            blogFormContainer.style.display = 'block';
        });
    }
    
    if (cancelBlogBtn && blogFormContainer) {
        cancelBlogBtn.addEventListener('click', () => {
            blogFormContainer.style.display = 'none';
            if(createBlogForm) createBlogForm.reset();
        });
    }

    if (createBlogForm) {
        createBlogForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBlogBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Publishing...';
            submitBtn.disabled = true;

            const title = document.getElementById('blogTitle').value;
            const imageInput = document.getElementById('blogImageFile');
            const content = document.getElementById('blogContent').value;
            
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            if (imageInput && imageInput.files[0]) {
                formData.append('imageFile', imageInput.files[0]);
            }

            try {
                // Notice we DON'T set Content-Type header when using FormData
                // The browser sets it automatically with the correct multipart boundary
                const headers = { 'Authorization': `Bearer ${user.token}` };
                
                const res = await fetch('/api/blogs', {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });

                if(res.ok) {
                    alert('Blog published successfully!');
                    createBlogForm.reset();
                    blogFormContainer.style.display = 'none';
                    fetchBlogs();
                    fetchDashboardData();
                } else {
                    const data = await res.json();
                    alert('Failed to publish: ' + (data.message || 'Unknown error'));
                }
            } catch(error) {
                alert('Error publishing blog');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Initial load
    fetchDashboardData();
})();
