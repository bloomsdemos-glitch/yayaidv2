// main.js - Головний командний центр

// 1. Імпортуємо модулі
import { initApp, registerUser } from './auth.js';
import { initUIListeners, showScreen, navigateTo } from './ui.js';
import { state } from './state.js';

// 2. Імпортуємо логіку та обробники (ВАЖЛИВО: ці файли мають бути адаптовані)
// Ми просто імпортуємо їх, щоб код всередині виконався і функції стали доступними
import './displayLogic.js';
import './handlers.js';

// 3. Робимо важливі функції глобальними (щоб HTML міг їх бачити через onclick)
// Якщо функції в інших файлах не прикріплені до window, вони не спрацюють.
// Але поки що сподіваємось, що ми це виправимо в наступних кроках.
window.showScreen = showScreen;
window.navigateTo = navigateTo;
window.registerUser = registerUser;

// === ЗАПУСК ДОДАТКУ ===
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 App Starting...");
    
    // Ініціалізація UI (анімації, теми)
    initUIListeners();
    
    // Запуск авторизації (перевірка Telegram)
    initApp();

    // === СЛУХАЧІ ПОДІЙ (Event Listeners) ===
    
    // Кнопки входу (якщо юзер ще не залогінений)
    const btnDriver = document.getElementById('show-driver-login');
    const btnPassenger = document.getElementById('show-passenger-login');

    if (btnDriver) btnDriver.addEventListener('click', () => registerUser('driver'));
    if (btnPassenger) btnPassenger.addEventListener('click', () => registerUser('passenger'));

    // Кнопки меню Пасажира
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

    // Кнопки меню Водія
    setupNav('show-driver-orders-btn', 'driver-orders-screen', () => {
        if(window.displayArchives) window.displayArchives();
    });
    setupNav('show-find-passengers-btn', 'driver-find-passengers-screen', () => {
        if(window.displayDriverOrders) window.displayDriverOrders();
    });
    setupNav('show-driver-valky-kharkiv-btn', 'driver-valky-kharkiv-screen', () => {
        if(window.displayVhRequests) window.displayVhRequests();
    });

    // Універсальна кнопка "Назад"
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target || 'home-screen';
            // Якщо ми у швидкому замовленні - там своя логіка кроків, 
            // але поки просто повертаємось
            navigateTo(target);
        });
    });

    // Таб-бар навігація
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Прибираємо активність у всіх
            const parentBar = tab.closest('.tab-bar');
            parentBar.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
            
            // Ставимо активність собі
            e.currentTarget.classList.add('active');

            const target = tab.dataset.target;
            if (target) {
                navigateTo(target);
                // Оновлюємо дані при переході, якщо треба
                if (target === 'passenger-find-driver-screen' && window.displayAvailableDrivers) window.displayAvailableDrivers();
                if (target === 'driver-find-passengers-screen' && window.displayDriverOrders) window.displayDriverOrders();
            }
        });
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