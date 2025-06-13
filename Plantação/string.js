/**
 * ===== SISTEMA DE JOGO DE PLANTAÇÃO =====
 * Este jogo permite ao jogador controlar um personagem que pode:
 * - Movimentar-se pelo mapa usando WASD ou setas
 * - Interagir com uma área de plantação pressionando E
 * - Plantar e colher dois tipos de culturas: trigo e milho
 */

// --- Variáveis Globais ---
let canvas, ctx, hud; // Canvas para renderização, contexto 2D e sistema de interface

let jogoInicializado = false;

window.addEventListener('DOMContentLoaded', () => {
    if (jogoInicializado) return;
    
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas não encontrado!');
        return;
    }
    ctx = canvas.getContext('2d');
    hud = new Hud(); // Instância do HUD
    
    // Inicia o jogo
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        hud.init(gameContainer);
        resizeCanvas();
        atualizarDimensoes();
        atualizar();
        console.log('Jogo inicializado com sucesso!');
        jogoInicializado = true;
    } else {
        console.error('Container do jogo não encontrado!');
    }
});

// Função para ajustar o tamanho do canvas
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Ajusta o canvas e elementos quando a janela é redimensionada
window.addEventListener('resize', function() {
    if (canvas) {
        resizeCanvas();
        atualizarDimensoes();
    }
});

// Personagem
const player = {
  x: 0,
  y: 0,
  size: 0,
  speed: 0
};

// Plantação
const plantacao = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  margem: 0
};

// Caminho da imagem de fundo
const bgImage = new Image();
bgImage.src = 'img/mapaPlantação.png';

// Parâmetros da área de plantação na imagem
const PLANTACAO_BG_OFFSET_X = 88; // px a partir da esquerda da imagem
const PLANTACAO_BG_OFFSET_Y = 48; // px a partir do topo da imagem
const PLANTACAO_BG_SIZE = 160;    // tamanho do quadrado de terra na imagem (em px)

// Dimensões reais do quadrado de terra
const QUADRO_TERRA_WIDTH = 106;
const QUADRO_TERRA_HEIGHT = 102;

// Função para atualizar dimensões dos elementos
function atualizarDimensoes() {
    // Atualiza o personagem
    if (player.x === 0 && player.y === 0) {
        // Só define a posição inicial se ainda não foi definida
        player.size = Math.min(canvas.width, canvas.height) * 0.08;
        player.speed = (player.size * 0.125) * (canvas.width / 1000);
        player.x = canvas.width * 0.1;
        player.y = canvas.height * 0.45;
    } else {
        // Mantém a posição do personagem ao redimensionar
        const oldW = player._lastW || canvas.width;
        const oldH = player._lastH || canvas.height;
        player.x = player.x / oldW * canvas.width;
        player.y = player.y / oldH * canvas.height;
        player.size = Math.min(canvas.width, canvas.height) * 0.08;
        player.speed = (player.size * 0.125) * (canvas.width / 1000);
    }
    player._lastW = canvas.width;
    player._lastH = canvas.height;

    // Atualiza a plantação
    plantacao.width = canvas.width * 0.4;
    plantacao.height = canvas.width * 0.4;
    plantacao.x = canvas.width * 0.5;
    plantacao.y = canvas.height * 0.25;
    plantacao.margem = player.size * 0.375;
}

let podeInteragir = false;
let tipoPlantaSelecionado = 'trigo';

/**
 * Função para desenhar todos os elementos do jogo
 * - Limpa o canvas
 * - Desenha a área de plantação com grade 3x3
 * - Desenha o personagem
 */
function desenhar() {
  // Limpa o canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha o fundo do mapa
  if (bgImage.complete && bgImage.naturalWidth > 0) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#78b159';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Centraliza a plantação no canvas usando as dimensões do quadrado de terra
  const escalaX = canvas.width / bgImage.width;
  const escalaY = canvas.height / bgImage.height;
  const escala = Math.min(escalaX, escalaY);

  // Calcula o tamanho da plantação baseado no quadrado de terra
  plantacao.width = QUADRO_TERRA_WIDTH * escala;
  plantacao.height = QUADRO_TERRA_HEIGHT * escala;
  plantacao.x = (canvas.width - plantacao.width) / 2;
  // Joga a plantação 10% mais para cima
  plantacao.y = (canvas.height - plantacao.height) / 2 - canvas.height * 0.06;
  plantacao.margem = player.size * 0.375;

  // Personagem
  ctx.save();
  ctx.fillStyle = '#2196f3';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.strokeRect(player.x, player.y, player.size, player.size);
  ctx.restore();
}

function colisao(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.size > b.x &&
    a.y < b.y + b.height &&
    a.y + a.size > b.y
  );
}

/**
 * Sistema de Interação
 * Verifica se o jogador está próximo o suficiente para interagir
 * com a área de plantação. Usa uma margem ajustável baseada no
 * tamanho da tela para melhor responsividade.
 */
function colisaoInteracao(a, b) {
  // Área de interação é um pouco maior que a plantação e leva em conta o tamanho relativo
  const margemRelativa = b.margem * (canvas.width / 1000); // Ajusta margem baseado no tamanho da tela
  return (
    a.x + a.size > b.x - margemRelativa &&
    a.x < b.x + b.width + margemRelativa &&
    a.y + a.size > b.y - margemRelativa &&
    a.y < b.y + b.height + margemRelativa
  );
}

/**
 * Loop Principal do Jogo
 * - Atualiza a posição do jogador
 * - Verifica colisões
 * - Atualiza o estado de interação
 * - Redesenha a tela
 */
function atualizar() {
  // Impede o personagem de entrar na plantação como se fosse uma parede invisível
  let nextX = player.x;
  let nextY = player.y;

  // Checa se o personagem está tentando atravessar a plantação
  if (player.x + player.size > plantacao.x && player.x < plantacao.x + plantacao.width &&
      player.y + player.size > plantacao.y && player.y < plantacao.y + plantacao.height) {
    // Colisão pela esquerda
    if (player.x + player.size - player.speed <= plantacao.x) {
      player.x = plantacao.x - player.size;
    }
    // Colisão pela direita
    else if (player.x - player.speed >= plantacao.x + plantacao.width - player.size) {
      player.x = plantacao.x + plantacao.width;
    }
    // Colisão por cima
    if (player.y + player.size - player.speed <= plantacao.y) {
      player.y = plantacao.y - player.size;
    }
    // Colisão por baixo
    else if (player.y - player.speed >= plantacao.y + plantacao.height - player.size) {
      player.y = plantacao.y + plantacao.height;
    }
  }
  podeInteragir = colisaoInteracao(player, plantacao);
  desenhar();
  requestAnimationFrame(atualizar);
}

// Movimento do personagem
window.addEventListener('keydown', function(e) {
  if (document.getElementById('plantacao-popup').style.display === 'flex') return;
  
  let newX = player.x;
  let newY = player.y;
  
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') newY -= player.speed;
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') newY += player.speed;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') newX -= player.speed;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') newX += player.speed;
  
  // Verifica limites do canvas
  if (newX >= 0 && newX + player.size <= canvas.width) {
    player.x = newX;
  }
  if (newY >= 0 && newY + player.size <= canvas.height) {
    player.y = newY;
  }
});

// Interação com a plantação
window.addEventListener('keydown', function(e) {
  if ((e.key === 'e' || e.key === 'E') && podeInteragir) {
    mostrarPopupPlantacao();
  }
});

// Função para mostrar e esconder o pop-up de plantação
function mostrarPopupPlantacao() {
  document.getElementById('plantacao-popup').style.display = 'flex';
  moverHudParaPopup(true);
}
function esconderPopupPlantacao() {
  document.getElementById('plantacao-popup').style.display = 'none';
  moverHudParaPopup(false);
}

let hudOriginalContainer = null; // Guarda a referência do container original do HUD

// Flag para garantir que só move uma vez para o popup
let hudNoPopup = false;

function moverHudParaPopup(mostrar) {
  const hotbarContainer = document.querySelector('.hotbar-container');
  const popupInventario = document.querySelector('.popup-inventario');
  if (!hotbarContainer) return;
  if (mostrar) {
    if (popupInventario && hotbarContainer.parentElement !== popupInventario) {
      popupInventario.appendChild(hotbarContainer);
      hudNoPopup = true;
    }
  } else {
    if (hudNoPopup) {
      const gameContainer = document.querySelector('.game-container');
      if (gameContainer && hotbarContainer.parentElement !== gameContainer) {
        gameContainer.appendChild(hotbarContainer);
        hudNoPopup = false;
      }
    }
  }
}

function atualizarBotoesTipoPlanta() {
  document.getElementById('btn-trigo').classList.toggle('selected', tipoPlantaSelecionado === 'trigo');
  document.getElementById('btn-milho').classList.toggle('selected', tipoPlantaSelecionado === 'milho');
}

// Evento para fechar o pop-up ao clicar no botão
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('fechar-popup').addEventListener('click', esconderPopupPlantacao);
  criarGridPlantacaoPopup();
  atualizar();
  // Evento do botão colher tudo
  document.getElementById('colher-tudo').addEventListener('click', function() {
    const blocos = document.querySelectorAll('.bloco-plantacao');
    let colheuAlgum = false;
    blocos.forEach(bloco => {
      if (bloco.getAttribute('data-etapa') === 'crescido') {
        const tipoColhido = bloco.getAttribute('data-tipo');
        mostrarSpanColheitaTipo(tipoColhido, bloco);
        hud.addItem(tipoColhido); // Adiciona o item colhido ao inventário
        bloco.setAttribute('data-tipo', '');
        bloco.setAttribute('data-etapa', '');
        // Esconde a imagem do estágio
        const imgEstagio = bloco.querySelector('.img-estagio-plantacao');
        if (imgEstagio) {
          imgEstagio.style.display = 'none';
          imgEstagio.src = '';
        }
        colheuAlgum = true;
      }
    });
    if (colheuAlgum) {
      alert('Colheita realizada com sucesso!');
    } else {
      alert('Não há nada para colher!');
    }
  });
  // Eventos dos botões de tipo de planta
  document.getElementById('btn-trigo').addEventListener('click', function() {
    tipoPlantaSelecionado = 'trigo';
    atualizarBotoesTipoPlanta();
  });
  document.getElementById('btn-milho').addEventListener('click', function() {
    tipoPlantaSelecionado = 'milho';
    atualizarBotoesTipoPlanta();
  });
  atualizarBotoesTipoPlanta();
});

/**
 * Sistema de Plantação
 * Cria a grid 3x3 de blocos plantáveis
 * Cada bloco pode:
 * - Ser plantado se houver sementes disponíveis
 * - Mostrar o progresso do crescimento
 * - Ser colhido quando maduro
 */
function criarGridPlantacaoPopup() {
  const grid = document.querySelector('.grid-plantacao');
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const bloco = document.createElement('div');
    bloco.className = 'bloco-plantacao';
    bloco.dataset.index = i;
    bloco.setAttribute('data-tipo', '');
    bloco.setAttribute('data-etapa', '');
    bloco.style.backgroundImage = "url('img/terreno.png')";
    bloco.style.backgroundSize = 'cover';
    bloco.style.backgroundPosition = 'center';
    // Cria o elemento de imagem do estágio
    const imgEstagio = document.createElement('img');
    imgEstagio.className = 'img-estagio-plantacao';
    imgEstagio.style.display = 'none';
    bloco.appendChild(imgEstagio);
    bloco.addEventListener('click', function() {
      // Se está pronto para colher
      if (bloco.getAttribute('data-etapa') === 'crescido') {
        const tipoColhido = bloco.getAttribute('data-tipo');
        mostrarSpanColheitaTipo(tipoColhido, bloco);
        hud.addItem(tipoColhido);
        bloco.setAttribute('data-tipo', '');
        bloco.setAttribute('data-etapa', '');
        imgEstagio.style.display = 'none';
        imgEstagio.src = '';
        return;
      }
      // Se já está plantando ou crescendo, não faz nada
      if (bloco.getAttribute('data-etapa') && bloco.getAttribute('data-etapa') !== '') return;
      if (!hud.useSeed(tipoPlantaSelecionado)) {
        alert(`Você não tem sementes de ${tipoPlantaSelecionado} suficientes!`);
        return;
      }
      const tipoPlanta = tipoPlantaSelecionado;
      bloco.setAttribute('data-tipo', tipoPlanta);
      bloco.setAttribute('data-etapa', 'terra');
      imgEstagio.src = 'img/terra.png';
      imgEstagio.style.display = 'block';
      setTimeout(() => {
        bloco.setAttribute('data-etapa', 'pequeno');
        imgEstagio.src = `img/${tipoPlanta}-pequeno.png`;
        setTimeout(() => {
          bloco.setAttribute('data-etapa', 'medio');
          imgEstagio.src = `img/${tipoPlanta}-medio.png`;
          setTimeout(() => {
            bloco.setAttribute('data-etapa', 'crescido');
            imgEstagio.src = `img/${tipoPlanta}-crescido.png`;
          }, 2000);
        }, 2000);
      }, 2000);
    });
    grid.appendChild(bloco);
  }
}

/**
 * Efeitos Visuais
 * Mostra uma mensagem flutuante quando um item é colhido
 * com animação e estilo apropriado
 */
function mostrarSpanColheitaTipo(tipo, bloco) {
  const span = document.createElement('span');
  span.textContent = tipo === 'milho' ? 'Colheu Milho!' : 'Colheu Trigo!';
  span.style.position = 'fixed';
  span.style.color = '#fff'; // cor branca
  span.style.fontWeight = 'bold';
  span.style.fontSize = '1.1rem';
  span.style.pointerEvents = 'none';
  span.style.textShadow = '-1px -1px 0 #222, 1px -1px 0 #222, -1px 1px 0 #222, 1px 1px 0 #222';
  const rect = bloco.getBoundingClientRect();
  span.style.left = (rect.left + rect.width / 2) + 'px';
  span.style.top = (rect.top - 24) + 'px';
  span.style.transform = 'translate(-50%, 0)';
  span.style.zIndex = 2000;
  span.className = 'span-colheita';
  document.body.appendChild(span);
  setTimeout(() => {
    span.remove();
  }, 1200);

  // SORTEIO DE SEMENTES AO COLHER
  const sorteio = Math.random();
  let sementes = 0;
  if (sorteio < 0.15) {
    sementes = 2;
  } else if (sorteio < 0.5) {
    sementes = 1;
  } // 0.5 ou mais = 0 sementes
  if (sementes > 0) {
    hud.updateSeeds(tipo, hud.getSeeds(tipo) + sementes);
    // Mensagem visual opcional
    const spanSemente = document.createElement('span');
    spanSemente.textContent = sementes === 1 ? '+1 semente!' : '+2 sementes!';
    spanSemente.style.position = 'fixed';
    spanSemente.style.color = '#ffe066';
    spanSemente.style.fontWeight = 'bold';
    spanSemente.style.fontSize = '1.1rem';
    spanSemente.style.pointerEvents = 'none';
    spanSemente.style.textShadow = '-1px -1px 0 #222, 1px -1px 0 #222, -1px 1px 0 #222, 1px 1px 0 #222';
    spanSemente.style.left = (rect.left + rect.width / 2) + 'px';
    spanSemente.style.top = (rect.top - 48) + 'px';
    spanSemente.style.transform = 'translate(-50%, 0)';
    spanSemente.style.zIndex = 2000;
    document.body.appendChild(spanSemente);
    setTimeout(() => {
      spanSemente.remove();
    }, 1200);
  }
}
