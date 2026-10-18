
import { CarroJogador } from "./CarroJogador.js";
import { CarroInimigo } from "./CarroInimigo.js";
import { Jogo } from "./Jogo.js";

const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
const jogo = new Jogo(canvas);

const textoPontuacao = document.getElementById("pontuacao");
const textoRecorde = document.getElementById("recorde");

const telaInicial = document.getElementById("telaInicial");
const telaJogo = document.getElementById("telaJogo");

const botaoJogar = document.getElementById("jogar");
const botaoIniciar = document.getElementById("iniciar");
const botaoReiniciar = document.getElementById("reiniciar");
const botaoVoltar = document.getElementById("voltarMenu");

const teclas = {};
const jogador = new CarroJogador();

let idAnimacao = null;
let deslocamentoPista = 0;

// DESENHAR PISTA
function desenharPista() {
    ctx.fillStyle = "#287a3d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#454545";
    ctx.fillRect(55, 0, 290, 600);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.setLineDash([25, 20]);
    ctx.lineDashOffset = -deslocamentoPista;

    ctx.beginPath();
    ctx.moveTo(152, 0);
    ctx.lineTo(152, 600);
    ctx.moveTo(248, 0);
    ctx.lineTo(248, 600);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
}

// DESENHA A PISTA PARADA
function desenharTelaParada() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharPista();
    jogador.desenhar(ctx);
}

// CANCELA ANIMAÇÃO
function pararAnimacao() {
    if (idAnimacao !== null) {
        cancelAnimationFrame(idAnimacao);
        idAnimacao = null;
    }

    jogo.jogoAtivo = false;
}

// PREPARA UMA NOVA PARTIDA
function prepararJogo() {
    pararAnimacao();
    jogo.reiniciar();

    jogador.x = 180;
    jogador.y = 490;

    deslocamentoPista = 0;

    textoPontuacao.textContent = 0;
    textoRecorde.textContent = jogo.recorde;

    for (const tecla in teclas) {
        teclas[tecla] = false;
    }

    desenharTelaParada();
}

// CICLO PRINCIPAL
function atualizarJogo() {
    if (!jogo.jogoAtivo) {
        idAnimacao = null;
        return;
    }

    jogo.quadros++;

    // Move a pista
    deslocamentoPista =
        (deslocamentoPista + jogo.velocidade) % 45;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharPista();

    jogador.atualizar(teclas);
    jogador.desenhar(ctx);

    // Primeiro inimigo aparece após 90 quadros
    // Depois, novos inimigos a cada 100 quadros
    if (jogo.quadros >= 90 &&
        (jogo.quadros - 90) % 100 === 0) {
        jogo.carrosInimigos.push(new CarroInimigo());
    }

    // Atualiza os carros inimigos
    for (const carro of jogo.carrosInimigos) {
        carro.atualizar(jogo.velocidade);
        carro.desenhar(ctx);

        if (jogo.colidiu(jogador, carro)) {
            jogo.jogoAtivo = false;
        }
    }

    // Remove carros fora da tela
    jogo.carrosInimigos = jogo.carrosInimigos.filter(
        carro => carro.y < canvas.height
    );

    // Pontuação
    jogo.pontuacao++;
    textoPontuacao.textContent =
        Math.floor(jogo.pontuacao / 10);

    // Recorde da sessão
    jogo.atualizarRecorde();
    textoRecorde.textContent = jogo.recorde;

    // Aumenta a velocidade a cada 600 quadros
    if (jogo.quadros % 600 === 0) {
        jogo.velocidade = Math.min(
            jogo.velocidade + 0.25,
            6
        );
    }

    if (jogo.jogoAtivo) {
        idAnimacao = requestAnimationFrame(atualizarJogo);
    } else {
        idAnimacao = null;

        // FIM DE JOGO
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, 400, 600);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 32px Arial";
        ctx.fillText("FIM DE JOGO", 200, 260);

        ctx.font = "18px Arial";
        ctx.fillText(
            "Pontuação: " + Math.floor(jogo.pontuacao / 10),
            200,
            305
        );

        ctx.fillText(
            "Recorde: " + jogo.recorde,
            200,
            340
        );
    }
}

// CONTROLES
document.addEventListener("keydown", event => {
    teclas[event.key] = true;
    teclas[event.key.toLowerCase()] = true;

    if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", event => {
    teclas[event.key] = false;
    teclas[event.key.toLowerCase()] = false;
});

// BOTÃO JOGAR
botaoJogar.addEventListener("click", () => {
    telaInicial.hidden = true;
    telaJogo.hidden = false;

    prepararJogo();

    botaoIniciar.hidden = false;
    botaoReiniciar.hidden = true;
});

// BOTÃO INICIAR
botaoIniciar.addEventListener("click", () => {
    if (jogo.jogoAtivo) return;

    botaoIniciar.hidden = true;
    botaoReiniciar.hidden = false;

    jogo.jogoAtivo = true;
    atualizarJogo();
});

// BOTÃO REINICIAR
botaoReiniciar.addEventListener("click", () => {
    prepararJogo();

    jogo.jogoAtivo = true;
    atualizarJogo();
});

// BOTÃO VOLTAR AO MENU
botaoVoltar.addEventListener("click", () => {
    pararAnimacao();

    telaJogo.hidden = true;
    telaInicial.hidden = false;

    botaoIniciar.hidden = false;
    botaoReiniciar.hidden = true;
});
