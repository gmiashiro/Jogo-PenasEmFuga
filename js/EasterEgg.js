class EasterEgg extends GameObject {
    constructor(config, state = {}){
        super(config);
        this.name = config.name; 
        this.description = config.description;
        this.mapName = config.mapName;
        this.src = config.src;

        this.gifs = {
            "pintinhos": "./assets/img/easterEgg/gifs/testeEasterEgg.gif",
        }

    }

    playGif(easterEggName) {
        if(document.getElementById("gif-screen"))return; 

        const EasterEggGif = document.createElement("div");
        EasterEggGif.id = "gif-screen";

        const gif = document.createElement("img");
        gif.src = this.gifs[easterEggName];
        EasterEggGif.appendChild(gif);

        document.querySelector(".game-container").appendChild(EasterEggGif);
        setTimeout(() => {
            EasterEggGif.classList.add("fade-out");
            EasterEggGif.addEventListener("animationend", () => { 
                EasterEggGif.remove();// Caso acabe o fade-out, remove o elemento;
            }, {once: true})
        }, 4500);
    }

}
