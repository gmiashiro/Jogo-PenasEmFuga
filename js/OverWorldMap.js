class OverworldMap { // representa um mapa específico no jogo, incluindo seus objetos, colisões e camadas visuais
    constructor(config){
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

            let instance;
            if (object.type === "Person") {
                instance = new Person(object);
            }

            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;
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

    // addWall(x,y){ // Adiciona uma parede (uma área de colisão) nas coordenadas (x,y)
    //     this.walls[`${x},${y}`] = true;
    // }
    // removeWall(x,y){ // Remove uma parede das coordenadas (x,y)
    //     delete this.walls[`${x},${y}`]
    // }
    // moveWall(wasX, wasY, direction){ // Move uma parede de uma posição anterior (wasX, wasY) para a próxima posição calculada com base na direction. Útil para objetos que se movem e precisam atualizar suas colisões
    //     this.removeWall(wasX,wasY);
    //     const {x,y} = utils.nextPosition(wasX,wasY,direction);
    //     this.addWall(x,y);
    // }
}

window.OverworldMaps = {
    Galinheiro: { // mapa
        lowerSrc: "./assets/img/galinheiroMapa.png", // layer de base do mapa (chão do mapa)
        upperSrc: "", // layer superior do mapa (se precisa de algo acima do player)
        configObjects: { // define os personagens/objetos que o mapa vai ter
            hero: { // personagem principal
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(3),
                y: utils.withGrid(5),
            },
            galinhaBranca: {
                type: "Person",
                x: utils.withGrid(6),
                y: utils.withGrid(10),
                src: "./assets/img/galinhaBranca.png",
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
                x: utils.withGrid(8),
                y: utils.withGrid(5),
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
            Paova: {
                type: "Person",
                x: utils.withGrid(-14),
                y: utils.withGrid(-4),
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
                            { type: "textMessage", who: "Paova", text: "O chef? Ah, ele é bem exigente... Gosta das coisas sempre no ponto." },
                            { type: "questProgress", flag: "TALKED_TO_PAOVA_CHEF", counter: "CHEF_INFO_GATHERED" }
                        ]
                    }
                ]
            },
            Clotilde: {
                type: "Person",
                x: utils.withGrid(-32),
                y: utils.withGrid(4),
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
                ]
            },            Bernadette: {
                type: "Person",
                x: utils.withGrid(0),
                y: utils.withGrid(20),
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
                            { type: "textMessage", who: "Bernadette", text: "Aquele chef... vive enfurnado na cozinha. Mal o vemos por aqui." },
                            { type: "questProgress", flag: "TALKED_TO_BERNADETTE_CHEF", counter: "CHEF_INFO_GATHERED" }
                        ]
                    }
                ]
            },
            galinhaSegurancaMarrom: {
                type: "Person",
                x: utils.withGrid(17),
                y: utils.withGrid(7),
                src: "./assets/img/galinhaSegurancaMarrom.png",
                behaviorLoop: [  
                   {type: "stand", direction: "left", time: 2800},
                ]
            },
             galinhaGalinacia: {
                type: "Person",
                x: utils.withGrid(12),
                y: utils.withGrid(-2),
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
                ]
            },
            galinhaPenosa: {
                type: "Person",
                x: utils.withGrid(1),
                y: utils.withGrid(4),
                src: "./assets/img/galinhaPenosa.png",
                behaviorLoop: [ 
                    //{type: "stand", direction: "bottom", time: 5200}, 
                ]
            }

        },
        walls: {
            //define as coordenadas das colisoes do mapa
            //quarto direito inferior
            //------------------------------------------//
            [utils.asGridCoord(6,19)] : true,
            [utils.asGridCoord(6,18)] : true,
            [utils.asGridCoord(6,17)] : true,
            [utils.asGridCoord(6,16)] : true,
            [utils.asGridCoord(6,15)] : true,
            [utils.asGridCoord(6,14)] : true,

            [utils.asGridCoord(7,16)] : true,
            [utils.asGridCoord(8,16)] : true,
            [utils.asGridCoord(9,16)] : true,
            [utils.asGridCoord(10,16)] : true,
            [utils.asGridCoord(11,16)] : true,
            [utils.asGridCoord(12,16)] : true,
            [utils.asGridCoord(13,16)] : true,
            [utils.asGridCoord(14,16)] : true,
            [utils.asGridCoord(15,16)] : true,
            [utils.asGridCoord(16,16)] : true,
            [utils.asGridCoord(17,16)] : true,

            [utils.asGridCoord(6,22)] : true,
            [utils.asGridCoord(6,23)] : true,

            [utils.asGridCoord(7,14)] : true,
            [utils.asGridCoord(8,14)] : true,
            [utils.asGridCoord(9,14)] : true,
            [utils.asGridCoord(10,14)] : true,
            [utils.asGridCoord(11,14)] : true,
            [utils.asGridCoord(12,14)] : true,
            [utils.asGridCoord(13,14)] : true,
            [utils.asGridCoord(14,14)] : true,
            [utils.asGridCoord(15,14)] : true,
            [utils.asGridCoord(16,14)] : true,
            [utils.asGridCoord(17,14)] : true,
            [utils.asGridCoord(18,14)] : true,

            //------------------------------------------//

            // Parede direita
            //------------------------------------------//

            [utils.asGridCoord(18,23)] : true,
            [utils.asGridCoord(18,22)] : true,
            [utils.asGridCoord(18,21)] : true,
            [utils.asGridCoord(18,20)] : true,
            [utils.asGridCoord(18,19)] : true,
            [utils.asGridCoord(18,18)] : true,
            [utils.asGridCoord(18,17)] : true,
            [utils.asGridCoord(18,16)] : true,
            [utils.asGridCoord(18,15)] : true,
            [utils.asGridCoord(18,14)] : true,
            [utils.asGridCoord(18,13)] : true,
            [utils.asGridCoord(18,12)] : true,
            [utils.asGridCoord(18,11)] : true,
            [utils.asGridCoord(18,10)] : true,

            [utils.asGridCoord(18,7)] : true,
            [utils.asGridCoord(18,6)] : true,
            [utils.asGridCoord(18,5)] : true,
            [utils.asGridCoord(18,4)] : true,
            [utils.asGridCoord(18,3)] : true,
            [utils.asGridCoord(18,2)] : true,
            [utils.asGridCoord(18,1)] : true,
            [utils.asGridCoord(18,0)] : true,

            //------------------------------------------//
            
            // Base (chão)
            //------------------------------------------//

            [utils.asGridCoord(-28,24)] : true,
            [utils.asGridCoord(-27,24)] : true,
            [utils.asGridCoord(-26,24)] : true,
            [utils.asGridCoord(-25,24)] : true,
            [utils.asGridCoord(-24,24)] : true,
            [utils.asGridCoord(-23,24)] : true,
            [utils.asGridCoord(-22,24)] : true,
            [utils.asGridCoord(-21,24)] : true,
            [utils.asGridCoord(-20,24)] : true,
            [utils.asGridCoord(-19,24)] : true,
            [utils.asGridCoord(-18,24)] : true,
            [utils.asGridCoord(-17,24)] : true,
            [utils.asGridCoord(-16,24)] : true,
            [utils.asGridCoord(-15,24)] : true,
            [utils.asGridCoord(-14,24)] : true,
            [utils.asGridCoord(-13,24)] : true,
            [utils.asGridCoord(-12,24)] : true,
            [utils.asGridCoord(-11,24)] : true,
            [utils.asGridCoord(-10,24)] : true,
            [utils.asGridCoord(-9,24)] : true,
            [utils.asGridCoord(-8,24)] : true,
            [utils.asGridCoord(-7,24)] : true,
            [utils.asGridCoord(-6,24)] : true,
            [utils.asGridCoord(-5,24)] : true,
            [utils.asGridCoord(-4,24)] : true,
            [utils.asGridCoord(-3,24)] : true,
            [utils.asGridCoord(-2,24)] : true,
            [utils.asGridCoord(-1,24)] : true,
            [utils.asGridCoord(0,24)] : true,
            [utils.asGridCoord(1,24)] : true,
            [utils.asGridCoord(2,24)] : true,
            [utils.asGridCoord(3,24)] : true,
            [utils.asGridCoord(4,24)] : true,
            [utils.asGridCoord(5,24)] : true,
            [utils.asGridCoord(6,24)] : true,
            [utils.asGridCoord(7,24)] : true,
            [utils.asGridCoord(8,24)] : true,
            [utils.asGridCoord(9,24)] : true,
            [utils.asGridCoord(10,24)] : true,
            [utils.asGridCoord(11,24)] : true,
            [utils.asGridCoord(12,24)] : true,
            [utils.asGridCoord(13,24)] : true,
            [utils.asGridCoord(14,24)] : true,
            [utils.asGridCoord(15,24)] : true,
            [utils.asGridCoord(16,24)] : true,
            [utils.asGridCoord(17,24)] : true,

            //------------------------------------------//

            // Parede do mercado
            //------------------------------------------//

            [utils.asGridCoord(17,2)] : true,
            [utils.asGridCoord(16,2)] : true,
            [utils.asGridCoord(15,2)] : true,
            [utils.asGridCoord(14,2)] : true,
            [utils.asGridCoord(13,2)] : true,
            [utils.asGridCoord(12,2)] : true,
            //[utils.asGridCoord(11,2)] : true, // coordenada da porta
            //[utils.asGridCoord(10,2)] : true, // coordenada da porta
            [utils.asGridCoord(9,2)] : true,
            [utils.asGridCoord(8,2)] : true,
            [utils.asGridCoord(7,2)] : true,
            [utils.asGridCoord(6,2)] : true,
            [utils.asGridCoord(5,2)] : true,
            [utils.asGridCoord(4,2)] : true,
            [utils.asGridCoord(3,2)] : true,
            [utils.asGridCoord(2,2)] : true,
            [utils.asGridCoord(1,2)] : true,
            [utils.asGridCoord(0,2)] : true,
            [utils.asGridCoord(-1,2)] : true,
            [utils.asGridCoord(-2,2)] : true,
            [utils.asGridCoord(-3,2)] : true,

            //------------------------------------------//

            // Quarto dos livros
            //------------------------------------------//

            [utils.asGridCoord(-3,3)] : true,
            [utils.asGridCoord(-3,4)] : true,
            [utils.asGridCoord(-3,5)] : true,
            [utils.asGridCoord(-3,6)] : true,
            [utils.asGridCoord(-4,6)] : true,
            
             [utils.asGridCoord(-7,7)] : true,
             [utils.asGridCoord(-8,7)] : true,
             [utils.asGridCoord(-9,7)] : true,
             [utils.asGridCoord(-10,7)] : true,
             [utils.asGridCoord(-11,7)] : true,
             [utils.asGridCoord(-12,7)] : true,
             [utils.asGridCoord(-13,7)] : true,
             [utils.asGridCoord(-14,7)] : true,
             [utils.asGridCoord(-15,7)] : true,

            [utils.asGridCoord(-16,6)] : true,
            [utils.asGridCoord(-16,5)] : true,
            [utils.asGridCoord(-16,4)] : true,
            [utils.asGridCoord(-16,3)] : true,

            [utils.asGridCoord(-15,2)] : true,
            [utils.asGridCoord(-14,2)] : true,
            [utils.asGridCoord(-13,2)] : true,
            [utils.asGridCoord(-12,2)] : true,
            [utils.asGridCoord(-11,2)] : true,
            [utils.asGridCoord(-10,2)] : true,
            [utils.asGridCoord(-9,2)] : true,
            [utils.asGridCoord(-8,2)] : true,
            [utils.asGridCoord(-7,2)] : true,
            [utils.asGridCoord(-6,2)] : true,
            [utils.asGridCoord(-5,2)] : true,
            [utils.asGridCoord(-4,2)] : true,
            [utils.asGridCoord(-3,2)] : true,

            [utils.asGridCoord(-6,3)] : true,
            [utils.asGridCoord(-5,3)] : true,
            [utils.asGridCoord(-4,3)] : true,

            //------------------------------------------//

            // Quarto dos ovos
            //------------------------------------------//

            [utils.asGridCoord(-13,17)] : true,
            [utils.asGridCoord(-13,16)] : true,
            [utils.asGridCoord(-13,15)] : true,
            [utils.asGridCoord(-13,14)] : true,
            [utils.asGridCoord(-13,13)] : true,
            [utils.asGridCoord(-13,12)] : true,

            [utils.asGridCoord(-13,20)] : true,
            [utils.asGridCoord(-13,21)] : true,
            [utils.asGridCoord(-13,22)] : true,
            [utils.asGridCoord(-13,23)] : true,
            [utils.asGridCoord(-13,24)] : true,

            [utils.asGridCoord(-14,12)] : true,
            [utils.asGridCoord(-15,12)] : true,
            [utils.asGridCoord(-16,12)] : true,
            [utils.asGridCoord(-17,12)] : true,
            [utils.asGridCoord(-18,12)] : true,
            [utils.asGridCoord(-19,12)] : true,
            [utils.asGridCoord(-20,12)] : true,
            [utils.asGridCoord(-21,12)] : true,
            [utils.asGridCoord(-22,12)] : true,
            [utils.asGridCoord(-23,12)] : true,
            [utils.asGridCoord(-24,12)] : true,
            [utils.asGridCoord(-25,12)] : true,
            [utils.asGridCoord(-26,12)] : true,
            [utils.asGridCoord(-27,12)] : true,

            [utils.asGridCoord(-28,12)] : true,
            [utils.asGridCoord(-28,13)] : true,
            [utils.asGridCoord(-28,14)] : true,
            [utils.asGridCoord(-28,15)] : true,
            [utils.asGridCoord(-28,16)] : true,
            [utils.asGridCoord(-28,17)] : true,
            [utils.asGridCoord(-28,18)] : true,
            [utils.asGridCoord(-28,19)] : true,
            [utils.asGridCoord(-28,20)] : true,
            [utils.asGridCoord(-28,21)] : true,
            [utils.asGridCoord(-28,22)] : true,
            [utils.asGridCoord(-28,23)] : true,

            [utils.asGridCoord(-14,15)] : true,
            [utils.asGridCoord(-15,15)] : true,
            [utils.asGridCoord(-16,15)] : true,
            [utils.asGridCoord(-17,15)] : true,
            [utils.asGridCoord(-18,15)] : true,
            [utils.asGridCoord(-19,15)] : true,
            [utils.asGridCoord(-20,15)] : true,
            [utils.asGridCoord(-21,15)] : true,
            [utils.asGridCoord(-22,15)] : true,
            [utils.asGridCoord(-23,15)] : true,
            [utils.asGridCoord(-24,15)] : true,
            [utils.asGridCoord(-25,15)] : true,
            [utils.asGridCoord(-26,15)] : true,
            [utils.asGridCoord(-27,15)] : true,

            [utils.asGridCoord(-27,16)] : true,
            [utils.asGridCoord(-27,17)] : true,
            [utils.asGridCoord(-27,18)] : true,
            [utils.asGridCoord(-27,19)] : true,
            [utils.asGridCoord(-27,20)] : true,
            [utils.asGridCoord(-27,21)] : true,
            [utils.asGridCoord(-27,22)] : true,
            [utils.asGridCoord(-27,23)] : true,

            [utils.asGridCoord(-26,23)] : true,
            [utils.asGridCoord(-26,18)] : true,
            [utils.asGridCoord(-26,19)] : true,
            [utils.asGridCoord(-26,20)] : true,

            [utils.asGridCoord(-15,20)] : true,
            [utils.asGridCoord(-15,21)] : true,
            [utils.asGridCoord(-15,22)] : true,
            [utils.asGridCoord(-15,23)] : true,
            [utils.asGridCoord(-14,20)] : true,
            [utils.asGridCoord(-14,21)] : true,
            [utils.asGridCoord(-14,22)] : true,
            [utils.asGridCoord(-14,23)] : true,

            //------------------------------------------//

            // Parede acima dos quartos dos ovos
            //------------------------------------------//

            [utils.asGridCoord(-28,10)] : true,
            [utils.asGridCoord(-28,11)] : true,

            //------------------------------------------//

            // Quarto da costura
            //------------------------------------------//

            [utils.asGridCoord(-27,8)] : true,
            [utils.asGridCoord(-27,9)] : true,
            [utils.asGridCoord(-27,10)] : true,

            [utils.asGridCoord(-27,5)] : true,
            [utils.asGridCoord(-27,4)] : true,
            [utils.asGridCoord(-27,3)] : true,

            [utils.asGridCoord(-41,10)] : true,
            [utils.asGridCoord(-40,10)] : true,
            [utils.asGridCoord(-39,10)] : true,
            [utils.asGridCoord(-38,10)] : true,
            [utils.asGridCoord(-37,10)] : true,
            [utils.asGridCoord(-36,10)] : true,
            [utils.asGridCoord(-35,10)] : true,
            [utils.asGridCoord(-34,10)] : true,
            [utils.asGridCoord(-33,10)] : true,
            [utils.asGridCoord(-32,10)] : true,
            [utils.asGridCoord(-31,10)] : true,
            [utils.asGridCoord(-30,10)] : true,
            [utils.asGridCoord(-29,10)] : true,

            [utils.asGridCoord(-41,9)] : true,
            [utils.asGridCoord(-41,8)] : true,
            [utils.asGridCoord(-41,7)] : true,
            [utils.asGridCoord(-41,6)] : true,
            [utils.asGridCoord(-41,5)] : true,
            [utils.asGridCoord(-41,4)] : true,
            [utils.asGridCoord(-41,3)] : true,
            [utils.asGridCoord(-41,2)] : true,
            [utils.asGridCoord(-41,1)] : true,
            [utils.asGridCoord(-41,0)] : true,

            [utils.asGridCoord(-40,3)] : true,
            [utils.asGridCoord(-39,3)] : true,
            [utils.asGridCoord(-38,3)] : true,

            [utils.asGridCoord(-37,2)] : true,
            [utils.asGridCoord(-36,2)] : true,
            [utils.asGridCoord(-35,2)] : true,
            [utils.asGridCoord(-34,2)] : true,
            [utils.asGridCoord(-33,2)] : true,

            [utils.asGridCoord(-32,3)] : true,
            [utils.asGridCoord(-31,3)] : true,
            [utils.asGridCoord(-30,3)] : true,
            [utils.asGridCoord(-29,3)] : true,
            [utils.asGridCoord(-28,3)] : true,

            [utils.asGridCoord(-30,4)] : true,
            [utils.asGridCoord(-29,4)] : true,

            [utils.asGridCoord(-40,5)] : true,
            [utils.asGridCoord(-40,6)] : true,
            [utils.asGridCoord(-40,7)] : true,
            [utils.asGridCoord(-40,8)] : true,

            [utils.asGridCoord(-30,8)] : true,
            [utils.asGridCoord(-29,8)] : true,
            [utils.asGridCoord(-30,9)] : true,
            [utils.asGridCoord(-29,9)] : true,

            //------------------------------------------//

            // Parede para o acesso a cozinha
            //------------------------------------------//

            [utils.asGridCoord(-26,2)] : true,
            [utils.asGridCoord(-25,2)] : true,
            [utils.asGridCoord(-24,2)] : true,
            [utils.asGridCoord(-23,2)] : true,
            //[utils.asGridCoord(-22,2)] : true, // colisao da porta
            //[utils.asGridCoord(-21,2)] : true, // colisao da porta
            [utils.asGridCoord(-20,2)] : true,
            [utils.asGridCoord(-19,2)] : true,
            [utils.asGridCoord(-18,2)] : true,
            [utils.asGridCoord(-17,2)] : true,

            //------------------------------------------//

            // Cozinha
            //------------------------------------------//

            [utils.asGridCoord(-25,0)] : true,
            [utils.asGridCoord(-25,-1)] : true,
            [utils.asGridCoord(-25,-2)] : true,
            [utils.asGridCoord(-25,-3)] : true,
            [utils.asGridCoord(-25,-4)] : true,
            [utils.asGridCoord(-25,-5)] : true,
            [utils.asGridCoord(-25,-6)] : true,
            [utils.asGridCoord(-25,-7)] : true,
            [utils.asGridCoord(-25,-8)] : true,

            [utils.asGridCoord(-24,-5)] : true,
            [utils.asGridCoord(-23,-5)] : true,
            [utils.asGridCoord(-22,-5)] : true,
            [utils.asGridCoord(-21,-5)] : true,
            [utils.asGridCoord(-20,-5)] : true,
            [utils.asGridCoord(-19,-5)] : true,
            [utils.asGridCoord(-18,-5)] : true,
            [utils.asGridCoord(-17,-5)] : true,
            [utils.asGridCoord(-16,-5)] : true,
            [utils.asGridCoord(-15,-5)] : true,
            [utils.asGridCoord(-14,-5)] : true,
            [utils.asGridCoord(-13,-5)] : true,
            [utils.asGridCoord(-12,-5)] : true,
            [utils.asGridCoord(-11,-5)] : true,

            [utils.asGridCoord(-13,-4)] : true,
            [utils.asGridCoord(-13,-3)] : true,
            [utils.asGridCoord(-13,-2)] : true,

            [utils.asGridCoord(-12,-1)] : true,
            [utils.asGridCoord(-11,-1)] : true,

            [utils.asGridCoord(-24,1)] : true,
            [utils.asGridCoord(-23,1)] : true,
            //[utils.asGridCoord(-22,1)] : true, // Porta lado sala de costura
            //[utils.asGridCoord(-21,1)] : true, // Porta lado sala de costura
            [utils.asGridCoord(-20,1)] : true,
            [utils.asGridCoord(-19,1)] : true,
            [utils.asGridCoord(-18,1)] : true,
            [utils.asGridCoord(-17,1)] : true,
            [utils.asGridCoord(-16,1)] : true,
            [utils.asGridCoord(-15,1)] : true,
            [utils.asGridCoord(-14,1)] : true,
            [utils.asGridCoord(-13,1)] : true,
            [utils.asGridCoord(-12,1)] : true,
            [utils.asGridCoord(-11,1)] : true,

            [utils.asGridCoord(-10,0)] : true,

            //------------------------------------------//

            // Mercado
            //------------------------------------------//

            [utils.asGridCoord(0,4)] : true,
            [utils.asGridCoord(7,4)] : true,
            [utils.asGridCoord(8,4)] : true,

            [utils.asGridCoord(0,3)] : true,
            [utils.asGridCoord(1,3)] : true,
            [utils.asGridCoord(2,3)] : true,
            [utils.asGridCoord(3,3)] : true,
            [utils.asGridCoord(4,3)] : true,
            [utils.asGridCoord(5,3)] : true,
            [utils.asGridCoord(6,3)] : true,
            [utils.asGridCoord(7,3)] : true,

            [utils.asGridCoord(13,3)] : true,
            [utils.asGridCoord(14,3)] : true,

            //------------------------------------------//

            // Quarto superior
            //------------------------------------------//

            [utils.asGridCoord(1,1)] : true,
            [utils.asGridCoord(2,1)] : true,
            [utils.asGridCoord(3,1)] : true,
            [utils.asGridCoord(4,1)] : true,
            [utils.asGridCoord(5,1)] : true,
            [utils.asGridCoord(6,1)] : true,
            [utils.asGridCoord(7,1)] : true,
            [utils.asGridCoord(8,1)] : true,
            [utils.asGridCoord(9,1)] : true,
            //[utils.asGridCoord(10,1)] : true, // Porta lado mercado
            //[utils.asGridCoord(11,1)] : true, // Porta lado mercado
            [utils.asGridCoord(12,1)] : true,
            [utils.asGridCoord(13,1)] : true,
            [utils.asGridCoord(14,1)] : true,

            [utils.asGridCoord(14,0)] : true,
            [utils.asGridCoord(14,-1)] : true,
            [utils.asGridCoord(14,-2)] : true,
            [utils.asGridCoord(14,-3)] : true,
            [utils.asGridCoord(14,-4)] : true,
            [utils.asGridCoord(14,-5)] : true,
            [utils.asGridCoord(14,-6)] : true,
            [utils.asGridCoord(14,-7)] : true,
            [utils.asGridCoord(14,-8)] : true,

            [utils.asGridCoord(1,0)] : true,
            [utils.asGridCoord(1,-1)] : true,
            [utils.asGridCoord(1,-2)] : true,
            [utils.asGridCoord(1,-3)] : true,
            [utils.asGridCoord(1,-4)] : true,
            [utils.asGridCoord(1,-5)] : true,
            [utils.asGridCoord(1,-6)] : true,
            [utils.asGridCoord(1,-7)] : true,
            [utils.asGridCoord(1,-8)] : true,

            [utils.asGridCoord(2,-6)] : true,
            [utils.asGridCoord(3,-6)] : true,
            [utils.asGridCoord(4,-6)] : true,
            [utils.asGridCoord(5,-6)] : true,
            [utils.asGridCoord(6,-6)] : true,
            [utils.asGridCoord(7,-6)] : true,
            [utils.asGridCoord(8,-6)] : true,
            [utils.asGridCoord(9,-6)] : true,
            [utils.asGridCoord(10,-6)] : true,
            [utils.asGridCoord(11,-6)] : true,

            [utils.asGridCoord(2,-5)] : true,
            [utils.asGridCoord(3,-5)] : true,
            [utils.asGridCoord(11,-5)] : true,
            [utils.asGridCoord(12,-5)] : true,
            [utils.asGridCoord(13,-5)] : true,

            //------------------------------------------//

            // Sofa sala
            //------------------------------------------//
        
            [utils.asGridCoord(-4,21)] : true,
            [utils.asGridCoord(-3,21)] : true,

            [utils.asGridCoord(0,20)] : true,
            [utils.asGridCoord(0,21)] : true,
            [utils.asGridCoord(0,22)] : true,
            [utils.asGridCoord(1,20)] : true,
            [utils.asGridCoord(1,21)] : true,
            [utils.asGridCoord(1,22)] : true,

            [utils.asGridCoord(-8,20)] : true,
            [utils.asGridCoord(-8,21)] : true,
            [utils.asGridCoord(-8,22)] : true,
            [utils.asGridCoord(-7,20)] : true,
            [utils.asGridCoord(-7,21)] : true,
            [utils.asGridCoord(-7,22)] : true,

            [utils.asGridCoord(-5,23)] : true,
            [utils.asGridCoord(-4,23)] : true,
            [utils.asGridCoord(-3,23)] : true,
            [utils.asGridCoord(-2,23)] : true,

            //------------------------------------------//
            
        },
        // Espaços em que acontece cutscenes
        cutsceneSpaces: {
            [utils.asGridCoord(18,8)] : [
                {
                    events: [
                        {type: "changeMap", map: "Fazenda"},
                    ]
                }
            ]
        }
    },
    // Mapa da parte da fazenda
    Fazenda: { // mapa
        lowerSrc: "./assets/img/fazendaMapa.png", // layer de base do mapa (chão do mapa)
        upperSrc: "", // layer superior do mapa (se precisa de algo acima do player)
        configObjects: { // define os personagens/objetos que o mapa vai ter
            hero: ({ // personagem principal
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(3),
                y: utils.withGrid(5),
            }),
            galinhaMarrom: {
                type: "Person",
                x: utils.withGrid(8),
                y: utils.withGrid(5),
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
            }
        },
        walls: {
            //define as coordenadas das colisoes do mapa
        },
        // Espaços em que acontece cutscenes
        cutsceneSpaces: {
            [utils.asGridCoord(19,8)] : [
                {
                    events: [
                        {type: "changeMap", map: "Galinheiro"},
                    ]
                }
            ]
        }
    } 
}
