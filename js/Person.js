class Person extends GameObject {
    constructor(config) {
        super(config);
        this.movingProgressRemaining = 0; // controla o progresso de um movimento em pixels
        this.direction = "down"; // Define a direção inicial do personagem
        this.isStanding = false; // Para saber se um NPC está no meio de uma animação de ficar parado
        this.intentPosition = null; // Ou é nulo ou é uma coordenada [x,y] e trata-se da intenção que um NPC tem de se mover
        this.isPlayerControlled = config.isPlayerControlled || false; // indica se este personagem é controlado pelo jogador

        this.directionUpdate = {
            "up": ["y", -1],
            "down": ["y", 1],
            "left": ["x", -1],
            "right": ["x", 1],
        }

        // Propriedades para o sistema de diálogo
        this.talking = config.talking || [];

        this.isHorse = config.isHorse || false;
        if (this.isHorse) {
            this.direction = "right";
        }

        this.questIcon = null;

        this.haveQuestIcon = config.haveQuestIcon || false;
        this.isQuestIcon = config.isQuestIcon || false;
        this.isVisible = config.hasOwnProperty("isVisible") ? config.isVisible : true; // Se for false, ele respeita isso


        this.walkSoundEffect = new Audio(); // O efeito sonoro que o pinguim faz ao andar
    }

    update(state) {
        if (this.movingProgressRemaining > 0) {
            this.updatePosition();
            if (this.questIcon && this.questIcon.isVisible) { // Se esse NPC tiver um questIcon, move ele junto com o NPC
                this.questIcon.x = this.x;
                this.questIcon.y = this.y - utils.withGrid(2);
            }
        } else {
            //Caso o jogador esteja se movendo
            if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
                this.walkSoundEffect.startWalkingSound();
                this.startBehavior(state, {
                    type: "walk",
                    direction: state.arrow
                })
            }
            this.updateSprite(state);

            // ADICIONE ESTE BLOCO DE VOLTA PARA REATIVAR A INTERAÇÃO
            if (this.isPlayerControlled) {
                this.checkForNpcInteraction(state);
            }
        }
    }

    startBehavior(state, behavior) {
        if (!this.isMounted) {
            return;
        }

        //define a direção do personagem para qualquer ele esteja
        this.direction = behavior.direction;
        
        if (behavior.type === "walk") {
            if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
                this.walkSoundEffect.stopWalkingSound();
                behavior.retry && setTimeout(() => {
                    this.startBehavior(state, behavior);
                }, 10)
                return;
            }
            
            this.movingProgressRemaining = 16;
            
            const intentPosition = utils.nextPosition(this.x, this.y, this.direction);
            this.intentPosition = [
                intentPosition.x,
                intentPosition.y,
            ]

            this.updateSprite(state);
        }

        if (behavior.type === "stand") {
            this.isStanding = true;
            setTimeout(() => {
                utils.emitEvent("PersonStandComplete", {
                    whoId: this.id
                })
                this.isStanding = false;
            }, behavior.time)
        }
    }

    updatePosition() {
        const [property, change] = this.directionUpdate[this.direction];
        this[property] += change;
        this.movingProgressRemaining -= 1;

        if (this.movingProgressRemaining === 0) {
            this.intentPosition = null;
            if (this.isPlayerControlled) {
                console.log(`Posição do Herói: x=${this.x/ 16}, y=${this.y/ 16}`);
            }
            utils.emitEvent("PersonWalkingComplete", {
                whoId: this.id
            });
            this.walkSoundEffect.stopWalkingSound();
        }
    }

    updateSprite() {
        if (this.movingProgressRemaining > 0) {
            this.sprite.setAnimation("walk-" + this.direction);
            return;
        }
        this.sprite.setAnimation("idle-" + this.direction);
    }    // Sistema unificado de interação para NPCs e pontos de plantação
    
    checkForNpcInteraction(state) {
        // Obtém todos os objetos interativos do mapa (NPCs e PlantableSpots)
        // Isso permite que o mesmo sistema de interação funcione para ambos os tipos
        let interactables = Object.values(state.map.gameObjects).filter(obj => {
            return !obj.isPlayerControlled && (obj instanceof Person || obj instanceof PlantableSpot);
        });

        // Verifica se o jogador está próximo a algum interativo
        let nearbyObject = null;

        for (let i = 0; i < interactables.length; i++) {
            let obj = interactables[i];
            // Calcula a distância entre o jogador e o objeto
            let distance = Math.abs(this.x - obj.x) + Math.abs(this.y - obj.y);

            // Se a distância for menor ou igual a 16 pixels (1 tile), considera como próximo
            if (distance <= utils.withGrid(1)) {
                nearbyObject = obj;
                break;
            }
        }

        // Se encontrou um objeto próximo, mostra o botão de interação
        if (nearbyObject && !state.map.isCutscenePlaying) {
            this.showInteractionButton(nearbyObject, state.map);
        } else {
            // Se não encontrou ou está em cutscene, esconde o botão
            this.hideInteractionButton();
        }
    }

    showInteractionButton(npc, map) {
        if (!this.interactionButton) {
            this.interactionButton = document.createElement("div");
            this.interactionButton.classList.add("interaction-button");
            this.interactionButton.textContent = "E";
            document.querySelector(".game-container").appendChild(this.interactionButton);
        }

        // Posiciona o botão centralizado acima do NPC
        const cameraPerson = map.gameObjects.hero;

        // Centraliza horizontalmente e posiciona acima do sprite do NPC
        const x = npc.x - cameraPerson.x + utils.withGrid(1);

        // Posiciona o botão exatamente acima do sprite do NPC
        const y = npc.y - utils.withGrid(15) - cameraPerson.y + utils.withGrid(0);

        this.interactionButton.style.transform = `translate(${x}px, ${y}px)`;
        this.interactionButton.style.display = "block";

        // Armazena o NPC atual para interação
        this.currentInteractingNpc = npc;
    }

    hideInteractionButton() {
        if (this.interactionButton) {
            this.interactionButton.style.display = "none";
        }
        this.currentInteractingNpc = null;
    }
}