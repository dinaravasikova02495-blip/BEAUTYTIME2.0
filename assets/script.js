// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
// Загружаем данные текущего пользователя из localStorage при запуске скрипта
let currentUser = JSON.parse(localStorage.getItem('beautyTime_user')) || null;
// Проверяем, является ли пользователь администратором
let isAdmin = currentUser?.isAdmin || false;

// ===== 1. КНОПКА "НАВЕРХ" =====
/**
 * Инициализация кнопки "Наверх" (scroll-to-top)
 * Кнопка появляется при прокрутке страницы более 300px
 * При клике плавно прокручивает страницу в начало
 */
function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn'); // Находим кнопку по ID
    if (!btn) return; // Если кнопки нет на странице — выходим

    // Отслеживаем скролл страницы — показываем/скрываем кнопку
    window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 300));
    // При клике — плавная прокрутка вверх
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== 2. ВЫПАДАЮЩЕЕ МЕНЮ (ДРОПДАУН) =====
/**
 * Открытие/закрытие выпадающего меню "Услуги" в навигации
 * @param {Event} e — событие клика (используется для остановки всплытия)
 */
function toggleDropdown(e) {
    if (e) e.stopPropagation(); // Останавливаем всплытие, чтобы клик не закрыл меню сразу
    const dropdown = document.getElementById('services-dropdown');
    if (dropdown) dropdown.classList.toggle('active'); // Переключаем класс активности
}

// Закрываем дропдаун при клике в любом месте страницы
document.addEventListener('click', () => {
    const dropdown = document.getElementById('services-dropdown');
    if (dropdown) dropdown.classList.remove('active');
});

// ===== 3. ПЕРЕНАПРАВЛЕНИЕ ИКОНКИ ПРОФИЛЯ =====
/**
 * Обновляет ссылку иконки профиля в шапке в зависимости от роли пользователя
 * Администратор → admin.html
 * Обычный пользователь → profile.html
 * Автоматически определяет правильный путь (для файлов в assets/ и в корне)
 */
function updateProfileLink() {
    // Находим все иконки профиля на странице (могут быть с классом .profile-icon или id #profileLink)
    const icons = document.querySelectorAll('.profile-icon, #profileLink');
    const user = JSON.parse(localStorage.getItem('beautyTime_user'));

    icons.forEach(icon => {
        // Проверяем, находимся ли мы в папке assets/ (для правильного пути)
        const isInAssetsFolder = window.location.pathname.includes('/assets/');

        if (user?.isAdmin) {
            // Администратор: если в assets/ → admin.html, иначе → assets/admin.html
            if (isInAssetsFolder) {
                icon.setAttribute('href', 'admin.html');
            } else {
                icon.setAttribute('href', 'assets/admin.html');
            }
        } else {
            // Обычный пользователь: если в assets/ → profile.html, иначе → assets/profile.html
            if (isInAssetsFolder) {
                icon.setAttribute('href', 'profile.html');
            } else {
                icon.setAttribute('href', 'assets/profile.html');
            }
        }
    });
}

// ===== 4. СЛАЙДЕР НА ГЛАВНОЙ СТРАНИЦЕ =====
let currentSlide = 0; // Индекс текущего слайда
let slides = []; // Массив DOM-элементов слайдов
let slideInterval; // Таймер автоматического переключения

// Данные для слайдов (изображение, заголовок, описание)
const sliderData = [
    { image: 'assets/img/hair_slide.jpg', title: 'Стрижки и окрашивание', description: 'Профессиональный уход за волосами.' },
    { image: 'assets/img/eyes_slide.jpg', title: 'Ресницы и ламинирование', description: 'Выразительный взгляд без утяжеления.' },
    { image: 'assets/img/make_up_slide.jpg', title: 'Make up', description: 'Естественная красота.' },
    { image: 'assets/img/brows_slider.jpg', title: 'Уход за бровями', description: 'Естественная красота.' },
    { image: 'assets/img/nails_slide.jpg', title: 'Маникюр и педикюр', description: 'Идеальный дизайн ногтей.' }
];

/**
 * Инициализация слайдера: создаёт слайды, точки-индикаторы и запускает автопрокрутку
 */
function initSlider() {
    const container = document.getElementById('sliderContainer'); // Контейнер для слайдов
    const dotsContainer = document.getElementById('sliderDots'); // Контейнер для точек-индикаторов
    if (!container || !dotsContainer) return; // Если элементов нет — слайдер не нужен

    container.innerHTML = ''; // Очищаем контейнер
    dotsContainer.innerHTML = ''; // Очищаем точки

    // Создаём слайды и точки для каждого элемента данных
    sliderData.forEach((item, index) => {
        // Создаём слайд
        const slide = document.createElement('div');
        slide.className = `slide ${index === 0 ? 'active' : ''}`; // Первый слайд активен
        slide.style.backgroundImage = `url('${item.image}')`; // Устанавливаем фоновое изображение
        slide.innerHTML = `<div class="slide-overlay"></div><div class="slide-content"><h2>${item.title}</h2><p>${item.description}</p><a href="assets/profile.html" class="btn">Записаться</a></div>`;
        container.appendChild(slide);

        // Создаём точку-индикатор
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`; // Первая точка активна
        dot.onclick = () => goToSlide(index); // При клике переключаемся на соответствующий слайд
        dotsContainer.appendChild(dot);
    });

    slides = document.querySelectorAll('.slide'); // Сохраняем все слайды

    // Назначаем обработчики для стрелок "влево" и "вправо"
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    if (prevBtn) prevBtn.onclick = () => changeSlide(-1); // Предыдущий слайд
    if (nextBtn) nextBtn.onclick = () => changeSlide(1); // Следующий слайд

    startAutoSlide(); // Запускаем автоматическое переключение
}

/**
 * Переключение слайда на предыдущий (-1) или следующий (+1)
 */
function changeSlide(d) {
    stopAutoSlide(); // Останавливаем автопрокрутку
    goToSlide(currentSlide + d); // Переключаемся на нужный слайд
    startAutoSlide(); // Снова запускаем автопрокрутку
}

/**
 * Переход к конкретному слайду по индексу
 * @param {number} i — индекс слайда
 */
function goToSlide(i) {
    if (!slides.length) return; // Если слайдов нет — выходим
    if (i < 0) i = slides.length - 1; // Зацикливание: если меньше 0 → последний
    if (i >= slides.length) i = 0; // Зацикливание: если больше последнего → первый

    // Обновляем активный слайд
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    // Обновляем активную точку-индикатор
    document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
    currentSlide = i; // Сохраняем текущий индекс
}

/**
 * Запуск автоматической прокрутки слайдов каждые 5 секунд
 */
function startAutoSlide() {
    stopAutoSlide(); // Сначала останавливаем предыдущий таймер
    slideInterval = setInterval(() => changeSlide(1), 5000); // Запускаем новый таймер
}

/**
 * Остановка автоматической прокрутки
 */
function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval); // Очищаем таймер
        slideInterval = null;
    }
}

// ===== 5. КАРТОЧКИ МАСТЕРОВ (для страницы about.html) =====
// Данные всех мастеров с фото, специализацией, опытом и образованием
const mastersData = [
    { id: 1, name: 'Анна Соколова', role: 'Мастер-колорист', exp: 'Опыт: с 2017 года', edu: ['Color Expert (2017)', 'Аиртач (2021)', 'Сложное колорирование (2023)'], photo: './img/anna_sokolova_hair.jpg' },
    { id: 2, name: 'Алексей Кузнецов', role: 'Парикмахер-универсал', exp: 'Опыт: с 2015 года', edu: ['Академия парикмахерского искусства (2015)', 'Мужские стрижки (2018)', 'Горячие ножницы (2021)'], photo: './img/aleksey_kuznecov_hair.jpg' },
    { id: 3, name: 'Шамина Сафия', role: 'Мастер-бровист', exp: 'Опыт: с 2016 года', edu: ['Школа бровистов (2016)', 'Ламинирование (2019)', 'Архитектура бровей (2022)'], photo: './img/safia_shamina_brow.jpg' },
    { id: 4, name: 'Ксения Зорина', role: 'Мастер-бровист', exp: 'Опыт: с 2020 года', edu: ['BrowArtist (2020)', 'Ламинирование (2021)', 'Коррекция (2023)'], photo: './img/ksenya_zorina_brow.jpg' },
    { id: 5, name: 'Мария Волкова', role: 'Визажист', exp: 'Опыт: с 2018 года', edu: ['ProMakeup (2018)', 'Свадебный макияж (2020)', 'Fashion макияж (2022)'], photo: './img/maria_volkova_makeup.jpeg' },
    { id: 6, name: 'Екатерина Серебрякова', role: 'Мастер по ресницам', exp: 'Опыт: с 2019 года', edu: ['Lash&Style (2019)', 'Объемное наращивание (2021)', 'Ламинирование (2023)'], photo: './img/ekaterina_seryabkina_lash.jpg' },
    { id: 7, name: 'Елена Морозова', role: 'Мастер ногтевого сервиса', exp: 'Опыт: с 2019 года', edu: ['NailProfessional (2019)', 'Гель-лаки (2021)', 'Дизайн и моделирование (2023)'], photo: './img/elena_morozova_nail.jpg' },
    { id: 8, name: 'Ольга Дмитриева', role: 'Мастер по ресницам', exp: 'Опыт: с 2021 года', edu: ['LashMaster (2021)', '2D/3D наращивание (2022)', 'Ботокс для ресниц (2024)'], photo: './img/olga_dmitrieva_lashes.jpg' },
    { id: 9, name: 'Наталья Ковальчук', role: 'Мастер ногтевого сервиса', exp: 'Опыт: с 2020 года', edu: ['Ногтевая академия (2020)', 'Аппаратный маникюр (2021)', '3D дизайн ногтей (2023)'], photo: './img/natalia_kovalchuk_nails.jpg' },
    { id: 10, name: 'Виктория Смирнова', role: 'Визажист', exp: 'Опыт: с 2019 года', edu: ['Школа визажа (2019)', 'Свадебный макияж (2021)', 'Airbrush макияж (2023)'], photo: './img/victoria_smirnova_makeup.jpg' }
];

/**
 * Отрисовка карточек мастеров на странице "О нас"
 * Создаёт HTML для каждой карточки и вставляет в контейнер #masters-container
 */
function renderMasters() {
    const container = document.getElementById('masters-container'); // Контейнер для карточек
    if (!container) return; // Если контейнера нет — выходим

    // Создаём HTML для каждой карточки мастера
    container.innerHTML = mastersData.map(master => `
        <div class="master-card">
            <div class="master-photo" data-photo="${master.photo}"></div>
            <h3 class="master-name">${master.name}</h3>
            <div class="master-role">${master.role}</div>
            <div class="master-exp-wrap">
                <div class="master-exp">${master.exp}</div>
            </div>
            <ul class="master-edu">
                ${master.edu.map(item => `<li>${item}</li>`).join('')}
            </ul>
            ${isAdmin ? `
                <div class="admin-controls">
                    <button onclick="editMaster(${master.id})"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteMaster(${master.id})"><i class="fas fa-trash"></i></button>
                </div>
            ` : ''}
        </div>
    `).join('');

    // Устанавливаем фоновые изображения для фотографий мастеров
    document.querySelectorAll('.master-photo[data-photo]').forEach((el) => {
        const photo = el.dataset.photo; // Получаем путь к фото из data-атрибута
        if (photo) {
            el.style.backgroundImage = `url('${photo}')`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
        }
    });
}

// Заглушки для админ-функций на странице "О нас" (демо-режим)
function editMaster(id) { alert(`Редактирование мастера с ID: ${id}`); }
function deleteMaster(id) { if (confirm('Удалить этого мастера?')) alert(`Мастер с ID ${id} удалён (демо-режим)`); }

// ===== 6. СИСТЕМА ОТЗЫВОВ (для страницы reviews.html) =====
// Начальные 15 отзывов, которые загружаются если localStorage пуст
const defaultReviews = [
    { id: 1, author: 'Алиса Журова', text: 'Делала SMART педикюр. Очень внимательный мастер! В салоне уютно и комфортно. Обязательно вернусь еще!', rating: 5, date: 'март 2026' },
    { id: 2, author: 'Юлия Г.', text: 'Давно искала салон рядом с домом. Ходила на массаж — специалист высокого уровня, атмосфера расслабляющая.', rating: 5, date: 'февраль 2026' },
    { id: 3, author: 'Милана А.', text: 'Попала случайно и в восторге! Теперь только сюда. Отличное окрашивание, мастера — профессионалы.', rating: 5, date: 'январь 2026' },
    { id: 4, author: 'Екатерина С.', text: 'Сделала маникюр у Елены. Результат превзошел ожидания! Очень аккуратно, стойко, дизайн точь-в-точь как просила.', rating: 5, date: 'декабрь 2025' },
    { id: 5, author: 'Дмитрий П.', text: 'Хожу на мужские стрижки к Алексею. Всегда четко, быстро, с учетом пожеланий. Отличный сервис!', rating: 5, date: 'ноябрь 2025' },
    { id: 6, author: 'Ольга М.', text: 'Прекрасный салон! Делала окрашивание у Анны — результат потрясающий.', rating: 5, date: 'октябрь 2025' },
    { id: 7, author: 'Светлана К.', text: 'Ламинирование ресниц — это магия! Взгляд стал выразительным, ресницы как после туши.', rating: 5, date: 'сентябрь 2025' },
    { id: 8, author: 'Анна В.', text: 'Делала брови у Шаминой. Форма идеальная, цвет насыщенный. Очень довольна!', rating: 5, date: 'август 2025' },
    { id: 9, author: 'Максим Р.', text: 'Отличный барбер! Стрижка и борода на высшем уровне. Приятная атмосфера, вежливый персонал.', rating: 5, date: 'июль 2025' },
    { id: 10, author: 'Татьяна Д.', text: 'Маникюр и педикюр — безупречно! Дизайн сложный, но мастер справилась отлично.', rating: 5, date: 'июнь 2025' },
    { id: 11, author: 'Ирина З.', text: 'Очень понравился макияж для фотосессии. Визажист учла все пожелания, макияж продержался весь день!', rating: 5, date: 'май 2025' },
    { id: 12, author: 'Константин Л.', text: 'Хожу сюда на стрижку уже год. Всегда доволен результатом.', rating: 5, date: 'апрель 2025' },
    { id: 13, author: 'Вероника П.', text: 'Спа-уход для волос — это любовь! Волосы стали мягкими, шелковистыми.', rating: 5, date: 'март 2025' },
    { id: 14, author: 'Артем С.', text: 'Отличное место! Цены приятные, мастера знают свое дело.', rating: 5, date: 'февраль 2025' },
    { id: 15, author: 'Наталья Г.', text: 'Делала сложное колорирование. Результат превзошел ожидания!', rating: 5, date: 'январь 2025' }
];

/**
 * Загрузка отзывов из localStorage
 * Если localStorage пуст — возвращает массив отзывов по умолчанию и сохраняет его
 * @returns {Array} Массив объектов отзывов
 */
function loadReviews() {
    const saved = localStorage.getItem('beautyTime_reviews'); // Пытаемся загрузить сохранённые отзывы
    if (!saved) {
        // Если ничего нет — используем отзывы по умолчанию и сохраняем их
        localStorage.setItem('beautyTime_reviews', JSON.stringify(defaultReviews));
        return [...defaultReviews]; // Возвращаем копию массива
    }
    return JSON.parse(saved); // Парсим JSON-строку обратно в массив объектов
}

/**
 * Сохранение отзывов в localStorage
 * @param {Array} reviews — массив отзывов для сохранения
 */
function saveReviews(reviews) {
    localStorage.setItem('beautyTime_reviews', JSON.stringify(reviews)); // Преобразуем в JSON и сохраняем
}

/**
 * Генерация HTML-звёздочек для рейтинга
 * @param {number} rating — оценка от 1 до 5
 * @returns {string} HTML-строка с иконками звёзд
 */
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        // Если i меньше или равно рейтингу — закрашенная звезда, иначе — пустая
        stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    return stars;
}

/**
 * Защита от XSS-атак: экранирование HTML-тегов в пользовательском вводе
 * @param {string} str — строка для экранирования
 * @returns {string} Безопасная строка
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;'; // Заменяем & на &amp;
        if (m === '<') return '&lt;'; // Заменяем < на &lt;
        if (m === '>') return '&gt;'; // Заменяем > на &gt;
        return m;
    });
}

/**
 * Отрисовка сетки отзывов на странице
 * Показывает первые 5 отзывов, остальные скрывает (для кнопки "Показать ещё")
 */
function renderReviews() {
    const container = document.getElementById('reviewsGrid'); // Контейнер для отзывов
    if (!container) return; // Если контейнера нет — выходим

    const reviews = loadReviews(); // Загружаем отзывы

    // Если отзывов нет — показываем заглушку
    if (reviews.length === 0) {
        container.innerHTML = '<div class="empty-reviews"><i class="fas fa-comment-dots empty-reviews-icon"></i><p>Пока нет отзывов. Будьте первым!</p></div>';
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) loadMoreContainer.style.display = 'none'; // Скрываем кнопку "Показать ещё"
        updateReviewStats(); // Обновляем статистику
        return;
    }

    // Сортируем отзывы по дате (новые сверху)
    const sortedReviews = [...reviews].sort((a, b) => {
        const months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
        const getDateValue = (dateStr) => {
            const parts = dateStr.split(' '); // Разделяем "месяц год"
            const month = months.indexOf(parts[0]); // Получаем номер месяца
            const year = parseInt(parts[1]); // Получаем год
            return year * 12 + month; // Преобразуем в числовое значение для сравнения
        };
        return getDateValue(b.date) - getDateValue(a.date); // Сортировка по убыванию
    });

    // Создаём HTML для отзывов (первые 5 видимы, остальные скрыты)
    let html = '';
    sortedReviews.forEach((review, index) => {
        const hiddenClass = index >= 5 ? 'hidden' : ''; // Скрываем отзывы после 5-го
        html += `
            <div class="review-card ${hiddenClass}" data-id="${review.id}">
                <div class="review-header">
                    <span class="review-author">${escapeHtml(review.author)}</span>
                    <div class="review-stars">${renderStars(review.rating)}</div>
                </div>
                <p class="review-text">«${escapeHtml(review.text)}»</p>
                <div class="review-date">${review.date}</div>
                ${isAdmin ? `<button class="btn-small review-delete-btn" onclick="deleteReview(${review.id})">Удалить</button>` : ''}
            </div>
        `;
    });
    container.innerHTML = html;

    // Показываем кнопку "Показать ещё", если есть скрытые отзывы
    const hiddenCount = document.querySelectorAll('.review-card.hidden').length;
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
        loadMoreContainer.style.display = hiddenCount > 0 ? 'block' : 'none';
    }

    updateReviewStats(); // Обновляем статистику отзывов
}

/**
 * Загрузка дополнительных отзывов при нажатии "Показать ещё"
 * Показывает следующие 5 скрытых отзывов
 */
function loadMoreReviews() {
    const hiddenCards = document.querySelectorAll('.review-card.hidden'); // Находим все скрытые отзывы
    if (hiddenCards.length > 0) {
        // Показываем до 5 скрытых отзывов
        for (let i = 0; i < Math.min(5, hiddenCards.length); i++) {
            hiddenCards[i].classList.remove('hidden');
        }

        // Если скрытых отзывов не осталось — скрываем кнопку "Показать ещё"
        const remainingHidden = document.querySelectorAll('.review-card.hidden').length;
        if (remainingHidden === 0) {
            const loadMoreContainer = document.getElementById('loadMoreContainer');
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        }
    }
}

/**
 * Добавление нового отзыва в localStorage и обновление отображения
 * @param {string} author — имя автора
 * @param {string} text — текст отзыва
 * @param {number} rating — оценка (1-5)
 */
function addReview(author, text, rating) {
    const reviews = loadReviews(); // Загружаем текущие отзывы
    // Определяем текущий месяц и год для даты отзыва
    const months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
    const date = new Date();

    // Создаём новый отзыв
    const newReview = {
        id: Date.now(), // Уникальный ID на основе текущего времени
        author: author.trim(),
        text: text.trim(),
        rating: rating,
        date: `${months[date.getMonth()]} ${date.getFullYear()}` // "май 2026"
    };
    reviews.unshift(newReview); // Добавляем в начало массива (новые сверху)
    saveReviews(reviews); // Сохраняем
    renderReviews(); // Перерисовываем
    return true;
}

/**
 * Удаление отзыва по ID (с подтверждением)
 * @param {number} id — ID отзыва для удаления
 */
function deleteReview(id) {
    if (confirm('Удалить этот отзыв?')) {
        const reviews = loadReviews().filter(r => r.id !== id); // Фильтруем — оставляем все кроме удаляемого
        saveReviews(reviews); // Сохраняем
        renderReviews(); // Перерисовываем
    }
}

/**
 * Обработчик отправки формы нового отзыва
 * Проверяет заполнение полей и вызывает addReview()
 */
function submitReview() {
    const rating = document.querySelector('input[name="rating"]:checked'); // Выбранная оценка
    const author = document.getElementById('reviewAuthor'); // Поле "Имя"
    const text = document.getElementById('reviewText'); // Поле "Текст отзыва"

    // Валидация: проверяем что все поля заполнены
    if (!rating) { alert('Пожалуйста, поставьте оценку'); return; }
    if (!author || !author.value.trim()) { alert('Пожалуйста, введите ваше имя'); return; }
    if (!text || !text.value.trim()) { alert('Пожалуйста, напишите ваш отзыв'); return; }

    addReview(author.value, text.value, parseInt(rating.value)); // Добавляем отзыв

    // Очищаем форму после отправки
    author.value = '';
    text.value = '';
    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
    alert('Спасибо за ваш отзыв!');
}

/**
 * Очистка формы отзыва
 */
function clearForm() {
    const author = document.getElementById('reviewAuthor');
    const text = document.getElementById('reviewText');
    if (author) author.value = '';
    if (text) text.value = '';
    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false); // Сбрасываем звёзды
}

/**
 * Обновление блока статистики отзывов (средняя оценка, количество)
 */
function updateReviewStats() {
    const reviews = loadReviews();
    const avgRatingSpan = document.getElementById('avgRating'); // Элемент для средней оценки
    const avgStarsDiv = document.getElementById('avgStars'); // Элемент для звёзд
    const countSpan = document.getElementById('reviewsCount'); // Элемент для количества

    // Обновляем среднюю оценку если есть отзывы
    if (avgRatingSpan && reviews.length > 0) {
        const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
        avgRatingSpan.textContent = avg;
        if (avgStarsDiv) avgStarsDiv.innerHTML = renderStars(Math.round(avg));
    }

    // Обновляем количество отзывов с правильным склонением
    if (countSpan) {
        const n = reviews.length;
        let word;
        // Определяем правильное склонение слова "отзыв"
        if (n % 10 === 1 && n % 100 !== 11) word = 'отзыв';
        else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) word = 'отзыва';
        else word = 'отзывов';
        countSpan.textContent = `${n} ${word}`;
    }
}

// ===== 7. КАТАЛОГ УСЛУГ И ЗАПИСЬ (для sign-up.html) =====
// Категории услуг с вложенными списками услуг и ценами
const serviceCategories = [
    {
        id: 'hair', name: 'Парикмахерские услуги', icon: 'fas fa-cut', open: true, services: [
            { id: 1, name: 'Женская стрижка (короткие)', price: 1800 }, { id: 2, name: 'Женская стрижка (средние)', price: 2200 },
            { id: 3, name: 'Женская стрижка (длинные)', price: 2600 }, { id: 4, name: 'Мужская модельная стрижка', price: 1500 },
            { id: 5, name: 'Стрижка машинкой', price: 1000 }, { id: 6, name: 'Стрижка челки', price: 500 },
            { id: 7, name: 'Укладка феном', price: 1200 }, { id: 8, name: 'Вечерняя укладка', price: 2500 },
            { id: 9, name: 'Свадебная прическа', price: 4000 }, { id: 10, name: 'Тонирование волос', price: 2500 },
            { id: 11, name: 'Окрашивание корней', price: 2000 }, { id: 12, name: 'Полное окрашивание', price: 3500 },
            { id: 13, name: 'Мелирование', price: 3500 }, { id: 14, name: 'Балаяж / Шатуш', price: 4500 },
            { id: 15, name: 'Сложное колорирование', price: 6000 }, { id: 16, name: 'Кератиновое выпрямление', price: 4500 },
            { id: 17, name: 'Ботокс для волос', price: 3500 }, { id: 18, name: 'Ламинирование волос', price: 3500 },
            { id: 19, name: 'SPA-уход для волос', price: 2500 }
        ]
    },
    {
        id: 'nails', name: 'Ногтевой сервис', icon: 'fas fa-hand-paper', open: false, services: [
            { id: 20, name: 'Классический маникюр', price: 1000 }, { id: 21, name: 'Аппаратный маникюр', price: 1200 },
            { id: 22, name: 'Комбинированный маникюр', price: 1300 }, { id: 23, name: 'Маникюр + гель-лак', price: 2000 },
            { id: 24, name: 'Мужской маникюр', price: 900 }, { id: 25, name: 'SPA-маникюр', price: 1500 },
            { id: 26, name: 'Снятие гель-лака', price: 400 }, { id: 27, name: 'Классический педикюр', price: 1500 },
            { id: 28, name: 'Аппаратный педикюр', price: 1800 }, { id: 29, name: 'Педикюр + покрытие', price: 2500 },
            { id: 30, name: 'Покрытие гель-лак (однотон)', price: 900 }, { id: 31, name: 'Френч', price: 1100 },
            { id: 32, name: 'Дизайн 1 ногтя', price: 100 }, { id: 33, name: 'Сложный дизайн 1 ногтя', price: 200 },
            { id: 34, name: 'Наращивание ногтей', price: 2500 }, { id: 35, name: 'Коррекция наращенных ногтей', price: 1800 },
            { id: 36, name: 'Укрепление ногтей', price: 1500 }
        ]
    },
    {
        id: 'brows', name: 'Уход за бровями', icon: 'fas fa-eye', open: false, services: [
            { id: 37, name: 'Коррекция бровей (воск/пинцет)', price: 600 }, { id: 38, name: 'Окрашивание бровей хной', price: 800 },
            { id: 39, name: 'Окрашивание бровей краской', price: 700 }, { id: 40, name: 'Коррекция + окрашивание', price: 1200 },
            { id: 41, name: 'Ламинирование бровей', price: 1800 }, { id: 42, name: 'Ботокс для бровей', price: 1500 },
            { id: 43, name: 'Долговременная укладка бровей', price: 2000 }, { id: 44, name: 'Мужская коррекция бровей', price: 700 }
        ]
    },
    {
        id: 'lashes', name: 'Ресницы', icon: 'fas fa-eye', open: false, services: [
            { id: 45, name: 'Классическое наращивание 1D', price: 2000 }, { id: 46, name: 'Объемное наращивание 2D', price: 2500 },
            { id: 47, name: 'Объемное наращивание 3D', price: 3000 }, { id: 48, name: 'Голливудский объем (4-5D)', price: 3500 },
            { id: 49, name: 'Лисья эффект (Foxy Eyes)', price: 3000 }, { id: 50, name: 'Кукольный эффект', price: 3000 },
            { id: 51, name: 'Коррекция ресниц', price: 1200 }, { id: 52, name: 'Снятие наращенных ресниц', price: 500 },
            { id: 53, name: 'Ламинирование ресниц', price: 2500 }, { id: 54, name: 'Ботокс для ресниц', price: 2000 },
            { id: 55, name: 'Окрашивание ресниц', price: 800 }, { id: 56, name: 'Биозавивка ресниц', price: 2000 }
        ]
    },
    {
        id: 'makeup', name: 'Make up', icon: 'fas fa-paint-brush', open: false, services: [
            { id: 57, name: 'Дневной макияж', price: 2500 }, { id: 58, name: 'Вечерний макияж', price: 3500 },
            { id: 59, name: 'Свадебный макияж', price: 4500 }, { id: 60, name: 'Фотомакияж', price: 4000 },
            { id: 61, name: 'Смоки айс', price: 3500 }, { id: 62, name: 'Макияж для выпускного', price: 4000 },
            { id: 63, name: 'Пробный макияж', price: 2000 }
        ]
    }
];

// Список мастеров, привязанных к категориям услуг
const masters = {
    hair: [{ id: 1, name: 'Анна Соколова', spec: 'Парикмахер-колорист' }, { id: 2, name: 'Алексей Кузнецов', spec: 'Парикмахер-универсал' }],
    nails: [{ id: 3, name: 'Елена Морозова', spec: 'Мастер ногтевого сервиса' }],
    brows: [{ id: 4, name: 'Шамина Сафия', spec: 'Мастер-бровист' }],
    lashes: [{ id: 5, name: 'Екатерина Серебрякова', spec: 'Мастер по ресницам' }],
    makeup: [{ id: 6, name: 'Мария Волкова', spec: 'Визажист' }]
};

// Доступные временные слоты для записи
const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

// Состояние корзины и выбранных параметров записи
let cart = []; // Выбранные услуги
let currentCategory = null; // Текущая выбранная категория
let selectedMaster = null; // Выбранный мастер
let currentDate = new Date(); // Текущая дата для календаря
let selectedDate = null; // Выбранная дата записи
let selectedTime = null; // Выбранное время записи

/**
 * Отрисовка аккордеона с категориями услуг
 */
function renderServices() {
    const container = document.getElementById('services-container');
    if (!container) return;
    let html = '';
    serviceCategories.forEach((cat, idx) => {
        const isDisabled = currentCategory !== null && currentCategory !== cat.id; // Блокируем другие категории
        html += `
            <div class="category-accordion">
                <div class="category-header ${cat.open ? 'open' : ''}" onclick="toggleCategory(${idx})">
                    <span><i class="${cat.icon}"></i> ${cat.name}</span>
                    <i class="fas fa-chevron-down chevron"></i>
                </div>
                <div class="category-content ${cat.open ? 'open' : ''}">
                    <div class="services-grid-category">
                        ${cat.services.map(s => `
                            <div class="service-card ${cart.some(i => i.id === s.id) ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
                                 onclick="${isDisabled ? '' : `toggleService(${s.id}, '${s.name.replace(/'/g, "\\'")}', ${s.price}, '${cat.id}')`}">
                                <div class="service-info">
                                    <div class="service-name">${s.name}</div>
                                    <div class="service-price">${s.price} ₽</div>
                                </div>
                                <div class="add-btn ${isDisabled ? 'disabled' : ''}"><i class="fas fa-plus"></i></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    const warning = document.getElementById('category-warning');
    if (warning) {
        warning.innerHTML = currentCategory
            ? `⚠️ Вы выбрали услуги из категории "${serviceCategories.find(c => c.id === currentCategory)?.name}". Чтобы выбрать услуги из другой категории, удалите текущие услуги из корзины.`
            : '';
    }
}

/**
 * Сворачивание/разворачивание категории услуг
 */
function toggleCategory(idx) {
    serviceCategories[idx].open = !serviceCategories[idx].open;
    renderServices();
}

/**
 * Добавление/удаление услуги из корзины
 */
function toggleService(id, name, price, categoryId) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        removeFromCart(id); // Если услуга уже в корзине — удаляем
    } else {
        if (currentCategory !== null && currentCategory !== categoryId) {
            alert(`Нельзя смешивать услуги из разных категорий. Сначала удалите услуги из категории "${serviceCategories.find(c => c.id === currentCategory)?.name}"`);
            return;
        }
        cart.push({ id, name, price, categoryId }); // Добавляем в корзину
        currentCategory = categoryId; // Фиксируем категорию
        updateCartUI(); // Обновляем отображение корзины
        renderServices(); // Перерисовываем услуги
        updateMasters(); // Обновляем список мастеров
        updateCheckForm(); // Проверяем можно ли оформить запись
        updateCartBadge(); // Обновляем счётчик на кнопке корзины
    }
}

/**
 * Удаление услуги из корзины
 */
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    if (cart.length === 0) {
        currentCategory = null; selectedMaster = null; selectedDate = null; selectedTime = null;
        updateMasters(); renderCalendar(); renderTimeSlots();
    }
    updateCartUI();
    renderServices();
    updateCheckForm();
    updateCartBadge();
}

/**
 * Обновление отображения корзины (список услуг и итоговая сумма)
 */
function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('total-price');
    if (!cartContainer || !totalSpan) return;
    const total = cart.reduce((sum, i) => sum + i.price, 0);
    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        totalSpan.textContent = '0 ₽';
        return;
    }
    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div><div class="cart-item-name">${item.name}</div><div class="cart-item-price">${item.price} ₽</div></div>
            <button class="cart-remove-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('');
    totalSpan.textContent = `${total} ₽`;
}

/**
 * Обновление счётчика товаров в корзине на мобильной кнопке
 */
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        if (cart.length > 0) { badge.textContent = cart.length; badge.style.display = 'flex'; }
        else badge.style.display = 'none';
    }
}

/**
 * Обновление списка мастеров в зависимости от выбранной категории
 */
function updateMasters() {
    const container = document.getElementById('masters-container');
    if (!container) return;
    if (!currentCategory) { container.innerHTML = '<div class="cart-empty-tip">Сначала выберите услуги</div>'; selectedMaster = null; return; }
    const list = masters[currentCategory] || [];
    container.innerHTML = list.map(m => `
        <div class="master-card ${selectedMaster?.id === m.id ? 'selected' : ''}" onclick="selectMaster(${m.id}, '${m.name}')">
            <div class="master-name">${m.name}</div><div class="master-spec">${m.spec}</div>
        </div>
    `).join('');
}

function selectMaster(id, name) { selectedMaster = { id, name }; updateMasters(); updateCheckForm(); }

/**
 * Отрисовка календаря для выбора даты
 */
function renderCalendar() {
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay() || 7; // Понедельник = 1
    const monthTitle = document.getElementById('current-month');
    if (monthTitle) monthTitle.innerHTML = `${firstDay.toLocaleString('ru-RU', { month: 'long' })} ${year}`;
    const weekdaysContainer = document.getElementById('calendar-weekdays');
    if (weekdaysContainer) weekdaysContainer.innerHTML = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => `<div>${d}</div>`).join('');
    const daysContainer = document.getElementById('calendar-days');
    if (!daysContainer) return;
    let daysHtml = '';
    for (let i = 1; i < startDayOfWeek; i++) daysHtml += '<div></div>'; // Пустые ячейки
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateStr = new Date(year, month, d).toISOString().split('T')[0];
        const isSelected = selectedDate === dateStr;
        daysHtml += `<div class="calendar-day ${isSelected ? 'selected' : ''}" onclick="selectDate('${dateStr}')">${d}</div>`;
    }
    daysContainer.innerHTML = daysHtml;
}

function selectDate(dateStr) { selectedDate = dateStr; renderCalendar(); updateCheckForm(); }
function changeMonth(delta) { currentDate.setMonth(currentDate.getMonth() + delta); renderCalendar(); }

/**
 * Отрисовка временных слотов
 */
function renderTimeSlots() {
    const container = document.getElementById('time-slots');
    if (!container) return;
    container.innerHTML = timeSlots.map(t => `
        <div class="time-slot ${selectedTime === t ? 'selected' : ''}" onclick="selectTime('${t}')">${t}</div>
    `).join('');
}

function selectTime(time) { selectedTime = time; renderTimeSlots(); updateCheckForm(); }

/**
 * Проверка, можно ли активировать кнопку записи
 */
function updateCheckForm() {
    const bookingBtn = document.getElementById('booking-btn');
    if (bookingBtn) bookingBtn.disabled = !(cart.length && selectedMaster && selectedDate && selectedTime);
}

/**
 * Подтверждение записи — сохраняет в localStorage и перенаправляет в профиль
 */
function confirmBooking() {
    if (!cart.length || !selectedMaster || !selectedDate || !selectedTime) return alert('Заполните все поля');
    const total = cart.reduce((s, i) => s + i.price, 0);
    const serviceNames = cart.map(i => i.name).join(', ');
    const user = JSON.parse(localStorage.getItem('beautyTime_user'));

    if (user) {
        const apps = JSON.parse(localStorage.getItem(`appointments_${user.phone}`) || '[]');
        apps.push({
            id: Date.now(),
            serviceId: cart.map(i => i.id),
            serviceName: serviceNames,
            price: total,
            masterId: selectedMaster.id,
            masterName: selectedMaster.name,
            date: selectedDate,
            time: selectedTime,
            services: cart.map(i => ({ id: i.id, name: i.name, price: i.price })),
            totalPrice: total
        });
        localStorage.setItem(`appointments_${user.phone}`, JSON.stringify(apps));
    }
    alert(`✅ Запись создана!\n\n📋 ${serviceNames}\n👤 ${selectedMaster.name}\n📅 ${selectedDate}\n⏰ ${selectedTime}\n💰 ${total} ₽`);
    window.location.href = 'profile.html';
}

// ===== 8. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ =====
function getUsers() { return JSON.parse(localStorage.getItem('beautyTime_users') || '[]'); }
function saveUsers(users) { localStorage.setItem('beautyTime_users', JSON.stringify(users)); }
function getAppointments() { return JSON.parse(localStorage.getItem(`appointments_${currentUser?.phone}`) || '[]'); }

/**
 * Обработка входа в личный кабинет
 */
function handleLogin() {
    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const ADMIN_PHONE = '89870035084';
    const ADMIN_PASSWORD = '13022008d';

    if (phone === ADMIN_PHONE && password === ADMIN_PASSWORD) {
        const adminUser = { phone: ADMIN_PHONE, name: 'Администратор', isAdmin: true, email: 'admin@beautytime.ru', avatar: 'img/admin_salon.jpg' };
        localStorage.setItem('beautyTime_user', JSON.stringify(adminUser));
        currentUser = adminUser;
        window.location.href = 'admin.html';
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.phone === phone && u.password === password);
    if (user) {
        currentUser = { ...user, isAdmin: false };
        localStorage.setItem('beautyTime_user', JSON.stringify(currentUser));
        afterLogin();
    } else {
        alert('Неверный телефон или пароль');
    }
}

/**
 * Обработка регистрации нового пользователя
 */
function handleRegister() {
    const lastname = document.getElementById('reg-lastname').value.trim();
    const firstname = document.getElementById('reg-firstname').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    if (!lastname || !firstname || !phone || !password) { alert('Заполните все поля'); return; }
    if (password !== password2) { alert('Пароли не совпадают'); return; }
    if (password.length < 6) { alert('Пароль должен содержать не менее 6 символов'); return; }
    const users = getUsers();
    if (users.find(u => u.phone === phone)) { alert('Пользователь с таким номером телефона уже существует'); return; }
    users.push({ name: `${lastname} ${firstname}`, lastname, firstname, phone, password, avatar: '', email: '' });
    saveUsers(users);
    alert('Регистрация успешна! Теперь войдите.');
    showLogin();
}

/**
 * Отображение личного кабинета после входа
 */
function afterLogin() {
    document.getElementById('profile-login').style.display = 'none';
    document.getElementById('profile-register').style.display = 'none';
    document.getElementById('profile-authenticated').style.display = 'block';
    document.getElementById('profile-name').innerText = currentUser.name;
    document.getElementById('profile-phone').innerHTML = `<i class="fas fa-phone"></i> ${currentUser.phone}`;
    document.getElementById('profile-email').innerHTML = `<i class="fas fa-envelope"></i> ${currentUser.email || 'email не указан'}`;
    if (currentUser.avatar) {
        document.getElementById('profile-avatar').style.backgroundImage = `url('${currentUser.avatar}')`;
        document.getElementById('profile-avatar').style.backgroundSize = 'cover';
        document.getElementById('profile-avatar').style.backgroundPosition = 'center';
    }
    renderAppointments();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('beautyTime_user');
    window.location.href = '../index.html';
}

function showRegister() { document.getElementById('profile-login').style.display = 'none'; document.getElementById('profile-register').style.display = 'block'; }
function showLogin() { document.getElementById('profile-login').style.display = 'block'; document.getElementById('profile-register').style.display = 'none'; }

function editProfile() {
    const newEmail = prompt('Введите email', currentUser.email || '');
    if (newEmail !== null) {
        currentUser.email = newEmail;
        const users = getUsers();
        const idx = users.findIndex(u => u.phone === currentUser.phone);
        if (idx !== -1) users[idx] = currentUser;
        saveUsers(users);
        localStorage.setItem('beautyTime_user', JSON.stringify(currentUser));
        document.getElementById('profile-email').innerHTML = `<i class="fas fa-envelope"></i> ${currentUser.email || 'email не указан'}`;
        alert('Профиль обновлен');
    }
}

function updateAvatar(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentUser.avatar = e.target.result;
            const users = getUsers();
            const idx = users.findIndex(u => u.phone === currentUser.phone);
            if (idx !== -1) users[idx] = currentUser;
            saveUsers(users);
            localStorage.setItem('beautyTime_user', JSON.stringify(currentUser));
            document.getElementById('profile-avatar').style.backgroundImage = `url('${currentUser.avatar}')`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * Отображение списка записей пользователя (активные и завершённые)
 */
function renderAppointments() {
    const apps = getAppointments();
    const container = document.getElementById('appointments-list');
    if (!container) return;

    const now = new Date();

    function getServiceNames(app) {
        if (app.serviceName) return app.serviceName;
        if (app.services && app.services.length > 0) return app.services.map(s => s.name).join(', ');
        return 'Услуга не указана';
    }

    function getTotalPrice(app) {
        if (app.totalPrice) return app.totalPrice;
        if (app.price) return app.price;
        if (app.services && app.services.length > 0) return app.services.reduce((sum, s) => sum + (s.price || 0), 0);
        return 0;
    }

    const active = [];
    const completed = [];

    apps.forEach(app => {
        let isActive = false;
        if (app.date && app.time) {
            isActive = new Date(`${app.date}T${app.time}`) >= now;
        } else {
            isActive = true;
        }
        if (isActive) active.push(app);
        else completed.push(app);
    });

    container.innerHTML = `
        <h4>Активные записи</h4>
        ${active.length ? active.map(app => `
            <div class="appointment-card">
                <div>
                    <strong>${getServiceNames(app)}</strong><br>
                    ${app.masterName || 'Мастер не указан'}<br>
                    ${app.date || 'Дата не указана'} ${app.time || ''}<br>
                    ${getTotalPrice(app)} ₽
                </div>
                <span class="appointment-status status-active">Активна</span>
            </div>
        `).join('') : '<p>Нет активных записей</p>'}
        <h4 class="appointments-completed-title">Завершенные</h4>
        ${completed.length ? completed.map(app => `
            <div class="appointment-card">
                <div>
                    <strong>${getServiceNames(app)}</strong><br>
                    ${app.masterName || 'Мастер не указан'}<br>
                    ${app.date || 'Дата не указана'} ${app.time || ''}<br>
                    ${getTotalPrice(app)} ₽
                </div>
                <span class="appointment-status status-completed">Завершена</span>
            </div>
        `).join('') : '<p>Нет завершенных записей</p>'}
    `;
}

function startBooking() { window.location.href = 'booking.html'; }

// ===== 9. АДМИН-ПАНЕЛЬ =====
let currentEditMasterId = null; // ID редактируемого мастера
let currentEditServiceId = null; // ID редактируемой услуги

// Начальные данные для админки (если localStorage пуст)
const defaultMasters = [
    { id: 1, name: 'Анна Соколова', role: 'Мастер-колорист', exp: 'с 2017', desc: 'Сложные окрашивания без рыжины.', photo: 'img/photo_master_hairs.jpg' },
    { id: 2, name: 'Алексей Кузнецов', role: 'Парикмахер-универсал', exp: 'с 2015', desc: 'Мужские и женские стрижки.', photo: 'img/photo_master_hairs_2.jpg' },
    { id: 3, name: 'Шамина Сафия', role: 'Мастер-бровист', exp: 'с 2016', desc: 'Идеальная форма бровей.', photo: 'img/photo_master_brow.jpg' },
    { id: 4, name: 'Ксения Зорина', role: 'Мастер-бровист', exp: 'с 2020', desc: 'Коррекция и окрашивание.', photo: 'img/photo_master_brow_2.jpg' },
    { id: 5, name: 'Мария Волкова', role: 'Визажист', exp: 'с 2018', desc: 'Свадебный и вечерний макияж.', photo: 'img/photo_make_up.jpeg' },
    { id: 6, name: 'Екатерина Серебрякова', role: 'Мастер по ресницам', exp: 'с 2019', desc: 'Ламинирование и наращивание.', photo: 'img/photo_master_resnic.jpg' },
    { id: 7, name: 'Елена Морозова', role: 'Мастер ногтевого сервиса', exp: 'с 2019', desc: 'Идеальный маникюр и педикюр.', photo: 'img/photonails.jpg' },
    { id: 8, name: 'Ольга Дмитриева', role: 'Мастер по ресницам', exp: 'с 2021', desc: 'Объемное наращивание.', photo: 'https://placehold.co/150x150/e5dfd9/2c2a28?text=Olga' },
    { id: 9, name: 'Наталья Ковальчук', role: 'Мастер ногтевого сервиса', exp: 'с 2020', desc: '3D дизайн ногтей.', photo: 'https://placehold.co/150x150/e5dfd9/2c2a28?text=Natalia' },
    { id: 10, name: 'Виктория Смирнова', role: 'Визажист', exp: 'с 2019', desc: 'Airbrush макияж.', photo: 'https://placehold.co/150x150/e5dfd9/2c2a28?text=Vika' }
];

const defaultServices = [
    { id: 'hair', name: 'Парикмахерские услуги', icon: 'cut' },
    { id: 'lashes', name: 'Ресницы', icon: 'eye' },
    { id: 'makeup', name: 'Make up', icon: 'paint-brush' },
    { id: 'brows', name: 'Уход за бровями', icon: 'eye' },
    { id: 'nails', name: 'Ногтевой сервис', icon: 'hand-paper' }
];

const defaultReviewsAdmin = [
    { id: 1, author: 'Алиса Журова', text: 'Отличный сервис!', rating: 5, date: 'март 2026', approved: true },
    { id: 2, author: 'Юлия Г.', text: 'Очень довольна!', rating: 5, date: 'февраль 2026', approved: true },
    { id: 3, author: 'Милана А.', text: 'Восторг!', rating: 5, date: 'январь 2026', approved: true },
    { id: 4, author: 'Екатерина С.', text: 'Маникюр супер!', rating: 5, date: 'декабрь 2025', approved: true },
    { id: 5, author: 'Дмитрий П.', text: 'Стрижка отличная', rating: 5, date: 'ноябрь 2025', approved: true },
    { id: 6, author: 'Ольга М.', text: 'Всё понравилось!', rating: 5, date: 'октябрь 2025', approved: true },
    { id: 7, author: 'Светлана К.', text: 'Ламинирование супер', rating: 5, date: 'сентябрь 2025', approved: true },
    { id: 8, author: 'Анна В.', text: 'Брови идеальные', rating: 5, date: 'август 2025', approved: false },
    { id: 9, author: 'Максим Р.', text: 'Барбер топ', rating: 5, date: 'июль 2025', approved: false },
    { id: 10, author: 'Татьяна Д.', text: 'Педикюр отлично', rating: 5, date: 'июнь 2025', approved: false },
    { id: 11, author: 'Ирина З.', text: 'Макияж стойкий', rating: 5, date: 'май 2025', approved: false },
    { id: 12, author: 'Константин Л.', text: 'Всегда доволен', rating: 5, date: 'апрель 2025', approved: false },
    { id: 13, author: 'Вероника П.', text: 'Спа уход топ', rating: 5, date: 'март 2025', approved: false },
    { id: 14, author: 'Артем С.', text: 'Рекомендую', rating: 5, date: 'февраль 2025', approved: false },
    { id: 15, author: 'Наталья Г.', text: 'Колорирование супер', rating: 5, date: 'январь 2025', approved: false }
];

// Функции для работы с localStorage админ-панели
function getMasters() { return JSON.parse(localStorage.getItem('beautyTime_masters')) || defaultMasters; }
function saveMastersList(m) { localStorage.setItem('beautyTime_masters', JSON.stringify(m)); }
function getServices() { return JSON.parse(localStorage.getItem('beautyTime_services')) || defaultServices; }
function saveServicesList(s) { localStorage.setItem('beautyTime_services', JSON.stringify(s)); }
function getReviewsAdmin() { return JSON.parse(localStorage.getItem('beautyTime_reviews')) || defaultReviewsAdmin; }
function saveReviewsAdmin(r) { localStorage.setItem('beautyTime_reviews', JSON.stringify(r)); }

/**
 * Обновление статистики в админ-панели
 */
function updateStats() {
    document.getElementById('statsMasters').innerText = getMasters().length;
    document.getElementById('statsServices').innerText = getServices().length;
    const reviews = getReviewsAdmin();
    document.getElementById('statsReviews').innerText = reviews.length;
    document.getElementById('statsPending').innerText = reviews.filter(r => !r.approved).length;
}

// Функции управления мастерами
function openMastersEditor() { renderMastersList(); document.getElementById('mastersModal').classList.add('active'); }
function renderMastersList() {
    const masters = getMasters();
    document.getElementById('mastersList').innerHTML = masters.map(m => `
        <div class="item-card">
            <h4><i class="fas fa-user-circle"></i> ${m.name}</h4>
            <p>${m.role} | ${m.exp}</p>
            <div class="item-actions">
                <button class="btn-edit" onclick="editMasterAdmin(${m.id})"><i class="fas fa-edit"></i> Ред.</button>
                <button class="btn-delete" onclick="deleteMasterAdmin(${m.id})"><i class="fas fa-trash-alt"></i> Уд.</button>
            </div>
        </div>
    `).join('');
}

function editMasterAdmin(id) {
    const m = getMasters().find(x => x.id === id);
    if (m) {
        currentEditMasterId = id;
        document.getElementById('editMasterTitle').innerHTML = '<i class="fas fa-user-edit"></i> Редактировать мастера';
        document.getElementById('masterName').value = m.name;
        document.getElementById('masterRole').value = m.role;
        document.getElementById('masterExp').value = m.exp;
        document.getElementById('masterDesc').value = m.desc || '';
        document.getElementById('masterPhoto').value = m.photo || '';
        closeModal('mastersModal');
        document.getElementById('editMasterModal').classList.add('active');
    }
}

function addMaster() {
    currentEditMasterId = null;
    document.getElementById('editMasterTitle').innerHTML = '<i class="fas fa-user-plus"></i> Добавить мастера';
    document.getElementById('masterName').value = '';
    document.getElementById('masterRole').value = '';
    document.getElementById('masterExp').value = '';
    document.getElementById('masterDesc').value = '';
    document.getElementById('masterPhoto').value = '';
    closeModal('mastersModal');
    document.getElementById('editMasterModal').classList.add('active');
}

function saveMaster() {
    const masters = getMasters();
    const newMaster = {
        id: currentEditMasterId || Date.now(),
        name: document.getElementById('masterName').value,
        role: document.getElementById('masterRole').value,
        exp: document.getElementById('masterExp').value,
        desc: document.getElementById('masterDesc').value,
        photo: document.getElementById('masterPhoto').value
    };
    if (currentEditMasterId) {
        const idx = masters.findIndex(m => m.id === currentEditMasterId);
        if (idx !== -1) masters[idx] = newMaster;
    } else {
        masters.push(newMaster);
    }
    saveMastersList(masters);
    closeModal('editMasterModal');
    renderMastersList();
    updateStats();
    alert('Сохранено');
}

function deleteMasterAdmin(id) {
    if (confirm('Удалить мастера?')) {
        saveMastersList(getMasters().filter(m => m.id !== id));
        renderMastersList();
        updateStats();
    }
}

// Функции управления услугами
function openServicesEditor() { renderServicesList(); document.getElementById('servicesModal').classList.add('active'); }
function renderServicesList() {
    document.getElementById('servicesList').innerHTML = getServices().map(s => `
        <div class="item-card">
            <h4><i class="fas fa-${s.icon}"></i> ${s.name}</h4>
            <p>Иконка: ${s.icon}</p>
            <div class="item-actions">
                <button class="btn-edit" onclick="editServiceAdmin('${s.id}')"><i class="fas fa-edit"></i> Ред.</button>
                <button class="btn-delete" onclick="deleteServiceAdmin('${s.id}')"><i class="fas fa-trash-alt"></i> Уд.</button>
            </div>
        </div>
    `).join('');
}

function editServiceAdmin(id) {
    const s = getServices().find(x => x.id === id);
    if (s) {
        currentEditServiceId = id;
        document.getElementById('editServiceTitle').innerHTML = '<i class="fas fa-edit"></i> Редактировать услугу';
        document.getElementById('serviceName').value = s.name;
        document.getElementById('serviceIcon').value = s.icon;
        closeModal('servicesModal');
        document.getElementById('editServiceModal').classList.add('active');
    }
}

function saveService() {
    const services = getServices();
    const idx = services.findIndex(s => s.id === currentEditServiceId);
    if (idx !== -1) {
        services[idx].name = document.getElementById('serviceName').value;
        services[idx].icon = document.getElementById('serviceIcon').value;
        saveServicesList(services);
        renderServicesList();
        updateStats();
        alert('Сохранено');
    }
    closeModal('editServiceModal');
}

function deleteServiceAdmin(id) {
    if (confirm('Удалить услугу?')) {
        saveServicesList(getServices().filter(s => s.id !== id));
        renderServicesList();
        updateStats();
    }
}

// Функции модерации отзывов
function openReviewsModeration() { renderReviewsList(); document.getElementById('reviewsModal').classList.add('active'); }
function renderReviewsList() {
    const reviews = getReviewsAdmin();
    document.getElementById('reviewsList').innerHTML = reviews.map(r => `
        <div class="item-card">
            <h4><i class="fas fa-user"></i> ${r.author}</h4>
            <p>${r.text.substring(0, 60)}...</p>
            <span class="review-status ${r.approved ? 'status-approved' : 'status-pending'}">
                <i class="fas ${r.approved ? 'fa-check-circle' : 'fa-clock'}"></i> ${r.approved ? 'Одобрен' : 'На модерации'}
            </span>
            <div class="item-actions">
                ${!r.approved ? `<button class="btn-edit" onclick="approveReviewAdmin(${r.id})"><i class="fas fa-check"></i> Одобрить</button>` : ''}
                <button class="btn-delete" onclick="deleteReviewAdmin(${r.id})"><i class="fas fa-trash-alt"></i> Удалить</button>
            </div>
        </div>
    `).join('');
}

function approveReviewAdmin(id) {
    const reviews = getReviewsAdmin();
    const idx = reviews.findIndex(r => r.id === id);
    if (idx !== -1) {
        reviews[idx].approved = true;
        saveReviewsAdmin(reviews);
        renderReviewsList();
        updateStats();
        alert('Отзыв одобрен');
    }
}

function deleteReviewAdmin(id) {
    if (confirm('Удалить отзыв?')) {
        saveReviewsAdmin(getReviewsAdmin().filter(r => r.id !== id));
        renderReviewsList();
        updateStats();
    }
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// ===== 11. ЛОГИКА ДЛЯ BOOKING.HTML (пошаговая форма записи) =====
const categoriesForBooking = {
    hair: {
        name: 'Парикмахерские услуги',
        services: [
            { id: 1, name: 'Женская стрижка', price: 1500 },
            { id: 2, name: 'Мужская стрижка', price: 1200 },
            { id: 3, name: 'Окрашивание', price: 3500 },
            { id: 4, name: 'Тонирование', price: 2000 },
            { id: 5, name: 'Укладка феном', price: 1200 },
            { id: 6, name: 'Вечерняя прическа', price: 2500 }
        ]
    },
    lashes: {
        name: 'Ресницы',
        services: [
            { id: 7, name: 'Классическое наращивание (1D)', price: 2000 },
            { id: 8, name: 'Объемное наращивание 2D', price: 2500 },
            { id: 9, name: 'Ламинирование ресниц', price: 2500 },
            { id: 10, name: 'Ботокс для ресниц', price: 2000 }
        ]
    },
    makeup: {
        name: 'Make up',
        services: [
            { id: 11, name: 'Дневной макияж', price: 2500 },
            { id: 12, name: 'Вечерний макияж', price: 3500 },
            { id: 13, name: 'Свадебный макияж', price: 4500 },
            { id: 14, name: 'Смоки айс', price: 3500 }
        ]
    },
    brows: {
        name: 'Уход за бровями',
        services: [
            { id: 15, name: 'Коррекция бровей', price: 600 },
            { id: 16, name: 'Окрашивание бровей', price: 800 },
            { id: 17, name: 'Ламинирование бровей', price: 1800 }
        ]
    },
    nails: {
        name: 'Ногтевой сервис',
        services: [
            { id: 18, name: 'Классический маникюр', price: 1000 },
            { id: 19, name: 'Аппаратный маникюр', price: 1200 },
            { id: 20, name: 'Маникюр + гель-лак', price: 2000 },
            { id: 21, name: 'Педикюр', price: 1500 }
        ]
    }
};

const mastersForBooking = [
    { id: 1, name: 'Анна Соколова', spec: 'Парикмахер-колорист', categoryKey: 'hair' },
    { id: 2, name: 'Алексей Кузнецов', spec: 'Парикмахер-универсал', categoryKey: 'hair' },
    { id: 3, name: 'Шамина Сафия', spec: 'Бровист', categoryKey: 'brows' },
    { id: 4, name: 'Ксения Зорина', spec: 'Бровист', categoryKey: 'brows' },
    { id: 5, name: 'Мария Волкова', spec: 'Визажист', categoryKey: 'makeup' },
    { id: 6, name: 'Екатерина Серебрякова', spec: 'Lash-мастер', categoryKey: 'lashes' },
    { id: 7, name: 'Елена Морозова', spec: 'Маникюр/педикюр', categoryKey: 'nails' }
];

let currentStep = 1; // Текущий шаг формы
let bookingData = {
    categoryKey: null,
    selectedServices: [],
    masterId: null,
    masterName: null,
    date: null,
    time: null
};
let currentCalendarDate = new Date();
let selectedDateStr = null;

/**
 * Инициализация кастомного выпадающего списка для выбора категории
 */
function initCustomSelectBooking() {
    const wrapper = document.getElementById('categorySelectWrapper');
    if (!wrapper) { console.log('❌ categorySelectWrapper не найден'); return; }

    const trigger = wrapper.querySelector('.custom-select-trigger');
    const optionsContainer = wrapper.querySelector('.custom-select-options');

    if (!trigger || !optionsContainer) { console.log('❌ trigger или optionsContainer не найдены'); return; }

    console.log('✅ Кастомный селект инициализирован');

    const cats = [
        { value: '', text: '-- Выберите категорию --' },
        { value: 'hair', text: 'Парикмахерские услуги' },
        { value: 'lashes', text: 'Ресницы' },
        { value: 'makeup', text: 'Make up' },
        { value: 'brows', text: 'Уход за бровями' },
        { value: 'nails', text: 'Ногтевой сервис' }
    ];

    optionsContainer.innerHTML = '';

    cats.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'custom-select-option';
        div.textContent = cat.text;
        div.dataset.value = cat.value;

        div.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();

            const triggerSpan = trigger.querySelector('span');
            if (triggerSpan) triggerSpan.textContent = cat.text;

            bookingData.categoryKey = cat.value === '' ? null : cat.value;

            if (bookingData.categoryKey && categoriesForBooking[bookingData.categoryKey]) {
                renderServicesListBooking(categoriesForBooking[bookingData.categoryKey].services);
            } else {
                document.getElementById('servicesContainer').innerHTML = '<p class="booking-placeholder">Сначала выберите категорию</p>';
                document.getElementById('totalCalculator').style.display = 'none';
                bookingData.selectedServices = [];
                updateTotalBooking();
            }

            wrapper.classList.remove('open');
            console.log('✅ Выбрана категория:', cat.text);
        });

        optionsContainer.appendChild(div);
    });

    trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        wrapper.classList.toggle('open');
        console.log('🔄 Селект ' + (wrapper.classList.contains('open') ? 'открыт' : 'закрыт'));
    });

    document.addEventListener('click', function (e) {
        if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    });
}

/**
 * Отрисовка списка услуг для выбранной категории в booking.html
 */
function renderServicesListBooking(services) {
    const container = document.getElementById('servicesContainer');
    container.innerHTML = services.map(s => `
        <div class="service-item" data-id="${s.id}" data-price="${s.price}" data-name="${s.name}" onclick="toggleServiceBooking(${s.id}, ${s.price}, '${s.name.replace(/'/g, "\\'")}')">
            <div class="service-info">
                <div class="service-name">${s.name}</div>
                <div class="service-price">${s.price} ₽</div>
            </div>
            <input type="checkbox" ${bookingData.selectedServices.some(sel => sel.id === s.id) ? 'checked' : ''}>
        </div>
    `).join('');
    updateTotalBooking();
    document.getElementById('totalCalculator').style.display = bookingData.selectedServices.length > 0 ? 'block' : 'none';
}

function toggleServiceBooking(id, price, name) {
    const index = bookingData.selectedServices.findIndex(s => s.id === id);
    if (index === -1) {
        bookingData.selectedServices.push({ id, name, price });
    } else {
        bookingData.selectedServices.splice(index, 1);
    }

    const items = document.querySelectorAll('.service-item');
    items.forEach(item => {
        if (parseInt(item.dataset.id) === id) item.querySelector('input').checked = (index === -1);
    });

    updateTotalBooking();
    document.getElementById('totalCalculator').style.display = bookingData.selectedServices.length > 0 ? 'block' : 'none';
}

function updateTotalBooking() {
    const total = bookingData.selectedServices.reduce((sum, s) => sum + s.price, 0);
    document.getElementById('totalAmount').innerText = total;
}

function renderMastersBooking() {
    const container = document.getElementById('mastersList');
    if (!bookingData.categoryKey) { container.innerHTML = '<p>Сначала выберите категорию услуг</p>'; return; }
    const availableMasters = mastersForBooking.filter(m => m.categoryKey === bookingData.categoryKey);
    if (availableMasters.length === 0) { container.innerHTML = '<p>Нет мастеров для выбранной категории</p>'; return; }
    container.innerHTML = availableMasters.map(m => `
        <div class="master-card" data-id="${m.id}" data-name="${m.name}" onclick="selectMasterBooking(${m.id}, '${m.name}')">
            <div class="master-info"><h4>${m.name}</h4><p>${m.spec}</p></div>
        </div>
    `).join('');
}

function selectMasterBooking(id, name) {
    bookingData.masterId = id;
    bookingData.masterName = name;
    document.querySelectorAll('#mastersList .master-card').forEach(card => card.classList.remove('selected'));
    document.querySelector(`#mastersList .master-card[data-id="${id}"]`).classList.add('selected');
}

function renderCalendarBooking() {
    const container = document.getElementById('calendarWidget');
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    let startWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = `<div class="calendar-header">
                    <div class="calendar-nav" onclick="changeMonthBooking(-1)">←</div>
                    <div class="calendar-month">${firstDay.toLocaleString('ru', { month: 'long', year: 'numeric' })}</div>
                    <div class="calendar-nav" onclick="changeMonthBooking(1)">→</div>
                </div>
                <div class="calendar-weekdays"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>
                <div class="calendar-days">`;

    let day = 1;
    for (let i = 0; i < 42; i++) {
        if (i < startWeekday || day > daysInMonth) {
            html += `<div class="calendar-day disabled"></div>`;
        } else {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = selectedDateStr === dateStr;
            const isPast = date < today;
            const disabledClass = isPast ? 'disabled' : '';
            html += `<div class="calendar-day ${isSelected ? 'selected' : ''} ${disabledClass}" data-date="${dateStr}" onclick="selectDateBooking('${dateStr}', this)">${day}</div>`;
            day++;
        }
    }
    html += `</div>`;
    container.innerHTML = html;
}

function changeMonthBooking(delta) { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta); renderCalendarBooking(); }

function selectDateBooking(dateStr, element) {
    if (element.classList.contains('disabled')) return;
    bookingData.date = dateStr;
    selectedDateStr = dateStr;
    document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected'));
    element.classList.add('selected');
}

function renderTimeSlotsBooking() {
    const container = document.getElementById('timeSlots');
    const slots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    container.innerHTML = slots.map(t => `<div class="time-slot" data-time="${t}" onclick="selectTimeBooking('${t}')">${t}</div>`).join('');
}

function selectTimeBooking(time) {
    bookingData.time = time;
    document.querySelectorAll('#timeSlots .time-slot').forEach(slot => slot.classList.remove('selected'));
    document.querySelector(`#timeSlots .time-slot[data-time="${time}"]`).classList.add('selected');
}

function renderSummaryBooking() {
    const servicesHtml = bookingData.selectedServices.map(s => `<div>${s.name} — ${s.price} ₽</div>`).join('');
    const total = bookingData.selectedServices.reduce((sum, s) => sum + s.price, 0);
    document.getElementById('summary').innerHTML = `
        <div class="summary-item"><span>Услуги:</span><span>${servicesHtml}</span></div>
        <div class="summary-item"><span>Общая стоимость:</span><span>${total} ₽</span></div>
        <div class="summary-item"><span>Мастер:</span><span>${bookingData.masterName}</span></div>
        <div class="summary-item"><span>Дата:</span><span>${bookingData.date}</span></div>
        <div class="summary-item"><span>Время:</span><span>${bookingData.time}</span></div>
        <div class="summary-item total-price"><span>Итого к оплате:</span><span>${total} ₽</span></div>
    `;
}

/**
 * Переход к следующему шагу формы
 */
function nextStep(step) {
    if (step === 2 && bookingData.selectedServices.length === 0) { alert('Выберите хотя бы одну услугу'); return; }
    if (step === 3 && !bookingData.masterId) { alert('Выберите мастера'); return; }
    if (step === 4 && !bookingData.date) { alert('Выберите дату'); return; }
    if (step === 5 && !bookingData.time) { alert('Выберите время'); return; }

    if (step === 2) renderMastersBooking();
    if (step === 3) renderCalendarBooking();
    if (step === 4) renderTimeSlotsBooking();

    document.getElementById(`step${currentStep}`).style.display = 'none';
    currentStep = step;
    document.getElementById(`step${currentStep}`).style.display = 'block';

    if (step === 5) renderSummaryBooking();
}

/**
 * Возврат к предыдущему шагу
 */
function prevStep(step) {
    document.getElementById(`step${currentStep}`).style.display = 'none';
    currentStep = step;
    document.getElementById(`step${currentStep}`).style.display = 'block';
}

/**
 * Финальное подтверждение записи из booking.html
 */
function confirmBookingFinal() {
    const currentUserData = JSON.parse(localStorage.getItem('beautyTime_user'));
    if (!currentUserData) { alert('Пожалуйста, войдите в аккаунт'); window.location.href = 'profile.html'; return; }

    const total = bookingData.selectedServices.reduce((sum, s) => sum + s.price, 0);
    const appointments = JSON.parse(localStorage.getItem(`appointments_${currentUserData.phone}`) || '[]');
    appointments.push({
        id: Date.now(),
        services: bookingData.selectedServices,
        serviceName: bookingData.selectedServices.map(s => s.name).join(', '),
        totalPrice: total,
        price: total,
        masterId: bookingData.masterId,
        masterName: bookingData.masterName,
        date: bookingData.date,
        time: bookingData.time,
        createdAt: new Date().toISOString()
    });

    localStorage.setItem(`appointments_${currentUserData.phone}`, JSON.stringify(appointments));
    alert('Запись успешно создана!');
    window.location.href = 'profile.html';
}

// ===== 10. ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ =====
document.addEventListener('DOMContentLoaded', () => {
    initScrollTop(); // Кнопка "Наверх"
    updateProfileLink(); // Ссылка иконки профиля
    initSlider(); // Слайдер на главной

    renderMasters(); // Карточки мастеров на странице "О нас"

    // Отзывы на странице reviews.html
    if (document.getElementById('reviewsGrid')) {
        loadReviews();
        renderReviews();
    }

    // Форма записи на sign-up.html (старая версия)
    if (document.getElementById('services-container') && !document.getElementById('categorySelectWrapper')) {
        renderServices();
        updateMasters();
        renderCalendar();
        renderTimeSlots();
        updateCartBadge();
    }

    // Пошаговая форма записи на booking.html
    if (document.getElementById('categorySelectWrapper')) {
        console.log('📄 Это страница booking.html');
        initCustomSelectBooking();

        const step1 = document.getElementById('step1');
        if (step1) step1.style.display = 'block';

        for (let i = 2; i <= 5; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) step.style.display = 'none';
        }

        window.confirmBooking = confirmBookingFinal;
    }

    // Страница профиля
    if (window.location.href.includes('profile.html')) {
        const savedUser = JSON.parse(localStorage.getItem('beautyTime_user'));
        if (savedUser) {
            currentUser = savedUser;
            if (currentUser.isAdmin) {
                window.location.href = 'admin.html';
            } else {
                afterLogin();
            }
        } else {
            document.getElementById('profile-login').style.display = 'block';
            document.getElementById('profile-authenticated').style.display = 'none';
        }
    }

    // Админ-панель
    if (window.location.href.includes('admin.html')) {
        const savedUser = JSON.parse(localStorage.getItem('beautyTime_user'));
        if (!savedUser) {
            window.location.href = 'profile.html';
        } else if (!savedUser.isAdmin) {
            window.location.href = '../index.html';
        } else {
            currentUser = savedUser;
            if (!localStorage.getItem('beautyTime_masters')) saveMastersList(defaultMasters);
            if (!localStorage.getItem('beautyTime_services')) saveServicesList(defaultServices);
            if (!localStorage.getItem('beautyTime_reviews')) saveReviewsAdmin(defaultReviewsAdmin);
            renderAppointments();
            updateStats();
        }
    }
});

/**
 * Очистка всех записей администратора из localStorage
 */
function clearAllAppointments() {
    if (confirm('Удалить ВСЕ записи? Это действие нельзя отменить!')) {
        const adminPhone = '89870035084';
        localStorage.removeItem(`appointments_${adminPhone}`);
        alert('Все записи удалены!');
        location.reload();
    }
}