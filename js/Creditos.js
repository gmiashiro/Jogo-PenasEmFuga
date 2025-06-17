window.creditos_show = function() {
    // Evita múltiplos pop-ups
    if (document.getElementById("credits-overlay")) return;

    // Overlay escuro
    const overlay = document.createElement("div");
    overlay.id = "credits-overlay";

    // Pop-up de créditos
    const popup = document.createElement("div");
    popup.id = "credits-popup";

    // Botão de fechar
    const closeBtn = document.createElement("button");
    closeBtn.id = "credits-close-btn";
    closeBtn.innerText = "Fechar";
    closeBtn.onclick = () => overlay.remove();
    popup.appendChild(closeBtn);

    // Lista de desenvolvedores (adicione os seus aqui)
    const devs = [
        { nome: "Danilo R. Toriy", foto: "./../assets/img/milho.png", github: "https://github.com/Danilo-Toriy", linkedin: ""  },
        { nome: "Gabriel Miashiro ", foto: "./../assets/img/milho.png", github: "https://github.com/gmiashiro", linkedin: ""  },
        { nome: "Laura Vitória", foto: "./../assets/img/milho.png", github: "https://github.com/vitoria-la", linkedin: ""  },
        { nome: "Matheus Previato", foto: "./../assets/img/milho.png", github: "https://github.com/Matheus-Previato", linkedin: "" },
        { nome: "Murilo", foto: "./../assets/img/milho.png", github: "https://github.com/MuriloTK", linkedin: "" }
    ];

    devs.forEach(dev => {
        const card = document.createElement("div");
        card.className = "credits-card";

        const img = document.createElement("img");
        img.src = dev.foto;
        img.alt = dev.nome;
        img.className = "credits-foto";

        const nome = document.createElement("strong");
        nome.innerText = dev.nome;
        nome.className = "credits-nome";

        const githubBtn = document.createElement("a");
        githubBtn.href = dev.github;
        githubBtn.target = "_blank";
        githubBtn.className = "credits-link github";

        const githubIcon = document.createElement("img");
        githubIcon.src = "./../assets/img/github-logo.png"; // Caminho para o ícone do GitHub
        githubIcon.className = "github-img"; 

        const linkedinBtn = document.createElement("a");
        linkedinBtn.href = dev.linkedin;
        linkedinBtn.target = "_blank";
        linkedinBtn.className = "credits-link linkedin";

        const linkedinIcon = document.createElement("img");
        linkedinIcon.src = "./../assets/img/linkedin-logo.png"; // Caminho para o ícone do LinkedIn
        linkedinIcon.className = "linkedin-img";

        githubBtn.appendChild(githubIcon);
        linkedinBtn.appendChild(linkedinIcon);

        card.appendChild(img);
        card.appendChild(nome);
        card.appendChild(githubBtn);
        card.appendChild(linkedinBtn);

        popup.appendChild(card);
    });

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

}
