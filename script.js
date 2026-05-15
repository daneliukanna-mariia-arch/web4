const products = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        price: 45000,
        type: "iphone",
        desc: "Корпус із авіаційного титану та процесор A17 Pro.",
        sale: "Hot",
        img: "images/iphone-15-pro-blk-01-1600x1600.webp"
    },

    {
        id: 2,
        name: "iPhone 13",
        price: 22000,
        type: "iphone",
        desc: "Надійний смартфон із чудовою автономністю.",
        sale: "",
        img: "images/250318170022513675.webp"
    },

    {
        id: 3,
        name: "Samsung S24",
        price: 38000,
        type: "android",
        desc: "Інтелектуальні функції Galaxy AI та неймовірна камера.",
        sale: "-10%",
        img: "images/samsung-s24-s921-grey-01-1600x1600.webp"
    },

    {
        id: 4,
        name: "iPhone 15",
        price: 32000,
        type: "iphone",
        desc: "Яскравий дизайн та роз'єм USB-C.",
        sale: "",
        img: "images/iphone15-blue.webp"
    }
];

const news = [
    {
        title: "Відкриття нового магазину",
        status: "urgent",
        text: "Чекаємо вас у ТЦ Technovate о 10:00!",
        date: "2026-05-07 10:00"
    },

    {
        title: "Нова поставка iPhone",
        status: "important",
        text: "Всі кольори iPhone 15 вже в наявності.",
        date: "2026-05-06 14:30"
    },

    {
        title: "Знижки на Samsung",
        status: "normal",
        text: "До кінця тижня діють спеціальні ціни.",
        date: "2026-05-05 16:00"
    },

    {
        title: "Новий сервіс доставки",
        status: "important",
        text: "Доставка тепер працює по всій Україні.",
        date: "2026-05-04 12:00"
    }
];

let displayedNewsCount = 2;
let lastResult = [...products];
let cart = [];


// ====================== PRODUCTS ======================

function renderProducts(data) {

    const grid = document.getElementById("productGrid");

    if (!grid) return;

    grid.innerHTML = "";

    data.forEach(item => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            ${item.sale ? `<div class="badge">${item.sale}</div>` : ""}

            <img src="${item.img}" alt="${item.name}">

            <h3>${item.name}</h3>

            <p class="price">${item.price} грн</p>

            <button class="toggle-desc-btn">
                Деталі
            </button>

            <p class="desc hidden">
                ${item.desc}
            </p>

            <button class="buy-btn">
                Купити
            </button>
        `;

        // Опис
        const descBtn = card.querySelector(".toggle-desc-btn");

        descBtn.addEventListener("click", () => {

            card.querySelector(".desc").classList.toggle("hidden");

        });

        // Купити
        const buyBtn = card.querySelector(".buy-btn");

        buyBtn.addEventListener("click", () => {

            addToCart(item.id);
            drawCharts();
        });

        grid.appendChild(card);

    });

}


// ====================== FILTERS ======================

function applyFilters() {

    const category =
        document.getElementById("categoryFilter").value;

    const sort =
        document.getElementById("sortSelect").value;

    const min =
        +document.getElementById("minPrice").value || 0;

    const max =
        +document.getElementById("maxPrice").value || Infinity;

    const search =
        document.getElementById("searchInput")
        .value
        .toLowerCase();

    let result = products.filter(item => {

        return (
            (category === "all" || item.type === category) &&
            item.price >= min &&
            item.price <= max &&
            item.name.toLowerCase().includes(search)
        );

    });

    // SORT
    if (sort === "name") {

        result.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

    }

    if (sort === "priceAsc") {

        result.sort((a, b) =>
            a.price - b.price
        );

    }

    if (sort === "priceDesc") {

        result.sort((a, b) =>
            b.price - a.price
        );

    }

    lastResult = result;

    renderProducts(result);

    drawCharts();

}


// ====================== NEWS ======================

function renderNews() {

    const titlesContainer =
        document.getElementById("newsTitles");

    if (!titlesContainer) return;

    titlesContainer.innerHTML = "";

    const sortedNews = [...news].sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );

    const newsToShow =
        sortedNews.slice(0, displayedNewsCount);

    newsToShow.forEach(n => {

        const div = document.createElement("div");

        div.className = `news-title-item ${n.status}`;

        const time = n.date.split(" ")[1];

        div.innerHTML = `
            <span>${time}</span>
            <div class="title-text">
                ${n.title}
            </div>
        `;

        div.onclick = () => {

            document
                .querySelectorAll(".news-title-item")
                .forEach(el =>
                    el.classList.remove("active")
                );

            div.classList.add("active");

            showNewsBody(n);

        };

        titlesContainer.appendChild(div);

    });

    const loadBtn =
        document.getElementById("loadMoreNewsBtn");

    if (loadBtn) {

        loadBtn.style.display =
            displayedNewsCount >= news.length
                ? "none"
                : "block";

    }

}


function showNewsBody(newsItem) {

    const content =
        document.getElementById("newsContent");

    content.innerHTML = `
        <h3>${newsItem.title}</h3>

        <p class="news-date">
            ${newsItem.date}
        </p>

        <hr>

        <p>${newsItem.text}</p>
    `;

}


function loadMoreNews() {

    displayedNewsCount += 2;

    renderNews();

}

document
    .getElementById("loadMoreNewsBtn")
    ?.addEventListener("click", loadMoreNews);


// ====================== CART ======================

function toggleCart() {

    document
        .getElementById("cart")
        .classList.toggle("hidden");

}

document
    .getElementById("cartTrigger")
    ?.addEventListener("click", toggleCart);

document
    .getElementById("closeCart")
    ?.addEventListener("click", toggleCart);


function addToCart(id) {

    const item = products.find(p => p.id === id);

    const existing =
        cart.find(i => i.id === id);

    if (existing) {

        existing.qty += 1;

    } else {

        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: 1
        });

    }

    renderCart();

}


function renderCart() {

    const container =
        document.getElementById("cartItems");

    let total = 0;

    container.innerHTML = "";

    cart.forEach((item, index) => {

        const sum = item.price * item.qty;

        total += sum;

        const li = document.createElement("li");

        li.className = "cart-item";

        li.innerHTML = `
            <span class="name">
                ${item.name}
            </span>

            <span class="price">
                ${item.price} грн ×
            </span>

            <input
                type="number"
                min="1"
                value="${item.qty}"
                class="qty-input"
            >

            <span class="sum">
                ${sum} грн
            </span>

            <button class="remove-btn">
                ✖️
            </button>
        `;

        // quantity
        li.querySelector(".qty-input")
            .addEventListener("change", (e) => {

                changeQty(index, e.target.value);

            });

        // remove
        li.querySelector(".remove-btn")
            .addEventListener("click", () => {

                removeFromCart(index);
                drawCharts();
            });

        container.appendChild(li);

    });

    document.getElementById("cartTotal")
        .innerText = `Разом: ${total} грн`;

    document.getElementById("cartCount")
        .innerText = cart.length;

    const btn =
        document.getElementById("checkoutBtn");

    btn.disabled = cart.length === 0;

}


function changeQty(index, value) {

    cart[index].qty = +value;

    renderCart();
    drawCharts();
}


function removeFromCart(index) {

    cart.splice(index, 1);

    renderCart();

}


// ====================== ORDER ======================
function sendOrder() {

    if (cart.length === 0) return;

    const info =
        document.getElementById("orderInfo");

    const total =
        document.getElementById("cartTotal").innerText;

    const list = cart.map(item => `
        <li>${item.name} — ${item.qty} шт.</li>
    `).join("");

    info.innerHTML = `
        <p>Дякуємо за замовлення!</p>
        <ul>${list}</ul>
        <p><strong>${total}</strong></p>
    `;

    // закриваємо авторизацію
    document.getElementById("authModal")
        .classList.add("hidden");

    // відкриваємо повідомлення
    document.getElementById("orderModal")
        .classList.remove("hidden");

    cart = [];

    renderCart();
}

document
    .getElementById("checkoutBtn")
    ?.addEventListener("click", sendOrder);


function closeOrderModal() {

    document
        .getElementById("orderModal")
        .classList.add("hidden");

}

document
    .getElementById("closeOrderModal")
    ?.addEventListener("click", closeOrderModal);

document
    .getElementById("orderOkBtn")
    ?.addEventListener("click", closeOrderModal);


// ====================== MODAL ======================

const modal =
    document.getElementById("authModal");

document
    .getElementById("authBtn")
    ?.addEventListener("click", () => {

        modal.classList.remove("hidden");

    });

document
    .getElementById("closeAuthModal")
    ?.addEventListener("click", () => {

        modal.classList.add("hidden");

    });

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.classList.add("hidden");

    }

});

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const btnShowLogin = document.getElementById("showLogin");
const btnShowRegister = document.getElementById("showRegister");

// Перемикання на Реєстрацію
btnShowRegister?.addEventListener("click", () => {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    btnShowRegister.classList.add("active");
    btnShowLogin.classList.remove("active");
});

// Перемикання на Вхід
btnShowLogin?.addEventListener("click", () => {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    btnShowLogin.classList.add("active");
    btnShowRegister.classList.remove("active");
});

// Обробка реєстрації
registerForm?.addEventListener("submit", (e) => {
    e.preventDefault(); // Щоб сторінка не перезавантажувалася

    const pass = document.getElementById("regPass").value;
    const confirm = document.getElementById("regPassConfirm").value;
    const errorMsg = document.getElementById("regError");

    if (pass !== confirm) {
        errorMsg.classList.remove("hidden");
        return;
    }

    errorMsg.classList.add("hidden");
    alert("Реєстрація успішна! Тепер ви можете увійти.");
    // Тут можна автоматично перемкнути на вхід
    btnShowLogin.click();
});



// ====================== CHARTS ======================

function drawCharts() {

    const canvas =
        document.getElementById("chartCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const chartType =
        document.getElementById("chartType").value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // =========================
    // ДАНІ ПРО ПОПУЛЯРНІСТЬ
    // =========================

    let stats = {};

    // якщо кошик порожній —
    // беремо всі товари по 1
    if (cart.length === 0) {

        products.forEach(item => {

            stats[item.name] = 1;

        });

    } else {

        cart.forEach(item => {

            stats[item.name] = item.qty;

        });

    }

    const labels = Object.keys(stats);

    const values = Object.values(stats);

    if (labels.length === 0) {

        ctx.font = "20px Arial";

        ctx.fillText(
            "Немає даних",
            220,
            200
        );

        return;

    }

    // =========================
    // 1. СТОВПЧИКОВА ДІАГРАМА
    // =========================

    if (chartType === "bar") {

        const max =
            Math.max(...values);

        labels.forEach((label, i) => {

            const value = values[i];

            const barHeight =
                (value / max) * 250;

            const x = 70 + i * 130;

            const y = 330 - barHeight;

            // стовпчик
            ctx.fillStyle = "#222";

            ctx.fillRect(
                x,
                y,
                70,
                barHeight
            );

            // кількість
            ctx.fillStyle = "#000";

            ctx.font = "bold 16px Arial";

            ctx.fillText(
                value,
                x + 25,
                y - 10
            );

            // назва
            ctx.font = "12px Arial";

            ctx.fillText(
                label,
                x - 10,
                360
            );

        });

        ctx.font = "18px Arial";

        ctx.fillText(
            "Популярність товарів",
            190,
            30
        );

    }

    // =========================
    // 2. КРУГОВА ДІАГРАМА
    // =========================

    else if (chartType === "pie") {

        const total =
            values.reduce((a, b) => a + b, 0);

        const colors = [
            "#111",
            "#444",
            "#777",
            "#999",
            "#bbb"
        ];

        let lastAngle = 0;

        labels.forEach((label, i) => {

            const value = values[i];

            const angle =
                (value / total) *
                Math.PI * 2;

            ctx.fillStyle =
                colors[i % colors.length];

            ctx.beginPath();

            ctx.moveTo(300, 200);

            ctx.arc(
                300,
                200,
                130,
                lastAngle,
                lastAngle + angle
            );

            ctx.fill();

            // підпис %
            const middle =
                lastAngle + angle / 2;

            const tx =
                300 +
                Math.cos(middle) * 180;

            const ty =
                200 +
                Math.sin(middle) * 180;

            const percent =
                Math.round(
                    (value / total) * 100
                );

            ctx.fillStyle = "#000";

            ctx.font = "13px Arial";

            ctx.fillText(
                `${label} ${percent}%`,
                tx - 30,
                ty
            );

            lastAngle += angle;

        });

        ctx.font = "18px Arial";

        ctx.fillText(
            "Частка популярності",
            200,
            30
        );

    }

    // =========================
    // 3. ЛІНІЙНИЙ ГРАФІК
    // =========================

    else if (chartType === "line") {

        const max =
            Math.max(...values);

        ctx.beginPath();

        ctx.lineWidth = 3;

        ctx.strokeStyle = "#111";

        labels.forEach((label, i) => {

            const value = values[i];

            const x = 80 + i * 150;

            const y =
                330 -
                (value / max) * 220;

            if (i === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);

            }

        });

        ctx.stroke();

        // точки
        labels.forEach((label, i) => {

            const value = values[i];

            const x = 80 + i * 150;

            const y =
                330 -
                (value / max) * 220;

            ctx.beginPath();

            ctx.fillStyle = "#222";

            ctx.arc(
                x,
                y,
                7,
                0,
                Math.PI * 2
            );

            ctx.fill();

            // значення
            ctx.fillStyle = "#000";

            ctx.font = "14px Arial";

            ctx.fillText(
                value,
                x - 5,
                y - 15
            );

            // назва
            ctx.font = "12px Arial";

            ctx.fillText(
                label,
                x - 25,
                360
            );

        });

        ctx.font = "18px Arial";

        ctx.fillText(
            "Динаміка популярності",
            190,
            30
        );

    }

}
document
    .getElementById("chartType")
    ?.addEventListener("change", drawCharts);


// ====================== EVENTS ======================

document
    .getElementById("searchInput")
    ?.addEventListener("input", applyFilters);

document
    .getElementById("sortSelect")
    ?.addEventListener("change", applyFilters);

document
    .getElementById("applyFiltersBtn")
    ?.addEventListener("click", applyFilters);


// ====================== INIT ======================

renderProducts(products);

renderNews();

renderCart();

drawCharts();

console.log("PhoneHub успішно завантажено!");