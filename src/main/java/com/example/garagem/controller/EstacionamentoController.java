package com.example.garagem.controller;

import com.example.garagem.dto.ConfigRequest;
import com.example.garagem.dto.EntradaRequest;
import com.example.garagem.dto.SaidaRequest;
import com.example.garagem.dto.StatusResponse;
import com.example.garagem.model.Registro;
import com.example.garagem.model.Veiculo;
import com.example.garagem.service.EstacionamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EstacionamentoController {

    private final EstacionamentoService service;

    public EstacionamentoController(EstacionamentoService service) {
        this.service = service;
    }

    @GetMapping("/status")
    public StatusResponse getStatus() {
        return new StatusResponse(
                service.getCapacidade(),
                service.getOcupadas(),
                service.getDisponiveis(),
                service.listarVagasDisponiveis(),
                service.listarOcupacoes()
        );
    }

    @PostMapping("/entrada")
    public ResponseEntity<?> registrarEntrada(@Valid @RequestBody EntradaRequest req) {
        try {
            Veiculo v = new Veiculo(req.getNomeCliente(), req.getModelo(), req.getCor(), req.getPlaca(), req.getTipo());
            Registro reg = service.registrarEntrada(v);
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensagem", "Entrada registrada com sucesso");
            resp.put("numeroVaga", reg.getNumeroVaga());
            resp.put("registro", reg);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/saida")
    public ResponseEntity<?> registrarSaida(@Valid @RequestBody SaidaRequest req) {
        try {
            Registro reg;
            if (req.getNumeroVaga() != null) {
                reg = service.registrarSaidaPorVaga(req.getNumeroVaga());
            } else if (req.getPlaca() != null && !req.getPlaca().isBlank()) {
                reg = service.registrarSaidaPorPlaca(req.getPlaca());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", "Informe a placa ou o número da vaga."));
            }
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensagem", "Saída registrada com sucesso");
            resp.put("numeroVagaLiberada", reg.getNumeroVaga());
            resp.put("registro", reg);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/config")
    public ResponseEntity<?> atualizarConfig(@Valid @RequestBody ConfigRequest req) {
        try {
            service.setCapacidade(req.getCapacidade());
            return ResponseEntity.ok(Map.of("mensagem", "Capacidade atualizada", "capacidade", service.getCapacidade()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", e.getMessage()));
        }
    }
}
