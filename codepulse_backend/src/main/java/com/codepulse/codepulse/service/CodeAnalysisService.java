package com.codepulse.codepulse.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codepulse.codepulse.dto.CodeRequest;
import com.codepulse.codepulse.dto.CodeResponse;
import com.codepulse.codepulse.Entities.CodeAnalysis;
import com.codepulse.codepulse.repository.CodeAnalysisRepository;

import java.util.List;

@Service
public class CodeAnalysisService {

    @Autowired
    private CodeAnalysisRepository codeAnalysisRepository;

    public CodeResponse analyze(CodeRequest request) {
        String code = request.getCode();
        String[] lines = code.split("\n");
        int lineCount = lines.length;

        //Proper nested loop detection
        int loopCount = 0;
        boolean hasNestedLoop = false;
        int loopDepth = 0;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;

            boolean isLoop = trimmed.startsWith("for") ||
                             trimmed.startsWith("while") ||
                             trimmed.startsWith("do ");

            if (isLoop) {
                loopCount++;
                if (loopDepth > 0) {
                    hasNestedLoop = true;
                }
                loopDepth++;
            }

            for (char c : trimmed.toCharArray()) {
                if (c == '}') {
                    if (loopDepth > 0) {
                        loopDepth--;
                    }
                }
            }
        }

        //Complexity
        CodeResponse response = new CodeResponse();
        response.setLines(lineCount);
        response.setLoops(loopCount);

        if (hasNestedLoop) {
            response.setComplexity("O(n^2)");
        } else if (loopCount >= 1) {
            response.setComplexity("O(n)");
        } else {
            response.setComplexity("O(1)");
        }

        // Duplicate detection
        int duplicateLines = 0;
        for (int i = 0; i < lines.length; i++) {
            String lineI = lines[i].trim();
            if (lineI.isEmpty() || lineI.equals("{") || lineI.equals("}") ||
                lineI.startsWith("//") || lineI.startsWith("*") ||
                lineI.startsWith("/*") || lineI.startsWith("import") ||
                lineI.startsWith("package")) {
                continue;
            }
            for (int j = i + 1; j < lines.length; j++) {
                String lineJ = lines[j].trim();
                if (lineJ.isEmpty() || lineJ.equals("{") || lineJ.equals("}") ||
                    lineJ.startsWith("//") || lineJ.startsWith("*") ||
                    lineJ.startsWith("/*")) {
                    continue;
                }
                if (lineI.equals(lineJ)) {
                    duplicateLines++;
                    break;
                }
            }
        }
        response.setDuplicateLines(duplicateLines);

        //Quality Score
        int qualityScore = 100;
        if (hasNestedLoop) qualityScore -= 20;
        qualityScore -= (loopCount * 3);
        qualityScore -= (duplicateLines * 2);
        if (qualityScore < 0) qualityScore = 0;
        response.setQualityScore(qualityScore);

        //Productivity Score
        int productivityScore = qualityScore;
        if (lineCount > 200) productivityScore -= 10;
        if (lineCount < 5) productivityScore -= 20;
        if (productivityScore < 0) productivityScore = 0;
        if (productivityScore > 100) productivityScore = 100;
        response.setProductivityScore(productivityScore);

        //Save ALL fields to Database
        CodeAnalysis analysis = new CodeAnalysis();
        analysis.setLines(lineCount);
        analysis.setLoops(loopCount);
        analysis.setComplexity(response.getComplexity());
        analysis.setDuplicateLines(duplicateLines);
        analysis.setQualityScore(qualityScore);
        analysis.setProductivityScore(productivityScore); // ✅ Fix!
        codeAnalysisRepository.save(analysis);

        return response;
    }

    public List<CodeAnalysis> getHistory() {
        return codeAnalysisRepository.findAll();
    }

    public void deleteHistory(Long id) {
        codeAnalysisRepository.deleteById(id);
    }
}