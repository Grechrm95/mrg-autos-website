// This event listener ensures that the script runs only after the entire HTML document has been loaded and parsed.
document.addEventListener("DOMContentLoaded", () => {

    // --- Mobile Menu Handler ---
    const menuIcon = document.getElementById("menu-icon");
    const mainNav = document.querySelector(".main-nav");

    if (menuIcon && mainNav) {
          // Toggles the mobile menu open and closed when the hamburger icon is clicked.
        menuIcon.addEventListener("click", () => {
 mainNav.classList.toggle("active"); // Slides the menu in/out.
            menuIcon.classList.toggle('bx-menu'); // Swaps the hamburger icon for an 'X' icon.
            menuIcon.classList.toggle('bx-x');
        });

         // Automatically highlights the navigation link for the current page.
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

     // Selecting major page elements once to avoid repeated DOM queries.
    const inventoryListContainer = document.getElementById('inventory-list');
    const featuredGrid = document.getElementById('featured-vehicles-grid');
    const soldTrack = document.getElementById('sold-vehicles-track');

    // Function to display the main vehicle inventory using IntersectionObserver for lazy loading.
    async function displayInventory(vehicles) {
        if (!inventoryListContainer) return; // Exit if not on the inventory page.
        inventoryListContainer.innerHTML = ''; 
        
         // This observer watches for placeholder elements to enter the viewport.
        const vehicleObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                 // When a placeholder is about to become visible...
                if (entry.isIntersecting) {
                    const placeholder = entry.target;
                    const carId = placeholder.dataset.carId;
                    const car = vehicles.find(c => c.id === carId);
                    
                      // ...replace the lightweight placeholder with the full, heavy vehicle listing.
                    if (car) {
                        const vehicleElement = document.createElement('div');
                        vehicleElement.className = placeholder.className.replace('vehicle-placeholder', 'vehicle-listing');
                        vehicleElement.dataset.carId = car.id;
                        
                        const thumbnailsHTML = car.images.length > 1 ? `<div class="vehicle-listing__thumbnails">${car.images.slice(0, 4).map((img, i) => `<img src="${img}" alt="Thumbnail ${i + 1} of ${car.title}" class="thumbnail-img" data-index="${i}">`).join('')}</div>` : '';
                        const carouselArrowsHTML = car.images.length > 1 ? `<a class="listing-prev">&#10094;</a><a class="listing-next">&#10095;</a>` : '';
                        
                        vehicleElement.innerHTML = `
                            <div class="vehicle-listing__header">
                                <h2 class="vehicle-title">${car.title} ${car.year}</h2>
                                <p class="vehicle-price">${car.price}</p>
                            </div>
                            <div class="vehicle-listing__content">
                                <div class="vehicle-listing__image-gallery">
                                    <div class="vehicle-listing__image">
                                        <img src="${car.images[0]}" alt="${car.title}" class="main-img" data-index="0" loading="lazy">
                                        ${carouselArrowsHTML}
                                    </div>
                                    ${thumbnailsHTML}
                                </div>
                                <div class="vehicle-listing__details">
                                    <ul class="vehicle-specs">
                                        <li><i class='bx bxs-car'></i> ${car.mileage.toLocaleString()} miles</li>
                                        <li><i class='bx bxs-gas-pump'></i> ${car.fuelType}</li>
                                        <li><i class='bx bx-sitemap'></i> ${car.transmission}</li>
                                    </ul>
                                    <p class="vehicle-description">${car.description}</p>
                                    <a href="contact.html" class="btn-enquire">Enquire About This Vehicle</a>
                                </div>
                            </div>`;

                        placeholder.replaceWith(vehicleElement);
                    }
                    observer.unobserve(placeholder); // Stop watching this element once it's loaded.
                }
            });
        }, {
            rootMargin: '250px 0px', // Start loading content 250px before it enters the viewport
        });

        // Create and observe lightweight placeholder elements for each car.
        vehicles.forEach((car, index) => {
            const placeholderElement = document.createElement('div');
              // (Code to create a simple placeholder with a set height to prevent layout shift)
            placeholderElement.className = 'vehicle-placeholder';
            if ((index + 1) % 2 === 0) {
                placeholderElement.classList.add('vehicle-listing--reverse');
            }
            placeholderElement.dataset.carId = car.id;
            placeholderElement.style.minHeight = '450px'; // Prevent layout shift
            inventoryListContainer.appendChild(placeholderElement);
            vehicleObserver.observe(placeholderElement);
        });
        
        // Attach event listeners for gallery/carousel functionality.
        addPageGalleryFunctionality();
        addListingCarouselFunctionality();
        addLightboxEventListeners();
    }

    // Function to display featured vehicles on the homepage.
    async function displayFeaturedVehicles(vehicles) {
        if (!featuredGrid) return;  // Exit if not on the homepage.
        featuredGrid.innerHTML = '';
        const featured = vehicles.filter(car => featuredVehicleIds.includes(car.id));
        
        featured.forEach(car => {
               // (Code to build and append a smaller "vehicle card" for the homepage grid)
            const vehicleCard = document.createElement('div');
            vehicleCard.className = 'vehicle-card';
            vehicleCard.innerHTML = `
                <a href="inventory.html" class="vehicle-card-img"><img src="${car.images[0]}" alt="${car.title}" loading="lazy"></a>
                <div class="vehicle-card-content">
                    <h3 class="vehicle-title"><a href="inventory.html">${car.title} ${car.year}</a></h3>
                    <p class="vehicle-price">${car.price}</p>
                    <div class="vehicle-card-actions">
                        <a href="inventory.html" class="btn-details">View All Stock</a>
                    </div>
                </div>`;
            featuredGrid.appendChild(vehicleCard);
        });
    }

        // Function to display sold vehicles in a scrolling carousel.
    function displaySoldVehicles(vehicles) {
        if (!soldTrack) return; // Exit if the sold section isn't on the page.
        // (Code to build the sold vehicle cards and configure the scrolling animation)
        const soldSection = document.querySelector('.sold-vehicles-section');
        if (vehicles.length === 0) {
            if(soldSection) soldSection.style.display = 'none';
            return;
        }
        soldTrack.innerHTML = '';
        const cardsToDisplay = vehicles.length > 3 ? [...vehicles, ...vehicles] : vehicles;
        cardsToDisplay.forEach(car => {
            const vehicleCard = document.createElement('div');
            vehicleCard.className = 'vehicle-card is-sold';
            vehicleCard.innerHTML = `
                <div class="vehicle-card-img">
                    <img src="${car.images[0]}" alt="${car.title}">
                </div>
                <div class="vehicle-card-content">
                    <h3 class="vehicle-title">${car.title} ${car.year}</h3>
                </div>`;
            soldTrack.appendChild(vehicleCard);
        });
        if (vehicles.length > 3) {
            const cardWidth = 300, gap = 24;
            const totalWidth = cardsToDisplay.length * (cardWidth + gap);
            const animationDuration = cardsToDisplay.length * 5;
            soldTrack.style.width = `${totalWidth}px`;
            soldTrack.style.animationDuration = `${animationDuration}s`;
        } else {
            soldTrack.style.animation = 'none';
            soldTrack.style.justifyContent = 'center';
        }
    }

    //LIGHTBOX (FULL-SCREEN GALLERY)
    const lightbox = document.getElementById('lightbox-overlay');
    if (lightbox) {
         // Select all parts of the lightbox component.
         const lightboxContent = lightbox.querySelector('.lightbox-content'), lightboxImg = lightbox.querySelector('.lightbox-main-image'), lightboxThumbContainer = lightbox.querySelector('.lightbox-thumbnails-container'), lightboxCounter = lightbox.querySelector('.lightbox-counter'), closeBtn = lightbox.querySelector('.lightbox-close'), prevBtn = lightbox.querySelector('.lightbox-prev'), nextBtn = lightbox.querySelector('.lightbox-next');
        // (and so on for lightboxImg, closeBtn, prevBtn, etc.)
         let currentCarImages = [], currentImageIndex = 0, touchStartX = 0, touchEndX = 0;
        // Opens the lightbox with the images for a specific car
         function openLightbox(carId, imageIndex) {
            const car = vehicleDatabase.find(c => c.id === carId);
            if (!car) return;
            currentCarImages = car.images;
            currentImageIndex = parseInt(imageIndex);
            lightbox.classList.remove('lightbox-hidden');
            document.body.classList.add('lightbox-active');
            updateLightboxContent();
        }
        // Updates the main image, counter, and thumbnails inside the lightbox.
        function updateLightboxContent() {
            lightboxImg.src = currentCarImages[currentImageIndex];
            if(lightboxCounter) lightboxCounter.textContent = `Image ${currentImageIndex + 1} of ${currentCarImages.length}`;
            const thumbnailsHTML = currentCarImages.map((imgSrc, index) => `<img src="${imgSrc}" data-index="${index}" class="thumbnail-img ${index === currentImageIndex ? 'active' : ''}" alt="Thumbnail ${index + 1}">`).join('');
            lightboxThumbContainer.innerHTML = thumbnailsHTML;
            const activeThumb = lightboxThumbContainer.querySelector('.active');
            if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        // Functions to navigate between images.
        function showNextImage() { currentImageIndex = (currentImageIndex + 1) % currentCarImages.length; updateLightboxContent(); }
        function showPrevImage() { currentImageIndex = (currentImageIndex - 1 + currentCarImages.length) % currentCarImages.length; updateLightboxContent(); }
        function closeLightbox() { lightbox.classList.add('lightbox-hidden'); document.body.classList.remove('lightbox-active'); }
        function handleSwipe() { if (touchEndX < touchStartX - 50) showNextImage(); if (touchEndX > touchStartX + 50) showPrevImage(); }
        lightboxContent.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
        lightboxContent.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); });
        
        // Adds all necessary event listeners for the lightbox (clicks, keys, swipes).
        function addLightboxEventListeners() {
            if (!inventoryListContainer) return;
            inventoryListContainer.addEventListener('click', function(e) { if (e.target.classList.contains('main-img')) { const listing = e.target.closest('.vehicle-listing'); if (listing) openLightbox(listing.dataset.carId, e.target.dataset.index || 0); } });
            closeBtn.addEventListener('click', closeLightbox);
            nextBtn.addEventListener('click', showNextImage);
            prevBtn.addEventListener('click', showPrevImage);
            lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lightbox.classList.contains('lightbox-hidden')) closeLightbox(); });
            lightboxThumbContainer.addEventListener('click', (e) => { if (e.target.classList.contains('thumbnail-img')) { currentImageIndex = parseInt(e.target.dataset.index); updateLightboxContent(); }});
        }
    }

    //PAGE-SPECIFIC LOGIC

     // Adds functionality to the small thumbnails on the main inventory page.
    function addPageGalleryFunctionality() {
        if (!inventoryListContainer) return;
        inventoryListContainer.addEventListener('click', (e) => { if (e.target.classList.contains('thumbnail-img')) { e.stopPropagation(); const gallery = e.target.closest('.vehicle-listing__image-gallery'); if (gallery) { const mainImage = gallery.querySelector('.main-img'); const currentActive = gallery.querySelector('.thumbnail-img.active'); if (currentActive) currentActive.classList.remove('active'); e.target.classList.add('active'); mainImage.src = e.target.src; mainImage.dataset.index = e.target.dataset.index; } } });
    }

    // Adds functionality to the previous/next arrows on the main inventory page.
    function addListingCarouselFunctionality() {
        if (!inventoryListContainer) return;
        let touchStartX = 0;
        const changeImage = (listing, direction) => { const mainImg = listing.querySelector('.main-img'); const car = vehicleDatabase.find(c => c.id === listing.dataset.carId); if (!car || car.images.length <= 1) return; let currentIndex = parseInt(mainImg.dataset.index, 10); currentIndex = (currentIndex + direction + car.images.length) % car.images.length; mainImg.src = car.images[currentIndex]; mainImg.dataset.index = currentIndex; const currentActive = listing.querySelector('.thumbnail-img.active'); if (currentActive) currentActive.classList.remove('active'); const newActive = listing.querySelector(`.thumbnail-img[data-index="${currentIndex}"]`); if (newActive) newActive.classList.add('active'); };
        inventoryListContainer.addEventListener('click', (e) => { if (e.target.matches('.listing-prev, .listing-next')) { e.stopPropagation(); const listing = e.target.closest('.vehicle-listing'); const direction = e.target.classList.contains('listing-next') ? 1 : -1; changeImage(listing, direction); } });
        inventoryListContainer.addEventListener('touchstart', e => { if (e.target.matches('.vehicle-listing__image .main-img, .vehicle-listing__image .listing-prev, .vehicle-listing__image .listing-next')) { touchStartX = e.changedTouches[0].screenX; } }, { passive: true });
        inventoryListContainer.addEventListener('touchend', e => { if (e.target.matches('.vehicle-listing__image .main-img, .vehicle-listing__image .listing-prev, .vehicle-listing__image .listing-next') && touchStartX !== 0) { const touchEndX = e.changedTouches[0].screenX; const listing = e.target.closest('.vehicle-listing'); if (touchEndX < touchStartX - 50) { changeImage(listing, 1); } if (touchEndX > touchStartX + 50) { changeImage(listing, -1); } touchStartX = 0; } });
    }

      // --- Contact Form Handler ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const confirmationModal = document.getElementById('confirmation-modal');
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevents the default form submission.
            // Uses the Fetch API to submit the form data asynchronously to Formspree.
            fetch(contactForm.getAttribute('action'), { method: 'POST', body: new FormData(contactForm), headers: { 'Accept': 'application/json' } })
           
            .then(response => { if (response.ok) { if (confirmationModal) confirmationModal.classList.remove('modal-hidden'); contactForm.reset(); } else { alert('Oops! There was a problem submitting your form.'); } }).catch(() => alert('Oops! There was a network error.'));
        });
        if (confirmationModal) { const closeModalBtn = confirmationModal.querySelector('.modal-close'); closeModalBtn.addEventListener('click', () => confirmationModal.classList.add('modal-hidden')); confirmationModal.addEventListener('click', (e) => { if (e.target === confirmationModal) confirmationModal.classList.add('modal-hidden'); }); }
    }

    // --- FINAL EXECUTION LOGIC ---
    // This now filters data ONLY on the pages that need it.
    if (featuredGrid || inventoryListContainer) {
        const availableVehicles = vehicleDatabase.filter(car => car.status !== 'sold');
        if (featuredGrid) {
            displayFeaturedVehicles(availableVehicles);
        }
        if (inventoryListContainer) {
            displayInventory(availableVehicles);
        }
    }
    if (soldTrack) {
        const soldVehicles = vehicleDatabase.filter(car => car.status === 'sold');
        displaySoldVehicles(soldVehicles);
    }
});