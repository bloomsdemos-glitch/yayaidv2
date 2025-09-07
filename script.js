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
    const goToMyOrdersBtn = document.getElementById('go-to-my-orders-btn');
    const showFindPassengersBtn = document.getElementById('show-find-passengers-btn');
    const driverTelegramLoginBtn = document.querySelector('#login-screen-driver .btn-telegram-login');
    const passengerTelegramLoginBtn = document.querySelector('#login-screen-passenger .btn-telegram-login');

    // Елементи водія
    const showDriverOrdersBtn = document.getElementById('show-driver-orders-btn');
    const acceptOrderBtn = document.getElementById('accept-order-btn');
    const tripDistanceEl = document.getElementById('trip-distance');
    const tripFareEl = document.getElementById('trip-fare');
    const paymentMethodEl = document.getElementById('payment-method');
    const cancelRideBtn = document.getElementById('cancel-ride-btn');
    const rideActionBtn = document.getElementById('ride-action-btn');
    const rideStatusHeader = document.getElementById('ride-status-header');
    const rideMapPlaceholder = document.getElementById('ride-map-placeholder')?.querySelector('p');
    const rideAddressDetails = document.getElementById('ride-address-details');

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
    showDriverLoginBtn?.addEventListener('click', () => showScreen('login-screen-driver'));
    showPassengerLoginBtn?.addEventListener('click', () => showScreen('login-screen-passenger'));
    driverTelegramLoginBtn?.addEventListener('click', () => showScreen('driver-dashboard'));
    passengerTelegramLoginBtn?.addEventListener('click', () => showScreen('passenger-dashboard'));

    showMyOrdersBtn?.addEventListener('click', () => {
        showScreen('passenger-orders-screen');
        runActiveTripSimulation();
        updatePassengerOrderCardListeners();
    });

    function updateDriverOrderCardListeners() {
        document.querySelectorAll('#driver-find-passengers-screen .order-card').forEach(card => {
            card.addEventListener('click', () => {
                calculateAndDisplayTripDetails();
                showScreen('driver-order-details-screen');
            });
        });
    }

    function calculateAndDisplayTripDetails() {
        const BASE_FARE = 40;
        const PRICE_PER_KM = 15;
        const PAYMENT_OPTIONS = ['Готівка', 'Картка'];
        if (!tripDistanceEl || !tripFareEl || !paymentMethodEl) return;
        const distance = (Math.random() * (10 - 1.5) + 1.5).toFixed(1);
        const fare = Math.round(BASE_FARE + (distance * PRICE_PER_KM));
        const paymentMethod = PAYMENT_OPTIONS[Math.floor(Math.random() * PAYMENT_OPTIONS.length)];
        tripDistanceEl.textContent = `~ ${distance} км`;
        tripFareEl.textContent = `~ ${fare} грн`;
        paymentMethodEl.textContent = paymentMethod;
    }

    function setupActiveRide() {
        rideState = 'driving_to_client';
        updateRideScreenUI();
    }

    function handleRideAction() {
        switch (rideState) {
            case 'driving_to_client':
                alert('Пасажиру надіслано сповіщення, що ви на місці!');
                rideState = 'waiting_for_client';
                break;
            case 'waiting_for_client':
                rideState = 'in_progress';
                break;
            case 'in_progress':
                alert('Поїздку завершено!');
                rideState = 'idle';
                showScreen('driver-dashboard');
                break;
        }
        updateRideScreenUI();
    }

    function updateRideScreenUI() {
        if (!rideActionBtn) return;
        rideActionBtn.classList.remove('start-ride', 'end-ride');
        switch (rideState) {
            case 'driving_to_client':
                if(rideStatusHeader) rideStatusHeader.textContent = 'Поїздка до пасажира';
                if (rideMapPlaceholder) rideMapPlaceholder.textContent = 'Їдьте до пасажира';
                if (rideAddressDetails) rideAddressDetails.innerHTML = '<span><strong>Адреса:</strong> вул. Весняна, 15</span>';
                rideActionBtn.innerHTML = '✅ Я на місці';
                break;
            case 'waiting_for_client':
                if(rideStatusHeader) rideStatusHeader.textContent = 'Очікування пасажира';
                rideActionBtn.innerHTML = '🚀 Почати поїздку';
                rideActionBtn.classList.add('start-ride');
                break;
            case 'in_progress':
                if(rideStatusHeader) rideStatusHeader.textContent = 'В дорозі';
                if (rideMapPlaceholder) rideMapPlaceholder.textContent = 'Їдьте до точки призначення';
                if (rideAddressDetails) rideAddressDetails.innerHTML = '<span><strong>Пункт призначення:</strong> вул. Музейна, 4</span>';
                rideActionBtn.innerHTML = '🏁 Завершити поїздку';
                rideActionBtn.classList.add('end-ride');
                break;
        }
    }
    
    showQuickOrderBtn?.addEventListener('click', () => {
        showScreen('quick-order-screen');
        initQuickOrderScreen();
    });
    
    findDriverBtn?.addEventListener('click', () => showScreen('passenger-find-driver-screen'));
    showHelpBtn?.addEventListener('click', () => showScreen('help-screen'));
    showFindPassengersBtn?.addEventListener('click', () => showScreen('driver-find-passengers-screen'));
    showDriverOrdersBtn?.addEventListener('click', () => alert('Цей екран ще в розробці :)'));
    acceptOrderBtn?.addEventListener('click', () => {
        setupActiveRide();
        showScreen('driver-active-ride-screen');
    });
    cancelRideBtn?.addEventListener('click', () => {
        if (confirm('Скасувати поїздку? Це може вплинути на ваш рейтинг.')) {
            rideState = 'idle';
            showScreen('driver-dashboard');
        }
    });
    rideActionBtn?.addEventListener('click', handleRideAction);

    goToMyOrdersBtn?.addEventListener('click', () => showMyOrdersBtn.click());
    
    backButtons.forEach(button => {
        button.addEventListener('click', () => showScreen(button.dataset.target || 'home-screen'));
    });

    // == 6. ІНІЦІАЛІЗАЦІЯ ДОДАТКУ ==
    showScreen('home-screen');
    
});
// === ЛОГІКА ПЕРЕМИКАННЯ ТЕМ ===
const themeToggle = document.getElementById('theme-toggle');
const themeCheckbox = themeToggle?.querySelector('.toggle-checkbox');
const body = document.body;

// Функція для зміни теми
function switchTheme(e) {
    if (e.target.checked) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    }
}

// Встановлюємо початковий стан чекбоксу
if (body.classList.contains('dark-theme')) {
    themeCheckbox.checked = true;
}

// Додаємо обробник події
themeCheckbox?.addEventListener('change', switchTheme);
