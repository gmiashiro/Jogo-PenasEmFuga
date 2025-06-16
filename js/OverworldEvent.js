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
        Object.values(this.map.gameObjects).forEach(async obj => { // Passa por todos os objetos do mapa
            if (obj.id === who) { //  Se achar o easter egg dentre os objetos
                await obj.playGif(obj.id);
                utils.emitEvent("EasterEggWasFound", { // emite um sinal que foi encontrado um easter egg!
                    whoId: obj.name  // manda quem foi achado
                })
                utils.emitEvent("EasterEggWasFoundID", { // emite um sinal que foi encontrado um easter egg!
                    whoId: obj.id  // manda quem foi achado
                })
            }
        })
        resolve(); // Resolve o evento
    }

    addItemToPlayer(resolve) {
        // this.map.overworld é a referência para a instância principal da classe Overworld
        this.map.overworld.addItemToHotbar(this.event.item);
        
        // Resolve o evento para que a cutscene possa continuar, se houver mais eventos. 
        resolve();
    }

    toggleMusic(resolve) {
        const audioManager = this.map.overworld.audioManager;
        const newSong = this.event.song;

        // Se a música da área já estiver tocando, volte para a padrão.
        if (audioManager.currentAreaSong === newSong) {
            audioManager.resumeSoundtrack();
        } else {
            // Senão, toque a música da área.
            audioManager.playMusic(newSong);
        }
        resolve();
    }

    // Evento para progredir flags de quests
    questProgress(resolve) {
        const flag = this.event.flag;
        const state = this.map.overworld.playerState;

        // Verifica se o jogador já interagiu com este NPC antes
        if (!state.storyFlags[flag]) {
            // Se for a primeira vez, define a flag e atualiza o progresso
            state.storyFlags[flag] = true;

            if (this.event.counter) {
                const counterName = this.event.counter;
                if (!state.questFlags[counterName]) {
                    state.questFlags[counterName] = 0;
                }
                state.questFlags[counterName] += 1;
            }
    
            // Atualiza a HUD com o novo progresso
            this.map.overworld.hud.updateTasks(state.currentQuestId, state);
    
            // Verifica se a quest foi completada
            this.map.overworld.checkForQuestCompletion();
        }

        // Resolve o evento de qualquer maneira para a cutscene continuar
        resolve();
    }

    // OverworldEvent.js
    // ADICIONE O MÉTODO ABAIXO
    startPlanting(resolve) {
        this.map.overworld.plantingSystem.open(() => {
            resolve();
        });
    }

    textMessage(resolve) {
        // O bloco que fazia o NPC virar foi removido.

        // Cria a instância da caixa de diálogo
        const message = new TextMessage({
            text: this.event.text,
            npc: this.map.gameObjects[this.event.who] || this.map.gameObjects[this.event.faceHero],
            map: this.map,
            onComplete: () => {
                resolve(); // Resolve a promise quando a mensagem é fechada pelo jogador
            }
        });
        message.init(); // Inicia a exibição da mensagem
    }


    pinguimZoom(resolve) {
        const zoom = document.createElement("div");
        zoom.id = "zoom-screen";
        const zoomGif = document.createElement("img");
        zoomGif.src = this.event.who;
        zoom.appendChild(zoomGif);

        document.querySelector(".game-container").appendChild(zoom);

        setTimeout(() => {
            zoom.remove();// Caso acabe o fade-out, remove o elemento;
            resolve();
        }, 7600);

    }

    async entregarItem(resolve) {
        const { itemId, quantity, events_if_enough, events_if_not_enough } = this.event;
        const playerItems = this.map.overworld.playerState.items;

        // Verifica se o jogador tem o item na quantidade necessária
        const itemSlot = playerItems.findIndex(slot => slot && slot.name === itemId && slot.quantity >= quantity);

        if (itemSlot > -1) {
            // Se tiver, remove os itens
            playerItems[itemSlot].quantity -= quantity;
            if (playerItems[itemSlot].quantity <= 0) {
                playerItems[itemSlot] = null; // Remove o item se a quantidade for zero
            }
            this.map.overworld.hud.updateHotbarSlot(itemSlot, playerItems[itemSlot]);
            
            // Inicia a cutscene de sucesso
        await this.map.startCutscene(events_if_enough);
        } else {
            // Se não tiver, inicia a cutscene de falha
            await this.map.startCutscene(events_if_not_enough);
        }
        
        resolve();
    }

    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve) // this.event.type é o tipo de animação
        })
    }
}