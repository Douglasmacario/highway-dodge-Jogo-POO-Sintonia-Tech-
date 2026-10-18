
 // Classe base para todos os carros do jogo
export class Carro {
    constructor(x, y, cor, caminhoImagem = null) {
        this.x = x;
        this.y = y;
        this.largura = 48;
        this.altura = 82;
        this.cor = cor;

        this.imagem = null;

        if (caminhoImagem) {
            this.imagem = new Image();
            this.imagem.src = caminhoImagem;
        }
    }

    desenhar(ctx) {
        if (this.imagem && this.imagem.complete && this.imagem.naturalWidth > 0) {
            ctx.drawImage(
                this.imagem,
                this.x,
                this.y,
                this.largura,
                this.altura
            );
        } else {
            ctx.fillStyle = this.cor;
            ctx.fillRect(
                this.x,
                this.y,
                this.largura,
                this.altura
            );
        }
    }

    atualizar() {
        // Comportamento padrão
    }
}
