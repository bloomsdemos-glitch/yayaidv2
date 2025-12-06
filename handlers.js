import { db } from './firebase-init.js';
import { ref, update, set, push, child } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { state } from './state.js';
import { UI, navigateTo } from './ui.js';

// === ФУНКЦІЯ ЗБЕРЕЖЕННЯ (Синхронізація з Firebase) ===
function saveState() {
    // Оновлюємо активні поїздки
    const tripsObj = {};
    state.active_trips.forEach(t => tripsObj[t.id] = t);
    update(ref(db, 'active_trips'), tripsObj);

    // Оновлюємо сповіщення (тільки нові додаємо, але для спрощення поки так)
    state.notifications_database.forEach(n => {
        update(ref(db, 'notifications/' + n.id), n);
    });
    
    // В-Х пропозиції та запити
    const offersObj = {};
    state.vh_offers_database.forEach(o => offersObj[o.id] = o);
    set(ref(db, 'vh_offers'), offersObj);

    const requestsObj = {};
    state.vh_requests_database.forEach(r => requestsObj[r.id] = r);
    set(ref(db, 'vh_requests'), requestsObj);
    
    // Замовлення (таксі)
    const ordersObj = {};
    state.orders_database.forEach(o => ordersObj[o.id] = o);
    update(ref(db, 'orders'), ordersObj);
}

// === ОБРОБНИКИ ===

function selectOffer(offerId) {
    const offer = state.vh_offers_database.find(o => o.id == offerId); // == бо id може бути стрінгою
    if (!offer) return;
    
    const driver = state.drivers_database.find(d => d.id == offer.driverId);
    if (!driver) return;

    // Створюємо сповіщення
    const newNotification = {
        id: Date.now(),
        userId: offer.driverId,
        passengerId: state.currentUser.id,
        text: `<strong>Нове замовлення!</strong> Пасажир хоче поїхати з вами: <strong>${offer.direction}</strong>.`,
        type: 'new_order',
        isRead: false,
        offerId: offerId
    };
    state.notifications_database.push(newNotification);
    
    // Зберігаємо в базу
    update(ref(db, 'notifications/' + newNotification.id), newNotification);

    alert(`Запит надіслано водію ${driver.name}.`);
    navigateTo('passenger-home-screen');
}

function handleNotificationInteraction(event) {
    const notificationCard = event.target.closest('.notification-card');
    const notificationId = notificationCard?.dataset.notificationId;
    
    if (!notificationId) return;

    const notification = state.notifications_database.find(n => n.id == notificationId);
    if (!notification || !notification.offerId) return;

    const offer = state.vh_offers_database.find(o => o.id == notification.offerId);
    const passenger = state.passengers_database.find(p => p.id == notification.passengerId);
    
    if (!offer || !passenger) return;

    document.getElementById('vh-confirm-passenger-name').textContent = passenger.name;
    document.getElementById('vh-confirm-passenger-rating').textContent = `${passenger.rating || 5} ★`;
    document.getElementById('vh-confirm-direction').textContent = offer.direction;
    document.getElementById('vh-confirm-time').textContent = offer.time;

    state.currentOfferIdForConfirmation = offer.id;
    navigateTo('driver-vh-confirmation-screen');
}

function showUserNotifications(userType) {
    if (!state.currentUser) return;
    
    const userNotifications = state.notifications_database.filter(n => n.userId == state.currentUser.id);
    UI.displayNotifications(userNotifications, userType);

    const listContainer = document.getElementById('notification-list');
    
    // Перестворюємо елемент, щоб видалити старі слухачі
    const newList = listContainer.cloneNode(false);
    listContainer.parentNode.replaceChild(newList, listContainer);
    
    // Додаємо контент
    UI.displayNotifications(userNotifications, userType);
    
    // Додаємо слухач заново
    if (userType === 'driver') {
        document.getElementById('notification-list').addEventListener('click', handleNotificationInteraction);
    }
    
    navigateTo('notifications-screen');
}

function acceptOrderAction(order) {
    // Створення поїздки
    const newTaxiTrip = {
        id: Date.now(),
        driverId: state.currentUser.id,
        passengerId: order.passengerId,
        passengerName: order.passengerName,
        from: order.from,
        to: order.to,
        time: 'Зараз',
        status: 'in_progress',
        type: 'taxi'
    };
    
    state.active_trips.push(newTaxiTrip);
    
    // Видаляємо замовлення із загального списку
    const orderIndex = state.orders_database.indexOf(order);
    if (orderIndex > -1) state.orders_database.splice(orderIndex, 1);

    // Зберігаємо зміни
    saveState(); // Це оновить active_trips та orders в базі

    // Оновлюємо UI
    window.updateAllDriverTripViews();
    window.updateHomeScreenView('passenger'); // Умовно, бо це працює через listener в main.js
    
    navigateTo('driver-orders-screen');
    alert('Замовлення прийнято! Рушайте до пасажира.');
}

// Оновлення карток активної поїздки (викликається з main.js при змінах в базі)
function updateAllDriverTripViews() {
    if (!state.currentUser) return;
    const trip = state.active_trips.find(t => t.driverId == state.currentUser.id);

    const homeActive = document.getElementById('driver-home-active-trip-container');
    const homeMenu = document.getElementById('driver-home-menu-container');
    
    if (trip) {
        if(homeMenu) homeMenu.style.display = 'none';
        if(homeActive) {
            homeActive.style.display = 'block';
            homeActive.innerHTML = UI.createActiveTripCardHTML(trip, 'driver');
            homeActive.onclick = () => navigateTo('driver-orders-screen');
        }
    } else {
        if(homeMenu) homeMenu.style.display = 'block';
        if(homeActive) homeActive.style.display = 'none';
    }
    // Тут можна додати логіку для екрану замовлень (Orders Screen), але основне зроблено
}

function updateHomeScreenView(userType) {
    if (userType !== 'passenger' || !state.currentUser) return;
    const trip = state.active_trips.find(t => t.passengerId == state.currentUser.id);
    
    const homeActive = document.getElementById('passenger-home-active-trip-container');
    const homeMenu = document.getElementById('passenger-home-menu-container');

    if (trip) {
        if(homeMenu) homeMenu.style.display = 'none';
        if(homeActive) {
            homeActive.style.display = 'block';
            homeActive.innerHTML = UI.createActiveTripCardHTML(trip, 'passenger');
            homeActive.onclick = () => navigateTo('passenger-orders-screen');
        }
    } else {
        if(homeMenu) homeMenu.style.display = 'block';
        if(homeActive) homeActive.style.display = 'none';
    }
}

// === РОБИМО ГЛОБАЛЬНИМИ ===
window.selectOffer = selectOffer;
window.handleNotificationInteraction = handleNotificationInteraction;
window.showUserNotifications = showUserNotifications;
window.acceptOrderAction = acceptOrderAction;
window.updateAllDriverTripViews = updateAllDriverTripViews;
window.updateHomeScreenView = updateHomeScreenView;