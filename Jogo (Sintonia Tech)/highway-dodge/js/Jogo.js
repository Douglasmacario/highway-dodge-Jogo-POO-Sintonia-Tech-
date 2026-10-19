
export class Jogo {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.pontuacao = 0;
        this.recorde = 0;
        this.quadros = 0;

        this.velocidadeInicial = 3.2;
        this.velocidade = this.velocidadeInicial;

        this.jogoAtivo = false;
        this.carrosInimigos = [];
    }

    obterHitbox(carro) {
        const margemX = carro.largura * 0.20;
        const margemY = carro.altura * 0.15;

        return {
            x: carro.x + margemX,
            y: carro.y + margemY,
            largura: carro.largura - margemX * 2,
            altura: carro.altura - margemY * 2
        };
    }

    colidiu(carroA, carroB) {
        const a = this.obterHitbox(carroA);
        const b = this.obterHitbox(carroB);

        return (
            a.x < b.x + b.largura &&
            a.x + a.largura > b.x &&
            a.y < b.y + b.altura &&
            a.y + a.altura > b.y
        );
    }

    atualizarRecorde() {
        const pontos = Math.floor(this.pontuacao / 10);

        if (pontos > this.recorde) {
            this.recorde = pontos;
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
