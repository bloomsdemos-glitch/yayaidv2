// main.js
import { initApp, registerUser } from './auth.js';
import { initUIListeners, showScreen, navigateTo } from './ui.js';
import { state } from './state.js';

// Запускаємо слухачі UI (анімації, теми)
initUIListeners();

// === ОБРОБНИКИ КНОПОК ВХОДУ (Entry Screens) ===

// 1. Головний екран -> Вибір ролі
const btnShowDriverLogin = document.getElementById('show-driver-login');
const btnShowPassengerLogin = document.getElementById('show-passenger-login');

if (btnShowDriverLogin) {
    btnShowDriverLogin.addEventListener('click', () => {
        showScreen('login-screen-driver');
    });
}

if (btnShowPassengerLogin) {
    btnShowPassengerLogin.addEventListener('click', () => {
        showScreen('login-screen-passenger');
    });
}

// 2. Кнопки "Назад" (універсальні)
document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target; // Наприклад data-target="home-screen"
        if (targetId) {
            navigateTo(targetId);
        } else {
            // Якщо не вказано куди, повертаємо на Home
            showScreen('home-screen');
        }
    });
});

// 3. Кнопки "Увійти через Telegram"
// Для водія:
const btnLoginDriver = document.querySelector('#login-screen-driver .btn-telegram-login');
if (btnLoginDriver) {
    btnLoginDriver.addEventListener('click', () => {
        registerUser('driver');
    });
}

// Для пасажира:
const btnLoginPassenger = document.querySelector('#login-screen-passenger .btn-telegram-login');
if (btnLoginPassenger) {
    btnLoginPassenger.addEventListener('click', () => {
        registerUser('passenger');
    });
}

// 4. Тимчасові кнопки меню (Тільки перемикання екранів)
// Це щоб ти міг ходити по меню, навіть якщо логіки ще немає
const menuButtons = {
    'show-find-passengers-btn': 'driver-find-passengers-screen', // Цього екрану може не бути в HTML, перевір ID
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
            // Тут пізніше додамо перевірки, чи можна відкривати
            navigateTo(menuButtons[btnId]);
        });
    }
});

// =========================================================
// ЛОГІКА ТАБ-БАРУ (НИЖНЄ МЕНЮ)
// =========================================================
const allTabButtons = document.querySelectorAll('.tab-item');

allTabButtons.forEach(tab => {
    tab.addEventListener('click', (e) => {
        // 1. Забираємо активний клас у всіх кнопок
        allTabButtons.forEach(t => t.classList.remove('active'));
        
        // 2. Робимо активною натиснуту кнопку (через currentTarget, щоб зловити клік по іконці теж)
        const clickedTab = e.currentTarget;
        clickedTab.classList.add('active');

        // 3. Дивимось, куди вона має вести
        const targetScreenId = clickedTab.dataset.target;
        
        if (targetScreenId) {
            console.log(`🔘 Tab Clicked: Go to ${targetScreenId}`);
            navigateTo(targetScreenId);
        } else {
            console.warn("⚠️ Кнопка меню не має data-target!");
            // Тимчасовий фікс для центральної кнопки водія (якщо вона без target)
            if (clickedTab.id === 'driver-fab-btn') {
                console.log("Fab button clicked");
                // Тут можна викликати логіку створення поїздки
            }
        }
    });
});
