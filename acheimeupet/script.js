// ========================================
// NAVEGAÇÃO E MENU MOBILE
// ========================================

const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle menu mobile
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = navToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('ri-menu-line');
            icon.classList.add('ri-close-line');
        } else {
            icon.classList.remove('ri-close-line');
            icon.classList.add('ri-menu-line');
        }
    });
}

// Fechar menu ao clicar em um link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = navToggle.querySelector('i');
        icon.classList.remove('ri-close-line');
        icon.classList.add('ri-menu-line');
    });
});

// Scroll suave para âncoras
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// MODAL DE COMPRA
// ========================================

const modal = document.getElementById('modal-compra');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const btnsComprar = [
    document.getElementById('btn-comprar-header'),
    document.getElementById('btn-comprar-hero')
];

// Abrir modal
btnsComprar.forEach(btn => {
    if (btn) {
        btn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
});

// Fechar modal
const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
}

// Fechar modal com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// ========================================
// BOTÕES ATIVAR TAG
// ========================================

const btnsAtivar = [
    document.getElementById('btn-ativar-header'),
    document.getElementById('btn-ativar-hero')
];

btnsAtivar.forEach(btn => {
    if (btn) {
        btn.addEventListener('click', () => {
            const ativarSection = document.getElementById('ativar-tag');
            if (ativarSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = ativarSection.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
});

// ========================================
// FAQ ACCORDION
// ========================================

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Fechar todos os itens
        faqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
        });
        
        // Abrir o item clicado se não estava ativo
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// ========================================
// FORMULÁRIO ATIVAR TAG
// ========================================

const formAtivar = document.getElementById('form-ativar');

if (formAtivar) {
    formAtivar.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Coletar dados do formulário
        const formData = new FormData(formAtivar);
        
        // Converter FormData para objeto JSON
        const data = {};
        formData.forEach((value, key) => {
            // Ignorar arquivo de foto por enquanto (webhook pode não suportar)
            if (key !== 'foto_pet') {
                data[key] = value;
            }
        });
        
        // Adicionar timestamp
        data.timestamp = new Date().toISOString();
        data.tipo = 'ativacao_tag';
        
        try {
            // Enviar para o webhook
            const response = await fetch('https://webhook.fiqon.app/webhook/a018d905-b76f-460e-bb85-c0ed3ad375eb/dbef3e88-594b-45e9-9de7-cf5bc122914c', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                // Mostrar mensagem de sucesso
                alert('✅ Tag ativada com sucesso! Em breve você receberá uma confirmação.');
                
                // Limpar formulário
                formAtivar.reset();
                
                // Scroll para o topo da página
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                throw new Error('Erro ao enviar dados');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('❌ Ocorreu um erro ao ativar a tag. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
        }
    });
}

// ========================================
// FORMULÁRIO ACHEI UM PET
// ========================================

const formAchei = document.getElementById('form-achei');

if (formAchei) {
    formAchei.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Coletar dados do formulário
        const formData = new FormData(formAchei);
        
        // Converter FormData para objeto JSON
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // Adicionar timestamp
        data.timestamp = new Date().toISOString();
        data.tipo = 'achei_pet';
        
        try {
            // Enviar para o webhook
            const response = await fetch('https://webhook.fiqon.app/webhook/a018d905-b76f-460e-bb85-c0ed3ad375eb/dbef3e88-594b-45e9-9de7-cf5bc122914c', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                // Mostrar mensagem de sucesso
                alert('✅ Mensagem enviada ao tutor! Obrigado por ajudar a reconectar este pet com sua família.');
                
                // Limpar formulário
                formAchei.reset();
                
                // Scroll para o topo da página
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                throw new Error('Erro ao enviar dados');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('❌ Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente ou entre em contato pelo WhatsApp (16) 99240-2471.');
        }
    });
}

// ========================================
// MÁSCARA DE TELEFONE
// ========================================

function maskPhone(value) {
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    return value;
}

const phoneInputs = document.querySelectorAll('input[type="tel"]');

phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        e.target.value = maskPhone(e.target.value);
    });
});

// ========================================
// ANIMAÇÕES AO SCROLL
// ========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Elementos para animar
const animateElements = document.querySelectorAll('.step, .beneficio-card, .faq-item');

animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ========================================
// HEADER SCROLL EFFECT
// ========================================

const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    }
    
    lastScroll = currentScroll;
});

// ========================================
// VALIDAÇÃO DE FORMULÁRIOS
// ========================================

// Validar código da tag (formato básico)
const codigoTagInputs = document.querySelectorAll('#codigo-tag, #codigo-tag-achei');

codigoTagInputs.forEach(input => {
    input.addEventListener('blur', () => {
        const value = input.value.trim();
        if (value && value.length < 3) {
            input.setCustomValidity('O código da tag deve ter pelo menos 3 caracteres');
            input.reportValidity();
        } else {
            input.setCustomValidity('');
        }
    });
    
    input.addEventListener('input', () => {
        input.setCustomValidity('');
    });
});

// Validar WhatsApp
const whatsappInput = document.getElementById('whatsapp');

if (whatsappInput) {
    whatsappInput.addEventListener('blur', () => {
        const value = whatsappInput.value.replace(/\D/g, '');
        if (value && value.length < 10) {
            whatsappInput.setCustomValidity('Por favor, insira um número de WhatsApp válido');
            whatsappInput.reportValidity();
        } else {
            whatsappInput.setCustomValidity('');
        }
    });
    
    whatsappInput.addEventListener('input', () => {
        whatsappInput.setCustomValidity('');
    });
}

// ========================================
// PREVIEW DE IMAGEM
// ========================================

const fotoInput = document.getElementById('foto-pet');

if (fotoInput) {
    fotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            // Validar tamanho (máx 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('❌ A imagem deve ter no máximo 5MB');
                fotoInput.value = '';
                return;
            }
            
            // Validar tipo
            if (!file.type.startsWith('image/')) {
                alert('❌ Por favor, selecione apenas arquivos de imagem');
                fotoInput.value = '';
                return;
            }
        }
    });
}

// ========================================
// CONSOLE LOG
// ========================================

console.log('%c🐾 AcheiMeuPet', 'font-size: 20px; font-weight: bold; color: #5CD6E0;');
console.log('%cEm memória do Picolé 💙', 'font-size: 14px; color: #666;');
console.log('%cSite desenvolvido com amor e propósito', 'font-size: 12px; color: #999;');

