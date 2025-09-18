package com.example.garagem.service;

import com.example.garagem.model.Registro;
import com.example.garagem.model.Veiculo;
import com.example.garagem.model.TipoVeiculo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EstacionamentoService {
    private int capacidade = 30; // padrão
    private final Map<Integer, Registro> ocupacoes = new HashMap<>(); // vaga -> registro
    private final Map<String, Integer> placaParaVaga = new HashMap<>(); // placa -> vaga

    public synchronized int getCapacidade() { return capacidade; }

    public synchronized void setCapacidade(int novaCapacidade) {
        if (novaCapacidade < getOcupadas()) {
            throw new IllegalArgumentException("Nova capacidade menor que vagas ocupadas.");
        }
        this.capacidade = novaCapacidade;
        // Remover registros em vagas acima do novo limite (não deve ocorrer pois validamos)
        ocupacoes.keySet().removeIf(vaga -> vaga > capacidade);
    }

    public synchronized int getOcupadas() {
        return ocupacoes.size();
    }

    public synchronized int getDisponiveis() {
        return capacidade - ocupacoes.size();
    }

    public synchronized List<Integer> listarVagasDisponiveis() {
        Set<Integer> ocupadas = ocupacoes.keySet();
        List<Integer> livres = new ArrayList<>();
        for (int i = 1; i <= capacidade; i++) {
            if (!ocupadas.contains(i)) livres.add(i);
        }
        return livres;
    }

    public synchronized List<Registro> listarOcupacoes() {
        return ocupacoes.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());
    }

    public synchronized Optional<Registro> buscarPorPlaca(String placa) {
        Integer vaga = placaParaVaga.get(placa.toUpperCase());
        if (vaga == null) return Optional.empty();
        return Optional.ofNullable(ocupacoes.get(vaga));
    }

    public synchronized Registro registrarEntrada(Veiculo veiculo) {
        // Validações por tipo
        if (veiculo.getTipo() == null) {
            throw new IllegalStateException("Tipo do veículo é obrigatório.");
        }
        String placaKey = null;
        if (veiculo.getTipo() == TipoVeiculo.CARRO || veiculo.getTipo() == TipoVeiculo.MOTO) {
            if (veiculo.getPlaca() == null || veiculo.getPlaca().isBlank()) {
                throw new IllegalStateException("Placa é obrigatória para carro ou moto.");
            }
            placaKey = veiculo.getPlaca().toUpperCase();
            if (placaParaVaga.containsKey(placaKey)) {
                throw new IllegalStateException("Veículo já está estacionado.");
            }
        }
        if (getDisponiveis() <= 0) {
            throw new IllegalStateException("Estacionamento lotado.");
        }
        int vaga = listarVagasDisponiveis().get(0); // primeira disponível
        Registro reg = new Registro(vaga, veiculo, LocalDateTime.now());
        ocupacoes.put(vaga, reg);
        if (placaKey != null) {
            placaParaVaga.put(placaKey, vaga);
        }
        return reg;
    }

    public synchronized Registro registrarSaidaPorPlaca(String placa) {
        String placaKey = placa.toUpperCase();
        Integer vaga = placaParaVaga.get(placaKey);
        if (vaga == null) {
            throw new NoSuchElementException("Veículo não encontrado no estacionamento.");
        }
        Registro reg = ocupacoes.get(vaga);
        reg.setSaida(LocalDateTime.now());
        // libera vaga
        ocupacoes.remove(vaga);
        placaParaVaga.remove(placaKey);
        return reg;
    }

    public synchronized Registro registrarSaidaPorVaga(int numeroVaga) {
        Registro reg = ocupacoes.get(numeroVaga);
        if (reg == null) {
            throw new NoSuchElementException("Vaga informada não está ocupada.");
        }
        reg.setSaida(LocalDateTime.now());
        ocupacoes.remove(numeroVaga);
        // remover index por placa se houver
        if (reg.getVeiculo().getPlaca() != null && !reg.getVeiculo().getPlaca().isBlank()) {
            placaParaVaga.remove(reg.getVeiculo().getPlaca().toUpperCase());
        }
        return reg;
    }
}
