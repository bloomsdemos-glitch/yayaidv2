function displayDriverOrders() {
    const orderList = document.getElementById('driver-order-list');
    if (!orderList) return;
    orderList.innerHTML = '';

    // Якщо список порожній - показуємо заглушку (треба перевірити, чи є вона в HTML, але тут це не завадить)
    if (orders_database.length === 0) {
        orderList.innerHTML = '<p class="list-placeholder">Замовлень поки немає.</p>';
        return;
    }

    orders_database.forEach(order => {
        // Пропускаємо замовлення, які вже взяті кимось іншим (якщо ми раптом не відфільтрували їх раніше)
        if (order.status !== 'searching') return;

        const cardElement = UI.createDriverOrderCard(order);

        // Перевірка на тип оплати (використовуємо правильну змінну)
        if (order.paymentMethod === 'card' && !driverAcceptsOnlinePayment) {
            cardElement.classList.add('disabled-for-driver');
        } else {
            cardElement.addEventListener('click', () => {
                UI.displayOrderDetails(order);

                const acceptOrderBtn = document.getElementById('accept-order-btn');
                const declineOrderBtn = document.getElementById('decline-order-btn');

                if(acceptOrderBtn) acceptOrderBtn.onclick = () => {
                    // Створюємо РЕАЛЬНУ поїздку
                    const newTaxiTrip = {
                        id: Date.now(),
                        driverId: currentUser.id, // ID поточного водія
                        passengerId: order.passengerId, // ID пасажира із замовлення
                        passengerName: order.passengerName, // Ім'я пасажира із замовлення
                        from: order.from,
                        to: order.to,
                        time: 'Зараз',
                        status: 'in_progress', // Змінюємо статус на активний
                        type: 'taxi'
                    };
                    
                    // Додаємо в активні
                    active_trips.push(newTaxiTrip);
                    
                    // Видаляємо це замовлення зі списку доступних (або змінюємо статус)
                    const orderIndex = orders_database.indexOf(order);
                    if (orderIndex > -1) orders_database.splice(orderIndex, 1);

                    saveState();
                    
                    // Оновлюємо вигляд
                    updateAllDriverTripViews();
                    updateHomeScreenView('passenger'); // Це оновить екран пасажиру (через Firebase listener)
                    
                    navigateTo('driver-orders-screen');
                    alert('Замовлення прийнято! Рушайте до пасажира.');
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
    // --- АРХІВ ПАСАЖИРА ---
    const passengerArchiveList = document.querySelector('#passenger-orders-screen .order-list.passenger');
    if (passengerArchiveList) {
        passengerArchiveList.innerHTML = '';
        if (passenger_archive.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = `<p class="list-placeholder" style="font-style: italic; text-align: center; color: var(--md-on-surface-variant);">Архів поїздок порожній.</p>`;
            passengerArchiveList.appendChild(li);
        } else {
            passenger_archive.slice().reverse().forEach(order => { // reverse щоб нові були зверху
                // Шукаємо водія за ID
                const driver = drivers_database.find(d => d.id == order.driverId);
                const driverName = driver ? driver.name : 'Невідомий водій';
                const driverCar = driver ? driver.car : '';
                const driverRating = driver ? (driver.rating || 5.0).toFixed(1) : 'N/A';
                
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
                        <div class="driver-details">Водій: ${driverName}</div>
                    </div>
                    <button class="details-btn-arrow"><i class="fa-solid fa-circle-chevron-right"></i></button>
                `;
                li.addEventListener('click', () => {
                    document.getElementById('archived-details-date').textContent = new Date(order.id).toLocaleString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    document.getElementById('archived-details-from').textContent = order.from;
                    document.getElementById('archived-details-to').textContent = order.to;
                    document.getElementById('archived-details-price').textContent = `~ ${order.price || '---'} грн`; // Ціна поки динамічна
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

    // --- АРХІВ ВОДІЯ ---
    const driverArchiveList = document.querySelector('#driver-orders-screen .order-list.driver');
    if (driverArchiveList) {
        driverArchiveList.innerHTML = '';
        if (driver_archive.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = `<p class="list-placeholder" style="font-style: italic; text-align: center; color: var(--md-on-surface-variant);">Архів поїздок порожній.</p>`;
            driverArchiveList.appendChild(li);
        } else {
            driver_archive.slice().reverse().forEach(order => {
                const passenger = passengers_database.find(p => p.id == order.passengerId);
                const passengerName = passenger ? passenger.name : 'Невідомий пасажир';
                const passengerRating = passenger ? `${(passenger.rating || 5.0).toFixed(1)} <i class="fa-solid fa-star"></i>` : 'N/A';
                
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
    
    // Перевіряємо, чи є взагалі водії
    if (drivers_database.length === 0) {
        driverListContainer.innerHTML = '<p class="list-placeholder">Немає доступних водіїв.</p>';
        return;
    }

    drivers_database.forEach(driver => {
        // Можна додати фільтр: показувати тільки тих, хто "online" (якщо ми це реалізуємо в базі)
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
            navigateTo('passenger-full-profile-screen'); // Тут ми використовуємо універсальний екран профілю
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
            // Використовуємо == для безпеки (string vs number)
            const driver = drivers_database.find(d => d.id == offer.driverId);
            if (!driver) return;

            const li = document.createElement('li');
            li.className = 'driver-card online';

            // Безпечна перевірка рейтингу
            const rating = driver.rating ? driver.rating.toFixed(1) : '0.0';

            li.innerHTML = `
                <div class="avatar-convex"><i class="fa-solid fa-user-tie"></i></div>
                <div class="driver-info">
                    <h4>${driver.name}</h4>
                    <span>${rating} <i class="fa-solid fa-star"></i> • ${offer.direction}</span>
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
            // Використовуємо == для безпеки
            const passenger = passengers_database.find(p => p.id == request.passengerId);
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
