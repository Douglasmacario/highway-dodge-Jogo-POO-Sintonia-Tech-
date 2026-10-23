
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

const BONUS_ULTRAPASSAGEM = 5;
const DISTANCIA_ULTRAPASSAGEM = 6;

// Distância mínima entre ondas de trânsito
const DISTANCIA_ENTRE_ONDAS = 260;

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

    if (
        !imagemRodovia.complete ||
        !imagemRodovia.naturalWidth
    ) {
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

// Painel da contagem e da pausa
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
        // Permite uma leve sobreposição visual
        const sobreposicao =
            Math.min(direitaJogador, direitaInimigo) -
            Math.max(esquerdaJogador, esquerdaInimigo);

        distanciaHorizontal = sobreposicao <= 10 ? 0 : -1;
    }

    const ladoALado =
        jogador.y < carro.y + carro.altura &&
        jogador.y + jogador.altura > carro.y;

    if (
        ladoALado &&
        distanciaHorizontal >= 0 &&
        distanciaHorizontal <= DISTANCIA_ULTRAPASSAGEM
    ) {
        carro.passouPerto = true;
    }

    const passagemConcluida =
        carro.y >= jogador.y + jogador.altura;

    if (passagemConcluida) {
        carro.bonusConcedido = true;

        if (carro.passouPerto) {
            jogo.pontuacao += BONUS_ULTRAPASSAGEM * 10;

            totalUltrapassagens++;
            tempoBonus = 70;
        }
    }
}

// ==========================
// TRÂNSITO EM ONDAS
// ==========================

// Identifica a faixa ocupada pelo veículo
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

// Embaralha as faixas para variar as ondas
function embaralharFaixas() {
    const faixas = [0, 1, 2, 3];

    for (let i = faixas.length - 1; i > 0; i--) {
        const indice = Math.floor(
            Math.random() * (i + 1)
        );

        [faixas[i], faixas[indice]] =
            [faixas[indice], faixas[i]];
    }

    return faixas;
}

// Decide quantos carros aparecerão na onda
function escolherQuantidadeCarros(pontos) {
    const sorteio = Math.random();

    // Começo: maioria das ondas com 1 carro
    if (pontos < 200) {
        return sorteio < 0.75 ? 1 : 2;
    }

    // Dificuldade intermediária
    if (pontos < 500) {
        if (sorteio < 0.45) return 1;
        if (sorteio < 0.85) return 2;
        return 3;
    }

    // Dificuldade maior
    if (sorteio < 0.20) return 1;
    if (sorteio < 0.65) return 2;
    return 3;
}

// Confere se uma faixa tem espaço para outro carro
function faixaEstaLivre(faixa, novoCarro) {
    return jogo.carrosInimigos.every(carro => {
        if (identificarFaixa(carro) !== faixa) {
            return true;
        }

        const distancia =
            carro.y - (novoCarro.y + novoCarro.altura);

        return distancia >= DISTANCIA_ENTRE_ONDAS;
    });
}

// Evita criar ondas coladas em carros anteriores
function ondaPodeAparecer(novosCarros) {
    for (const novoCarro of novosCarros) {
        if (
            !faixaEstaLivre(
                identificarFaixa(novoCarro),
                novoCarro
            )
        ) {
            return false;
        }
    }

    // Verifica se não existe outra onda muito próxima
    for (const carro of jogo.carrosInimigos) {
        const distancia =
            carro.y - Math.max(
                ...novosCarros.map(novo => novo.y + novo.altura)
            );

        if (
            distancia >= 0 &&
            distancia < DISTANCIA_ENTRE_ONDAS
        ) {
            return false;
        }
    }

    return true;
}

// Cria 1, 2 ou 3 carros na mesma onda
function criarOndaDeCarros() {
    const pontos = Math.floor(jogo.pontuacao / 10);
    const quantidade = escolherQuantidadeCarros(pontos);

    const faixas = embaralharFaixas();

    // Evita repetir sempre a mesma faixa
    if (faixas[0] === ultimaFaixa) {
        const indiceTroca = 1 + Math.floor(
            Math.random() * 3
        );

        [faixas[0], faixas[indiceTroca]] =
            [faixas[indiceTroca], faixas[0]];
    }

    // Nunca ocupa as 4 faixas de uma vez
    const escolhidas = faixas.slice(0, quantidade);
    const novosCarros = [];

    for (const faixa of escolhidas) {
        const novoCarro = new CarroInimigo();

        novoCarro.x =
            FAIXAS[faixa] +
            (40 - novoCarro.largura) / 2;

        // Mesma fileira, com leve variação
        // para deixar o trânsito mais natural
        const variacao = Math.floor(
            Math.random() * 15
        );

        novoCarro.y =
            -novoCarro.altura - variacao;

        novoCarro.sentido =
            faixa < 2 ? "contrario" : "mesmo";

        novoCarro.passouPerto = false;
        novoCarro.bonusConcedido = false;

        novosCarros.push(novoCarro);
    }

    if (!ondaPodeAparecer(novosCarros)) {
        return false;
    }

    // Adiciona todos os carros da onda juntos
    jogo.carrosInimigos.push(...novosCarros);

    ultimaFaixa = escolhidas[0];

    return true;
}

function atualizarTransito() {
    if (jogo.quadros < proximoVeiculo) return;

    const criado = criarOndaDeCarros();

    const dificuldade = Math.floor(
        jogo.quadros / 500
    );

    // Ondas um pouco mais frequentes com o tempo
    const intervaloBase = Math.max(
        90,
        150 - dificuldade * 4
    );

    const variacao = Math.floor(
        Math.random() * 35
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
    const centro = canvas.width / 2;

    // Fundo escurecido
    ctx.fillStyle = "rgba(5, 11, 20, 0.76)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Painel central
    const x = 35;
    const y = 100;
    const largura = canvas.width - 70;
    const altura = 400;

    ctx.save();

    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 24;

    ctx.fillStyle = "rgba(18, 30, 47, 0.97)";
    ctx.beginPath();
    ctx.roundRect(x, y, largura, altura, 18);
    ctx.fill();

    ctx.restore();

    ctx.strokeStyle = "#54769b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, largura, altura, 18);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Título
    ctx.fillStyle = "#ff6868";
    ctx.font = "bold 31px Arial";
    ctx.fillText("FIM DE JOGO", centro, 151);

    // Divisória
    ctx.strokeStyle = "#364d68";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 25, 181);
    ctx.lineTo(x + largura - 25, 181);
    ctx.stroke();

    // Pontuação
    ctx.fillStyle = "#b8c7d9";
    ctx.font = "bold 14px Arial";
    ctx.fillText("SUA PONTUAÇÃO", centro, 211);

    ctx.fillStyle = "#ffda55";
    ctx.font = "bold 53px Arial";
    ctx.fillText(String(pontos), centro, 260);

    // Recorde
    ctx.fillStyle = "#dbe8f6";
    ctx.font = "bold 18px Arial";
    ctx.fillText(
        `RECORDE: ${jogo.recorde}`,
        centro,
        317
    );

    // Ultrapassagens
    ctx.fillStyle = "#aebfd3";
    ctx.font = "14px Arial";
    ctx.fillText(
        `Ultrapassagens arriscadas: ${totalUltrapassagens}`,
        centro,
        353
    );

    ctx.fillText(
        `Bônus conquistado: +${totalUltrapassagens * BONUS_ULTRAPASSAGEM} pontos`,
        centro,
        379
    );

    // Mensagem final
    ctx.fillStyle = novoRecorde ? "#ffda55" : "#b8d7ff";
    ctx.font = "bold 18px Arial";

    ctx.fillText(
        novoRecorde ? "NOVO RECORDE!" : "TENTE NOVAMENTE!",
        centro,
        429
    );

    ctx.fillStyle = "#aebfd3";
    ctx.font = "13px Arial";
    ctx.fillText(
        "Clique em Reiniciar para jogar",
        centro,
        466
    );

    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
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

        // Colisão tem prioridade sobre bônus
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
