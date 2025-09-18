package com.example.garagem.dto;

import com.example.garagem.model.Registro;

import java.util.List;

public class StatusResponse {
    private int capacidade;
    private int ocupadas;
    private int disponiveis;
    private List<Integer> vagasDisponiveis;
    private List<Registro> ocupacoes;

    public StatusResponse(int capacidade, int ocupadas, int disponiveis, List<Integer> vagasDisponiveis, List<Registro> ocupacoes) {
        this.capacidade = capacidade;
        this.ocupadas = ocupadas;
        this.disponiveis = disponiveis;
        this.vagasDisponiveis = vagasDisponiveis;
        this.ocupacoes = ocupacoes;
    }

    public int getCapacidade() { return capacidade; }
    public int getOcupadas() { return ocupadas; }
    public int getDisponiveis() { return disponiveis; }
    public List<Integer> getVagasDisponiveis() { return vagasDisponiveis; }
    public List<Registro> getOcupacoes() { return ocupacoes; }
}
