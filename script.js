let orderData = {};

// === 1. FIREBASE CONFIGURATION (Твій ключ до інтернету) ===
const firebaseConfig = {
  apiKey: "AIzaSyAvgDO3ZB7FChDFuXgx5lErIVhui-nkW-s",
  authDomain: "yayidu-d743d.firebaseapp.com",
  databaseURL: "https://yayidu-d743d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "yayidu-d743d",
  storageBucket: "yayidu-d743d.firebasestorage.app",
  messagingSenderId: "330892131306",
  appId: "1:330892131306:web:9b8f63ec738177c06e5093"
};

// Глобальні змінні для бази даних
let app, db;

// Ініціалізуємо Firebase (безпечно)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log("🔥 Firebase підключено успішно!");
} else if (typeof firebase !== 'undefined') {
    app = firebase.app();
    db = firebase.database();
} else {
    console.error("❌ Помилка: Бібліотека Firebase не підключена в index.html");
}

document.addEventListener('DOMContentLoaded', () => {
    // === TELEGRAM WEB APP CONFIG ===
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand(); 
        tg.ready();
    }
    // ===============================

    loadState(); 
    // Зберігаємо початковий, чистий HTML екрану повного профілю водія
    let fakeUserHasCard = false;
    let fakeDriverAcceptsCard = false;
    let currentOfferIdForConfirmation = null;
    let driverStatus = 'offline'; // Можливі статуси: 'online', 'offline'

    // == 2. ЗБІР ЕЛЕМЕНТІВ DOM ==
    const screens = document.querySelectorAll('.screen');
    const requestListContainer = document.getElementById('vh-passenger-request-list');
    const backButtons = document.querySelectorAll('.btn-back');
    const goToMyOrdersBtn = document.getElementById('go-to-my-orders-btn');
    const fabIconOnline = document.getElementById('fab-icon-online');
    
    // -- Елементи керування поїздкою водія --
    const driverArrivedBtn = document.getElementById('driver-arrived-btn');
    const driverStartTripBtn = document.getElementById('driver-start-trip-btn');
    const driverFinishTripBtn = document.getElementById('driver-finish-trip-btn');
    
    // -- Елементи екрану оцінки --
    const ratingStars = document.querySelectorAll('.rating-stars i');
    const submitRatingBtn = document.getElementById('submit-rating-btn');

    // -- Навігація --
    const showDriverLoginBtn = document.getElementById('show-driver-login');
    const showPassengerLoginBtn = document.getElementById('show-passenger-login');
    const driverTelegramLoginBtn = document.querySelector('#login-screen-driver .btn-telegram-login');
    const passengerTelegramLoginBtn = document.querySelector('#login-screen-passenger .btn-telegram-login');
    
    // -- Елементи пасажира --
    const showMyOrdersBtn = document.getElementById('show-my-orders-btn');
    const findDriverBtn = document.getElementById('find-driver-btn');
    const showQuickOrderBtn = document.getElementById('show-quick-order-btn');
    const showHelpBtn = document.getElementById('show-help-btn');
    const showPassengerValkyKharkivBtn = document.getElementById('show-passenger-valky-kharkiv-btn');
    const showPassengerBusScheduleBtn = document.getElementById('show-passenger-bus-schedule-btn');
    const showPassengerProfileBtn = document.getElementById('show-passenger-profile-btn');
    const showPassengerSupportBtn = document.getElementById('show-passenger-support-btn');
    const showPassengerSettingsBtn = document.getElementById('show-passenger-settings-btn');
    const vhPassengerCreateRequestBtn = document.getElementById('vh-passenger-create-request-btn');

    // -- Елементи водія --
    const showFindPassengersBtn = document.getElementById('show-find-passengers-btn');
    const showDriverOrdersBtn = document.getElementById('show-driver-orders-btn');
    const showDriverValkyKharkivBtn = document.getElementById('show-driver-valky-kharkiv-btn');
    const showDriverProfileBtn = document.getElementById('show-driver-profile-btn');
    const showDriverHelpBtn = document.getElementById('show-driver-help-btn');
    const showDriverSupportBtn = document.getElementById('show-driver-support-btn');
    const showDriverSettingsBtn = document.getElementById('show-driver-settings-btn');
    
    // -- Елементи екрану вибору дії водія --
    const choiceCreateTripBtn = document.getElementById('choice-create-trip');
    const choiceFindPassengersBtn = document.getElementById('choice-find-passengers');

    // =======================================================
    // == ЛОГІКА ДЛЯ FAB-КНОПКИ ВОДІЯ (v6 - спрощена) ==
    // =======================================================

    const driverFabBtn = document.getElementById('driver-fab-btn');

// Функція для оновлення вигляду кнопки
function updateFabButtonState() {
    if (!driverFabBtn) return;

    if (driverStatus === 'online') {
        driverFabBtn.classList.add('is-online');
        driverFabBtn.classList.remove('is-pulsing');
        driverFabBtn.style.background = 'var(--md-primary)';
    } else { // offline
        driverFabBtn.classList.remove('is-online');
        driverFabBtn.classList.add('is-pulsing');
        // Можна повернути інший колір, якщо треба, наприклад:
        // driverFabBtn.style.background = 'var(--md-surface-variant)';
    }
}

// Обробник кліку по FAB-кнопці
driverFabBtn?.addEventListener('click', () => {
    if (driverStatus === 'offline') {
        driverStatus = 'online';
        // Оновлюємо індикатор статусу в хедері
        const driverStatusIndicator = document.getElementById('driver-status-indicator-home');
        if (driverStatusIndicator) {
            driverStatusIndicator.classList.remove('offline');
            driverStatusIndicator.classList.add('online');
            driverStatusIndicator.querySelector('.status-text').textContent = 'Онлайн';
        }
    } else { // Якщо вже онлайн, то відкриваємо екран вибору
        navigateTo('driver-create-choice-screen');
    }
    
    // В будь-якому випадку оновлюємо вигляд кнопки
    updateFabButtonState();
});

// Також треба знайти, де ми переходимо на екран водія, і викликати оновлення
// Наприклад, в обробнику кнопки driverTelegramLoginBtn. Я додам це в існуючий код.
// Знайди цю функцію і додай в кінець виклик updateFabButtonState();

// Ініціалізація початкового стану (додамо це пізніше, якщо буде потрібно)


    // == 3. ОСНОВНІ ФУНКЦІЇ І ЛОГІКА ==

    
    // == ЛОГІКА "ШВИДКЕ ЗАМОВЛЕННЯ" ==
    const quickOrderScreen = document.getElementById('quick-order-screen');
    const quickOrderSummaryCard = document.getElementById('quick-order-summary-card');
    const summaryFrom = document.getElementById('summary-from');
    const summaryTo = document.getElementById('summary-to');
    const summaryTime = document.getElementById('summary-time');
    const summaryFromContainer = document.getElementById('summary-from-container');
    const summaryToContainer = document.getElementById('summary-to-container');
    const summaryTimeContainer = document.getElementById('summary-time-container');
    const addressStep = document.getElementById('address-step');
    const timeStep = document.getElementById('time-step');
    const fromAddressInput = document.getElementById('from-address');
    const toAddressInput = document.getElementById('to-address');
    const addressNextBtn = document.getElementById('address-next-btn');
    const settlementButtons = document.querySelectorAll('.btn-settlement');
    const fromVillageContainer = document.getElementById('from-village-container');
    const toVillageContainer = document.getElementById('to-village-container');
    const fromVillageSelect = document.getElementById('from-village-select');
    const toVillageSelect = document.getElementById('to-village-select');
    const timeChoiceContainer = document.getElementById('time-choice-container');
    const timeChoiceButtons = document.querySelectorAll('[data-time-choice]');
    const timeResultContainer = document.getElementById('time-result-container');
    const timeResultText = document.getElementById('time-result-text');
    const editTimeBtn = document.getElementById('edit-time-btn');
    const pickerInput = document.getElementById('datetime-picker');
    const submitOrderBtn = document.getElementById('submit-order-btn');
    const paymentStep = document.getElementById('payment-step');
    const timeNextBtn = document.getElementById('time-next-btn');
    const paymentCashBtn = document.getElementById('payment-cash-btn');
    const paymentCardBtn = document.getElementById('payment-card-btn');
    let orderData = {};

    

    // == ЛОГІКА ДЛЯ ЕКРАНУ "ШУКАЮТЬ ВОДІЯ" ==


    const detailsPassengerName = document.getElementById('details-passenger-name');
    const detailsPassengerRating = document.getElementById('details-passenger-rating');
    const detailsFromAddress = document.getElementById('details-from-address');
    const detailsToAddress = document.getElementById('details-to-address');
    const detailsCommentContainer = document.getElementById('details-comment-container');
    const detailsCommentText = document.getElementById('details-comment-text');
    const detailsTotalPrice = document.getElementById('details-total-price');
    const detailsCommission = document.getElementById('details-commission');
    const detailsDriverEarning = document.getElementById('details-driver-earning');



// == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ ПРОФІЛЮ ВОДІЯ ==

// Спочатку збираємо всі елементи профілю, щоб до них звертатись
const profileDriverNameHeader = document.getElementById('profile-driver-name-header');
const profileDriverName = document.getElementById('profile-driver-name');
const profileDriverRating = document.getElementById('profile-driver-rating');
const profileDriverTrips = document.getElementById('profile-driver-trips');
const profileDriverCar = document.getElementById('profile-driver-car');
const profileDriverTags = document.getElementById('profile-driver-tags');
const profileDriverReviews = document.getElementById('profile-driver-reviews');
const profileRequestRideBtn = document.getElementById('profile-request-ride-btn');


// Оновлюємо обробник для кнопки "Переглянути профіль"
document.getElementById('show-full-driver-profile-btn')?.addEventListener('click', () => {
    UI.displayDriverFullProfile(1);
    navigateTo('driver-full-profile-screen');
});


// == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ ПРОФІЛЮ ПАСАЖИРА ==

// Збираємо елементи пасажирського профілю
const profilePassengerNameHeader = document.getElementById('profile-passenger-name-header');
const profilePassengerName = document.getElementById('profile-passenger-name');
const profilePassengerTrips = document.getElementById('profile-passenger-trips');
const profilePassengerBio = document.getElementById('profile-passenger-bio');


// --- Навігація ---
showDriverLoginBtn?.addEventListener('click', () => navigateTo('login-screen-driver'));
showPassengerLoginBtn?.addEventListener('click', () => navigateTo('login-screen-passenger'));

driverTelegramLoginBtn?.addEventListener('click', () => {
    navigateTo('driver-home-screen');
    document.getElementById('driver-tab-bar').classList.remove('hidden');
    updateFabButtonState(); // <--- Замінили стару функцію на нову
    updateAllDriverTripViews();
});


passengerTelegramLoginBtn?.addEventListener('click', () => {
    navigateTo('passenger-home-screen');
    document.getElementById('passenger-tab-bar').classList.remove('hidden');
    updateHomeScreenView('passenger'); // <-- ДОДАНО
});




// --- Навігація ПАСАЖИРА (ПОВНА І ВИПРАВЛЕНА ВЕРСІЯ) ---
showMyOrdersBtn?.addEventListener('click', () => {
    displayArchives();
    
    const trip = active_trips.length > 0 ? active_trips[0] : null;
    
    const searchingCard = document.getElementById('searching-card');
    const activeTripCard = document.getElementById('active-trip-card');
    
    if (trip) {
        searchingCard.style.display = 'none';
        activeTripCard.style.display = 'block';

        const statusIcon = activeTripCard.querySelector('#status-icon');
        const statusText = activeTripCard.querySelector('#status-text');
        const carIcon = activeTripCard.querySelector('#car-icon');
        const endPoint = activeTripCard.querySelector('#progress-end-point');

        if (trip.status === 'in_progress') {
            statusText.textContent = 'Ви в дорозі';
            statusIcon.className = 'fa-solid fa-route';
            carIcon.style.left = '50%';
            endPoint.classList.remove('arrived');
        } else if (trip.status === 'arrived') {
            statusText.textContent = 'Водій прибув і очікує';
            statusIcon.className = 'fa-solid fa-street-view';
            carIcon.style.left = '100%';
            endPoint.classList.add('arrived');
        } else {
            statusText.textContent = 'Водій прямує до вас';
            statusIcon.className = 'fa-solid fa-car-side';
            carIcon.style.left = '0%';
            endPoint.classList.remove('arrived');
        }
    } else {
        searchingCard.style.display = 'none';
        activeTripCard.style.display = 'none';
    }

    navigateTo('passenger-orders-screen');
});

showQuickOrderBtn?.addEventListener('click', () => {
    navigateTo('quick-order-screen');
    UI.resetQuickOrder();
});

findDriverBtn?.addEventListener('click', () => {
    displayAvailableDrivers();
    navigateTo('passenger-find-driver-screen');
});

showPassengerValkyKharkivBtn?.addEventListener('click', () => {
    displayVhOffers(); // Тепер просто викликаємо функцію
    navigateTo('passenger-valky-kharkiv-screen');
});

// === ЛОГІКА ДЛЯ КАРТОК-ШАБЛОНІВ ===
document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
        const template = card.dataset.template;
        
        if (template === 'vk') {
            // Автозаповнення для Валки → Харків
            document.getElementById('vh-from-location').querySelector('span').textContent = 'Валки';
            document.getElementById('vh-to-location').querySelector('span').textContent = 'Харків';
            navigateTo('vh-passenger-form-screen');
            
        } else if (template === 'kv') {
            // Автозаповнення для Харків → Валки
            document.getElementById('vh-from-location').querySelector('span').textContent = 'Харків';
            document.getElementById('vh-to-location').querySelector('span').textContent = 'Валки';
            navigateTo('vh-passenger-form-screen');
            
        } else if (template === 'custom') {
            // Для інших маршрутів — відкриваємо форму створення власного запиту
            // (поки що просто відкриваємо стандартну форму, пізніше можна зробити окрему)
            navigateTo('vh-passenger-form-screen');
        }
    });
});

showPassengerBusScheduleBtn?.addEventListener('click', () => navigateTo('passenger-bus-schedule-screen'));
showPassengerProfileBtn?.addEventListener('click', () => {
    UI.displayPassengerProfile(1);
    navigateTo('passenger-profile-screen');
});

    // == ЛОГІКА ДЛЯ TAB BAR (ПАСАЖИР) ==
    const passengerTabBar = document.getElementById('passenger-tab-bar');
    const passengerTabItems = passengerTabBar?.querySelectorAll('.tab-item');

function handleTabClick(clickedItem) {
    passengerTabItems.forEach(item => item.classList.remove('active'));
    clickedItem.classList.add('active');
    const targetScreen = clickedItem.dataset.target;
    // Спершу викликаємо потрібні функції для оновлення контенту
    if (targetScreen === 'passenger-profile-screen') {
        UI.displayPassengerProfile(1);
        navigateTo('passenger-profile-screen');
    } else if (targetScreen === 'passenger-home-screen') {
        updateHomeScreenView('passenger');
        navigateTo('passenger-home-screen');
    } else if (targetScreen === 'passenger-valky-kharkiv-screen') {
        displayVhOffers();
        navigateTo('passenger-valky-kharkiv-screen');
    } else if (targetScreen === 'passenger-find-driver-screen') {
        displayAvailableDrivers();
        navigateTo(targetScreen);
    } else if (targetScreen) {
        navigateTo(targetScreen);
    }
}



    passengerTabItems?.forEach(item => {
        item.addEventListener('click', () => {
            handleTabClick(item);
        });
    });

// =================================================================
// == ОБ'ЄДНАНИЙ БЛОК КЕРУВАННЯ ІНТЕРФЕЙСОМ ВОДІЯ (НОВА ВЕРСІЯ) ==
// =================================================================

// --- Кнопка статусу водія в хедері ---
const driverStatusIndicator = document.getElementById('driver-status-indicator-home'); // ВИПРАВЛЕНО ID
driverStatusIndicator?.addEventListener('click', () => {
    const statusText = driverStatusIndicator.querySelector('.status-text');
    if (driverStatus === 'online') {
        driverStatus = 'offline';
        statusText.textContent = 'На перерві';
        driverStatusIndicator.classList.remove('online');
        driverStatusIndicator.classList.add('offline');
        alert('Ваш статус змінено на "На перерві".');
    } else {
        driverStatus = 'online';
        statusText.textContent = 'Онлайн';
        driverStatusIndicator.classList.remove('offline');
        driverStatusIndicator.classList.add('online');
        alert('Ви знову онлайн!');
    }
});

// --- Tab Bar водія ---
const driverTabItems = document.querySelectorAll('#driver-tab-bar .tab-item');
driverTabItems.forEach(item => {
    item.addEventListener('click', () => {
        driverTabItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const target = item.dataset.target;

        // Наша нова логіка для кнопки "Назад"
        if (target === 'driver-find-passengers-screen') {
            const targetBackBtn = document.querySelector('#driver-find-passengers-screen .btn-back');
            if (targetBackBtn) {
                targetBackBtn.dataset.target = 'driver-home-screen';
            }
        }

        // Новий, виправлений код:
if (target === 'driver-profile-screen') {
    UI.displayDriverProfile(1);
    navigateTo(target);
} else if (target === 'driver-valky-kharkiv-screen') { // <-- Додаємо спеціальну перевірку
    displayVhRequests(); // <-- Викликаємо "кур'єра", щоб оновити список
    navigateTo(target);
} else if (target) {
    navigateTo(target);
}

    });
});

    // == ЛОГІКА ДЛЯ НОВИХ ЕКРАНІВ-МЕНЮ "ПРОФІЛЬ" ==

    // --- Пасажир ---
    document.getElementById('show-full-passenger-profile-btn')?.addEventListener('click', () => {
        navigateTo('passenger-full-profile-screen');
    });
    document.getElementById('show-passenger-settings-btn-from-profile')?.addEventListener('click', () => navigateTo('passenger-settings-screen'));
    document.getElementById('show-help-btn-from-profile')?.addEventListener('click', () => navigateTo('help-screen'));
    document.getElementById('show-passenger-support-btn-from-profile')?.addEventListener('click', () => navigateTo('passenger-support-screen'));
    document.getElementById('show-driver-settings-btn-from-profile')?.addEventListener('click', () => navigateTo('driver-settings-screen'));
    document.getElementById('show-driver-help-btn-from-profile')?.addEventListener('click', () => navigateTo('driver-help-screen'));
    document.getElementById('show-driver-support-btn-from-profile')?.addEventListener('click', () => navigateTo('driver-support-screen'));

// --- Навігація для "Валки-Харків" ---
vhPassengerCreateRequestBtn?.addEventListener('click', () => navigateTo('vh-passenger-form-screen'));


// == ЛОГІКА ДЛЯ ФОРМИ "ВАЛКИ-ХАРКІВ" (ПАСАЖИР) v2.0 ==

// --- Логіка для перемикача напрямку зі стрілками ---
const vhSwapRouteBtn = document.getElementById('vh-swap-route-btn');
const vhFromLocationSpan = document.getElementById('vh-from-location')?.querySelector('span');
const vhToLocationSpan = document.getElementById('vh-to-location')?.querySelector('span');

vhSwapRouteBtn?.addEventListener('click', () => {
    if (!vhFromLocationSpan || !vhToLocationSpan) return;
    const tempLocation = vhFromLocationSpan.textContent;
    vhFromLocationSpan.textContent = vhToLocationSpan.textContent;
    vhToLocationSpan.textContent = tempLocation;

    const container = vhSwapRouteBtn.closest('.route-swap-container');
    container?.classList.add('swapped');
    setTimeout(() => container?.classList.remove('swapped'), 300);
});

// --- Логіка для вибору часу ---
const vhTimeChoiceButtons = document.querySelectorAll('#vh-passenger-form-screen .btn-segment');
const vhPickerInput = document.getElementById('vh-form-datetime-picker-specific');

vhTimeChoiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const choice = e.currentTarget.dataset.timeChoice;
        vhTimeChoiceButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');

        if (choice === 'now') {
            if(vhPickerInput) vhPickerInput.style.display = 'none';
        } else {
            if(vhPickerInput) vhPickerInput.style.display = 'block';
            let pickerOptions = {
                enableTime: true, minDate: "today", time_24hr: true,
                onClose: (selectedDates, dateStr) => {
                    if (!dateStr) e.currentTarget.classList.remove('active');
                }
            };
            if (choice === 'today') {
                pickerOptions.noCalendar = true;
                pickerOptions.dateFormat = "H:i";
            } else {
                pickerOptions.dateFormat = "d.m.Y H:i";
            }
            if(vhPickerInput) flatpickr(vhPickerInput, pickerOptions).open();
        }
    });
});

// == ЛОГІКА ДЛЯ КНОПКИ "ОПУБЛІКУВАТИ ЗАПИТ" (ПАСАЖИР) - ОНОВЛЕНО ==
const vhFormSubmitBtn = document.getElementById('vh-form-submit-btn-specific');
vhFormSubmitBtn?.addEventListener('click', () => {
    // Збираємо дані з форми
    const fromLocation = document.getElementById('vh-from-location')?.querySelector('span')?.textContent || 'Н/Д';
    const toLocation = document.getElementById('vh-to-location')?.querySelector('span')?.textContent || 'Н/Д';
    const direction = `${fromLocation} - ${toLocation}`;

    const fromSpecific = document.getElementById('vh-form-from-address-specific').value.trim();
    const toSpecific = document.getElementById('vh-form-to-address-specific').value.trim();
    const seats = document.getElementById('vh-pass-seats-display').textContent;

    let time;
    const activeTimeButton = document.querySelector('#vh-passenger-form-screen .btn-segment.active');
    if (activeTimeButton) {
        const choice = activeTimeButton.dataset.timeChoice;
        if (choice === 'now') {
            time = 'Зараз';
        } else {
            time = document.getElementById('vh-form-datetime-picker-specific').value;
        }
    }

    // Перевірка
    if (!time || !seats) {
        alert('Будь ласка, оберіть час поїздки та вкажіть кількість місць.');
        return;
    }

    // Створюємо об'єкт
    const newRequest = {
        id: Date.now(),
        passengerId: 1,
        direction: direction,
        fromSpecific: fromSpecific,
        toSpecific: toSpecific,
        time: time,
        seats: parseInt(seats)
    };

    // Додаємо в базу і даємо фідбек
    vh_requests_database.push(newRequest);
    saveState();
    alert('Ваш запит успішно опубліковано!');
    navigateTo('passenger-valky-kharkiv-screen');
});


// == ЛОГІКА ДЛЯ ФОРМИ "ВАЛКИ-ХАРКІВ" (ВОДІЙ) ==

// --- Збираємо елементи водійської форми ---
const vhDriverSwapRouteBtn = document.getElementById('vh-driver-swap-route-btn');
const vhDriverFromLocationSpan = document.getElementById('vh-driver-from-location')?.querySelector('span');
const vhDriverToLocationSpan = document.getElementById('vh-driver-to-location')?.querySelector('span');
const vhDriverTimeChoiceButtons = document.querySelectorAll('#vh-driver-form-screen .btn-segment');
const vhDriverPickerInput = document.getElementById('vh-driver-form-datetime-picker');
const vhDriverFormSubmitBtn = document.getElementById('vh-driver-form-submit-btn');

// --- Логіка для перемикача напрямку (аналогічно до пасажирської) ---
vhDriverSwapRouteBtn?.addEventListener('click', () => {
    if (!vhDriverFromLocationSpan || !vhDriverToLocationSpan) return;
    const tempLocation = vhDriverFromLocationSpan.textContent;
    vhDriverFromLocationSpan.textContent = vhDriverToLocationSpan.textContent;
    vhDriverToLocationSpan.textContent = tempLocation;
});

// --- Логіка для вибору часу (аналогічно до пасажирської) ---
vhDriverTimeChoiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const choice = e.currentTarget.dataset.timeChoice;
        vhDriverTimeChoiceButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');

        if (choice === 'now') {
            if(vhDriverPickerInput) vhDriverPickerInput.style.display = 'none';
        } else {
            if(vhDriverPickerInput) vhDriverPickerInput.style.display = 'block';
            let pickerOptions = {
                enableTime: true, minDate: "today", time_24hr: true,
                onClose: (selectedDates, dateStr) => {
                    if (!dateStr) e.currentTarget.classList.remove('active');
                }
            };
            if (choice === 'today') {
                pickerOptions.noCalendar = true;
                pickerOptions.dateFormat = "H:i";
            } else {
                pickerOptions.dateFormat = "d.m.Y H:i";
            }
            if(vhDriverPickerInput) flatpickr(vhDriverPickerInput, pickerOptions).open();
        }
    });
});

// --- Логіка для кнопки "Опублікувати пропозицію" ---
vhDriverFormSubmitBtn?.addEventListener('click', () => {
    // 1. Збираємо дані
    const fromLocation = vhDriverFromLocationSpan?.textContent || 'Н/Д';
    const toLocation = vhDriverToLocationSpan?.textContent || 'Н/Д';
    const direction = `${fromLocation} - ${toLocation}`;
    const fromSpecific = document.getElementById('vh-driver-form-from-specific').value.trim();
    const isFlexible = document.getElementById('vh-driver-flexible-route').checked;
    const seats = document.getElementById('vh-driver-seats-display').textContent;

let time;
    const activeTimeButton = document.querySelector('#vh-driver-form-screen .btn-segment.active');
    if (activeTimeButton) {
        const choice = activeTimeButton.dataset.timeChoice;
        if (choice === 'now') {
            time = 'Зараз';
        } else {
            time = vhDriverPickerInput?.value;
        }
    }

    // 2. Перевірка
    if (!time || !seats) {
    alert('Будь ласка, оберіть час поїздки та вкажіть кількість місць.');
    return;
}

    // 3. Створюємо об'єкт пропозиції
    const newOffer = {
        id: Date.now(),
        driverId: 1, // Поки що хардкод, ID водія "Сергій"
        direction: direction,
        fromSpecific: fromSpecific,
        isFlexible: isFlexible,
        time: time,
        seats: seats
    };

    // 4. Додаємо пропозицію в нашу "базу даних"
    vh_offers_database.push(newOffer);
    saveState();
    console.log('Нову пропозицію В-Х додано:', newOffer);
    console.log('Поточний стан бази пропозицій:', vh_offers_database);


    // 5. Сповіщаємо і повертаємо назад
    alert('Вашу пропозицію успішно опубліковано!');
    navigateTo('driver-valky-kharkiv-screen');
});

// == ЛОГІКА ДЛЯ ФОРМИ СТВОРЕННЯ ВЛАСНОГО МАРШРУТУ (ВОДІЙ) ==
const customTripTimeChoiceButtons = document.querySelectorAll('#driver-create-custom-trip-screen .btn-segment');
const customTripPickerInput = document.getElementById('custom-trip-datetime-picker');

customTripTimeChoiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const choice = e.currentTarget.dataset.timeChoice;
        customTripTimeChoiceButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');

        if (choice === 'now') {
            if(customTripPickerInput) customTripPickerInput.style.display = 'none';
        } else {
            if(customTripPickerInput) customTripPickerInput.style.display = 'block';
            let pickerOptions = {
                enableTime: true, minDate: "today", time_24hr: true,
                onClose: (selectedDates, dateStr) => {
                    if (!dateStr) e.currentTarget.classList.remove('active');
                }
            };
            if (choice === 'today') {
                pickerOptions.noCalendar = true;
                pickerOptions.dateFormat = "H:i";
            } else {
                pickerOptions.dateFormat = "d.m.Y H:i";
            }
            if(customTripPickerInput) flatpickr(customTripPickerInput, pickerOptions).open();
        }
    });
});

// == ЛОГІКА ДЛЯ КНОПКИ "ОПУБЛІКУВАТИ ПОЇЗДКУ" (ВЛАСНИЙ МАРШРУТ) ==
const customTripSubmitBtn = document.getElementById('custom-trip-submit-btn');
customTripSubmitBtn?.addEventListener('click', () => {
    // -- КРОК 1: Збираємо всі дані з форми --

    // Збираємо "Звідки"
    const fromType = document.querySelector('#driver-create-custom-trip-screen .btn-settlement[data-group="custom-from"].active').dataset.type;
    const fromLocation = fromType === 'village'
        ? document.getElementById('custom-from-village-select').value
        : document.getElementById('custom-trip-from').value.trim();

    // Збираємо "Куди"
    const toType = document.querySelector('#driver-create-custom-trip-screen .btn-settlement[data-group="custom-to"].active').dataset.type;
    const toLocation = toType === 'village'
        ? document.getElementById('custom-to-village-select').value
        : document.getElementById('custom-trip-to').value.trim();

    // Збираємо проміжні точки
    const intermediateStops = [];
    const stopInputs = document.querySelectorAll('.intermediate-stop-input');
    stopInputs.forEach(input => {
        if (input.value.trim() !== '') {
            intermediateStops.push(input.value.trim());
        }
    });

    // Збираємо час
    let time;
    const activeTimeButton = document.querySelector('#driver-create-custom-trip-screen .btn-segment.active');
    if (activeTimeButton) {
        const choice = activeTimeButton.dataset.timeChoice;
        if (choice === 'now') {
            time = 'Зараз';
        } else {
            time = document.getElementById('custom-trip-datetime-picker').value;
        }
    }

    // Збираємо деталі
    const seats = document.getElementById('custom-trip-seats-display').textContent;
    const price = document.getElementById('custom-trip-price').value.trim();

    // -- КРОК 2: Перевіряємо, чи заповнені основні поля --
    if (!fromLocation || fromLocation === 'Оберіть населений пункт...' || !toLocation || toLocation === 'Оберіть населений пункт...' || !time || !seats || !price) {
        alert('Будь ласка, заповніть всі основні поля: Звідки, Куди, Коли, Кількість місць та Ціну.');
        return;
    }

    // -- КРОК 3: Формуємо об'єкт поїздки --
    const newCustomTrip = {
        id: Date.now(),
        driverId: 1, // Поки що хардкод для водія "Сергій"
        from: fromLocation,
        to: toLocation,
        stops: intermediateStops, // Масив з проміжними точками
        time: time,
        seats: seats, // Перетворюємо в число
        price: price,
        type: 'custom' // Додаємо тип, щоб відрізняти від поїздок В-Х
    };

    // -- КРОК 4: "Зберігаємо" поїздку і даємо фідбек --
    custom_trips_database.push(newCustomTrip);
    saveState();
    console.log('Створено нову власну поїздку:', newCustomTrip);
    console.log('Поточна база власних поїздок:', custom_trips_database);

    alert('Вашу поїздку успішно опубліковано!');
    navigateTo('driver-home-screen');
    // В майбутньому тут треба буде також очищувати форму
});


// == ЛОГІКА ДЛЯ ВИБОРУ Н.П. У ВЛАСНОМУ МАРШРУТІ ==
const customSettlementButtons = document.querySelectorAll('#driver-create-custom-trip-screen .btn-settlement');

customSettlementButtons.forEach(button => {
    button.addEventListener('click', () => {
        const group = button.dataset.group; // 'custom-from' or 'custom-to'
        const type = button.dataset.type;   // 'manual' or 'village'

        // Оновлюємо активну кнопку
        document.querySelectorAll(`.btn-settlement[data-group="${group}"]`).forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Показуємо/ховаємо відповідні поля
        if (group === 'custom-from') {
            document.getElementById('custom-from-village-container').style.display = type === 'village' ? 'block' : 'none';
            document.getElementById('custom-from-manual-container').style.display = type === 'manual' ? 'block' : 'none';
        } else { // 'custom-to'
            document.getElementById('custom-to-village-container').style.display = type === 'village' ? 'block' : 'none';
            document.getElementById('custom-to-manual-container').style.display = type === 'manual' ? 'block' : 'none';
        }
    });
});

// == ЛОГІКА ДЛЯ ДОДАВАННЯ ПРОМІЖНИХ ТОЧОК ==
const addStopBtn = document.getElementById('add-stop-btn');
const stopsContainer = document.getElementById('intermediate-stops-container');
let stopCounter = 0;

addStopBtn?.addEventListener('click', () => {
    stopCounter++;

    // Створюємо новий блок для зупинки
    const newStopDiv = document.createElement('div');
    newStopDiv.className = 'intermediate-stop-group';
    newStopDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 0 12px;';

    // Створюємо іконку
    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-location-arrow';
    icon.style.color = 'var(--md-on-surface-variant)';

    // Створюємо поле вводу
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-input intermediate-stop-input';
    input.placeholder = `Проміжна точка ${stopCounter}`;
    input.style.flexGrow = '1';

    // Створюємо кнопку видалення
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-icon-action';
    removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    removeBtn.style.cssText = 'width: 40px; height: 40px; flex-shrink: 0;';

    // Додаємо логіку видалення
    removeBtn.addEventListener('click', () => {
        newStopDiv.remove();
        // Перенумеруємо плейсхолдери, щоб було красиво
        const remainingInputs = stopsContainer.querySelectorAll('.intermediate-stop-input');
        stopCounter = 0;
        remainingInputs.forEach(inp => {
            stopCounter++;
            inp.placeholder = `Проміжна точка ${stopCounter}`;
        });
    });

    // Збираємо все разом
    newStopDiv.appendChild(icon);
    newStopDiv.appendChild(input);
    newStopDiv.appendChild(removeBtn);

    // Додаємо новий блок у контейнер
    stopsContainer.appendChild(newStopDiv);
});


// == ЛОГІКА ДЛЯ ФІЛЬТРІВ "В-Х" (ПАСАЖИР) ==
const vhFilterButtons = document.querySelectorAll('#passenger-valky-kharkiv-screen .btn-filter');

vhFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Знімаємо клас active з усіх кнопок
        vhFilterButtons.forEach(btn => btn.classList.remove('active'));
        // Додаємо клас active тій, яку натиснули
        button.classList.add('active');

        const direction = button.dataset.direction;
        displayVhOffers(direction); // Викликаємо оновлення списку з фільтром
    });
});



// == ЛОГІКА КНОПОК ПІДТВЕРДЖЕННЯ/ВІДХИЛЕННЯ ЗАМОВЛЕННЯ В-Х ==
const vhConfirmBtn = document.getElementById('vh-confirm-btn');
const vhDeclineBtn = document.getElementById('vh-decline-btn');

vhConfirmBtn?.addEventListener('click', () => {
    if (!currentOfferIdForConfirmation) return;
    const offerIndex = vh_offers_database.findIndex(o => o.id === currentOfferIdForConfirmation);
    if (offerIndex === -1) return;

    const offer = vh_offers_database[offerIndex];
    const passenger = passengers_database.find(p => p.id === 1);
    if (!passenger) return;

    // КРОК 1: Створюємо об'єкт активної поїздки
    const newActiveTrip = {
        id: offer.id,
        passengerName: passenger.name,
        passengerRating: 4.8, // поки хардкод
        from: offer.direction.split(' - ')[0],
        to: offer.direction.split(' - ')[1],
        time: offer.time
    };
    active_trips_database.push(newActiveTrip);

    // КРОК 2: Видаляємо пропозицію із загального списку
    vh_offers_database.splice(offerIndex, 1);

    currentOfferIdForConfirmation = null;

    // КРОК 3: Сповіщаємо пасажира
    const newNotification = {
        id: Date.now(),
        userId: passenger.id,
        text: `<strong>Вашу поїздку підтверджено!</strong> Водій скоро буде на місці.`,
        type: 'trip_confirmed',
        isRead: false
    };
    notifications_database.push(newNotification);

    const passengerBadge = document.getElementById('passenger-notification-badge');
    if (passengerBadge) {
        const unreadCount = notifications_database.filter(n => !n.isRead && n.userId === passenger.id).length;
        passengerBadge.textContent = unreadCount;
        passengerBadge.classList.remove('hidden');
    }

    alert('Замовлення підтверджено! Пасажира сповіщено.');
    navigateTo('driver-home-screen');
});

vhDeclineBtn?.addEventListener('click', () => {
    // Знаходимо пасажира "Віту" (поки що ID=1)
    const passenger = passengers_database.find(p => p.id === 1);
    if (!passenger) return;

    // 1. Створюємо сповіщення для пасажира про відхилення
    const newNotification = {
        id: Date.now(),
        userId: passenger.id, // ID пасажира
        text: `<strong>На жаль, водій відхилив ваше замовлення.</strong> Спробуйте обрати іншого водія.`,
        type: 'trip_declined',
        isRead: false
    };
    notifications_database.push(newNotification);

    // 2. Показуємо значок сповіщення у пасажира
    const passengerBadge = document.getElementById('passenger-notification-badge');
    if (passengerBadge) {
        const unreadCount = notifications_database.filter(n => !n.isRead && n.userId === passenger.id).length;
        passengerBadge.textContent = unreadCount;
        passengerBadge.classList.remove('hidden');
    }

    // 3. Скидаємо тимчасову пам'ять
    currentOfferIdForConfirmation = null;

    alert('Замовлення відхилено. Пасажира сповіщено.');
    navigateTo('notifications-screen'); // Повертаємо водія до списку сповіщень
});

// == ЛОГІКА ПІДТВЕРДЖЕННЯ ВИБОРУ ВОДІЯ З ПРОФІЛЮ ==
const cancelRideBtn = document.getElementById('cancel-ride-btn');
const confirmRideWithDriverBtn = document.getElementById('confirm-ride-with-driver-btn');

cancelRideBtn?.addEventListener('click', () => {
    // Просто повертаємось назад на профіль водія
    navigateTo('driver-full-profile-screen'); 
});

confirmRideWithDriverBtn?.addEventListener('click', () => {
    // 1. Витягуємо ID водія з нашого "блокноту"
    const driverIdString = currentOfferIdForConfirmation?.replace('driver_', '');
    if (!driverIdString) return;
    const driverId = parseInt(driverIdString);
    const driver = drivers_database.find(d => d.id === driverId);
    if (!driver) return;

    // 2. Переходимо на екран Швидкого замовлення
    navigateTo('quick-order-screen');
    UI.resetQuickOrder();

    // 3. Заповнюємо картку-саммарі даними про водія і показуємо її
    const summaryCard = document.getElementById('quick-order-summary-card');
    const summaryDriverContainer = document.getElementById('summary-driver-container');
    const summaryDriver = document.getElementById('summary-driver');

    if (summaryDriverContainer && summaryDriver) {
        summaryDriver.textContent = `${driver.name} (${driver.car})`;
        summaryDriverContainer.style.display = 'flex';
        summaryCard.classList.remove('hidden');
    }
});


// Оновлений обробник для дзвіночка
const driverNotificationsBtn = document.getElementById('driver-notifications-btn');
driverNotificationsBtn?.addEventListener('click', () => {
    const notificationBadge = document.getElementById('driver-notification-badge');

    // Очищуємо значок нових сповіщень
    if (notificationBadge) {
        notificationBadge.classList.add('hidden');
        notificationBadge.textContent = '';
    }

    // Позначаємо всі сповіщення як прочитані
    notifications_database.forEach(n => n.isRead = true);

    // Показуємо екран зі сповіщеннями
    showUserNotifications('driver');
    navigateTo('notifications-screen');
});


// Обробник для дзвіночка ПАСАЖИРА
const passengerNotificationsBtn = document.getElementById('passenger-notifications-btn');
passengerNotificationsBtn?.addEventListener('click', () => {
    const notificationBadge = document.getElementById('passenger-notification-badge');

    if (notificationBadge) {
        notificationBadge.classList.add('hidden');
        notificationBadge.textContent = '';
    }

    notifications_database.forEach(n => n.isRead = true);

    displayNotifications('passenger'); // <-- Зверни увагу, передаємо 'passenger'
    navigateTo('notifications-screen');
});



// --- Навігація ВОДІЯ ---
showDriverOrdersBtn?.addEventListener('click', () => {
    updateAllDriverTripViews(); // <--- ЗАМІНА
    displayArchives();
    navigateTo('driver-orders-screen');
});


showFindPassengersBtn?.addEventListener('click', () => {
    navigateTo('driver-find-passengers-screen');
    displayDriverOrders();
});
showDriverValkyKharkivBtn?.addEventListener('click', () => {
    displayVhRequests(); // <-- Оновлюємо список перед показом
    navigateTo('driver-valky-kharkiv-screen');
});

// === ЛОГІКА ДЛЯ КАРТОК-ШАБЛОНІВ ВОДІЯ ===
document.querySelectorAll('.template-card[data-driver-template]').forEach(card => {
    card.addEventListener('click', () => {
        const template = card.dataset.driverTemplate;
        
        if (template === 'vk') {
            document.getElementById('vh-driver-from-location').querySelector('span').textContent = 'Валки';
            document.getElementById('vh-driver-to-location').querySelector('span').textContent = 'Харків';
            navigateTo('vh-driver-form-screen');
            
        } else if (template === 'kv') {
            document.getElementById('vh-driver-from-location').querySelector('span').textContent = 'Харків';
            document.getElementById('vh-driver-to-location').querySelector('span').textContent = 'Валки';
            navigateTo('vh-driver-form-screen');
            
        } else if (template === 'custom') {
            navigateTo('driver-create-custom-trip-screen');
        }
    });
});


showDriverHelpBtn?.addEventListener('click', () => navigateTo('driver-help-screen'));
showDriverSupportBtn?.addEventListener('click', () => navigateTo('driver-support-screen'));
showDriverSettingsBtn?.addEventListener('click', () => navigateTo('driver-settings-screen'));
// Обробник для кнопки "Запропонувати поїздку" на екрані Валки-Харків
const vhDriverCreateOfferBtn = document.getElementById('vh-driver-create-offer-btn');
vhDriverCreateOfferBtn?.addEventListener('click', () => {
    navigateTo('vh-driver-form-screen');
});

// === ОБРОБНИКИ ДЛЯ ГРАФІКУ ТА МАРШРУТІВ ===
document.getElementById('show-driver-settings-schedule-btn')?.addEventListener('click', () => {
    UI.renderScheduleEditor();
    navigateTo('driver-settings-schedule-screen');
});

document.getElementById('show-driver-settings-routes-btn')?.addEventListener('click', () => {
    UI.renderPlannedRoutesEditor();
    navigateTo('driver-settings-routes-screen');
});

// Збереження графіку
document.getElementById('save-schedule-btn')?.addEventListener('click', () => {
    const schedule = {};
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    
    days.forEach(day => {
        const checkbox = document.getElementById(`schedule-${day}-enabled`);
        const timeFrom = document.getElementById(`schedule-${day}-from`);
        const timeTo = document.getElementById(`schedule-${day}-to`);
        
        if (checkbox?.checked && timeFrom?.value && timeTo?.value) {
            schedule[day] = `${timeFrom.value}-${timeTo.value}`;
        }
    });
    
    const driver = drivers_database[0];
    driver.schedule = Object.keys(schedule).length > 0 ? schedule : null;
    saveState();
    
    alert('Графік збережено!');
    navigateTo('driver-settings-screen');
});

// Очищення графіку
document.getElementById('clear-schedule-btn')?.addEventListener('click', () => {
    if (confirm('Видалити весь графік роботи?')) {
        const driver = drivers_database[0];
        driver.schedule = null;
        saveState();
        alert('Графік очищено');
        navigateTo('driver-settings-screen');
    }
});

// Додавання нового маршруту
document.getElementById('add-planned-route-btn')?.addEventListener('click', () => {
    const driver = drivers_database[0];
    if (driver.plannedRoutes.length >= 3) {
        alert('Ви можете створити максимум 3 заплановані маршрути');
        return;
    }
    UI.renderWeekdaySelector();
    setupSeatCounter('planned-route-minus-btn', 'planned-route-plus-btn', 'planned-route-seats-display');
    navigateTo('driver-create-planned-route-screen');
});

// Збереження запланованого маршруту
document.getElementById('save-planned-route-btn')?.addEventListener('click', () => {
    const from = document.getElementById('planned-route-from')?.value.trim();
    const to = document.getElementById('planned-route-to')?.value.trim();
    const time = document.getElementById('planned-route-time')?.value;
    const seats = document.getElementById('planned-route-seats-display')?.textContent;
    
    const selectedDays = [];
    document.querySelectorAll('.weekday-btn.active').forEach(btn => {
        selectedDays.push(btn.dataset.day);
    });
    
    if (!from || !to || !time || selectedDays.length === 0) {
        alert('Заповніть всі поля: маршрут, дні тижня та час');
        return;
    }
    
    const driver = drivers_database[0];
    if (driver.plannedRoutes.length >= 3) {
        alert('Максимум 3 маршрути');
        return;
    }
    
    const newRoute = {
        id: Date.now(),
        from: from,
        to: to,
        days: selectedDays,
        time: time,
        seats: parseInt(seats)
    };
    
    driver.plannedRoutes.push(newRoute);
    saveState();
    
    alert('Маршрут збережено!');
    navigateTo('driver-settings-routes-screen');
    UI.renderPlannedRoutesEditor();
});

// == ЛОГІКА ДЛЯ НОВОГО ЕКРАНУ ВИБОРУ ДІЇ ВОДІЯ ==
choiceCreateTripBtn?.addEventListener('click', () => {
    // Ведемо на новий екран вибору типу поїздки
    navigateTo('driver-create-trip-choice-screen');
});


choiceFindPassengersBtn?.addEventListener('click', () => {
    // Змінюємо ціль для кнопки "Назад" на екрані, куди ми переходимо
    const targetBackBtn = document.querySelector('#driver-find-passengers-screen .btn-back');
    if (targetBackBtn) {
        targetBackBtn.dataset.target = 'driver-create-choice-screen';
    }

    // А тепер переходимо
    navigateTo('driver-find-passengers-screen');
    displayDriverOrders();
});

// Обробники для екрану вибору типу поїздки
const choiceValkyKharkivBtn = document.getElementById('choice-valky-kharkiv');
const choiceCustomRouteBtn = document.getElementById('choice-custom-route');

choiceValkyKharkivBtn?.addEventListener('click', () => {
    // Переводимо водія на знайому нам форму створення пропозиції "Валки-Харків"
    navigateTo('vh-driver-form-screen');
});

choiceCustomRouteBtn?.addEventListener('click', () => {
    // Ведемо водія на новий екран створення кастомної поїздки
    navigateTo('driver-create-custom-trip-screen');
});



// Обробник для кнопки "Назад" на екрані деталей активної поїздки водія
document.querySelector('#driver-active-trip-details-screen .btn-back')?.addEventListener('click', () => navigateTo('driver-orders-screen'));


    // --- Обробники логіки "Швидкого замовлення" ---
    
    // КРОК 1: АДРЕСА
    settlementButtons.forEach(button => {
        button.addEventListener('click', () => {
            const group = button.dataset.group;
            const type = button.dataset.type;
            document.querySelectorAll(`.btn-settlement[data-group="${group}"]`).forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            if (group === 'from') {
                fromVillageContainer.style.display = type === 'village' ? 'block' : 'none';
            } else {
                toVillageContainer.style.display = type === 'village' ? 'block' : 'none';
            }
            UI.checkAddressInputs();
        });
    });
    fromAddressInput.addEventListener('input', UI.checkAddressInputs);
    toAddressInput.addEventListener('input', UI.checkAddressInputs);
    fromVillageSelect.addEventListener('change', UI.checkAddressInputs);
    toVillageSelect.addEventListener('change', UI.checkAddressInputs);
    addressNextBtn.addEventListener('click', () => {
    if (addressNextBtn.classList.contains('disabled')) return;
    const fromType = document.querySelector('.btn-settlement[data-group="from"].active').dataset.type;
    const toType = document.querySelector('.btn-settlement[data-group="to"].active').dataset.type;
    
    let fromAddress = fromAddressInput.value.trim();
    if (fromType === 'village' && fromVillageSelect.value) {
        fromAddress = `${fromVillageSelect.value}, ${fromAddress}`;
    }
    orderData.from = fromAddress;

    let toAddress = toAddressInput.value.trim();
    if (toType === 'village' && toVillageSelect.value) {
        toAddress = `${toVillageSelect.value}, ${toAddress}`;
    }
    orderData.to = toAddress;

    UI.updateSummary();
    UI.goToStep('time');
});


    // КРОК 2: ЧАС
    editTimeBtn.addEventListener('click', () => {
        orderData.time = null; // Скидаємо час
        timeChoiceContainer.style.display = 'flex';
        timeResultContainer.style.display = 'none';
        pickerInput.style.display = 'none';
        UI.updateSummary(); // Оновлюємо картку (вона сховається, бо часу немає)
    });

    timeChoiceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const choice = e.currentTarget.dataset.timeChoice;
            
            if (choice === 'now') {
                const now = new Date();
                const timeString = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
                const finalTime = `Зараз (${timeString})`;
                
                // 1. ВАЖЛИВО: Зберігаємо дані ТУТ
                orderData.time = finalTime;
                
                // 2. Оновлюємо інтерфейс
                UI.showTimeResult(finalTime);
                UI.updateSummary(); 
                
            } else {
                pickerInput.style.display = 'block';
                // Ховаємо кнопки вибору, щоб не заважали
                timeChoiceContainer.style.display = 'none'; 
                
                let pickerOptions = {
                    enableTime: true, 
                    minDate: "today", 
                    time_24hr: true,
                    onClose: function(selectedDates, dateStr) {
                        if (selectedDates.length > 0) { 
                            // 1. ВАЖЛИВО: Зберігаємо дані ТУТ
                            orderData.time = dateStr;
                            
                            // 2. Оновлюємо інтерфейс
                            UI.showTimeResult(dateStr); 
                            UI.updateSummary();
                        } else { 
                            // Якщо нічого не обрали і закрили - повертаємо кнопки
                            timeChoiceContainer.style.display = 'flex';
                            pickerInput.style.display = 'none';
                        }
                    }
                };
                
                if (choice === 'today') {
                    pickerOptions.noCalendar = true;
                    pickerOptions.defaultDate = new Date();
                    pickerOptions.dateFormat = "H:i";
                    // Якщо треба змінити текст в UI перед відкриттям, робимо це тут вручну, а не через showTimeResult
                } else {
                    pickerOptions.dateFormat = "d.m.Y H:i";
                }
                
                flatpickr(pickerInput, pickerOptions).open();
            }
        });
        
    });

// Новий обробник для кнопки "Далі" на кроці вибору часу
timeNextBtn?.addEventListener('click', () => {
    if (!orderData.time) {
        alert("Будь ласка, оберіть час поїздки");
        return;
    }
    orderData.comment = document.getElementById('comment').value.trim();
    
    // Перевіряємо, чи є у юзера картка
    if (fakeUserHasCard) {
        paymentCardBtn.classList.remove('disabled');
    } else {
        paymentCardBtn.classList.add('disabled');
    }
    
    UI.goToStep('payment');
    submitOrderBtn.classList.add('disabled');
});


// Оновлений обробник для фінальної кнопки "Відправити замовлення"
// Оновлений обробник: ТЕПЕР ВЕДЕ НА CONFIRMATION SCREEN
submitOrderBtn.addEventListener('click', () => {
    // 1. Формуємо дані
    orderData.passengerName = "Віта"; 
    orderData.rating = 4.8;
    orderData.id = Date.now();
    orderData.status = 'searching';

    // Перевірка на конкретного водія
    const driverIdString = currentOfferIdForConfirmation?.replace('driver_', '');
    if (driverIdString) {
        const driverId = parseInt(driverIdString);
        orderData.specificDriverId = driverId;
    }

    // 2. Додаємо в базу
    orders_database.push(orderData);
    saveState();
    
    // 3. Скидаємо "пам'ять"
    currentOfferIdForConfirmation = null;

    // 4. Оновлюємо текст на екрані підтвердження (динамічно)
    const confTitle = document.querySelector('.conf-title');
    const confText = document.querySelector('.conf-text');
    
    if (confTitle) confTitle.textContent = `Замовлення #${orderData.id.toString().slice(-4)}`;
    
    // 5. Очищаємо форму
    UI.resetQuickOrder();

    // 6. ПОКАЗУЄМО ЕКРАН ПІДТВЕРДЖЕННЯ (Тепер він існує!)
    navigateTo('order-confirmation-screen');
});

// І не забудь додати обробник для кнопки всередині цього екрану:
document.getElementById('go-to-my-orders-btn')?.addEventListener('click', () => {
    // Готуємо екран "Мої поїздки"
    const searchingCard = document.getElementById('searching-card');
    const activeTripCard = document.getElementById('active-trip-card');
    if(searchingCard) searchingCard.style.display = 'block';
    if(activeTripCard) activeTripCard.style.display = 'none';
    
    navigateTo('passenger-orders-screen');
});

// --- Обробники для вибору способу оплати (Додано новий блок з Кроку Б) ---
function handlePaymentChoice(choice) {
    // Зберігаємо вибір
    orderData.paymentMethod = choice;
    
    // Оновлюємо вигляд кнопок
    paymentCashBtn.classList.remove('active');
    paymentCardBtn.classList.remove('active');
    
    if (choice === 'cash') {
        paymentCashBtn.classList.add('active');
        document.getElementById('card-payment-note').style.display = 'none';
    } else if (choice === 'card') {
        paymentCardBtn.classList.add('active');
        document.getElementById('card-payment-note').style.display = 'block';
    }

    // Робимо фінальну кнопку активною
    submitOrderBtn.classList.remove('disabled');
}

paymentCashBtn?.addEventListener('click', () => handlePaymentChoice('cash'));
paymentCardBtn?.addEventListener('click', () => {
    // Якщо кнопка неактивна - показуємо попередження
    if (paymentCardBtn.classList.contains('disabled')) {
        alert('Ви не додали метод оплати онлайн. Перейдіть в налаштування, щоб додати картку.');
        // В майбутньому тут буде красиве модальне вікно з кнопкою "Додати"
        return;
    }
    // Якщо все ок - обробляємо клік
    handlePaymentChoice('card');
});

// === ЛОГІКА КНОПКИ "МОЇ ПОЇЗДКИ" НА ЕКРАНІ ПІДТВЕРДЖЕННЯ ===

goToMyOrdersBtn?.addEventListener('click', () => {
    // 1. Готуємо екран "Мої поїздки"
    // (Показуємо картку пошуку, бо ми ж щойно замовили)
    const searchingCard = document.getElementById('searching-card');
    const activeTripCard = document.getElementById('active-trip-card');
    
    if (searchingCard) searchingCard.style.display = 'block';
    if (activeTripCard) activeTripCard.style.display = 'none';

    // 2. Переходимо на екран
    navigateTo('passenger-orders-screen');
});


// Розумна кнопка "Назад"
backButtons.forEach(button => {
    button.addEventListener('click', () => {
        const currentScreen = button.closest('.screen');

        // Особлива логіка для "Швидкого замовлення"
        if (currentScreen && currentScreen.id === 'quick-order-screen') {
            const isOnTimeStep = timeStep.classList.contains('active');
            const isOnPaymentStep = paymentStep.classList.contains('active');

            if (isOnTimeStep) {
                UI.goToStep('address'); // З кроку "Час" повертаємось на "Адресу"
            } else if (isOnPaymentStep) {
                UI.goToStep('time'); // З кроку "Оплата" повертаємось на "Час"
            } else {
                // Якщо ми на першому кроці, показуємо алерт
                if (confirm('Скасувати оформлення замовлення? Всі дані буде втрачено.')) {
                    navigateTo('passenger-home-screen'); // І повертаємось на правильний екран
                }
            }
        } else {
            // Стандартна логіка для всіх інших екранів
            const target = button.dataset.target || 'home-screen'; // 'home-screen' тут як запасний варіант
            navigateTo(target);
        }
    });
});



// === ЛОГІКА КЕРУВАННЯ ПОЇЗДКОЮ (ВОДІЙ) v4.0 - УНІФІКОВАНО ===
driverArrivedBtn?.addEventListener('click', () => {
    if (active_trips.length === 0) return;

    // 1. Змінюємо статус поїздки в базі даних
    const trip = active_trips[0];
    trip.status = 'arrived';
    saveState(); // Зберігаємо новий стан

    // 2. Створюємо сповіщення для пасажира (це в тебе вже було і працює добре)
    const newNotification = {
        id: Date.now(),
        userId: trip.passengerId || 1,
        text: `<strong>Водій прибув!</strong> Ваш водій очікує на вас.`,
        type: 'driver_arrived',
        isRead: false
    };
    notifications_database.push(newNotification);
    saveState();

    // 3. Оновлюємо інтерфейс для ОБОХ користувачів
    updateAllDriverTripViews(); // Оновлює вигляд для водія
    updateHomeScreenView('passenger'); // Оновлює вигляд для пасажира

    // 4. Оновлюємо стан самих кнопок
    driverArrivedBtn.classList.add('disabled');
    driverStartTripBtn.classList.remove('disabled');

    alert('Пасажира сповіщено, що ви прибули!');
});


driverStartTripBtn?.addEventListener('click', () => {
    if (active_trips.length === 0) return;

    
    const trip = active_trips[0];
    trip.status = 'in_progress';
    saveState();

    
    updateAllDriverTripViews();
    updateHomeScreenView('passenger');

    driverStartTripBtn.classList.add('disabled');
    driverFinishTripBtn.classList.remove('disabled');

    
    alert('Поїздку розпочато!');
});


driverFinishTripBtn?.addEventListener('click', () => {
    if (active_trips.length === 0) {
        alert('Помилка: не знайдено активних поїздок для завершення.');
        return;
    }

    // 1. Копіюємо поїздку, що завершується
    const finishedTrip = active_trips[0];
    const passengerId = finishedTrip.passengerId;

    // 2. Додаємо її в архіви обох користувачів
    driver_archive.push(finishedTrip);
    passenger_archive.push(finishedTrip);

    // 3. Видаляємо з масиву активних поїздок
    active_trips.splice(0, 1);
    saveState(); // Зберігаємо всі зміни в базах

    // 4. Створюємо сповіщення для пасажира про оцінку
    const passenger = passengers_database.find(p => p.id === passengerId);
    if (passenger) {
        const newNotification = {
            id: Date.now(),
            userId: passenger.id,
            text: `<strong>Поїздку завершено.</strong> Дякуємо! Не забудьте оцінити водія.`,
            type: 'trip_finished',
            isRead: false
        };
        notifications_database.push(newNotification);
        saveState();
    }

    // 5. Оновлюємо інтерфейс для обох, щоб їх екрани повернулись до початкового стану
    updateAllDriverTripViews();
    updateHomeScreenView('passenger'); // <-- ВАЖЛИВЕ ДОПОВНЕННЯ

    // 6. Скидаємо стан кнопок керування до початкового
    driverArrivedBtn.classList.remove('disabled');
    driverStartTripBtn.classList.add('disabled');
    driverFinishTripBtn.classList.add('disabled');

    alert('Поїздку успішно завершено!');
    navigateTo('driver-home-screen'); // Повертаємо водія на головний екран
});


// === ЛОГІКА ЕКРАНУ ОЦІНКИ ПОЇЗДКИ ===
let currentRating = 0;

function updateStars(rating) {
    ratingStars.forEach(star => {
        if (star.dataset.value <= rating) {
            star.classList.add('fa-solid');
            star.classList.remove('fa-regular');
        } else {
            star.classList.add('fa-regular');
            star.classList.remove('fa-solid');
        }
    });
}

ratingStars.forEach(star => {
    star.addEventListener('mouseover', () => {
        updateStars(star.dataset.value);
    });

    star.addEventListener('mouseout', () => {
        updateStars(currentRating); // Повертаємо до обраного рейтингу
    });

    star.addEventListener('click', () => {
        currentRating = star.dataset.value;
        if(submitRatingBtn) submitRatingBtn.classList.remove('disabled'); // Активуємо кнопку
        updateStars(currentRating);
    });
});

submitRatingBtn?.addEventListener('click', () => {
    if (currentRating > 0) {
        const comment = document.getElementById('trip-comment').value.trim();
        alert(`Дякуємо за оцінку! Ваш рейтинг: ${currentRating} зірок. Коментар: "${comment}"`);

        // === НОВИЙ КОД: ДОДАЄМО ПОЇЗДКУ В АРХІВ ===
        // Створюємо копію замовлення, щоб не втратити дані
        const finishedOrder = { ...orderData }; 
        passenger_archive.push(finishedOrder);
        driver_archive.push(finishedOrder); // Поки що додаємо те саме і водію
        // ===========================================

        globalOrderStatus = 'searching';

        // Ховаємо активну картку і показуємо знову екран пошуку
        const searchingCard = document.getElementById('searching-card');
        const activeTripCard = document.getElementById('active-trip-card');
        if(searchingCard) searchingCard.style.display = 'block';
        if(activeTripCard) activeTripCard.style.display = 'none';

        // Скидаємо все інше
        currentRating = 0;
        updateStars(0);
        document.getElementById('trip-comment').value = '';
        submitRatingBtn.classList.add('disabled');
        navigateTo('passenger-home-screen');
    }
});




// =================================================================
// == ОБ'ЄДНАНИЙ БЛОК КЕРУВАННЯ ХЕДЕРАМИ (НОВА ВЕРСІЯ) ==
// =================================================================



// --- Клікабельні дзвіночки в хедері ---
document.getElementById('passenger-notifications-btn-home')?.addEventListener('click', () => handleNotificationClick('passenger'));
document.getElementById('driver-notifications-btn-home')?.addEventListener('click', () => handleNotificationClick('driver'));

function handleNotificationClick(userType) {
    // Знаходимо обидва значки сповіщень (в хедері і на головному екрані)
    const badgeHome = document.getElementById(`${userType}-notification-badge-home`);
    const badgeMain = document.getElementById(`${userType}-notification-badge`);

    if (badgeHome) {
        badgeHome.classList.add('hidden');
        badgeHome.textContent = '';
    }
    if (badgeMain) {
        badgeMain.classList.add('hidden');
        badgeMain.textContent = '';
    }
    
    // Позначаємо всі сповіщення як прочитані
    notifications_database.forEach(n => {
        if (n.userId === 1) { // Поки що хардкод для нашого єдиного юзера
            n.isRead = true;
        }
    });

    showUserNotifications(userType);
    navigateTo('notifications-screen');
}

// == ЛОГІКА ДЛЯ МІНІ-КАРТКИ ПРОФІЛЮ (ПОПАП) v2.0 ==
const profilePopup = document.getElementById('profile-popup');
const popupOverlay = document.getElementById('popup-overlay'); // Наш новий оверлей
const driverProfileBadge = document.querySelector('#driver-home-screen .profile-badge');
const passengerProfileBadge = document.querySelector('#passenger-home-screen .profile-badge');

const popupViewProfileBtn = document.getElementById('popup-view-profile-btn');



// Обробники кліків на іконки в хедері
driverProfileBadge?.addEventListener('click', () => {
    if (profilePopup.classList.contains('visible')) {
        UI.hideProfilePopup();
    } else {
        const driver = drivers_database[0];
        // 1. Готуємо дані для відображення
        const driverData = {
            icon: 'fa-solid fa-user-tie',
            name: driver.name,
            details: `${driver.rating.toFixed(1)} ★ • ${driver.trips} поїздок`
        };
        // 2. Просимо UI показати попап з цими даними
        UI.showProfilePopup(driverData);

        // 3. Налаштовуємо, що станеться при кліку на кнопку в попапі
        popupViewProfileBtn.onclick = () => {
            UI.displayDriverProfile(driver.id);
            navigateTo('driver-full-profile-screen');
            UI.hideProfilePopup();
        };
    }
});


passengerProfileBadge?.addEventListener('click', () => {
    if (profilePopup.classList.contains('visible')) {
        UI.hideProfilePopup();
    } else {
        const passenger = passengers_database[0];
        const passengerData = {
            icon: 'fa-solid fa-user',
            name: passenger.name,
            details: `${passenger.trips} поїздок`
        };
        UI.showProfilePopup(passengerData);

        popupViewProfileBtn.onclick = () => {
            UI.displayPassengerProfile(passenger.id);
            navigateTo('passenger-full-profile-screen');
            UI.hideProfilePopup();
        };
    }
});


// Нова, надійна логіка закриття: клік по оверлею = закрити все
popupOverlay?.addEventListener('click', UI.hideProfilePopup);


// == ЛОГІКА ДЛЯ КНОПКИ "ВІДГУКНУТИСЬ" (ОПТИМАЛЬНА ВЕРСІЯ) ==
if (requestListContainer) {
    requestListContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('.btn-main-action.accept[data-request-id]');
        if (!targetButton) return;

        const requestId = targetButton.dataset.requestId;
        const request = vh_requests_database.find(r => r.id == requestId);
        
        if (request) {
            const passenger = passengers_database.find(p => p.id === request.passengerId);
            const passengerName = passenger ? passenger.name : 'Невідомий пасажир';

            const driverAvailableSeats = 4;
            if (request.seats > driverAvailableSeats) {
                alert(`Недостатньо місць. Пасажиру потрібно ${request.seats}, а у вас є ${driverAvailableSeats}.`);
                return;
            }

            const newActiveVhTrip = {
    ...request,
    driverId: 1,
    passengerName: passengerName,
    status: 'pending' // <-- ДОДАЄМО ПОЧАТКОВИЙ СТАТУС
};


            active_trips.push(newActiveVhTrip);

            const requestIndex = vh_requests_database.findIndex(r => r.id == requestId);
            if (requestIndex > -1) {
                vh_requests_database.splice(requestIndex, 1);
            }

            if (passenger) {
    const newNotification = {
        id: Date.now(),
        userId: passenger.id,
        text: `<strong>Ваш запит прийнято!</strong> Водій <strong>Сергій</strong> погодився на поїздку.`,
        type: 'trip_confirmed',
        isRead: false
    };
    notifications_database.push(newNotification);
    saveState();
    const passengerBadge = document.getElementById('passenger-notification-badge-home');
    if (passengerBadge) {
        const unreadCount = notifications_database.filter(n => !n.isRead && n.userId === passenger.id).length;
        if (unreadCount > 0) {
           passengerBadge.textContent = unreadCount;
           passengerBadge.classList.remove('hidden');
        }
    }
    
    updateHomeScreenView('passenger'); 
}

            
            alert('Запит прийнято! Поїздка з\'явиться у розділі "Мої замовлення".');
            updateHomeScreenView('driver'); // <-- ПРАВИЛЬНЕ МІСЦЕ
            displayVhRequests();
            navigateTo('driver-home-screen');
        }
    });
}

const devCreateTestTripBtn = document.getElementById('dev-create-test-trip');
devCreateTestTripBtn?.addEventListener('click', () => {
    const testTrip = {
        id: Date.now(),
        passengerId: 1,
        passengerName: 'Тестовий Пасажир',
        passengerRating: 5.0,
        from: 'Точка А (тест)',
        to: 'Точка Б (тест)',
        time: 'Зараз',
        type: 'taxi' // Додаємо тип, щоб відрізняти
    };
    active_trips = [testTrip]; // Перезаписуємо базу, щоб була тільки одна тестова поїздка
    saveState();
    alert('Тестову поїздку створено!');
    updateHomeScreenView('driver');
    updateHomeScreenView('passenger');
});


// Ініціалізуємо всі наші лічильники
setupSeatCounter('vh-pass-minus-btn', 'vh-pass-plus-btn', 'vh-pass-seats-display');
setupSeatCounter('custom-trip-minus-btn', 'custom-trip-plus-btn', 'custom-trip-seats-display');
setupSeatCounter('vh-driver-minus-btn', 'vh-driver-plus-btn', 'vh-driver-seats-display');

// == ЧІТЕРСЬКА ЛОГІКА ДЛЯ ШВИДКОЇ ЗМІНИ РОЛЕЙ (ДЛЯ ТЕСТУВАННЯ) ==
const devSwitchToPassengerBtn = document.getElementById('dev-switch-to-passenger');
const devSwitchToDriverBtn = document.getElementById('dev-switch-to-driver');

devSwitchToPassengerBtn?.addEventListener('click', () => {
    // Ховаємо все водійське
    document.getElementById('driver-tab-bar').classList.add('hidden');
    // Показуємо все пасажирське
    document.getElementById('passenger-tab-bar').classList.remove('hidden');
    navigateTo('passenger-home-screen');
    updateHomeScreenView('passenger'); // <-- ОСЬ ЦЕЙ ВАЖЛИВИЙ РЯДОК
});

devSwitchToDriverBtn?.addEventListener('click', () => {
    // ...
    navigateTo('driver-home-screen');
    updateAllDriverTripViews(); // <--- ЗАМІНА
    updateFabButtonState(); // <--- Теж оновимо кнопку
});
});
