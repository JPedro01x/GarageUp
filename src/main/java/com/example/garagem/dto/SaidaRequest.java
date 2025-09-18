package com.example.garagem.dto;

public class SaidaRequest {
    private String placa; // opcional
    private Integer numeroVaga; // alternativo

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public Integer getNumeroVaga() { return numeroVaga; }
    public void setNumeroVaga(Integer numeroVaga) { this.numeroVaga = numeroVaga; }
}
