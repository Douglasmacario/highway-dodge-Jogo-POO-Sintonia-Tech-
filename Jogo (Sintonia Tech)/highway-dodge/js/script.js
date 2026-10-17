import { Carro } from "./Carro.js";
import {CarroJogador} from "./CarroJogador.js";
import {CarroInimigo} from "./CarroInimigo.js";
import { Jogo } from "./Jogo.js";

const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
const jogo = new Jogo(canvas);

const textoPontuacao = document.getElementById("pontuacao");
const botaoReiniciar = document.getElementById("reiniciar");

const teclas = {};
let jogoAtivo = true;
let pontuacao = 0;
let quadros = 0;
let velocidade = 3;
let carrosInimigos = [];


// OBJETOS DO JOGO
const jogador = new CarroJogador();

function desenharPista() {
    ctx.fillStyle = "#287a3d";
    ctx.fillRect(0, 0, 400, 600);

    ctx.fillStyle = "#454545";
    ctx.fillRect(55, 0, 290, 600);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.setLineDash([25, 20]);

    ctx.beginPath();
    ctx.moveTo(152, 0);
    ctx.lineTo(152, 600);
    ctx.moveTo(248, 0);
    ctx.lineTo(248, 600);
    ctx.stroke();

    ctx.setLineDash([]);
}


// CICLO PRINCIPAL
function atualizarJogo() {
    if (!jogoAtivo) return;

    quadros++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    desenharPista();

    jogador.atualizar(teclas);
    jogador.desenhar(ctx);

    // Cria um novo adversário periodicamente.
    if (quadros % 65 === 0) {
        carrosInimigos.push(new CarroInimigo());
    }

    // POLIMORFISMO:
    // jogador e inimigos têm métodos atualizar()
    // com comportamentos diferentes.
    for (const carro of carrosInimigos) {
        carro.atualizar(velocidade);
        carro.desenhar(ctx);

        if (jogo.colidiu(jogador, carro)) {
            jogoAtivo = false;
        }
    }

    // Remove carros que saíram da tela.
    carrosInimigos = carrosInimigos.filter(
        carro => carro.y < canvas.height
    );

    pontuacao++;
    textoPontuacao.textContent = Math.floor(pontuacao / 10);

    // Aumenta a dificuldade gradualmente.
    if (quadros % 600 === 0) {
        velocidade += 0.5;
    }

    if (jogoAtivo) {
        requestAnimationFrame(atualizarJogo);
    } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, 400, 600);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 32px Arial";
        ctx.fillText("FIM DE JOGO", 200, 280);

        ctx.font = "18px Arial";
        ctx.fillText(
            "Pontuação: " + Math.floor(pontuacao / 10),
            200,
            320
        );
    }
}

// CONTROLES
document.addEventListener("keydown", event => {
    teclas[event.key] = true;

    if (
        ["ArrowLeft", "ArrowRight", " "].includes(event.key)
    ) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", event => {
    teclas[event.key] = false;
});

// REINICIAR
botaoReiniciar.addEventListener("click", () => {
    jogador.x = 180;
    jogador.y = 490;

    carrosInimigos = [];
    pontuacao = 0;
    quadros = 0;
    velocidade = 3;
    jogoAtivo = true;

    for (const tecla in teclas) {
        teclas[tecla] = false;
    }

    atualizarJogo();
});

// INICIAR A PARTIDA
atualizarJogo();
