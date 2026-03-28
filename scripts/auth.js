(function () {
    /**
     * FinPulse Auth Logic
     * Handles Real Firebase Authentication
     */

    // --- FIREBASE CONFIGURATION ---
    const firebaseConfig = {
        apiKey: "AIzaSyBl-TuyS_j44yLU_YaDxt3Z-By--pK-b1s",
        authDomain: "finpluse-68f04.firebaseapp.com",
        projectId: "finpluse-68f04",
        storageBucket: "finpluse-68f04.firebasestorage.app",
        messagingSenderId: "414703875046",
        appId: "1:414703875046:web:d9314ee42f2bdbe5e21c27",
        measurementId: "G-9M0YNZRXVD"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    // Elements
    const loginBtn = document.getElementById('loginBtn');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const userProfile = document.getElementById('userProfile');
    const userNameDisplay = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const phoneSection = document.getElementById('phone-section');

    const phoneLoginTrigger = document.getElementById('phone-login-trigger');
    const backToLogin = document.getElementById('back-to-login');
    const phoneAuthForm = document.getElementById('phone-auth-form');
    const otpVerifyForm = document.getElementById('otp-verify-form');

    // UI Logic ---

    // Open Modal
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            authModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            // Render reCAPTCHA if not already rendered
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.render().catch(console.error);
            }
        });
    }

    // Close Modal
    const closeModal = () => {
        authModal.classList.add('hidden');
        document.body.style.overflow = 'auto';

        // Reset Views to default (Login section visible)
        loginSection.classList.remove('hidden');
        signupSection.classList.add('hidden');
        phoneSection.classList.add('hidden');

        // Reset Phone views
        phoneAuthForm.classList.remove('hidden');
        otpVerifyForm.classList.add('hidden');

        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        if (window.lucide) window.lucide.createIcons();
    };

    if (closeAuthModal) closeAuthModal.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });

    // Tab Switching
    if (tabLogin) tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        loginSection.classList.remove('hidden');
        signupSection.classList.add('hidden');
        phoneSection.classList.add('hidden');
    });

    if (tabSignup) tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        signupSection.classList.remove('hidden');
        loginSection.classList.add('hidden');
        phoneSection.classList.add('hidden');
    });

    // Phone View Switch
    if (phoneLoginTrigger) phoneLoginTrigger.addEventListener('click', () => {
        loginSection.classList.add('hidden');
        phoneSection.classList.remove('hidden');
    });

    if (backToLogin) backToLogin.addEventListener('click', () => {
        phoneSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        phoneAuthForm.classList.remove('hidden');
        otpVerifyForm.classList.add('hidden');
    });

    // UI Updates
    const updateUIForLoggedInUser = (user) => {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userProfile) {
            userProfile.classList.remove('hidden');
            userNameDisplay.textContent = user.displayName || user.phoneNumber || user.email.split('@')[0];
        }
        if (window.lucide) window.lucide.createIcons();
    };

    const handleLogoutUI = () => {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
        if (window.lucide) window.lucide.createIcons();
    };

    // Firebase Listeners ---

    // Auth state observer
    auth.onAuthStateChanged((user) => {
        if (user) {
            updateUIForLoggedInUser(user);
            closeModal();
        } else {
            handleLogoutUI();
        }
    });

    // Email Login
    document.getElementById('email-login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .catch(error => alert(error.message));
    });

    // Email Signup
    document.getElementById('email-signup-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const name = document.getElementById('signup-name').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((result) => {
                return result.user.updateProfile({ displayName: name });
            })
            .catch(error => alert(error.message));
    });

    // Google Login
    document.getElementById('google-login-btn')?.addEventListener('click', () => {
        auth.signInWithPopup(googleProvider)
            .catch(error => alert(error.message));
    });

    // Logout
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    // --- Phone Auth Logic ---
    // Initialize reCAPTCHA - setting to 'normal' size so we can see it for debugging
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {
            console.log("reCAPTCHA verified");
        }
    });

    let confirmationResult = null;

    phoneAuthForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const sendBtn = document.getElementById('send-otp-btn');
        const numberInput = document.getElementById('phone-number').value;

        // Normalize phone number: ensure it starts with +91 and has 10 digits
        const phoneNumber = "+91" + numberInput.trim().slice(-10);

        const appVerifier = window.recaptchaVerifier;

        if (sendBtn) {
            sendBtn.innerHTML = "Sending...";
            sendBtn.disabled = true;
        }

        console.log("Starting phone auth for:", phoneNumber);

        auth.signInWithPhoneNumber(phoneNumber, appVerifier)
            .then((result) => {
                console.log("SMS Sent successfully");
                confirmationResult = result;
                phoneAuthForm.classList.add('hidden');
                otpVerifyForm.classList.remove('hidden');
            }).catch((error) => {
                console.error("Phone Auth Error:", error);
                alert("Error: " + error.message);
                if (sendBtn) {
                    sendBtn.innerHTML = "Send OTP";
                    sendBtn.disabled = false;
                }
                if (window.grecaptcha) grecaptcha.reset();
            });
    });

    otpVerifyForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('otp-code').value;
        if (confirmationResult) {
            confirmationResult.confirm(code)
                .then((result) => {
                    updateUIForLoggedInUser(result.user);
                    closeModal();
                })
                .catch(error => {
                    console.error("Verification Error:", error);
                    alert("Invalid Code: " + error.message);
                });
        }
    });

})();
