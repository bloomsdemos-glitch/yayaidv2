// main.js - Головний командний центр

// 1. Імпортуємо модулі
import { initApp, registerUser } from './auth.js';
import { initUIListeners, showScreen, navigateTo, UI } from './ui.js'; // Додали UI в імпорт
import { state } from './state.js';

// 2. Імпортуємо логіку та обробники
import './displayLogic.js';
import './handlers.js';

// 3. Робимо важливі функції глобальними
window.showScreen = showScreen;
window.navigateTo = navigateTo;
window.registerUser = registerUser;

// === ЗАПУСК ДОДАТКУ ===
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 App Starting...");
    
    // Ініціалізація UI
    initUIListeners();
    
    // Запуск авторизації
    initApp();

    // === СЛУХАЧІ ПОДІЙ (Event Listeners) ===
    
    // Кнопки входу
    const btnDriver = document.getElementById('show-driver-login');
    const btnPassenger = document.getElementById('show-passenger-login');

    if (btnDriver) btnDriver.addEventListener('click', () => registerUser('driver'));
    if (btnPassenger) btnPassenger.addEventListener('click', () => registerUser('passenger'));

    // --- МЕНЮ ПАСАЖИРА ---
    setupNav('show-my-orders-btn', 'passenger-orders-screen', () => {
        if(window.displayArchives) window.displayArchives();
    });
    setupNav('find-driver-btn', 'passenger-find-driver-screen', () => {
        if(window.displayAvailableDrivers) window.displayAvailableDrivers();
    });
    setupNav('show-quick-order-btn', 'quick-order-screen', () => {
        if(window.UI && UI.resetQuickOrder) UI.resetQuickOrder();
    });
    setupNav('show-passenger-valky-kharkiv-btn', 'passenger-valky-kharkiv-screen', () => {
        if(window.displayVhOffers) window.displayVhOffers();
    });
    setupNav('show-passenger-bus-schedule-btn', 'passenger-bus-schedule-screen');

    // --- МЕНЮ ВОДІЯ ---
    setupNav('show-driver-orders-btn', 'driver-orders-screen', () => {
        if(window.displayArchives) window.displayArchives();
    });
    setupNav('show-find-passengers-btn', 'driver-find-passengers-screen', () => {
        if(window.displayDriverOrders) window.displayDriverOrders();
    });
    setupNav('show-driver-valky-kharkiv-btn', 'driver-valky-kharkiv-screen', () => {
        if(window.displayVhRequests) window.displayVhRequests();
    });

    // --- КНОПКИ ПРОФІЛЮ ТА НАЛАШТУВАНЬ ---
    
    // Водій
    setupNav('show-full-driver-profile-btn', 'driver-full-profile-screen', () => {
         if (state.currentUser) UI.displayDriverFullProfile(state.currentUser.id);
    });
    setupNav('show-driver-settings-btn-from-profile', 'driver-settings-screen');
    setupNav('show-driver-help-btn-from-profile', 'driver-help-screen');
    setupNav('show-driver-support-btn-from-profile', 'driver-support-screen');
    
    // Пасажир
    setupNav('show-full-passenger-profile-btn', 'passenger-full-profile-screen', () => {
        // Тут можна додати displayPassengerFullProfile, якщо буде готова
    });
    setupNav('show-passenger-settings-btn-from-profile', 'passenger-settings-screen');
    setupNav('show-help-btn-from-profile', 'help-screen');
    setupNav('show-passenger-support-btn-from-profile', 'passenger-support-screen');

    // Внутрішні налаштування (Водій)
    setupNav('show-driver-settings-photo-btn', 'driver-settings-photo-screen');
    setupNav('show-driver-settings-bio-btn', 'driver-settings-bio-screen');
    setupNav('show-driver-settings-tariff-btn', 'driver-settings-tariff-screen');
    setupNav('show-driver-settings-schedule-btn', 'driver-settings-schedule-screen', () => {
         if(window.UI.renderScheduleEditor) window.UI.renderScheduleEditor();
    });
    setupNav('show-driver-settings-routes-btn', 'driver-settings-routes-screen', () => {
        if(window.UI.renderPlannedRoutesEditor) window.UI.renderPlannedRoutesEditor();
    });

    // Внутрішні налаштування (Пасажир)
    setupNav('show-passenger-settings-photo-btn', 'passenger-settings-photo-screen');
    setupNav('show-passenger-settings-bio-btn', 'passenger-settings-bio-screen');


    // --- FAB КНОПКА ВОДІЯ ---
    const driverFabBtn = document.getElementById('driver-fab-btn');
    if (driverFabBtn) {
        driverFabBtn.addEventListener('click', () => {
            // Перевіряємо статус з state
            if (state.driverStatus === 'offline') {
                state.driverStatus = 'online';
                // Візуальні зміни
                driverFabBtn.classList.add('is-online');
                driverFabBtn.classList.remove('is-pulsing');
                
                // Оновлюємо індикатор в хедері
                const statusInd = document.getElementById('driver-status-indicator-home');
                if(statusInd) {
                    statusInd.style.display = 'flex';
                    statusInd.classList.remove('offline');
                    statusInd.classList.add('online');
                    statusInd.querySelector('.status-text').textContent = 'Онлайн';
                }
            } else {
                navigateTo('driver-create-choice-screen');
            }
        });
    }

    // --- ПОПАП ПРОФІЛЮ (клік на аватарку в хедері) ---
    const profileBadges = document.querySelectorAll('.profile-badge');
    profileBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            if (!state.currentUser) return;
            
            const userData = {
                icon: state.currentUser.role === 'driver' ? 'fa-solid fa-user-tie' : 'fa-solid fa-user',
                name: state.currentUser.name,
                details: state.currentUser.role === 'driver' 
                    ? `${state.currentUser.rating ? state.currentUser.rating.toFixed(1) : 5.0} ★ • ${state.currentUser.trips} поїздок`
                    : `${state.currentUser.trips} поїздок`
            };
            
            UI.showProfilePopup(userData);

            const viewProfileBtn = document.getElementById('popup-view-profile-btn');
            if(viewProfileBtn) {
                viewProfileBtn.onclick = () => {
                    UI.hideProfilePopup();
                    if (state.currentUser.role === 'driver') {
                        UI.displayDriverProfile(state.currentUser.id);
                        navigateTo('driver-profile-screen');
                    } else {
                        UI.displayPassengerProfile(state.currentUser.id);
                        navigateTo('passenger-profile-screen');
                    }
                };
            }
        });
    });

    // Закриття попапа
    const popupOverlay = document.getElementById('popup-overlay');
    if (popupOverlay) popupOverlay.addEventListener('click', UI.hideProfilePopup);


    // --- КНОПКА "НАЗАД" ---
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target || 'home-screen';
            navigateTo(target);
        });
    });

    // --- ТАБ-БАР (Розумна навігація) ---
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const parentBar = tab.closest('.tab-bar');
            parentBar.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            
            const clickedTab = e.currentTarget;
            clickedTab.classList.add('active');

            // Якщо це FAB - виходимо, бо у неї свій слухач вище
            if (clickedTab.classList.contains('fab')) return;

            const target = tab.dataset.target;
            if (target) {
                // Оновлюємо дані перед переходом
                if (state.currentUser) {
                    if (target === 'driver-profile-screen') UI.displayDriverProfile(state.currentUser.id);
                    if (target === 'passenger-profile-screen') UI.displayPassengerProfile(state.currentUser.id);
                }
                
                if (target === 'passenger-find-driver-screen' && window.displayAvailableDrivers) window.displayAvailableDrivers();
                if (target === 'driver-find-passengers-screen' && window.displayDriverOrders) window.displayDriverOrders();
                if (target === 'driver-valky-kharkiv-screen' && window.displayVhRequests) window.displayVhRequests();
                if (target === 'passenger-valky-kharkiv-screen' && window.displayVhOffers) window.displayVhOffers();

                navigateTo(target);
            }
        });
    });
    
    console.log("✅ Listen