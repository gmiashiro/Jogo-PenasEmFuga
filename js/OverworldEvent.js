// Classe com todos os eventos, como comportamentos, música, conversa, etc;
class OverworldEvent {
    constructor({map, event}) {
        this.map = map;
        this.event = event;
    }

    // cada tipo de evento que pode acontecer no mapa terá um método próprio
    // resolve = função que fala para o método que o evento em questão acabou. Lá em GameObjects o método doBehaviorLoop espera o método aqui se resolver
    
    stand(resolve) { 
        const who = this.map.gameObjects[this.event.who]; // pega o objeto do NPC
        who.startBehavior({
            map: this.map
        }, {
            type: "stand",  //tipo da animação
            direction: this.event.direction,  // direção da animação
            time: this.event.time // quanto tempo dura
        })

        const completeHandler = e => {
            if (e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonStandComplete", completeHandler)
    }

    walk(resolve) { 
        const who = this.map.gameObjects[this.event.who]; // pega o objeto do NPC
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",  //tipo da animação
            direction: this.event.direction,  // direção da animação
            retry: true  // serve para, se o player entrar na frente de um NPC quando ele estiver realizando uma animação, o NPC pare e tente continuar novamente depois de um delay
        })

        // Serve para ver se o NPC específico terminou o movimento. Se sim, resolve o evento
        const completeHandler = e => {
            if(e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler); // se acabou não precisa mais ficar escutando
                resolve();
            }
        }

        document.addEventListener("PersonWalkingComplete", completeHandler) // está escutando para saber se o movimento foi finalizado
    }

    changeMap(resolve) { // Método para mudar de mapa

        // Desativa os objetos 
        Object.values(this.map.gameObjects).forEach(obj => {
            obj.isMounted = false;
        })

        const sceneTransition = new SceneTransition(); // sceneTransition é uma instância da classe SceneTransition
        sceneTransition.init(document.querySelector(".game-container"), () => { // Começa a transição de mapa
            this.map.overworld.startMap(window.OverworldMaps[this.event.map]); // Muda de mapa
            resolve();
            sceneTransition.fadeOut(); // Tira a cor sólida da tela e mostra o novo mapa
        });
    }

    foundFrog(resolve) {  // Evento caso o player tenha achado um sapo (galinha da montanha)
        const who = this.event.who; // pega o objeto do NPC
        //console.log(who);
        Object.values(this.map.gameObjects).forEach(obj => { // Passa por todos os objetos do mapa
            if (obj.id === who) { //  Se achar o sapo dentre os objetos
                switch (obj.id) { // Muda o local dos sapos para o pet shop
                    case "frog1":
                        obj.x = utils.withGrid(19);
                        obj.y = utils.withGrid(4);
                        break;
                    case "frog2":
                        obj.x = utils.withGrid(17);
                        obj.y = utils.withGrid(8);
                        break;
                    case "frog3":
                        obj.x = utils.withGrid(25);
                        obj.y = utils.withGrid(5);
                        break;
                }
                utils.emitEvent("FrogWasFound", { // emite um sinal que foi encontrado um sapo!
                    whoId: obj.id  // manda quem foi achado
                })
            }
        })
        resolve(); // Resolve o evento
    }

    async foundEasterEgg(resolve) {  // Evento caso o player tenha achado um easter egg
        const who = this.event.who; // pega o objeto do NPC
        //console.log(who);
        Object.values(this.map.gameObjects).forEach(async obj => { // Passa por todos os objetos do mapa
            if (obj.id === who) { //  Se achar o sapo dentre os objetos
                await obj.playGif(obj.id);
                utils.emitEvent("EasterEggWasFound", { // emite um sinal que foi encontrado um sapo!
                    whoId: obj.id  // manda quem foi achado
                })
            }
        })
        resolve(); // Resolve o evento
    }

    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve) // this.event.type é o tipo de animação
        })
    }
}