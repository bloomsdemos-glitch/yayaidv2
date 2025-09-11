document.addEventListener('DOMContentLoaded', () => {

    // == 1. ОСНОВНІ НАЛАШТУВАННЯ ==
    let rideState = 'idle';
    let orderDetails = {};
    // == 2. ЗБІР ЕЛЕМЕНТІВ DOM ==
    const screens = document.querySelectorAll('.screen');
    const backButtons = document.querySelectorAll('.btn-back');
    const goToMyOrdersBtn = document.getElementById('go-to-my-orders-btn');

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
       

    // -- Елементи водія --
    const showFindPassengersBtn = document.getElementById('show-find-passengers-btn');
    const showDriverOrdersBtn = document.getElementById('show-driver-orders-btn');
    const showDriverValkyKharkivBtn = document.getElementById('show-driver-valky-kharkiv-btn');
    const showDriverProfileBtn = document.getElementById('show-driver-profile-btn');
    const showDriverHelpBtn = document.getElementById('show-driver-help-btn');
    const showDriverSupportBtn = document.getElementById('show-driver-support-btn');
    const showDriverSettingsBtn = document.getElementById('show-driver-settings-btn');
    
    // -- Елементи налаштувань водія --
    const showDriverSettingsPhotoBtn = document.getElementById('show-driver-settings-photo-btn');
    const showDriverSettingsBioBtn = document.getElementById('show-driver-settings-bio-btn');
    const showDriverSettingsTariffBtn = document.getElementById('show-driver-settings-tariff-btn');
    const showDriverSettingsPaymentBtn = document.getElementById('show-driver-settings-payment-btn');
    const showDriverSettingsPhoneBtn = document.getElementById('show-driver-settings-phone-btn');
    const showDriverSettingsStatusBtn = document.getElementById('show-driver-settings-status-btn');
    const showDriverSettingsPrivacyBtn = document.getElementById('show-driver-settings-privacy-btn');
    const showDriverSettingsDeleteBtn = document.getElementById('show-driver-settings-delete-btn');

    // -- Елементи налаштувань пасажира --
    const showPassengerSettingsPhotoBtn = document.getElementById('show-passenger-settings-photo-btn');
    const showPassengerSettingsBioBtn = document.getElementById('show-passenger-settings-bio-btn');
    const showPassengerSettingsPaymentBtn = document.getElementById('show-passenger-settings-payment-btn');
    const showPassengerSettingsHistoryBtn = document.getElementById('show-passenger-settings-history-btn');
    const showPassengerSettingsPhoneBtn = document.getElementById('show-passenger-settings-phone-btn');
    const showPassengerSettingsStatusBtn = document.getElementById('show-passenger-settings-status-btn');
    const showPassengerSettingsPrivacyBtn = document.getElementById('show-passenger-settings-privacy-btn');
    const showPassengerSettingsDeleteBtn = document.getElementById('show-passenger-settings-delete-btn');

    // == 3. ОСНОВНІ ФУНКЦІЇ ==
    function showScreen(screenId) {
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

    function navigateTo(screenId) {
        setTimeout(() => showScreen(screenId), 250);
    }
// == ЛОГІКА "ШВИДКЕ ЗАМОВЛЕННЯ" v6.1 (фікс кнопки "Далі") ==

// -- 1. Збір елементів DOM --
const quickOrderScreen = document.getElementById('quick-order-screen');
const quickOrderSummaryCard = document.getElementById('quick-order-summary-card');
const summaryFrom = document.getElementById('summary-from');
const summaryTo = document.getElementById('summary-to');
const summaryTime = document.getElementById('summary-time');
const summaryFromContainer = document.getElementById('summary-from-container');
const summaryToContainer = document.getElementById('summary-to-container');
const summaryTimeContainer = document.getElementById('summary-time-container');

// Крок 1: Адреса
const addressStep = document.getElementById('address-step');
const fromAddressInput = document.getElementById('from-address');
const toAddressInput = document.getElementById('to-address');
const addressNextBtn = document.getElementById('address-next-btn');
const settlementButtons = document.querySelectorAll('.btn-settlement');
const fromVillageContainer = document.getElementById('from-village-container');
const toVillageContainer = document.getElementById('to-village-container');
const fromAddressContainer = document.getElementById('from-address-container');
const toAddressContainer = document.getElementById('to-address-container');
const fromVillageSelect = document.getElementById('from-village-select');
const toVillageSelect = document.getElementById('to-village-select');

// Крок 2: Час
const timeStep = document.getElementById('time-step');
const timeChoiceContainer = document.getElementById('time-choice-container');
const timeChoiceButtons = document.querySelectorAll('[data-time-choice]');
const timeResultContainer = document.getElementById('time-result-container');
const timeResultText = document.getElementById('time-result-text');
const editTimeBtn = document.getElementById('edit-time-btn');
const pickerInput = document.getElementById('datetime-picker');
const submitOrderBtn = document.getElementById('submit-order-btn');

let orderData = {};

// -- 2. Функції-хелпери --
function updateSummary() {
    if (orderData.from || orderData.to) { quickOrderSummaryCard.classList.remove('hidden'); }
    if (orderData.from) { summaryFrom.textContent = orderData.from; summaryFromContainer.style.display = 'flex'; }
    if (orderData.to) { summaryTo.textContent = orderData.to; summaryToContainer.style.display = 'flex'; }
    if (orderData.time) { summaryTime.textContent = orderData.time; summaryTimeContainer.style.display = 'flex'; } 
    else { summaryTimeContainer.style.display = 'none'; }
}

function goToStep(stepToShow) {
    if (stepToShow === 'address') {
        addressStep.style.display = 'flex';
        timeStep.style.display = 'none';
    } else if (stepToShow === 'time') {
        addressStep.style.display = 'none';
        timeStep.style.display = 'flex';
    }
}

function resetQuickOrder() {
    orderData = {};
    fromAddressInput.value = '';
    toAddressInput.value = '';
    document.getElementById('comment').value = '';
    quickOrderSummaryCard.classList.add('hidden');
    summaryFromContainer.style.display = 'none';
    summaryToContainer.style.display = 'none';
    summaryTimeContainer.style.display = 'none';
    addressNextBtn.classList.add('disabled');
    
    fromAddressContainer.style.display = 'block';
    fromVillageContainer.style.display = 'none';
    toAddressContainer.style.display = 'block';
    toVillageContainer.style.display = 'none';
    fromVillageSelect.selectedIndex = 0;
    toVillageSelect.selectedIndex = 0;
    
    settlementButtons.forEach(btn => {
        if (btn.dataset.type === 'valky') btn.classList.add('active');
        else btn.classList.remove('active');
    });

    timeChoiceContainer.style.display = 'flex';
    timeResultContainer.style.display = 'none';
    pickerInput.style.display = 'none';
    
    goToStep('address');
}

// Функція для симуляції поїздки
function runActiveTripSimulation() {
    if (window.tripInterval) clearInterval(window.tripInterval);

    const activeCard = document.querySelector('#active-trip-card');
    if (!activeCard || activeCard.style.display === 'none') return;

    const statusIcon = activeCard.querySelector('#status-icon');
    const statusText = activeCard.querySelector('#status-text');
    const carIcon = activeCard.querySelector('#car-icon');
    const dotsContainer = activeCard.querySelector('.dots-container');
    const endPoint = activeCard.querySelector('#progress-end-point');
    
    const totalDurationSeconds = 15;
    let progress = 0;

    // Скидання до початкового стану
    statusIcon.className = 'fa-solid fa-spinner fa-spin';
    statusText.textContent = 'Водій прямує до вас';
    endPoint.classList.remove('arrived');
    carIcon.style.left = '0%';
    dotsContainer.innerHTML = ''; // Очищуємо старі точки

    // Створюємо нові точки
    for (let i = 0; i < 18; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dotsContainer.appendChild(dot);
    }
    
    window.tripInterval = setInterval(() => {
        progress += (100 / (totalDurationSeconds * 4)); // Зробимо анімацію трохи повільнішою
        
        if (progress >= 100) {
            clearInterval(window.tripInterval);
            carIcon.style.left = '100%';
            statusIcon.className = 'fa-solid fa-circle-check';
            statusText.textContent = 'Водій прибув';
            endPoint.classList.add('arrived');
            return;
        }
        carIcon.style.left = `${progress}%`;
    }, 500);
}

// == ЛОГІКА ДЛЯ ЕКРАНУ "ШУКАЮТЬ ВОДІЯ" ==

// 1. Фейкові дані (ніби прийшли з сервера)
const fakeDriverOrders = [
    { passengerName: "Олена", rating: 4.9, from: "вул. Зоряна, 31", to: "Залізничний вокзал", price: 115, time: "Зараз" },
    { passengerName: "Максим", rating: 4.7, from: "с. Ков'яги, вул. Центральна, 5", to: "вул. Музейна, 4", price: 210, time: "14:30" },
    { passengerName: "Ірина", rating: 5.0, from: "лікарня", to: "Центр", price: 85, time: "Зараз" },
    { passengerName: "Сергій", rating: 4.8, from: "вул. Стадіонна, 8", to: "с. Сніжків", price: 180, time: "17:00" },
    { passengerName: "Юлія", rating: 4.9, from: "Посад", to: "Нова пошта", price: 75, time: "Зараз" }
];

// 2. Функція, що створює HTML-код однієї картки замовлення
function createDriverOrderCard(order) {
    const li = document.createElement('li');
    li.className = 'order-card driver-view';

    // Визначаємо іконку для часу
    const timeIcon = order.time === 'Зараз' 
        ? '<div class="status-dot online"></div>' 
        : '<i class="fa-solid fa-clock"></i>';

    li.innerHTML = `
        <div class="order-main-info">
            <div class="passenger-info">
                <div class="avatar-convex"><i class="fa-solid fa-user"></i></div>
                <div class="passenger-details">
                    <strong>${order.passengerName}</strong>
                    <span>${order.rating} <i class="fa-solid fa-star"></i></span>
                </div>
            </div>
            <div class="price-info">
                <span class="price-amount">~ ${order.price} грн</span>
                <span class="price-label">Ваш дохід</span>
            </div>
        </div>
        <div class="order-route-info">
            <div class="address-line">
                <i class="fa-solid fa-circle start-address-icon"></i>
                <span>${order.from}</span>
            </div>
            <div class="address-line">
                <i class="fa-solid fa-location-dot end-address-icon"></i>
                <span>${order.to}</span>
            </div>
        </div>
        <div class="order-time-info">
            ${timeIcon}
            <span>${order.time}</span>
        </div>
    `;
    return li;
}

// 3. Головна функція, що відображає всі замовлення
function displayDriverOrders() {
    const orderList = document.getElementById('driver-order-list');
    if (!orderList) return;

    orderList.innerHTML = ''; // Очищуємо старий приклад з Оленою

    fakeDriverOrders.forEach(order => {
        const cardElement = createDriverOrderCard(order);
        orderList.appendChild(cardElement);
    });
}


// -- 3. Обробники подій --
showQuickOrderBtn?.addEventListener('click', resetQuickOrder);

// ЛОГІКА КРОКУ 1: АДРЕСА v2.0
settlementButtons.forEach(button => {
    button.addEventListener('click', () => {
        const group = button.dataset.group; // 'from' or 'to'
        const type = button.dataset.type; // 'valky' or 'village'

        document.querySelectorAll(`.btn-settlement[data-group="${group}"]`).forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Тепер ми НЕ ховаємо текстове поле, а просто показуємо/ховаємо список сіл
        if (group === 'from') {
            fromVillageContainer.style.display = type === 'village' ? 'block' : 'none';
        } else { // group === 'to'
            toVillageContainer.style.display = type === 'village' ? 'block' : 'none';
        }
        checkAddressInputs(); // Перевіряємо заповненість полів
    });
});

function checkAddressInputs() {
    const fromType = document.querySelector('.btn-settlement[data-group="from"].active').dataset.type;
    const toType = document.querySelector('.btn-settlement[data-group="to"].active').dataset.type;

    // Тепер для села ми перевіряємо тільки вибір зі списку, вулиця - опціональна
    const isFromValid = (fromType === 'valky' && fromAddressInput.value.trim() !== '') || (fromType === 'village' && fromVillageSelect.selectedIndex > 0);
    const isToValid = (toType === 'valky' && toAddressInput.value.trim() !== '') || (toType === 'village' && toVillageSelect.selectedIndex > 0);

    if (isFromValid && isToValid) {
        addressNextBtn.classList.remove('disabled');
    } else {
        addressNextBtn.classList.add('disabled');
    }
}
fromAddressInput.addEventListener('input', checkAddressInputs);
toAddressInput.addEventListener('input', checkAddressInputs);
fromVillageSelect.addEventListener('change', checkAddressInputs);
toVillageSelect.addEventListener('change', checkAddressInputs);

addressNextBtn.addEventListener('click', () => {
    if (addressNextBtn.classList.contains('disabled')) return;
    
    const fromType = document.querySelector('.btn-settlement[data-group="from"].active').dataset.type;
    const toType = document.querySelector('.btn-settlement[data-group="to"].active').dataset.type;

    // "Склеюємо" адресу, якщо обрано село і введена вулиця
    if (fromType === 'village') {
        let fromAddress = fromVillageSelect.value;
        if (fromAddressInput.value.trim() !== '') {
            fromAddress += `, ${fromAddressInput.value.trim()}`;
        }
        orderData.from = fromAddress;
    } else {
        orderData.from = fromAddressInput.value.trim();
    }

    if (toType === 'village') {
        let toAddress = toVillageSelect.value;
        if (toAddressInput.value.trim() !== '') {
            toAddress += `, ${toAddressInput.value.trim()}`;
        }
        orderData.to = toAddress;
    } else {
        orderData.to = toAddressInput.value.trim();
    }
    
    updateSummary();
    goToStep('time');
});


// ЛОГІКА КРОКУ 2: ЧАС
function showTimeResult(text) {
    orderData.time = text;
    timeResultText.textContent = text;
    timeChoiceContainer.style.display = 'none';
    timeResultContainer.style.display = 'flex';
    updateSummary();
}

editTimeBtn.addEventListener('click', () => {
    orderData.time = null;
    timeChoiceContainer.style.display = 'flex';
    timeResultContainer.style.display = 'none';
    pickerInput.style.display = 'none';
    updateSummary();
});

timeChoiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const choice = e.currentTarget.dataset.timeChoice;
        timeChoiceContainer.style.display = 'none';
        if (choice === 'now') {
            const now = new Date();
            const timeString = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
            showTimeResult(`Зараз (${timeString})`);
        } else {
            pickerInput.style.display = 'block';
            let pickerOptions = {
                enableTime: true, minDate: "today", time_24hr: true,
                onClose: function(selectedDates, dateStr) {
                    if (selectedDates.length > 0) {
                        showTimeResult(dateStr);
                    } else {
                        editTimeBtn.click();
                    }
                    pickerInput.style.display = 'none';
                }
            };
            if (choice === 'today') {
                pickerOptions.noCalendar = true;
                pickerOptions.defaultDate = new Date();
                pickerOptions.dateFormat = "H:i";
                timeResultText.textContent = "Оберіть час на сьогодні...";
            } else {
                pickerOptions.dateFormat = "d.m.Y H:i";
                timeResultText.textContent = "Оберіть дату та час...";
            }
            timeResultContainer.style.display = 'flex';
            flatpickr(pickerInput, pickerOptions).open();
        }
    });
});

submitOrderBtn.addEventListener('click', () => {
    orderData.comment = document.getElementById('comment').value.trim();
    if (!orderData.time) {
        alert("Будь ласка, оберіть час поїздки");
        return;
    }
    console.log('ФІНАЛЬНЕ ЗАМОВЛЕННЯ:', orderData);
    showScreen('order-confirmation-screen');
});

    // == 4. ОБРОБНИКИ ПОДІЙ ==

    // --- Навігація з головного екрану та екранів входу ---
    showDriverLoginBtn?.addEventListener('click', () => navigateTo('login-screen-driver'));
    showPassengerLoginBtn?.addEventListener('click', () => navigateTo('login-screen-passenger'));
    driverTelegramLoginBtn?.addEventListener('click', () => navigateTo('driver-dashboard'));
    passengerTelegramLoginBtn?.addEventListener('click', () => navigateTo('passenger-dashboard'));

    // --- Навігація з меню ПАСАЖИРА ---
    showMyOrdersBtn?.addEventListener('click', () => {
    navigateTo('passenger-orders-screen');
    
    // Показуємо картку активної поїздки і запускаємо симуляцію
    document.getElementById('searching-card').style.display = 'none';
    document.getElementById('active-trip-card').style.display = 'block';
    runActiveTripSimulation();
});

    showQuickOrderBtn?.addEventListener('click', () => navigateTo('quick-order-screen'));
    findDriverBtn?.addEventListener('click', () => navigateTo('passenger-find-driver-screen'));
    showPassengerValkyKharkivBtn?.addEventListener('click', () => navigateTo('passenger-valky-kharkiv-screen'));
    showPassengerBusScheduleBtn?.addEventListener('click', () => navigateTo('passenger-bus-schedule-screen'));
    showPassengerProfileBtn?.addEventListener('click', () => navigateTo('passenger-profile-screen'));
    showPassengerSupportBtn?.addEventListener('click', () => navigateTo('passenger-support-screen'));
    showPassengerSettingsBtn?.addEventListener('click', () => navigateTo('passenger-settings-screen'));
    showHelpBtn?.addEventListener('click', () => navigateTo('help-screen'));

    // --- Навігація з меню ВОДІЯ ---
showDriverOrdersBtn?.addEventListener('click', () => navigateTo('driver-orders-screen'));
showFindPassengersBtn?.addEventListener('click', () => {
    navigateTo('driver-find-passengers-screen');
    displayDriverOrders();
});
showDriverValkyKharkivBtn?.addEventListener('click', () => navigateTo('driver-valky-kharkiv-screen'));
showDriverProfileBtn?.addEventListener('click', () => navigateTo('driver-rating-screen'));
showDriverHelpBtn?.addEventListener('click', () => navigateTo('driver-help-screen'));
showDriverSupportBtn?.addEventListener('click', () => navigateTo('driver-support-screen'));
showDriverSettingsBtn?.addEventListener('click', () => navigateTo('driver-settings-screen'));

    // --- Навігація з екрану налаштувань ВОДІЯ ---
    showDriverSettingsPhotoBtn?.addEventListener('click', () => navigateTo('driver-settings-photo-screen'));
    showDriverSettingsBioBtn?.addEventListener('click', () => navigateTo('driver-settings-bio-screen'));
    showDriverSettingsTariffBtn?.addEventListener('click', () => navigateTo('driver-settings-tariff-screen'));
    showDriverSettingsPaymentBtn?.addEventListener('click', () => navigateTo('driver-settings-payment-screen'));
    showDriverSettingsPhoneBtn?.addEventListener('click', () => navigateTo('driver-settings-phone-screen'));
    showDriverSettingsStatusBtn?.addEventListener('click', () => navigateTo('passenger-settings-status-screen'));
    showDriverSettingsPrivacyBtn?.addEventListener('click', () => navigateTo('passenger-settings-privacy-screen'));
    showDriverSettingsDeleteBtn?.addEventListener('click', () => navigateTo('driver-settings-delete-screen'));

    // --- Навігація з екрану налаштувань ПАСАЖИРА ---
    showPassengerSettingsPhotoBtn?.addEventListener('click', () => navigateTo('passenger-settings-photo-screen'));
    showPassengerSettingsBioBtn?.addEventListener('click', () => navigateTo('passenger-settings-bio-screen'));
    showPassengerSettingsPaymentBtn?.addEventListener('click', () => navigateTo('passenger-settings-payment-screen'));
    showPassengerSettingsPhoneBtn?.addEventListener('click', () => navigateTo('passenger-settings-phone-screen'));
    showPassengerSettingsStatusBtn?.addEventListener('click', () => navigateTo('passenger-settings-status-screen'));
    showPassengerSettingsPrivacyBtn?.addEventListener('click', () => navigateTo('passenger-settings-privacy-screen'));
    showPassengerSettingsDeleteBtn?.addEventListener('click', () => navigateTo('passenger-settings-delete-screen'));
    goToMyOrdersBtn?.addEventListener('click', () => navigateTo('passenger-orders-screen'));


    // --- Універсальна і розумна кнопка "Назад" v2.0 ---
backButtons.forEach(button => {
    button.addEventListener('click', () => {
        const isQuickOrderScreen = button.closest('#quick-order-screen');

        if (isQuickOrderScreen) {
            const isOnTimeStep = timeStep.style.display === 'flex';
            
            if (isOnTimeStep) {
                // Якщо ми на кроці вибору ЧАСУ, повертаємось до АДРЕСИ
                editTimeBtn.click(); // Скидаємо вибір часу, повертаючи початкові кнопки
                goToStep('address');
            } else {
                // Ми на кроці вибору АДРЕСИ. Питаємо підтвердження перед виходом.
                if (confirm('Скасувати оформлення замовлення? Всі дані буде втрачено.')) {
                    showScreen('passenger-dashboard');
                }
            }
        } else {
            // Стандартна логіка для всіх інших кнопок "Назад" в додатку
            showScreen(button.dataset.target || 'home-screen');
        }
    });
});



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

document.querySelectorAll(".btn-main, .menu-item").forEach(button => {
    button.addEventListener("click", createRipple);
});

// === ЛОГІКА ЗМІНИ ІКОНОК ПІНІВ ===
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
});