const UI = {};


const screens = document.querySelectorAll('.screen');
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
    
UI.createDriverOrderCard = function(order) {
    const li = document.createElement('li');
    li.className = 'order-card driver-view';
    const timeIcon = order.time === 'Зараз' ? '<div class="status-dot online"></div>' : '<i class="fa-solid fa-clock"></i>';
    li.innerHTML = `
        <div class="order-main-info"><div class="passenger-info"><div class="avatar-convex"><i class="fa-solid fa-user"></i></div><div class="passenger-details"><strong>${order.passengerName}</strong><span>${order.rating} <i class="fa-solid fa-star"></i></span></div></div><div class="price-info"><span class="price-amount">~ ${order.price} грн</span><span class="price-label">Ваш дохід</span></div></div>
        <div class="order-route-info"><div class="address-line"><i class="fa-solid fa-circle start-address-icon"></i><span>${order.from}</span></div><div class="address-line"><i class="fa-solid fa-location-dot end-address-icon"></i><span>${order.to}</span></div></div>
        <div class="order-time-info">${timeIcon}<span>${order.time}</span></div>
    `;
    return li;
};


    