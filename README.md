<p align="center">
  <img src="https://media.giphy.com/media/l41m3pCCdMLTNky4M/giphy.gif" width="200" alt="Casino Gif">
</p>

# ♠️ Casino Premium Fullstack ♠️

Bem-vindo ao **Casino Premium Fullstack**, uma plataforma de entretenimento de cartas modernizada e desenvolvida originalmente em Javascript puro, posteriormente migrada para a arquitetura Fullstack robusta do **Laravel 7.0**.

Este projeto simula um ambiente real de Cassino com armazenamento fixo de fichas por perfil de usuário, criptografia de senhas, e design avançado (Glassmorphism + UI Premium Mobile Responsive).

## ✨ Modos de Jogo Inclusos

1. **BlackJack Clássico**: A autêntica experiência de tentar bater 21 pontos com regras vitais inclusas: Draw, Stand, Double Down e Split.
2. **Speed Jack**: Modo de jogo com interface frenética e velocidade de animações aceleradas, focado em jogadores experientes.
3. **High Roller (Mesa VIP)**: Para quem ama o risco. Aposta mínima de $500 Fichas. Visual e cores diferenciadas.
4. **🃏 Joker's Poker (Balatro Mode)**: Um Minigame Rogue-like. Forme mãos e combos clássicos do Pôquer em número limitado de mãos e descartes para atingir o multiplicador exigido e ganhar altas recompensas! Apresenta o mecânismo de Coringas Dinâmicos (+Mult, +Chips).

## 🛠 Arquitetura & Tecnologias

- **Backend**: PHP Laravel (Versão 7.x).
- **Banco de Dados**: SQLite Integrado (Perfeito para desenvolvimento e testes leves sem containers).
- **Segurança**: Algoritmo `Bcrypt` nativo implementado para blindar os dados de usuários e controle de roteamento por Sessão API.
- **Frontend**: Vanilla HTML5, JS Orientado à Eventos, e CSS Puro processado via compilador **Laravel Mix / Webpack**, fornecendo compatibilidade e alta performance nas animações CSS Keyframes.
- **Responsividade**: Mobile-First UX para encaixar Layouts complexos (como as 8 Cartas do Balatro) perfeitamente nas mãos do jogador.

## 🚀 Como Executar Localmente

### Pré-requisitos
- **PHP** ^7.2.5
- **Composer** (v2.x)
- **Node.js** e **NPM**

### Instalação

**1.** Certifique-se que você tenha gerado o Autoloader do PHP:
```bash
composer install
```

**2.** Inicialize as chaves e configure seu banco sqlite (se ainda não existir):
```bash
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
```

**3.** Compile o JavaScript e CSS do servidor de apostas:
```bash
npm install
npm run dev
```

**4.** Inicialize o servidor e faça suas apostas:
```bash
php artisan serve
# ou php artisan serve --port=8080 caso prefira outra porta
```

> Visite **http://localhost:8000** em seu navegador, crie uma conta fictícia na UI principal instantaneamente e divirta-se!

## 📝 Licença

Desenvolvido para propósitos de portfólio e prova de conceito arquitetural. Fique à vontade para aprimorar, adicionar novos Coringas e subir suas próprias variações!
