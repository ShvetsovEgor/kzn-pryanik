// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.overlay');

    if (mobileMenuBtn && mobileMenu && overlay) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        overlay.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    // Product catalog
    const products = [];
    const productGrid = document.querySelector('.catalog-grid');
    console.log('Product grid element:', productGrid);

    function renderProducts() {
        console.log('Rendering products:', products);
        if (!productGrid) {
            console.error('Product grid not found');
            return;
        }

        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-details">
                    <span class="price">${product.price} ₽/кг</span>
                    <span class="weight">${product.weight}</span>
                </div>
                <p class="composition">${product.composition}</p>
                <button class="btn btn-primary request-price" data-product="${product.id}">Запросить цену</button>
            </div>
        `).join('');

        console.log('Products rendered');

        // Add event listeners to price request buttons
        document.querySelectorAll('.request-price').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.product;
                const product = products.find(p => p.id === productId);
                if (product) {
                    showPriceRequestForm(product);
                }
            });
        });
    }

    // Load products from CSV
    async function loadProducts() {
        console.log('Loading products...');
        try {
            const response = await fetch('data/products.csv');
            console.log('CSV response:', response);
            
            if (!response.ok) {
                throw new Error('Failed to load products');
            }
            
            const csvText = await response.text();
            console.log('CSV text:', csvText);
            
            // Split by newlines and remove empty lines and carriage returns
            const rows = csvText.split('\n')
                .map(row => row.replace(/\r/g, '').trim())
                .filter(row => row.length > 0);
            
            console.log('CSV rows:', rows);
            
            // Skip header row
            for (let i = 1; i < rows.length; i++) {
                // Split by comma, but respect quoted values
                const fields = [];
                let currentField = '';
                let inQuotes = false;
                
                for (let j = 0; j < rows[i].length; j++) {
                    const char = rows[i][j];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        fields.push(currentField.trim());
                        currentField = '';
                    } else {
                        currentField += char;
                    }
                }
                fields.push(currentField.trim());
                
                const [id, name, description, image, price, weight, composition] = fields;
                console.log('Processing row:', { id, name, description, image, price, weight, composition });
                
                if (id && name) {
                    products.push({
                        id,
                        name: name.replace(/^"|"$/g, ''),
                        description: description.replace(/^"|"$/g, ''),
                        image: image.replace(/^"|"$/g, ''),
                        price: price.replace(/^"|"$/g, ''),
                        weight: weight.replace(/^"|"$/g, ''),
                        composition: composition.replace(/^"|"$/g, '')
                    });
                }
            }
            
            console.log('Products loaded:', products);
            renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            if (productGrid) {
                productGrid.innerHTML = '<p class="error">Ошибка загрузки каталога. Пожалуйста, попробуйте позже.</p>';
            }
        }
    }

    // Initialize products
    loadProducts();

    // Form submission handler
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // Here you would typically send the data to your server
            console.log('Form submitted:', data);
            
            // Show success message
            alert('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');
            this.reset();
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            }
        });
    });

    // Initialize map
    if (typeof ymaps !== 'undefined') {
        ymaps.ready(function() {
            const map = new ymaps.Map('map', {
                center: [55.76, 37.64],
                zoom: 10
            });
        });
    }
});

// Initialize Map
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const location = { lat: 55.7887, lng: 49.1221 }; // Координаты Казани
    const map = new google.maps.Map(mapElement, {
        zoom: 15,
        center: location,
    });

    new google.maps.Marker({
        position: location,
        map: map,
        title: 'Казанские пряники'
    });
}

// Load Google Maps API
function loadGoogleMapsAPI() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// Wholesale Order Button Handler
const wholesaleButton = document.querySelector('.btn-large');
if (wholesaleButton) {
    wholesaleButton.addEventListener('click', (e) => {
        e.preventDefault();
        const wholesaleSection = document.querySelector('#wholesale');
        if (wholesaleSection) {
            wholesaleSection.scrollIntoView({ behavior: 'smooth' });
            // Открываем форму заказа
            const wholesaleForm = document.querySelector('.wholesale-form');
            if (wholesaleForm) {
                wholesaleForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

// Обработка формы запроса прайса
const priceRequestForm = document.getElementById('priceRequestForm');
if (priceRequestForm) {
    priceRequestForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        // Здесь можно добавить отправку данных на сервер
        console.log('Отправка формы:', data);
        
        // Показываем сообщение об успешной отправке
        alert('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');
        
        // Очищаем форму
        this.reset();
    });
} 