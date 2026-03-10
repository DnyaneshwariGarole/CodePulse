package com.codepulse.codepulse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.codepulse.codepulse.dto.CodeRequest;
import com.codepulse.codepulse.dto.CodeResponse;
import com.codepulse.codepulse.service.CodeAnalysisService;
import com.codepulse.codepulse.Entities.CodeAnalysis;

import java.util.List;

@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = "http://localhost:3000")
public class CodeAnalysisController {

    @Autowired
    private CodeAnalysisService codeAnalysisService;

    //Analyze Code
    @PostMapping("/analyze")
    public CodeResponse analyze(@RequestBody CodeRequest request) {
        return codeAnalysisService.analyze(request);
    }

    //Get History
    @GetMapping("/history")
    public List<CodeAnalysis> getHistory() {
        return codeAnalysisService.getHistory();
    }

    // Delete History 
    @DeleteMapping("/history/{id}")
    public ResponseEntity<String> deleteHistory(@PathVariable Long id) {
        codeAnalysisService.deleteHistory(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}