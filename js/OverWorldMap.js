class OverworldMap { // representa um mapa específico no jogo, incluindo seus objetos, colisões e camadas visuais
    constructor(config, state = {}){
        this.overworld = null;
        this.gameObjects = {}; // Armazena um objeto contendo todos os GameObjects que pertencem a este mapa
        this.cutsceneSpaces = config.cutsceneSpaces || {};
        this.walls = config.walls || {}; // Armazena um objeto que representa as áreas de colisão ("paredes") no mapa. As chaves são coordenadas no formato "x,y", e o valor true indica que há uma parede. O padrão é um objeto vazio
        this.configObjects = config.configObjects;

        this.groundDecals = {}; // Para armazenar as imagens de detalhe do chão
        
        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc; // cria a camada inferior do mapa

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc; // cria a camada superior do mapa
        this.isCutscenePlaying = false; // Para saber se está rodando alguma cutscene. 
        this.foundFrog1 = state.foundFrog1 || false; // Para saber se foi encontrado os sapos. Caso não tenha valor, é falso
        this.foundFrog2 = state.foundFrog2 || false;
        this.foundFrog3 = state.foundFrog3 || false;
        this.easterEggsFound = state.easterEggsFound || [];
        this.easterEggsFoundID = state.easterEggsFoundID || [];
        this.name = config.name; // Serve para saber em qual mapa se está
        this.playerState = state.playerState || {};

        const groundDecalsConfig = config.groundDecals || {};
        Object.keys(groundDecalsConfig).forEach(key => {
            const decalConfig = groundDecalsConfig[key];
            const image = new Image();
            image.src = decalConfig.src;
            image.onload = () => {
                this.groundDecals[key] = {
                    ...decalConfig,
                    image: image,
                    isLoaded: true,
                };
            };
        });
    }

    drawLowerImage(ctx, cameraPerson){
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(-20) - cameraPerson.x,
            utils.withGrid(3) - cameraPerson.y // são deslocamentos para centralizar a câmera
        );
        // Desenha os detalhes do chão (como a área de plantação)
        Object.values(this.groundDecals).forEach(decal => {
            if (decal.isLoaded) {
                ctx.drawImage(
                    decal.image,
                    decal.x + utils.withGrid(-20) - cameraPerson.x,
                    decal.y + utils.withGrid(3) - cameraPerson.y
                );
            }
        });
    }
    drawUpperImage(ctx, cameraPerson){
        ctx.drawImage(
            this.upperImage,
            utils.withGrid(-20) - cameraPerson.x,
            utils.withGrid(3) - cameraPerson.y // são deslocamentos para centralizar a câmera
        )
    }

    isSpaceTaken(currentX, currentY, direction){ // Verifica se uma determinada posição no mapa, após um movimento em uma certa direção, está ocupada por uma "parede"
        const {x,y} = utils.nextPosition(currentX, currentY, direction);

        if (this.walls[`${x},${y}`]) {
            return true;
        }

        // Ver se tem algum objeto do jogo, tipo uma galinha, nessa opção
        return Object.values(this.gameObjects).find(obj => {

            if (obj.isQuestIcon) {
                return false;
            }

            if (obj.x === x && obj.y === y) { // Se as coordenadas desse objeto forem as mesmas do pinguim
                return true; 
            } else {
                if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y) {
                    return true;
                }
            }
        })

        //return this.walls[`${x},${y}`] || false;
    }    
    
    mountObjects() { 
        Object.keys(this.configObjects).forEach(key => {
            let object = this.configObjects[key];  // essa key é o nome do objeto, tipo galinhaMarrom
            object.id = key;

            let instance; // Cria uma instância de acordo com o tipo de objeto
            if (object.type === "Person") {
                instance = new Person(object);
            } else if (object.type === "EasterEgg") {
                instance = new EasterEgg(object);
            } else if (object.type === "Gif") {
                instance = new Gif(object);
            } else if (object.type === "PlantableSpot") {
                instance = new PlantableSpot(object);
            }

            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;

            if (this.foundFrog1 && key === "frog1") { // Se o sapo 1 foi encontrado, e ele for o objeto da vez
                // Montar ele lá no pet-shop
                this.gameObjects[key].x = utils.withGrid(19);
                this.gameObjects[key].y = utils.withGrid(4);
            }
            if (this.foundFrog2 && key === "frog2") { // Se o sapo 2 foi encontrado, e ele for o objeto da vez
                // Montar ele lá no pet-shop
                this.gameObjects[key].x = utils.withGrid(17);
                this.gameObjects[key].y = utils.withGrid(8);
            }
            if (this.foundFrog3 && key === "frog3") { // Se o sapo 3 foi encontrado, e ele for o objeto da vez
                // Montar ele lá no pet-shop
                this.gameObjects[key].x = utils.withGrid(25);
                this.gameObjects[key].y = utils.withGrid(5);
            }

            if (key === "galinhaDosOvosDourados") { // Se o objeto é a galinha dos ovos dourados
                const num = Math.floor(Math.random() * 5) + 1; // Sorteia um número
                console.log(num);
                if (num%2 === 0) { // Se ele for par, coloca ela para fora do mapa
                    instance.isVisible = false;
                }
            }

            if (this.playerState.currentQuestId === "Q1.1" && key === "galinhaCaipiraQuestIcon") {
                this.showQuestIcon("galinhaCaipiraQuestIcon", "galinhaCaipira");
            }
            if (this.playerState.currentQuestId === "Q5.1" && key === "galinhaGalinaciaQuestIcon") {
                this.showQuestIcon("galinhaGalinaciaQuestIcon", "galinhaGalinacia");
            }
            
            if(!this.gameObjects[key].isVisible && object.type != "PlantableSpot" && object.type != "EasterEgg") {
                this.gameObjects[key].y = utils.withGrid(-50);
            }

            instance.mount(this);

            //Determina se o objeto realmente poderia ser montado
            //object.mount(this)
        })
    }

    putQuestIcon() { // Vincula os objetos de questIcon com suas respectivas galinhas
        let questIconsList = []; // Lista de questIcon
        Object.keys(this.gameObjects).forEach(key => { // Passa pelos objetos 
            let object = this.gameObjects[key];  // essa key é o nome do objeto, tipo galinhaMarrom
            if (object.isQuestIcon) { // Se for um questIcon
                questIconsList.push(key); // Coloca na lista
            }
        })
        Object.keys(this.gameObjects).forEach(key => { // Passa pelos objetos
            let object = this.gameObjects[key]; 
            if (object.haveQuestIcon) { // Se esse objeto tem um questIcon
                questIconsList.forEach(name => { // Percorre a lista de questIcons
                    if (name.includes(key)) { // Se o nome desse questIcon tiver o nome do NPC
                        object.questIcon = this.gameObjects[name]; // Vincula os dois
                    }
                })
            }
        })
    }

    showQuestIcon(questIcon, npc) {
        let objectNpc, questIconObj;
        Object.keys(this.gameObjects).forEach(key => { // Passa pelos objetos 
            if (key === npc) {
                objectNpc = this.gameObjects[key];
            }
        })
        Object.keys(this.gameObjects).forEach(key => { // Passa pelos objetos
            if (key === questIcon) {
                questIconObj = this.gameObjects[key];
                questIconObj.isVisible = true;
                questIconObj.x = utils.withGrid(objectNpc.x);
                questIconObj.y = utils.withGrid(objectNpc.y) - utils.withGrid(2);
                console.log("teste")
            }
        })
    }

    hideQuestIcon(questIcon, npc) {
        let objectNpc, questIconObj;
        Object.keys(this.gameObjects).forEach(key => { // Passa pelos objetos 
            if (key === npc) {
                objectNpc = this.gameObjects[key];
            }
        })
        Object.keys(this.gameObjects).forEach(key => { // Passa pelos objetos
            if (key === questIcon) {
                questIconObj = this.gameObjects[key];
                questIconObj.isVisible = false;
                questIconObj.y = utils.withGrid(-50);
                console.log("teste")
            }
        })
    }

    async startCutscene(events) { // método para começar uma cutscene
        this.isCutscenePlaying = true;

        // começa um loop de eventos assíncronos
        // espera cada um
        for (let i = 0; i<events.length; i++) {
            const eventHandler = new  OverworldEvent({
                event: events[i],
                map: this,
            })
            await eventHandler.init();
        }

        this.isCutscenePlaying = false; // ao acabar, atualiza a variável para false

        // Resetando os NPCs para voltarem aos seus comportamentos normais (OUTRO JEITO DE RESETAR OS COMPORTAMENTOS CASO O ATUAL NÃO FUNCIONE CORRETAMENTE)
        //Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
    }

    checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];

    if (this.isCutscenePlaying === false && match) {
        const eventConfig = match[0].events[0];

        // --- INÍCIO DA MODIFICAÇÃO ---

        // Condição especial para o Easter Egg da Galinha Dourada
        if (eventConfig.type === "foundEasterEgg" && eventConfig.who === "galinhaDouradaEG") {
            const galinhaDourada = this.gameObjects.galinhaDosOvosDourados;
            // Apenas ativa a cutscene se a galinha estiver visível no mapa
            if (galinhaDourada && galinhaDourada.isVisible !== false) {
                this.startCutscene(match[0].events);
            }
            return; // Impede que o código abaixo seja executado para este caso
        }

        // --- FIM DA MODIFICAÇÃO ---

        // Lógica original para todas as outras cutscenes
        if ((eventConfig.type === "foundEasterEgg" && !this.easterEggsFoundID.includes(eventConfig.who)) || eventConfig.type !== "foundEasterEgg") {
            this.startCutscene(match[0].events);
        }
    }
}

}

window.OverworldMaps = {
    Galinheiro: { // mapa
        name: "Galinheiro",
        lowerSrc: "./assets/img/galinheiroMapa.png", // layer de base do mapa (chão do mapa)
        upperSrc: "./assets/img/galinheiroMapaUpper.png", // layer superior do mapa (se precisa de algo acima do player)
        configObjects: { // define os personagens/objetos que o mapa vai ter
            hero: { // personagem principal
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(14), // 14
                y: utils.withGrid(16), // 16
            },
            galinhaBranca: {
                type: "Person",
                x: utils.withGrid(19),
                y: utils.withGrid(19),
                src: "./assets/img/galinhaBranca.png",
                haveQuestIcon: true, // Significa que essa galinha pode ter um questIcon
                behaviorLoop: [  // é um array que vai definir o comportamento normal de um NPC
                    {type: "walk", direction: "left",time: 800},  
                    {type: "walk", direction: "left",time: 800},
                    {type: "walk", direction: "left",time: 800},
                    {type: "stand", direction: "down", time: 300},  // o time é para quanto tempo vai passar até a próxima animação
                    {type: "walk", direction: "right", time: 800},
                    {type: "walk", direction: "right", time: 800},
                    {type: "walk", direction: "right", time: 800},
                    {type: "stand", direction: "down", time: 300}
                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "Pó! Eu sou a primeira galinha!", faceHero: "galinhaBranca", quest: "Q1"},
                            { type: "questProgress", flag: "TALKED_TO_GALINHA_BRANCA", counter: "CHICKENS_SPOKEN_TO" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Uai, achei que a Caipira tinha te mandado trabalhar...", faceHero: "galinhaBranca", quest: "Q2"},
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "A não... de novo não...", faceHero: "galinhaBranca", quest: "Q5.2"},
                            { type: "textMessage", text: "Foi a Galinácia, não foi!?", faceHero: "galinhaBranca", quest: "Q5.2"},
                            { type: "textMessage", text: "Ela não me entende que aquilo nunca será uma galinha!", faceHero: "galinhaBranca", quest: "Q5.2"},
                            { type: "questProgress", flag: "TALKED_TO_GALINHA_BRANCA", counter: "CHICKENS_SPOKEN_TO_FROG" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "O enigma do chefe? Hmm... 'Onde o grão descansa'... talvez seja um lugar de armazenamento, mas que leva a outro lugar?", faceHero: "galinhaBranca", quest: "Q10.1"},
                            { type: "questProgress", flag: "TALKED_CHICKEN_1_CLUE", counter: "CHIEF_CLUES_GATHERED" }
                        ]
                    }
                ] 
            },  
            galinhaBrancaQuestIcon: {
                type:"Person",
                x: utils.withGrid(19),
                y: utils.withGrid(17),
                src: "./assets/img/questIcon.png",
                isQuestIcon: true,
            },
            galinhaMarrom: {
                type: "Person",
                x: utils.withGrid(16),
                y: utils.withGrid(13),
                haveQuestIcon: true,
                src: "./assets/img/galinhaMarrom.png",
                behaviorLoop: [
                    {type: "stand", direction: "up", time: 8000},  
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "right"},
                    {type: "stand", direction: "up", time: 3540},
                    {type: "walk", direction: "right"},
                    {type: "stand", direction: "up", time: 5240},
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "up"},
                    {type: "stand", direction: "up", time: 1240},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "stand", direction: "up", time: 1240},
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "up"},
                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "Cocorocó! Eu sou a segunda!", faceHero: "galinhaMarrom", quest: "Q1"},
                            { type: "questProgress", flag: "TALKED_TO_GALINHA_MARROM", counter: "CHICKENS_SPOKEN_TO" }
                        ]
                    }, {
                        events: [
                            { type: "textMessage", text: "Ouvi a Branca falando...", faceHero: "galinhaMarrom", quest: "Q5.2"},
                            { type: "textMessage", text: "O chefe não vai ficar nada feliz", faceHero: "galinhaMarrom", quest: "Q5.2"},
                            { type: "textMessage", text: "Aqueles bichos ficam gritando!", faceHero: "galinhaMarrom", quest: "Q5.2"},
                            { type: "questProgress", flag: "TALKED_TO_GALINHA_MARROM", counter: "CHICKENS_SPOKEN_TO_FROG" }
                        ]
                    }
                ]
            },
            galinhaMarromQuestIcon: {
                type:"Person",
                x: utils.withGrid(16),
                y: utils.withGrid(11),
                src: "./assets/img/questIcon.png",
                isQuestIcon: true,
                isVisible: false,
            },
            Paova: {
                type: "Person",
                x: utils.withGrid(-1),
                y: utils.withGrid(5),
                src: "./assets/img/galinhaPaova.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "up", time: 1500}, // Vê o que tem na geladeira
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},   
                    {type: "stand", direction: "up", time: 1100}, // Mexe no fogão
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},
                    {type: "stand", direction: "up", time: 1700}, // Olha as panelas na bancada
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"}, 
                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", faceHero: "Paova", text: "O chef? Ah, ele é bem exigente... Gosta das coisas sempre no ponto.", quest: "Q9" },
                            { type: "questProgress", flag: "TALKED_TO_PAOVA_CHEF", counter: "CHEF_INFO_GATHERED" }
                        ]
                    }
                ]
            },
            Clotilde: {
                type: "Person",
                x: utils.withGrid(-19),
                y: utils.withGrid(13),
                src: "./assets/img/galinhaClotilde.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "up", time: 9300}, // Está passando roupa
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},
                    {type: "stand", direction: "up", time: 3200}, // Vai observar seus filhotes
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "stand", direction: "left", time: 1700}, // Para para tomar um chá
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "stand", direction: "left", time: 1300}, // Adimira as roupas no varal
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                    {type: "stand", direction: "up", time: 1700}, // Olha o quadro dos filhos 
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", faceHero: "Clotilde", text: "Ouvi dizer que o prato preferido do chef leva um ingrediente secreto que só ele conhece.", quest: "Q9" },
                            { type: "questProgress", flag: "TALKED_TO_CLOTILDE_CHEF", counter: "CHEF_INFO_GATHERED" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Vi que já conheceu a Galinácia", faceHero: "Clotilde", quest: "Q5.2"},
                            { type: "textMessage", text: "Os bichinhos dela ficam saltitando por aí", faceHero: "Clotilde", quest: "Q5.2"},
                            { type: "textMessage", text: "Parece até que consigo ouvi-los...", faceHero: "Clotilde", quest: "Q5.2"},
                            { type: "questProgress", flag: "TALKED_TO_CLOTILDE", counter: "CHICKENS_SPOKEN_TO_FROG" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Aquele enigma... 'a jornada não cessa' me soa como uma passagem. Já procurou nos cantos mais esquecidos do galinheiro?", faceHero: "Clotilde", quest: "Q10.1"},
                            { type: "questProgress", flag: "TALKED_CHICKEN_2_CLUE", counter: "CHIEF_CLUES_GATHERED" }
                        ]
                    }
                ]
            },
            Bernadette: {
                type: "Person",
                x: utils.withGrid(13),
                y: utils.withGrid(29),
                src: "./assets/img/galinhaBernadette.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "left", time: 10000}, // Descansa no sofá
                    {type: "walk", direction: "left"}, 
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},  
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"}, 
                    {type: "stand", direction: "up", time: 2800},  // Olha o netos da direita
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},
                    {type: "stand", direction: "up", time: 3500}, // Olha os netos que estão no meio
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},   
                    {type: "walk", direction: "left"},
                    {type: "stand", direction: "up", time: 3000}, // Olha os netos que estão na esquerda
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                    {type: "stand", direction: "up", time: 2800}, // Olha o neto da direita de novo
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},  
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "right"},
                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", faceHero: "Bernadette", text: "Aquele chef... vive enfurnado na cozinha. Mal o vemos por aqui.", quest: "Q9" },
                            { type: "questProgress", flag: "TALKED_TO_BERNADETTE_CHEF", counter: "CHEF_INFO_GATHERED" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Meu netinho, o chefe é um pintinho muito reservado. Ele gosta de ficar perto de onde os ovos são guardados... talvez a resposta esteja lá.", faceHero: "Bernadette", quest: "Q10.1"},
                            { type: "questProgress", flag: "TALKED_CHICKEN_3_CLUE", counter: "CHIEF_CLUES_GATHERED" }
                        ]
                    }
                ]
            },
            galinhaSegurancaMarrom: {
                type: "Person",
                x: utils.withGrid(30),
                y: utils.withGrid(16),
                src: "./assets/img/galinhaSegurancaMarrom.png",
                behaviorLoop: [  
                   {type: "stand", direction: "left", time: 2800},
                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", faceHero: "galinhaSegurancaMarrom", text: "Quer saber do chef? Sei de muita coisa. Continue investigando.", quest: "Q9" },
                            { type: "questProgress", flag: "TALKED_TO_SEGURANCA_CHEF", counter: "CHEF_INFO_GATHERED" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", text: "Então você quer ver o chefe? Ha! Muitos tentam, poucos conseguem.", faceHero: "galinhaSegurancaMarrom", quest: "Q10"},
                            { type: "textMessage", text: "Ele só recebe quem resolve seu enigma: 'Onde o grão descansa, mas a jornada não cessa'.", faceHero: "galinhaSegurancaMarrom", quest: "Q10"},
                            { type: "textMessage", text: "Se for esperto, talvez outras galinhas por aí possam te dar um norte. Agora, circule!", faceHero: "galinhaSegurancaMarrom", quest: "Q10"},
                            { type: "questProgress", flag: "SPOKEN_TO_SECURITY_FOR_CHIEF", counter: "SPOKEN_TO_SECURITY_FOR_CHIEF" }
                        ]
                    }
                ]
            },
             galinhaGalinacia: {
                type: "Person",
                x: utils.withGrid(25),
                y: utils.withGrid(7),
                haveQuestIcon: true,
                src: "./assets/img/galinhaGalinacia.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "left", time: 5200}, // Descansa na poltrona
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                    {type: "stand", direction: "up", time: 1800}, // Olha as tarefas do dia
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "stand", direction: "left", time: 2100},  // Olha a galinha no escorregador
                    {type: "stand", direction: "right", time: 1700}, // Dá uma olhada na galinha da balcada
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"}, 
                ],
                talking: [
                    {
                        events: [
                            {
                                type: "entregarItem",
                                itemId: "Milho",
                                quantity: 20,
                                events_if_enough: [
                                    { type: "textMessage", who: "galinhaGalinacia", text: "Oh, você trouxe os 20 milhos! Maravilha! Meus bebês vão adorar. Obrigada!!", quest: "Q5"},
                                    { type: "questProgress", flag: "entregouMilho", counter: "CORN_DELIVERED" } // Flag para completar a Quest 5
                                ],
                                events_if_not_enough: [
                                    {type: "textMessage", who: "galinhaGalinacia", text: "Você ainda não tem milho suficiente! Traga 20 milhos para mim, por favor."}
                                ]
                            }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", faceHero: "galinhaGalinacia", text: "Querido! Minhas queridíssimas galinhas da montanha...", quest: "Q5.1"},
                            { type: "textMessage", faceHero: "galinhaGalinacia", text: "S U M I R A M", quest: "Q5.1"},
                            { type: "textMessage", faceHero: "galinhaGalinacia", text: "São umas 3... trás elas para cá, eu te imploro!", quest: "Q5.1"},
                            { type: "questProgress", flag: "TALKED_TO_GALINACIA_FROGS", counter: "SPOKEN_TO_GALINACIA" }
                        ]
                    },
                    {
                        events: [
                            { type: "textMessage", faceHero: "galinhaGalinacia", text: "Querido! Muito obrigado!", quest: "Q7"},
                        ]
                    }
                ]
            },
            galinhaGalinaciaQuestIcon: {
                type:"Person",
                x: utils.withGrid(25),
                y: utils.withGrid(5),
                src: "./assets/img/questIcon.png",
                isQuestIcon: true,
                isVisible: false,
            },
            galinhaPenosa: {
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(13),
                src: "./assets/img/galinhaPenosa.png",
                behaviorLoop: [ 
                    //{type: "stand", direction: "bottom", time: 5200}, 
                ]
            },
            JuninhoJunior: {
                type: "Person",
                x: utils.withGrid(-24),
                y: utils.withGrid(18),
                src: "./assets/img/chefeSemBone.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "right", time: 5200}, 
                    {type: "stand", direction: "left", time: 5200}, 
                ]
            },
            galinhaDosOvosDourados: { // Trata-se do NPC dessa galinha
                type: "Person",
                x: utils.withGrid(0),
                y: utils.withGrid(14),
                src: "./assets/img/galinhaOvosDourados.png",
                behaviorLoop: [ 
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "up"}, 
                    {type: "stand", direction: "up", time: 5000}, 
                    {type: "walk", direction: "right"},
                    {type: "stand", direction: "up", time: 3000},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "left"},
                    {type: "stand", direction: "down", time: 9000},
                ],
                talking: [
                    {events: [ 
                            { type: "textMessage", text: "Cocorocó! Eu sou a segunda!", faceHero: "galinhaMarrom", quest: "Q1" },
                            { type: "questProgress", flag: "TALKED_TO_GALINHA__OVOS_DOURADOS", counter: "CHICKENS_SPOKEN_TO" }
                        ]
                    },
                ]
            },
            frog1: {  // Sapo da sala de costura
                type: "Person",
                x: utils.withGrid(-15),
                y: utils.withGrid(18),
                isFrog: true,
                src: "./assets/img/frogSprite.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "up", time: 3000}
                ]
            },
            frog2: {  // Sapo perto da saída
                type: "Person",
                x: utils.withGrid(30),
                y: utils.withGrid(22),
                isFrog: true,
                src: "./assets/img/frogSprite.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "right", time: 3000}
                ]
            },
            frog3: {  // Sapo da sala
                type: "Person",
                x: utils.withGrid(12),
                y: utils.withGrid(32),
                isFrog: true,
                src: "./assets/img/frogSprite.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "left", time: 3000}
                ]
            },
            pintinhos: {
                type: "EasterEgg",
                isEasterEgg: true,
                name: "Pintinhos",
                description: "Ou será uma galinha adulta!?",
                mapName: "Galinheiro",
                x: utils.withGrid(-4),
                y: utils.withGrid(12),
                src: "./assets/img/easterEggs/sprites/pintinhosEasterEgg.png",
            },
            bolaPixar: {
                type: "EasterEgg",
                isEasterEgg: true,
                name: "Bola",
                description: "Estranhamente familiar",
                mapName: "Galinheiro",
                x: utils.withGrid(11),
                y: utils.withGrid(13),
                src: "./assets/img/easterEggs/sprites/bolaPixar.png",
            },
            galinhaDouradaEG: { // É um objeto de easter egg da galinha dourada, ele não aparece no mapa, só é usado para mostrar o gif ao entrar na sala 
                type: "EasterEgg",
                isEasterEgg: true,
                name: "Galinha Dos Ovos Dourados",
                description: "Nem tudo que reluz é ouro. Mas nesse caso é sim",
                mapName: "Galinheiro",
                x: utils.withGrid(33),
                y: utils.withGrid(0),
                src: "./assets/img/galinhaOvosDourados.png",
            },
            albumGalinha: { // É um objeto de easter egg do álbum, ele não aparece no mapa, só é usado para mostrar o gif ao entrar na sala 
                type: "EasterEgg",
                isEasterEgg: true,
                name: "Álbum da Galinha Pintadinha",
                description: "O item mais cobiçado do galinheiro",
                mapName: "Galinheiro",
                x: utils.withGrid(50),
                y: utils.withGrid(0),
                src: "./assets/img/galinhaOvosDourados.png", // É genérico, já que não vai aparecer
            },
            baldePenas: { 
                type: "EasterEgg",
                isEasterEgg: true,
                name: "Balde de penas",
                description: "Não sabia que era possível costurar com penas",
                mapName: "Galinheiro",
                x: utils.withGrid(50),
                y: utils.withGrid(0),
                src: "./assets/img/galinhaOvosDourados.png", // É genérico, já que não vai aparecer
            },
            galinhaDaMontanha: { 
                type: "EasterEgg",
                isEasterEgg: true,
                name: "Galinha da Montanha",
                description: "Não sabia que era possível costurar com penas",
                mapName: "Galinheiro",
                x: utils.withGrid(50),
                y: utils.withGrid(0),
                src: "./assets/img/galinhaOvosDourados.png", // É genérico, já que não vai aparecer
            },

        },
        walls: {
            //define as coordenadas das colisoes do mapa
            //quarto direito inferior
            //------------------------------------------//
            [utils.asGridCoord(19,28)] : true,
            [utils.asGridCoord(19,27)] : true,
            [utils.asGridCoord(19,26)] : true,
            [utils.asGridCoord(19,25)] : true,
            [utils.asGridCoord(19,24)] : true,
            [utils.asGridCoord(19,23)] : true,

            [utils.asGridCoord(20,25)] : true,
            [utils.asGridCoord(21,25)] : true,
            [utils.asGridCoord(22,25)] : true,
            [utils.asGridCoord(23,25)] : true,
            [utils.asGridCoord(24,25)] : true,
            [utils.asGridCoord(25,25)] : true,
            [utils.asGridCoord(26,25)] : true,
            [utils.asGridCoord(27,25)] : true,
            [utils.asGridCoord(28,25)] : true,
            [utils.asGridCoord(29,25)] : true,
            [utils.asGridCoord(30,25)] : true,

            [utils.asGridCoord(19,31)] : true,
            [utils.asGridCoord(19,32)] : true,

            [utils.asGridCoord(20,23)] : true,
            [utils.asGridCoord(21,23)] : true,
            [utils.asGridCoord(22,23)] : true,
            [utils.asGridCoord(23,23)] : true,
            [utils.asGridCoord(24,23)] : true,
            [utils.asGridCoord(25,23)] : true,
            [utils.asGridCoord(26,23)] : true,
            [utils.asGridCoord(27,23)] : true,
            [utils.asGridCoord(28,23)] : true,
            [utils.asGridCoord(29,23)] : true,
            [utils.asGridCoord(30,23)] : true,
            [utils.asGridCoord(31,23)] : true,


            [utils.asGridCoord(20,27)] : true,
            [utils.asGridCoord(21,27)] : true,
            [utils.asGridCoord(21,26)] : true,
            [utils.asGridCoord(22,26)] : true,
            [utils.asGridCoord(23,26)] : true,
            [utils.asGridCoord(29,26)] : true,
            [utils.asGridCoord(30,26)] : true,
            [utils.asGridCoord(28,32)] : true,
            [utils.asGridCoord(29,31)] : true,
            [utils.asGridCoord(29,32)] : true,
            [utils.asGridCoord(30,32)] : true,
            [utils.asGridCoord(30,31)] : true,

            //------------------------------------------//

            // Parede direita
            //------------------------------------------//

            [utils.asGridCoord(31,32)] : true,
            [utils.asGridCoord(31,31)] : true,
            [utils.asGridCoord(31,30)] : true,
            [utils.asGridCoord(31,29)] : true,
            [utils.asGridCoord(31,28)] : true,
            [utils.asGridCoord(31,27)] : true,
            [utils.asGridCoord(31,26)] : true,
            [utils.asGridCoord(31,25)] : true,
            [utils.asGridCoord(31,24)] : true,
            [utils.asGridCoord(31,23)] : true,
            [utils.asGridCoord(31,22)] : true,
            [utils.asGridCoord(31,21)] : true,
            [utils.asGridCoord(31,20)] : true,
            [utils.asGridCoord(31,19)] : true,

            [utils.asGridCoord(31,16)] : true,
            [utils.asGridCoord(31,15)] : true,
            [utils.asGridCoord(31,14)] : true,
            [utils.asGridCoord(31,13)] : true,
            [utils.asGridCoord(31,12)] : true,
            [utils.asGridCoord(31,11)] : true,
            [utils.asGridCoord(31,10)] : true,
            [utils.asGridCoord(31,9)] : true,

            //------------------------------------------//
            
            // Base (chão)
            //------------------------------------------//

            [utils.asGridCoord(-15,33)] : true,
            [utils.asGridCoord(-14,33)] : true,
            [utils.asGridCoord(-13,33)] : true,
            [utils.asGridCoord(-12,33)] : true,
            [utils.asGridCoord(-11,33)] : true,
            [utils.asGridCoord(-10,33)] : true,
            [utils.asGridCoord(-9,33)] : true,
            [utils.asGridCoord(-8,33)] : true,
            [utils.asGridCoord(-7,33)] : true,
            [utils.asGridCoord(-6,33)] : true,
            [utils.asGridCoord(-5,33)] : true,
            [utils.asGridCoord(-4,33)] : true,
            [utils.asGridCoord(-3,33)] : true,
            [utils.asGridCoord(-2,33)] : true,
            [utils.asGridCoord(-1,33)] : true,
            [utils.asGridCoord(0,33)] : true,
            [utils.asGridCoord(1,33)] : true,
            [utils.asGridCoord(2,33)] : true,
            [utils.asGridCoord(3,33)] : true,
            [utils.asGridCoord(4,33)] : true,
            [utils.asGridCoord(5,33)] : true,
            [utils.asGridCoord(6,33)] : true,
            [utils.asGridCoord(7,33)] : true,
            [utils.asGridCoord(8,33)] : true,
            [utils.asGridCoord(9,33)] : true,
            [utils.asGridCoord(10,33)] : true,
            [utils.asGridCoord(11,33)] : true,
            [utils.asGridCoord(12,33)] : true,
            [utils.asGridCoord(13,33)] : true,
            [utils.asGridCoord(14,33)] : true,
            [utils.asGridCoord(15,33)] : true,
            [utils.asGridCoord(16,33)] : true,
            [utils.asGridCoord(17,33)] : true,
            [utils.asGridCoord(18,33)] : true,
            [utils.asGridCoord(19,33)] : true,
            [utils.asGridCoord(20,33)] : true,
            [utils.asGridCoord(21,33)] : true,
            [utils.asGridCoord(22,33)] : true,
            [utils.asGridCoord(23,33)] : true,
            [utils.asGridCoord(24,33)] : true,
            [utils.asGridCoord(25,33)] : true,
            [utils.asGridCoord(26,33)] : true,
            [utils.asGridCoord(27,33)] : true,
            [utils.asGridCoord(28,33)] : true,
            [utils.asGridCoord(29,33)] : true,
            [utils.asGridCoord(30,33)] : true,

            //------------------------------------------//

            // Parede do mercado
            //------------------------------------------//

            [utils.asGridCoord(30,11)] : true,
            [utils.asGridCoord(29,11)] : true,
            [utils.asGridCoord(28,11)] : true,
            [utils.asGridCoord(27,11)] : true,
            [utils.asGridCoord(26,11)] : true,
            [utils.asGridCoord(25,11)] : true,
            //[utils.asGridCoord(24,11)] : true, // coordenada da porta
            //[utils.asGridCoord(23,11)] : true, // coordenada da porta
            [utils.asGridCoord(22,11)] : true,
            [utils.asGridCoord(21,11)] : true,
            [utils.asGridCoord(20,11)] : true,
            [utils.asGridCoord(19,11)] : true,
            [utils.asGridCoord(18,11)] : true,
            [utils.asGridCoord(17,11)] : true,
            [utils.asGridCoord(16,11)] : true,
            [utils.asGridCoord(15,11)] : true,
            [utils.asGridCoord(14,11)] : true,
            [utils.asGridCoord(13,11)] : true,
            [utils.asGridCoord(12,11)] : true,
            [utils.asGridCoord(11,11)] : true,
            [utils.asGridCoord(10,11)] : true,

            //------------------------------------------//

            // Quarto dos livros
            //------------------------------------------//

            [utils.asGridCoord(10,12)] : true,
            [utils.asGridCoord(10,13)] : true,
            [utils.asGridCoord(10,14)] : true,
            [utils.asGridCoord(10,15)] : true,
            [utils.asGridCoord(9,15)] : true,
            
             [utils.asGridCoord(6,16)] : true,
             [utils.asGridCoord(5,16)] : true,
             [utils.asGridCoord(4,16)] : true,
             [utils.asGridCoord(3,16)] : true,
             [utils.asGridCoord(2,16)] : true,
             [utils.asGridCoord(1,16)] : true,
             [utils.asGridCoord(0,16)] : true,
             [utils.asGridCoord(-1,16)] : true,
             [utils.asGridCoord(-2,16)] : true,

            [utils.asGridCoord(-3,15)] : true,
            [utils.asGridCoord(-3,14)] : true,
            [utils.asGridCoord(-3,13)] : true,
            [utils.asGridCoord(-3,12)] : true,

            [utils.asGridCoord(-2,11)] : true,
            [utils.asGridCoord(-1,11)] : true,
            [utils.asGridCoord(0,11)] : true,
            [utils.asGridCoord(1,11)] : true,
            [utils.asGridCoord(2,11)] : true,
            [utils.asGridCoord(3,11)] : true,
            [utils.asGridCoord(4,11)] : true,
            [utils.asGridCoord(5,11)] : true,
            [utils.asGridCoord(6,11)] : true,
            [utils.asGridCoord(7,11)] : true,
            [utils.asGridCoord(8,11)] : true,
            [utils.asGridCoord(9,11)] : true,
            [utils.asGridCoord(10,11)] : true,

            [utils.asGridCoord(7,12)] : true,
            [utils.asGridCoord(8,12)] : true,
            [utils.asGridCoord(9,12)] : true,

            //------------------------------------------//

            // Quarto dos ovos
            //------------------------------------------//

            [utils.asGridCoord(0,26)] : true,
            [utils.asGridCoord(0,25)] : true,
            [utils.asGridCoord(0,24)] : true,
            [utils.asGridCoord(0,23)] : true,
            [utils.asGridCoord(0,22)] : true,
            [utils.asGridCoord(0,21)] : true,

            [utils.asGridCoord(0,29)] : true,
            [utils.asGridCoord(0,30)] : true,
            [utils.asGridCoord(0,31)] : true,
            [utils.asGridCoord(0,32)] : true,
            [utils.asGridCoord(0,33)] : true,

            [utils.asGridCoord(-1,21)] : true,
            [utils.asGridCoord(-2,21)] : true,
            [utils.asGridCoord(-3,21)] : true,
            [utils.asGridCoord(-4,21)] : true,
            [utils.asGridCoord(-5,21)] : true,
            [utils.asGridCoord(-6,21)] : true,
            [utils.asGridCoord(-7,21)] : true,
            [utils.asGridCoord(-8,21)] : true,
            [utils.asGridCoord(-9,21)] : true,
            [utils.asGridCoord(-10,21)] : true,
            [utils.asGridCoord(-11,21)] : true,
            [utils.asGridCoord(-12,21)] : true,
            [utils.asGridCoord(-13,21)] : true,
            [utils.asGridCoord(-14,21)] : true,

            [utils.asGridCoord(-15,21)] : true,
            [utils.asGridCoord(-15,22)] : true,
            [utils.asGridCoord(-15,23)] : true,
            [utils.asGridCoord(-15,24)] : true,
            [utils.asGridCoord(-15,25)] : true,
            [utils.asGridCoord(-15,26)] : true,
            [utils.asGridCoord(-15,27)] : true,
            [utils.asGridCoord(-15,28)] : true,
            [utils.asGridCoord(-15,29)] : true,
            [utils.asGridCoord(-15,30)] : true,
            [utils.asGridCoord(-15,31)] : true,
            [utils.asGridCoord(-15,32)] : true,

            [utils.asGridCoord(-1,24)] : true,
            [utils.asGridCoord(-2,24)] : true,
            [utils.asGridCoord(-3,24)] : true,
            [utils.asGridCoord(-4,24)] : true,
            [utils.asGridCoord(-5,24)] : true,
            [utils.asGridCoord(-6,24)] : true,
            [utils.asGridCoord(-7,24)] : true,
            [utils.asGridCoord(-8,24)] : true,
            [utils.asGridCoord(-9,24)] : true,
            [utils.asGridCoord(-10,24)] : true,
            [utils.asGridCoord(-11,24)] : true,
            [utils.asGridCoord(-12,24)] : true,
            [utils.asGridCoord(-13,24)] : true,
            [utils.asGridCoord(-14,24)] : true,

            [utils.asGridCoord(-14,25)] : true,
            [utils.asGridCoord(-14,26)] : true,
            [utils.asGridCoord(-14,27)] : true,
            [utils.asGridCoord(-14,28)] : true,
            [utils.asGridCoord(-14,29)] : true,
            [utils.asGridCoord(-14,30)] : true,
            [utils.asGridCoord(-14,31)] : true,
            [utils.asGridCoord(-14,32)] : true,

            [utils.asGridCoord(-13,32)] : true,
            [utils.asGridCoord(-13,27)] : true,
            [utils.asGridCoord(-13,28)] : true,
            [utils.asGridCoord(-13,29)] : true,

            [utils.asGridCoord(-2,29)] : true,
            [utils.asGridCoord(-2,30)] : true,
            [utils.asGridCoord(-2,31)] : true,
            [utils.asGridCoord(-2,32)] : true,
            [utils.asGridCoord(-1,29)] : true,
            [utils.asGridCoord(-1,30)] : true,
            [utils.asGridCoord(-1,31)] : true,
            [utils.asGridCoord(-1,32)] : true,

            //------------------------------------------//

            // Parede acima dos quartos dos ovos
            //------------------------------------------//

            [utils.asGridCoord(-15,19)] : true,
            [utils.asGridCoord(-15,20)] : true,

            //------------------------------------------//

            // Quarto da costura
            //------------------------------------------//

            [utils.asGridCoord(-14,17)] : true,
            [utils.asGridCoord(-14,18)] : true,
            [utils.asGridCoord(-14,19)] : true,

            [utils.asGridCoord(-14,14)] : true,
            [utils.asGridCoord(-14,13)] : true,
            [utils.asGridCoord(-14,12)] : true,

            [utils.asGridCoord(-28,19)] : true,
            [utils.asGridCoord(-27,19)] : true,
            [utils.asGridCoord(-26,19)] : true,
            [utils.asGridCoord(-25,19)] : true,
            [utils.asGridCoord(-24,19)] : true,
            [utils.asGridCoord(-23,19)] : true,
            [utils.asGridCoord(-22,19)] : true,
            [utils.asGridCoord(-21,19)] : true,
            [utils.asGridCoord(-20,19)] : true,
            [utils.asGridCoord(-19,19)] : true,
            [utils.asGridCoord(-18,19)] : true,
            [utils.asGridCoord(-17,19)] : true,
            [utils.asGridCoord(-16,19)] : true,

            [utils.asGridCoord(-28,18)] : true,
            [utils.asGridCoord(-28,17)] : true,
            [utils.asGridCoord(-28,16)] : true,
            [utils.asGridCoord(-28,15)] : true,
            [utils.asGridCoord(-28,14)] : true,
            [utils.asGridCoord(-28,13)] : true,
            [utils.asGridCoord(-28,12)] : true,
            [utils.asGridCoord(-28,11)] : true,
            [utils.asGridCoord(-28,10)] : true,
            [utils.asGridCoord(-28,9)] : true,

            [utils.asGridCoord(-27,12)] : true,
            [utils.asGridCoord(-26,12)] : true,
            [utils.asGridCoord(-25,12)] : true,

            [utils.asGridCoord(-24,11)] : true,
            [utils.asGridCoord(-23,11)] : true,
            [utils.asGridCoord(-22,11)] : true,
            [utils.asGridCoord(-21,11)] : true,
            [utils.asGridCoord(-20,11)] : true,

            [utils.asGridCoord(-19,12)] : true,
            [utils.asGridCoord(-18,12)] : true,
            [utils.asGridCoord(-17,12)] : true,
            [utils.asGridCoord(-16,12)] : true,
            [utils.asGridCoord(-15,12)] : true,

            [utils.asGridCoord(-17,13)] : true,
            [utils.asGridCoord(-16,13)] : true,

            [utils.asGridCoord(-27,14)] : true,
            [utils.asGridCoord(-27,15)] : true,
            [utils.asGridCoord(-27,16)] : true,
            [utils.asGridCoord(-27,17)] : true,

            [utils.asGridCoord(-17,17)] : true,
            [utils.asGridCoord(-16,17)] : true,
            [utils.asGridCoord(-17,18)] : true,
            [utils.asGridCoord(-16,18)] : true,

            //------------------------------------------//

            // Parede para o acesso a cozinha
            //------------------------------------------//

            [utils.asGridCoord(-13,11)] : true,
            [utils.asGridCoord(-12,11)] : true,
            [utils.asGridCoord(-11,11)] : true,
            [utils.asGridCoord(-10,11)] : true,
            //[utils.asGridCoord(-9,11)] : true, // colisao da porta
            //[utils.asGridCoord(-8,11)] : true, // colisao da porta
            [utils.asGridCoord(-7,11)] : true,
            [utils.asGridCoord(-6,11)] : true,
            [utils.asGridCoord(-5,11)] : true,
            [utils.asGridCoord(-4,11)] : true,

            //------------------------------------------//

            // Cozinha
            //------------------------------------------//

            [utils.asGridCoord(-12,9)] : true,
            [utils.asGridCoord(-12,8)] : true,
            [utils.asGridCoord(-12,7)] : true,
            [utils.asGridCoord(-12,6)] : true,
            [utils.asGridCoord(-12,5)] : true,
            [utils.asGridCoord(-12,4)] : true,
            [utils.asGridCoord(-12,3)] : true,
            [utils.asGridCoord(-12,2)] : true,
            [utils.asGridCoord(-12,1)] : true,

            [utils.asGridCoord(-11,4)] : true,
            [utils.asGridCoord(-10,4)] : true,
            [utils.asGridCoord(-9,4)] : true,
            [utils.asGridCoord(-8,4)] : true,
            [utils.asGridCoord(-7,4)] : true,
            [utils.asGridCoord(-6,4)] : true,
            [utils.asGridCoord(-5,4)] : true,
            [utils.asGridCoord(-4,4)] : true,
            [utils.asGridCoord(-3,4)] : true,
            [utils.asGridCoord(-2,4)] : true,
            [utils.asGridCoord(-1,4)] : true,
            [utils.asGridCoord(0,4)] : true,
            [utils.asGridCoord(1,4)] : true,
            [utils.asGridCoord(2,4)] : true,

            [utils.asGridCoord(0,5)] : true,
            [utils.asGridCoord(0,6)] : true,
            [utils.asGridCoord(0,7)] : true,

            [utils.asGridCoord(1,8)] : true,
            [utils.asGridCoord(2,8)] : true,

            [utils.asGridCoord(-11,10)] : true,
            [utils.asGridCoord(-10,10)] : true,
            //[utils.asGridCoord(-9,10)] : true, // Porta lado sala de costura
            //[utils.asGridCoord(-8,10)] : true, // Porta lado sala de costura
            [utils.asGridCoord(-7,10)] : true,
            [utils.asGridCoord(-6,10)] : true,
            [utils.asGridCoord(-5,10)] : true,
            [utils.asGridCoord(-4,10)] : true,
            [utils.asGridCoord(-3,10)] : true,
            [utils.asGridCoord(-2,10)] : true,
            [utils.asGridCoord(-1,10)] : true,
            [utils.asGridCoord(0,10)] : true,
            [utils.asGridCoord(1,10)] : true,
            [utils.asGridCoord(2,10)] : true,

            [utils.asGridCoord(3,9)] : true,

            //------------------------------------------//

            // Mercado
            //------------------------------------------//

            [utils.asGridCoord(13,13)] : true,
            [utils.asGridCoord(20,13)] : true,
            [utils.asGridCoord(21,13)] : true,

            [utils.asGridCoord(13,12)] : true,
            [utils.asGridCoord(14,12)] : true,
            [utils.asGridCoord(15,12)] : true,
            [utils.asGridCoord(16,12)] : true,
            [utils.asGridCoord(17,12)] : true,
            [utils.asGridCoord(18,12)] : true,
            [utils.asGridCoord(19,12)] : true,
            [utils.asGridCoord(20,12)] : true,

            [utils.asGridCoord(26,12)] : true,
            [utils.asGridCoord(27,12)] : true,

            //------------------------------------------//

            // Quarto superior
            //------------------------------------------//

            [utils.asGridCoord(14,10)] : true,
            [utils.asGridCoord(15,10)] : true,
            [utils.asGridCoord(16,10)] : true,
            [utils.asGridCoord(17,10)] : true,
            [utils.asGridCoord(18,10)] : true,
            [utils.asGridCoord(19,10)] : true,
            [utils.asGridCoord(20,10)] : true,
            [utils.asGridCoord(21,10)] : true,
            [utils.asGridCoord(22,10)] : true,
            //[utils.asGridCoord(23,10)] : true, // Porta lado mercado
            //[utils.asGridCoord(24,10)] : true, // Porta lado mercado
            [utils.asGridCoord(25,10)] : true,
            [utils.asGridCoord(26,10)] : true,
            [utils.asGridCoord(27,10)] : true,

            [utils.asGridCoord(27,9)] : true,
            [utils.asGridCoord(27,8)] : true,
            [utils.asGridCoord(27,7)] : true,
            [utils.asGridCoord(27,6)] : true,
            [utils.asGridCoord(27,5)] : true,
            [utils.asGridCoord(27,4)] : true,
            [utils.asGridCoord(27,3)] : true,
            [utils.asGridCoord(27,2)] : true,
            [utils.asGridCoord(27,1)] : true,

            [utils.asGridCoord(14,9)] : true,
            [utils.asGridCoord(14,8)] : true,
            [utils.asGridCoord(14,7)] : true,
            [utils.asGridCoord(14,6)] : true,
            [utils.asGridCoord(14,5)] : true,
            [utils.asGridCoord(14,4)] : true,
            [utils.asGridCoord(14,3)] : true,
            [utils.asGridCoord(14,2)] : true,
            [utils.asGridCoord(14,1)] : true,

            [utils.asGridCoord(15,3)] : true,
            [utils.asGridCoord(16,3)] : true,
            [utils.asGridCoord(17,3)] : true,
            [utils.asGridCoord(18,3)] : true,
            [utils.asGridCoord(19,3)] : true,
            [utils.asGridCoord(20,3)] : true,
            [utils.asGridCoord(21,3)] : true,
            [utils.asGridCoord(22,3)] : true,
            [utils.asGridCoord(23,3)] : true,
            [utils.asGridCoord(24,3)] : true,

            [utils.asGridCoord(15,4)] : true,
            [utils.asGridCoord(16,4)] : true,
            [utils.asGridCoord(17,4)] : true,
            [utils.asGridCoord(20,4)] : true,
            [utils.asGridCoord(21,4)] : true,
            [utils.asGridCoord(22,4)] : true,
            [utils.asGridCoord(24,4)] : true,
            [utils.asGridCoord(25,4)] : true,
            [utils.asGridCoord(26,4)] : true,

            [utils.asGridCoord(17,5)] : true,
            [utils.asGridCoord(16,5)] : true,
            [utils.asGridCoord(15,5)] : true,

            [utils.asGridCoord(15,8)] : true,
            [utils.asGridCoord(26,8)] : true,
            [utils.asGridCoord(26,6)] : true,

            //------------------------------------------//

            // Sofa sala
            //------------------------------------------//
        
            [utils.asGridCoord(9,30)] : true,
            [utils.asGridCoord(10,30)] : true,

            //[utils.asGridCoord(13,29)] : true, Tirando a coordenada do sofá da direita para a Bernadette poder ficar em cima
            [utils.asGridCoord(13,30)] : true,
            [utils.asGridCoord(13,31)] : true,
            [utils.asGridCoord(14,29)] : true,
            [utils.asGridCoord(14,30)] : true,
            [utils.asGridCoord(14,31)] : true,

            [utils.asGridCoord(5,29)] : true,
            [utils.asGridCoord(5,30)] : true,
            [utils.asGridCoord(5,31)] : true,
            [utils.asGridCoord(6,29)] : true,
            [utils.asGridCoord(6,30)] : true,
            [utils.asGridCoord(6,31)] : true,

            [utils.asGridCoord(8,32)] : true,
            [utils.asGridCoord(9,32)] : true,
            [utils.asGridCoord(10,32)] : true,
            [utils.asGridCoord(11,32)] : true,

            //------------------------------------------//
            
        },
        // Espaços em que acontece cutscenes
        cutsceneSpaces: {
            [utils.asGridCoord(31,17)] : [
                {events: [{type: "changeMap", map: "Fazenda"},]}
            ],
            [utils.asGridCoord(31,18)] : [
                {events: [{type: "changeMap", map: "Fazenda"},]}
            ],
            [utils.asGridCoord(-15,17)] : [ // Espaço acima do sapo da sala de costura
                {events: [{type: "foundFrog", who: "frog1", x: -15, y: 17},]}
            ],
            [utils.asGridCoord(29,22)] : [ // Espaço ao lado do sapo perto da saída
                {events: [{type: "foundFrog", who: "frog2", x: 29, y: 22},]}
            ],
            [utils.asGridCoord(12,31)] : [ // Espaço acima do sapo da sala
                {events: [{type: "foundFrog", who: "frog3", x: 12, y: 31},]}
            ],
            [utils.asGridCoord(-4,13)] : [ // Achou os pintinhos fingindo ser adultos
                {events: [{type: "foundEasterEgg", who: "pintinhos"},]}
            ],
            [utils.asGridCoord(11,14)] : [ // Achou os pintinhos fingindo ser adultos
                {events: [{type: "foundEasterEgg", who: "bolaPixar"},]}
            ],
            [utils.asGridCoord(20, 29)]: [
                {
                    events: [
                        // Para a música padrão e toca a nova música da área
                        { type: "toggleMusic", song: "./assets/audio/songs/discoteca_songtrack.ogg" }
                    ]
                }
             ],
            // Ao pisar na casa (10, 16) - a "saída" da área - a música padrão retorna
            [utils.asGridCoord(20, 30)]: [
                {
                    events: [
                        // Para a música da área e retoma a trilha sonora
                        { type: "toggleMusic", song: "./assets/audio/songs/discoteca_songtrack.ogg" }
                    ]
                }
            ],
            [utils.asGridCoord(7,14)] : [ // Achou q galinha douradas
                {events: [{type: "foundEasterEgg", who: "galinhaDouradaEG"},]}
            ],
            [utils.asGridCoord(21,32)] : [ // Achou o álbum da galinha pintadinha
                {events: [{type: "foundEasterEgg", who: "albumGalinha"},]}
            ],
            [utils.asGridCoord(-15,13)] : [ // Achou o balde de penas
                {events: [{type: "foundEasterEgg", who: "baldePenas"},]}
            ],
            [utils.asGridCoord(11,16)] : [ // 
                {events: [{type: "pinguimZoom", who: "./assets/img/easterEggs/gifs/zoomTeste.gif"},]}
            ],
            [utils.asGridCoord(-1, 27)]: [
                {
                    events: [
                        { type: "questProgress", flag: "FOUND_CHIEF_ROOM" }
                    ]
                }
            ],
            [utils.asGridCoord(-1, 28)]: [
                {
                    events: [
                        { type: "questProgress", flag: "FOUND_CHIEF_ROOM" }
                    ]
                }
            ],
        }
    },
    // Mapa da parte da fazenda
    Fazenda: {
        name: "Fazenda",
        lowerSrc: "./assets/img/fazendaMapa.png",
        upperSrc: "",
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(-25),
                y: utils.withGrid(17),
            },
            galinhaMarrom: {
                type: "Person",
                x: utils.withGrid(21),
                y: utils.withGrid(14),
                src: "./assets/img/galinhaMarrom.png",
                behaviorLoop: [
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"}, 
                    {type: "walk", direction: "down"},  
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                ]
            },
            galinhaCaipira: {
                type: "Person",
                x: utils.withGrid(-20),
                y: utils.withGrid(23),
                haveQuestIcon: true,
                src: "./assets/img/galinhaCaipira.png",
                behaviorLoop: [
                    {type: "walk", direction: "left"},  
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"}, 
                    {type: "walk", direction: "down"},  
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "down"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                    {type: "walk", direction: "up"},
                ],
                talking: [
                    {
                        events: [
                            { type: "textMessage", text: "Guri, preciso de ajuda. Plante 9 trigos para a Paova assar os pães do cafézin", faceHero: "galinhaCaipira", quest: "Q1.1"},
                            { type: "questProgress", flag: "TALKED_TO_GALINHA_CAIPIRA", counter: "SPOKEN_TO_CAIPIRA" }
                        ]
                    }
                ]
            },
            galinhaCaipiraQuestIcon: {
                type:"Person",
                x: utils.withGrid(-20),
                y: utils.withGrid(21),
                src: "./assets/img/questIcon.png",
                isQuestIcon: true,
                isVisible: false,
            },
            cavalo: {
                type: "Person",
                isHorse: true,
                x: utils.withGrid(-1),
                y: utils.withGrid(20),
                src: "./assets/img/cavaloSpriteSheet.png",
                animations: {
                    "idle-right" : [ [1,0] ],
                    "idle-left"  : [ [1,1] ],
                    "walk-right" : [ [0,0],[1,0],[2,0],[3,0],[4,0],[5,0], ],
                    "walk-left"  : [ [0,1],[1,1],[2,1],[3,1],[4,1],[5,1], ],
                },
                behaviorLoop: [ 
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "right"}, 
                    {type: "walk", direction: "right"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                    {type: "walk", direction: "left"},
                ]
            },

            // Tiles de plantação FUNCIONAIS            plantTile1: { type: "PlantableSpot", x: utils.withGrid(-15), y: utils.withGrid(15), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile2: { type: "PlantableSpot", x: utils.withGrid(-14), y: utils.withGrid(15), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile3: { type: "PlantableSpot", x: utils.withGrid(-13), y: utils.withGrid(15), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile4: { type: "PlantableSpot", x: utils.withGrid(-12), y: utils.withGrid(15), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile5: { type: "PlantableSpot", x: utils.withGrid(-11), y: utils.withGrid(15), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile6: { type: "PlantableSpot", x: utils.withGrid(-10), y: utils.withGrid(15), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile7: { type: "PlantableSpot", x: utils.withGrid(-15), y: utils.withGrid(16), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile8: { type: "PlantableSpot", x: utils.withGrid(-14), y: utils.withGrid(16), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile9: { type: "PlantableSpot", x: utils.withGrid(-13), y: utils.withGrid(16), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile10: { type: "PlantableSpot", x: utils.withGrid(-12), y: utils.withGrid(16), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile11: { type: "PlantableSpot", x: utils.withGrid(-11), y: utils.withGrid(16), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile12: { type: "PlantableSpot", x: utils.withGrid(-10), y: utils.withGrid(16), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile13: { type: "PlantableSpot", x: utils.withGrid(-15), y: utils.withGrid(17), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile14: { type: "PlantableSpot", x: utils.withGrid(-14), y: utils.withGrid(17), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile15: { type: "PlantableSpot", x: utils.withGrid(-13), y: utils.withGrid(17), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile16: { type: "PlantableSpot", x: utils.withGrid(-12), y: utils.withGrid(17), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile17: { type: "PlantableSpot", x: utils.withGrid(-11), y: utils.withGrid(17), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile18: { type: "PlantableSpot", x: utils.withGrid(-10), y: utils.withGrid(17), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile19: { type: "PlantableSpot", x: utils.withGrid(-15), y: utils.withGrid(18), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile20: { type: "PlantableSpot", x: utils.withGrid(-14), y: utils.withGrid(18), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile21: { type: "PlantableSpot", x: utils.withGrid(-13), y: utils.withGrid(18), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile22: { type: "PlantableSpot", x: utils.withGrid(-12), y: utils.withGrid(18), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile23: { type: "PlantableSpot", x: utils.withGrid(-11), y: utils.withGrid(18), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile24: { type: "PlantableSpot", x: utils.withGrid(-10), y: utils.withGrid(18), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile25: { type: "PlantableSpot", x: utils.withGrid(-15), y: utils.withGrid(19), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile26: { type: "PlantableSpot", x: utils.withGrid(-14), y: utils.withGrid(19), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile27: { type: "PlantableSpot", x: utils.withGrid(-13), y: utils.withGrid(19), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile28: { type: "PlantableSpot", x: utils.withGrid(-12), y: utils.withGrid(19), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile29: { type: "PlantableSpot", x: utils.withGrid(-11), y: utils.withGrid(19), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile30: { type: "PlantableSpot", x: utils.withGrid(-10), y: utils.withGrid(19), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile31: { type: "PlantableSpot", x: utils.withGrid(-15), y: utils.withGrid(20), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile32: { type: "PlantableSpot", x: utils.withGrid(-14), y: utils.withGrid(20), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile33: { type: "PlantableSpot", x: utils.withGrid(-13), y: utils.withGrid(20), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile34: { type: "PlantableSpot", x: utils.withGrid(-12), y: utils.withGrid(20), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile35: { type: "PlantableSpot", x: utils.withGrid(-11), y: utils.withGrid(20), talking: [{ events: [{ type: "startPlanting" }] }] },
            plantTile36: { type: "PlantableSpot", x: utils.withGrid(-10), y: utils.withGrid(20), talking: [{ events: [{ type: "startPlanting" }] }] },
        },
        groundDecals: {
            plantingArea: {
                src: "./assets/img/terreno.png",
                x: utils.withGrid(-15),
                y: utils.withGrid(15)
            }
        },
        // ...restante do mapa...
        walls: {
            //define as coordenadas das colisoes do mapa
        },
        // Espaços em que acontece cutscenes
        cutsceneSpaces: {
            [utils.asGridCoord(-28,15)] : [
                {events: [{type: "changeMap", map: "Galinheiro"},]}
            ],
            [utils.asGridCoord(-28,16)] : [
                {events: [{type: "changeMap", map: "Galinheiro"},]}
            ],
            [utils.asGridCoord(-28,17)] : [
                {events: [{type: "changeMap", map: "Galinheiro"},]}
            ],
            [utils.asGridCoord(-28,18)] : [
                {events: [{type: "changeMap", map: "Galinheiro"},]}
            ],

    }    
}
}
