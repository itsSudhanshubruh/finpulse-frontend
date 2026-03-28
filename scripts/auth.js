(function () {
    /**
     * FinPulse Auth & Admin Session Logic
     * Native Node.js / MongoDB Connected
     */

    const loginBtn = document.getElementById('loginBtn');
    const loginOverlay = document.getElementById('loginOverlay');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const exactLoginForm = document.getElementById('exact-login-form');
    let isSignupMode = false;

    // Open/Close Modal Listeners
    if (loginBtn && loginOverlay && !localStorage.getItem('finpulse_user')) {
        loginBtn.addEventListener('click', () => {
            loginOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            if (window.lucide) window.lucide.createIcons();
        });
    }

    if (closeLoginBtn && loginOverlay) {
        closeLoginBtn.addEventListener('click', () => {
            loginOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }
    
    // UI Setup: Auto-check session on load
    window.addEventListener('DOMContentLoaded', () => {
        const userStr = localStorage.getItem('finpulse_user');
        if (userStr) setupLogoutUI(JSON.parse(userStr));
    });

    const setupLogoutUI = (userData) => {
        if (!loginBtn) return;
        loginBtn.innerHTML = `<i data-lucide="log-out" style="width: 16px; height: 16px;"></i> Logout (${userData.role})`;
        if (window.lucide) window.lucide.createIcons();
        
        // Remove old open-modal listener by cloning
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
        
        newLoginBtn.addEventListener('click', async () => {
            try {
               await fetch("/api/auth/logout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: userData.email })
               });
            } catch(e) { console.error("Logout API failed, but clearing local cache", e) }

            localStorage.removeItem('finpulse_user');
            alert(`You have been securely logged out. This action was logged in MongoDB.`);
            window.location.reload();
        });
    };

    const finishLogin = (data) => {
        localStorage.setItem('finpulse_user', JSON.stringify(data));
        loginOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        alert(`Welcome, ${data.role === 'admin' ? 'Admin' : 'Client'}! Your login has been recorded in our MongoDB database.`);
        setupLogoutUI(data);
    };

    // Inject Admin / Client Role Option & Form Logic
    if (exactLoginForm) {
        
        // Inject the 2 Options for login
        const toggleHtml = `
            <div style="display: flex; gap: 1rem; margin-bottom: 2rem; justify-content: center; background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 8px;">
                <label style="cursor:pointer; display:flex; align-items:center; gap: 0.5rem; font-weight: 500;">
                    <input type="radio" name="role" value="client" checked> Client Login
                </label>
                <label style="cursor:pointer; display:flex; align-items:center; gap: 0.5rem; font-weight: 500; margin-left: 1rem;">
                    <input type="radio" name="role" value="admin"> Admin Login
                </label>
            </div>
        `;
        const forgotPwdRow = exactLoginForm.querySelector('.forgot-pwd-row');
        if (forgotPwdRow) forgotPwdRow.insertAdjacentHTML('beforebegin', toggleHtml);

        // Sign Up Toggle Logic
        const signupPromptObj = document.querySelector('.signup-prompt a');
        if (signupPromptObj) {
            signupPromptObj.addEventListener('click', (e) => {
                e.preventDefault();
                isSignupMode = !isSignupMode;
                const title = document.querySelector('.login-card-title');
                const subtitle = document.querySelector('.login-card-subtitle');
                const submitBtn = exactLoginForm.querySelector('button[type="submit"]');
                const roleToggleDiv = exactLoginForm.querySelector('input[name="role"]').closest('div');

                if (isSignupMode) {
                    title.textContent = "Create an Account";
                    subtitle.textContent = "Sign up to track your finances";
                    submitBtn.textContent = "Register Now";
                    roleToggleDiv.style.opacity = '0.3'; // Prevent admin creation during signup loosely visually
                    signupPromptObj.textContent = "Log In";
                    signupPromptObj.parentElement.firstChild.textContent = "Already have an account? ";
                    
                    if (!document.getElementById('signup-name')) {
                        const nameField = document.createElement('div');
                        nameField.className = 'login-form-group';
                        nameField.id = 'name-field-group';
                        nameField.innerHTML = `
                            <label>Full Name</label>
                            <div class="input-with-icon">
                                <i data-lucide="user" class="input-icon"></i>
                                <input type="text" id="signup-name" placeholder="John Doe" required style="width: 100%; padding: 0.8rem 1rem 0.8rem 2.5rem; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; background: rgba(255, 255, 255, 0.05); color: white;">
                            </div>
                        `;
                        exactLoginForm.insertBefore(nameField, exactLoginForm.firstChild);
                        if (window.lucide) window.lucide.createIcons();
                    } else {
                        document.getElementById('name-field-group').style.display = 'block';
                        document.getElementById('signup-name').setAttribute('required', 'true');
                    }
                } else {
                    title.textContent = "Welcome back";
                    subtitle.textContent = "Sign in to access your dashboard";
                    submitBtn.textContent = "Sign In";
                    roleToggleDiv.style.opacity = '1';
                    signupPromptObj.textContent = "Sign up";
                    signupPromptObj.parentElement.firstChild.textContent = "Don't have an account? ";
                    if (document.getElementById('name-field-group')) {
                        document.getElementById('name-field-group').style.display = 'none';
                        document.getElementById('signup-name').removeAttribute('required');
                    }
                }
            });
        }

        // Form Submit Handler
        exactLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get button to simulate loading State
            const btn = exactLoginForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Connecting...';
            btn.disabled = true;

            const email = exactLoginForm.querySelector('input[type="email"]').value;
            const password = exactLoginForm.querySelector('input[type="password"]').value;
            
            const roleRadio = exactLoginForm.querySelector('input[name="role"]:checked');
            const roleMode = roleRadio ? roleRadio.value : 'client';

            try {
                if (isSignupMode) {
                    const name = document.getElementById('signup-name').value;
                    const res = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password, name })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message);
                    
                    finishLogin(data);
                } else {
                    const res = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message);
                    
                    if (roleMode === 'admin' && data.role !== 'admin') {
                        throw new Error("Unauthorized. This account is not an administrator.");
                    }
                    
                    finishLogin(data);
                }
            } catch (error) {
                alert("Auth Error: " + error.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

})();
