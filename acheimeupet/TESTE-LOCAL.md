# 🧪 Como Testar o Site Localmente

## Método 1: Abrir diretamente no navegador

1. Abra o arquivo `index.html` diretamente no seu navegador
2. Arraste o arquivo para a janela do navegador ou clique duas vezes nele

**Nota:** Alguns recursos podem não funcionar completamente ao abrir diretamente (como envio de formulários), mas você poderá visualizar todo o design e navegação.

## Método 2: Servidor HTTP Local (Recomendado)

### Usando Python (se tiver instalado)

```bash
# Python 3
cd acheimeupet
python3 -m http.server 8080

# Python 2
cd acheimeupet
python -m SimpleHTTPServer 8080
```

Depois acesse: `http://localhost:8080`

### Usando Node.js

```bash
# Instalar http-server globalmente
npm install -g http-server

# Executar
cd acheimeupet
http-server -p 8080
```

Depois acesse: `http://localhost:8080`

### Usando PHP

```bash
cd acheimeupet
php -S localhost:8080
```

Depois acesse: `http://localhost:8080`

## Método 3: Extensão do VS Code

Se você usa Visual Studio Code:

1. Instale a extensão **Live Server**
2. Clique com o botão direito no arquivo `index.html`
3. Selecione "Open with Live Server"

## ✅ Checklist de Testes

Ao testar o site, verifique:

- [ ] Header fixo funciona ao rolar a página
- [ ] Menu mobile abre e fecha corretamente
- [ ] Links do menu navegam para as seções corretas
- [ ] Modal de compra abre e fecha
- [ ] Botões "Comprar Tag" e "Ativar Tag" funcionam
- [ ] Formulário de ativação valida campos obrigatórios
- [ ] Formulário "Achei um Pet" valida campos obrigatórios
- [ ] Máscara de telefone funciona corretamente
- [ ] FAQ abre e fecha ao clicar
- [ ] Animações aparecem ao rolar a página
- [ ] Site é responsivo em diferentes tamanhos de tela
- [ ] Todas as imagens carregam corretamente
- [ ] Links de contato (WhatsApp, email) funcionam

## 📱 Testar Responsividade

### No Chrome/Edge/Firefox

1. Pressione `F12` para abrir DevTools
2. Clique no ícone de dispositivo móvel (ou pressione `Ctrl+Shift+M`)
3. Teste diferentes tamanhos:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

### Dispositivos Reais

Para testar em dispositivos móveis reais na mesma rede:

1. Inicie o servidor local
2. Descubra seu IP local:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` ou `ip addr`
3. Acesse no dispositivo móvel: `http://SEU-IP:8080`

## 🐛 Problemas Comuns

### CORS Error

Se aparecer erro de CORS ao testar localmente, use um dos métodos de servidor HTTP acima em vez de abrir o arquivo diretamente.

### Formulários não enviam

Isso é normal ao testar localmente. Os formulários só funcionarão completamente quando o site estiver publicado online.

### Imagens não aparecem

Certifique-se de que os arquivos `logo-acheimeupet.png` e `picole.jpg` estão na mesma pasta do `index.html`.

## 🚀 Próximos Passos

Após testar localmente e confirmar que tudo está funcionando:

1. Substitua as imagens placeholder pelas versões reais
2. Faça o deploy em um serviço de hospedagem
3. Teste novamente online para garantir que os formulários funcionam

---

Boa sorte com o projeto AcheiMeuPet! 🐾💙

