package com.codepulse.codepulse.Entities;

import jakarta.persistence.*;

@Entity
public class CodeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int lines;
    private int loops;
    private String complexity;

    private int duplicateLines = 0;
    private int qualityScore = 0;
    private int productivityScore = 0;
  
  
    // ID
    public Long getId() {
        return id;
    }

    // Lines
    public int getLines() {
        return lines;
    }
    public void setLines(int lines) {
        this.lines = lines;
    }

    // Loops
    public int getLoops() {
        return loops;
    }
    public void setLoops(int loops) {
        this.loops = loops;
    }

    // Complexity
    public String getComplexity() {
        return complexity;
    }
    public void setComplexity(String complexity) {
        this.complexity = complexity;
    }

    //Duplicate Lines
    public int getDuplicateLines() {
        return duplicateLines;
    }
    public void setDuplicateLines(int duplicateLines) {
        this.duplicateLines = duplicateLines;
    }

    // Quality Score
    public int getQualityScore() {
        return qualityScore;
    }
    public void setQualityScore(int qualityScore) {
        this.qualityScore = qualityScore;
    }

    // Productivity Score
    public int getProductivityScore() {
        return productivityScore;
    }
    public void setProductivityScore(int productivityScore) {
        this.productivityScore = productivityScore;
    }
}