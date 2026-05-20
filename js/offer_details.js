const container = document.getElementById('offer_container');

document.addEventListener('DOMContentLoaded', () =>{
    document.getElementById('header_placeholder').innerHTML = commonComponents.header;
    document.getElementById('menubar_placeholder').innerHTML = commonComponents.menubar;
    document.getElementById('log_modal_placeholder').innerHTML = commonComponents.logModal;
    document.getElementById('reg_modal_placeholder').innerHTML = commonComponents.regModal;
    document.getElementById('footer_root_placeholder').innerHTML = commonComponents.footerRoot;

    initCommonUI();
    checkUserSession();


    const urlParam = new URLSearchParams(window.location.search);
    const offerId = urlParam.get('id');

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

    container.innerHTML = `

        <div class="offer_header">
            <h1>${item.name}</h1>
            <p class="offer_location">
                <a href="${URL_MAPS} target="_blank"">${item.details.house_number } ${item.details.street}, ${item.city} / ${item.country}</a>
            </p>
        </div>

        <div class="offer_layout">
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

            <div class="info_panel">
                <div class="price_big">${convertedPrice} ${localStorage.getItem('currentSymbol')}</div>
                <p class="description">${item.description}</p>

                <h3>Benefits:</h3>
                <div class="benefits_list">
                    ${item.benefits.map(b => `<span class="benefit_pill">${b.name}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
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