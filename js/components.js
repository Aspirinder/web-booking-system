/*
    UI COMPONENTS & SHARED LOGIC
    Contains HTML templates for shared elements and the logic to initialize them.
*/

const commonComponents ={
    // Main site header (Logo, Currency, Auth buttons)
    header: `
        <header class="header_root">
            <div class="logo">
                <span class="main_title">Booking system</span>
                <small class="author">by Anton Talmachou</small>
            </div>

            <div class="header_bar">
                <div class="currency_selector">
                    <button class="btn_money" id="active_currency">USD</button>
                    <div class="currency_list" id="currency_list">
                        <div class="currency_option" data-code="PLN" data-symbol="zł">PLN (zł)</div>
                        <div class="currency_option" data-code="USD" data-symbol="$">USD ($)</div>
                        <div class="currency_option" data-code="EUR" data-symbol="€">EUR (€)</div>
                    </div>
                </div>
                <button class="btn_lang"><img src="https://i.ibb.co/jPcJxhHG/icons8-poland-96.png" alt="btn_img_lang" class="btn_img_menu"></button>
                <button class="btn_menu"><img src="https://i.ibb.co/RTGjS8gy/login.png" alt="btn_img_login" class="btn_img_menu"><span>Log In</span></button>
                <button class="btn_menu"><img src="https://i.ibb.co/nMJdXbPM/signin.png" alt="btn_img_signup" class="btn_img_menu"><span>Sign Up</span></button>
                <button class="btn_menu" style="display: none;"><img src="https://i.ibb.co/hx5WyV7z/person.png" alt="btn_img_user" class="btn_img_menu"><span>User</span></button>
                <button class="btn_menu" style="display: none;"><img src="https://i.ibb.co/NvYkdvN/log-out.png" alt="btn_img_logout" class="btn_img_menu"><span>Log out</span></button>
            </div>
        </header>
        `,

    // Category navigation menu
    menubar: `
        <div class="menubar">

            <button class="btn_menu active" data-category="Apartments">
                <img src="https://i.ibb.co/Q7sbjLqy/apartment.png" alt="btn_img_menu_apartment" class="btn_img_menu">
                <span>Apartments</span>
            </button>
            <button class="btn_menu" data-category="Villas">
                <img src="https://i.ibb.co/k2PrR65L/villa.png" alt="btn_img_menu_villa" class="btn_img_menu">
                <span>Villas</span>
            </button>
            <button class="btn_menu" data-category="Castles">
                <img src="https://i.ibb.co/7JsmFHsY/castle.png" alt="btn_img_menu_castle" class="btn_img_menu">
                <span>Castles</span>
            </button>
            <button class="btn_menu" data-category="Cars">
                <img src="https://i.ibb.co/N2SRQ70Z/car.png" alt="btn_img_menu_car" class="btn_img_menu">
                <span>Cars</span>
            </button>
            <button class="btn_menu" data-category="Helicopters">
                <img src="https://i.ibb.co/PZr35QxY/helicopter.png" alt="btn_img_menu_helicopter" class="btn_img_menu">
                <span>Helicopters</span>
            </button>
            <button class="btn_menu" data-category="Airplanes">
                <img src="https://i.ibb.co/qLp3b6Df/airplane.png" alt="btn_img_menu_airplane" class="btn_img_menu">
                <span>Airplanes</span>
            </button>
        </div>
        `,

    // Authentication Modals (Login & Registration)
    regModal: `
        <div id="reg_modal" class="modal">
            <div class="modal_content">
                <span class="close_modal">&times;</span>
                <h2 class="modal_title">Sign Up</h2>
                <form id="reg_form">
                    <input type="text" id="reg_username" placeholder="Username" required>
                    <input type="text" id="reg_fullname" placeholder="Name and surname" required>
                    <input type="email" id="reg_email" placeholder="Email" required>
                    <input type="password" id="reg_password" placeholder="Password" required>
                    <button type="submit" class="btn_submit">Create account</button>
                </form>
                <p class="result" id="reg_result"></p>
                <p class="reg_switch">Already have an account? <a href="#" id="switch_to_log">Log In</a></p>
            </div>
        </div>
        `,
    logModal: `
        <div id="log_modal" class="modal">
            <div class="modal_content">
                <span class="close_modal">&times;</span>
                <h2 class="modal_title">Sign In</h2>
                <form id="log_form">
                    <input type="email" id="log_email" placeholder="Email" required>
                    <input type="password" id="log_password" placeholder="Password" required>
                    <button type="submit" class="btn_submit">Sign In</button>
                </form>
                <p class="reg_switch">Don't have an account? <a href="#" id="switch_to_reg">Sign Up</a></p>
            </div>
        </div>
        `,

    footerRoot: `
        <footer class="footer_root">
            <div class="footer_container">
                <div class="footer_info">
                <div class="logo">
                    <span class="main_title">Booking System</span>
                    <small class="author">by Anton Talmachou</small>
                </div>
                <p class="footer_mission">Providing unparalleled access to the world's most exclusive destinations since 2024.</p>
                </div>

                <div class="footer_links">
                    <div class="link_group">
                        <h4>Experiences</h4>
                        <a href="#" class="footer_category" data-category="Apartments">Apartments</a>
                        <a href="#" class="footer_category" data-category="Villas">Villas</a>
                        <a href="#" class="footer_category" data-category="Castles">Castles</a>
                        <a href="#" class="footer_category" data-category="Cars">Cars</a>
                        <a href="#" class="footer_category" data-category="Helicopters">Helicopters</a>
                        <a href="#" class="footer_category" data-category="Airplanes">Airplanes</a>
                    </div>
                </div>
                <div class="link_group">
                    <h4>Support</h4>
                    <a href="#">Private Concierge</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Privacy Policy</a>
                </div>

                <div class="footer_bottom">
                    <p>&copy; 2026 Booking System Deluxe. All rights reserved.</p>
                    <div class="social_icons">
                        <a href="#"><img src="https://i.ibb.co/WW5Lztsv/Instagram.png" alt="Instagram_img"></a>
                        <a href="#"><img src="https://i.ibb.co/MkchN8BX/X.png" alt="X_img"></a>
                    </div>
                </div>
            </div>
        </footer>
        `
}
/*
    Common UI Initialization.
    Binds event listeners to the components after they are injected into the DOM.
    This function must be called on every page.
*/
function initCommonUI(){
    // Menu Buttons
    const categoryButtons = document.querySelectorAll('.menubar button');
    const currencyBtn = document.getElementById('active_currency');
    currencyBtn.textContent = localStorage.getItem('currentCurrency') || 'USD';
    const currencyList = document.getElementById('currency_list');
    const [signInBtn, signUpBtn, userBtn, logOutBtn] = document.querySelectorAll('.btn_menu');

    // Logo
    const logo = document.querySelector('.logo');

    // Modals
    const logModal = document.getElementById('log_modal');
    const regModal = document.getElementById('reg_modal');
    const regResult = document.getElementById('reg_result');
    const closeModals = document.querySelectorAll('.close_modal');
    const switchToLog = document.getElementById('switch_to_log');
    const switchToReg = document.getElementById('switch_to_reg');

    // Footer categories
    const footerCategories = document.querySelectorAll('.footer_category');

    // Category Navigation Logic
    categoryButtons.forEach(btn =>{
        btn.onclick = () => {
            const category = btn.innerText;

            if(!window.location.pathname.includes('index.html')) window.location.href = `index.html?category=${category}`;
            else changeCategory(btn);
        };
    });

    // Logo Logic: Return Home or Refresh
    logo.addEventListener('click', () =>{
        if(!window.location.pathname.includes('index.html')) window.location.href = `index.html`;
        else location.reload();
    });

    // Currency Dropdown Toggle
    currencyBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent Event Bubbling to Document Click Listener
        currencyList.classList.toggle('show');
    });


    // Currency Selection and Real-time Recalculation
    document.querySelectorAll('.currency_option').forEach(item => {
        item.addEventListener('click', () => {
            localStorage.setItem('currentCurrency', item.getAttribute('data-code'));
            localStorage.setItem('currentSymbol', item.getAttribute('data-symbol'))

            currencyBtn.innerText = localStorage.getItem('currentCurrency'); // Update Trigger Button Text
        // Refresh Current View With New Exchange Rates
        if(!window.location.pathname.includes('index.html')){
            location.reload();
        }else{
            if(isSearch) showSearchOffers(shownOffersData);
            else recommendationOffers();
        }
        });
    });

    // Modal Window Visibility Controls
    signUpBtn.addEventListener('click', () => regModal.style.display = 'block');
    signInBtn.addEventListener('click', () => logModal.style.display = 'block');

    // Toggle Between Login/Register
    switchToLog.addEventListener('click', (e) => {
        e.preventDefault(); // Stop Hash Navigation
        regModal.style.display = 'none';
        logModal.style.display = 'block';
    });

    switchToReg.addEventListener('click', (e) => {
        e.preventDefault();
        logModal.style.display = 'none';
        regModal.style.display = 'block';
    });

    // Close any Open Modal by Clicking the Cross Icon
    closeModals.forEach(button => {
        button.addEventListener('click', () => {
        const parent = button.parentElement.parentElement; // Traverses Up to the .modal container
        parent.style.display = 'none';
        })
    });

    // Registration Form Submission
    document.getElementById('reg_form').addEventListener('submit', async(e) => {
        e.preventDefault();
        registration();
    });

    // Login Form Submission
    document.getElementById('log_form').addEventListener('submit', async(e) => {
        e.preventDefault();
        login();
    });

    // Footer Category Logic
    footerCategories.forEach(footer =>{
        footer.addEventListener('click', (e) => {
            e.preventDefault();

            const category = footer.getAttribute('data-category');

            if(window.location.pathname.includes('index.html')) {
                const targetBtn = document.querySelector(`.menubar .btn_menu[data-category="${category}"]`);
                changeCategory(targetBtn);
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
            else window.location.href = `index.html?category=${category}`;
        });
    });
}

// Check Session
async function checkUserSession() {
    try{
        const response = await fetch('php/check_auth.php');
        const data = await response.json();
        // Change Interface if Session is
        if(data.isLoggedIn) updateHeaderForUser();
    }catch(error) {console.error("Auth check failed: ", error);}
}


// Change Interface if Logined
async function updateHeaderForUser() {
    const [signInBtn, signUpBtn, userBtn, logOutBtn] = document.querySelectorAll('.btn_menu');
    signInBtn.style.display = 'none';
    signUpBtn.style.display = 'none';

    userBtn.style.display = 'flex';
    logOutBtn.style.display = 'flex';
    logOutBtn.addEventListener('click', logout);
}

// Log Out
async function logout() {
    await fetch('php/logout.php');
    location.reload();
}

// Login Logic
async function login(){
    const userData = {
        log_email: document.getElementById('log_email').value,
        log_password: document.getElementById('log_password').value
    };

    try{
        const response = await fetch('php/login.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        if(result.status === 'success'){
            setTimeout(() => {document.getElementById('log_modal').style.display = 'none';}, 2000);
            updateHeaderForUser();
        }
    }catch(error){console.error("Log error:", error);}
}

// Registration Logic
async function registration(){
    // Data Transfer Object (DTO) for registration
    const userData = {
        reg_username: document.getElementById('reg_username').value,
        reg_fullname: document.getElementById('reg_fullname').value,
        reg_email: document.getElementById('reg_email').value,
        reg_password: document.getElementById('reg_password').value,
        reg_language: 'PLN',
        reg_currency: document.getElementById('active_currency').textContent()
    };

    try{
        const regResult = document.getElementById('reg_result');
        const response = await fetch('php/register.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        reg_result.innerText = result.message; // Display Server Response

        if(result.status === 'success'){
            e.target.reset(); // Reset Form Fields
            regResult.style.color = '#4CAF50';

            // Auto-close Modal After Delay
            setTimeout(() => {document.getElementById('reg_modal').style.display = 'none'; regResult.innerText = '';}, 2000);
        }else regResult.style.color = "#ff4d4d";
    }catch(error){
        regResult.innerText = 'Server connection failed';
        regResult.style.color = "#ff4d4d";
        console.error('Reg error: ', error);
    }
}