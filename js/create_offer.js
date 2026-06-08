// DOM Element Nodes Initialization
const offerForm = document.getElementById('new_offer_form');
const categorySelector = document.getElementById('category_selector');
const housingBlock = document.getElementById('housing_block');
const transportBlock = document.getElementById('transport_block');
const submitBtn = offerForm.querySelector('button[type="submit"]');
const fileNode = document.getElementById('image_input');
const nameInput = document.getElementById('name_input');
const priceInput = document.getElementById('price_input');
const countryInput = document.getElementById('country_input');
const cityInput = document.getElementById('city_input');
const descriptionInput = document.getElementById('description_input');
const benefitsContainer = document.getElementById('benefits_checkboxes_container');

// Inject Common UI Into Placeholders
document.getElementById('header_placeholder').innerHTML = commonComponents.header;
document.getElementById('menubar_placeholder').innerHTML = commonComponents.menubar;
document.getElementById('footer_root_placeholder').innerHTML = commonComponents.footerRoot;

// Authenticate User Session
checkUserSession().then(isLoggedIn => {
    if(!isLoggedIn){
        window.location.href = 'index.html';
        throw new Error("Execution stopped: Unauthorized user.");
}
});


// Activate Common UI Listeners
initCommonUI();

// Listens for category selection shifts to dynamically structure the form layout
categorySelector.addEventListener('change', () => {
    const selectedCategory = categorySelector.value;
    const isHousing = ['Apartments', 'Villas', 'Castles'].includes(selectedCategory);

    // Toggle target block visibility and sync input constraints
    if (isHousing) {
        housingBlock.style.display = 'block';
        transportBlock.style.display = 'none';
        toggleRequiredConstraints(housingBlock, true);
        toggleRequiredConstraints(transportBlock, false);
    } else {
        housingBlock.style.display = 'none';
        transportBlock.style.display = 'block';
        toggleRequiredConstraints(housingBlock, false);
        toggleRequiredConstraints(transportBlock, true);
    }

    // Refresh the filtered checklist grid matching the selected archetype
    loadSystemBenefits(isHousing);
});

// Dynamically toggles the 'required' attributes for nested inputs based on visibility
function toggleRequiredConstraints(containerBlock, enableRequired){
    if(!containerBlock) return;

    containerBlock.querySelectorAll('input').forEach(element => {
        if(element.type !== 'checkbox') element.required = enableRequired;
    });
}

// Main Form
offerForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const imageFiles = fileNode ? fileNode.files : [];

    if(!imageFiles){
        alert('Please select a main presentation image for your listing.');
        return;
    }

    // Ensure at least one media presentation layer exists
    submitBtn.disabled = true;
    submitBtn.textContent = `Uploading images (0/${imageFiles.length})...`;

    const uploadedImageUrls = [];

    try{
        // Step 1: Batch upload images via proxy stream loop sequentially
        for(let i=0; i<imageFiles.length; i++){
            submitBtn.textContent = `Uploading images (${i+1}/${imageFiles.length})...`;

            const imgData = new FormData(); 
            imgData.append('image', imageFiles[i]);

            const imgResponse = await fetch('php/upload_photo_proxy.php', {
                method: 'POST',
                body: imgData
            });

            const imgResult = await imgResponse.json();

            // Intercept process flow if proxy upload pipeline breaks down
            if(imgResult.status !== 'success'){
                alert(`Failed to upload image #${i + 1}: ${imgResult.error?.message || 'Server error.'}`);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish Offer';
                return;
            } else uploadedImageUrls.push(imgResult.url);
        }

        submitBtn.textContent = 'Publishing offer details...';

        // Step 2: Query active DOM states to parse checked amenities arrays
        const checkedBoxes = document.querySelectorAll('input[name="selected_benefits"]:checked');
        const finalizedBenefitsArray = [];

        checkedBoxes.forEach(box => {
            finalizedBenefitsArray.push({
                id: parseInt(box.value, 10),
                name: box.dataset.name
            });
        });

        // Step 3: Compile dynamic fields based on active category context
        const activeCategory = categorySelector.value;
        const isHousingCategory = ['Apartments', 'Villas', 'Castles'].includes(activeCategory);

        // Construct standardized hybrid structural payload packet
        const data = {
            category: activeCategory,
            name: nameInput.value,
            price: parseFloat(priceInput.value) || 0.00,
            country: countryInput.value,
            city: cityInput.value,
            description: descriptionInput.value,
            images: uploadedImageUrls,
            benefits: finalizedBenefitsArray,
            details: isHousingCategory ? {
                street: document.getElementById('street_input').value,
                house_number: document.getElementById('house_number_input').value,
                rooms: parseInt(document.getElementById('rooms_input').value, 10) || 0,
                floor: parseInt(document.getElementById('floor_input').value, 10) || 0,
                area: parseInt(document.getElementById('area_input').value, 10) || 0
            } : {
                year: parseInt(document.getElementById('year_input').value, 10) || 0,
                fuel: document.getElementById('fuel_input').value,
                transmission: document.getElementById('transmission_input').value,
                max_speed: parseInt(document.getElementById('max_speed_input').value, 10) || 0,
                passengers: parseInt(document.getElementById('passengers_input').value, 10) || 0,
                driver: document.getElementById('driver_input').checked ? 1 : 0
            }
        };

        // Step 4: Dispatch data packet stream to persistent relational tables via transactional endpoint
        const response = await fetch('php/create_offer.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // Step 5: Route context back to user space dashboard panel upon success verification
        if (result.status === 'success') {
            alert('Success! Your new listing has been securely published.');
            window.location.href = 'user_profile.html'; // Gracefully redirect back to client control room panel
        } else alert('Database ingestion rejection: ' + result.message);
        
    }catch(error){
        console.error('Fatal execution path error on structural forms publishing layer:', error);
        alert('Critical network pipeline disruption encountered during data transmission paths.');
    } finally{
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Offer';
    }
});

// Loads and filters relational system amenities checklist checkboxes dynamically
async function loadSystemBenefits(isHousing) {
    try{
        const response = await fetch('php/get_benefits.php');
        const result = await response.json();

        if (!benefitsContainer) return;
        benefitsContainer.innerHTML = '';

        // Safe layout fallback translation check
        const benefitsList = Array.isArray(result) ? result : result.benefits || [];

        if (benefitsList.length === 0) {
            benefitsContainer.innerHTML = '<div class="loading_placeholder">No system perks found.</div>';
            return;
        }

        benefitsList.forEach(b => {

            // Skip database tracking icon node placeholder config block (Id: 1)
            if(b.benefit_id === '1') return;

            if(isHousing) { 
                if(b.category !== 'realty') return;
            }
            else {
                if(b.category === 'realty') return;
            }
                
            const id = b.benefit_id || b.id;
            const name = b.name;

            benefitsContainer.innerHTML += `
                <label class="perk_check_item">
                    <input type="checkbox" name="selected_benefits" value="${b.benefit_id}" data-name="${b.name}">
                    <span>${name}</span>
                </label>
            `;
        });

    } catch (error) {
        console.error('Error fetching global system benefits:', error);
        if (benefitsContainer) {
            benefitsContainer.innerHTML = '<div class="loading_placeholder" style="color:red;">Failed to load perks.</div>';
        }
    }
}