document.addEventListener('DOMContentLoaded', () => portfolioApp.init());

const portfolioApp = {
    init() {
        const backToTop = createBackToTopButton(document.body);
        const contactForm = document.querySelector('#contact-form');
        const siteSearch = document.querySelector('#site-search');

        if (contactForm) {
            setupContactForm(contactForm);
        }

        if (siteSearch) {
            setupSiteSearch(siteSearch);
        }

        setupBackToTop(backToTop);
        setupSmoothNavigation();
        setupCarousels();
        setupReadMoreButtons();
        setupResponsiveNavigation();
    },

    showBackToTop(button) {
        button.classList.toggle('is-visible', window.scrollY > 500);
    },

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

function setupCarousels() {
    document.querySelectorAll('.carousel').forEach((carousel) => {
        const track = carousel.querySelector('.carousel-track');
        const slides = [...carousel.querySelectorAll('.gallery-item')];
        const indicators = carousel.querySelector('.carousel-indicators');
        const controls = [...carousel.querySelectorAll('[data-carousel-direction]')];
        let currentPage = 0;
        let visibleSlides = getVisibleSlides();

        if (!track || !slides.length || !indicators) {
            return;
        }

        function render() {
            const pageCount = Math.ceil(slides.length / visibleSlides);
            currentPage = Math.min(currentPage, pageCount - 1);
            indicators.replaceChildren();

            for (let page = 0; page < pageCount; page += 1) {
                const indicator = document.createElement('button');

                indicator.type = 'button';
                indicator.className = 'carousel-indicator';
                indicator.setAttribute('aria-label', `Show gallery group ${page + 1}`);
                indicator.setAttribute('aria-current', String(page === currentPage));
                indicator.addEventListener('click', () => {
                    currentPage = page;
                    render();
                });
                indicators.append(indicator);
            }

            track.style.transform = `translateX(-${currentPage * 100}%)`;
            controls.forEach((control) => {
                control.disabled = pageCount < 2;
            });
        }

        controls.forEach((control) => {
            control.addEventListener('click', () => {
                const pageCount = Math.ceil(slides.length / visibleSlides);
                const direction = Number(control.dataset.carouselDirection);
                currentPage = (currentPage + direction + pageCount) % pageCount;
                render();
            });
        });

        window.addEventListener('resize', () => {
            const nextVisibleSlides = getVisibleSlides();

            if (nextVisibleSlides !== visibleSlides) {
                visibleSlides = nextVisibleSlides;
                render();
            }
        }, { passive: true });

        render();
    });
}

function getVisibleSlides() {
    if (window.matchMedia('(max-width: 575px)').matches) {
        return 1;
    }

    if (window.matchMedia('(max-width: 991px)').matches) {
        return 2;
    }

    return 4;
}

function setupSiteSearch(form) {
    const input = form.querySelector('input[type="search"]');
    const status = form.querySelector('[role="status"]');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = input.value.trim().toLocaleLowerCase();

        if (!query) {
            status.textContent = 'Enter a search term.';
            input.focus();
            return;
        }

        const match = [...document.querySelectorAll('main section')]
            .find((section) => section.textContent.toLocaleLowerCase().includes(query));

        if (!match) {
            status.textContent = `No portfolio section found for “${input.value.trim()}”.`;
            return;
        }

        status.textContent = `Showing ${match.querySelector('h1, h2')?.textContent || 'matching section'}.`;
        match.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function setupBackToTop(button) {
    window.addEventListener('scroll', () => portfolioApp.showBackToTop(button), { passive: true });
    button.addEventListener('click', portfolioApp.scrollToTop);
}

function setupContactForm(form) {
    const formMessage = createFormMessage();
    form.append(formMessage);

    form.addEventListener('submit', (event) => handleFormSubmit(event, form, formMessage));
}

function createFormMessage() {
    const message = document.createElement('p');

    message.className = 'form-message';
    message.setAttribute('role', 'status');
    return message;
}

function handleFormSubmit(event, form, message) {
    event.preventDefault();
    message.textContent = 'Thanks for reaching out. Your message is ready to send.';
    form.reset();
}

function setupSmoothNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', handleNavigationClick);
    });
}

function setupResponsiveNavigation() {
    const header = document.querySelector('body > header');
    const navigation = header?.querySelector('nav');

    if (!header || !navigation) {
        return;
    }

    const menuButton = document.createElement('button');
    const mobileQuery = window.matchMedia('(max-width: 760px)');

    menuButton.type = 'button';
    menuButton.className = 'nav-toggle';
    menuButton.setAttribute('aria-label', 'Toggle navigation');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = 'Menu';
    header.insertBefore(menuButton, navigation);

    menuButton.addEventListener('click', () => {
        const isOpen = header.classList.toggle('menu-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    navigation.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeMobileNavigation(header, menuButton));
    });

    mobileQuery.addEventListener('change', () => {
        if (!mobileQuery.matches) {
            closeMobileNavigation(header, menuButton);
        }
    });
}

function closeMobileNavigation(header, menuButton) {
    header.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
}

function handleNavigationClick(event) {
    const target = document.querySelector(event.currentTarget.getAttribute('href'));

    if (!target) {
        return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupReadMoreButtons() {
    document.querySelectorAll('.read-more-button').forEach((button) => {
        button.addEventListener('click', showDetails);
    });

    document.querySelectorAll('.back-button').forEach((button) => {
        button.addEventListener('click', hideDetails);
    });
}

function showDetails(event) {
    const button = event.currentTarget;
    const details = document.getElementById(button.dataset.moreTarget);
    const card = button.closest('.service-card, .study-card');

    if (!details || !card) {
        return;
    }

    const detailPage = createDetailPage(card, details);
    document.body.append(detailPage);
    document.body.classList.add('detail-mode');
}

function hideDetails(event) {
    const detailPage = event.currentTarget.closest('.detail-page');

    if (!detailPage) {
        return;
    }

    detailPage.remove();
    document.body.classList.remove('detail-mode');
}

function createDetailPage(card, details) {
    const detailPage = document.createElement('section');
    const title = document.createElement('h1');
    const paragraph = document.createElement('p');
    const backButton = document.createElement('button');

    detailPage.className = 'detail-page';
    detailPage.setAttribute('aria-live', 'polite');
    title.textContent = card.querySelector('h3').textContent;
    paragraph.textContent = details.querySelector('p').textContent;
    backButton.type = 'button';
    backButton.className = 'back-button';
    backButton.textContent = 'Back to Portfolio';
    backButton.addEventListener('click', hideDetails);

    detailPage.append(title, paragraph, backButton);
    return detailPage;
}

function createBackToTopButton(parentElement) {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.textContent = '\u2191';
    parentElement.append(button);

    return button;
}
