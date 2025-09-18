package com.example.garagem.dto;

import jakarta.validation.constraints.Min;

public class ConfigRequest {
    @Min(1)
    private int capacidade;

    public int getCapacidade() { return capacidade; }
    public void setCapacidade(int capacidade) { this.capacidade = capacidade; }
}
