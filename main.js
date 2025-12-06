// main.js - Головний командний центр

// 1. Імпортуємо модулі
import { initApp, registerUser } from './auth.js';
import { initUIListeners, showScreen, navigateTo, UI } from './ui.js';
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
    
    // Водій: Перехід на повний профіль
    setupNav('show-full-driver-profile-btn', 'driver-full-profile-screen', () => {
         console.log("👤 Відкриваємо повний профіль водія...");
         if (state.currentUser) {
             UI.displayDriverFullProfile(state.currentUser.id);
         }
    });

    // Пасажир: Перехід на повний профіль
    setupNav('show-full-passenger-profile-btn', 'passenger-full-profile-screen', () => {
        console.log("👤 Відкриваємо повний профіль пасажира...");
        if (state.currentUser) {
            UI.displayPassengerProfile(state.currentUser.id); // Використовуємо універсальну функцію
        }
    });

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
            if (state.driverStatus === 'offline') {
                state.driverStatus = 'online';
                driverFabBtn.classList.add('is-online');
                driverFabBtn.classList.remove('is-pulsing');
                
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

    // --- ПОПАП ПРОФІЛЮ ---
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

    const popupOverlay = document.getElementById('popup-overlay');
    if (popupOverlay) popupOverlay.addEventListener('click', UI.hideProfilePopup);


    // --- КНОПКА "НАЗАД" ---
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target || 'home-screen';
            navigateTo(target);
        });
    });
// --- ТАБ-БАР ---
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const parentBar = tab.closest('.tab-bar');
            parentBar.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            
            const clickedTab = e.currentTarget;
            clickedTab.classList.add('active');

            if (clickedTab.classList.contains('fab')) return;

            const target = tab.dataset.target;
            if (target) {
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

    // --- ВИДАЛЕННЯ ПРОФІЛЮ (РЕАЛЬНЕ) ---
    const deleteBtns = ['show-driver-settings-delete-btn', 'show-passenger-settings-delete-btn'];
    
    deleteBtns.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', async () => {
                if (confirm("Ви точно хочете видалити свій профіль? Всі дані та рейтинг будуть втрачені назавжди.")) {
                    if (state.currentUser) {
                        try {
                            // Динамічно імпортуємо інструменти для видалення
                            const { ref, remove } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js");
                            const { db } = await import("./firebase-init.js");

                            // Видаляємо юзера з бази
                            await remove(ref(db, 'users/' + state.currentUser.id));
                            
                            alert("Ваш профіль успішно видалено.");
                            // Перезавантажуємо сторінку, щоб скинути стан додатку
                            window.location.reload(); 
                        } catch (error) {
                            console.error(error);
                            alert("Помилка видалення: " + error.message);
                        }
                    }
                }
            });
        }
    });
    
    // --- ДЗВІНОЧКИ (СПОВІЩЕННЯ) ---
    const notifBtns = [
        { btn: 'driver-notifications-btn-home', type: 'driver' },
        { btn: 'passenger-notifications-btn-home', type: 'passenger' },
    ];

    notifBtns.forEach(item => {
        const btnEl = document.getElementById(item.btn);
        if (btnEl) {
            btnEl.addEventListener('click', () => {
                // Приховуємо бейдж
                const badge = document.getElementById(`${item.type}-notification-badge-home`);
                if (badge) badge.classList.add('hidden');
                
                // Показуємо екран
                if (window.showUserNotifications) window.showUserNotifications(item.type);
                navigateTo('notifications-screen');
            });
        }
    });
    
    console.log("✅ Listeners initialized");
});

// Допоміжна функція для навігації
function setupNav(btnId, screenId, callback) {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('click', () => {
            if (callback) callback();
            navigateTo(screenId);
        });
    }
}