package com.example.garagem.model;

import jakarta.validation.constraints.NotBlank;

public class Veiculo {
    @NotBlank
    private String nomeCliente;
    @NotBlank
    private String modelo;
    @NotBlank
    private String cor;
    private String placa; // opcional para BIKE
    private TipoVeiculo tipo;

    public Veiculo() {}

    public Veiculo(String nomeCliente, String modelo, String cor, String placa, TipoVeiculo tipo) {
        this.nomeCliente = nomeCliente;
        this.modelo = modelo;
        this.cor = cor;
        this.placa = placa;
        this.tipo = tipo;
    }

    public String getNomeCliente() { return nomeCliente; }
    public void setNomeCliente(String nomeCliente) { this.nomeCliente = nomeCliente; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public String getCor() { return cor; }
    public void setCor(String cor) { this.cor = cor; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public TipoVeiculo getTipo() { return tipo; }
    public void setTipo(TipoVeiculo tipo) { this.tipo = tipo; }
}
