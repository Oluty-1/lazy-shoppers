let orders = [];
const ordersList = document.getElementById('ordersList');
const orderForm = document.getElementById('orderForm');
const itemsList = document.getElementById('itemsList');
const addItemBtn = document.getElementById('addItem');
const darkModeToggle = document.getElementById('darkModeToggle');
const confettiContainer = document.getElementById('confetti');
const customCursor = document.getElementById('customCursor');
const loginSection = document.getElementById('loginSection');
const mainSection = document.getElementById('mainSection');
const loginForm = document.getElementById('loginForm');
const requesterInput = document.getElementById('requester');
let itemCount = 1;
const API_BASE = 'http://backend:3000';

async function fetchOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    orders = await res.json();
    renderOrders();
}

function renderOrders() {
    ordersList.innerHTML = '';
    orders.forEach((order, index) => {
        const totalPrice = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const card = document.createElement('div');
        card.className = 'card order-card';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Order by ${order.requester}</h5>
                <ul class="list-group list-group-flush mb-3">
                    ${order.items.map(item => `
                        <li class="list-group-item" style="background: var(--card-bg); border-radius: 8px;">
                            ${item.item} (x${item.quantity}) - ₦${item.price.toFixed(2)} each
                        </li>
                    `).join('')}
                </ul>
                <p class="card-text">Total: ₦${totalPrice.toFixed(2)}</p>
                <p class="card-text">Tip Offered: ₦${order.tip.toFixed(2)}</p>
                <button class="btn btn-success fulfill-btn" data-index="${index}"><i class="bi bi-check-circle"></i> I'll Buy It</button>
            </div>
        `;
        ordersList.appendChild(card);
    });
}

function addItemRow() {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <div>
            <label for="item${itemCount}" class="form-label">Item Needed</label>
            <input type="text" class="form-control" id="item${itemCount}" required placeholder="e.g. Bread">
        </div>
        <div>
            <label for="quantity${itemCount}" class="form-label">Quantity</label>
            <input type="number" class="form-control" id="quantity${itemCount}" min="1" value="1" required>
        </div>
        <div>
            <label for="price${itemCount}" class="form-label">Price (₦)</label>
            <input type="number" class="form-control" id="price${itemCount}" min="0" step="0.01" required placeholder="e.g. 750.00">
        </div>
        <button type="button" class="btn btn-danger remove-item">Remove</button>
    `;
    itemsList.appendChild(row);
    itemCount++;
}

function triggerConfetti() {
    confettiContainer.innerHTML = '';
    confettiContainer.style.display = 'block';
    const colors = ['#ff6f61', '#b8860b', '#28a745', '#ff9a9e', '#a1c4fd', '#c2e9fb'];
    for (let i = 0; i < 150; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = `${Math.random() * 3}s`;
        piece.style.width = `${Math.random() * 12 + 6}px`;
        piece.style.height = `${Math.random() * 24 + 12}px`;
        confettiContainer.appendChild(piece);
    }
    setTimeout(() => {
        confettiContainer.style.display = 'none';
    }, 4000);
}

addItemBtn.addEventListener('click', addItemRow);

itemsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
        e.target.closest('.item-row').remove();
        if (itemsList.children.length === 1) {
            itemsList.querySelector('.remove-item').style.display = 'none';
        }
    }
});

orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const requester = requesterInput.value;
    const tip = parseFloat(document.getElementById('tip').value) || 0;
    const items = Array.from(itemsList.querySelectorAll('.item-row')).map((row, i) => ({
        item: row.querySelector(`#item${i}`).value.trim(),
        quantity: parseInt(row.querySelector(`#quantity${i}`).value),
        price: parseFloat(row.querySelector(`#price${i}`).value) || 0
    })).filter(item => item.item && item.quantity > 0 && item.price >= 0);
    if (requester && items.length > 0) {
        const order = { requester, items, tip };
        await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(order)
        });
        fetchOrders();
        triggerConfetti();
        orderForm.reset();
        itemsList.innerHTML = `
            <div class="item-row">
                <div>
                    <label for="item0" class="form-label">Item Needed</label>
                    <input type="text" class="form-control" id="item0" required placeholder="e.g. Milk">
                </div>
                <div>
                    <label for="quantity0" class="form-label">Quantity</label>
                    <input type="number" class="form-control" id="quantity0" min="1" value="1" required>
                </div>
                <div>
                    <label for="price0" class="form-label">Price (₦)</label>
                    <input type="number" class="form-control" id="price0" min="0" step="0.01" required placeholder="e.g. 1000.50">
                </div>
                <button type="button" class="btn btn-danger remove-item" style="display:none">Remove</button>
            </div>
        `;
        itemCount = 1;
    }
});

ordersList.addEventListener('click', async (e) => {
    if (e.target.closest('.fulfill-btn')) {
        const index = e.target.closest('.fulfill-btn').dataset.index;
        const card = e.target.closest('.card');
        card.style.animation = 'bounceOut 0.6s ease-in-out';
        triggerConfetti();
        setTimeout(async () => {
            await fetch(`${API_BASE}/orders/${index}`, {method: 'DELETE'});
            fetchOrders();
        }, 600);
    }
});

darkModeToggle.addEventListener('change', (e) => {
    document.body.classList.toggle('dark-mode', e.target.checked);
    localStorage.setItem('darkMode', e.target.checked);
});

if (localStorage.getItem('darkMode') === 'true') {
    darkModeToggle.checked = true;
    document.body.classList.add('dark-mode');
}

document.addEventListener('mousemove', (e) => {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userName = document.getElementById('userName').value.trim();
    if (userName) {
        localStorage.setItem('userName', userName);
        loginSection.style.display = 'none';
        mainSection.style.display = 'block';
        requesterInput.value = userName;
        fetchOrders();
    }
});

if (localStorage.getItem('userName')) {
    loginSection.style.display = 'none';
    mainSection.style.display = 'block';
    requesterInput.value = localStorage.getItem('userName');
    fetchOrders();
} else {
    loginSection.style.display = 'block';
    mainSection.style.display = 'none';
}