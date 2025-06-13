/**
 * ===== SISTEMA DE HUD (Heads-Up Display) =====
 * Gerencia a interface do usuário, incluindo:
 * - Inventário de sementes
 * - Contagem de itens coletados
 * - Sistema de níveis
 * - Sistema de moedas
 * - Lista de tarefas
 */
class Hud {
  constructor() {
    this.hotbarContainerElement = [];
    this.taskListIconElement = null;
    this.taskListPanelElement = null;
    this.coinContainerElement = null;
    this.coinTextElement = null;
    this.levelContainerElement = null;
    this.levelTextElement = null;
    this.seeds = {
      trigo: 5,
      milho: 5
    };
    this.items = {
      trigo: 0,
      milho: 0
    };
  }

  update() {

  }

  createElement() {
    this.hotbarElement = document.createElement("div");
    this.hotbarElement.classList.add("hotbar");
  }

  init(gameContainerElement) {
    // Cria o contêiner principal que vai segurar todas as hotbars
    this.hotbarContainerElement = document.createElement("div");
    this.hotbarContainerElement.classList.add("hotbar-container");

    // Cria 6 hotbars individuais
    for (let i = 0; i < 6; i++) {
      const singleHotbar = document.createElement("div");
      singleHotbar.classList.add("hotbar");
      
      // Duas primeiras slots são para sementes
      if (i === 0) {
        singleHotbar.innerHTML = `
          <div class="seed-info">
            <span>🌾</span>
            <span class="seed-count">${this.seeds.trigo}</span>
          </div>
        `;
      } else if (i === 1) {
        singleHotbar.innerHTML = `
          <div class="seed-info">
            <span>🌽</span>
            <span class="seed-count">${this.seeds.milho}</span>
          </div>
        `;
      } 
      // Slots para itens colhidos
      else if (i === 2) {
        singleHotbar.innerHTML = `
          <div class="item-info">
            <span>🌾</span>
            <span class="item-count">${this.items.trigo}</span>
          </div>
        `;
      } else if (i === 3) {
        singleHotbar.innerHTML = `
          <div class="item-info">
            <span>🌽</span>
            <span class="item-count">${this.items.milho}</span>
          </div>
        `;
      }
      
      this.hotbarContainerElement.appendChild(singleHotbar); // Adiciona a hotbar ao contêiner
    }

    // Adiciona o contêiner principal (com todas as hotbars dentro) ao contêiner do jogo
    if (gameContainerElement) {
      gameContainerElement.appendChild(this.hotbarContainerElement);
    } else {
      // Fallback se o gameContainerElement não for passado corretamente
      document.body.appendChild(this.hotbarContainerElement);
      console.warn("HUD container foi adicionado ao body.");
    }

    this.taskListIconElement = document.createElement("div");
    this.taskListIconElement.classList.add("task-list-icon");
    if (gameContainerElement) {
      gameContainerElement.appendChild(this.taskListIconElement);
    } else {
      document.body.appendChild(this.taskListIconElement);
      console.warn("Ícone da lista de tarefas foi adicionado ao body.");
    }

    this.taskListPanelElement = document.createElement("div");
    this.taskListPanelElement.classList.add("task-list-panel");

    this.taskListPanelElement.innerHTML = `
            <h3>Minhas tarefas</h3>
            <ul>
              <li>Encontrar item X</li>
              <li>Falar com galinha Y</li>
              <li>Plantar trigo</li>
              <li>Colher milho</li>
            </ul>
            <button class="task-list-close-button">Fechar</button>
    `;
    
    if(gameContainerElement){
      gameContainerElement.appendChild(this.taskListPanelElement);
    } else {
      document.body.appendChild(this.taskListPanelElement);
      console.warn("Painel da lista de tarefa foi adicionado ao body.");
    }

    this.taskListIconElement.addEventListener('click', () => {
      this.taskListPanelElement.classList.toggle('visible');
    });

    const closeButton = this.taskListPanelElement.querySelector('.task-list-close-button');
      if(closeButton){
        closeButton.addEventListener('click', () => {
        this.taskListPanelElement.classList.remove('visible');
      })
    }

    // Medidor de moedas
    this.coinContainerElement = document.createElement("div");
    this.coinContainerElement.classList.add("coin-container");

    //cria o ícone da moeda
    const coinIcon = document.createElement("div");
    coinIcon.classList.add("coin-icon");

    // Cria o texto para contagem das moedas
    this.coinTextElement = document.createElement("div");
    this.coinTextElement.classList.add("coin-text");
    this.coinTextElement.innerText = "0"; // Valor inicial

    // Adiciona o ícone e o texto ao contêiner de moedas
    this.coinContainerElement.appendChild(coinIcon);
    this.coinContainerElement.appendChild(this.coinTextElement);
    
    // Adiciona o contêiner de moedas ao contêiner principal do jogo
    gameContainerElement.appendChild(this.coinContainerElement);

    // --- CRIAÇÃO DO MEDIDOR DE NÍVEL ---
    this.levelContainerElement = document.createElement("div");
    this.levelContainerElement.classList.add("level-container");
    
    // Cria o ícone do nível (reutilizando a classe do ícone de moeda para estilo)
    const levelIcon = document.createElement("div");
    levelIcon.classList.add("level-icon");

    // Cria o texto para a contagem de nível
    this.levelTextElement = document.createElement("div");
    this.levelTextElement.classList.add("level-text");
    this.levelTextElement.innerText = "1"; // Nível inicial

    // Adiciona o ícone e o texto ao contêiner de nível
    this.levelContainerElement.appendChild(levelIcon);
    this.levelContainerElement.appendChild(this.levelTextElement);
    
    // Adiciona o contêiner de nível ao contêiner principal do jogo
    gameContainerElement.appendChild(this.levelContainerElement);

  }

  updateCoins(count){
    this.coinTextElement.innerHTML = count;
  }

  updateLevel(count) {
    this.levelTextElement.innerText = count;
  }

  updateSeeds(type, count) {
    this.seeds[type] = count;
    const index = type === 'trigo' ? 0 : 1;
    const seedCount = this.hotbarContainerElement.children[index].querySelector('.seed-count');
    if (seedCount) {
      seedCount.textContent = count;
    }
  }

  getSeeds(type) {
    return this.seeds[type];
  }

  useSeed(type) {
    if (this.seeds[type] > 0) {
      this.seeds[type]--;
      this.updateSeeds(type, this.seeds[type]);
      return true;
    }
    return false;
  }

  updateItems(type, count) {
    this.items[type] = count;
    const index = type === 'trigo' ? 2 : 3;
    const itemCount = this.hotbarContainerElement.children[index].querySelector('.item-count');
    if (itemCount) {
      itemCount.textContent = count;
    }
  }

  getItems(type) {
    return this.items[type];
  }

  addItem(type) {
    this.items[type]++;
    this.updateItems(type, this.items[type]);
  }
}
