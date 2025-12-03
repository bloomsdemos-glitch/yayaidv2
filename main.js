// main.js
import { initApp, registerUser } from './auth.js';
import { initUIListeners, showScreen, navigateTo } from './ui.js';
import { state } from './state.js';

// Запускаємо слухачі UI (анімації, теми)
initUIListeners();

// === ОБРОБНИКИ ГОЛОВНОГО ЕКРАНУ (Home Screen) ===

const btnShowDriverLogin = document.getElementById('show-driver-login');
const btnShowPassengerLogin = document.getElementById('show-passenger-login');

// Логіка змінилась: тепер ми не відкриваємо екран входу, 
// а зразу реєструємо/логінимо юзера з відповідною роллю.
// Бот вже дав нам номер, тому це безпечно.

if (btnShowDriverLogin) {
    btnShowDriverLogin.addEventListener('click', () => {
        console.log("🚕 Обрано роль: Водій");
        // Зразу пробуємо зареєструвати/увійти як водій
        registerUser('driver'); 
    });
}

if (btnShowPassengerLogin) {
    btnShowPassengerLogin.addEventListener('click', () => {
        console.log("🚶 Обрано роль: Пасажир");
        // Зразу пробуємо зареєструвати/увійти як пасажир
        registerUser('passenger');
    });
}

// === УНІВЕРСАЛЬНІ КНОПКИ ===

// Кнопки "Назад"
document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target; 
        if (targetId) {
            navigateTo(targetId);
        } else {
            showScreen('home-screen');
        }
    });
});

// === МЕНЮ ТА НАВІГАЦІЯ ===

// Тимчасові кнопки меню (для тестів переходів)
const menuButtons = {
    'show-find-passengers-btn': 'driver-find-passengers-screen',
    'show-driver-valky-kharkiv-btn': 'driver-valky-kharkiv-screen',
    'show-my-orders-btn': 'passenger-orders-screen',
    'show-quick-order-btn': 'quick-order-screen',
    'find-driver-btn': 'passenger-find-driver-screen',
    'show-passenger-valky-kharkiv-btn': 'passenger-valky-kharkiv-screen',
    'show-passenger-bus-schedule-btn': 'passenger-bus-schedule-screen'
};

Object.keys(menuButtons).forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('click', () => {
            navigateTo(menuButtons[btnId]);
        });
    }
});

// === ТАБ-БАР (Нижнє меню) ===

const allTabButtons = document.querySelectorAll('.tab-item');

allTabButtons.forEach(tab => {
    tab.addEventListener('click', (e) => {
        // 1. Забираємо активний клас у всіх кнопок
        allTabButtons.forEach(t => t.classList.remove('active'));
        
        // 2. Робимо активною натиснуту кнопку
        const clickedTab = e.currentTarget;
        clickedTab.classList.add('active');

        // 3. Перехід
        const targetScreenId = clickedTab.dataset.target;
        
        if (targetScreenId) {
            navigateTo(targetScreenId);
        } else {
            // Центральна кнопка (FAB)
            if (clickedTab.id === 'driver-fab-btn') {
                console.log("🚖 FAB Button Clicked (Створити поїздку)");
                // Тут буде логіка створення поїздки пізніше
                alert("Тут буде створення поїздки!"); 
            }
        }
    });
});
