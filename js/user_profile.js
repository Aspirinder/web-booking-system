// DOM Element Nodes Initialization
const btnSwitchToGuestPanel = document.getElementById('btn_switch_to_guest_panel');
const btnSwitchToHostPanel = document.getElementById('btn_switch_to_host_panel');
const btnNewOffer = document.getElementById('btn_create_offer');
const guestPanel = document.getElementById('guest_panel');
const hostPanel = document.getElementById('host_panel');
const avatar = document.getElementById('user_avatar_img');

const bookingsContainer = document.getElementById('bookings_list_container');
const myOffersContainer = document.getElementById('offers_list_container');

// Form Edit Controls Selection Groups 
const btnsChange = document.querySelectorAll('.btn_update');
const btnsSave = document.querySelectorAll('.btn_save');
const btnsCancel = document.querySelectorAll('.btn_cancel');

// Global UI Components Injection
document.getElementById('header_placeholder').innerHTML = commonComponents.header;
document.getElementById('menubar_placeholder').innerHTML = commonComponents.menubar;
document.getElementById('footer_root_placeholder').innerHTML = commonComponents.footerRoot;

initCommonUI();
// Authenticate User Session
checkUserSession().then(session => {
    //throw new Error("Execution stopped: Unauthorized user.");
    if(!session) window.location.href = 'index.html';});
loadUserProfile();

window.modalManager = new ModalManager('', '', '', 'booking_details_form');
const housingCategories = ['Apartments', 'Villas', 'Castles'];

// Switch active dashboard viewport state to Guest panel mode
btnSwitchToGuestPanel.addEventListener('click', () => {
    hostPanel.classList.remove('active');
    btnSwitchToHostPanel.classList.remove('active');
    btnNewOffer.style.display ='none';

    guestPanel.classList.add('active');
    btnSwitchToGuestPanel.classList.add('active');
});

// Switch active dashboard viewport state to Host panel mode
btnSwitchToHostPanel.addEventListener('click', () => {
    hostPanel.classList.add('active');
    btnSwitchToHostPanel.classList.add('active');
    btnNewOffer.style.display ='flex';

    guestPanel.classList.remove('active');
    btnSwitchToGuestPanel.classList.remove('active');

});

// Handles clicking the user avatar image element to trigger a local file upload sequence
avatar.addEventListener('click', () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    // Execution path firing once file selection completes
    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if(!file) return;

        // Provide immediate visual pending feedback status
        avatar.style.opacity = '0.5';

        try{
            const formData = new FormData();
            formData.append('image', file);

            // Stream multi-part imagery binary data payload to server proxy endpoints
            const response = await fetch(`php/upload_avatar_proxy.php`, {
                method: 'POST',
                body: formData
            });

            const imgbbResult = await response.json();

            // Refresh layout target source context upon success response
            if(imgbbResult.status === 'success') avatar.src = imgbbResult.url;
            else console.error('ImgBB upload failed: ' + imgbbResult.error.message);

        }catch(error){console.error('Error uploading photo: ', error);}
        finally{avatar.style.opacity = '1';}
    });

    // Simulate mouse interaction to launch native operating system upload selection window
    fileInput.click();
});

// Activate interactive states and highlight fields for focused inline updates
btnsChange.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.dataset.type;
        
        const input = document.getElementById(`edit_${type}`);
        const btnCancel = document.querySelector(`.btn_cancel[data-type="${type}"]`);
        const btnSave = document.querySelector(`.btn_save[data-type="${type}"]`);

        if (input) {input.disabled = false; input.focus();}
        
        button.style.display = 'none';
        if (btnCancel) btnCancel.style.display = 'inline-block';
        if (btnSave) btnSave.style.display = 'inline-block';
    });
});

// Discard local text input modification steps and revert back to matching source values
btnsCancel.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.dataset.type;
        const input = document.getElementById(`edit_${type}`);
        const btnChange = document.querySelector(`.btn_update[data-type="${type}"]`);
        const btnSave = document.querySelector(`.btn_save[data-type="${type}"]`);

        if (input) {input.value = input.dataset.oldValue || ''; input.disabled = true;}

        button.style.display = 'none';
        if (btnSave) btnSave.style.display = 'none';
        if (btnChange) btnChange.style.display = 'inline-block';
    });
});

// Perform async validations and commit verified inline fields changes to database
btnsSave.forEach(button => {
    button.addEventListener('click', async () => {
        const type = button.dataset.type;
        const input = document.getElementById(`edit_${type}`);
        const btnChange = document.querySelector(`.btn_update[data-type="${type}"]`);
        const btnCancel = document.querySelector(`.btn_cancel[data-type="${type}"]`);

        if (!input) return;
        const newValue = input.value.trim();

        if (!newValue) return;

        // Dispatch modified value changes to remote storage endpoints if variations exist
        if (newValue !== input.dataset.oldValue) {
            const success = await sendFieldUpdateToServer(type, newValue);
            if (success) input.dataset.oldValue = newValue;
            else return;
        }

        input.disabled = true;
        button.style.display = 'none';
        if (btnCancel) btnCancel.style.display = 'none';
        if (btnChange) btnChange.style.display = 'inline-block';
    });
});

// Route interaction contexts toward creation forms interface
btnNewOffer.addEventListener('click', () => {
    window.location.href = 'create_offer.html';
});

// Dispatches specific profile updates packets to secure relational backends via JSON streams
async function sendFieldUpdateToServer(fieldName, fieldValue) {
    try {
        const response = await fetch('php/update_user_profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                field: fieldName, 
                value: fieldValue  
            })
        });

        const result = await response.json();
        if (result.status === 'success') return true;
        
        console.error('Update failed: ' + result.message);
        return false;
    } catch (error) {
        console.error('Error updating field:', error);
        return false;
    }
}

// Handles initial workspace generation, fetching related profile entries bundles asynchronously
async function loadUserProfile() {
    try {
        const response = await fetch('php/get_user_profile_info.php');
        const data = await response.json();

        // Perform quiet routing to root directory if server rejects profile credentials
        if (data.status === 'error') {
            window.location.href = 'index.html';
            return;
        }

        // Initialize state markers for user credential input fields
        setupInputState('edit_username', data.userInfo.username);
        setupInputState('edit_fullname', data.userInfo.fullname);
        setupInputState('edit_email', data.userInfo.email);

        avatar.src = data.avatar;

        renderBookings(data.bookings);
        renderMyOffers(data.myOffers);

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Standardizes default attributes for text input nodes to enforce read-only protection
function setupInputState(fieldId, value){
    const input = document.getElementById(fieldId);
    if(input){
        input.value = value || '';
        input.disabled = true;
        input.dataset.oldValue = value || '';
    }
}

// Dynamically builds the client-side bookings historical transactions dataset view panels list
function renderBookings(bookings){
    bookingsContainer.innerHTML = '';

    // Display appropriate placeholder if tracking datasets are empty
    if(!bookings || bookings.length === 0){
        bookingsContainer.innerHTML = `<div class="no_data_placeholder">You don't have any bookings yet.</div>`;
        return;
    }

    // Parse and render historical entries records matching internal categories rules
    bookings.forEach(b => {
        let category;
        if(b.category === 'Apartments') category = document.querySelectorAll('.btn_menu img')[4].src;
        if(b.category === 'Villas') category = document.querySelectorAll('.btn_menu img')[5].src;
        if(b.category === 'Castles') category = document.querySelectorAll('.btn_menu img')[6].src;
        if(b.category === 'Cars') category = document.querySelectorAll('.btn_menu img')[7].src;
        if(b.category === 'Helicopters') category = document.querySelectorAll('.btn_menu img')[8].src;
        if(b.category === 'Airplanes') category = document.querySelectorAll('.btn_menu img')[9].src;
        bookingsContainer.innerHTML += `
            <div class="list_booking_card" data-booking-id="${b.booking_id}">
                <div class="item_details">
                    <h3>${b.offer_name} <img src="${category}" alt="img_category" class="category_img"></h3>
                    <p><strong>Dates:</strong> ${b.check_in} — ${b.check_out}</p>
                </div>
                <div class="item_status_price">
                    <span class="badge ${b.status}">${b.status}</span>
                    <div class="price_tag">${b.total_price} ${getCurrencySymbol(b.currency)}</div>
                </div>
            </div>
        `;
    });

    // Attach dynamic details modal event hooks to individual generated card nodes
    const bookingsList = document.querySelectorAll('.list_booking_card');
    bookingsList.forEach(card => {
        card.addEventListener('click', () => {
            const bookingId = card.dataset.bookingId;
            if(window.modalManager) window.modalManager.openBookingDetails(bookingId);
        });
    });
}

// Generates and appends host-owned offers listings management layout panels list
function renderMyOffers(offers){
    myOffersContainer.innerHTML = '';

    // Display appropriate placeholder if tracking datasets are empty
    if (!offers || offers.length === 0) {
        myOffersContainer.innerHTML = '<div class="no_data_placeholder">You haven\'t listed any properties yet.</div>';
        return;
    }

    // Hydrate host offerings grid sections matching architectural guidelines layout structures
    offers.forEach(o => {
        myOffersContainer.innerHTML +=`
            <div class="list_my_offer_card">
                <div class="item_details">
                    <h3>${o.name}</h3>
                    <p>📍 ${o.city}, ${o.country}</p>
                </div>
                <div class="item_status_price">
                    <div class="price_tag">${o.price} $ / ${housingCategories.includes(o.category) ? 'night' : 'day'}</div>
                </div>
            </div>
        `;
    });
}

// Utility translation dictionary mapper to match currency ISO codes to unique shorthand characters symbols
function getCurrencySymbol(currencyCode) {
    if (!currencyCode) return '';

    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'PLN': 'zł',
        'UAH': '₴',
        'RUB': '₽',
        'BYN': 'Br'
    };
    const code = currencyCode.toUpperCase().trim();

    return symbols[code] || code;
}