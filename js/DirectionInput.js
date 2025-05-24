class DirectionInput {
    constructor() {
        this.heldDirections = []; // armazena as direções que o usuário está pressionando

        this.map = { // mapeia as teclas que o jogador pressiona
            "ArrowUp": "up",
            "KeyW": "up",
            "ArrowDown": "down",
            "KeyS": "down",
            "ArrowLeft": "left",
            "KeyA": "left",
            "ArrowRight": "right",
            "KeyD": "right",
        }
    }

    get direction() {
        return this.heldDirections[0]; //retorna o primeiro elemento do array, representa a direção mais recente que o jogador pressiona
                                       //se nenhuma tecla estiver pressionada o array fica vazio
    }

    init(){
        document.addEventListener("keydown", e => { // 'e' representa qual tecla foi pressionada
            const dir = this.map[e.code];
            if(dir && this.heldDirections.indexOf(dir) == -1){ // Se dir tem um valor (ou seja, a tecla pressionada foi mapeada para uma direção)
                this.heldDirections.unshift(dir);              // Se a direção (dir) ainda não está presente no array
            }                                                  // O método indexOf() retorna o índice da primeira ocorrência de um elemento no array, ou -1 se o elemento não for encontrado
        });
        document.addEventListener("keyup", e => {
            const dir = this.map[e.code];
            const index = this.heldDirections.indexOf(dir); // procura o índice da direção (dir) no array this.heldDirections
            if(index > -1){ 
                this.heldDirections.splice(index, 1); // remove o segundo elemento do array, a partir do index encontrado
            }
        })
    }
}	

// testando a branch