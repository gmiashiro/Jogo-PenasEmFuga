class Sprite { //animações
    constructor (config) {

        // Definir a imagem
        this.image = new Image();
        this.image.src = config.src;
        this.image.onload = () => {
            this.isLoaded = true;
        }

        // Sombras
        this.shadow = new Image();
        this.useShadow = true; //config.useShadow || false
        if(this.useShadow){ // se useShadow for true, apresenta o png da sombra
            this.shadow.src = "./assets/img/sombraPinguim.png"; //colocar aqui a imagem da sombra
        }
        this.shadow.onload = () => {
            this.isShadowLoaded = true;
        }

        //Configura Animação e o Estado inicial
        this.animations = config.animations || {
            "idle-right" : [ [1,3] ],
            "idle-up"    : [ [1,1] ],
            "idle-down"  : [ [1,2] ],
            "idle-left"  : [ [1,0] ],
            "walk-right" : [ [0,3],[1,3],[2,3],[3,3], ],
            "walk-up"    : [ [0,1],[1,1],[2,1],[3,1], ],
            "walk-down"  : [ [0,2],[1,2],[2,2],[3,2], ],
            "walk-left"  : [ [0,0],[1,0],[2,0],[3,0], ]
        }
        this.currentAnimation = config.currentAnimation || "walk-up";
        //config.currentAnimation || "idle-down";
        this.currentAnimationFrame = 0;

        this.animationFrameLimit = config.animationFrameLimit || 10; // Define quantos ticks cada frame da animação deve durar
        this.animationFrameProgress = this.animationFrameLimit; // contador

        this.isFrog = config.isFrog || false;
        this.isEasterEgg = config.isEasterEgg || false; // Para saber se é um easter egg

        //Referencia aos objetos do jogo
        this.gameObject = config.gameObject;
    }

    get frame(){ // retorna o frame atual da animação 
        return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }

    setAnimation(key){
        if(this.currentAnimation !== key){
            this.currentAnimation = key;
            this.currentAnimationFrame = 0;
            this.animationFrameProgress = this.animationFrameLimit;
        }
    }

    updateAnimationProgress() { // responsável por avançar a animação frame a frame. 
        // Downtick frame progresso 
        if(this.animationFrameProgress > 0){
            this.animationFrameProgress -= 1;
            return;
        }

        // resetar o contador
        this.animationFrameProgress = this.animationFrameLimit;
        this.currentAnimationFrame += 1;

        if(this.frame === undefined){ 
            this.currentAnimationFrame = 0;
        }
        // Se o currentAnimationFrame ultrapassar o número de frames na animação, ele é resetado para 0, fazendo a animação repetir
    }

    draw(ctx, cameraPerson){
        let x, y;
        console.log(this.isFrog);
        // Calcula a posição X e Y real no canvas, levando em conta a posição do gameObject
        if (this.isFrog) { // Se for o sapo, ele, por ser 16x16, é calculado diferente
            x = this.gameObject.x - (-16) + utils.withGrid(8) - cameraPerson.x;
            y = this.gameObject.y - 16 + utils.withGrid(5) - cameraPerson.y;
        } else {
            x = this.gameObject.x - (-9) + utils.withGrid(8) - cameraPerson.x;
            y = this.gameObject.y - 32 + utils.withGrid(5) - cameraPerson.y;
        }

        if (!this.isFrog) { // Se não for um sapo, pode colocar a sombra
            this.isShadowLoaded && ctx.drawImage(this.shadow, x, y); // Se a sombra estiver carregada, ela é desenhada nas coordenadas calculadas
        }

        const[frameX, frameY] = this.frame; // Obtém as coordenadas (x,y) do frame atual da animação

        if (this.isFrog) { // Se for o sapo, é 16x16
            this.isLoaded && ctx.drawImage(this.image,
                frameX * 16, frameY * 16,
                16,16,
                x,y,
                16,16
                // especificam onde e com que tamanho o frame cortado será desenhado no canvas.
            )
        } else if (this.isEasterEgg) { // Se for um easter egg, ele não é animado
            console.log("é um easter egg uai");
            this.isLoaded && ctx.drawImage(this.image, x, y, 32, 32);
        } else {
            this.isLoaded && ctx.drawImage(this.image,
                frameX * 32, frameY * 32,
                32,32,
                // especificam a parte da imagem original a ser cortada (um frame de 32x32 pixels dentro da spritesheet)
                x,y,
                32,32
                // especificam onde e com que tamanho o frame cortado será desenhado no canvas.
            )
        }

        this.updateAnimationProgress(); // Chama o método para avançar o progresso da animação, garantindo que o próximo frame seja preparado para o próximo ciclo de desenho
    }
}