
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

const textoPontuacao = document.getElementById("pontuacao");
const textoRecorde = document.getElementById("recorde");
const textoImpulso = document.getElementById("estadoImpulso");

const telaInicial = document.getElementById("telaInicial");
const telaJogo = document.getElementById("telaJogo");
const telaGaragem = document.getElementById("telaGaragem");

const botaoJogar = document.getElementById("jogar");
const botaoIniciar = document.getElementById("iniciar");
const botaoReiniciar = document.getElementById("reiniciar");
const botaoVoltar = document.getElementById("voltarMenu");

const botaoAbrirGaragem = document.getElementById("abrirGaragem");
const botaoVoltarGaragem = document.getElementById("voltarGaragem");

const listaCarros = document.getElementById("listaCarros");
const textoPontosTotais = document.getElementById("pontosTotais");

const teclas = {};

let idAnimacao = null;
let deslocamentoPista = 0;
let pontosPartidaRegistrados = false;

// CONFIGURAÇÕES DO TRÂNSITO
const POSICOES_FAIXAS = [90, 150, 210, 270];
const DISTANCIA_MINIMA = 180;
const DISTANCIA_SEGURANCA = 210;

let proximoVeiculo = 90;
let ultimaFaixa = -1;

// DIFICULDADE
const INTERVALO_ACELERACAO = 300;
const AUMENTO_VELOCIDADE = 0.4;
const VELOCIDADE_MAXIMA = 9;

// IMPULSO NO TOPO
const IMPULSO_MAXIMO = 2;
const ACELERACAO_IMPULSO = 0.025;
const DESACELERACAO_IMPULSO = 0.04;

let impulsoAtual = 0;

// RODOVIA
const imagemRodovia = new Image();
imagemRodovia.src = "assets/road/rodovia.png";

// CARRO DA GARAGEM
function aplicarCarroSelecionado() {
    const carro = garagem.obterCarroSelecionado();

    if (!carro) return;

    jogador.imagem = new Image();
    jogador.imagem.src = carro.imagem;
}

// ATUALIZA GARAGEM
function atualizarGaragem() {
    listaCarros.innerHTML = "";

    textoPontosTotais.textContent =
        garagem.pontosTotais.toLocaleString("pt-BR");

    for (const carro of garagem.carros) {
        const desbloqueado = garagem.podeUsar(carro.id);
        const selecionado =
            garagem.carroSelecionado === carro.id;

        const card = document.createElement("div");
        card.classList.add("card-carro");

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
            : `${carro.pontosNecessarios.toLocaleString("pt-BR")} pontos para desbloquear`;

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

// DESENHA A PISTA
function desenharPista() {
    ctx.fillStyle = "#454545";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (
        !imagemRodovia.complete ||
        imagemRodovia.naturalWidth === 0
    ) {
        return;
    }

    const alturaImagem =
        imagemRodovia.naturalHeight *
        (canvas.width / imagemRodovia.naturalWidth);

    if (alturaImagem <= 0) return;

    const deslocamento = deslocamentoPista % alturaImagem;

    for (
        let y = deslocamento - alturaImagem;
        y < canvas.height;
        y += alturaImagem
    ) {
        ctx.drawImage(
            imagemRodovia,
            0,
            y,
            canvas.width,
            alturaImagem
        );
    }
}

// DESENHA A TELA PARADA
function desenharTelaParada() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharPista();
    jogador.desenhar(ctx);
}

// PARA O JOGO
function pararAnimacao() {
    if (idAnimacao !== null) {
        cancelAnimationFrame(idAnimacao);
        idAnimacao = null;
    }

    jogo.jogoAtivo = false;
    som.pararMotor();
}

// SALVA OS PONTOS
function registrarPontosDaPartida() {
    if (pontosPartidaRegistrados) return;

    const pontos = Math.floor(jogo.pontuacao / 10);

    garagem.adicionarPontos(pontos);
    pontosPartidaRegistrados = true;
}

// REINICIA AS CONFIGURAÇÕES
function prepararJogo() {
    pararAnimacao();
    jogo.reiniciar();

    aplicarCarroSelecionado();

    jogador.x = 260;
    jogador.y = 490;

    deslocamentoPista = 0;
    impulsoAtual = 0;

    pontosPartidaRegistrados = false;
    proximoVeiculo = 90;
    ultimaFaixa = -1;

    textoPontuacao.textContent = "0";
    textoRecorde.textContent = jogo.recorde;
    textoImpulso.textContent = "Inativo";

    for (const tecla in teclas) {
        teclas[tecla] = false;
    }

    desenharTelaParada();
}

// IDENTIFICA A FAIXA
function identificarFaixa(carro) {
    const centroCarro = carro.x + carro.largura / 2;

    let faixaMaisProxima = 0;
    let menorDistancia = Infinity;

    for (let i = 0; i < POSICOES_FAIXAS.length; i++) {
        const centroFaixa = POSICOES_FAIXAS[i] + 20;
        const distancia = Math.abs(
            centroCarro - centroFaixa
        );

        if (distancia < menorDistancia) {
            menorDistancia = distancia;
            faixaMaisProxima = i;
        }
    }

    return faixaMaisProxima;
}

// VERIFICA DISTÂNCIA ENTRE VEÍCULOS
function faixaEstaLivre(faixa, novoCarro) {
    for (const carro of jogo.carrosInimigos) {
        if (identificarFaixa(carro) !== faixa) {
            continue;
        }

        const distancia =
            carro.y - (novoCarro.y + novoCarro.altura);

        if (distancia < DISTANCIA_MINIMA) {
            return false;
        }
    }

    return true;
}

// EVITA OCUPAR AS QUATRO FAIXAS AO MESMO TEMPO
function existeRotaDeFuga(faixaEscolhida, novoCarro) {
    const faixasOcupadas = new Set();

    for (const carro of jogo.carrosInimigos) {
        const distanciaVertical = Math.abs(
            (carro.y + carro.altura / 2) -
            (novoCarro.y + novoCarro.altura / 2)
        );

        if (distanciaVertical < DISTANCIA_SEGURANCA) {
            faixasOcupadas.add(identificarFaixa(carro));
        }
    }

    faixasOcupadas.add(faixaEscolhida);

    return faixasOcupadas.size < POSICOES_FAIXAS.length;
}

// GERA VEÍCULOS
function criarVeiculoSeguro() {
    const faixasDisponiveis = [0, 1, 2, 3];

    // Embaralha as faixas
    for (let i = faixasDisponiveis.length - 1; i > 0; i--) {
        const indice = Math.floor(
            Math.random() * (i + 1)
        );

        [
            faixasDisponiveis[i],
            faixasDisponiveis[indice]
        ] = [
                faixasDisponiveis[indice],
                faixasDisponiveis[i]
            ];
    }

    // Deixa a última faixa como segunda opção
    const indiceUltima = faixasDisponiveis.indexOf(ultimaFaixa);

    if (indiceUltima !== -1) {
        faixasDisponiveis.splice(indiceUltima, 1);
        faixasDisponiveis.push(ultimaFaixa);
    }

    for (const faixa of faixasDisponiveis) {
        const novoCarro = new CarroInimigo();

        novoCarro.x =
            POSICOES_FAIXAS[faixa] +
            (40 - novoCarro.largura) / 2;

        novoCarro.sentido =
            faixa < 2 ? "contrario" : "mesmo";

        novoCarro.y = -novoCarro.altura;

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

// CONTROLA O TRÂNSITO
function atualizarTransito() {
    if (jogo.quadros < proximoVeiculo) return;

    criarVeiculoSeguro();

    const dificuldade = Math.floor(jogo.quadros / 600);

    const intervaloBase = Math.max(
        65,
        110 - dificuldade * 5
    );

    const variacao = Math.floor(Math.random() * 26);

    proximoVeiculo =
        jogo.quadros + intervaloBase + variacao;
}

// CONTROLA O IMPULSO
function atualizarImpulso() {
    const pressionandoFrente =
        teclas["ArrowUp"] || teclas["w"];

    const pressionandoTras =
        teclas["ArrowDown"] || teclas["s"];

    const podeAcelerar =
        jogador.estaNoTopo() &&
        pressionandoFrente &&
        !pressionandoTras;

    if (podeAcelerar) {
        impulsoAtual = Math.min(
            IMPULSO_MAXIMO,
            impulsoAtual + ACELERACAO_IMPULSO
        );
    } else {
        impulsoAtual = Math.max(
            0,
            impulsoAtual - DESACELERACAO_IMPULSO
        );
    }

    if (impulsoAtual > 0.05) {
        textoImpulso.textContent =
            `${Math.round(
                (impulsoAtual / IMPULSO_MAXIMO) * 100
            )}%`;
    } else {
        textoImpulso.textContent = "Inativo";
    }
}

// DESENHA GAME OVER
function desenharGameOver() {
    const pontos = Math.floor(jogo.pontuacao / 10);

    ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";

    ctx.fillStyle = "#ff5757";
    ctx.font = "bold 36px Arial";
    ctx.fillText(
        "FIM DE JOGO",
        canvas.width / 2,
        220
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Arial";
    ctx.fillText(
        `Pontuação: ${pontos}`,
        canvas.width / 2,
        280
    );

    ctx.font = "18px Arial";
    ctx.fillText(
        `Recorde: ${jogo.recorde}`,
        canvas.width / 2,
        320
    );

    ctx.fillStyle = "#ffd54a";
    ctx.font = "bold 19px Arial";
    ctx.fillText(
        `+${pontos} pontos na garagem`,
        canvas.width / 2,
        365
    );

    ctx.fillStyle = "#dddddd";
    ctx.font = "15px Arial";
    ctx.fillText(
        "Reinicie para tentar novamente!",
        canvas.width / 2,
        410
    );

    ctx.textAlign = "start";
}

// LOOP PRINCIPAL
function atualizarJogo() {
    if (!jogo.jogoAtivo) {
        idAnimacao = null;
        return;
    }

    jogo.quadros++;

    // MOVIMENTAÇÃO DO JOGADOR
    jogador.atualizar(teclas);

    // ATUALIZA O IMPULSO DEPOIS DO MOVIMENTO
    atualizarImpulso();

    // VELOCIDADE EFETIVA DO JOGO
    const velocidadeAtual =
        jogo.velocidade + impulsoAtual;

    // MOVIMENTO DA RODOVIA
    deslocamentoPista += velocidadeAtual;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharPista();

    jogador.desenhar(ctx);

    // TRÂNSITO
    atualizarTransito();

    for (const carro of jogo.carrosInimigos) {
        carro.atualizar(velocidadeAtual);
        carro.desenhar(ctx);

        if (jogo.colidiu(jogador, carro)) {
            jogo.jogoAtivo = false;
        }
    }

    // REMOVE VEÍCULOS QUE SAÍRAM DA TELA
    jogo.carrosInimigos = jogo.carrosInimigos.filter(
        carro => carro.y < canvas.height
    );

    // PONTUAÇÃO
    jogo.pontuacao++;

    const pontosAtuais = Math.floor(jogo.pontuacao / 10);

    textoPontuacao.textContent = pontosAtuais;

    jogo.atualizarRecorde();
    textoRecorde.textContent = jogo.recorde;

    // DIFICULDADE PROGRESSIVA
    if (jogo.quadros % INTERVALO_ACELERACAO === 0) {
        jogo.velocidade = Math.min(
            jogo.velocidade + AUMENTO_VELOCIDADE,
            VELOCIDADE_MAXIMA
        );
    }

    // SOM ACOMPANHA A VELOCIDADE EFETIVA
    som.atualizarMotor(velocidadeAtual);

    if (jogo.jogoAtivo) {
        idAnimacao = requestAnimationFrame(atualizarJogo);
    } else {
        idAnimacao = null;

        textoImpulso.textContent = "Inativo";

        registrarPontosDaPartida();
        som.colisao();
        desenharGameOver();
    }
}

// CARREGAMENTO DA PISTA
imagemRodovia.addEventListener("load", () => {
    if (!jogo.jogoAtivo && !telaJogo.hidden) {
        desenharTelaParada();
    }
});

// TECLADO
document.addEventListener("keydown", event => {
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

// JOGAR
botaoJogar.addEventListener("click", () => {
    telaInicial.hidden = true;
    telaJogo.hidden = false;

    prepararJogo();

    botaoIniciar.hidden = false;
    botaoReiniciar.hidden = true;
});

// INICIAR
botaoIniciar.addEventListener("click", () => {
    if (jogo.jogoAtivo) return;

    botaoIniciar.hidden = true;
    botaoReiniciar.hidden = false;

    jogo.jogoAtivo = true;
    som.iniciarMotor();

    atualizarJogo();
});

// REINICIAR
botaoReiniciar.addEventListener("click", () => {
    if (jogo.jogoAtivo) {
        registrarPontosDaPartida();
    }

    prepararJogo();

    jogo.jogoAtivo = true;
    som.iniciarMotor();

    atualizarJogo();
});

// VOLTAR AO MENU
botaoVoltar.addEventListener("click", () => {
    if (jogo.jogoAtivo) {
        registrarPontosDaPartida();
    }

    pararAnimacao();

    telaJogo.hidden = true;
    telaInicial.hidden = false;

    botaoIniciar.hidden = false;
    botaoReiniciar.hidden = true;
});

// ABRIR GARAGEM
botaoAbrirGaragem.addEventListener("click", () => {
    telaInicial.hidden = true;
    telaGaragem.hidden = false;

    atualizarGaragem();
});

// VOLTAR DA GARAGEM
botaoVoltarGaragem.addEventListener("click", () => {
    telaGaragem.hidden = true;
    telaInicial.hidden = false;
});

// CARRO INICIAL
aplicarCarroSelecionado();
