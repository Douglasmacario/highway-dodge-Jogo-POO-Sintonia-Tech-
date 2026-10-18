
export class Jogo {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.pontuacao = 0;
        this.recorde = 0;
        this.quadros = 0;

        // Configurações de velocidade
        this.velocidadeInicial = 1.5;
        this.velocidade = this.velocidadeInicial;

        this.jogoAtivo = false;
        this.carrosInimigos = [];
    }

    colidiu(a, b) {
        return (
            a.x < b.x + b.largura &&
            a.x + a.largura > b.x &&
            a.y < b.y + b.altura &&
            a.y + a.altura > b.y
        );
    }

    atualizarRecorde() {
        const pontuacaoAtual = Math.floor(this.pontuacao / 10);

        if (pontuacaoAtual > this.recorde) {
            this.recorde = pontuacaoAtual;
        }
    }

    reiniciar() {
        this.carrosInimigos = [];
        this.pontuacao = 0;
        this.quadros = 0;
        this.velocidade = this.velocidadeInicial;
        this.jogoAtivo = false;
    }
}
