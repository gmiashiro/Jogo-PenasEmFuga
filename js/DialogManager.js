/* 
 * Classe responsável por gerenciar os diálogos do jogo
 * Controla a exibição, animação e navegação entre diálogos
 */
class DialogManager {
  constructor() {
    this.npcDialogs = {
      // Diálogos para cada NPC do jogo
      "galinhaBranca": [
        "Olá! Bem-vindo ao galinheiro.",
        "Estamos planejando uma fuga em breve.",
        "Você vai nos ajudar?"
      ],
      "galinhaMarrom": [
        "Psiu! Não deixe os guardas te verem.",
        "Eles estão de olho em todos nós."
      ],
      "Paova": [ // Personalidade parecida com a do Érick jacquin
        "(Essa galinha não parece ter tempo para conversar)",
        "Tá achando que tô brincando!?",
        "Isso aqui é uma cozinha, não um galinheiro!",
        "... ah, espera..."
      ],
      "Clotilde": [ // Galinha costureira, personalidade materna, meio doce mas não passa a mão
        "Eu sei que você deve estar bem confuso",
        "Mas essas galinhas não bicam não hahahaha",
        "Qualquer coisa, basta conversar comigo!"
      ],
      "Bernadette": [ // Galinha velha, personalidade velha, meio velha, usa girias velhas
        "Oi meu filho, você é novo por aqui?",
        "Estou de olho nos meus novos netinhos, eles são f-OVO-finhos haha COF COF haha!",
        "Você parece tão magrinho, estou fazendo uma pamonha quentinha!"
      ],
      "galinhaSegurancaMarrom": [
        "Ei você! O que está fazendo aqui?",
        "Estou de olho em você...",
        "Não tente nada suspeito!"
      ],
      "frog1": [
        "Programar é... ok... (-)-_-(-)"
      ],
      "frog2": [
        "Eu amo programar hahaha HAHAHAHAHAHA"
      ],
      "frog3": [
        "Eu odeio programar :("
      ],
      "cavalo": [
        "C A V A L O"
      ],
      "galinhaPenosa": [
        "Oi, eu sou a Penosa!",
        "Você veio conhecer minha vendinha né??",
        "Tenho os melhores produtos do galinheiro!",
        "Dá uma olhada!",
      ],
      "galinhaCaipira": [
        "...Toda vez que eu viajava",
        "pela estrada de ouro fino...",
      ],
      "galinhaBrancaQuestIcon": [
        "Hmmmm",
        "Não era para isso ter acontecido...",
        "Isso não aconteceu, ok?",
      ],
      "galinhaGalinacia": [
        "Ue cachoeira!?",
      ],
      "JuninhoJunior": [
        "Oi tio!",
      ],
      
    };
    
    // Referência para a mensagem de texto atual
    this.textMessage = null;
    
    // Armazena o estado de todos os NPCs antes do diálogo
    this.npcStates = {};
  }

  // Método para obter os diálogos de um NPC específico
  getDialogsForNpc(npcId) {
    return this.npcDialogs[npcId] || ["..."];
  }

  // Método para iniciar um diálogo com um NPC
  async startDialog(npcId, map, onDialogEnd) {
    const dialogs = this.getDialogsForNpc(npcId);
    
    // Salva o estado de todos os NPCs antes de iniciar o diálogo
    //this.saveAllNpcStates(map);
    
    // Marca o mapa como em cutscene para evitar movimentação durante o diálogo
    map.isCutscenePlaying = true;
    
    // Percorre cada mensagem do diálogo
    for (let i = 0; i < dialogs.length; i++) {
      // Cria uma nova instância de TextMessage para cada mensagem
      const message = new TextMessage({
        text: dialogs[i],
        npc: map.gameObjects[npcId],
        map: map,
        onComplete: () => {
          // Callback executado quando a mensagem é concluída
        }
      });
      
      this.textMessage = message;
      
      // Aguarda a conclusão da exibição da mensagem atual
      await message.init();
    }
    
    // Quando todas as mensagens forem exibidas, marca o mapa como não mais em cutscene
    map.isCutscenePlaying = false;
    this.textMessage = null;
    
    // Reinicia os behaviorLoops de TODOS os NPCs após o diálogo
    //this.forceResumeAllNpcBehaviors(map);

    if(typeof onDialogEnd === "function"){
      // Chama a função onDialogEnd se estiver definida
      onDialogEnd();
    }
  }
  
}
