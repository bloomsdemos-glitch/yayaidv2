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
        // -- Елементи екрану "Швидке замовлення" --
    const fromAddressInput = document.getElementById('from-address');
    const toAddressInput = document.getElementById('to-address');
    const btnAddressNext = document.getElementById('btn-address-next');
    const quickOrderSteps = document.querySelectorAll('.order-step');
    const timeOptionButtons = document.querySelectorAll('[data-time-option]');

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
// == НОВА ЛОГІКА ДЛЯ КВІЗУ "ШВИДКЕ ЗАМОВЛЕННЯ" v3.0 ==

// -- 1. Збір елементів DOM для квізу --
const quickOrderSummaryCard = document.getElementById('quick-order-summary-card');
const summaryFromContainer = document.getElementById('summary-from-container');
const summaryToContainer = document.getElementById('summary-to-container');
const summaryTimeContainer = document.getElementById('summary-time-container');
const summaryFrom = document.getElementById('summary-from');
const summaryTo = document.getElementById('summary-to');
const summaryTime = document.getElementById('summary-time');

const quizSteps = document.querySelectorAll('#quiz-container .order-step');
const fromAddressInput_quiz = document.getElementById('from-address');
const toAddressInput_quiz = document.getElementById('to-address');
const timeChoiceButtons_quiz = document.querySelectorAll('[data-time-choice]');
const pickerInput = document.getElementById('datetime-picker');
const btnDetailsNext = document.getElementById('btn-details-next');
const finalSubmitOrderBtn = document.getElementById('submit-order-btn');

// -- 2. Сховище даних та функції-хелпери --
let datePickerHasSelected = false; // Прапорець для боротьби з багом календаря

function goToQuizStep(targetStepId) {
    quizSteps.forEach(step => {
        step.classList.remove('active');
    });
    const targetStep = document.getElementById(targetStepId);
    if (targetStep) {
        targetStep.classList.add('active');
    }
}

function updateSummaryCard() {
    if (orderDetails.from || orderDetails.to || orderDetails.time) {
        quickOrderSummaryCard.classList.remove('hidden');
    }
    if (orderDetails.from) {
        summaryFrom.textContent = orderDetails.from;
        summaryFromContainer.style.display = 'flex';
    }
    if (orderDetails.to) {
        summaryTo.textContent = orderDetails.to;
        summaryToContainer.style.display = 'flex';
    }
    if (orderDetails.time) {
        summaryTime.textContent = orderDetails.time;
        summaryTimeContainer.style.display = 'flex';
    }
}

function resetQuiz() {
    orderDetails = {};
    fromAddressInput_quiz.value = '';
    toAddressInput_quiz.value = '';
    document.getElementById('comment').value = '';
    quickOrderSummaryCard.classList.add('hidden');
    summaryFromContainer.style.display = 'none';
    summaryToContainer.style.display = 'none';
    summaryTimeContainer.style.display = 'none';
    btnAddressNext.classList.add('disabled');
    goToQuizStep('step-address');
}

// -- 3. Логіка для кроків --

// КРОК 1: Адреса
function checkAddressFields() {
    const fromValue = fromAddressInput_quiz.value.trim();
    const toValue = toAddressInput_quiz.value.trim();
    if (fromValue !== '' && toValue !== '') {
        btnAddressNext.classList.remove('disabled');
    } else {
        btnAddressNext.classList.add('disabled');
    }
}
fromAddressInput_quiz?.addEventListener('input', checkAddressFields);
toAddressInput_quiz?.addEventListener('input', checkAddressFields);

btnAddressNext?.addEventListener('click', () => {
    if (!btnAddressNext.classList.contains('disabled')) {
        orderDetails.from = fromAddressInput_quiz.value.trim();
        orderDetails.to = toAddressInput_quiz.value.trim();
        updateSummaryCard();
        goToQuizStep('step-time-choice');
    }
});

// КРОК 2: Вибір часу (нова логіка з 3 кнопками)
timeChoiceButtons_quiz.forEach(button => {
    button.addEventListener('click', () => {
        const choice = button.dataset.timeChoice;
        datePickerHasSelected = false; 

        if (choice === 'now') {
            const now = new Date();
            const timeString = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
            orderDetails.time = `Зараз (${timeString})`;
            updateSummaryCard();
            goToQuizStep('step-details');
            return;
        }
        
        let pickerOptions = {
            enableTime: true, minDate: "today", time_24hr: true,
            onChange: function(selectedDates, dateStr) {
                datePickerHasSelected = true;
            },
            onClose: function(selectedDates, dateStr) {
                if (datePickerHasSelected) {
                    orderDetails.time = dateStr;
                    updateSummaryCard();
                    document.getElementById('later-time-picker').classList.add('hidden');
                    goToQuizStep('step-details');
                }
            }
        };

        if (choice === 'today') {
            pickerOptions.noCalendar = true;
            pickerOptions.dateFormat = "H:i";
        } else { // choice === 'date'
            pickerOptions.dateFormat = "d.m.Y H:i";
        }
        
        document.getElementById('later-time-picker').classList.remove('hidden');
        flatpickr(pickerInput, pickerOptions).open();
    });
});

// КРОК 3: Деталі
btnDetailsNext?.addEventListener('click', () => {
    orderDetails.comment = document.getElementById('comment').value.trim();
    goToQuizStep('step-final-confirm');
});

// КРОК 4: Фінальне підтвердження
finalSubmitOrderBtn?.addEventListener('click', () => {
    console.log('ФІНАЛЬНЕ ЗАМОВЛЕННЯ:', orderDetails);
    showScreen('order-confirmation-screen');
});

// Запуск/скидання квізу при відкритті екрану
showQuickOrderBtn?.addEventListener('click', () => {
    showScreen('quick-order-screen');
    resetQuiz();
});






    // == 4. ОБРОБНИКИ ПОДІЙ ==

    // --- Навігація з головного екрану та екранів входу ---
    showDriverLoginBtn?.addEventListener('click', () => navigateTo('login-screen-driver'));
    showPassengerLoginBtn?.addEventListener('click', () => navigateTo('login-screen-passenger'));
    driverTelegramLoginBtn?.addEventListener('click', () => navigateTo('driver-dashboard'));
    passengerTelegramLoginBtn?.addEventListener('click', () => navigateTo('passenger-dashboard'));

    // --- Навігація з меню ПАСАЖИРА ---
    showMyOrdersBtn?.addEventListener('click', () => navigateTo('passenger-orders-screen'));
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
    showFindPassengersBtn?.addEventListener('click', () => navigateTo('driver-find-passengers-screen'));
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


    // --- Універсальна кнопка "Назад" ---
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            showScreen(button.dataset.target || 'home-screen');
        });
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
