# 🐾 AcheiMeuPet - Site Oficial

Site moderno e responsivo para o projeto **AcheiMeuPet**, uma iniciativa que utiliza tags inteligentes com QR Code para proteger e reconectar animais a seus tutores.

## 📋 Sobre o Projeto

O AcheiMeuPet nasceu da história real do Picolé, um cachorro que viveu ao lado de seu tutor por dez anos. O projeto é uma homenagem a ele e tem o propósito de evitar que outros tutores passem pela dor de perder um animal sem saber onde ele está.

## 🚀 Como Usar

### Estrutura de Arquivos

```
acheimeupet/
├── index.html          # Página principal
├── styles.css          # Estilos visuais
├── script.js           # Funcionalidades interativas
├── logo-acheimeupet.png # Logo (substituir pela versão real)
├── picole.jpg          # Foto do Picolé (substituir pela versão real)
└── README.md           # Este arquivo
```

### Substituir Imagens

1. **Logo (logo-acheimeupet.png)**
   - Substitua o arquivo `logo-acheimeupet.png` pela versão real do logo
   - Recomendado: formato PNG com fundo transparente
   - Dimensões sugeridas: 400x100px ou proporção similar

2. **Foto do Picolé (picole.jpg)**
   - Substitua o arquivo `picole.jpg` pela foto real do Picolé
   - Recomendado: formato JPG de alta qualidade
   - Dimensões sugeridas: 600x600px ou superior

### Publicar o Site

O site está pronto para ser publicado em qualquer serviço de hospedagem gratuito:

#### **Opção 1: Vercel**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
cd acheimeupet
vercel
```

#### **Opção 2: Netlify**
1. Acesse [netlify.com](https://netlify.com)
2. Arraste a pasta `acheimeupet` para o site
3. Pronto! Seu site estará no ar

#### **Opção 3: GitHub Pages**
```bash
# Criar repositório no GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin [seu-repositorio]
git push -u origin main

# Ativar GitHub Pages nas configurações do repositório
```

## ✨ Funcionalidades

### 🎯 Seções do Site

1. **Hero** - Apresentação impactante com call-to-actions
2. **Como Funciona** - 3 passos simples para proteger seu pet
3. **Benefícios** - 4 vantagens da tag AcheiMeuPet
4. **Nossa História** - A história emocionante do Picolé
5. **Ativar Tag** - Formulário funcional para cadastro de pets
6. **Achei um Pet** - Formulário para quem encontrou um pet
7. **FAQ** - Perguntas frequentes com accordion
8. **Contato** - Informações de contato e redes sociais

### 🔧 Recursos Técnicos

- ✅ Design moderno e profissional
- ✅ Totalmente responsivo (desktop, tablet, mobile)
- ✅ Menu mobile com animações
- ✅ Modal de compra com informações do Pix
- ✅ Formulários funcionais conectados ao webhook
- ✅ Validação de campos
- ✅ Máscaras de telefone automáticas
- ✅ Scroll suave entre seções
- ✅ Animações ao scroll
- ✅ FAQ com accordion interativo
- ✅ Efeitos hover e transições suaves

## 🎨 Personalização

### Cores

As cores podem ser facilmente alteradas no arquivo `styles.css`, na seção de variáveis CSS:

```css
:root {
    --color-dark: #1E1E1E;
    --color-primary: #5CD6E0;
    --color-primary-dark: #4AB8C2;
    /* ... outras cores */
}
```

### Webhook

Os formulários estão configurados para enviar dados para o webhook:
```
https://webhook.fiqon.app/webhook/a018d905-b76f-460e-bb85-c0ed3ad375eb/dbef3e88-594b-45e9-9de7-cf5bc122914c
```

Para alterar o webhook, edite o arquivo `script.js` nas funções de envio dos formulários.

### Informações de Contato

Para atualizar as informações de contato, edite o arquivo `index.html` na seção de rodapé:

- WhatsApp: `(16) 99240-2471`
- E-mail: `contatodbarbaro@gmail.com`
- Instagram: `@acheimeupet`

### Informações do Pix

Para atualizar os dados do Pix, edite o arquivo `index.html` no modal de compra:

- Chave: `contatodbarbaro@gmail.com`
- Banco: `Infinity Pay`
- Valor: `R$ 29,90`

## 📱 Responsividade

O site foi desenvolvido com abordagem **mobile-first** e é totalmente responsivo em:

- 📱 Smartphones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Telas grandes (1440px+)

## 🌐 Navegadores Suportados

- ✅ Chrome/Edge (últimas 2 versões)
- ✅ Firefox (últimas 2 versões)
- ✅ Safari (últimas 2 versões)
- ✅ Opera (últimas 2 versões)

## 📦 Dependências Externas

O site utiliza apenas CDNs públicos, sem necessidade de instalação:

- **Google Fonts** - Tipografia Poppins
- **Remix Icons** - Ícones modernos

## 🐛 Solução de Problemas

### Formulários não enviam

Verifique se o webhook está ativo e acessível. Teste a URL diretamente no navegador.

### Imagens não aparecem

Certifique-se de que os arquivos `logo-acheimeupet.png` e `picole.jpg` estão na mesma pasta do `index.html`.

### Menu mobile não funciona

Verifique se o arquivo `script.js` está sendo carregado corretamente. Abra o console do navegador (F12) para verificar erros.

## 💙 Créditos

Site desenvolvido em memória do **Picolé** (2015-2025).

**AcheiMeuPet** - Protegendo e reconectando animais a seus tutores através da tecnologia e do amor.

---

© 2025 AcheiMeuPet — Todos os direitos reservados.

