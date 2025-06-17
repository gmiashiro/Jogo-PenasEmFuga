// Objeto que contém a lógica para verificar a conclusão de cada quest
const QuestChecks = {
    FALAR_COM_GALINHAS(playerState) {
        // O objetivo é ter falado com 3 galinhas ou mais
        return playerState.questFlags.CHICKENS_SPOKEN_TO >= 3;
    },
    COLETAR_TRIGO(playerState) {
        // O objetivo é ter 9 trigos ou mais no inventário
        const trigo = playerState.items.find(item => item && item.id === 1 );
        return trigo && trigo.quantity >= 9;
    },
    // --- LÓGICA PARA A QUEST 4 ---
    // Verifica se o jogador falou com a Bernadette para iniciar a quest.
    FALOU_COM_BERNADETTE_Q4(playerState) {
        return playerState.storyFlags.SPOKEN_TO_BERNADETTE_FOR_Q4;
    },
    // Verifica se o jogador pegou o mingau com a Paova.
    PEGOU_MINGAU_COM_PAOVA_Q4(playerState) {
        return playerState.storyFlags.GOT_PORRIDGE_FROM_PAOVA_Q4;
    },
    // Verifica se o mingau foi entregue com sucesso.
    ENTREGOU_MINGAU_Q4(playerState) {
        return playerState.storyFlags.DELIVERED_PORRIDGE_Q4;
    },
    ENTREGAR_MILHO_GALINACIA(playerState) {
        // A quest é completada quando a flag 'entregouMilho' for verdadeira
        return playerState.storyFlags.entregouMilho;
    },
    FALAR_COM_4_GALINHAS(playerState) {
        // O objetivo é ter falado com 4 galinhas ou mais para a quest do chef
        return playerState.questFlags.CHEF_INFO_GATHERED >= 4;
    },
    FALAR_COM_3_GALINHAS_SAPO(playerState) {
        return playerState.questFlags.CHICKENS_SPOKEN_TO_FROG >= 3;
    },
    FALAR_COM_CAIPIRA(playerState) {
        return playerState.questFlags.SPOKEN_TO_CAIPIRA >= 1;
    },
    FALAR_COM_CLOTILDE_0(playerState) {
        return playerState.questFlags.SPOKEN_TO_CLOTILDE_0 >= 1;
    },
    FALAR_COM_GALINACIA(playerState) {
        return playerState.questFlags.SPOKEN_TO_GALINACIA >= 1;
    },
    FALAR_COM_GALINACIA_CORN(playerState) {
        return playerState.questFlags.SPOKEN_TO_GALINACIA_CORN >= 1;
    },
    PEGAR_3_SAPOS(playerState) {
        return playerState.questFlags.FROGS_COLLECTED >= 3;
    },
    // --- ADIÇÕES PARA A QUEST 10 ---
    FALAR_COM_SEGURANCA_CHEFE(playerState) {
        // Verifica se o jogador já falou com o segurança sobre o chefe
        return playerState.questFlags.SPOKEN_TO_SECURITY_FOR_CHIEF >= 1;
    },
    JUNTAR_PISTAS_CHEFE(playerState) {
        // Verifica se o jogador já coletou 3 pistas
        return playerState.questFlags.CHIEF_CLUES_GATHERED >= 3;
    },
    ENCONTRAR_SALA_CHEFE(playerState) {
        // A quest é completada quando a flag 'FOUND_CHIEF_ROOM' for verdadeira
        return playerState.storyFlags.FOUND_CHIEF_ROOM;
    },
    FALAR_COM_JUNINHO(playerState) {
        return playerState.questFlags.SPOKEN_TO_JUNINHO >= 1;
    },
    SPOKE_TO_PENOSA_FOR_STOCK(playerState) {
        return playerState.storyFlags.SPOKE_TO_PENOSA_FOR_STOCK;
    },
    VENDER_TRIGO_PENOSA(playerState) {
        const trigoVendido = playerState.questFlags.WHEAT_SOLD || 0;
        return trigoVendido >= 15;
    },
    VENDER_MILHO_PENOSA(playerState) {
        const milhoVendido = playerState.questFlags.CORN_SOLD || 0;
        return milhoVendido >= 15;
    },
    LEVAR_LINHA(playerState) {
        return playerState.storyFlags.YARN_DELIVERED;
    }
    // Adicione as funções de verificação para as outras quests aqui...
}

// A lista principal e ordenada de todas as quests do jogo
window.QuestList = [
    {
        id: "Q0.1",
        name: "",
        description: "Fale com a Clotilde",
        checkCompletion: QuestChecks.FALAR_COM_CLOTILDE_0,
        progressKey: "SPOKEN_TO_CLOTILDE_0",
        progressTarget: 1,
        reward: {
            type: "coins",
            amount: 20
        }
    },
    {
        id: "Q1",
        name: "Primeiros Passos",
        description: "Explore o galinheiro e converse com pelo menos 3 galinhas.",
        checkCompletion: QuestChecks.FALAR_COM_GALINHAS,
        progressKey: "CHICKENS_SPOKEN_TO",
        progressTarget: 3,
        reward:{
            type: "coins",
            amount: 10
        }
    },
    {
        id: "Q1.1",
        name: "",
        description: "Fale com a Galinha Caipira na fazenda",
        checkCompletion: QuestChecks.FALAR_COM_CAIPIRA,
        progressKey: "SPOKEN_TO_CAIPIRA",
        progressTarget: 1,
        reward: {
            type: "item",
            item: { id: 2 , name: "Semente de Trigo", src: "./assets/img/trigoSemente.png", quantity: 5 }
        }
    },
    {
        id: "Q2",
        name: "Mãos à Obra",
        description: "Colete 9 trigos para a comunidade.",
        checkCompletion: QuestChecks.COLETAR_TRIGO,
        progressKey: "WHEAT_COLLECTED",
        progressTarget: 9,
        reward: {
            type: "coins",
            amount: 20
        }
    },
    // ... Suas quests Q3 aqui ...
    {
        id: "Q4.1",
        name: "", // Sub-quest para iniciar a conversa
        description: "Bernadette parece precisar de ajuda. Fale com ela.",
        checkCompletion: QuestChecks.FALOU_COM_BERNADETTE_Q4,
        progressKey: "SPOKEN_TO_BERNADETTE_FOR_Q4",
        progressTarget: 1,
    },
    {
        id: "Q4.2",
        name: "", // Sub-quest para pegar o mingau
        description: "Vá até a cozinha e pegue o mingau com a Paova.",
        checkCompletion: QuestChecks.PEGOU_MINGAU_COM_PAOVA_Q4,
        progressKey: "GOT_PORRIDGE_FROM_PAOVA_Q4",
        progressTarget: 1,
    },
    {
        id: "Q4",
        name: "Entrega Quente",
        description: "Leve o mingau para a Bernadette antes que esfrie!",
        checkCompletion: QuestChecks.ENTREGOU_MINGAU_Q4,
        progressKey: "DELIVERED_PORRIDGE_Q4",
        progressTarget: 1,
        reward: { type: "coins", amount: 35 }
    },
    {
        id: "Q4.5",
        name: "",
        description: "Fale com a Galinácia",
        checkCompletion: QuestChecks.FALAR_COM_GALINACIA_CORN,
        progressKey: "SPOKEN_TO_GALINACIA_CORN",
        progressTarget: 1,
        reward: { type: "coins", amount: 50 }
    },
    {
        id: "Q5",
        name: "Ajuda a Galinácia à alimentar suas galinhas!",
        description: "Entregue 20 milhos para a Galinha Galinacia.",
        checkCompletion: QuestChecks.ENTREGAR_MILHO_GALINACIA,
        progressKey: "CORN_DELIVERED",
        progressTarget: 1, // Apenas um evento de entrega
        reward: { type: "coins", amount: 50 }
    },
    {
        id: "Q5.1",
        name: "",
        description: "Fale com a Galinácia",
        checkCompletion: QuestChecks.FALAR_COM_GALINACIA,
        progressKey: "SPOKEN_TO_GALINACIA",
        progressTarget: 1,
        reward: { type: "coins", amount: 50 }
    },
    {
        id: "Q5.2",
        name: "",
        description: "Pergunte a 3 galinhas sobre as 'galinhas da montanha'",
        checkCompletion: QuestChecks.FALAR_COM_3_GALINHAS_SAPO,
        progressKey: "CHICKENS_SPOKEN_TO_FROG",
        progressTarget: 3,
        reward: { type: "coins", amount: 50 }
    },
    {
        id: "Q6",
        name: "Caça montanhosa!",
        description: "Colete as 3 galinhas da montanha para a Galinácia.",
        checkCompletion: QuestChecks.PEGAR_3_SAPOS,
        progressKey: "FROGS_COLLECTED",
        progressTarget: 3,
        reward: {
            type: "coins",
            amount: 20
        }
    },
    // ... Suas quests Q7, Q8 aqui ...
    {
        id: "Q8",
        name: "Abastecendo o Estoque",
        description: "Fale com a galinha Penosa para saber como ajudar a loja.",
        checkCompletion: QuestChecks.SPOKE_TO_PENOSA_FOR_STOCK,
        progressKey: "SPOKE_TO_PENOSA_FOR_STOCK",
        progressTarget: 1,
        reward: { type: "coins", amount: 20 } // Recompensa por iniciar a conversa
    },
    {
        id: "Q8.1",
        name: "", // Etapa interna
        description: "Venda 15 trigos para a Penosa.",
        checkCompletion: QuestChecks.VENDER_TRIGO_PENOSA,
        progressKey: "WHEAT_SOLD",
        progressTarget: 15,
        reward: { type: "coins", amount: 100 }
    },
    {
        id: "Q8.2",
        name: "", // Etapa interna
        description: "Agora, venda 15 milhos para a Penosa.",
        checkCompletion: QuestChecks.VENDER_MILHO_PENOSA,
        progressKey: "CORN_SOLD",
        progressTarget: 15,
        reward: { type: "coins", amount: 150 }
    },
    {
        id: "Q9",
        name: "Segredos do Chef",
        description: "Converse com 4 galinhas para obter informações sobre o chef.",
        checkCompletion: QuestChecks.FALAR_COM_4_GALINHAS,
        progressKey: "CHEF_INFO_GATHERED",
        progressTarget: 4,
        reward: { type: "coins", amount: 100 }
    },
    {
        id: "Q10.1",
        name: "O Grande Chefe",
        description: "Fale com a galinha segurança para saber como encontrar o 'chefe'.",
        checkCompletion: QuestChecks.FALAR_COM_SEGURANCA_CHEFE,
        progressKey: "SPOKEN_TO_SECURITY_FOR_CHIEF",
        progressTarget: 1,
        reward: { type: "coins", amount: 10 }
    },
    {
        id: "Q10.2",
        name: "", // Nome vazio para ser uma etapa interna
        description: "Procure por pistas. Converse com 3 galinhas para obter dicas sobre o enigma do chefe.",
        checkCompletion: QuestChecks.JUNTAR_PISTAS_CHEFE,
        progressKey: "CHIEF_CLUES_GATHERED",
        progressTarget: 3,
        reward: { type: "coins", amount: 40 }
    },
    {
        id: "Q10.3",
        name: "", // Nome vazio
        description: "Resolva o enigma e encontre a sala do chefe.",
        checkCompletion: QuestChecks.ENCONTRAR_SALA_CHEFE,
        progressKey: "FOUND_CHIEF_ROOM", // Usa uma flag, não um contador
        progressTarget: 1,
        reward: { type: "coins", amount: 150 }
    },
    {
        id: "Q10.4",
        name: "", // Nome vazio
        description: "Fale com o chefe.",
        checkCompletion: QuestChecks.FALAR_COM_JUNINHO,
        progressKey: "SPOKEN_TO_JUNINHO",
        progressTarget: 1,
        reward: { type: "coins", amount: 150 }
    },
    {
        id: "Q10.5",
        name: "", // Nome vazio
        description: "Leve 15 carretéis de linha para a Clotilde.",
        checkCompletion: QuestChecks.LEVAR_LINHA,
        progressKey: "YARN_DELIVERED_Q",
        progressTarget: 1,
        reward: { type: "coins", amount: 20 }
    },
    {
        id: "Q10.6",
        name: "", // Nome vazio
        description: "Coloque o cobertor nos ovinhos",
        checkCompletion: QuestChecks.LEVAR_LINHA,
        progressKey: "YARN_DELIVERED_Q",
        progressTarget: 1,
        reward: { type: "coins", amount: 20 }
    },
];