
export class Som {
    constructor() {
        this.contexto = null;
        this.ativo = true;

        this.motor = null;
        this.ganhoMotor = null;

        this.osciladores = [];
        this.ruido = null;
        this.filtroRuido = null;

        this.volumeMotor = 0.11;
    }

    iniciarAudio() {
        if (!this.ativo) return;

        if (!this.contexto) {
            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) return;

            this.contexto = new AudioContext();
        }

        if (this.contexto.state === "suspended") {
            this.contexto.resume();
        }
    }

    // Efeitos curtos, como colisão e seleção
    tocarFrequencia(
        frequencia,
        duracao,
        tipo = "sine",
        volume = 0.1
    ) {
        if (!this.ativo) return;

        this.iniciarAudio();

        if (!this.contexto) return;

        const agora = this.contexto.currentTime;

        const oscilador = this.contexto.createOscillator();
        const ganho = this.contexto.createGain();

        oscilador.type = tipo;
        oscilador.frequency.setValueAtTime(
            frequencia,
            agora
        );

        ganho.gain.setValueAtTime(volume, agora);
        ganho.gain.exponentialRampToValueAtTime(
            0.001,
            agora + duracao
        );

        oscilador.connect(ganho);
        ganho.connect(this.contexto.destination);

        oscilador.start(agora);
        oscilador.stop(agora + duracao);
    }

    // Cria ruído contínuo para dar textura ao motor
    criarRuido() {
        const tamanho = this.contexto.sampleRate * 2;

        const buffer = this.contexto.createBuffer(
            1,
            tamanho,
            this.contexto.sampleRate
        );

        const dados = buffer.getChannelData(0);

        for (let i = 0; i < tamanho; i++) {
            dados[i] = Math.random() * 2 - 1;
        }

        const fonte = this.contexto.createBufferSource();
        fonte.buffer = buffer;
        fonte.loop = true;

        return fonte;
    }

    // Inicia o motor esportivo
    iniciarMotor() {
        if (!this.ativo || this.motor) return;

        this.iniciarAudio();

        if (!this.contexto) return;

        const agora = this.contexto.currentTime;

        // Volume geral do motor
        this.ganhoMotor = this.contexto.createGain();
        this.ganhoMotor.gain.setValueAtTime(0, agora);
        this.ganhoMotor.gain.linearRampToValueAtTime(
            this.volumeMotor,
            agora + 0.25
        );

        // Filtro que suaviza o som eletrônico
        const filtroMotor = this.contexto.createBiquadFilter();
        filtroMotor.type = "lowpass";
        filtroMotor.frequency.value = 550;
        filtroMotor.Q.value = 0.7;

        filtroMotor.connect(this.ganhoMotor);
        this.ganhoMotor.connect(this.contexto.destination);

        // Camadas do motor V8
        const camadas = [
            { tipo: "sawtooth", multiplicador: 1, volume: 0.28 },
            { tipo: "triangle", multiplicador: 0.5, volume: 0.50 },
            { tipo: "sawtooth", multiplicador: 2, volume: 0.12 },
            { tipo: "triangle", multiplicador: 1.02, volume: 0.20 }
        ];

        this.osciladores = [];

        for (const camada of camadas) {
            const oscilador = this.contexto.createOscillator();
            const ganho = this.contexto.createGain();

            oscilador.type = camada.tipo;
            oscilador.frequency.value =
                55 * camada.multiplicador;

            ganho.gain.value = camada.volume;

            oscilador.connect(ganho);
            ganho.connect(filtroMotor);

            oscilador.start();

            this.osciladores.push({
                oscilador,
                ganho,
                multiplicador: camada.multiplicador
            });
        }

        // Ruído filtrado para simular o ronco do escapamento
        this.ruido = this.criarRuido();

        this.filtroRuido = this.contexto.createBiquadFilter();
        this.filtroRuido.type = "bandpass";
        this.filtroRuido.frequency.value = 120;
        this.filtroRuido.Q.value = 1.5;

        const ganhoRuido = this.contexto.createGain();
        ganhoRuido.gain.value = 0.025;

        this.ruido.connect(this.filtroRuido);
        this.filtroRuido.connect(ganhoRuido);
        ganhoRuido.connect(this.ganhoMotor);

        this.ruido.start();

        // Mantém compatibilidade com o script.js
        this.motor = this.osciladores[0].oscilador;
    }

    // Aumenta o giro conforme a velocidade do jogo
    atualizarMotor(velocidade) {
        if (!this.motor || !this.contexto) return;

        const agora = this.contexto.currentTime;

        const velocidadeLimitada = Math.max(
            3,
            Math.min(velocidade, 9)
        );

        // Frequência mais alta = motor com giro maior
        const frequenciaBase =
            48 + velocidadeLimitada * 10;

        for (const camada of this.osciladores) {
            camada.oscilador.frequency.setTargetAtTime(
                frequenciaBase * camada.multiplicador,
                agora,
                0.12
            );
        }

        // Ruído do escapamento acompanha a aceleração
        if (this.filtroRuido) {
            this.filtroRuido.frequency.setTargetAtTime(
                90 + velocidadeLimitada * 22,
                agora,
                0.15
            );
        }

        // O volume também cresce levemente
        if (this.ganhoMotor) {
            const volume =
                this.volumeMotor +
                (velocidadeLimitada - 3) * 0.006;

            this.ganhoMotor.gain.setTargetAtTime(
                volume,
                agora,
                0.2
            );
        }
    }

    // Desliga o motor ao sair ou bater
    pararMotor() {
        if (!this.motor) return;

        for (const camada of this.osciladores) {
            try {
                camada.oscilador.stop();
                camada.oscilador.disconnect();
                camada.ganho.disconnect();
            } catch (erro) {
                // Evita erro caso o áudio já tenha parado
            }
        }

        this.osciladores = [];

        if (this.ruido) {
            try {
                this.ruido.stop();
                this.ruido.disconnect();
            } catch (erro) {
                // Evita erro ao desligar o ruído
            }

            this.ruido = null;
        }

        if (this.filtroRuido) {
            this.filtroRuido.disconnect();
            this.filtroRuido = null;
        }

        if (this.ganhoMotor) {
            this.ganhoMotor.disconnect();
            this.ganhoMotor = null;
        }

        this.motor = null;
    }

    // Efeito de colisão
    colisao() {
        this.pararMotor();

        this.tocarFrequencia(
            75,
            0.4,
            "sawtooth",
            0.14
        );

        this.tocarFrequencia(
            45,
            0.5,
            "triangle",
            0.12
        );
    }

    // Efeito ao selecionar um carro
    desbloqueio() {
        this.tocarFrequencia(
            523,
            0.12,
            "sine",
            0.08
        );

        this.tocarFrequencia(
            784,
            0.25,
            "sine",
            0.08
        );
    }
}
