const offerContainer = document.getElementById('offer_container');
const imgElement = document.getElementById('slider_img');
const counterElement = document.getElementById('current_num_photo');
const inputBookingCheckIn = document.getElementById('booking_check_in');
const inputBookingCheckOut = document.getElementById('booking_check_out');
const ratingValue = document.querySelector('.rating_value');
const offerLocation = document.getElementById('offer_location');
const [btn_prev, btn_next] = document.querySelectorAll('.slider_btn');
const benefitsList = document.getElementById('benefits_list');
const description = document.getElementById('description');
const price = document.getElementById('price_big');
const btnBookNow =document.getElementById('btn_book_now');
const title = document.getElementById('title');

document.getElementById('header_placeholder').innerHTML = commonComponents.header;
document.getElementById('menubar_placeholder').innerHTML = commonComponents.menubar;
document.getElementById('footer_root_placeholder').innerHTML = commonComponents.footerRoot;

initCommonUI();
checkUserSession();
window.modalManager = new ModalManager('log_form', 'reg_form', 'checkout_payment_form', '');

const urlParam = new URLSearchParams(window.location.search);
const offerId = urlParam.get('id');
offerCheckIn = urlParam.get('checkin');
offerCheckOut = urlParam.get('checkout');

renderDetails(offerId);

async function renderDetails(offerId){
    if(!offerId){offerContainer.innerHTML = "<h2>Offer not found</h2>"; return;}

    const response = await fetch(`php/get_selected_offer.php?id=${offerId}`).catch(err => console.error("Error loading details: ", err));;
    const item = await response.json();

    const allPhotos = [item.img, ...(item.photos || [])];
    window.currentPhotos = allPhotos;
    window.photoIndex = 0;

    const rate = JSON.parse(localStorage.getItem('exchangeRates'))[localStorage.getItem('currentCurrency')] || 1;
    const convertedPrice = (item.price * rate).toFixed(2);

    // Fill html
    ratingValue.textContent = item.rating ? parseFloat(item.rating).toFixed(1) : "0.0";
    offerLocation.href = `https://www.google.com/maps/search/?api=1&query=
    ${encodeURIComponent(item.details.house_number + ', ' + item.details.street + ', ' + item.city + ', ' + item.country)}`;
    offerLocation.textContent = `${item.details.house_number } ${item.details.street}, ${item.city} / ${item.country}`
    btn_next.textContent = '>'; btn_prev.textContent = '<';

    btn_next.addEventListener('click', () => changePhoto(1));
    btn_prev.addEventListener('click', () => changePhoto(-1));
    imgElement.src = allPhotos[0]; imgElement.alt = item.name;
    counterElement.textContent = `1 / ${allPhotos.length}`;
    benefitsList.innerHTML = item.benefits.map(b => `<span class="benefit_pill">${b.name}</span>`).join('');
    description.textContent = item.description;
    price.textContent = `${convertedPrice} ${localStorage.getItem('currentSymbol')} / night`;
    btnBookNow.addEventListener('click', (e) => startBooking(item.offer_id, e));
    title.textContent = item.name;

    if(offerCheckIn) inputBookingCheckIn.value = offerCheckIn;
    if(offerCheckOut) inputBookingCheckOut.value = offerCheckOut; 

    window.offerDetailsCalendar = new CustomCalendar('booking_check_in', 'booking_check_out', item.bookings || []);
}

function changePhoto(direction){
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

        const priceText = price.textContent.split('/')[0].trim();
        const singlePrice = parseFloat(priceText);
        const totalPrice = (singlePrice * nights).toFixed(2);
        const currencySymbol = localStorage.getItem('currentSymbol');
        const offerName = title.textContent;

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
                        currency: localStorage.getItem('currentCurrency'),
                        payment_method: paymentMethod
                    };

                    const bookingResponce = await fetch('php/create_booking.php', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(bookingData)
                    });

                    const bookingResult = await bookingResponce.json();

                    if(bookingResult.status === "success"){
                        window.location = `user_profile.html`
                    }else{
                        alert('fail: '+ bookingResult.message);
                    }
                }
            });
        }
        
    }catch(err){console.error("Check session error: "+ err);}
}