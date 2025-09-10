document.addEventListener('DOMContentLoaded', () => {

    // == 1. ОСНОВНІ НАЛАШТУВАННЯ ==
    let rideState = 'idle';

    // == 2. ЗБІР ЕЛЕМЕНТІВ DOM ==
    const screens = document.querySelectorAll('.screen');
    const backButtons = document.querySelectorAll('.btn-back');
    // -- Навігація --
    const showDriverLoginBtn = document.getElementById('show-driver-login');
    const showPassengerLoginBtn = document.getElementById('show-passenger-login');
    const showMyOrdersBtn = document.getElementById('show-my-orders-btn');
    const findDriverBtn = document.getElementById('find-driver-btn');
    const showQuickOrderBtn = document.getElementById('show-quick-order-btn');
    const showHelpBtn = document.getElementById('show-help-btn');
    const showPassengerValkyKharkivBtn = document.getElementById('show-passenger-valky-kharkiv-btn');
    const showPassengerBusScheduleBtn = document.getElementById('show-passenger-bus-schedule-btn');
    const showPassengerProfileBtn = document.getElementById('show-passenger-profile-btn');
    const showPassengerSettingsBtn = document.getElementById('show-passenger-settings-btn');
    const goToMyOrdersBtn = document.getElementById('go-to-my-orders-btn');
    const showFindPassengersBtn = document.getElementById('show-find-passengers-btn');
    const driverTelegramLoginBtn = document.querySelector('#login-screen-driver .btn-telegram-login');
    const passengerTelegramLoginBtn = document.querySelector('#login-screen-passenger .btn-telegram-login');

    // Елементи водія
    const showDriverOrdersBtn = document.getElementById('show-driver-orders-btn');
    const showDriverValkyKharkivBtn = document.getElementById('show-driver-valky-kharkiv-btn');
    const showDriverRatingBtn = document.getElementById('show-driver-rating-btn');
    const showDriverSettingsBtn = document.getElementById('show-driver-settings-btn');
    const acceptOrderBtn = document.getElementById('accept-order-btn');
    const tripDistanceEl = document.getElementById('trip-distance');
    const tripFareEl = document.getElementById('trip-fare');
    const paymentMethodEl = document.getElementById('payment-method');
    const cancelRideBtn = document.getElementById('cancel-ride-btn');
    const rideActionBtn = document.getElementById('ride-action-btn');
    const rideStatusHeader = document.getElementById('ride-status-header');
    const rideMapPlaceholder = document.getElementById('ride-map-placeholder')?.querySelector('p');
    const rideAddressDetails = document.getElementById('ride-address-details');

    // -- Елементи екрану налаштувань водія --
    const showDriverSettingsPhotoBtn = document.getElementById('show-driver-settings-photo-btn');
    const showDriverSettingsBioBtn = document.getElementById('show-driver-settings-bio-btn');
    const showDriverSettingsTariffBtn = document.getElementById('show-driver-settings-tariff-btn');
    const showDriverSettingsPaymentBtn = document.getElementById('show-driver-settings-payment-btn');
    const showDriverSettingsHistoryBtn = document.getElementById('show-driver-settings-history-btn');
    const showDriverSettingsPhoneBtn = document.getElementById('show-driver-settings-phone-btn');
    const showDriverSettingsHelpBtn = document.getElementById('show-driver-settings-help-btn');
    const showDriverSettingsSupportBtn = document.getElementById('show-driver-settings-support-btn');
    const showDriverSettingsDeleteBtn = document.getElementById('show-driver-settings-delete-btn');


    // == 3. ОСНОВНІ ФУНКЦІЇ ==

    function showScreen(screenId) {
        if (window.tripInterval) clearInterval(window.tripInterval);

        screens.forEach(screen => {
            screen.classList.add('hidden');
            screen.classList.remove('active');
        });
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            activeScreen.classList.remove('hidden');
            activeScreen.classList.add('active');
        }
    }


    function runActiveTripSimulation() {
        if (window.tripInterval) clearInterval(window.tripInterval);
        const activeCard = document.querySelector('#passenger-orders-screen .order-card.active');
        if (!activeCard) return;
        const statusIcon = activeCard.querySelector('#status-icon');
        const statusText = activeCard.querySelector('#status-text');
        const carIcon = activeCard.querySelector('#car-icon');
        const dotsContainer = activeCard.querySelector('.dots-container');
        const endPoint = activeCard.querySelector('#progress-end-point');
        const totalDurationSeconds = 15, totalDots = 18; let progress = 0;
        statusIcon.className = 'fa-solid fa-spinner fa-spin'; statusText.textContent = 'Водій прямує до вас';
        endPoint.className = 'fa-solid fa-circle-dot progress-end-point'; endPoint.classList.remove('arrived');
        carIcon.style.left = '0%';
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalDots; i++) { const dot = document.createElement('div'); dot.className = 'dot'; dotsContainer.appendChild(dot); }
        const allDots = dotsContainer.querySelectorAll('.dot');
        window.tripInterval = setInterval(() => {
            progress += (100 / (totalDurationSeconds * 2));
            if (progress >= 100) {
                clearInterval(window.tripInterval); carIcon.style.left = '100%';
                allDots.forEach(d => d.classList.add('passed'));
                statusIcon.className = 'fa-solid fa-circle-check arrived'; statusText.textContent = 'Водій прибув';
                endPoint.className = 'fa-solid fa-location-pin progress-end-point arrived';
                return;
            }
            carIcon.style.left = `${progress}%`;
            const passedDotsCount = Math.floor(allDots.length * (progress / 100));
            allDots.forEach((dot, index) => { dot.classList[index < passedDotsCount ? 'add' : 'remove']('passed'); });
        }, 500);
    }
    
    function updatePassengerOrderCardListeners() {
        document.querySelectorAll('#passenger-orders-screen .details-btn-arrow').forEach(button => {
            button.addEventListener('click', () => showScreen('passenger-order-details-screen'));
        });
    }

// == 4. ЛОГІКА ДЛЯ ЕКРАНУ "ШВИДКЕ ЗАМОВЛЕННЯ" (ФАЗА 3) ==

    const quickOrderForm = document.getElementById('quick-order-form');
    const timeOptionButtons = document.querySelectorAll('.btn-segment[data-time-option]');
    const nowTimeBlock = document.getElementById('now-time-block');
    const laterOptionsContainer = document.getElementById('later-options-container');
    const dateTiles = document.querySelectorAll('.date-tile');
    const scheduleConfirmBlock = document.getElementById('schedule-confirm-block');
    const scheduleResultText = document.getElementById('schedule-result-text');
    const fromAddressInput = document.getElementById('from-address');
    const toAddressInput = document.getElementById('to-address');
    const submitOrderBtn = document.getElementById('submit-order-btn');

    // Функція, що перевіряє, чи заповнені поля "Звідки" і "Куди"
    function checkFormCompleteness() {
        const isAddressFilled = fromAddressInput.value.trim() !== '' && toAddressInput.value.trim() !== '';
        if (isAddressFilled) {
            submitOrderBtn.classList.remove('disabled');
        } else {
            submitOrderBtn.classList.add('disabled');
        }
    }

    // Функція, що оновлює годинник і перевіряє форму при відкритті екрану
    function initQuickOrderScreen() {
        const hoursEl = document.getElementById('time-display-hours');
        const minutesEl = document.getElementById('time-display-minutes');
        
        function updateClock() {
            if (hoursEl && minutesEl) {
                const now = new Date();
                hoursEl.textContent = now.getHours().toString().padStart(2, '0');
                minutesEl.textContent = now.getMinutes().toString().padStart(2, '0');
            }
        }
        updateClock(); // Оновлюємо одразу
        setInterval(updateClock, 10000); // і потім кожні 10 секунд
        
        checkFormCompleteness();
    }

    // Обробник для кнопок "Зараз" / "На інший час"
    timeOptionButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeOptionButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Скидаємо вибір дати, якщо користувач переключається
            scheduleConfirmBlock.classList.add('hidden');
            dateTiles.forEach(t => t.classList.remove('active'));

            if (button.dataset.timeOption === 'later') {
                laterOptionsContainer.classList.remove('hidden');
                nowTimeBlock.classList.add('hidden');
            } else {
                laterOptionsContainer.classList.add('hidden');
                nowTimeBlock.classList.remove('hidden');
            }
        });
    });

    // Обробник для плиток "Сьогодні" / "Дата"
    dateTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            // Якщо клікаємо по вже активній плитці - нічого не робимо
            if(tile.classList.contains('active')) return;

            dateTiles.forEach(t => t.classList.remove('active'));
            tile.classList.add('active');

            // Якщо це кнопка "Дата", поки що просто підсвічуємо її.
            // В майбутньому тут буде відкриття календаря.
            if (tile.dataset.schedule === 'date') {
                 scheduleConfirmBlock.classList.add('hidden');
                 // Тут можна додати alert('Календар в розробці :)');
                return; 
            }
            
            // Якщо це кнопка "Сьогодні" - показуємо блок підтвердження
            if (tile.dataset.schedule === 'today') {
                scheduleConfirmBlock.classList.remove('hidden');
                const now = new Date();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                scheduleResultText.textContent = `Сьогодні • ${hours}:${minutes}`;
            }
        });
    });

    // Обробники для полів вводу
    [fromAddressInput, toAddressInput].forEach(input => {
        input.addEventListener('input', checkFormCompleteness);
    });


    quickOrderForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!submitOrderBtn.classList.contains('disabled')) {
            showScreen('order-confirmation-screen');
        }
    });

// == 5. ГОЛОВНІ ОБРОБНИКИ ПОДІЙ ==

// Універсальна функція для плавного переходу
function navigateTo(screenId) {
    setTimeout(() => {
        showScreen(screenId);
    }, 250); // Чекаємо 250 мілісекунд (0.25с) перед переходом
}

// --- Навігація з головного екрану та екранів входу ---
showDriverLoginBtn?.addEventListener('click', () => navigateTo('login-screen-driver'));
showPassengerLoginBtn?.addEventListener('click', () => navigateTo('login-screen-passenger'));
driverTelegramLoginBtn?.addEventListener('click', () => navigateTo('driver-dashboard'));
passengerTelegramLoginBtn?.addEventListener('click', () => navigateTo('passenger-dashboard'));

// --- Навігація з меню ПАСАЖИРА ---
showMyOrdersBtn?.addEventListener('click', () => {
    // Для цього екрану симуляція має запускатись ПІСЛЯ переходу
    setTimeout(() => {
        showScreen('passenger-orders-screen');
        runActiveTripSimulation();
        updatePassengerOrderCardListeners();
    }, 250);
});
showQuickOrderBtn?.addEventListener('click', () => {
    setTimeout(() => {
        showScreen('quick-order-screen');
        initQuickOrderScreen();
    }, 250);
});
findDriverBtn?.addEventListener('click', () => navigateTo('passenger-find-driver-screen'));
showHelpBtn?.addEventListener('click', () => navigateTo('help-screen'));
showPassengerValkyKharkivBtn?.addEventListener('click', () => navigateTo('passenger-valky-kharkiv-screen'));
showPassengerBusScheduleBtn?.addEventListener('click', () => navigateTo('passenger-bus-schedule-screen'));
showPassengerProfileBtn?.addEventListener('click', () => navigateTo('passenger-profile-screen'));
showPassengerSettingsBtn?.addEventListener('click', () => navigateTo('passenger-settings-screen'));

// --- Навігація з меню ВОДІЯ ---
showFindPassengersBtn?.addEventListener('click', () => navigateTo('driver-find-passengers-screen'));
showDriverOrdersBtn?.addEventListener('click', () => navigateTo('driver-orders-screen'));
showDriverValkyKharkivBtn?.addEventListener('click', () => navigateTo('driver-valky-kharkiv-screen'));
showDriverRatingBtn?.addEventListener('click', () => navigateTo('driver-rating-screen'));
showDriverSettingsBtn?.addEventListener('click', () => navigateTo('driver-settings-screen'));

// --- Навігація з екрану налаштувань ВОДІЯ ---
showDriverSettingsPhotoBtn?.addEventListener('click', () => navigateTo('driver-settings-photo-screen'));
showDriverSettingsBioBtn?.addEventListener('click', () => navigateTo('driver-settings-bio-screen'));
showDriverSettingsTariffBtn?.addEventListener('click', () => navigateTo('driver-settings-tariff-screen'));
showDriverSettingsPaymentBtn?.addEventListener('click', () => navigateTo('driver-settings-payment-screen'));
showDriverSettingsHistoryBtn?.addEventListener('click', () => navigateTo('driver-settings-history-screen'));
showDriverSettingsPhoneBtn?.addEventListener('click', () => navigateTo('driver-settings-phone-screen'));
showDriverSettingsHelpBtn?.addEventListener('click', () => navigateTo('driver-settings-help-screen'));
showDriverSettingsSupportBtn?.addEventListener('click', () => navigateTo('driver-settings-support-screen'));
showDriverSettingsDeleteBtn?.addEventListener('click', () => navigateTo('driver-settings-delete-screen'));

// --- Інші обробники ---
acceptOrderBtn?.addEventListener('click', () => {
    setTimeout(() => {
        setupActiveRide();
        showScreen('driver-active-ride-screen');
    }, 250);
});
cancelRideBtn?.addEventListener('click', () => {
    if (confirm('Скасувати поїздку? Це може вплинути на ваш рейтинг.')) {
        navigateTo('driver-dashboard');
    }
});
rideActionBtn?.addEventListener('click', handleRideAction);
goToMyOrdersBtn?.addEventListener('click', () => showMyOrdersBtn.click());

// --- Універсальна кнопка "Назад" ---
backButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Кнопка "назад" має працювати миттєво, без затримки
        showScreen(button.dataset.target || 'home-screen');
    });
}); // <--- ОСЬ ТУТ ДОДАНО ВІДСУТНЄ ЗАКРИТТЯ

// === ЛОГІКА ПЕРЕМИКАННЯ ТЕМ ===
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    const themeCheckbox = themeToggle.querySelector('.toggle-checkbox');
    const body = document.body;

    function switchTheme(e) {
        if (e.target.checked) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        }
    }

    if (body.classList.contains('dark-theme')) {
        themeCheckbox.checked = true;
    }
    themeCheckbox.addEventListener('change', switchTheme);
}

// === ЛОГІКА ДЛЯ RIPPLE EFFECT ===
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const existingRipple = button.querySelector(".ripple");
    if (existingRipple) {
        existingRipple.remove();
    }
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - (button.getBoundingClientRect().left + radius)}px`;
    circle.style.top = `${event.clientY - (button.getBoundingClientRect().top + radius)}px`;
    circle.classList.add("ripple");
    
    button.appendChild(circle);
}

const buttonsWithRipple = document.querySelectorAll(".btn-main, .menu-item");
buttonsWithRipple.forEach(button => {
    button.addEventListener("click", createRipple);
}); // <--- ЦИКЛ ДЛЯ КНОПОК ТЕПЕР ЗАКРИВАЄТЬСЯ ТУТ

// === ЛОГІКА ЗМІНИ ІКОНОК ПІНІВ (винесена назовні) ===
const pin1 = document.getElementById('pin1');
const pin2 = document.getElementById('pin2');
const pathDots = document.querySelector('.path-dots');

if (pin1 && pin2 && pathDots) {
    function swapPinIcons() {
        const isPin1Dot = pin1.classList.contains('fa-circle-dot');
        if (isPin1Dot) {
            pin1.classList.remove('fa-circle-dot');
            pin1.classList.add('fa-location-dot');
            pin2.classList.remove('fa-location-dot');
            pin2.classList.add('fa-circle-dot');
        } else {
            pin1.classList.remove('fa-location-dot');
            pin1.classList.add('fa-circle-dot');
            pin2.classList.remove('fa-circle-dot');
            pin2.classList.add('fa-location-dot');
        }
    }
    pathDots.addEventListener('animationiteration', swapPinIcons);
}

}); // <--- А ЦЕЙ РЯДОК ЗАКРИВАЄ ГОЛОВНИЙ DOMContentLoaded
