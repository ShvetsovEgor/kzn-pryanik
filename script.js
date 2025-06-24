// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // Закрываем меню при клике на ссылку
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // Product catalog
    const products = [];
    const productGrid = document.querySelector('.catalog-grid');
    console.log('Product grid element:', productGrid);

    function renderProducts() {
        console.log('Rendering products:', products);
        console.log('Number of products to render:', products.length);
        
        if (!productGrid) {
            console.error('Product grid not found');
            return;
        }

        const html = products.map((product, index) => {
            console.log(`Rendering product ${index}:`, product);
            return `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-details">
                        <span class="price">${product.price} ₽/кг</span>
                    </div>
                    <p class="composition">${product.composition}</p>
                    <button class="btn btn-primary request-price" data-product="${product.id}">Запросить цену</button>
                </div>
            `;
        }).join('');

        console.log('Generated HTML:', html);
        productGrid.innerHTML = html;

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

    // Load products from JSON
    async function loadProducts() {
        console.log('Loading products from JSON...');
        try {
            const response = await fetch('data/products.json');
            console.log('JSON response:', response);
            
            if (!response.ok) {
                throw new Error('Failed to load products');
            }
            
            const productsData = await response.json();
            console.log('Products data:', productsData);
            console.log('Number of products:', productsData.length);
            
            // Clear existing products array
            products.length = 0;
            
            // Add products from JSON data
            productsData.forEach((product, index) => {
                console.log(`Processing product ${index}:`, product);
                
                if (product.id && product.name) {
                    const productObj = {
                        id: product.id,
                        name: product.name,
                        description: product.description || '',
                        image: product.image || 'images/placeholder.png',
                        price: product.price || '',
                        weight: product.weight || '',
                        composition: product.composition || ''
                    };
                    
                    console.log('Adding product:', productObj);
                    products.push(productObj);
                }
            });
            
            console.log('Final products array:', products);
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

    // Initialize certificates carousel
    initCertificatesCarousel();

    // Toast notification function
    function showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const titles = {
            success: 'Успешно!',
            error: 'Ошибка!',
            info: 'Информация'
        };
        
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${titles[type]}</span>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            hideToast(toast);
        });
        
        // Auto hide after duration
        setTimeout(() => {
            hideToast(toast);
        }, duration);
        
        function hideToast(toastElement) {
            toastElement.classList.remove('show');
            setTimeout(() => {
                if (toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
            }, 300);
        }
    }

    // Function to send message to Telegram
    async function sendToTelegram(data) {
        const botToken = '8016920761:AAE30Z0fm-Vf0d90uuVCbt2xijwayNIYaZg';
        const chatId = '1811717442';
        
        // Формируем сообщение
        let message = '🆕 Новая заявка с сайта!\n\n';
        
        if (data.product) {
            message += `📦 Продукт: ${data.product}\n`;
        }
        if (data.name) {
            message += `👤 Имя: ${data.name}\n`;
        }
        if (data.phone) {
            message += `📞 Телефон: ${data.phone}\n`;
        }
        if (data.quantity) {
            message += `⚖️ Количество: ${data.quantity} кг\n`;
        }
        if (data.message) {
            message += `💬 Дополнительная информация: ${data.message}\n`;
        }
        
        message += `\n⏰ Время: ${new Date().toLocaleString('ru-RU')}`;
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            const result = await response.json();
            
            if (result.ok) {
                console.log('Message sent to Telegram successfully');
                return { success: true };
            } else {
                console.error('Telegram API error:', result);
                return { success: false, error: result.description };
            }
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            return { success: false, error: error.message };
        }
    }

    // Function to show price request form
    function showPriceRequestForm(product) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        modalContent.innerHTML = `
            <h3>Запросить цену на "${product.name}"</h3>
            <form id="priceRequestForm">
                <div style="margin-bottom: 15px;">
                    <label for="name">Ваше имя:</label>
                    <input type="text" id="name" name="name" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="phone">Телефон:</label>
                    <input type="tel" id="phone" name="phone" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="quantity">Количество (кг):</label>
                    <input type="number" id="quantity" name="quantity" min="1" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="message">Дополнительная информация:</label>
                    <textarea id="message" name="message" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                </div>
                <input type="hidden" name="product" value="${product.name}">
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding: 10px 20px; border: 1px solid #ddd; background: #f5f5f5; border-radius: 4px; cursor: pointer;">Отмена</button>
                    <button type="submit" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Отправить</button>
                </div>
            </form>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Handle form submission
        const form = modal.querySelector('#priceRequestForm');
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Price request submitted:', data);
            
            // Отправляем в Telegram
            const result = await sendToTelegram(data);
            
            if (result.success) {
                showToast('Спасибо! Ваша заявка принята и отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
            } else {
                console.error('Telegram error:', result.error);
                showToast('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.', 'success');
            }
            
            modal.remove();
        });

        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Form submission handler
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Form submitted:', data);
            
            // Отправляем в Telegram
            const result = await sendToTelegram(data);
            
            if (result.success) {
                showToast('Спасибо! Ваша заявка принята и отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
            } else {
                console.error('Telegram error:', result.error);
                showToast('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.', 'success');
            }
            
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
    priceRequestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Отправка формы:', data);
        
        // Отправляем в Telegram
        const result = await sendToTelegram(data);
        
        if (result.success) {
            showToast('Спасибо! Ваша заявка принята и отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
        } else {
            console.error('Telegram error:', result.error);
            showToast('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.', 'success');
        }
        
        // Очищаем форму
        this.reset();
    });
}

// Certificates Carousel
function initCertificatesCarousel() {
    const carousel = document.querySelector('.certificates-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('.prev-btn');
    const nextBtn = carousel.querySelector('.next-btn');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    function updateCarousel() {
        const slideWidth = 100;
        track.style.transform = `translateX(-${currentSlide * slideWidth}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        // Update buttons
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateCarousel();
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    }

    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
    }

    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Auto-play (optional)
    let autoPlayInterval;
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if (currentSlide < totalSlides - 1) {
                nextSlide();
            } else {
                currentSlide = 0;
                updateCarousel();
            }
        }, 5000); // Change slide every 5 seconds
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Start auto-play
    startAutoPlay();

    // Pause auto-play on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;

    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoPlay();
    });

    carousel.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
                nextSlide(); // Swipe left
            } else {
                prevSlide(); // Swipe right
            }
        }
        
        startAutoPlay();
    });

    // Initialize
    updateCarousel();

    // Image modal functionality
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalClose = document.querySelector('.image-modal-close');

    // Add click event to all carousel images
    slides.forEach((slide, index) => {
        const img = slide.querySelector('img');
        const title = slide.querySelector('h3').textContent;
        const description = slide.querySelector('p').textContent;
        
        img.addEventListener('click', () => {
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            imageModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    // Close modal functionality
    function closeImageModal() {
        imageModal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }

    modalClose.addEventListener('click', closeImageModal);
    
    // Close modal when clicking outside
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal.classList.contains('show')) {
            closeImageModal();
        }
    });
}