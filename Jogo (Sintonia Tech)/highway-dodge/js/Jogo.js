
export class Jogo {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.pontuacao = 0;
        this.quadros = 0;
        this.velocidade = 3;
        this.jogoAtivo = true;
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

    reiniciar() {
        this.carrosInimigos = [];
        this.pontuacao = 0;
        this.quadros = 0;
        this.velocidade = 3;
        this.jogoAtivo = true;
    }
}
