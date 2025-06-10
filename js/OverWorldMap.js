class OverworldMap { // representa um mapa específico no jogo, incluindo seus objetos, colisões e camadas visuais
    constructor(config, state = {}){
        this.overworld = null;
        this.gameObjects = {}; // Armazena um objeto contendo todos os GameObjects que pertencem a este mapa
        this.cutsceneSpaces = config.cutsceneSpaces || {};
        this.walls = config.walls || {}; // Armazena um objeto que representa as áreas de colisão ("paredes") no mapa. As chaves são coordenadas no formato "x,y", e o valor true indica que há uma parede. O padrão é um objeto vazio
        this.configObjects = config.configObjects;
        
        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc; // cria a camada inferior do mapa

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc; // cria a camada superior do mapa
        this.isCutscenePlaying = false; // Para saber se está rodando alguma cutscene. 
        this.foundFrog1 = state.foundFrog1 || false; // Para saber se foi encontrado os sapos. Caso não tenha valor, é falso
        this.foundFrog2 = state.foundFrog2 || false;
        this.foundFrog3 = state.foundFrog3 || false;
        this.name = config.name; // Serve para saber em qual mapa se está
        this.test = true;
    }

    drawLowerImage(ctx, cameraPerson){
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(-20) - cameraPerson.x,
            utils.withGrid(3) - cameraPerson.y // são deslocamentos para centralizar a câmera
        )
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
                
            }

            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;

            if (object.type === "EasterEgg") {
                console.log(instance.name, instance.description, instance.mapName);
            }

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
            
            instance.mount(this);

            //Determina se o objeto realmente poderia ser montado
            //object.mount(this)
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

    checkForFootstepCutscene() { // Método que percebe se o pinguim entrou na coordenada que inicia alguma cutscene
        const hero = this.gameObjects["hero"]; // Armazena em hero o objeto do pinguim
        const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
        //console.log("testando");

        if (this.isCutscenePlaying === false && match) { // Se não tiver rodando nenhuma cutscene e o player estiver no lugar que inicia uma
            this.startCutscene(match[0].events);
            //console.log("testando o checkForFootstepCutscene ");
        }

    }

}

window.OverworldMaps = {
    Galinheiro: { // mapa
        name: "Galinheiro",
        lowerSrc: "./assets/img/mapas/galinheiroMapa.png", // layer de base do mapa (chão do mapa)
        upperSrc: "", // layer superior do mapa (se precisa de algo acima do player)
        configObjects: { // define os personagens/objetos que o mapa vai ter
            hero: { // personagem principal
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(16),
                y: utils.withGrid(14),
            },
            pintinhos: {
                type: "EasterEgg",
                isEasterEgg: true,
                name: "Pintinhos",
                description: "Ou será uma galinha adulta!?",
                mapName: "Galinheiro",
                x: utils.withGrid(-4),
                y: utils.withGrid(12),
                src: "./assets/img/easterEgg/sprites/pintinhosEasterEgg.png",
            },
            galinhaBranca: {
                type: "Person",
                x: utils.withGrid(19),
                y: utils.withGrid(19),
                src: "./assets/img/sprites/galinhaBranca.png",
                behaviorLoop: [  // é um array que vai definir o comportamento normal de um NPC
                    {type: "walk", direction: "left",time: 800},  
                    {type: "walk", direction: "left",time: 800},
                    {type: "walk", direction: "left",time: 800},
                    {type: "stand", direction: "down", time: 300},  // o time é para quanto tempo vai passar até a próxima animação
                    {type: "walk", direction: "right", time: 800},
                    {type: "walk", direction: "right", time: 800},
                    {type: "walk", direction: "right", time: 800},
                    {type: "stand", direction: "down", time: 300}
                ]
            },
            galinhaMarrom: {
                type: "Person",
                x: utils.withGrid(21),
                y: utils.withGrid(14),
                src: "./assets/img/sprites/galinhaMarrom.png",
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
            Paova: {
                type: "Person",
                x: utils.withGrid(-1),
                y: utils.withGrid(5),
                src: "./assets/img/sprites/galinhaPaova.png",
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
                ]
            },
            Clotilde: {
                type: "Person",
                x: utils.withGrid(-19),
                y: utils.withGrid(13),
                src: "./assets/img/sprites/galinhaClotilde.png",
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
                ]
            },
            Bernadette: {
                type: "Person",
                x: utils.withGrid(13),
                y: utils.withGrid(29),
                src: "./assets/img/sprites/galinhaBernadette.png",
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
                ]
            },
            galinhaSegurancaMarrom: {
                type: "Person",
                x: utils.withGrid(30),
                y: utils.withGrid(16),
                src: "./assets/img/sprites/galinhaSegurancaMarrom.png",
                behaviorLoop: [  
                   {type: "stand", direction: "left", time: 2800},
                ]
            },
             galinhaGalinacia: {
                type: "Person",
                x: utils.withGrid(25),
                y: utils.withGrid(7),
                src: "./assets/img/sprites/galinhaGalinacia.png",
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
                ]
            },
            galinhaPenosa: {
                type: "Person",
                x: utils.withGrid(14),
                y: utils.withGrid(13),
                src: "./assets/img/sprites/galinhaPenosa.png",
                behaviorLoop: [ 
                    //{type: "stand", direction: "bottom", time: 5200}, 
                ]
            },
            frog1: {  // Sapo da sala de costura
                type: "Person",
                x: utils.withGrid(-15),
                y: utils.withGrid(18),
                isFrog: true,
                src: "./assets/img/sprites/frogSprite.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "up", time: 3000}
                ]
            },
            frog2: {  // Sapo perto da saída
                type: "Person",
                x: utils.withGrid(30),
                y: utils.withGrid(22),
                isFrog: true,
                src: "./assets/img/sprites/frogSprite.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "right", time: 3000}
                ]
            },
            frog3: {  // Sapo da sala
                type: "Person",
                x: utils.withGrid(12),
                y: utils.withGrid(32),
                isFrog: true,
                src: "./assets/img/sprites/frogSprite.png",
                behaviorLoop: [ 
                    {type: "stand", direction: "left", time: 3000}
                ]
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
            [utils.asGridCoord(24,4)] : true,
            [utils.asGridCoord(25,4)] : true,
            [utils.asGridCoord(26,4)] : true,

            //------------------------------------------//

            // Sofa sala
            //------------------------------------------//
        
            [utils.asGridCoord(9,30)] : true,
            [utils.asGridCoord(10,30)] : true,

            //[utils.asGridCoord(13,29)] : true,
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
        }
    },
    // Mapa da parte da fazenda
    Fazenda: { // mapa
        name: "Fazenda",
        lowerSrc: "./assets/img/mapas/fazendaMapa.png", // layer de base do mapa (chão do mapa)
        upperSrc: "", // layer superior do mapa (se precisa de algo acima do player)
        configObjects: { // define os personagens/objetos que o mapa vai ter
            hero: ({ // personagem principal
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(16),
                y: utils.withGrid(14),
            }),
            galinhaMarrom: {
                type: "Person",
                x: utils.withGrid(21),
                y: utils.withGrid(14),
                src: "./assets/img/sprites/galinhaMarrom.png",
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
            }
        },
        walls: {
            //define as coordenadas das colisoes do mapa
        },
        // Espaços em que acontece cutscenes
        cutsceneSpaces: {
            [utils.asGridCoord(32,17)] : [
                {
                    events: [
                        {type: "changeMap", map: "Galinheiro"},
                    ]
                }
            ]
        }
    } 
}
