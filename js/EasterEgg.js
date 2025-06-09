class EasterEgg extends GameObject {
    constructor(config, state = {}){
        super(config);
        this.name = config.name;
        this.description = config.description;
        this.mapName = config.mapName;
        this.src = config.src;
    }

    playGif() {
        if(document.getElementById("gif-screen"))return; 

        const EasterEggGif = document.createElement("div");
        EasterEggGif.id = "gif-screen";

        const gif = document.createElement("img");
        gif.src = "./assets/img/easterEggGifs/testeEasterEgg.gif";
        EasterEggGif.appendChild(gif);

        // const closeBtn = document.createElement("button");
        // closeBtn.innerText = "Fechar";
        // closeBtn.style.marginTop = "16px";
        // closeBtn.onclick = () => EasterEggGif.remove();
        // EasterEggGif.appendChild(closeBtn);

        document.querySelector(".game-container").appendChild(EasterEggGif);
        setTimeout(() => {
            EasterEggGif.classList.add("fade-out");
            EasterEggGif.addEventListener("animationend", () => { 
                EasterEggGif.remove();// Caso acabe o fade-out, remove o elemento;
            }, {once: true})
            //EasterEggGif.classList.remove("fade-out");
        }, 6000);
    }

}

// APENAS PARA O FUNCIONAMENTO DO BOTÃO DE TESTE -> SERÁ RETIRADO
function playGif() {
    if(document.getElementById("gif-screen"))return; 

    const EasterEggGif = document.createElement("div");
    EasterEggGif.id = "gif-screen";

    const gif = document.createElement("img");
    gif.src = "./assets/img/easterEggGifs/testeEasterEgg.gif";
    EasterEggGif.appendChild(gif);

    // const closeBtn = document.createElement("button");
    // closeBtn.innerText = "Fechar";
    // closeBtn.style.marginTop = "16px";
    // closeBtn.onclick = () => EasterEggGif.remove();
    // EasterEggGif.appendChild(closeBtn);

    document.querySelector(".game-container").appendChild(EasterEggGif);
    setTimeout(() => {
        EasterEggGif.classList.add("fade-out");
        EasterEggGif.addEventListener("animationend", () => { 
            EasterEggGif.remove();// Caso acabe o fade-out, remove o elemento;
        }, {once: true})
        //EasterEggGif.classList.remove("fade-out");
    }, 8000);
}
