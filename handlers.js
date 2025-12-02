function selectOffer(offerId) {
    const offer = vh_offers_database.find(o => o.id === offerId);
    if (!offer) return;
    const driver = drivers_database.find(d => d.id === offer.driverId);
    if (!driver) return;

    // Створюємо сповіщення для водія
    const newNotification = {
        id: Date.now(),
        userId: offer.driverId,
        // Додаємо ID пасажира (поточного юзера), щоб водій знав, кого підтверджувати
        passengerId: currentUser.id, 
        text: `<strong>Нове замовлення!</strong> Пасажир хоче поїхати з вами за маршрутом <strong>${offer.direction}</strong>.`,
        type: 'new_order',
        isRead: false,
        offerId: offerId
    };
    notifications_database.push(newNotification);
    saveState(); // Зберігаємо в базу

    // Оновлюємо бейдж (хоча realtime listener це теж зробить)
    const notificationBadge = document.getElementById('driver-notification-badge');
    if (notificationBadge) {
        // Тут краще покладатись на listener, але для миттєвої реакції можна залишити
        notificationBadge.classList.remove('hidden');
    }

    alert(`Ваш запит надіслано водію ${driver.name}. Очікуйте на підтвердження.`);
    navigateTo('passenger-home-screen');
}

function handleNotificationInteraction(event) {
    const notificationCard = event.target.closest('.notification-card');
    // Отримуємо ID самого сповіщення, щоб дістати з нього дані
    const notificationId = notificationCard?.dataset.notificationId;
    
    if (!notificationId) return;

    // Знаходимо саме сповіщення в базі
    const notification = notifications_database.find(n => n.id == notificationId);
    if (!notification || !notification.offerId) return;

    const offer = vh_offers_database.find(o => o.id == notification.offerId);
    
    // Знаходимо реального пасажира за ID, який ми записали в selectOffer
    const passenger = passengers_database.find(p => p.id == notification.passengerId);
    
    if (!offer || !passenger) return;

    document.getElementById('vh-confirm-passenger-name').textContent = passenger.name;
    // Рейтинг пасажира (безпечна перевірка)
    const ratingHtml = passenger.rating ? `${passenger.rating.toFixed(1)} <i class="fa-solid fa-star"></i>` : 'Новий';
    const tripsHtml = passenger.trips ? ` • ${passenger.trips} поїздок` : '';
    document.getElementById('vh-confirm-passenger-rating').innerHTML = ratingHtml + tripsHtml;
    
    document.getElementById('vh-confirm-direction').textContent = offer.direction;
    document.getElementById('vh-confirm-specifics').textContent = `${offer.fromSpecific || 'Точка не вказана'} - ${offer.toSpecific || 'Точка не вказана'}`;
    document.getElementById('vh-confirm-time').textContent = offer.time;

    currentOfferIdForConfirmation = offer.id;
    navigateTo('driver-vh-confirmation-screen');
}

function showUserNotifications(userType) {
    if (!currentUser) return;
    
    const currentUserId = currentUser.id;
    const userNotifications = notifications_database.filter(n => n.userId === currentUserId);

    const backBtn = document.querySelector('#notifications-screen .btn-back');
    backBtn.dataset.target = (userType === 'driver') ? 'driver-home-screen' : 'passenger-home-screen';

    UI.displayNotifications(userNotifications, userType);

    const listContainer = document.getElementById('notification-list');
    // Видаляємо старий слухач, щоб не дублювались кліки
    listContainer.removeEventListener('click', handleNotificationInteraction);
    
    // Додаємо слухач тільки якщо це водій і йому треба реагувати на замовлення
    if (userType === 'driver') {
        listContainer.addEventListener('click', handleNotificationInteraction);
    }

    navigateTo('notifications-screen');
}

function updateAllDriverTripViews() {
    // Шукаємо активну поїздку саме для цього водія
    const trip = active_trips.find(t => t.driverId == currentUser.id);

    const homeMenuContainer = document.getElementById('driver-home-menu-container');
    const homeActiveTripContainer = document.getElementById('driver-home-active-trip-container');
    
    if (trip) {
        if (homeMenuContainer) homeMenuContainer.style.display = 'none';
        if (homeActiveTripContainer) {
            homeActiveTripContainer.style.display = 'block';
            homeActiveTripContainer.innerHTML = UI.createActiveTripCardHTML(trip, 'driver');
            const card = homeActiveTripContainer.querySelector('.order-card');
            if (card) {
                card.onclick = () => navigateTo('driver-orders-screen');
            }
        }
    } else {
        if (homeMenuContainer) homeMenuContainer.style.display = 'block';
        if (homeActiveTripContainer) homeActiveTripContainer.style.display = 'none';
    }

    const ordersActiveTripCard = document.getElementById('driver-active-trip-card');
    const noOrdersMsg = document.getElementById('no-active-driver-orders');

    if (ordersActiveTripCard && noOrdersMsg) {
        if (trip) {
            // Безпечне заповнення даних (перевіряємо чи є елементи)
            const elName = ordersActiveTripCard.querySelector('#driver-active-passenger-name');
            const elFrom = ordersActiveTripCard.querySelector('#driver-active-from-address');
            const elTo = ordersActiveTripCard.querySelector('#driver-active-to-address');

            if(elName) elName.textContent = trip.passengerName;
            
            // Обробка адреси (для таксі або міжміста)
            const fromAddr = trip.from || (trip.direction ? trip.direction.split(' - ')[0] : '???');
            const toAddr = trip.to || (trip.direction ? trip.direction.split(' - ')[1] : '???');
            
            if(elFrom) elFrom.textContent = fromAddr;
            if(elTo) elTo.textContent = toAddr;

            ordersActiveTripCard.onclick = () => {
                document.getElementById('details-active-passenger-name').textContent = trip.passengerName;
                document.getElementById('details-active-from-address').textContent = fromAddr;
                document.getElementById('details-active-to-address').textContent = toAddr;
                navigateTo('driver-active-trip-details-screen');
            };

            ordersActiveTripCard.style.display = 'block';
            noOrdersMsg.style.display = 'none';
        } else {
            ordersActiveTripCard.style.display = 'none';
            noOrdersMsg.style.display = 'block';
        }
    }
}

function setupSeatCounter(minusBtnId, plusBtnId, displayId, maxSeats = 4) {
    const minusBtn = document.getElementById(minusBtnId);
    const plusBtn = document.getElementById(plusBtnId);
    const display = document.getElementById(displayId);

    if (!minusBtn || !plusBtn || !display) return;

    let count = 1;
    function updateDisplay() {
        display.textContent = count;
        minusBtn.classList.toggle('disabled', count === 1);
        plusBtn.classList.toggle('disabled', count === maxSeats);
    }

    minusBtn.addEventListener('click', () => {
        if (count > 1) {
            count--;
            updateDisplay();
        }
    });
    plusBtn.addEventListener('click', () => {
        if (count < maxSeats) {
            count++;
            updateDisplay();
        }
    });
    updateDisplay();
}

function updateHomeScreenView(userType) {
    if (userType !== 'passenger' || !currentUser) return;

    // Шукаємо поїздку саме цього пасажира
    const trip = active_trips.find(t => t.passengerId == currentUser.id);
    
    const homeMenuContainer = document.getElementById('passenger-home-menu-container');
    const homeActiveTripContainer = document.getElementById('passenger-home-active-trip-container');

    if (trip) {
        if (homeMenuContainer) homeMenuContainer.style.display = 'none';
        if (homeActiveTripContainer) {
            homeActiveTripContainer.style.display = 'block';
            homeActiveTripContainer.innerHTML = UI.createActiveTripCardHTML(trip, 'passenger');
            const card = homeActiveTripContainer.querySelector('.order-card');
            if (card) {
                card.onclick = () => navigateTo('passenger-orders-screen');
            }
        }
    } else {
        if (homeMenuContainer) homeMenuContainer.style.display = 'block';
        if (homeActiveTripContainer) homeActiveTripContainer.style.display = 'none';
    }
}
