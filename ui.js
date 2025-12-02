// ui.js 
import { state } from './state.js';
import { db } from './firebase-init.js'; // Додали для роботи з базою
import { ref, set } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js"; // Функції Firebase


// Глобальні змінні DOM (вони локальні для цього модуля)
const screens = document.querySelectorAll('.screen');

// === НАВІГАЦІЯ ===
export function showScreen(screenId) {
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

export function navigateTo(screenId) {
    showScreen(screenId); 
}

// === ВІЗУАЛЬНІ ЕФЕКТИ (RIPPLE) ===
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

// Функція ініціалізації UI (викличемо її при старті)
export function initUIListeners() {
    // Ripple
    document.querySelectorAll(".btn-main, .menu-item").forEach(button => {
        button.addEventListener("click", createRipple);
    });

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const themeCheckbox = themeToggle.querySelector('.toggle-checkbox');
        const body = document.body;
        
        // Встановлюємо початковий стан
        if (body.classList.contains('dark-theme')) {
            themeCheckbox.checked = true;
        }

        themeCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
            } else {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
            }
        });
    }

    // Pin Animation
    const pathDots = document.querySelector('.path-dots');
    if (pathDots) {
        pathDots.addEventListener('animationiteration', swapPinIcons);
    }
}

function swapPinIcons() {
    const pin1 = document.getElementById('pin1');
    const pin2 = document.getElementById('pin2');
    if (!pin1 || !pin2) return;

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

// === КАРТКИ ===
export function createDriverOrderCard(order) {
    const li = document.createElement('li');
    li.className = 'order-card driver-view';
    const timeIcon = order.time === 'Зараз' ? '<div class="status-dot online"></div>' : '<i class="fa-solid fa-clock"></i>';
    li.innerHTML = `
        <div class="order-main-info"><div class="passenger-info"><div class="avatar-convex"><i class="fa-solid fa-user"></i></div><div class="passenger-details"><strong>${order.passengerName}</strong><span>${order.rating} <i class="fa-solid fa-star"></i></span></div></div><div class="price-info"><span class="price-amount">~ ${order.price || '---'} грн</span><span class="price-label">Ваш дохід</span></div></div>
        <div class="order-route-info"><div class="address-line"><i class="fa-solid fa-circle start-address-icon"></i><span>${order.from}</span></div><div class="address-line"><i class="fa-solid fa-location-dot end-address-icon"></i><span>${order.to}</span></div></div>
        <div class="order-time-info">${timeIcon}<span>${order.time}</span></div>
    `;
    return li;
}

export function createActiveTripCardHTML(trip, userType) {
    const isDriver = userType === 'driver';
    const title = 'Активна поїздка';
    // БЕРЕМО ДАНІ ЗІ STATE!
    const driver = state.drivers_database.find(d => d.id === trip.driverId);
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
                    <span>${trip.from || (trip.direction ? trip.direction.split(' - ')[0] : '???')}</span>
                </div>
                <div class="address-line">
                    <i class="fa-solid fa-location-dot end-address-icon"></i>
                    <span>${trip.to || (trip.direction ? trip.direction.split(' - ')[1] : '???')}</span>
                </div>
            </div>
            <div class="driver-info" style="padding-top: 8px; border-top: 1px solid var(--md-outline);">
                <span><strong>${personRole}:</strong> ${personName}</span>
            </div>
        </div>
    `;
}

// === ПРОФІЛІ ===
export function displayDriverProfile(driverId) {
    // БЕРЕМО ДАНІ ЗІ STATE!
    const driver = state.drivers_database.find(d => d.id === driverId);
    if (!driver) return;
    
    const nameEl = document.getElementById('profile-driver-name');
    if(nameEl) nameEl.textContent = driver.name;
    
    const tripsEl = document.getElementById('profile-driver-trips');
    if(tripsEl) tripsEl.textContent = driver.trips;
    
    const ratingEl = document.getElementById('profile-driver-rating');
    if (ratingEl) {
        if (driver.trips < 5) {
            ratingEl.innerHTML = `<small style="font-weight: 400; font-size: 14px;">Рейтинг формується</small>`;
        } else {
            ratingEl.textContent = driver.rating.toFixed(1);
        }
    }
}

export function displayDriverFullProfile(driverId) {
    // БЕРЕМО ДАНІ ЗІ STATE!
    const driver = state.drivers_database.find(d => d.id === driverId);
    if (!driver) return;

    document.getElementById('profile-driver-name-header').textContent = `Профіль: ${driver.name}`;
    document.getElementById('profile-driver-name-full').textContent = driver.name;
    document.getElementById('profile-driver-trips-full').textContent = `${driver.trips} поїздки`;
    document.getElementById('profile-driver-car').textContent = driver.car;

    const ratingFull = document.getElementById('profile-driver-rating-full');
    if (driver.trips < 5) {
        ratingFull.innerHTML = `<small>Новий водій</small>`;
    } else {
        ratingFull.innerHTML = `<i class="fa-solid fa-star"></i> ${driver.rating.toFixed(1)}`;
    }

    const tagsContainer = document.getElementById('profile-driver-tags');
    tagsContainer.innerHTML = '';
    if (driver.tags) {
        driver.tags.forEach(tag => {
            tagsContainer.innerHTML += `<span class="tag"><i class="${tag.icon}"></i> ${tag.text}</span>`;
        });
    }

    const reviewsContainer = document.getElementById('profile-driver-reviews');
    const reviewsSection = reviewsContainer.closest('.details-section'); 
    const reviewsTitle = reviewsSection.querySelector('h4'); 

    if (reviewsTitle) {
        reviewsTitle.textContent = `Відгуки (${driver.reviews ? driver.reviews.length : 0})`;
    }

    reviewsContainer.innerHTML = '';
    if (driver.reviews && driver.reviews.length > 0) {
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

    // ТУТ ВАЖЛИВО: Ці функції мають бути визначені або імпортовані, якщо вони в 2 частині
    if(typeof displayDriverSchedule === 'function') displayDriverSchedule(driverId);
    if(typeof displayDriverPlannedRoutes === 'function') displayDriverPlannedRoutes(driverId);
}

export function displayPassengerProfile(passengerId) {
    // БЕРЕМО ДАНІ ЗІ STATE!
    const passenger = state.passengers_database.find(p => p.id === passengerId);
    if (!passenger) return;

    const nameEl = document.getElementById('profile-passenger-name');
    if(nameEl) nameEl.textContent = passenger.name;
    
    const tripsEl = document.getElementById('profile-passenger-trips');
    if(tripsEl) tripsEl.textContent = `${passenger.trips} поїздок`;

    if (passenger.feedback) {
        const fbEl = document.getElementById('passenger-feedback-placeholder');
        if(fbEl) fbEl.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> <strong>${passenger.feedback.likes} 👍🏻 ${passenger.feedback.dislikes} 👎🏻</strong>`;
    }

    document.getElementById('profile-passenger-name-header').textContent = `Профіль: ${passenger.name}`;
    document.getElementById('profile-passenger-name-full').textContent = passenger.name;
    document.getElementById('profile-passenger-trips-full').textContent = `${passenger.trips} поїздок`;
    
    if (passenger.feedback) {
        const fbFullEl = document.getElementById('passenger-feedback-placeholder-full');
        if(fbFullEl) fbFullEl.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> <strong>${passenger.feedback.likes} 👍🏻 ${passenger.feedback.dislikes} 👎🏻</strong>`;
    }
    document.getElementById('profile-passenger-bio').textContent = passenger.bio || 'Інформація відсутня';
}

// === ЛОГІКА ШВИДКОГО ЗАМОВЛЕННЯ ===

export function updateSummary() {
    const summaryCard = document.getElementById('quick-order-summary-card');
    const sumFrom = document.getElementById('summary-from');
    const sumTo = document.getElementById('summary-to');
    const sumTime = document.getElementById('summary-time');
    
    const sumFromCont = document.getElementById('summary-from-container');
    const sumToCont = document.getElementById('summary-to-container');
    const sumTimeCont = document.getElementById('summary-time-container');

    // БЕРЕМО ORDERDATA ЗІ STATE!
    if (!state.orderData) return;

    if (state.orderData.from || state.orderData.to) { 
        summaryCard.classList.remove('hidden');
    }

    if (state.orderData.from) { 
        sumFrom.textContent = state.orderData.from; 
        sumFromCont.style.display = 'flex';
    }

    if (state.orderData.to) { 
        sumTo.textContent = state.orderData.to; 
        sumToCont.style.display = 'flex';
    }

    if (state.orderData.time) { 
        sumTime.textContent = state.orderData.time; 
        sumTimeCont.style.display = 'flex';
    } else { 
        sumTimeCont.style.display = 'none';
    }
}

export function goToStep(stepToShow) {
    const stepAddress = document.getElementById('address-step');
    const stepTime = document.getElementById('time-step');
    const stepPayment = document.getElementById('payment-step');

    if (!stepAddress || !stepTime || !stepPayment) return;

    stepAddress.classList.remove('active');
    stepTime.classList.remove('active');
    stepPayment.classList.remove('active');

    if (stepToShow === 'address') {
        stepAddress.classList.add('active');
    } else if (stepToShow === 'time') {
        stepTime.classList.add('active');
    } else if (stepToShow === 'payment') {
        stepPayment.classList.add('active');
    }
}

export function resetQuickOrder() {
    // ЧИСТИМО ORDERDATA В STATE
    if (state.orderData) {
        for (const key in state.orderData) delete state.orderData[key];
    }
    
    document.getElementById('from-address').value = '';
    document.getElementById('to-address').value = '';
    document.getElementById('comment').value = '';
    
    document.getElementById('quick-order-summary-card').classList.add('hidden');
    document.getElementById('summary-from-container').style.display = 'none';
    document.getElementById('summary-to-container').style.display = 'none';
    document.getElementById('summary-time-container').style.display = 'none';
    document.getElementById('summary-driver-container').style.display = 'none';
    
    document.getElementById('address-next-btn').classList.add('disabled');
    
    document.getElementById('from-address-container').style.display = 'block';
    document.getElementById('from-village-container').style.display = 'none';
    document.getElementById('to-address-container').style.display = 'block';
    document.getElementById('to-village-container').style.display = 'none';
    
    const fromVillageSelect = document.getElementById('from-village-select');
    const toVillageSelect = document.getElementById('to-village-select');
    if(fromVillageSelect) fromVillageSelect.selectedIndex = 0;
    if(toVillageSelect) toVillageSelect.selectedIndex = 0;
    
    document.querySelectorAll('.btn-settlement').forEach(btn => {
        if (btn.dataset.type === 'valky') btn.classList.add('active');
        else btn.classList.remove('active');
    });
    
    const timeChoiceCont = document.getElementById('time-choice-container');
    const timeResultCont = document.getElementById('time-result-container');
    const picker = document.getElementById('datetime-picker');
    
    if(timeChoiceCont) timeChoiceCont.style.display = 'flex';
    if(timeResultCont) timeResultCont.style.display = 'none';
    if(picker) picker.style.display = 'none';
    
    goToStep('address');
}



// === РЕЗУЛЬТАТИ ЧАСУ ===
export function showTimeResult(text) {
    const timeChoiceCont = document.getElementById('time-choice-container');
    const timeResultCont = document.getElementById('time-result-container');
    const timeResText = document.getElementById('time-result-text');

    if (!timeChoiceCont || !timeResultCont || !timeResText) return;

    timeResText.textContent = text;
    timeChoiceCont.style.display = 'none';
    timeResultCont.style.display = 'flex';
}

// === ВАЛІДАЦІЯ АДРЕС ===
export function checkAddressInputs() {
    const fromBtn = document.querySelector('.btn-settlement[data-group="from"].active');
    const toBtn = document.querySelector('.btn-settlement[data-group="to"].active');

    if (!fromBtn || !toBtn) return;

    const fromType = fromBtn.dataset.type;
    const toType = toBtn.dataset.type;

    const fromInputVal = document.getElementById('from-address').value.trim();
    const fromVillageVal = document.getElementById('from-village-select').value;
    const toInputVal = document.getElementById('to-address').value.trim();
    const toVillageVal = document.getElementById('to-village-select').value;

    let isFromValid = false;
    if (fromType === 'valky') {
        isFromValid = fromInputVal.length > 0;
    } else if (fromType === 'village') {
        isFromValid = fromVillageVal && fromVillageVal !== 'Оберіть населений пункт...';
    }

    let isToValid = false;
    if (toType === 'valky') {
        isToValid = toInputVal.length > 0;
    } else if (toType === 'village') {
        isToValid = toVillageVal && toVillageVal !== 'Оберіть населений пункт...';
    }

    const nextBtn = document.getElementById('address-next-btn');
    if (isFromValid && isToValid) {
        nextBtn.classList.remove('disabled');
    } else {
        nextBtn.classList.add('disabled');
    }
}

// === ДЕТАЛІ ЗАМОВЛЕННЯ ===
export function displayOrderDetails(order) {
    const detailsPassengerName = document.getElementById('details-passenger-name');
    const detailsPassengerRating = document.getElementById('details-passenger-rating');
    const detailsFromAddress = document.getElementById('details-from-address');
    const detailsToAddress = document.getElementById('details-to-address');
    const detailsTotalPrice = document.getElementById('details-total-price');
    const detailsCommission = document.getElementById('details-commission');
    const detailsDriverEarning = document.getElementById('details-driver-earning');
    const detailsCommentText = document.getElementById('details-comment-text');
    const detailsCommentContainer = document.getElementById('details-comment-container');

    if(detailsPassengerName) detailsPassengerName.textContent = order.passengerName;
    if(detailsPassengerRating) detailsPassengerRating.innerHTML = `${(order.rating || 5.0).toFixed(1)} <i class="fa-solid fa-star"></i>`;
    if(detailsFromAddress) detailsFromAddress.textContent = order.from;
    if(detailsToAddress) detailsToAddress.textContent = order.to;

    const price = order.price || 130; 
    const commission = Math.round(price * 0.05);
    
    if(detailsTotalPrice) detailsTotalPrice.textContent = `${price} грн`;
    if(detailsCommission) detailsCommission.textContent = `- ${commission} грн`;
    if(detailsDriverEarning) detailsDriverEarning.textContent = `~ ${price - commission} грн`;

    if (order.comment) {
        if(detailsCommentText) detailsCommentText.textContent = order.comment;
        if(detailsCommentContainer) detailsCommentContainer.style.display = 'block';
    } else {
        if(detailsCommentContainer) detailsCommentContainer.style.display = 'none';
    }
}

// === ПОПАПИ ===
export function showProfilePopup(userData) {
    const popupAvatarIcon = document.getElementById('popup-avatar-icon');
    const popupUserName = document.getElementById('popup-user-name');
    const popupUserDetails = document.getElementById('popup-user-details');
    const profilePopup = document.getElementById('profile-popup');
    const popupOverlay = document.getElementById('popup-overlay');
    
    if (!popupAvatarIcon || !popupUserName || !popupUserDetails) return;
    
    popupAvatarIcon.className = userData.icon;
    popupUserName.textContent = userData.name;
    popupUserDetails.textContent = userData.details;
    
    popupOverlay.classList.remove('hidden');
    profilePopup.classList.add('visible');
}

export function hideProfilePopup() {
    const profilePopup = document.getElementById('profile-popup');
    const popupOverlay = document.getElementById('popup-overlay');
    popupOverlay?.classList.add('hidden');
    profilePopup?.classList.remove('visible');
}

// === СПОВІЩЕННЯ ===
export function displayNotifications(notifications, userType) {
    const listContainer = document.getElementById('notification-list');
    const placeholder = listContainer.querySelector('.list-placeholder');

    listContainer.innerHTML = '';
    listContainer.appendChild(placeholder);

    if (notifications.length === 0) {
        placeholder.style.display = 'block';
    } else {
        placeholder.style.display = 'none';
        notifications.slice().reverse().forEach(notif => {
            const li = document.createElement('li');
            li.className = 'notification-card';
            if (notif.isRead) li.classList.add('is-read');

            const iconClass = notif.type === 'new_order' ? 'fa-solid fa-file-circle-plus' : 'fa-solid fa-bell';
            
            li.dataset.notificationId = notif.id;
            if (notif.offerId) {
                li.dataset.offerId = notif.offerId;
            }
            if (notif.type === 'new_order' && userType === 'driver') {
                li.style.cursor = 'pointer';
            }

            li.innerHTML = `
                <i class="notification-icon ${iconClass}"></i>
                <p class="notification-text">${notif.text}</p>
            `;
            listContainer.appendChild(li);
        });
    }
}

// === ГРАФІК РОБОТИ (SCHEDULE) ===
export function renderScheduleEditor() {
    const container = document.getElementById('schedule-days-list');
    if (!container) return;
    
    // Беремо поточного юзера зі STATE
    const driver = state.currentUser;
    if (!driver) return; 

    const schedule = driver.schedule || {};
    
    const days = [
        {code: 'mon', name: 'Понеділок'},
        {code: 'tue', name: 'Вівторок'},
        {code: 'wed', name: 'Середа'},
        {code: 'thu', name: 'Четвер'},
        {code: 'fri', name: "П'ятниця"},
        {code: 'sat', name: 'Субота'},
        {code: 'sun', name: 'Неділя'}
    ];
    
    container.innerHTML = '';
    
    days.forEach(day => {
        const savedTime = schedule[day.code];
        const [timeFrom, timeTo] = savedTime ? savedTime.split('-') : ['', ''];
        const isEnabled = !!savedTime;
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'schedule-day-editor';
        dayDiv.innerHTML = `
            <input type="checkbox" id="schedule-${day.code}-enabled" ${isEnabled ? 'checked' : ''}>
            <label for="schedule-${day.code}-enabled">${day.name}</label>
            <input type="time" id="schedule-${day.code}-from" value="${timeFrom}" ${!isEnabled ? 'disabled' : ''}>
            <span style="color: var(--md-on-surface-variant);">—</span>
            <input type="time" id="schedule-${day.code}-to" value="${timeTo}" ${!isEnabled ? 'disabled' : ''}>
        `;
        
        const checkbox = dayDiv.querySelector('input[type="checkbox"]');
        const timeInputs = dayDiv.querySelectorAll('input[type="time"]');
        
        checkbox.addEventListener('change', () => {
            timeInputs.forEach(input => input.disabled = !checkbox.checked);
        });
        
        container.appendChild(dayDiv);
    });
}

export function displayDriverSchedule(driverId) {
    // Шукаємо у STATE
    const driver = state.drivers_database.find(d => d.id == driverId) || 
                  (state.currentUser && state.currentUser.id == driverId ? state.currentUser : null);
    
    const container = document.getElementById('profile-driver-schedule');
    if (!container || !driver) return;
    
    const schedule = driver.schedule;
    
    if (!schedule || Object.keys(schedule).length === 0) {
        container.innerHTML = '<p class="no-schedule-placeholder">Графік не встановлено</p>';
        return;
    }
    
    const dayNames = {
        mon: 'Пн', tue: 'Вт', wed: 'Ср', 
        thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Нд'
    };
    
    container.innerHTML = '';
    Object.keys(schedule).forEach(dayCode => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'schedule-day-item';
        dayDiv.innerHTML = `
            <span class="schedule-day-name">${dayNames[dayCode]}</span>
            <span class="schedule-day-time">${schedule[dayCode]}</span>
        `;
        container.appendChild(dayDiv);
    });
}

// === ЗАПЛАНОВАНІ МАРШРУТИ ===
export function renderPlannedRoutesEditor() {
    const container = document.getElementById('planned-routes-list');
    if (!container) return;
    
    const driver = state.currentUser;
    if (!driver) return;

    if (!driver.plannedRoutes) driver.plannedRoutes = [];
    const routes = driver.plannedRoutes;
    
    container.innerHTML = '';
    
    if (routes.length === 0) {
        container.innerHTML = '<p class="no-routes-placeholder">У вас поки немає запланованих маршрутів</p>';
        return;
    }
    
    const dayNames = {
        mon: 'Пн', tue: 'Вт', wed: 'Ср', 
        thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Нд'
    };
    
    routes.forEach(route => {
        const routeDiv = document.createElement('div');
        routeDiv.className = 'planned-route-edit-card';
        
        const daysHtml = route.days.map(d => `<span class="planned-route-day-tag">${dayNames[d]}</span>`).join('');
        
        routeDiv.innerHTML = `
            <button class="btn-icon-action" data-route-id="${route.id}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
            <div class="planned-route-direction">${route.from} → ${route.to}</div>
            <div class="planned-route-time"><i class="fa-solid fa-clock"></i> ${route.time}</div>
            <div class="planned-route-time"><i class="fa-solid fa-user-group"></i> ${route.seats} місць</div>
            <div class="planned-route-days">${daysHtml}</div>
        `;
        
        const deleteBtn = routeDiv.querySelector('.btn-icon-action');
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Видалити маршрут ${route.from} → ${route.to}?`)) {
                const index = driver.plannedRoutes.findIndex(r => r.id === route.id);
                if (index > -1) {
                    driver.plannedRoutes.splice(index, 1);
                    // ТУТ ВАЖЛИВО: Оновлюємо базу через імпортовані функції
                    const routeRef = ref(db, 'users/' + driver.id + '/plannedRoutes');
                    set(routeRef, driver.plannedRoutes);
                    
                    renderPlannedRoutesEditor(); // Рекурсивно перемальовуємо
                }
            }
        });
        
        container.appendChild(routeDiv);
    });
}

export function displayDriverPlannedRoutes(driverId) {
    const driver = state.drivers_database.find(d => d.id == driverId) || 
                  (state.currentUser && state.currentUser.id == driverId ? state.currentUser : null);
    
    const container = document.getElementById('profile-driver-routes');
    if (!container || !driver) return;
    
    const routes = driver.plannedRoutes || [];
    
    if (routes.length === 0) {
        container.innerHTML = '<p class="no-routes-placeholder">Маршрутів поки немає</p>';
        return;
    }
    
    const dayNames = {
        mon: 'Пн', tue: 'Вт', wed: 'Ср', 
        thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Нд'
    };
    
    container.innerHTML = '';
    routes.forEach(route => {
        const routeDiv = document.createElement('div');
        routeDiv.className = 'planned-route-card';
        
        const daysHtml = route.days.map(d => `<span class="planned-route-day-tag">${dayNames[d]}</span>`).join('');
        
        routeDiv.innerHTML = `
            <div class="planned-route-direction">${route.from} → ${route.to}</div>
            <div class="planned-route-time"><i class="fa-solid fa-clock"></i> ${route.time} • <i class="fa-solid fa-user-group"></i> ${route.seats} місць</div>
            <div class="planned-route-days">${daysHtml}</div>
        `;
        
        container.appendChild(routeDiv);
    });
}

export function renderWeekdaySelector() {
    const container = document.getElementById('planned-route-days');
    if (!container) return;
    
    const days = [
        {code: 'mon', short: 'Пн'},
        {code: 'tue', short: 'Вт'},
        {code: 'wed', short: 'Ср'},
        {code: 'thu', short: 'Чт'},
        {code: 'fri', short: 'Пт'},
        {code: 'sat', short: 'Сб'},
        {code: 'sun', short: 'Нд'}
    ];
    
    container.innerHTML = '';
    days.forEach(day => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'weekday-btn';
        btn.dataset.day = day.code;
        btn.textContent = day.short;
        
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
        });
        
        container.appendChild(btn);
    });
}
