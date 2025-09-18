package com.example.garagem.model;

import java.time.LocalDateTime;

public class Registro {
    private int numeroVaga;
    private Veiculo veiculo;
    private LocalDateTime entrada;
    private LocalDateTime saida;

    public Registro() {}

    public Registro(int numeroVaga, Veiculo veiculo, LocalDateTime entrada) {
        this.numeroVaga = numeroVaga;
        this.veiculo = veiculo;
        this.entrada = entrada;
    }

    public int getNumeroVaga() { return numeroVaga; }
    public void setNumeroVaga(int numeroVaga) { this.numeroVaga = numeroVaga; }

    public Veiculo getVeiculo() { return veiculo; }
    public void setVeiculo(Veiculo veiculo) { this.veiculo = veiculo; }

    public LocalDateTime getEntrada() { return entrada; }
    public void setEntrada(LocalDateTime entrada) { this.entrada = entrada; }

    public LocalDateTime getSaida() { return saida; }
    public void setSaida(LocalDateTime saida) { this.saida = saida; }
}
