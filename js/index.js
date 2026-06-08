/**
    MAIN INDEX PAGE LOGIC
    Manages the search bar, category filtering, and the main offers grid.
*/

// Search bar Elements
const locationInput = document.getElementById('location_input');
const inputLocationsContainer = document.querySelector('.input_locations_container');
const autocompleteList = document.getElementById('autocomplete_list');
const checkInInput = document.getElementById('booking_check_in');
const checkOutInput = document.getElementById('booking_check_out');
const dateContainer = document.getElementById('date_container');
const btnSearch = document.getElementById('btn_search');

// Guests Dropdown
const guestsContainer = document.getElementById('guests_container');
const guestsDropdown = document.getElementById('guests_dropdown');
const guestsDisplay = document.getElementById('guests_display');

// Content Areas
const sectionTitle = document.querySelector('.section_header h2');
const offers_grid = document.querySelector('.offers_grid');
const defaultContent = offers_grid.innerHTML;
const benefits = document.querySelector('.benefits');
const btnShowMoreOffers = document.getElementById('btn_show_more_offers');


// Sort & Slider
const sortContainer = document.querySelector('.sort_selector');
const sortBtn = document.getElementById('active_sort');
const sortList = document.getElementById('sort_list');
const sortOptions = document.querySelectorAll('.sort_option');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');


/* 
 GLOBAL APPLICATION STATE
*/


if(localStorage.getItem('currentCurrency') === null) localStorage.setItem('currentCurrency', 'USD');
if(localStorage.getItem('currentSymbol') === null) localStorage.setItem('currentSymbol', '$');
let currentCategory = 'Apartments';
let guestData = {adults: 2, children: 0, rooms: 1};
let shownOffersData;
let selectedBenefits = [];
let currentOffset = 0;
let sortBy = 'recommendations';
let isSearch = false; // Tracks if User is Viewing Search Results or Default Recommendations
const housingCategories = ['Apartments', 'Villas', 'Castles'];


/*
    ENTRY POINT (DOM Content Loaded)
    Builds the page using components and fetches initial data.
*/

// Inject Common UI Into Placeholders
document.getElementById('header_placeholder').innerHTML = commonComponents.header;
document.getElementById('menubar_placeholder').innerHTML = commonComponents.menubar;
document.getElementById('footer_root_placeholder').innerHTML = commonComponents.footerRoot;

// Authenticate User Session
const isLoggedIn = checkUserSession();
window.modalManager = new ModalManager('log_form', 'reg_form', '', '');

// Activate Common UI Listeners
initCommonUI();

// Change Category if it is
const urlParam  = new URLSearchParams(window.location.search);
const categoryFromUrl = urlParam.get('category');

if(categoryFromUrl){
    const targetBtn = document.querySelector(`.btn_menu[data-category="${categoryFromUrl}"]`);
    if(targetBtn) changeCategory(targetBtn);
}

// Fetch and display recommended properties
loadRates().then(() => recommendationOffers());


/*
 EVENT LISTENERS
*/

// Global Click Handler to Close Dropdowns
document.addEventListener('click', (e) => {
    document.getElementById('currency_list').classList.remove('show');
    sortList.classList.remove('show');

    if(!locationInput.contains(e.target)) autocompleteList.style.display = 'none';
    if(!guestsContainer.contains(e.target)) guestsDropdown.classList.remove('show');
});


// Guests Dropdown Toggle
guestsContainer.addEventListener('click', (e) => {
    if(!e.target.closest('.guests_dropdown')){
        e.stopPropagation();
        guestsDropdown.classList.toggle('show');
    }
});


// Counter Logic (Plus/Minus)
document.querySelectorAll('.btn_counter').forEach(btn =>{
    btn.addEventListener('click', (e) =>{
        e.stopPropagation();
        const type = btn.getAttribute('data-type');
        const action = btn.getAttribute('data-action');

        if(action === 'plus')guestData[type]++;
        else{
            if(type === 'adults' && guestData.adults > 1) guestData.adults--;
            else if(type === 'children' && guestData.children > 0) guestData.children--;
            else if(type === 'rooms' && guestData.rooms > 1) guestData.rooms--;
        }

        // Refresh the interface after state change
        updateGuestUI();
    });
});


// Direct Input Sync
document.querySelectorAll('.guests_input').forEach(input => {
    input.addEventListener('input', (e) => {
        e.stopPropagation();
        if(e.target.value.length > 3) input.value = 1;
        const type = input.getAttribute('data-type');
        guestData[type] = input.value;
        updateGuestUI();
    })
});


// Date Picker Trigger
window.indexCalendar = new CustomCalendar('booking_check_in', 'booking_check_out', []);
dateContainer.addEventListener('click', (e) => {window.indexCalendar.openModal(e);});


// Location Input & Location Help List
locationInput.addEventListener('input', () =>{showLocationList();});
locationInput.addEventListener('click', () =>{showLocationList();});


// Search Button Logic
btnSearch.addEventListener('click', (e) => {
    e.preventDefault();

    if(locationInput.value.length < 3){
        inputLocationsContainer.classList.add('error');

        setTimeout(() =>{inputLocationsContainer.classList.remove('error');}, 3000);
        return;
    }

    if(checkInInput.value == ''){window.indexCalendar.openModal(e); return;}

    if(checkOutInput.value == ''){window.indexCalendar.openModal(e); return;}
    searchOffers();
});


//Sort Logic
sortBtn.addEventListener('click', (e) =>{
    e.stopPropagation();
    sortList.classList.toggle('show');
});

sortOptions.forEach(item => {
    item.addEventListener('click', ()=>{
        sort(item.getAttribute('data-code'));
        showSearchOffers(shownOffersData);
    });
});

btnShowMoreOffers.addEventListener('click', () =>{
    searchOffers(true, false);
});


// Slider Logic
nextBtn.addEventListener('click', () => {offers_grid.scrollBy({left: 380, behavior: 'smooth'});});
prevBtn.addEventListener('click', () => {offers_grid.scrollBy({left: -380, behavior: 'smooth'});});

/*
 FUNCTIONS
*/

// Category Switcher Logic
function changeCategory(button){
    if(currentCategory !== button.getAttribute('data-category') || isSearch === true){
        currentCategory = button.getAttribute('data-category');

        // Manage active visual state
        const currentActive = document.querySelector('.menubar .btn_menu.active');
        if(currentActive) currentActive.classList.remove('active');
        button.classList.add('active');

        // Update UI content based on selected category
        if(sectionTitle) sectionTitle.innerText = `Featured ${currentCategory}`;

        // Fetch and render new data
        recommendationOffers();
        updateSearchbar();
        benefits.classList.remove('show');

        // Reset scroll position to start
        if(offers_grid) offers_grid.scrollTo({left: 0, behavior: "smooth"});
    }
}

// Fetch Current Exchange Rates From External API. Uses USD as Base Currency
async function loadRates() {
    try{
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();

        if(data.result === "success") localStorage.setItem('exchangeRates', JSON.stringify(data.rates));
    }catch(error){
        console.error("API error: ", error);
        localStorage.setItem('exchangeRates', JSON.stringify({"USD":1, "PLN":3.6, "EUR":0.86}));
    }
}


// Synchronizes the Visual Counters and the Main Display Text With the guestData Object
function updateGuestUI(showRooms=true){
    document.getElementById('counter_adults').value = guestData.adults;
    document.getElementById('counter_children').value = guestData.children;
    document.getElementById('counter_rooms').value = guestData.rooms;

    // Update the Main Summary Text Shown in the 'search_bar'
    if(currentCategory === 'Apartments' || currentCategory === 'Villas' || currentCategory === 'Castles'){
        guestsDisplay.innerText = `${guestData.adults} adults · ${guestData.children} children · ${guestData.rooms} rooms`;
    }else{
        guestsDisplay.innerText = `${guestData.adults} adults · ${guestData.children} children`;
    }
}


//Get Rating From Offers in DB
function getStarsHTML(rating){
    let stars ='';
    for(let i=1; i<=5; i++){
        if(rating >= i)stars += '<span class="material-symbols-outlined fill">star</span>';
        else if(rating == i -0.5)stars += '<span class="material-symbols-outlined fill">star_half</span>';
        else stars += '<span class="material-symbols-outlined">star</span>';
    }

    return stars;
}


//Main Data Fetching and Card Rendering Function
async function recommendationOffers() {
    try{
        isSearch = false;
        showBtnSort();
        offers_grid.classList.remove('search');

        const response = await fetch(`php/get_recommendation.php?category=${currentCategory}`);
        shownOffersData = await response.json();

        offers_grid.innerHTML = ''; // Clear Previous Results

        // Handle Empty Results with Placeholder
        if(shownOffersData.length == 0){
            offers_grid.classList.remove('search');
            offers_grid.innerHTML = defaultContent;
            return;
        }

        shownOffersData.forEach(item => {
            const rate = JSON.parse(localStorage.getItem('exchangeRates'))[localStorage.getItem('currentCurrency')] || 1;
            const convertedPrice = (item.price * rate).toFixed(2);

            const starsHTML = getStarsHTML(item.rating);

            const rentPeriod = housingCategories.includes(item.category) ? 'night' : 'day';
            // Iterate and Render Item Cards
            const cardHTML = `
                <a class="offer_card" href="offer_details.html?id=${item.offer_id}" target="_blank">
                    <div class="offer_card_img">
                        <img src="${item.img}" alt="${item.name}">
                        <div class="rating_stars">
                                ${starsHTML}
                        </div>
                    </div>
                    <div class="card_info">
                        <h3>${item.name}</h3>
                        <p>${item.city}</p>
                        <span class="price">from ${convertedPrice} ${localStorage.getItem('currentSymbol')} / ${rentPeriod}</span>
                    </div>
                </a>`;
            offers_grid.innerHTML += cardHTML;
        });
    }catch(error){
        offers_grid.classList.remove('search');
        offers_grid.innerHTML = defaultContent;
        console.error("No server connection: ", error);
    }
}


// Remove 'room' Filter When 'cars', 'airplanes' & 'helicopters' Categories are Chosen 
async function updateSearchbar() {
    const searchRoomItem = document.querySelectorAll('.dropdown_item')[2];
    if(currentCategory === 'Cars' || currentCategory === 'Helicopters' || currentCategory === 'Airplanes'){
        searchRoomItem.style.display = 'none';
        guestData.rooms = 0;
    }else{
        searchRoomItem.style.display = 'flex';
        guestData.rooms = 1;
    }
    locationInput.value ='';
    checkInInput.value ='';
    checkOutInput.value='';
    updateGuestUI();
}


// Get Locations From DB and help User to Input it
async function showLocationList() {
    const query = locationInput.value;
    if(query.length < 3){
        autocompleteList.style.display = 'none';
        return;
    }

    try{
        const response = await fetch(`php/get_locations.php?q=${encodeURIComponent(query)}`);
        const suggestions = await response.json();

        if(suggestions.length > 0){
            autocompleteList.innerHTML = '';

            suggestions.forEach(s =>{
                const div = document.createElement('div');
                div.classList.add('suggestion_item');
                div.innerText = s.display;

                div.addEventListener('click', () =>{
                    locationInput.value = s.display;
                    autocompleteList.style.display = 'none';
                });

                autocompleteList.appendChild(div);
            });

            autocompleteList.style.display = 'block';
        }else autocompleteList.style.display = 'none';
    }catch(error){
        console.error("Autocomplete list error:", error);
    }
}


//Main Function to Find Offers
async function searchOffers(isShowBenefits=false, isNewSearch=true) {

    const searchData= {
        location: locationInput.value,
        checkIn: checkInInput.value,
        checkOut: checkOutInput.value,
        adults: guestData.adults,
        children: guestData.children,
        rooms: guestData.rooms,
        category: currentCategory,
        benefits: selectedBenefits
    };

    try{
        if(isNewSearch){
            currentOffset = 0;
            offers_grid.innerHTML = '';
        }

        const response = await fetch(`php/get_searched_offers.php?offset=${currentOffset}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(searchData)
        });

        const results = await response.json();

        if(results.length > 0){
            isSearch = true;
            sectionTitle.innerText = `Finded ${currentCategory}`;
            showSearchOffers(results);

            if(!isShowBenefits) showBenefits();
            showBtnSort();

            currentOffset += results.length;

            if(results.length == 20) btnShowMoreOffers.style.display = 'block';
            else btnShowMoreOffers.style.display = 'none';

        }else if(isNewSearch){
            offers_grid.classList.remove('search');
            offers_grid.innerHTML = defaultContent;
            btnShowMoreOffers.style.display = 'none';
        }
    }catch(error) {console.error("Search failed:", error);}
}

//Show Searching Offers
function showSearchOffers(data){
    offers_grid.classList.add('search');

    shownOffersData = data;
    sort(sortBy);
    
    data.forEach(item => {
        const rate = JSON.parse(localStorage.getItem('exchangeRates'))[localStorage.getItem('currentCurrency')] || 1;
        const convertedPrice = (item.price * rate).toFixed(2);

        const starsHTML = getStarsHTML(item.rating);
        let benefitsHTML = '';
        item.benefits.slice(0, 3).forEach(benefit => {
            benefitsHTML += `<span class="mini_benefit" data-id="${benefit.benefit_id}" onclick="benefitSort(${benefit.benefit_id})">${benefit.name}</span>`;
        });

            // Iterate and Render Item Cards
        const cardHTML = `
            <div class="offer_card search">
                <div class="offer_card_img search">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="rating_stars">
                                ${starsHTML}
                    </div>
                </div>
                <div class="card_content">
                    <div class= "card_info search">
                        <h3>${item.name}</h3>
                        <p class="city_label">${item.city}, ${item.country}</p>
                        <p class="card_description">Description</p>

                        <div class="cards_benefits_mini">
                            ${benefitsHTML}
                        </div>
                    </div>
                    <div class="card_action_area">
                        <div class="price_wrapper">
                                <span class="price_label">Price per night</span>
                                <span class="price_value">${convertedPrice} ${localStorage.getItem('currentSymbol')}</span>
                        </div>
                        <a href="offer_details.html?id=${item.offer_id}&checkin=${checkInInput.value || ''}&checkout=${checkOutInput.value || ''}" 
                        target="_blank" class="btn_view_more">View Details</a>
                    </div>
                </div>
            </div>`;
        offers_grid.innerHTML += cardHTML;
    });
}


//Show Sort Button When User Find Offers
function showBtnSort(){
    if(isSearch) sortBtn.classList.add('show');
    else sortBtn.classList.remove('show');
}

function sort(code){
    if(code === 'price') {
        shownOffersData.sort((a, b) => b.price - a.price );
        sortBtn.innerText = `Sort by: Price (highest first)`;
    }
    else if(code === 'rating_high_to_low'){
        shownOffersData.sort((a, b) => b.rating - a.rating );
        sortBtn.innerText = `Sort by: Property rating (high to low)`;
    } 
    else if(code === 'rating_low_to_high'){
        shownOffersData.sort((a, b) => a.rating - b.rating );
        sortBtn.innerText = `Sort by: Property rating (low to high)`;
    } 
    else if(code === 'recommendations'){
        shownOffersData.sort((a, b) => a.offer_id - b.offer_id );
        sortBtn.innerText = `Sort by: Recommendations`;
    }
    offers_grid.innerHTML = '';
    sortBy = code;
}

//Sort by Clicked Benefit
function benefitSort(clickedBenefit_id){
    const clickedBenefit = document.querySelector(`.benefit_item[data-id="${clickedBenefit_id}"]`);
    clickedBenefit.classList.toggle('chosen');
    clickedBenefit.querySelector('.img_chosen').classList.toggle('show');

    if(clickedBenefit.classList.contains('chosen')) selectedBenefits.push(clickedBenefit_id);
    else selectedBenefits = selectedBenefits.filter(id => id !== clickedBenefit_id);
    searchOffers(true);
}


//Fill Element 'benefits' with Benefits From DB
async function showBenefits() {
    try{
        const response = await fetch('php/get_benefits.php');
        const data = await response.json();

        if(data.length === 0){
            return;
        }
        const targetGroup = housingCategories.includes(currentCategory) ? 'realty' : 'transport';

        benefits.innerHTML ='<span class="benefits_span">Benefits:</span>';
        data.forEach(item =>{
            if(data.at(0) === item) return; // First in DB is 'chosen icon'

            if (item.category !== targetGroup) return;

            const div = document.createElement('div');
            div.classList.add('benefit_item');
            div.dataset.id = item.benefit_id;

            const img = document.createElement('img');
            img.classList.add('benefit_img');
            img.src = item.icon_url;
            img.alt = `${item.name}_img_alt`

            const span = document.createElement('span');
            span.classList.add('benefit_text');
            span.innerText = item.name;

            const img_chosen = document.createElement('img');
            img_chosen.classList.add('img_chosen');
            img_chosen.src = data.at(0).icon_url;
            img_chosen.alt = `${data.at(0).name}_img_alt`;

            div.appendChild(img);
            div.appendChild(span);
            div.appendChild(img_chosen);
            div.addEventListener('click', ()=>{
                benefitSort(item.benefit_id);
            });
            benefits.appendChild(div);
        });
        benefits.classList.add('show');
    }catch(error){console.error("Get benefits: ", error);}
}