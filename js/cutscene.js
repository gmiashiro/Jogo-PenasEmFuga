// cutscene.js
// Módulo para exibir cutscene ao final de uma quest

/**
 * Exibe a tela de cutscene com duas opções: "Ficar" e "Sair".
 * @param {Object} config - Configurações da cutscene
 * @param {string} config.background - URL da imagem de fundo
 * @param {string} config.imageFicar - URL da imagem que aparece ao clicar em "Ficar"
 * @param {string} config.imageSair - URL da imagem que aparece ao clicar em "Sair"
 */
export function showCutscene({ background, imageFicar, imageSair }) {
  // Cria container full-screen
  const container = document.createElement('div');
  container.id = 'cutscene-container';
  Object.assign(container.style, {
    position: 'fixed',
    top: '0', left: '0', right: '0', bottom: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage: `url('${background}')`,
    zIndex: '1000'
  });

  // Função para exibir nova imagem centralizada
  function showImage(src) {
    // Limpa possíveis imagens anteriores
    const old = container.querySelector('img.cutscene-result');
    if (old) container.removeChild(old);

    const img = document.createElement('img');
    img.className = 'cutscene-result';
    img.src = src;
    Object.assign(img.style, {
      maxWidth: '80%',
      maxHeight: '80%',
      marginTop: '20px'
    });
    container.appendChild(img);
  }

  // Cria botoes de ação
  ['Ficar', 'Sair'].forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    Object.assign(btn.style, {
      backgroundColor: '#8B4513', // marrom
      color: '#FFFFFF',
      fontSize: '1.2rem',
      padding: '12px 24px',
      margin: '10px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    });
    btn.onclick = () => {
      if (option === 'Ficar') showImage(imageFicar);
      else showImage(imageSair);
    };
    container.appendChild(btn);
  });

  // Adiciona ao body
  document.body.appendChild(container);
}
