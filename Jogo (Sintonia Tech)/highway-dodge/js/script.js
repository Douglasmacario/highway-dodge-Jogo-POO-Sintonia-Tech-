
import { CarroJogador } from "./CarroJogador.js";
import { CarroInimigo } from "./CarroInimigo.js";
import { Jogo } from "./Jogo.js";
import { Garagem } from "./Garagem.js";
import { Som } from "./Som.js";

const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");

const jogo = new Jogo(canvas);
const garagem = new Garagem();
const jogador = new CarroJogador();
const som = new Som();

jogo.recorde = garagem.recorde;

// ELEMENTOS DO HTML
const telaInicial = document.getElementById("telaInicial");
const telaJogo = document.getElementById("telaJogo");
const telaGaragem = document.getElementById("telaGaragem");

const textoPontuacao = document.getElementById("pontuacao");
const textoRecorde = document.getElementById("recorde");
const textoPontosTotais = document.getElementById("pontosTotais");

const botaoJogar = document.getElementById("jogar");
const botaoIniciar = document.getElementById("iniciar");
const botaoReiniciar = document.getElementById("reiniciar");
const botaoVoltar = document.getElementById("voltarMenu");
const botaoAbrirGaragem = document.getElementById("abrirGaragem");
const botaoVoltarGaragem = document.getElementById("voltarGaragem");

const listaCarros = document.getElementById("listaCarros");
const teclas = {};

// CONFIGURAÇÕES
const FAIXAS = [90, 150, 210, 270];

const VELOCIDADE_INICIAL = 3.7;
const VELOCIDADE_MAXIMA = 7.5;
const INTERVALO_ACELERACAO = 500;
const AUMENTO_VELOCIDADE = 0.25;

// BÔNUS DE ULTRAPASSAGEM
const BONUS_ULTRAPASSAGEM = 5;
const DISTANCIA_ULTRAPASSAGEM = 20;

const NIVEIS_DIFICULDADE = [
    { pontos: 0, lateral: 2.5, bonus: 0 },
    { pontos: 500, lateral: 2.7, bonus: 0.3 },
    { pontos: 1500, lateral: 2.9, bonus: 0.6 },
    { pontos: 3000, lateral: 3.1, bonus: 0.9 },
    { pontos: 5000, lateral: 3.3, bonus: 1.2 }
];

jogo.velocidadeInicial = VELOCIDADE_INICIAL;
jogo.velocidade = VELOCIDADE_INICIAL;

let idAnimacao = null;
let idContagem = null;

let deslocamentoPista = 0;
let proximoVeiculo = 120;
let ultimaFaixa = -1;

let pausado = false;
let contando = false;
let partidaIniciada = false;
let pontosPartidaRegistrados = false;

let recordeAntesDaPartida = garagem.recorde;
let ultimoTempo = 0;
let nivelAtual = 0;

let avisoDesbloqueio = "";
let tempoDesbloqueio = 0;

let tempoBonus = 0;
let totalUltrapassagens = 0;

const imagemRodovia = new Image();
imagemRodovia.src = "assets/road/rodovia.png";

// ==========================
// GARAGEM
// ==========================

function aplicarCarroSelecionado() {
    const carro = garagem.obterCarroSelecionado();

    if (!carro) return;

    jogador.imagem = new Image();
    jogador.imagem.src = carro.imagem;
}

function criarBarraProgresso() {
    const bloqueados = garagem.carros
        .filter(carro => !garagem.podeUsar(carro.id))
        .sort((a, b) =>
            a.pontosNecessarios - b.pontosNecessarios
        );

    const proximo = bloqueados[0];
    const painel = document.createElement("div");

    painel.style.cssText = `
        max-width: 520px;
        margin: 18px auto 25px;
        padding: 18px;
        background: #172638;
        border: 1px solid #38516b;
        border-radius: 12px;
        color: white;
        font-family: Arial, sans-serif;
    `;

    if (!proximo) {
        painel.textContent =
            "Todos os carros foram desbloqueados!";
        return painel;
    }

    const titulo = document.createElement("p");
    titulo.textContent = `Próximo carro: ${proximo.nome}`;

    const texto = document.createElement("p");
    texto.textContent =
        `${garagem.recorde.toLocaleString("pt-BR")} / ` +
        `${proximo.pontosNecessarios.toLocaleString("pt-BR")} pontos`;

    const fundo = document.createElement("div");

    fundo.style.cssText = `
        height: 12px;
        background: #304257;
        border-radius: 20px;
        overflow: hidden;
    `;

    const barra = document.createElement("div");

    const porcentagem = Math.min(
        100,
        garagem.recorde / proximo.pontosNecessarios * 100
    );

    barra.style.cssText = `
        height: 100%;
        width: ${porcentagem}%;
        background: #53a5f3;
        border-radius: 20px;
    `;

    fundo.appendChild(barra);
    painel.append(titulo, texto, fundo);

    return painel;
}

function atualizarGaragem() {
    listaCarros.innerHTML = "";

    textoPontosTotais.textContent =
        garagem.recorde.toLocaleString("pt-BR");

    listaCarros.appendChild(criarBarraProgresso());

    for (const carro of garagem.carros) {
        const desbloqueado = garagem.podeUsar(carro.id);
        const selecionado =
            garagem.carroSelecionado === carro.id;

        const card = document.createElement("div");
        card.className = "card-carro";

        if (!desbloqueado) {
            card.classList.add("bloqueado");
        }

        if (selecionado) {
            card.classList.add("selecionado");
        }

        const imagem = document.createElement("img");
        imagem.src = carro.imagem;
        imagem.alt = carro.nome;

        const nome = document.createElement("h3");
        nome.textContent = carro.nome;

        const requisito = document.createElement("p");

        requisito.textContent = desbloqueado
            ? "Desbloqueado"
            : `Recorde necessário: ${carro.pontosNecessarios.toLocaleString("pt-BR")} pontos`;

        const botao = document.createElement("button");

        if (selecionado) {
            botao.textContent = "Selecionado";
            botao.disabled = true;
        } else if (desbloqueado) {
            botao.textContent = "Selecionar";

            botao.addEventListener("click", () => {
                garagem.selecionarCarro(carro.id);
                aplicarCarroSelecionado();
                som.desbloqueio();
                atualizarGaragem();
            });
        } else {
            botao.textContent = "Bloqueado";
            botao.disabled = true;
        }

        card.append(imagem, nome, requisito, botao);
        listaCarros.appendChild(card);
    }
}

// ==========================
// DESENHO
// ==========================

function desenharPista() {
    ctx.fillStyle = "#242b35";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!imagemRodovia.complete ||
        !imagemRodovia.naturalWidth) {
        return;
    }

    const altura =
        imagemRodovia.naturalHeight *
        (canvas.width / imagemRodovia.naturalWidth);

    if (altura <= 0) return;

    const deslocamento = deslocamentoPista % altura;

    for (
        let y = deslocamento - altura;
        y < canvas.height;
        y += altura
    ) {
        ctx.drawImage(
            imagemRodovia,
            0,
            y,
            canvas.width,
            altura
        );
    }
}

function desenharAvisos() {
    if (tempoDesbloqueio > 0 && avisoDesbloqueio) {
        ctx.fillStyle = "rgba(13, 31, 48, 0.93)";
        ctx.fillRect(18, 25, canvas.width - 36, 66);

        ctx.strokeStyle = "#72c6ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(18, 25, canvas.width - 36, 66);

        ctx.textAlign = "center";

        ctx.fillStyle = "#9bddff";
        ctx.font = "bold 13px Arial";
        ctx.fillText(
            "NOVO CARRO DESBLOQUEADO!",
            canvas.width / 2,
            50
        );

        ctx.fillStyle = "#ffffff";
        ctx.font = "15px Arial";
        ctx.fillText(
            avisoDesbloqueio,
            canvas.width / 2,
            73,
            canvas.width - 60
        );
    }

    if (tempoBonus > 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffd54a";
        ctx.font = "bold 19px Arial";

        ctx.fillText(
            `+${BONUS_ULTRAPASSAGEM} RISCO!`,
            canvas.width / 2,
            125
        );
    }

    ctx.textAlign = "start";
}

function desenharCena() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    desenharPista();

    for (const carro of jogo.carrosInimigos) {
        carro.desenhar(ctx);
    }

    jogador.desenhar(ctx);
    desenharAvisos();
}

function desenharPainel(titulo, linhas = [], cor = "#fff") {
    ctx.fillStyle = "rgba(8, 15, 25, 0.88)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";

    ctx.fillStyle = cor;
    ctx.font = "bold 32px Arial";
    ctx.fillText(titulo, canvas.width / 2, 205);

    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";

    linhas.forEach((linha, indice) => {
        ctx.fillText(
            linha,
            canvas.width / 2,
            265 + indice * 38,
            canvas.width - 24
        );
    });

    ctx.textAlign = "start";
}

// ==========================
// PARTIDA
// ==========================

function limparContagem() {
    if (idContagem !== null) {
        clearTimeout(idContagem);
        idContagem = null;
    }

    contando = false;
}

function pararAnimacao() {
    if (idAnimacao !== null) {
        cancelAnimationFrame(idAnimacao);
        idAnimacao = null;
    }

    limparContagem();

    jogo.jogoAtivo = false;
    pausado = false;

    som.pararMotor();
}

function registrarRecorde() {
    if (pontosPartidaRegistrados) return;

    const pontos = Math.floor(jogo.pontuacao / 10);

    garagem.atualizarRecorde(pontos);
    jogo.recorde = garagem.recorde;

    textoRecorde.textContent = jogo.recorde;

    pontosPartidaRegistrados = true;
}

function prepararJogo() {
    pararAnimacao();

    jogo.reiniciar();
    jogo.recorde = garagem.recorde;

    aplicarCarroSelecionado();

    jogador.x = 260;
    jogador.y = 490;
    jogador.velocidadeLateral = 2.5;

    deslocamentoPista = 0;
    proximoVeiculo = 120;
    ultimaFaixa = -1;

    nivelAtual = 0;
    partidaIniciada = false;
    pontosPartidaRegistrados = false;

    recordeAntesDaPartida = garagem.recorde;

    avisoDesbloqueio = "";
    tempoDesbloqueio = 0;

    tempoBonus = 0;
    totalUltrapassagens = 0;

    textoPontuacao.textContent = "0";
    textoRecorde.textContent = jogo.recorde;

    for (const tecla in teclas) {
        teclas[tecla] = false;
    }

    desenharCena();
}

function iniciarContagem() {
    if (contando || jogo.jogoAtivo) return;

    contando = true;
    pausado = false;

    let numero = 3;

    function mostrarNumero() {
        if (!contando || telaJogo.hidden) return;

        desenharCena();

        if (numero > 0) {
            desenharPainel(
                String(numero),
                ["Prepare-se!"],
                "#ffd54a"
            );

            numero--;

            idContagem = setTimeout(
                mostrarNumero,
                1000
            );
        } else {
            contando = false;
            idContagem = null;

            jogo.jogoAtivo = true;
            partidaIniciada = true;
            ultimoTempo = 0;

            som.iniciarMotor();

            idAnimacao = requestAnimationFrame(
                atualizarJogo
            );
        }
    }

    mostrarNumero();
}

function alternarPausa() {
    if (!jogo.jogoAtivo || contando) return;

    pausado = !pausado;

    if (pausado) {
        if (idAnimacao !== null) {
            cancelAnimationFrame(idAnimacao);
            idAnimacao = null;
        }

        som.pararMotor();

        desenharCena();
        desenharPainel(
            "PAUSADO",
            ["Pressione P ou Esc para continuar"]
        );
    } else {
        ultimoTempo = 0;
        som.iniciarMotor();

        idAnimacao = requestAnimationFrame(
            atualizarJogo
        );
    }
}

// ==========================
// DIFICULDADE
// ==========================

function atualizarDificuldade(pontos) {
    let novoNivel = 0;

    for (let i = 0; i < NIVEIS_DIFICULDADE.length; i++) {
        if (pontos >= NIVEIS_DIFICULDADE[i].pontos) {
            novoNivel = i;
        }
    }

    if (novoNivel > nivelAtual) {
        for (let i = nivelAtual + 1; i <= novoNivel; i++) {
            const marco = NIVEIS_DIFICULDADE[i].pontos;

            const carro = garagem.carros.find(
                item => item.pontosNecessarios === marco
            );

            if (carro && recordeAntesDaPartida < marco) {
                avisoDesbloqueio = carro.nome;
                tempoDesbloqueio = 180;
                som.desbloqueio();
            }
        }
    }

    nivelAtual = novoNivel;

    const configuracao = NIVEIS_DIFICULDADE[nivelAtual];

    jogador.velocidadeLateral = configuracao.lateral;

    const nivelTempo = Math.floor(
        jogo.quadros / INTERVALO_ACELERACAO
    );

    jogo.velocidade = Math.min(
        VELOCIDADE_INICIAL +
        nivelTempo * AUMENTO_VELOCIDADE +
        configuracao.bonus,
        VELOCIDADE_MAXIMA
    );
}

// ==========================
// ULTRAPASSAGEM ARRISCADA
// ==========================

function verificarUltrapassagem(carro) {
    if (carro.bonusConcedido) return;

    // Bordas visuais dos dois veículos
    const esquerdaJogador = jogador.x;
    const direitaJogador = jogador.x + jogador.largura;

    const esquerdaInimigo = carro.x;
    const direitaInimigo = carro.x + carro.largura;

    let distanciaHorizontal;

    if (direitaJogador <= esquerdaInimigo) {
        distanciaHorizontal =
            esquerdaInimigo - direitaJogador;
    } else if (direitaInimigo <= esquerdaJogador) {
        distanciaHorizontal =
            esquerdaJogador - direitaInimigo;
        } else {
        // Imagens se sobrepõem na horizontal
        const sobreposicao =
            Math.min(direitaJogador, direitaInimigo) -
            Math.max(esquerdaJogador, esquerdaInimigo);

        // Roçar na lateral conta; ficar por cima da linha do meio não
        distanciaHorizontal = sobreposicao <= 10 ? 0 : -1;
    }

    // Os veículos precisam estar lado a lado
    const ladoALado =
        jogador.y < carro.y + carro.altura &&
        jogador.y + jogador.altura > carro.y;

    // Registra apenas uma passagem realmente próxima
    if (
        ladoALado &&
        distanciaHorizontal >= 0 &&
        distanciaHorizontal <= DISTANCIA_ULTRAPASSAGEM
    ) {
        carro.passouPerto = true;
    }

    // O veículo do trânsito terminou de passar
    const passagemConcluida =
        carro.y >= jogador.y + jogador.altura;

    if (passagemConcluida) {
        carro.bonusConcedido = true;

        if (carro.passouPerto) {
            // A pontuação interna é dividida por 10
            // na interface, então 5 pontos = 50 unidades.
            jogo.pontuacao += BONUS_ULTRAPASSAGEM * 10;

            totalUltrapassagens++;
            tempoBonus = 70;
        }
    }
}

// ==========================
// TRÂNSITO
// ==========================

function identificarFaixa(carro) {
    const centro = carro.x + carro.largura / 2;

    let melhorFaixa = 0;
    let menorDistancia = Infinity;

    FAIXAS.forEach((posicao, indice) => {
        const distancia = Math.abs(
            centro - (posicao + 20)
        );

        if (distancia < menorDistancia) {
            menorDistancia = distancia;
            melhorFaixa = indice;
        }
    });

    return melhorFaixa;
}

function faixaEstaLivre(faixa, novoCarro) {
    return jogo.carrosInimigos.every(carro => {
        if (identificarFaixa(carro) !== faixa) {
            return true;
        }

        const distancia =
            carro.y - (novoCarro.y + novoCarro.altura);

        return distancia >= 220;
    });
}

function existeRotaDeFuga(faixaEscolhida, novoCarro) {
    const ocupadas = new Set([faixaEscolhida]);

    for (const carro of jogo.carrosInimigos) {
        const centroAtual =
            carro.y + carro.altura / 2;

        const centroNovo =
            novoCarro.y + novoCarro.altura / 2;

        if (Math.abs(centroAtual - centroNovo) < 260) {
            ocupadas.add(identificarFaixa(carro));
        }
    }

    return ocupadas.size <= 2;
}

function criarVeiculoSeguro() {
    const indices = [0, 1, 2, 3];

    for (let i = indices.length - 1; i > 0; i--) {
        const aleatorio = Math.floor(
            Math.random() * (i + 1)
        );

        [indices[i], indices[aleatorio]] =
            [indices[aleatorio], indices[i]];
    }

    const indiceAnterior = indices.indexOf(ultimaFaixa);

    if (indiceAnterior !== -1) {
        indices.splice(indiceAnterior, 1);
        indices.push(ultimaFaixa);
    }

    for (const faixa of indices) {
        const novoCarro = new CarroInimigo();

        novoCarro.x =
            FAIXAS[faixa] +
            (40 - novoCarro.largura) / 2;

        novoCarro.y = -novoCarro.altura;

        novoCarro.sentido =
            faixa < 2 ? "contrario" : "mesmo";

        novoCarro.passouPerto = false;
        novoCarro.bonusConcedido = false;

        if (
            faixaEstaLivre(faixa, novoCarro) &&
            existeRotaDeFuga(faixa, novoCarro)
        ) {
            jogo.carrosInimigos.push(novoCarro);
            ultimaFaixa = faixa;
            return true;
        }
    }

    return false;
}

function atualizarTransito() {
    if (jogo.quadros < proximoVeiculo) return;

    const criado = criarVeiculoSeguro();

    const dificuldade = Math.floor(
        jogo.quadros / 500
    );

    const intervaloBase = Math.max(
        85,
        135 - dificuldade * 5
    );

    const variacao = Math.floor(
        Math.random() * 30
    );

    proximoVeiculo = jogo.quadros +
        (criado ? intervaloBase + variacao : 25);
}

// ==========================
// GAME OVER
// ==========================

function desenharGameOver() {
    desenharCena();

    const pontos = Math.floor(jogo.pontuacao / 10);
    const novoRecorde = pontos > recordeAntesDaPartida;

    const linhas = [
        `Pontuação: ${pontos}`,
        `Recorde: ${jogo.recorde}`,
        `Ultrapassagens arriscadas: ${totalUltrapassagens}`,
        novoRecorde ? "NOVO RECORDE!" : "Tente novamente!",
        "Clique em Reiniciar para jogar"
    ];

    desenharPainel(
        "FIM DE JOGO",
        linhas,
        "#ff6565"
    );
}

// ==========================
// LOOP PRINCIPAL
// ==========================

function atualizarJogo(tempoAtual) {
    if (!jogo.jogoAtivo || pausado) {
        idAnimacao = null;
        return;
    }

    const delta = ultimoTempo
        ? Math.max(
            0,
            Math.min((tempoAtual - ultimoTempo) / 16.67, 2)
        )
        : 1;

    ultimoTempo = tempoAtual;

    jogo.quadros += delta;
    jogo.pontuacao += delta;

    jogador.atualizar(teclas, delta);

    deslocamentoPista += jogo.velocidade * delta;

    atualizarTransito();

    for (const carro of jogo.carrosInimigos) {
        carro.atualizar(jogo.velocidade * delta);

        // A colisão tem prioridade sobre qualquer bônus.
        if (jogo.colidiu(jogador, carro)) {
            jogo.jogoAtivo = false;
            break;
        }

        verificarUltrapassagem(carro);
    }

    jogo.carrosInimigos = jogo.carrosInimigos.filter(
        carro => carro.y < canvas.height + 150
    );

    const pontos = Math.floor(jogo.pontuacao / 10);

    // Inclui os pontos extras na dificuldade
    atualizarDificuldade(pontos);

    textoPontuacao.textContent = pontos;

    jogo.atualizarRecorde();

    if (jogo.recorde > garagem.recorde) {
        garagem.atualizarRecorde(jogo.recorde);
    }

    textoRecorde.textContent = jogo.recorde;

    if (tempoDesbloqueio > 0) {
        tempoDesbloqueio = Math.max(
            0,
            tempoDesbloqueio - delta
        );
    }

    if (tempoBonus > 0) {
        tempoBonus = Math.max(
            0,
            tempoBonus - delta
        );
    }

    som.atualizarMotor(jogo.velocidade);

    desenharCena();

    if (jogo.jogoAtivo) {
        idAnimacao = requestAnimationFrame(
            atualizarJogo
        );
    } else {
        idAnimacao = null;

        registrarRecorde();

        som.pararMotor();
        som.colisao();

        desenharGameOver();
    }
}

// ==========================
// EVENTOS
// ==========================

imagemRodovia.addEventListener("load", () => {
    if (
        !jogo.jogoAtivo &&
        !telaJogo.hidden &&
        !contando &&
        !partidaIniciada
    ) {
        desenharCena();
    }
});

document.addEventListener("keydown", event => {
    if (["Escape", "p", "P"].includes(event.key)) {
        if (!event.repeat && !telaJogo.hidden) {
            alternarPausa();
        }

        event.preventDefault();
        return;
    }

    teclas[event.key] = true;
    teclas[event.key.toLowerCase()] = true;

    if ([
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        " "
    ].includes(event.key)) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", event => {
    teclas[event.key] = false;
    teclas[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
    if (jogo.jogoAtivo && !pausado) {
        alternarPausa();
    }

    for (const tecla in teclas) {
        teclas[tecla] = false;
    }
});

botaoJogar.addEventListener("click", () => {
    telaInicial.hidden = true;
    telaJogo.hidden = false;

    prepararJogo();

    botaoIniciar.hidden = false;
    botaoReiniciar.hidden = true;
});

botaoIniciar.addEventListener("click", () => {
    if (jogo.jogoAtivo || contando) return;

    botaoIniciar.hidden = true;
    botaoReiniciar.hidden = false;

    iniciarContagem();
});

botaoReiniciar.addEventListener("click", () => {
    if (jogo.jogoAtivo) {
        registrarRecorde();
    }

    prepararJogo();
    iniciarContagem();
});

botaoVoltar.addEventListener("click", () => {
    if (jogo.jogoAtivo) {
        registrarRecorde();
    }

    pararAnimacao();

    telaJogo.hidden = true;
    telaInicial.hidden = false;

    botaoIniciar.hidden = false;
    botaoReiniciar.hidden = true;
});

botaoAbrirGaragem.addEventListener("click", () => {
    telaInicial.hidden = true;
    telaGaragem.hidden = false;

    atualizarGaragem();
});

botaoVoltarGaragem.addEventListener("click", () => {
    telaGaragem.hidden = true;
    telaInicial.hidden = false;
});

aplicarCarroSelecionado();
