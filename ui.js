const UI = {};


const screens = document.querySelectorAll('.screen');
        function showScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.add('hidden');
            screen.classList.remove('active');
        });
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            activeScreen.classList.remove('hidden');
            activeScreen.classList.add('active');
        }
    }

    function navigateTo(screenId) {
        setTimeout(() => showScreen(screenId), 250);
    }
    
    // === ЛОГІКА ДЛЯ RIPPLE EFFECT ===
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const existingRipple = button.querySelector(".ripple");
        if (existingRipple) {
            existingRipple.remove();
        }
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - (button.getBoundingClientRect().left + radius)}px`;
        circle.style.top = `${event.clientY - (button.getBoundingClientRect().top + radius)}px`;
        circle.classList.add("ripple");
        button.appendChild(circle);
    }
    document.querySelectorAll(".btn-main, .menu-item").forEach(button => {
        button.addEventListener("click", createRipple);
    });
    
     // === ЛОГІКА ПЕРЕМИКАННЯ ТЕМ ===
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const themeCheckbox = themeToggle.querySelector('.toggle-checkbox');
        const body = document.body;
        function switchTheme(e) {
            if (e.target.checked) {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
            } else {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
            }
        }
        if (body.classList.contains('dark-theme')) {
            themeCheckbox.checked = true;
        }
        themeCheckbox.addEventListener('change', switchTheme);
    }

    // === ЛОГІКА ЗМІНИ ІКОНОК ПІНІВ ===
    const pin1 = document.getElementById('pin1');
    const pin2 = document.getElementById('pin2');
    const pathDots = document.querySelector('.path-dots');
    if (pin1 && pin2 && pathDots) {
        function swapPinIcons() {
            const isPin1Dot = pin1.classList.contains('fa-circle-dot');
            if (isPin1Dot) {
                pin1.classList.remove('fa-circle-dot');
                pin1.classList.add('fa-location-dot');
                pin2.classList.remove('fa-location-dot');
                pin2.classList.add('fa-circle-dot');
            } else {
                pin1.classList.remove('fa-location-dot');
                pin1.classList.add('fa-circle-dot');
                pin2.classList.remove('fa-circle-dot');
                pin2.classList.add('fa-location-dot');
            }
        }
        pathDots.addEventListener('animationiteration', swapPinIcons);
    }
    
UI.createDriverOrderCard = function(order) {
    const li = document.createElement('li');
    li.className = 'order-card driver-view';
    const timeIcon = order.time === 'Зараз' ? '<div class="status-dot online"></div>' : '<i class="fa-solid fa-clock"></i>';
    li.innerHTML = `
        <div class="order-main-info"><div class="passenger-info"><div class="avatar-convex"><i class="fa-solid fa-user"></i></div><div class="passenger-details"><strong>${order.passengerName}</strong><span>${order.rating} <i class="fa-solid fa-star"></i></span></div></div><div class="price-info"><span class="price-amount">~ ${order.price} грн</span><span class="price-label">Ваш дохід</span></div></div>
        <div class="order-route-info"><div class="address-line"><i class="fa-solid fa-circle start-address-icon"></i><span>${order.from}</span></div><div class="address-line"><i class="fa-solid fa-location-dot end-address-icon"></i><span>${order.to}</span></div></div>
        <div class="order-time-info">${timeIcon}<span>${order.time}</span></div>
    `;
    return li;
};

UI.createActiveTripCardHTML = function(trip, userType) {
    const isDriver = userType === 'driver';
    const title = 'Активна поїздка';
    const driver = drivers_database.find(d => d.id === trip.driverId);
    const driverName = driver ? driver.name : 'Водій';
    const personName = isDriver ? trip.passengerName : driverName;
    const personRole = isDriver ? 'Пасажир' : 'Водій';
    return `
        <div class="order-card active-trip" style="margin: 0; cursor: pointer;">
            <div class="order-header" style="padding-bottom: 8px;">
                <h3 class="order-title">${title}</h3>
            </div>
            <div class="route-addresses" style="font-size: 16px;">
                <div class="address-line">
                    <i class="fa-solid fa-circle start-address-icon"></i>
                    <span>${trip.from || trip.direction.split(' - ')[0]}</span>
                </div>
                <div class="address-line">
                    <i class="fa-solid fa-location-dot end-address-icon"></i>
                    <span>${trip.to || trip.direction.split(' - ')[1]}</span>
                </div>
            </div>
            <div class="driver-info" style="padding-top: 8px; border-top: 1px solid var(--md-outline);">
                <span><strong>${personRole}:</strong> ${personName}</span>
            </div>
        </div>
    `;
};

UI.displayDriverProfile = function(driverId) {
    const driver = drivers_database.find(d => d.id === driverId);
    if (!driver) {
        console.error('Водія з ID', driverId, 'не знайдено.');
        return;
    }
    document.getElementById('profile-driver-name').textContent = driver.name;
    document.getElementById('profile-driver-trips').textContent = driver.trips;
    if (driver.trips < 5) {
        document.getElementById('profile-driver-rating').innerHTML = `<small style="font-weight: 400; font-size: 14px;">Рейтинг формується</small>`;
    } else {
        document.getElementById('profile-driver-rating').textContent = driver.rating.toFixed(1);
    }
};

UI.displayDriverFullProfile = function(driverId) {
    const driver = drivers_database.find(d => d.id === driverId);
    if (!driver) return;
    document.getElementById('profile-driver-name-header').textContent = `Профіль: ${driver.name}`;
    document.getElementById('profile-driver-name-full').textContent = driver.name;
    document.getElementById('profile-driver-trips-full').textContent = `${driver.trips} поїздки`;
    document.getElementById('profile-driver-car').textContent = driver.car;
    if (driver.trips < 5) {
        document.getElementById('profile-driver-rating-full').innerHTML = `<small>Новий водій</small>`;
    } else {
        document.getElementById('profile-driver-rating-full').innerHTML = `<i class="fa-solid fa-star"></i> ${driver.rating.toFixed(1)}`;
    }
    const tagsContainer = document.getElementById('profile-driver-tags');
    tagsContainer.innerHTML = '';
    driver.tags.forEach(tag => {
        tagsContainer.innerHTML += `<span class="tag"><i class="${tag.icon}"></i> ${tag.text}</span>`;
    });
    const reviewsContainer = document.getElementById('profile-driver-reviews');
    const reviewsTitle = document.querySelector('#driver-full-profile-screen .details-section h4');
    reviewsTitle.textContent = `Відгуки (${driver.reviews.length})`;
    reviewsContainer.innerHTML = '';
    if (driver.reviews.length > 0) {
        driver.reviews.forEach(review => {
            reviewsContainer.innerHTML += `
                <div class="review-card">
                    <div class="review-header">
                        <strong>${review.name}</strong>
                        <span class="review-rating">${review.rating.toFixed(1)} <i class="fa-solid fa-star"></i></span>
                    </div>
                    <p class="review-text">${review.text}</p>
                </div>`;
        });
    } else {
        reviewsContainer.innerHTML = '<p class="no-reviews-placeholder">Відгуків поки що немає.</p>';
    }
};
