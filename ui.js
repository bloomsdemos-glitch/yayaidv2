const UI = {};

const popupAvatarIcon = document.getElementById('popup-avatar-icon');
const popupUserName = document.getElementById('popup-user-name');
const popupUserDetails = document.getElementById('popup-user-details');

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

UI.displayPassengerProfile = function(passengerId) {
    // Знаходимо пасажира в базі даних
    const passenger = passengers_database.find(p => p.id === passengerId);
    if (!passenger) {
        console.error('Пасажира з ID', passengerId, 'не знайдено.');
        return;
    }

    // Заповнюємо дані на екрані "Профіль" (коротка версія)
    document.getElementById('profile-passenger-name').textContent = passenger.name;
    document.getElementById('profile-passenger-trips').textContent = `${passenger.trips} поїздок`;
    // Заглушка для лайків/дизлайків, яка запрацює на наступному кроці
    if (passenger.feedback) {
        document.getElementById('passenger-feedback-placeholder').innerHTML = `<i class="fa-solid fa-thumbs-up"></i> <strong>${passenger.feedback.likes} 👍🏻 ${passenger.feedback.dislikes} 👎🏻</strong>`;
    }

    // Заповнюємо дані на екрані "Повний профіль"
    document.getElementById('profile-passenger-name-header').textContent = `Профіль: ${passenger.name}`;
    document.getElementById('profile-passenger-name-full').textContent = passenger.name;
    document.getElementById('profile-passenger-trips-full').textContent = `${passenger.trips} поїздок`;
    if (passenger.feedback) {
        document.getElementById('passenger-feedback-placeholder-full').innerHTML = `<i class="fa-solid fa-thumbs-up"></i> <strong>${passenger.feedback.likes} 👍🏻 ${passenger.feedback.dislikes} 👎🏻</strong>`;
    }
    document.getElementById('profile-passenger-bio').textContent = passenger.bio;

    // Логіка для відгуків водіїв (поки що просто заглушка)
    const reviewsContainer = document.querySelector('#passenger-full-profile-screen .review-list');
    if (reviewsContainer) {
         reviewsContainer.innerHTML = '<p class="no-reviews-placeholder">Відгуків поки що немає.</p>';
    }
};


UI.updateSummary = function() {
    if (orderData.from || orderData.to) { quickOrderSummaryCard.classList.remove('hidden');
    }
    if (orderData.from) { summaryFrom.textContent = orderData.from; summaryFromContainer.style.display = 'flex';
    }
    if (orderData.to) { summaryTo.textContent = orderData.to; summaryToContainer.style.display = 'flex';
    }
    if (orderData.time) { summaryTime.textContent = orderData.time; summaryTimeContainer.style.display = 'flex';
    } 
    else { summaryTimeContainer.style.display = 'none';
    }
};

UI.goToStep = function(stepToShow) {
    addressStep.classList.remove('active');
    timeStep.classList.remove('active');
    paymentStep.classList.remove('active');
    if (stepToShow === 'address') {
        addressStep.classList.add('active');
    } else if (stepToShow === 'time') {
        timeStep.classList.add('active');
    } else if (stepToShow === 'payment') {
        paymentStep.classList.add('active');
    }
};

UI.resetQuickOrder = function() {
    orderData = {};
    fromAddressInput.value = '';
    toAddressInput.value = '';
    document.getElementById('comment').value = '';
    quickOrderSummaryCard.classList.add('hidden');
    summaryFromContainer.style.display = 'none';
    summaryToContainer.style.display = 'none';
    summaryTimeContainer.style.display = 'none';
    document.getElementById('summary-driver-container').style.display = 'none';
    addressNextBtn.classList.add('disabled');
    document.getElementById('from-address-container').style.display = 'block';
    fromVillageContainer.style.display = 'none';
    document.getElementById('to-address-container').style.display = 'block';
    toVillageContainer.style.display = 'none';
    fromVillageSelect.selectedIndex = 0;
    toVillageSelect.selectedIndex = 0;
    settlementButtons.forEach(btn => {
        if (btn.dataset.type === 'valky') btn.classList.add('active');
        else btn.classList.remove('active');
    });
    timeChoiceContainer.style.display = 'flex';
    timeResultContainer.style.display = 'none';
    pickerInput.style.display = 'none';
    UI.goToStep('address'); // <-- Важливо: тут теж тепер UI.
};

UI.showTimeResult = function(text) {
    orderData.time = text;
    timeResultText.textContent = text;
    timeChoiceContainer.style.display = 'none';
    timeResultContainer.style.display = 'flex';
    UI.updateSummary(); // <-- Важливо: і тут теж UI.
};

UI.checkAddressInputs = function() {
    const fromType = document.querySelector('.btn-settlement[data-group="from"].active').dataset.type;
    const toType = document.querySelector('.btn-settlement[data-group="to"].active').dataset.type;
    const isFromValid = (fromType === 'valky' && fromAddressInput.value.trim() !== '') ||
    (fromType === 'village' && fromVillageSelect.selectedIndex > 0);
    const isToValid = (toType === 'valky' && toAddressInput.value.trim() !== '') ||
    (toType === 'village' && toVillageSelect.selectedIndex > 0);
    if (isFromValid && isToValid) {
        addressNextBtn.classList.remove('disabled');
    } else {
        addressNextBtn.classList.add('disabled');
    }
};

UI.displayOrderDetails = function(order) {
    if(detailsPassengerName) detailsPassengerName.textContent = order.passengerName;
    if(detailsPassengerRating) detailsPassengerRating.innerHTML = `${order.rating} <i class="fa-solid fa-star"></i> • ${Math.floor(Math.random() * 50) + 5} поїздок`;
    if(detailsFromAddress) detailsFromAddress.textContent = order.from;
    if(detailsToAddress) detailsToAddress.textContent = order.to;

    const commission = Math.round(order.price * 0.05);
    if(detailsTotalPrice) detailsTotalPrice.textContent = `${order.price} грн`;
    if(detailsCommission) detailsCommission.textContent = `- ${commission} грн`;
    if(detailsDriverEarning) detailsDriverEarning.textContent = `~ ${order.price - commission} грн`;

    const randomComment = "Буду з дитиною 6 років, потрібно автокрісло.";
    if (Math.random() > 0.5) {
        if(detailsCommentText) detailsCommentText.textContent = randomComment;
        if(detailsCommentContainer) detailsCommentContainer.style.display = 'block';
    } else {
        if(detailsCommentContainer) detailsCommentContainer.style.display = 'none';
    }
};

UI.showProfilePopup = function(userData) {
    const popupAvatarIcon = document.getElementById('popup-avatar-icon');
    const popupUserName = document.getElementById('popup-user-name');
    const popupUserDetails = document.getElementById('popup-user-details');
    const profilePopup = document.getElementById('profile-popup');
    const popupOverlay = document.getElementById('popup-overlay');
    
    if (!popupAvatarIcon || !popupUserName || !popupUserDetails) {
        console.error('Елементи поп-апу не знайдено');
        return;
    }
    
    popupAvatarIcon.className = userData.icon;
    popupUserName.textContent = userData.name;
    popupUserDetails.textContent = userData.details;
    
    popupOverlay.classList.remove('hidden');
    profilePopup.classList.add('visible');
};

UI.hideProfilePopup = function() {
    const profilePopup = document.getElementById('profile-popup');
    const popupOverlay = document.getElementById('popup-overlay');
    
    popupOverlay?.classList.add('hidden');
    profilePopup?.classList.remove('visible');
};

UI.displayNotifications = function(notifications, userType) {
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
            
            // Зберігаємо важливі дані прямо на елементі
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
};

// === ГРАФІК РОБОТИ ===
UI.renderScheduleEditor = function() {
    const container = document.getElementById('schedule-days-list');
    if (!container) return;
    
    const driver = drivers_database[0];
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
};

// === ВІДОБРАЖЕННЯ ГРАФІКУ В ПРОФІЛІ ===
UI.displayDriverSchedule = function(driverId) {
    const driver = drivers_database.find(d => d.id === driverId);
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
};

// === ЗАПЛАНОВАНІ МАРШРУТИ ===
UI.renderPlannedRoutesEditor = function() {
    const container = document.getElementById('planned-routes-list');
    if (!container) return;
    
    const driver = drivers_database[0];
    const routes = driver.plannedRoutes || [];
    
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
                    saveState();
                    UI.renderPlannedRoutesEditor();
                }
            }
        });
        
        container.appendChild(routeDiv);
    });
};

// === ВІДОБРАЖЕННЯ ЗАПЛАНОВАНИХ МАРШРУТІВ У ПРОФІЛІ ===
UI.displayDriverPlannedRoutes = function(driverId) {
    const driver = drivers_database.find(d => d.id === driverId);
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
};

// === СЕЛЕКТОР ДНІВ ТИЖНЯ ===
UI.renderWeekdaySelector = function() {
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
};
