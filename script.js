document.addEventListener('DOMContentLoaded', () => {

    // == 1. ОСНОВНІ НАЛАШТУВАННЯ ==
    let globalOrderStatus = 'searching'; // 'searching', 'trip_active'
    let fakeUserHasCard = false; // Став 'true' для тестування, ніби картка є
    let fakeDriverAcceptsCard = false; // Став 'true', якщо водій приймає картки

    // == 2. ЗБІР ЕЛЕМЕНТІВ DOM ==
    const screens = document.querySelectorAll('.screen');
    const backButtons = document.querySelectorAll('.btn-back');
    const goToMyOrdersBtn = document.getElementById('go-to-my-orders-btn');
// -- Елементи керування поїздкою водія --
    const driverArrivedBtn = document.getElementById('driver-arrived-btn');
    const driverStartTripBtn = document.getElementById('driver-start-trip-btn');
    const driverFinishTripBtn = document.getElementById('driver-finish-trip-btn');

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
        // == ТИМЧАСОВА ЛОГІКА ДЛЯ ПЕРЕМИКАННЯ РОЛЕЙ ==
    const passengerProfileBadge = document.querySelector('#passenger-dashboard .profile-badge');
    const driverProfileBadge = document.querySelector('#driver-dashboard .profile-badge');

    passengerProfileBadge?.addEventListener('click', () => {
        alert('Тимчасовий перехід: Пасажир -> Водій');
        showScreen('driver-dashboard');
    });

    driverProfileBadge?.addEventListener('click', () => {
        alert('Тимчасовий перехід: Водій -> Пасажир');
        showScreen('passenger-dashboard');
    });

    
    // == 3. ОСНОВНІ ФУНКЦІЇ І ЛОГІКА ==
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

    function updateSummary() {
        if (orderData.from || orderData.to) { quickOrderSummaryCard.classList.remove('hidden'); }
        if (orderData.from) { summaryFrom.textContent = orderData.from; summaryFromContainer.style.display = 'flex'; }
        if (orderData.to) { summaryTo.textContent = orderData.to; summaryToContainer.style.display = 'flex'; }
        if (orderData.time) { summaryTime.textContent = orderData.time; summaryTimeContainer.style.display = 'flex'; } 
        else { summaryTimeContainer.style.display = 'none'; }
    }

   function goToStep(stepToShow) {
    addressStep.style.display = 'none';
    timeStep.style.display = 'none';
    paymentStep.style.display = 'none'; // Додано

    if (stepToShow === 'address') {
        addressStep.style.display = 'flex';
    } else if (stepToShow === 'time') {
        timeStep.style.display = 'flex';
    } else if (stepToShow === 'payment') { // Додано
        paymentStep.style.display = 'flex';
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
        document.getElementById('from-address-container').style.display = 'block';
        fromVillageContainer.style.display = 'none';
        document.getElementById('to-address-container').style.display = 'block';
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

    function showTimeResult(text) {
        orderData.time = text;
        timeResultText.textContent = text;
        timeChoiceContainer.style.display = 'none';
        timeResultContainer.style.display = 'flex';
        updateSummary();
    }
    function checkAddressInputs() {
        const fromType = document.querySelector('.btn-settlement[data-group="from"].active').dataset.type;
        const toType = document.querySelector('.btn-settlement[data-group="to"].active').dataset.type;
        const isFromValid = (fromType === 'valky' && fromAddressInput.value.trim() !== '') || (fromType === 'village' && fromVillageSelect.selectedIndex > 0);
        const isToValid = (toType === 'valky' && toAddressInput.value.trim() !== '') || (toType === 'village' && toVillageSelect.selectedIndex > 0);
        if (isFromValid && isToValid) {
            addressNextBtn.classList.remove('disabled');
        } else {
            addressNextBtn.classList.add('disabled');
        }
    }
    // == ЛОГІКА ДЛЯ ЕКРАНУ "МОЇ ПОЇЗДКИ" (ПАСАЖИР) ==
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
        statusIcon.className = 'fa-solid fa-spinner fa-spin';
        statusText.textContent = 'Водій прямує до вас';
        endPoint.classList.remove('arrived');
        carIcon.style.left = '0%';
        dotsContainer.innerHTML = '';
        for (let i = 0; i < 18; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dotsContainer.appendChild(dot);
        }
        window.tripInterval = setInterval(() => {
            progress += (100 / (totalDurationSeconds * 4));
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
   // Тимчасова база даних замовлень
    let orders_database = [];


    const detailsPassengerName = document.getElementById('details-passenger-name');
    const detailsPassengerRating = document.getElementById('details-passenger-rating');
    const detailsFromAddress = document.getElementById('details-from-address');
    const detailsToAddress = document.getElementById('details-to-address');
    const detailsCommentContainer = document.getElementById('details-comment-container');
    const detailsCommentText = document.getElementById('details-comment-text');
    const detailsTotalPrice = document.getElementById('details-total-price');
    const detailsCommission = document.getElementById('details-commission');
    const detailsDriverEarning = document.getElementById('details-driver-earning');
    
    function createDriverOrderCard(order) {
        const li = document.createElement('li');
        li.className = 'order-card driver-view';
        const timeIcon = order.time === 'Зараз' ? '<div class="status-dot online"></div>' : '<i class="fa-solid fa-clock"></i>';
        li.innerHTML = `
            <div class="order-main-info"><div class="passenger-info"><div class="avatar-convex"><i class="fa-solid fa-user"></i></div><div class="passenger-details"><strong>${order.passengerName}</strong><span>${order.rating} <i class="fa-solid fa-star"></i></span></div></div><div class="price-info"><span class="price-amount">~ ${order.price} грн</span><span class="price-label">Ваш дохід</span></div></div>
            <div class="order-route-info"><div class="address-line"><i class="fa-solid fa-circle start-address-icon"></i><span>${order.from}</span></div><div class="address-line"><i class="fa-solid fa-location-dot end-address-icon"></i><span>${order.to}</span></div></div>
            <div class="order-time-info">${timeIcon}<span>${order.time}</span></div>
        `;
        return li;
    }

function displayDriverOrders() {
    const orderList = document.getElementById('driver-order-list');
    if (!orderList) return;
    orderList.innerHTML = '';

    // Правильний цикл forEach
    orders_database.forEach(order => {
        const cardElement = createDriverOrderCard(order);

        // Ця логіка має бути ВСЕРЕДИНІ циклу
        if (order.paymentMethod === 'card' && !fakeDriverAcceptsCard) {
            cardElement.classList.add('disabled-for-driver');
        } else {
            cardElement.addEventListener('click', () => {
                displayOrderDetails(order);
                navigateTo('driver-order-details-screen');
            });
        }

        orderList.appendChild(cardElement);
    });
}

    function displayOrderDetails(order) {
    if(detailsPassengerName) detailsPassengerName.textContent = order.passengerName;
    if(detailsPassengerRating) detailsPassengerRating.innerHTML = `${order.rating} <i class="fa-solid fa-star"></i> • ${Math.floor(Math.random() * 50) + 5} поїздок`;
    if(detailsFromAddress) detailsFromAddress.textContent = order.from;
    if(detailsToAddress) detailsToAddress.textContent = order.to;

    const commission = Math.round(order.price * 0.05);
    if(detailsTotalPrice) detailsTotalPrice.textContent = `${order.price} грн`;
    if(detailsCommission) detailsCommission.textContent = `- ${commission} грн`;
    if(detailsDriverEarning) detailsDriverEarning.textContent = `~ ${order.price - commission} грн`;

    const randomComment = "Буду з дитиною 6 років, потрібно автокрісло.";
    if (Math.random() > 0.5) {
        if(detailsCommentText) detailsCommentText.textContent = randomComment;
        if(detailsCommentContainer) detailsCommentContainer.style.display = 'block';
    } else {
        if(detailsCommentContainer) detailsCommentContainer.style.display = 'none';
    }

    const acceptOrderBtn = document.getElementById('accept-order-btn');
    const declineOrderBtn = document.getElementById('decline-order-btn');

    if(acceptOrderBtn) acceptOrderBtn.onclick = () => {
        globalOrderStatus = 'trip_active'; 

        const activeCard = document.getElementById('driver-active-trip-card');
        if(activeCard) {
            document.getElementById('driver-active-passenger-name').textContent = order.passengerName;
            document.getElementById('driver-active-passenger-rating').innerHTML = `${order.rating} <i class="fa-solid fa-star"></i>`;
            document.getElementById('driver-active-from-address').textContent = order.from;
            document.getElementById('driver-active-to-address').textContent = order.to;
            activeCard.style.display = 'block';

            activeCard.onclick = () => {
                document.getElementById('details-active-passenger-name').textContent = order.passengerName;
                document.getElementById('details-active-passenger-rating').innerHTML = `${order.rating} <i class="fa-solid fa-star"></i>`;
                document.getElementById('details-active-from-address').textContent = order.from;
                document.getElementById('details-active-to-address').textContent = order.to;
                navigateTo('driver-active-trip-details-screen');
            };
        }

        const noOrdersMsg = document.getElementById('no-active-driver-orders');
        if(noOrdersMsg) noOrdersMsg.style.display = 'none';

        navigateTo('driver-orders-screen'); 
        alert('Замовлення прийнято!');
    };

    if(declineOrderBtn) declineOrderBtn.onclick = () => {
        navigateTo('driver-find-passengers-screen');
    };
}





    // == 4. ОБРОБНИКИ ПОДІЙ ==
    
    // --- Навігація ---
    showDriverLoginBtn?.addEventListener('click', () => navigateTo('login-screen-driver'));
    showPassengerLoginBtn?.addEventListener('click', () => navigateTo('login-screen-passenger'));
    driverTelegramLoginBtn?.addEventListener('click', () => navigateTo('driver-dashboard'));
    goToMyOrdersBtn?.addEventListener('click', () => showMyOrdersBtn.click());
    passengerTelegramLoginBtn?.addEventListener('click', () => navigateTo('passenger-dashboard'));
    showMyOrdersBtn?.addEventListener('click', () => {
        navigateTo('passenger-orders-screen');
        const searchingCard = document.getElementById('searching-card');
        const activeTripCard = document.getElementById('active-trip-card');
        if (globalOrderStatus === 'searching') {
            searchingCard.style.display = 'block';
            activeTripCard.style.display = 'none';
        } else {
            searchingCard.style.display = 'none';
            activeTripCard.style.display = 'block';
            runActiveTripSimulation();
        }
    });
    showQuickOrderBtn?.addEventListener('click', () => {
        navigateTo('quick-order-screen');
        resetQuickOrder();
    });
    findDriverBtn?.addEventListener('click', () => navigateTo('passenger-find-driver-screen'));
    showPassengerValkyKharkivBtn?.addEventListener('click', () => navigateTo('passenger-valky-kharkiv-screen'));
    showPassengerBusScheduleBtn?.addEventListener('click', () => navigateTo('passenger-bus-schedule-screen'));
    showPassengerProfileBtn?.addEventListener('click', () => navigateTo('passenger-profile-screen'));
    showPassengerSupportBtn?.addEventListener('click', () => navigateTo('passenger-support-screen'));
    showPassengerSettingsBtn?.addEventListener('click', () => navigateTo('passenger-settings-screen'));
    showHelpBtn?.addEventListener('click', () => navigateTo('help-screen'));
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
            checkAddressInputs();
        });
    });
    fromAddressInput.addEventListener('input', checkAddressInputs);
    toAddressInput.addEventListener('input', checkAddressInputs);
    fromVillageSelect.addEventListener('change', checkAddressInputs);
    toVillageSelect.addEventListener('change', checkAddressInputs);
    addressNextBtn.addEventListener('click', () => {
        if (addressNextBtn.classList.contains('disabled')) return;
        const fromType = document.querySelector('.btn-settlement[data-group="from"].active').dataset.type;
        const toType = document.querySelector('.btn-settlement[data-group="to"].active').dataset.type;
        if (fromType === 'village') {
            let fromAddress = fromVillageSelect.value;
            if (fromAddressInput.value.trim() !== '') { fromAddress += `, ${fromAddressInput.value.trim()}`; }
            orderData.from = fromAddress;
        } else { orderData.from = fromAddressInput.value.trim(); }
        if (toType === 'village') {
            let toAddress = toVillageSelect.value;
            if (toAddressInput.value.trim() !== '') { toAddress += `, ${toAddressInput.value.trim()}`; }
            orderData.to = toAddress;
        } else { orderData.to = toAddressInput.value.trim(); }
        updateSummary();
        goToStep('time');
    });

    // КРОК 2: ЧАС
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
                        if (selectedDates.length > 0) { showTimeResult(dateStr); } 
                        else { editTimeBtn.click(); }
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
    
    goToStep('payment');
    submitOrderBtn.classList.add('disabled');
});


// Оновлений обробник для фінальної кнопки "Відправити замовлення"
submitOrderBtn.addEventListener('click', () => {
    // Додаємо ім'я пасажира (поки фейкове) і унікальний ID
    orderData.passengerName = "Віта"; 
    orderData.rating = 4.8; // теж поки фейковий
    orderData.id = Date.now(); // простий спосіб зробити ID унікальним

    // Додаємо нове замовлення в нашу "базу даних"
    orders_database.push(orderData);

    console.log('НОВЕ ЗАМОВЛЕННЯ ДОДАНО:', orders_database);
    showScreen('order-confirmation-screen');
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



// --- Універсальна і розумна кнопка "Назад" ---
const quickOrderBackButton = document.querySelector('#quick-order-screen .btn-back');
backButtons.forEach(button => {
    button.addEventListener('click', () => {
        const isQuickOrderScreen = button.closest('#quick-order-screen');
        if (isQuickOrderScreen) {
            const isOnTimeStep = timeStep.style.display === 'flex';
            if (isOnTimeStep) {
                editTimeBtn.click();
                goToStep('address');
            } else {
                if (confirm('Скасувати оформлення замовлення? Всі дані буде втрачено.')) {
                    showScreen('passenger-dashboard');
                }
            }
        } else {
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

    // === ЛОГІКА КЕРУВАННЯ ПОЇЗДКОЮ (ВОДІЙ) ===
    driverArrivedBtn?.addEventListener('click', () => {
        alert('Пасажира сповіщено, що ви прибули!');
        driverArrivedBtn.classList.add('disabled');
        driverStartTripBtn.classList.remove('disabled');
        // В майбутньому тут буде пуш-сповіщення для пасажира
    });

    driverStartTripBtn?.addEventListener('click', () => {
        alert('Поїздку розпочато!');
        driverStartTripBtn.classList.add('disabled');
        driverFinishTripBtn.classList.remove('disabled');
        // В майбутньому тут буде пуш-сповіщення для пасажира
    });

    driverFinishTripBtn?.addEventListener('click', () => {
        alert('Поїздку завершено!');
        // Повертаємо водія на головний екран і "обнуляємо" статус
        globalOrderStatus = 'searching';
        navigateTo('driver-dashboard');

        // Ховаємо активну картку і показуємо повідомлення "немає замовлень"
        document.getElementById('driver-active-trip-card').style.display = 'none';
        document.getElementById('no-active-driver-orders').style.display = 'block';

        // І в майбутньому тут буде логіка додавання поїздки в архів
    });

});
