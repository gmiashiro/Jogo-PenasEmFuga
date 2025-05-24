class Person extends GameObject {
    constructor(config){
        super(config);
        this.movingProgressRemaining = 0; // controla o progresso de um movimento em pixels

        this.direction = "down"; // Define a direção inicial do personagem

        this.isPlayerControlled = config.isPlayerControlled || false; // indica se este personagem é controlado pelo jogador

        this.directionUpdate = {
            "up"   : ["y", -1],
            "down" : ["y",  1],
            "left" : ["x", -1],
            "right": ["x",  1],
        }
    }

    update(state){
        if(this.movingProgressRemaining > 0){ // Se o personagem ainda estiver em progresso de um movimento, chama updatePosition() para continuar o movimento
            this.updatePosition();
        } else {

            //Caso: 
            if(this.isPlayerControlled && state.arrow){ // Se o personagem é controlado pelo jogador e há uma entrada de direção (state.arrow), ele inicia um comportamento de "caminhada"
                this.startBehavior(state, {
                    type: "walk",
                    direction: state.arrow
                }) 
            }
            this.updateSprite(state); // Atualiza a animação do sprite com base no estado atual (parado ou andando)
        }
    }

    startBehavior(state, behavior){
        //define a direção do personagem para qualquer ele esteja
        this.direction = behavior.direction;
        if(behavior.type === "walk"){
            if(state.map.isSpaceTaken(this.x, this.y, this.direction)){ // Verifica se o próximo espaço na direção do movimento está ocupado por uma "parede". Se sim, o movimento é abortado
                return;
            }
            // Pronto para andar
            state.map.moveWall(this.x,this.y,this.direction);
            this.movingProgressRemaining = 16;
        }
    }

    updatePosition(){
        const [property,change] = this.directionUpdate[this.direction];
        this[property] += change;
        this.movingProgressRemaining -= 1;
    }

    updateSprite(){

        if(this.movingProgressRemaining > 0){ // Se o personagem estiver se movendo, ele define a animação de "walk" (caminhada) na direção atual
            this.sprite.setAnimation("walk-"+this.direction);
            return;
        }
        
        this.sprite.setAnimation("idle-"+this.direction); // Se o personagem não estiver se movendo, ele define a animação de "idle" (parado) na direção atual
        
    }
}

// apenas testando o git