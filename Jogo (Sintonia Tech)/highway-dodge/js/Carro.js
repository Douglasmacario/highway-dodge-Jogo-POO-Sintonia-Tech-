// Classe base para todos os carros do jogo
export class Carro {
    constructor(x, y, cor) {
        this.x = x;
        this.y = y;
        this.largura = 40;
        this.altura = 70;
        this.cor = cor;
    }

    desenhar(ctx) {
        ctx.fillStyle = this.cor;
        ctx.fillRect(
            this.x,
            this.y,
            this.largura,
            this.altura
        );
    }

    atualizar() {
        // Comportamento padrão
    }
}