function selectOffer(offerId) {
    const offer = vh_offers_database.find(o => o.id === offerId);
    if (!offer) return;
    const driver = drivers_database.find(d => d.id === offer.driverId);
    if (!driver) return;

    const newNotification = {
        id: Date.now(),
        userId: offer.driverId,
        text: `<strong>Нове замовлення!</strong> Пасажир хоче поїхати з вами за маршрутом <strong>${offer.direction}</strong>.`,
        type: 'new_order',
        isRead: false,
        offerId: offerId
    };
    notifications_database.push(newNotification);

    const notificationBadge = document.getElementById('driver-notification-badge');
    if (notificationBadge) {
        const unreadCount = notifications_database.filter(n => !n.isRead).length;
        notificationBadge.textContent = unreadCount;
        notificationBadge.classList.remove('hidden');
    }

    alert(`Ваш запит надіслано водію ${driver.name}. Очікуйте на підтвердження.`);
    navigateTo('passenger-home-screen');
}

function handleNotificationInteraction(event) {
    const notificationCard = event.target.closest('.notification-card');
    const offerId = notificationCard?.dataset.offerId;

    if (!offerId) return;

    const offer = vh_offers_database.find(o => o.id == offerId);
    const passenger = passengers_database.find(p => p.id === 1);
    if (!offer || !passenger) return;

    document.getElementById('vh-confirm-passenger-name').textContent = passenger.name;
    document.getElementById('vh-confirm-passenger-rating').innerHTML = `4.8 <i class="fa-solid fa-star"></i> • 27 поїздок`;
    document.getElementById('vh-confirm-direction').textContent = offer.direction;
    document.getElementById('vh-confirm-specifics').textContent = `${offer.fromSpecific || 'Точка не вказана'} - ${offer.toSpecific || 'Точка не вказана'}`;
    document.getElementById('vh-confirm-time').textContent = offer.time;

    currentOfferIdForConfirmation = offer.id;
    navigateTo('driver-vh-confirmation-screen');
}

function showUserNotifications(userType) {
    const currentUserId = (userType === 'driver') ? 1 : 1;
    const userNotifications = notifications_database.filter(n => n.userId === currentUserId);

    const backBtn = document.querySelector('#notifications-screen .btn-back');
    backBtn.dataset.target = (userType === 'driver') ? 'driver-home-screen' : 'passenger-home-screen';

    UI.displayNotifications(userNotifications, userType);

    const listContainer = document.getElementById('notification-list');
    listContainer.removeEventListener('click', handleNotificationInteraction);
    if (userType === 'driver') {
        listContainer.addEventListener('click', handleNotificationInteraction);
    }

    navigateTo('notifications-screen');
}

function updateAllDriverTripViews() {
    const trip = active_trips.length > 0 ? active_trips[0] : null;

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
            ordersActiveTripCard.querySelector('#driver-active-passenger-name').textContent = trip.passengerName;
            ordersActiveTripCard.querySelector('#driver-active-from-address').textContent = trip.from || trip.direction.split(' - ')[0];
            ordersActiveTripCard.querySelector('#driver-active-to-address').textContent = trip.to || trip.direction.split(' - ')[1];
            ordersActiveTripCard.onclick = () => {
                document.getElementById('details-active-passenger-name').textContent = trip.passengerName;
                document.getElementById('details-active-from-address').textContent = trip.from || trip.direction.split(' - ')[0];
                document.getElementById('details-active-to-address').textContent = trip.to || trip.direction.split(' - ')[1];
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
    if (userType !== 'passenger') return;

    const trip = active_trips.length > 0 ? active_trips[0] : null;
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

