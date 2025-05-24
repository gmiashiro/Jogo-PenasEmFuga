class GameObject {
    constructor (config, value, value2){
        this.isMounted = false; // indica se o objeto está montado no mapa do jogo
        this.x = config.x || 0; //define a posição horizontal (eixo X), se não tiver uma posição o valor será 0
        this.y = config.y || 0; //define a posição vertical (eixo Y), se não tiver uma posição o valor será 0
        this.direction = config.direction || "down"; // define a direção para qual o objeto está olhando, por padrão, para baixo
        this.sprite = new Sprite({
            gameObject: this, // herda todas as propriedades de GameObject
            src: config.src || "./assets/img/pingo.png", // Define o caminho da imagem. Se não tiver é usada a do caminho fornecido (no caso o personagem principal)

        }); 
    }

    mount(map){ // metodo responsável por montar o objeto no mapa
        //console.log("mouting")
        this.isMounted = true; // altera o estado para true, indicando que o objeto está ativo no mapa
        map.addWall(this.x,this.y); // metodo que pode criar uma parede, impedindo que outros objetos passem por ele
    }

    update(){

    }
}