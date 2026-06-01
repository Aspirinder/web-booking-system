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
                <button class="btn_lang"><img src="https://i.ibb.co/1JQCkHwj/english.png" alt="btn_img_lang" class="btn_img_menu"></button>
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
        `,
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
    signUpBtn.addEventListener('click', () => document.getElementById('reg_modal').style.display = 'block');
    signInBtn.addEventListener('click', () => document.getElementById('log_modal').style.display = 'block');

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

class CustomCalendar{
    constructor(inputCheckInId, inputCheckOutId, bookedPeriods =[], onRangeSelected= []){
        this.inputCheckIn = document.getElementById(inputCheckInId);
        this.inputCheckOut = document.getElementById(inputCheckOutId);
        this.bookedPeriods = bookedPeriods;
        this.onRangeSelected = onRangeSelected;

        this.currentDate = new Date();
        this.selectedStart = this.inputCheckIn.value ? this.inputCheckIn.value : null;
        this.selectedEnd = this.inputCheckOut.value ? this.inputCheckOut.value : null;

        this.initDOM();
        this.initEvents();
    }

    initDOM(){
        this.modal = document.createElement('div');
        this.modal.className = "custom_calendar_modal";
        this.modal.innerHTML = `
            <div class="calendar_box">
                <span class="close_calendar">&times;</span>
                <div class="calendar_header">
                    <button type="button" id="btn_prev_month">&lt;</button>
                    <h3 id="calendar_month_year">Month Year</h3>
                    <button type="button" id="btn_next_month">&gt;</button>
                </div>
                <div class="calendar_weekdays">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                <div>
                    <div id="calendar_days" class="calendar_days_grid"></div>
                    <div class="calendar_footer_info">
                        <div class="legend_block">
                            <span class="legend_item booked"></span>
                            <span class="legend_text">Already booked</span>
                        </div>
                        <div class="legend_block">
                            <span class="legend_item selected"></span>
                            <span class="legend_text">Your selection</span>
                        </div>
                    </div>
                </div>
            </div>
            `;
        document.body.appendChild(this.modal);

        this.daysContainer = document.getElementById('calendar_days');
        this.monthYearLabel = document.getElementById('calendar_month_year');
        this.prevMonthBtn = document.getElementById('btn_prev_month');
        this.nextMonthBtn = document.getElementById('btn_next_month');
        this.closeBtn = this.modal.querySelector('.close_calendar');
    }

    initEvents() {

        this.openModal = (e) => {
            if(e) e.stopPropagation();
            this.selectedStart = this.inputCheckIn.value ? this.inputCheckIn.value : null;
            this.selectedEnd = this.inputCheckOut.value ? this.inputCheckOut.value : null;
            const target = (e && (e.currentTarget === this.inputCheckIn || e.currentTarget === this.inputCheckOut)) ? e.currentTarget : this.inputCheckIn;
            const rect = target.getBoundingClientRect();
            this.modal.style.top = `${rect.bottom + window.scrollY + 5}px`;
            this.modal.style.left = `${rect.left + window.scrollX}px`;

            this.modal.classList.add('active');
            this.render();
        }

        this.inputCheckIn.addEventListener('click', (e) => this.openModal(e));
        this.inputCheckOut.addEventListener('click', (e) => this.openModal(e));

        this.prevMonthBtn.addEventListener('click', (e) =>{
                e.stopPropagation();
                this.currentDate.setMonth(this.currentDate.getMonth() -1);
                this.render();
            });

        this.nextMonthBtn.addEventListener('click', (e) =>{
            e.stopPropagation();
            this.currentDate.setMonth(this.currentDate.getMonth() +1);
            this.render();
        });

        this.closeBtn.addEventListener('click', (e) => {e.stopPropagation(); this.modal.classList.remove('active')});

        document.addEventListener('click', (e) => {
            if (!this.modal.classList.contains('active')) return;
            
            if (!document.body.contains(e.target)) return;

            const isClickInsideCalendar = e.target.closest('.calendar_box');
            const isClickOnInputs = (e.target === this.inputCheckIn || e.target === this.inputCheckOut);

            if (!isClickInsideCalendar && !isClickOnInputs) {
                this.modal.classList.remove('active');
            }
        });
    }

    render() {
        this.daysContainer.innerHTML = '';
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        this.monthYearLabel.innerText = this.currentDate.toLocaleString('pl-PL', {month: 'long', year: 'numeric'});
        const firstDayIndex = new Date(year, month, 1, 12, 0, 0).getDay();
        const totalDays = new Date(year, month+1, 0, 12, 0, 0).getDate();

        const today = new Date();
        today.setHours(12,0,0,0);

        for(let i = 0; i < firstDayIndex; i++){this.daysContainer.appendChild(document.createElement('div'));}

        for(let day=1; day<=totalDays; day++){
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar_day');
            dayDiv.innerText = day;

            const thisDate = new Date(year, month, day, 12);
            const thisDateStr = thisDate.toISOString().split('T')[0];

            if(thisDate < today){
                dayDiv.classList.add('disabled');
            }else if(this.isDateBooked(thisDateStr)){
                dayDiv.classList.add('booked_day');
            }else{
                if(this.selectedStart && thisDateStr === this.selectedStart) dayDiv.classList.add('selected_range');
                if(this.selectedEnd && thisDateStr === this.selectedEnd) dayDiv.classList.add('selected_range');
                if(this.selectedStart && this.selectedEnd && thisDateStr > this.selectedStart && thisDateStr < this.selectedEnd) dayDiv.classList.add('selected_range');

                dayDiv.addEventListener('click', () => this.handleDaySelection(thisDate));
            }

            this.daysContainer.appendChild(dayDiv);
        }
    }

    isDateBooked(thisDateStr){
        return this.bookedPeriods.some(p => {return thisDateStr >= p.check_in && thisDateStr <= p.check_out;});
    }

    handleDaySelection(date){
        const localStr = date.toISOString().split('T')[0];

        if (!this.selectedStart || (this.selectedStart && this.selectedEnd)) {
            this.selectedStart = localStr;
            this.selectedEnd = null;
            this.inputCheckIn.value = localStr;
            this.inputCheckOut.value = '';
        } else if (this.selectedStart && !this.selectedEnd) {

            if (localStr < this.selectedStart) {
                this.selectedStart = localStr;
                this.inputCheckIn.value = localStr;
            } else {

                if (this.hasBookedDaysInside(this.selectedStart, date)) return;

                this.selectedEnd = date;
                this.inputCheckOut.value = localStr;
                this.modal.classList.remove('active');
                
                if(this.onRangeSelected) this.onRangeSelected[this.inputCheckIn.value, this.inputCheckOut.value];
            }
        }
        this.render();
    }

    hasBookedDaysInside(start, end) {
        return this.bookedPeriods.some(p => {
            const bStart = new Date(p.check_in);
            return bStart > start && bStart < end;
        });
    }
}

class ModalManager{
    constructor(loginFormId, regFormId, checkoutFormId, bookingDetailsFormId){
        this.loginFormId = loginFormId;
        this.regFormId = regFormId;
        this.checkoutFormId = checkoutFormId;
        this.bookingDetailsFormId = bookingDetailsFormId;

        this.render();

        this.loginForm = document.getElementById(this.loginFormId);
        this.regForm = document.getElementById(this.regFormId);
        this.checkoutForm = document.getElementById(this.checkoutFormId);
        this.bookingDetailsForm = document.getElementById(this.bookingDetailsFormId);

        this.logModal = document.getElementById('log_modal');
        this.regModal = document.getElementById('reg_modal');
        this.checkoutModal = document.getElementById('checkout_modal');
        this.bookingDetailsModal = document.getElementById('booking_details_modal');

        this.switchToLog = document.getElementById('switch_to_log');
        this.switchToReg = document.getElementById('switch_to_reg');
        this.closeModals = document.querySelectorAll('.close_modal');

        this.onConfirmCallback = null;

        this.initEvents();
    }

    render(){
        //if(document.getElementById('log_modal') || document.getElementById('reg_modal')) return;

        const container = document.createElement('div');
        container.id = "auth_modals_container";
        if(this.regFormId){
            container.innerHTML += `
                <div id="reg_modal" class="modal">
                    <div class="modal_content">
                        <span class="close_modal">&times;</span>
                        <h2 class="modal_title">Sign Up</h2>
                        <form id="${this.regFormId}" class="reg_form">
                            <input type="text" id="reg_username" placeholder="Username" required>
                            <input type="text" id="reg_fullname" placeholder="Name and surname" required>
                            <input type="email" id="reg_email" placeholder="Email" required>
                            <input type="password" id="reg_password" placeholder="Password" required>
                            <button type="submit" class="btn_submit">Create account</button>
                        </form>
                        <p class="result" id="reg_result"></p>
                        <p class="reg_switch">Already have an account? <a href="#" id="switch_to_log">Log In</a></p>
                    </div>
                </div>`;
        }
        if(this.loginFormId){
            container.innerHTML += `
                <div id="log_modal" class="modal">
                    <div class="modal_content">
                        <span class="close_modal">&times;</span>
                        <h2 class="modal_title">Sign In</h2>
                        <form id="${this.loginFormId}" class="log_form">
                            <input type="email" id="log_email" placeholder="Email" required>
                            <input type="password" id="log_password" placeholder="Password" required>
                            <button type="submit" class="btn_submit">Sign In</button>
                        </form>
                        <p class="reg_switch">Don't have an account? <a href="#" id="switch_to_reg">Sign Up</a></p>
                    </div>
                </div>`;
        }

        if(this.checkoutFormId){
            container.innerHTML += `
                <div id="checkout_modal" class="modal">
                    <div class="modal_content checkout_content">
                        <span class="close_modal">&times;</span>
                        <h2 class="modal_title">Confirm Booking</h2>

                        <div class="checkout_summary">
                            <p><strong>Property: </strong><span id="out_offer_name">-</span></p>
                            <p><strong>Dates: </strong><span id="out_offer_dates">-</span></p>
                            <p><strong>Total nights: </strong><span id="out_offer_nights">0</span></p>
                            <hr>
                            <h3 class="total_price_title">Total price: <span id="out_total_price">0</span></h3>
                        </div>

                        <form id="${this.checkoutFormId}" class="check_out_form">
                            <h4 class="payment_title">Select Payment Method:</h4>
                            <div class="payment_options">
                                <label class="pay_option">
                                    <input type="radio" name="payment_method" value="creadit_card" checked>
                                    <span>Creadit Card</span>
                                </label>
                                <label class="pay_option">
                                    <input type="radio" name="payment_method" value="paypal">
                                    <span>PayPal</span>
                                </label>
                                <label class="pay_option">
                                    <input type="radio" name="payment_method" value="crypto">
                                    <span>Cryptocurrency</span>
                                </label>
                            </div>

                            <button type="submit" class="btn_submit btn_confirm_pay">Pay & Book Now</button>
                        </form>
                    </div>
                </div>`;
        }

        if(this.bookingDetailsFormId){
            container.innerHTML += `
                <div id="booking_details_modal" class="modal">
                    <div class="modal_content booking_details">
                        <span class="close_modal">&times;</span>
        
                        <div class="modal_header_section">
                            <h2 id="md_offer_name" class="offer_link_title">Loading Property...</h2>
                            <div class="modal_dates_badge">
                                <img src="https://i.ibb.co/DHjtJRwW/calendar.png" alt="calendar">
                                <span id="md_booking_dates">00.00.0000 — 00.00.0000</span>
                            </div>
                        </div>

                        <div class="info_card">
                            <div class="card_card_header">
                                <img src="https://i.ibb.co/hx5WyV7z/person.png" alt="host">
                                <h3>Host Information</h3>
                            </div>
                            <div class="card_body_content">
                                <div class="info_meta_group">
                                    <label>Name</label>
                                    <span id="md_host_name">-</span>
                                </div>
                                <div class="info_meta_group">
                                    <label>Email (Click to copy)</label>
                                    <span id="md_host_email" class="copy_target">-</span>
                                </div>
                                <div class="info_meta_group">
                                    <label>Phone (Click to copy)</label>
                                    <span id="md_host_phone" class="copy_target">-</span>
                                </div>
                            </div>
                        </div>

                        <div class="info_card">
                            <div class="card_card_header">
                                <img src="https://i.ibb.co/NvYkdvN/log-out.png" style="transform: rotate(180deg);" alt="billing">
                                <h3>Payment & Status</h3>
                            </div>
                            <div class="card_body_content grid_2_columns">
                                <div class="info_meta_group">
                                    <label>Method</label>
                                    <span id="md_payment_method">-</span>
                                </div>
                                <div class="info_meta_group">
                                    <label>Status</label>
                                    <span id="md_booking_status" class="badge">pending</span>
                                </div>
                            </div>
                            <div class="card_footer_price">
                                <label>Total Paid</label>
                                <span id="md_total_price">0.00 $</span>
                            </div>
                        </div>

                        <form id="${this.bookingDetailsFormId}" class="modal_actions">
                            <button type="submit" id="btn_cancel_booking" class="btn_cancel_booking">Cancel This Booking</button>
                        </form>
                    </div>
                </div>`;
        }

        document.body.appendChild(container);
    }

    initEvents(){
        if(this.loginForm){
            this.loginForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                this.hadleLogin();
            });
        }

        if(this.regForm){
            this.regForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                this.hadleRegistration(e);
            })
        }

        if(this.regForm || this.loginForm){
            // Toggle Between Login/Register
            this.switchToLog.addEventListener('click', (e) => {
                e.preventDefault(); // Stop Hash Navigation
                this.regModal.style.display = 'none';
                this.logModal.style.display = 'block';
            });

            this.switchToReg.addEventListener('click', (e) => {
                e.preventDefault();
                this.logModal.style.display = 'none';
                this.regModal.style.display = 'block';
            });
        }

        if(this.checkoutForm){
            this.checkoutForm.addEventListener('submit', async (e) =>{
                e.preventDefault();

                const selectedMethod = this.checkoutForm.querySelector('input[name="payment_method"]:checked').value;

                if(typeof this.onConfirmCallback === "function") this.onConfirmCallback(selectedMethod);
            });
        }

        if(this.bookingDetailsForm){
            this.bookingDetailsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBookingCancellation();
            });
        }

        // Close any Open Modal by Clicking the Cross Icon
        this.closeModals.forEach(button => {
            button.addEventListener('click', () => {
                if(this.logModal) this.logModal.style.display ='none';
                if(this.regModal) this.regModal.style.display ='none';
                if(this.checkoutModal) this.checkoutModal.style.display ='none';
                if(this.bookingDetailsModal) this.bookingDetailsModal.style.display ='none';

                const regResult = document.getElementById('reg_result');
                if(regResult) regResult.innerText = '';
            });
        });


    }

    // Login Logic
    async hadleLogin(){
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
    async hadleRegistration(e){
        const regResult = document.getElementById('reg_result');
        // Data Transfer Object (DTO) for registration
        const userData = {
            reg_username: document.getElementById('reg_username').value,
            reg_fullname: document.getElementById('reg_fullname').value,
            reg_email: document.getElementById('reg_email').value,
            reg_password: document.getElementById('reg_password').value
        };

        try{
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
                setTimeout(() => {document.getElementById('reg_modal').style.display = 'none'; regResult.innerText = '';}, 1000);
            }else regResult.style.color = "#ff4d4d";
        }catch(error){
            regResult.innerText = 'Server connection failed';
            regResult.style.color = "#ff4d4d";
            console.error('Reg error: ', error);
        }
    }

    fillCheckout(summary){
        document.getElementById('out_offer_name').innerText = summary.offerName;
        document.getElementById('out_offer_dates').innerText = `${summary.checkIn} - ${summary.checkOut}`;
        document.getElementById('out_offer_nights').innerText = summary.nights;
        document.getElementById('out_total_price').innerText = summary.totalPrice;

        if(summary.onConfirm) this.onConfirmCallback = summary.onConfirm;

        if(this.checkoutModal) this.checkoutModal.style.display = 'block';
    }

    async openBookingDetails(bookingId){
        this.activeBookingId = bookingId;

        try{
            const response = await fetch(`php/get_booking_details.php?id=${bookingId}`);
            const result = await response.json();

            if(result.status !== 'success'){ console.error('Error php: ', result.message); return; }

            const booking = result.booking;
            const currencySymbol = typeof getCurrencySymbol === 'function' ? getCurrencySymbol(booking.currency) : booking.currency;

            document.getElementById('md_offer_name').textContent = booking.offer_name;
            document.getElementById('md_booking_dates').textContent = `${booking.check_in} — ${booking.check_out}`;
            document.getElementById('md_host_name').textContent = booking.host_name;
            document.getElementById('md_host_email').textContent = booking.owner_email || 'Not provided';
            document.getElementById('md_host_phone').textContent = booking.owner_phone_number || 'Not provided';
            document.getElementById('md_total_price').textContent = `${booking.total_price} ${currencySymbol}`;
            document.getElementById('md_payment_method').textContent = booking.payment_method.toUpperCase();

            const statusBadge = document.getElementById('md_booking_status');
            statusBadge.textContent = booking.status;
            statusBadge.className = `badge ${booking.status}`;

            const btnCancel = document.getElementById('btn_cancel_booking');
            if (booking.status === 'cancelled') btnCancel.style.display = 'none';
            else btnCancel.style.display = 'block';

            if (this.bookingDetailsModal) this.bookingDetailsModal.style.display = 'block';

        }catch(err) {console.error('Error loading contextual booking details layout:', err);}
    }

    async handleBookingCancellation(){
        if(!this.activeBookingId) return;

        if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
        
        try {
            const response = await fetch('php/cancel_booking.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: this.activeBookingId })
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert('Booking successfully cancelled.');
                window.location.reload();
            } else alert('Cancellation failed: ' + result.message);
        } catch (err) { console.error('Error modifying reservation status fields:', err); }
    }
}

// Check Session
async function checkUserSession() {
    try{
        const response = await fetch('php/check_auth.php');
        const data = await response.json();
        // Change Interface if Session is
        if(data.isLoggedIn) {
            updateHeaderForUser(data.userId);
            return true;
        }else return false;

    }catch(error) {console.error("Auth check failed: ", error);}

}

// Change Interface if Logined
async function updateHeaderForUser(userId) {
    const [signInBtn, signUpBtn, userBtn, logOutBtn] = document.querySelectorAll('.btn_menu');
    signInBtn.style.display = 'none';
    signUpBtn.style.display = 'none';

    userBtn.style.display = 'flex';
    logOutBtn.style.display = 'flex';
    logOutBtn.addEventListener('click', logout);
    userBtn.addEventListener('click', () => {
        window.open(`user_profile.html?id=${userId}`, '_blank');
    });
}

// Log Out
async function logout() {
    await fetch('php/logout.php');
    location.reload();
}