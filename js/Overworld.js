class Overworld {
    constructor(config){
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
    }

    startGameLoop() { // loop principal do jogo, responsável por atualizar e redesenhar tudo em cada quadro
        const step = () => {

            //Clear off the canvas
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height); // Limpa todo o canvas para desenhar o próximo

            //Estibiliza a camera no personagem
            const cameraPerson = this.map.gameObjects.hero;

            //Atualiza todos os objetos
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map,
                })
            })

            // Desenha a layer de baixo
            this.map.drawLowerImage(this.ctx, cameraPerson);

            //Desenha os objetos do jogo
            Object.values(this.map.gameObjects).sort((a, b) => {
                return a.y - b.y; // os personagens que estão mais ao norte vão renderizar primeiro
            }).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson);
            })

            // Desenha a layer de cima
            this.map.drawUpperImage(this.ctx, cameraPerson);
         
            requestAnimationFrame(() => {
                step();
            })
        }
        step();
    }

    bindHeroPositionCheck() {
        document.addEventListener("PersonWalkingComplete", e => {
            if (e.detail.whoId === "hero") {
                // Quer dizer que a posição do pinguim mudou
                this.map.checkForFootstepCutscene();
            }
        })
    }

    startMap(mapConfig) {
        this.map = new OverworldMap(mapConfig); 
        this.map.overworld = this;
        this.map.mountObjects();
    }

    init() {
        this.startMap(window.OverworldMaps.Galinheiro);

        this.directionInput = new DirectionInput(); // gerencia as entradas do teclado para o movimento do personagem
        this.directionInput.init();
        //this.directionInput.direction;

        this.bindHeroPositionCheck();

        this.startGameLoop(); // inicia o loop principal do jogo

        // 
        // this.map.startCutscene([
        //      {who: "galinhaBranca", type: "walk", direction: "right"},  
        //      {who: "galinhaBranca", type: "walk", direction: "right"},
        //      {who: "galinhaBranca", type: "walk", direction: "right"},
        //      {who: "galinhaBranca", type: "walk", direction: "right"},
        //      {who: "galinhaBranca", type: "walk", direction: "left"},  
        //      {who: "galinhaBranca", type: "walk", direction: "left"},
        //      {who: "galinhaBranca", type: "walk", direction: "left"}, 
        //      {who: "galinhaBranca", type: "walk", direction: "left"}, 
        // ])
        
    }
}