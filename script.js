document.addEventListener('DOMContentLoaded', () => {

    // == 1. ГЛОБАЛЬНІ ЗМІННІ ТА СТАН ДОДАТКУ ==
    let globalOrderStatus = 'searching';
    let fakeUserHasCard = false;
    let fakeDriverAcceptsCard = false;
    
    // -- Тимчасові бази даних --
    let passenger_archive = [];
    let driver_archive = [];
    let orders_database = [];
    // Тимчасова база даних водіїв
    const drivers_database = [
        {
            id: 1,
            name: 'Сергій Авдєєв',
            rating: 4.9,
            trips: 152,
            car: 'Skoda Octavia, сірий',
            tags: [
                { icon: 'fa-solid fa-music', text: 'Рок/Альтернатива' },
                { icon: 'fa-solid fa-paw', text: 'Можна з тваринами' },
                { icon: 'fa-solid fa-ban-smoking', text: 'Не палю' }
            ],
            reviews: [
                { name: 'Вікторія', rating: 5.0, text: 'Дуже приємний водій, комфортна поїздка. Дякую!' },
                { name: 'Олексій', rating: 5.0, text: 'Все супер, швидко і безпечно.' },
                { name: 'Марина', rating: 4.0, text: 'В салоні був трохи дивний запах, але в цілому нормально.' }
            ]
        },
        {
            id: 2,
            name: 'Олена Петренко',
            rating: 5.0,
            trips: 211,
            car: 'Renault Megane, білий',
            tags: [
                { icon: 'fa-solid fa-volume-xmark', text: 'Тиша в салоні' },
                { icon: 'fa-solid fa-child', text: 'Є дитяче крісло' }
            ],
            reviews: [
                { name: 'Іван', rating: 5.0, text: 'Найкраща водійка в місті!' }
            ]
        }
    ];
    // Тимчасова база даних пасажирів
    const passengers_database = [
        {
            id: 1,
            name: 'Віта Бондаренко',
            trips: 27,
            bio: 'Люблю подорожувати з комфортом та гарною музикою.',
            reviews: [] // Поки що відгуків немає
        }
    ];
    // Тимчасова база даних запитів на поїздки Валки-Харків
    const vh_requests_database = [];
    // Тимчасова база даних пропозицій від водіїв на маршруті В-Х
    const vh_offers_database = [];


    // == 2. ЗБІР ЕЛЕМЕНТІВ DOM ==
    const screens = document.querySelectorAll('.screen');
    const backButtons = document.querySelectorAll('.btn-back');
    const goToMyOrdersBtn = document.getElementById('go-to-my-orders-btn');
    
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
    const vhDriverCreateOfferBtn = document.getElementById('vh-driver-create-offer-btn');
    
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
    
    // -- Функція перемикання екранів --
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
    const timeChoiceButtons = document.querySelectorAll('#quick-order-screen [data-time-choice]');
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
        addressStep.classList.remove('active');
        timeStep.classList.remove('active');
        paymentStep.classList.remove('active');

        if (stepToShow === 'address') {
            addressStep.classList.add('active');
        } else if (stepToShow === 'time') {
            timeStep.classList.add('active');
        } else if (stepToShow === 'payment') {
            paymentStep.classList.add('active');
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
        if (!activeCard || activeCard.classList.contains('hidden')) return;
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
        orders_database.forEach(order => {
            const cardElement = createDriverOrderCard(order);
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
            const passengerSearchingCard = document.getElementById('searching-card');
            const passengerActiveCard = document.getElementById('active-trip-card');
            if (passengerSearchingCard && passengerActiveCard) {
                passengerSearchingCard.style.display = 'none';
                passengerActiveCard.style.display = 'block';
                runActiveTripSimulation();
            }
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

    // == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ АРХІВІВ ==
    function displayArchives() {
        const passengerArchiveList = document.querySelector('#passenger-orders-screen .order-list.passenger');
        if (passengerArchiveList) {
            passengerArchiveList.innerHTML = '';
            passenger_archive.forEach(order => {
                const li = document.createElement('li');
                li.className = 'order-card archived';
                li.innerHTML = `<div class="archived-info"><span class="archived-date">${new Date(order.id).toLocaleDateString('uk-UA')}</span><div class="route"><span><i class="fa-solid fa-circle"></i> ${order.from}</span><span><i class="fa-solid fa-location-dot"></i> ${order.to}</span></div><div class="driver-details">Водій: ${order.driverName || 'Дмитро'}</div></div><button class="details-btn-arrow"><i class="fa-solid fa-circle-chevron-right"></i></button>`;
                passengerArchiveList.appendChild(li);
            });
        }
        const driverArchiveList = document.querySelector('#driver-orders-screen .order-list.driver');
        if (driverArchiveList) {
            driverArchiveList.innerHTML = '';
            driver_archive.forEach(order => {
                const li = document.createElement('li');
                li.className = 'order-card archived';
                li.innerHTML = `<div class="archived-info"><span class="archived-date">${new Date(order.id).toLocaleDateString('uk-UA')}</span><div class="route"><span><i class="fa-solid fa-circle"></i> ${order.from}</span><span><i class="fa-solid fa-location-dot"></i> ${order.to}</span></div><div class="driver-details">Пасажир: ${order.passengerName}</div></div><button class="details-btn-arrow"><i class="fa-solid fa-circle-chevron-right"></i></button>`;
                driverArchiveList.appendChild(li);
            });
        }
    }

    // == ЛОГІКА ДЛЯ ПРОФІЛІВ ==
    const profileDriverNameHeader = document.getElementById('profile-driver-name-header');
    const profileDriverName = document.getElementById('profile-driver-name');
    const profileDriverRating = document.getElementById('profile-driver-rating');
    const profileDriverTrips = document.getElementById('profile-driver-trips');
    const profileDriverCar = document.getElementById('profile-driver-car');
    const profileDriverTags = document.getElementById('profile-driver-tags');
    const profileDriverReviews = document.getElementById('profile-driver-reviews');
    const profileRequestRideBtn = document.getElementById('profile-request-ride-btn');

    function displayDriverProfile(driverId) {
        const driver = drivers_database.find(d => d.id === driverId);
        if (!driver) return;
        profileDriverNameHeader.textContent = `Профіль: ${driver.name}`;
        profileDriverName.textContent = driver.name;
        profileDriverRating.textContent = driver.rating.toFixed(1);
        profileDriverTrips.textContent = driver.trips;
        profileDriverCar.textContent = driver.car;
        profileDriverTags.innerHTML = '';
        driver.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `<i class="${tag.icon}"></i> ${tag.text}`;
            profileDriverTags.appendChild(tagElement);
        });
        const reviewsSectionTitle = document.querySelector('#driver-rating-screen .details-section h4[i.fa-comments]');
        if(reviewsSectionTitle) reviewsSectionTitle.textContent = `Відгуки (${driver.reviews.length})`;
        profileDriverReviews.innerHTML = '';
        driver.reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review-card';
            reviewElement.innerHTML = `<div class="review-header"><strong>${review.name}</strong><span class="review-rating">${review.rating.toFixed(1)} <i class="fa-solid fa-star"></i></span></div><p class="review-text">${review.text}</p>`;
            profileDriverReviews.appendChild(reviewElement);
        });
        navigateTo('driver-rating-screen');
    }

    const profilePassengerNameHeader = document.getElementById('profile-passenger-name-header');
    const profilePassengerName = document.getElementById('profile-passenger-name');
    const profilePassengerTrips = document.getElementById('profile-passenger-trips');
    const profilePassengerBio = document.getElementById('profile-passenger-bio');

    function displayPassengerProfile(passengerId) {
        const passenger = passengers_database.find(p => p.id === passengerId);
        if (!passenger) return;
        profilePassengerNameHeader.textContent = `Профіль: ${passenger.name}`;
        profilePassengerName.textContent = passenger.name;
        profilePassengerTrips.textContent = passenger.trips;
        profilePassengerBio.textContent = passenger.bio;
        navigateTo('passenger-profile-screen');
    }
    
    // == ЛОГІКА ДЛЯ СПИСКУ ДОСТУПНИХ ВОДІЇВ (ДЛЯ ПАСАЖИРА) ==
    function displayAvailableDrivers() {
        const driverListContainer = document.querySelector('#passenger-find-driver-screen .driver-list');
        if (!driverListContainer) return;
        driverListContainer.innerHTML = '';
        drivers_database.forEach(driver => {
            const li = document.createElement('li');
            li.className = 'driver-card online';
            li.innerHTML = `<div class="avatar-convex"><i class="fa-solid fa-user-tie"></i></div><div class="driver-info"><h4>${driver.name}</h4><span>${driver.rating.toFixed(1)} <i class="fa-solid fa-star"></i></span><small class="status-available">Доступний</small></div><div class="status-dot online"></div>`;
            li.addEventListener('click', () => displayDriverProfile(driver.id));
            driverListContainer.appendChild(li);
        });
    }

    // == ЛОГІКА ДЛЯ РОЗДІЛУ "ВАЛКИ-ХАРКІВ" ==
    
    // -- Відображення запитів пасажирів для водія --
    function displayVhRequests() {
        const requestListContainer = document.getElementById('vh-passenger-request-list');
        const placeholder = requestListContainer?.querySelector('.list-placeholder');
        if (!requestListContainer || !placeholder) return;
        requestListContainer.innerHTML = '';
        requestListContainer.appendChild(placeholder);
        if (vh_requests_database.length === 0) {
            placeholder.style.display = 'block';
        } else {
            placeholder.style.display = 'none';
            vh_requests_database.forEach(request => {
                const passenger = passengers_database.find(p => p.id === request.passengerId);
                const passengerName = passenger ? passenger.name : 'Невідомий пасажир';
                const li = document.createElement('li');
                li.className = 'order-card driver-view';
                li.innerHTML = `<div class="order-main-info"><div class="passenger-info"><div class="avatar-convex"><i class="fa-solid fa-user"></i></div><div class="passenger-details"><strong>${passengerName}</strong><span>${request.direction}</span></div></div></div><div class="order-route-info"><div class="address-line"><i class="fa-solid fa-circle start-address-icon"></i><span>${request.fromSpecific || 'Точка не вказана'}</span></div><div class="address-line"><i class="fa-solid fa-location-dot end-address-icon"></i><span>${request.toSpecific || 'Точка не вказана'}</span></div></div><div class="order-time-info"><i class="fa-solid fa-clock"></i><span>${request.time}</span></div><button class="btn-main-action accept" style="width: 100%; margin-top: 12px;">Відгукнутись</button>`;
                requestListContainer.appendChild(li);
            });
        }
    }

    // -- Логіка для форми створення запиту пасажиром --
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
                let pickerOptions = { enableTime: true, minDate: "today", time_24hr: true, onClose: (selectedDates, dateStr) => { if (!dateStr) e.currentTarget.classList.remove('active'); } };
                if (choice === 'today') { pickerOptions.noCalendar = true; pickerOptions.dateFormat = "H:i"; } else { pickerOptions.dateFormat = "d.m.Y H:i"; }
                if(vhPickerInput) flatpickr(vhPickerInput, pickerOptions).open();
            }
        });
    });

    const vhFormSubmitBtn = document.getElementById('vh-form-submit-btn-specific');
    vhFormSubmitBtn?.addEventListener('click', () => {
        const fromLocation = vhFromLocationSpan?.textContent || 'Н/Д';
        const toLocation = vhToLocationSpan?.textContent || 'Н/Д';
        const direction = `${fromLocation} - ${toLocation}`;
        const fromSpecific = document.getElementById('vh-form-from-address-specific').value.trim();
        const toSpecific = document.getElementById('vh-form-to-address-specific').value.trim();
        let time;
        const activeTimeButton = document.querySelector('#vh-passenger-form-screen .btn-segment.active');
        if (activeTimeButton) {
            const choice = activeTimeButton.dataset.timeChoice;
            if (choice === 'now') { time = 'Зараз'; } else { time = vhPickerInput?.value; }
        }
        if (!time) { alert('Будь ласка, оберіть час поїздки.'); return; }
        const newRequest = { id: Date.now(), passengerId: 1, direction: direction, fromSpecific: fromSpecific, toSpecific: toSpecific, time: time };
        vh_requests_database.push(newRequest);
        console.log('Новий запит В-Х додано:', newRequest);
        alert('Ваш запит успішно опубліковано!');
        navigateTo('passenger-valky-kharkiv-screen');
    });

    // -- Логіка для форми створення пропозиції водієм --
    const vhDriverSwapRouteBtn = document.getElementById('vh-driver-swap-route-btn');
    const vhDriverFromLocationSpan = document.getElementById('vh-driver-from-location')?.querySelector('span');
    const vhDriverToLocationSpan = document.getElementById('vh-driver-to-location')?.querySelector('span');
    vhDriverSwapRouteBtn?.addEventListener('click', () => {
        if (!vhDriverFromLocationSpan || !vhDriverToLocationSpan) return;
        const tempLocation = vhDriverFromLocationSpan.textContent;
        vhDriverFromLocationSpan.textContent = vhDriverToLocationSpan.textContent;
        vhDriverToLocationSpan.textContent = tempLocation;
        const container = vhDriverSwapRouteBtn.closest('.route-swap-container');
        container?.classList.add('swapped');
        setTimeout(() => container?.classList.remove('swapped'), 300);
    });

    const vhDriverTimeChoiceButtons = document.querySelectorAll('#vh-driver-form-screen .btn-segment');
    const vhDriverPickerInput = document.getElementById('vh-driver-form-datetime-picker');
    vhDriverTimeChoiceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const choice = e.currentTarget.dataset.timeChoice;
            vhDriverTimeChoiceButtons.forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            if (choice === 'now') {
                if (vhDriverPickerInput) vhDriverPickerInput.style.display = 'none';
            } else {
                if (vhDriverPickerInput) vhDriverPickerInput.style.display = 'block';
                let pickerOptions = { enableTime: true, minDate: "today", time_24hr: true, onClose: (selectedDates, dateStr) => { if (!dateStr) e.currentTarget.classList.remove('active'); } };
                if (choice === 'today') { pickerOptions.noCalendar = true; pickerOptions.dateFormat = "H:i"; } else { pickerOptions.dateFormat = "d.m.Y H:i"; }
                if (vhDriverPickerInput) flatpickr(vhDriverPickerInput, pickerOptions).open();
            }
        });
    });

    const vhDriverFormSubmitBtn = document.getElementById('vh-driver-form-submit-btn');
    vhDriverFormSubmitBtn?.addEventListener('click', () => {
        const fromLocation = vhDriverFromLocationSpan?.textContent || 'Н/Д';
        const toLocation = vhDriverToLocationSpan?.textContent || 'Н/Д';
        const direction = `${fromLocation} - ${toLocation}`;
        const fromSpecific = document.getElementById('vh-driver-form-from-specific').value.trim();
        const isFlexible = document.getElementById('vh-driver-flexible-route').checked;
        let time;
        const activeTimeButton = document.querySelector('#vh-driver-form-screen .btn-segment.active');
        if (activeTimeButton) {
            const choice = activeTimeButton.dataset.timeChoice;
            if (choice === 'now') { time = 'Зараз'; } else { time = vhDriverPickerInput?.value; }
        }
        if (!time) { alert('Будь ласка, оберіть час поїздки.'); return; }
        const newOffer = { id: Date.now(), driverId: 1, direction: direction, fromSpecific: fromSpecific, isFlexible: isFlexible, time: time };
        vh_offers_database.push(newOffer);
        console.log('Нову пропозицію В-Х додано:', newOffer);
        alert('Вашу пропозицію успішно опубліковано!');
        navigateTo('driver-valky-kharkiv-screen');
    });

    // == НАВІГАЦІЯ ==
    // -- Головний екран та вхід --
    showDriverLoginBtn?.addEventListener('click', () => navigateTo('login-screen-driver'));
    showPassengerLoginBtn?.addEventListener('click', () => navigateTo('login-screen-passenger'));
    driverTelegramLoginBtn?.addEventListener('click', () => navigateTo('driver-dashboard'));
    passengerTelegramLoginBtn?.addEventListener('click', () => navigateTo('passenger-dashboard'));
    goToMyOrdersBtn?.addEventListener('click', () => showMyOrdersBtn.click());

    // -- Навігація ПАСАЖИРА --
    showMyOrdersBtn?.addEventListener('click', () => {
        displayArchives();
        navigateTo('passenger-orders-screen');
        const searchingCard = document.getElementById('searching-card');
        const activeTripCard = document.getElementById('active-trip-card');
        if (globalOrderStatus === 'searching') { if(searchingCard) searchingCard.style.display = 'block'; if(activeTripCard) activeTripCard.style.display = 'none'; }
        else { if(searchingCard) searchingCard.style.display = 'none'; if(activeTripCard) activeTripCard.style.display = 'block'; runActiveTripSimulation(); }
    });
    showQuickOrderBtn?.addEventListener('click', () => { resetQuickOrder(); navigateTo('quick-order-screen'); });
    findDriverBtn?.addEventListener('click', () => { displayAvailableDrivers(); navigateTo('passenger-find-driver-screen'); });
    showPassengerValkyKharkivBtn?.addEventListener('click', () => navigateTo('passenger-valky-kharkiv-screen'));
    showPassengerBusScheduleBtn?.addEventListener('click', () => navigateTo('passenger-bus-schedule-screen'));
    showPassengerProfileBtn?.addEventListener('click', () => displayPassengerProfile(1));
    showPassengerSupportBtn?.addEventListener('click', () => navigateTo('passenger-support-screen'));
    showPassengerSettingsBtn?.addEventListener('click', () => navigateTo('passenger-settings-screen'));
    showHelpBtn?.addEventListener('click', () => navigateTo('help-screen'));
    vhPassengerCreateRequestBtn?.addEventListener('click', () => navigateTo('vh-passenger-form-screen'));

    // -- Навігація ВОДІЯ --
    showDriverOrdersBtn?.addEventListener('click', () => { displayArchives(); navigateTo('driver-orders-screen'); });
    showFindPassengersBtn?.addEventListener('click', () => { displayDriverOrders(); navigateTo('driver-find-passengers-screen'); });
    showDriverValkyKharkivBtn?.addEventListener('click', () => { displayVhRequests(); navigateTo('driver-valky-kharkiv-screen'); });
    showDriverProfileBtn?.addEventListener('click', () => displayDriverProfile(1));
    showDriverHelpBtn?.addEventListener('click', () => navigateTo('driver-help-screen'));
    showDriverSupportBtn?.addEventListener('click', () => navigateTo('driver-support-screen'));
    showDriverSettingsBtn?.addEventListener('click', () => navigateTo('driver-settings-screen'));
    vhDriverCreateOfferBtn?.addEventListener('click', () => navigateTo('vh-driver-form-screen'));
    
    // -- Універсальна кнопка "Назад" --
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isQuickOrderScreen = button.closest('#quick-order-screen');
            if (isQuickOrderScreen) {
                const isOnTimeStep = timeStep.style.display === 'flex';
                const isOnPaymentStep = paymentStep.style.display === 'flex';
                if (isOnPaymentStep) { goToStep('time'); }
                else if (isOnTimeStep) { editTimeBtn.click(); goToStep('address'); }
                else { if (confirm('Скасувати оформлення замовлення? Всі дані буде втрачено.')) { showScreen('passenger-dashboard'); } }
            } else {
                showScreen(button.dataset.target || 'home-screen');
            }
        });
    });

    // == ДОДАТКОВІ ФУНКЦІЇ ==
    // -- Перемикач тем --
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const themeCheckbox = themeToggle.querySelector('.toggle-checkbox');
        const body = document.body;
        function switchTheme(e) { if (e.target.checked) { body.classList.remove('light-theme'); body.classList.add('dark-theme'); } else { body.classList.remove('dark-theme'); body.classList.add('light-theme'); } }
        if (body.classList.contains('dark-theme')) { themeCheckbox.checked = true; }
        themeCheckbox.addEventListener('change', switchTheme);
    }

    // -- Ripple Effect --
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const existingRipple = button.querySelector(".ripple");
        if (existingRipple) { existingRipple.remove(); }
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - (button.getBoundingClientRect().left + radius)}px`;
        circle.style.top = `${event.clientY - (button.getBoundingClientRect().top + radius)}px`;
        circle.classList.add("ripple");
        button.appendChild(circle);
    }
    document.querySelectorAll(".btn-main, .menu-item").forEach(button => { button.addEventListener("click", createRipple); });

    // -- Анімація пінів на головному екрані --
    const pin1 = document.getElementById('pin1');
    const pin2 = document.getElementById('pin2');
    const pathDots = document.querySelector('.path-dots');
    if (pin1 && pin2 && pathDots) {
        function swapPinIcons() {
            const isPin1Dot = pin1.classList.contains('fa-circle-dot');
            if (isPin1Dot) { pin1.classList.remove('fa-circle-dot'); pin1.classList.add('fa-location-dot'); pin2.classList.remove('fa-location-dot'); pin2.classList.add('fa-circle-dot'); }
            else { pin1.classList.remove('fa-location-dot'); pin1.classList.add('fa-circle-dot'); pin2.classList.remove('fa-circle-dot'); pin2.classList.add('fa-location-dot'); }
        }
        pathDots.addEventListener('animationiteration', swapPinIcons);
    }

    // -- Керування поїздкою (водій) --
    driverArrivedBtn?.addEventListener('click', () => { alert('Пасажира сповіщено, що ви прибули!'); driverArrivedBtn.classList.add('disabled'); driverStartTripBtn.classList.remove('disabled'); });
    driverStartTripBtn?.addEventListener('click', () => { alert('Поїздку розпочато!'); driverStartTripBtn.classList.add('disabled'); driverFinishTripBtn.classList.remove('disabled'); });
    driverFinishTripBtn?.addEventListener('click', () => { alert('Поїздку завершено!'); showScreen('passenger-rating-trip-screen'); });

    // -- Екран оцінки поїздки --
    let currentRating = 0;
    function updateStars(rating) {
        ratingStars.forEach(star => {
            if (star.dataset.value <= rating) { star.classList.add('fa-solid'); star.classList.remove('fa-regular'); }
            else { star.classList.add('fa-regular'); star.classList.remove('fa-solid'); }
        });
    }
    ratingStars.forEach(star => {
        star.addEventListener('mouseover', () => updateStars(star.dataset.value));
        star.addEventListener('mouseout', () => updateStars(currentRating));
        star.addEventListener('click', () => {
            currentRating = star.dataset.value;
            if(submitRatingBtn) submitRatingBtn.classList.remove('disabled');
            updateStars(currentRating);
        });
    });
    submitRatingBtn?.addEventListener('click', () => {
        if (currentRating > 0) {
            const comment = document.getElementById('trip-comment').value.trim();
            alert(`Дякуємо за оцінку! Ваш рейтинг: ${currentRating} зірок. Коментар: "${comment}"`);
            const finishedOrder = { ...orderData }; 
            passenger_archive.push(finishedOrder);
            driver_archive.push(finishedOrder);
            globalOrderStatus = 'searching';
            const searchingCard = document.getElementById('searching-card');
            const activeTripCard = document.getElementById('active-trip-card');
            if(searchingCard) searchingCard.style.display = 'block';
            if(activeTripCard) activeTripCard.style.display = 'none';
            currentRating = 0;
            updateStars(0);
            document.getElementById('trip-comment').value = '';
            submitRatingBtn.classList.add('disabled');
            navigateTo('passenger-dashboard');
        }
    });

});
