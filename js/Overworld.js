class Overworld {
    constructor(config){
        this.element = config.element;
        this.canvas = this.element.querySelector(".game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.map = null;
        this.foundFrog2 = config.foundFrog2 || false;
        this.easterEggsFound = config.easterEggsFound || [];
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

    frogsFoundCheck() { // Serve para ver se foi encontrado um sapo
        document.addEventListener("FrogWasFound", e => {
            if (e.detail.whoId === "frog1" && this.map.name === "Galinheiro") {
                this.foundFrog1 = true;
            }
            if (e.detail.whoId === "frog2" && this.map.name === "Galinheiro") {
                this.foundFrog2 = true;
            }
            if (e.detail.whoId === "frog3" && this.map.name === "Galinheiro") {
                this.foundFrog3 = true;
            }
        })
    }

    easterEggsFoundCheck() {
        document.addEventListener("EasterEggWasFound", e => {
            this.easterEggsFound.push(e.detail.whoId);
        })
    }

    startMap(mapConfig) {
        this.frogsFoundCheck(); // Ve se os sapos já foram encontrados
        this.easterEggsFoundCheck();
        this.map = new OverworldMap(mapConfig, { // Passa os valores de foundFrog
            foundFrog1: this.foundFrog1,
            foundFrog2: this.foundFrog2,
            foundFrog3: this.foundFrog3,
            easterEggsFound: this.easterEggsFound,
        });
        this.map.overworld = this;
        
        this.map.mountObjects();
    }

    init() {

        this.hud = new Hud();
        this.hud.init(document.querySelector(".game-container"));

        this.startMap(window.OverworldMaps.Galinheiro);

        this.directionInput = new DirectionInput(); // gerencia as entradas do teclado para o movimento do personagem
        this.directionInput.init();
        //this.directionInput.direction;

        this.bindHeroPositionCheck();

        this.startGameLoop(); // inicia o loop principal do jogo

        // --- EXEMPLO: Simulação de ganho de moedas a cada 1 segundo ---
        // (Remova isso depois e chame 'this.hud.updateCoins' quando o jogador realmente ganhar moedas)
        this.coins = 0;
        setInterval(() => {
            this.coins += 1; // Adiciona 1 moeda
            this.hud.updateCoins(this.coins); // Atualiza a HUD
            console.log("Moedas atualizadas:", this.coins);
        }, 1000); // A cada 1 segundos

        this.level = 0;
        setInterval(() => {
            this.level += 1; // Sobe de nível
            this.hud.updateLevel(this.level); // Atualiza a HUD
            console.log("Subiu de nível! Nível atual:", this.level);
        }, 5000); // A cada 5 segundos
        
    }
}