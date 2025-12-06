import { state } from './state.js';
import { UI, navigateTo } from './ui.js';
import { db } from './firebase-init.js'; // На майбутнє, якщо треба

// === ФУНКЦІЇ ВІДОБРАЖЕННЯ ===

function displayDriverOrders() {
    const orderList = document.getElementById('driver-order-list');
    if (!orderList) return;
    orderList.innerHTML = '';

    if (state.orders_database.length === 0) {
        orderList.innerHTML = '<p class="list-placeholder">Замовлень поки немає.</p>';
        return;
    }

    state.orders_database.forEach(order => {
        if (order.status !== 'searching') return;

        const cardElement = UI.createDriverOrderCard(order);

        if (order.paymentMethod === 'card' && !state.driverAcceptsOnlinePayment) {
            cardElement.classList.add('disabled-for-driver');
        } else {
            cardElement.addEventListener('click', () => {
                UI.displayOrderDetails(order);

                // Отримуємо кнопки тут, бо вони вже існують в DOM
                const acceptOrderBtn = document.getElementById('accept-order-btn');
                const declineOrderBtn = document.getElementById('decline-order-btn');

                // Очищаємо старі обробники (клонуванням), щоб не дублювати кліки
                if(acceptOrderBtn) {
                    const newBtn = acceptOrderBtn.cloneNode(true);
                    acceptOrderBtn.parentNode.replaceChild(newBtn, acceptOrderBtn);
                    newBtn.onclick = () => window.acceptOrderAction(order); // Викличемо функцію з handlers
                }

                if(declineOrderBtn) {
                    declineOrderBtn.onclick = () => {
                        navigateTo('driver-find-passengers-screen');
                    };
                }

                navigateTo('driver-order-details-screen');
            });
        }
        orderList.appendChild(cardElement);
    });
}

function displayArchives() {
    // --- АРХІВ ПАСАЖИРА ---
    const passengerArchiveList = document.querySelector('#passenger-orders-screen .order-list.passenger');
    if (passengerArchiveList) {
        passengerArchiveList.innerHTML = '';
        if (state.passenger_archive.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = `<p class="list-placeholder" style="font-style: italic; text-align: center; color: var(--md-on-surface-variant);">Архів поїздок порожній.</p>`;
            passengerArchiveList.appendChild(li);
        } else {
            state.passenger_archive.slice().reverse().forEach(order => {
                const driver = state.drivers_database.find(d => d.id == order.driverId);
                const driverName = driver ? driver.name : 'Невідомий водій';
                
                const li = document.createElement('li');
                li.className = 'order-card archived';
                li.innerHTML = `
                    <div class="archived-info">
                        <span class="archived-date">${new Date(order.id).toLocaleDateString('uk-UA')}</span>
                        <div class="route">
                            <span><i class="fa-solid fa-circle"></i> ${order.from}</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${order.to}</span>
                        </div>
                        <div class="driver-details">Водій: ${driverName}</div>
                    </div>
                `;
                passengerArchiveList.appendChild(li);
            });
        }
    }

    // --- АРХІВ ВОДІЯ ---
    const driverArchiveList = document.querySelector('#driver-orders-screen .order-list.driver');
    if (driverArchiveList) {
        driverArchiveList.innerHTML = '';
        if (state.driver_archive.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = `<p class="list-placeholder" style="font-style: italic; text-align: center; color: var(--md-on-surface-variant);">Архів поїздок порожній.</p>`;
            driverArchiveList.appendChild(li);
        } else {
            state.driver_archive.slice().reverse().forEach(order => {
                const passenger = state.passengers_database.find(p => p.id == order.passengerId);
                const passengerName = passenger ? passenger.name : 'Невідомий пасажир';
                
                const li = document.createElement('li');
                li.className = 'order-card archived';
                li.innerHTML = `
                    <div class="archived-info">
                        <span class="archived-date">${new Date(order.id).toLocaleDateString('uk-UA')}</span>
                        <div class="route">
                            <span><i class="fa-solid fa-circle"></i> ${order.from}</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${order.to}</span>
                        </div>
                        <div class="driver-details">Пасажир: ${passengerName}</div>
                    </div>
                `;
                driverArchiveList.appendChild(li);
            });
        }
    }
}

function displayAvailableDrivers() {
    const driverListContainer = document.querySelector('#passenger-find-driver-screen .driver-list');
    if (!driverListContainer) return;
    driverListContainer.innerHTML = '';
    
    if (state.drivers_database.length === 0) {
        driverListContainer.innerHTML = '<p class="list-placeholder">Немає доступних водіїв.</p>';
        return;
    }

    state.drivers_database.forEach(driver => {
        const li = document.createElement('li');
        li.className = 'driver-card online';

        li.innerHTML = `
            <div class="avatar-convex"><i class="fa-solid fa-user-tie"></i></div>
            <div class="driver-info">
                <h4>${driver.name}</h4>
                <span>${(driver.rating || 0).toFixed(1)} <i class="fa-solid fa-star"></i></span>
                <small class="status-available">Доступний</small>
            </div>
            <div class="status-dot online"></div>
        `;
        li.addEventListener('click', () => {
            UI.displayDriverProfile(driver.id);
            navigateTo('passenger-full-profile-screen');
        });
        driverListContainer.appendChild(li);
    });
}

function displayVhOffers(filter = 'all') {
    const offerListContainer = document.getElementById('vh-driver-list');
    if (!offerListContainer) return;

    const filteredOffers = state.vh_offers_database.filter(offer => {
        if (filter === 'all') return true;
        if (filter === 'vk') return offer.direction.startsWith('Валки');
        if (filter === 'kv') return offer.direction.startsWith('Харків');
        return false;
    });
    
    orderListRenderHelper(offerListContainer, filteredOffers, (offer) => {
        const driver = state.drivers_database.find(d => d.id == offer.driverId);
        if (!driver) return null;
        
        return `
            <div class="avatar-convex"><i class="fa-solid fa-user-tie"></i></div>
            <div class="driver-info">
                <h4>${driver.name}</h4>
                <span>${driver.rating} <i class="fa-solid fa-star"></i> • ${offer.direction}</span>
                <small class="status-available">${offer.time} • ${offer.seats} місць</small>
            </div>
            <button class="btn-main-action accept select-offer-btn" onclick="window.selectOffer('${offer.id}')">Обрати</button>
        `;
    });
}

function displayVhRequests() {
    const requestListContainer = document.getElementById('vh-passenger-request-list');
    if (!requestListContainer) return;

    orderListRenderHelper(requestListContainer, state.vh_requests_database, (request) => {
        const passenger = state.passengers_database.find(p => p.id == request.passengerId);
        const passengerName = passenger ? passenger.name : 'Невідомий';

        return `
            <div class="order-main-info">
                <div class="passenger-info">
                    <div class="avatar-convex"><i class="fa-solid fa-user"></i></div>
                    <div class="passenger-details">
                        <strong>${passengerName}</strong>
                        <span>${request.direction} • ${request.seats} місць</span>
                    </div>
                </div>
            </div>
            <div class="order-time-info">
                <i class="fa-solid fa-clock"></i>
                <span>${request.time}</span>
            </div>
            <button class="btn-main-action accept" data-request-id="${request.id}" style="width: 100%; margin-top: 12px;">Відгукнутись</button>
        `;
    });
}

// Допоміжна функція для рендеру
function orderListRenderHelper(container, data, templateFn) {
    container.innerHTML = '';
    if (data.length === 0) {
        container.innerHTML = '<p class="list-placeholder">Список порожній.</p>';
        return;
    }
    data.forEach(item => {
        const html = templateFn(item);
        if (html) {
            const li = document.createElement('li');
            li.className = 'driver-card online'; // Або інший клас
            li.innerHTML = html;
            container.appendChild(li);
        }
    });
}

// === РОБИМО ГЛОБАЛЬНИМИ ===
window.displayDriverOrders = displayDriverOrders;
window.displayArchives = displayArchives;
window.displayAvailableDrivers = displayAvailableDrivers;
window.displayVhOffers = displayVhOffers;
window.displayVhRequests = displayVhRequests;