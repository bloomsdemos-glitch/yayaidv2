// Тимчасові бази даних (ВАЖЛИВО: всі через LET)
let drivers_database = [
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
    },
    {
        id: 3,
        name: 'Максим Новенький',
        rating: 0,
        trips: 3,
        car: 'Daewoo Lanos, зелений',
        tags: [
            { icon: 'fa-solid fa-music', text: 'Поп-музика' }
        ],
        reviews: []
    }
];

let passengers_database = [
    {
        id: 1,
        name: 'Віта Білецька',
        trips: 27,
        bio: 'Валки.',
        reviews: []
    }
];

// Оголошуємо ВСІ наші "бази" тут, і тільки тут
let notifications_database = [];
let vh_requests_database = [];
let vh_offers_database = [];
let custom_trips_database = [];
let active_trips = [];
let passenger_archive = [];
let driver_archive = [];
let orders_database = [];


// == ЛОГІКА ЗБЕРЕЖЕННЯ СТАНУ (ПАМ'ЯТЬ ДОДАТКУ) ==
window.saveState = function() {
    const state = {
        active_trips,
        passenger_archive,
        driver_archive,
        orders_database,
        notifications_database,
        vh_requests_database,
        vh_offers_database,
        custom_trips_database
    };
    sessionStorage.setItem('appState', JSON.stringify(state));
}

window.loadState = function() {
    const savedState = sessionStorage.getItem('appState');
    if (savedState) {
        const state = JSON.parse(savedState);
        // Явно присвоюємо кожну змінну для надійності
        active_trips = state.active_trips || [];
        passenger_archive = state.passenger_archive || [];
        driver_archive = state.driver_archive || [];
        orders_database = state.orders_database || [];
        notifications_database = state.notifications_database || [];
        vh_requests_database = state.vh_requests_database || [];
        vh_offers_database = state.vh_offers_database || [];
        custom_trips_database = state.custom_trips_database || [];
    }
}
