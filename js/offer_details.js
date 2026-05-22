const container = document.getElementById('offer_container');

document.addEventListener('DOMContentLoaded', () =>{
    document.getElementById('header_placeholder').innerHTML = commonComponents.header;
    document.getElementById('menubar_placeholder').innerHTML = commonComponents.menubar;
    document.getElementById('footer_root_placeholder').innerHTML = commonComponents.footerRoot;

    initCommonUI();
    checkUserSession();
    window.modalManager = new ModalManager('log_form', 'reg_form', 'checkout_payment_form');


    const urlParam = new URLSearchParams(window.location.search);
    const offerId = urlParam.get('id');
    offerCheckIn = urlParam.get('checkin');
    offerCheckOut = urlParam.get('checkout');

    if(!offerId){
        document.getElementById('offer_container').innerHTML = "<h2>Offer not found</h2>";
        return;
    }

    fetch(`php/get_selected_offer.php?id=${offerId}`)
        .then(response => response.json())
        .then(data => {renderDetails(data)})
        .catch(err => console.error("Error loading details: ", err));
});

function renderDetails(item){

    const allPhotos = [item.img, ...(item.photos || [])];
    window.currentPhotos = allPhotos;
    window.photoIndex = 0;

    const rate = JSON.parse(localStorage.getItem('exchangeRates'))[localStorage.getItem('currentCurrency')] || 1;
    const convertedPrice = (item.price * rate).toFixed(2);

    URL_MAPS = `https://www.google.com/maps/search/?api=1&query=
    ${encodeURIComponent(item.details.house_number + ', ' + item.details.street + ', ' + item.city + ', ' + item.country)}`;

    const rating = item.rating ? parseFloat(item.rating).toFixed(1) : "0.0";

    container.innerHTML = `

        <div class="offer_header">
            <div class="title_rating_wrapper">
                <h1>${item.name}</h1>
                <div class="offer_rating">
                    <img class="rating_icon" src="https://i.ibb.co/cKgrLS0s/rating-icon.png" alt="img_rating_icon_alt">
                    <span class ="rating_value">${rating}</span>
                </div>
            </div>
            
            <p class="offer_location">
                <a href="${URL_MAPS} target="_blank"">${item.details.house_number } ${item.details.street}, ${item.city} / ${item.country}</a>
            </p>
        </div>

        <div class="offer_layout">

            <div class="left_column">
                <div class="slider_container">
                    <div class ="main_image_wrapper">
                        <img src="${allPhotos[0]}" id="slider_img" alt="${item.name}">
                        <button class="slider_btn prev" onclick="changePhoto(-1)"><</button>
                        <button class="slider_btn next" onclick="changePhoto(1)">></button>

                        <div class="photo_counter">
                            <span id="current_num_photo">1 / ${allPhotos.length}</span>
                        </div>
                    </div>
                </div>

                <div class="main_content">
                    <h3>Benefits:</h3>
                    <div class="benefits_list">
                        ${item.benefits.map(b => `<span class="benefit_pill">${b.name}</span>`).join('')}
                    </div>
                    <p class="description" style="white-space: pre-line;">${item.description}</p>
                </div>
            </div>

            <div class="right_column">
                <div class="booking_form">
                    <div class="booking_card">
                        <div class="price_big">${convertedPrice} ${localStorage.getItem('currentSymbol')} / night</div>

                        <div class="booking_dates_form">
                            <div class="date_input_group">
                                <img src="https://i.ibb.co/DHjtJRwW/calendar.png" alt="calendar_alt">
                                <label for="booking_check_in">Check-In</label>
                            </div>
                            <input type="date" id="booking_check_in" readonly required placeholder="dd.mm.yyyy">
                            <div class="date_input_group">
                                <img src="https://i.ibb.co/DHjtJRwW/calendar.png" alt="calendar_alt">
                                <label for="booking_check_out">Check-Out</label>
                            </div>
                            <input type="date" id="booking_check_out" readonly required placeholder="dd.mm.yyyy">
                        </div>
                    </div>

                    <button class="btn_book_now" onclick="startBooking(${item.offer_id}, event)">Book now</button>
                </div>
            </div>
        </div>
    `;

    const inputBookingCheckIn = document.getElementById('booking_check_in');
    const inputBookingCheckOut = document.getElementById('booking_check_out');

    if(offerCheckIn) inputBookingCheckIn.value = offerCheckIn;
    if(offerCheckOut) inputBookingCheckOut.value = offerCheckOut; 

    window.offerDetailsCalendar = new CustomCalendar('booking_check_in', 'booking_check_out', item.bookings || []);
}

function changePhoto(direction){
    const imgElement = document.getElementById('slider_img');
    const counterElement = document.getElementById('current_num_photo')

    imgElement.style.opacity = '0';

    setTimeout(() =>{
        window.photoIndex += direction;

        if (window.photoIndex >= window.currentPhotos.length) {
            window.photoIndex = 0;
        }
        if (window.photoIndex < 0) {
            window.photoIndex = window.currentPhotos.length - 1;
        }

        imgElement.src = window.currentPhotos[window.photoIndex];
        counterElement.innerText = `${window.photoIndex + 1} / ${window.currentPhotos.length}`
        
        imgElement.style.opacity = '1';
    }, 400);
}

async function startBooking(offer_id, e) {
    const inputBookingCheckIn = document.getElementById('booking_check_in');
    const inputBookingCheckOut = document.getElementById('booking_check_out');
    
    if(inputBookingCheckIn.value === ""){window.offerDetailsCalendar.openModal(e); return;}
    if(inputBookingCheckOut.value === ""){window.offerDetailsCalendar.openModal(e); return;}

    try{
        const response = await fetch('php/check_auth.php');
        const data = await response.json();

        if(!data.isLoggedIn){
            window.modalManager.logModal.style.display = 'block';
            return;
        }

        const dateIn = new Date(inputBookingCheckIn.value);
        const dateOut = new Date(inputBookingCheckOut.value);
        const nights = Math.ceil(Math.abs(dateOut-dateIn) / (1000 * 60 * 60 * 24));

        const priceText = document.querySelector('.price_big').innerText.split('/')[0].trim();
        const singlePrice = parseFloat(priceText);
        const totalPrice = (singlePrice * nights).toFixed(2);
        const currencySymbol = localStorage.getItem('currentSymbol');
        const offerName = document.querySelector('.offer_header h1').innerText;

        if(window.modalManager){
            window.modalManager.fillCheckout({
                offerName: offerName,
                checkIn: inputBookingCheckIn.value,
                checkOut: inputBookingCheckOut.value,
                nights: nights,
                totalPrice: `${totalPrice} ${currencySymbol}`,
                onConfirm: async (paymentMethod) => {
                    const bookingData = {
                        offer_id: offer_id,
                        check_in: inputBookingCheckIn.value,
                        check_out: inputBookingCheckOut.value,
                        total_price: totalPrice,
                        payment_method: paymentMethod
                    };

                    const bookingResponce = await fetch('php/create_booking.php', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(bookingData)
                    });

                    const bookingResult = await bookingResponce.json();

                    if(bookingResult.status === "success"){
                        alert('create');
                    }else{
                        alert('fail: '+ bookingResult.message);
                    }
                }
            });
        }
        
    }catch(err){console.error("Check session error: "+ err);}
}