function displayDriverOrders() {
    const orderList = document.getElementById('driver-order-list');
    if (!orderList) return;
    orderList.innerHTML = '';

    orders_database.forEach(order => {
        const cardElement = UI.createDriverOrderCard(order);

        if (order.paymentMethod === 'card' && !fakeDriverAcceptsCard) {
            cardElement.classList.add('disabled-for-driver');
        } else {
            cardElement.addEventListener('click', () => {
                UI.displayOrderDetails(order);

                const acceptOrderBtn = document.getElementById('accept-order-btn');
                const declineOrderBtn = document.getElementById('decline-order-btn');

                if(acceptOrderBtn) acceptOrderBtn.onclick = () => {
                    const newTaxiTrip = {
                        id: Date.now(),
                        driverId: 1, 
                        passengerId: 1, 
                        passengerName: 'Олена',
                        from: document.getElementById('details-from-address').textContent,
                        to: document.getElementById('details-to-address').textContent,
                        time: 'Зараз',
                        type: 'taxi'
                    };
                    active_trips.push(newTaxiTrip);
                    saveState();
                    updateAllDriverTripViews();
                    updateHomeScreenView('passenger');
                    navigateTo('driver-orders-screen');
                    alert('Замовлення прийнято!');
                };

                if(declineOrderBtn) declineOrderBtn.onclick = () => {
                    navigateTo('driver-find-passengers-screen');
                };

                navigateTo('driver-order-details-screen');
            });
        }

        orderList.appendChild(cardElement);
    });
}

function displayArchives() {
    // --- Архів пасажира ---
    const passengerArchiveList = document.querySelector('#passenger-orders-screen .order-list.passenger');
    if (passengerArchiveList) {
        passengerArchiveList.innerHTML = '';
        if (passenger_archive.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = `<p class="list-placeholder" style="font-style: italic; text-align: center; color: var(--md-on-surface-variant);">Архів поїздок порожній.</p>`;
            passengerArchiveList.appendChild(li);
        } else {
            passenger_archive.forEach(order => {
                const driver = drivers_database.find(d => d.id === (order.driverId || 1));
                const driverName = driver ? driver.name : 'Водій';
                const driverCar = driver ? driver.car : '';
                const driverRating = driver ? driver.rating.toFixed(1) : 'N/A';
                const li = document.createElement('li');
                li.className = 'order-card archived';
                li.style.cursor = 'pointer';
                li.innerHTML = `...`; // (весь HTML картки, залишаємо як є)
                li.addEventListener('click', () => {
                    document.getElementById('archived-details-date').textContent = new Date(order.id).toLocaleString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    document.getElementById('archived-details-from').textContent = order.from;
                    document.getElementById('archived-details-to').textContent = order.to;
                    document.getElementById('archived-details-price').textContent = `~ ${order.price || 125} грн`;
                    document.getElementById('archived-details-payment').textContent = order.paymentMethod === 'card' ? 'Картка' : 'Готівка';
                    document.getElementById('archived-details-driver-name').textContent = driverName;
                    document.getElementById('archived-details-driver-car').textContent = driverCar;
                    document.getElementById('archived-details-driver-rating').innerHTML = `${driverRating} <i class="fa-solid fa-star"></i>`;
                    navigateTo('archived-trip-details-screen');
                });
                passengerArchiveList.appendChild(li);
            });
        }
    }

    // --- Архів водія ---
    const driverArchiveList = document.querySelector('#driver-orders-screen .order-list.driver');
    if (driverArchiveList) {
        driverArchiveList.innerHTML = '';
        if (driver_archive.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = `<p class="list-placeholder" style="font-style: italic; text-align: center; color: var(--md-on-surface-variant);">Архів поїздок порожній.</p>`;
            driverArchiveList.appendChild(li);
        } else {
            driver_archive.forEach(order => {
                const passenger = passengers_database.find(p => p.id === (order.passengerId || 1));
                const passengerName = passenger ? passenger.name : 'Пасажир';
                const passengerRating = passenger ? '4.8 <i class="fa-solid fa-star"></i>' : 'N/A';
                const li = document.createElement('li');
                li.className = 'order-card archived';
                li.style.cursor = 'pointer';
                li.innerHTML = `
                    <div class="archived-info">
                        <span class="archived-date">${new Date(order.id).toLocaleDateString('uk-UA')}</span>
                        <div class="route">
                            <span><i class="fa-solid fa-circle"></i> ${order.from}</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${order.to}</span>
                        </div>
                        <div class="driver-details">Пасажир: ${passengerName}</div>
                    </div>
                    <button class="details-btn-arrow"><i class="fa-solid fa-circle-chevron-right"></i></button>
                `;
                li.addEventListener('click', () => {
                    document.getElementById('driver-archived-passenger-name').textContent = passengerName;
                    document.getElementById('driver-archived-passenger-rating').innerHTML = passengerRating;
                    document.getElementById('driver-archived-from').textContent = order.from;
                    document.getElementById('driver-archived-to').textContent = order.to;
                    navigateTo('driver-archived-trip-details-screen');
                });
                driverArchiveList.appendChild(li);
            });
        }
    }
}
function displayAvailableDrivers() {
    const driverListContainer = document.querySelector('#passenger-find-driver-screen .driver-list');
    if (!driverListContainer) return;
    driverListContainer.innerHTML = '';
    
    drivers_database.forEach(driver => {
        const li = document.createElement('li');
        li.className = 'driver-card online';

        li.innerHTML = `
            <div class="avatar-convex"><i class="fa-solid fa-user-tie"></i></div>
            <div class="driver-info">
                <h4>${driver.name}</h4>
                <span>${driver.rating.toFixed(1)} <i class="fa-solid fa-star"></i></span>
                <small class="status-available">Доступний</small>
            </div>
            <div class="status-dot online"></div>
        `;
        
        // --- ВИПРАВЛЕННЯ ТУТ ---
        li.addEventListener('click', () => {
            // 1. Заповнюємо дані профілю
            UI.displayDriverProfile(driver.id);
            
            // 2. (НОВЕ) Переходимо на екран повного профілю
            navigateTo('passenger-full-profile-screen');
            
            // 3. (ВАЖЛИВО) Треба переконатися, що на екрані профілю є кнопка "Поїхати"
            // і їй присвоєно правильний ID водія.
            // Можна додати тимчасовий хак тут, або зробити це в UI.displayDriverProfile
        });
        
        driverListContainer.appendChild(li);
    });
}

function displayVhOffers(filter = 'all') {
    const offerListContainer = document.getElementById('vh-driver-list');
    const placeholder = offerListContainer?.querySelector('.list-placeholder');

    if (!offerListContainer || !placeholder) return;

    const filteredOffers = vh_offers_database.filter(offer => {
        if (filter === 'all') return true;
        if (filter === 'vk') return offer.direction.startsWith('Валки');
        if (filter === 'kv') return offer.direction.startsWith('Харків');
        return false;
    });
    offerListContainer.innerHTML = '';
    offerListContainer.appendChild(placeholder);

    if (filteredOffers.length === 0) {
        placeholder.style.display = 'block';
        placeholder.textContent = 'За цим напрямком пропозицій поки немає.';
    } else {
        placeholder.style.display = 'none';
        filteredOffers.forEach(offer => {
            const driver = drivers_database.find(d => d.id === offer.driverId);
            if (!driver) return;

            const li = document.createElement('li');
            li.className = 'driver-card online';

            li.innerHTML = `
                <div class="avatar-convex"><i class="fa-solid fa-user-tie"></i></div>
                <div class="driver-info">
                    <h4>${driver.name}</h4>
                    <span>${driver.rating.toFixed(1)} <i class="fa-solid fa-star"></i> • ${offer.direction}</span>
                    <small class="status-available">${offer.time} • <i class="fa-solid fa-user-group"></i> ${offer.seats} вільних</small>
                </div>
                <button class="btn-main-action accept select-offer-btn" style="padding: 10px 16px; font-size: 14px;">Обрати</button>
            `;

            const selectBtn = li.querySelector('.select-offer-btn');
            selectBtn.addEventListener('click', () => {
                selectOffer(offer.id);
            });

            offerListContainer.appendChild(li);
        });
    }
}
function displayVhRequests() {
    const requestListContainer = document.getElementById('vh-passenger-request-list');
    const placeholder = requestListContainer?.querySelector('.list-placeholder');

    if (!requestListContainer || !placeholder) return;

    requestListContainer.innerHTML = '';
    requestListContainer.appendChild(placeholder);

    if (vh_requests_database.length === 0) {
        placeholder.style.display = 'block';
    } else {
        placeholder.style.display = 'none';

        vh_requests_database.forEach(request => {
            const passenger = passengers_database.find(p => p.id === request.passengerId);
            const passengerName = passenger ? passenger.name : 'Невідомий пасажир';

            const li = document.createElement('li');
            li.className = 'order-card driver-view';

            li.innerHTML = `
                <div class="order-main-info">
                    <div class="passenger-info">
                        <div class="avatar-convex"><i class="fa-solid fa-user"></i></div>
                        <div class="passenger-details">
                            <strong>${passengerName}</strong>
                            <span>${request.direction} • <i class="fa-solid fa-user-group"></i> ${request.seats}</span>
                        </div>
                    </div>
                </div>
                <div class="order-route-info">
                    <div class="address-line">
                        <i class="fa-solid fa-circle start-address-icon"></i>
                        <span>${request.fromSpecific || 'Точка не вказана'}</span>
                    </div>
                    <div class="address-line">
                        <i class="fa-solid fa-location-dot end-address-icon"></i>
                        <span>${request.toSpecific || 'Точка не вказана'}</span>
                    </div>
                </div>
                <div class="order-time-info">
                    <i class="fa-solid fa-clock"></i>
                    <span>${request.time}</span>
                </div>
                <button class="btn-main-action accept" data-request-id="${request.id}" style="width: 100%; margin-top: 12px;">Відгукнутись</button>
            `;
            requestListContainer.appendChild(li); 
        }); 
    }
}
