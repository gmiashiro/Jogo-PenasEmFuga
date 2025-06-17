class EasterEgg extends GameObject {
    constructor(config, state = {}){
        super(config);
        this.name = config.name; 
        this.description = config.description;
        this.mapName = config.mapName;
        this.src = config.src;

        this.gifs = {
            "pintinhos": "./assets/img/easterEggs/gifs/pintinhosG.gif",
            "galinhaDouradaEG": "./assets/img/easterEggs/gifs/galinhaDosOvosDouradosG.gif",
            "bolaPixar": "./assets/img/easterEggs/gifs/bolaPixarG.gif",
            "albumGalinha": "./assets/img/easterEggs/gifs/albumGalinhaPintadinhaG.gif",
            "baldePenas": "./assets/img/easterEggs/gifs/baldePenasG.gif",
            "aviao": "./assets/img/easterEggs/gifs/aviaoG.gif",
            "foto2": "./assets/img/easterEggs/gifs/foto2G.gif",
            "galinhaDaMontanha": "./assets/img/easterEggs/gifs/sapoG.gif",
            "cavaloEG": "./assets/img/easterEggs/gifs/cavaloG.gif",
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
