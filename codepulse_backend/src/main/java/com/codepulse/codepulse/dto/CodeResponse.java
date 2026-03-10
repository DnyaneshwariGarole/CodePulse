package com.codepulse.codepulse.dto;

public class CodeResponse {

    private int lines;
    private int loops;
    private String complexity;
    private int qualityScore;
    private int duplicateLines;
    private int productivityScore;
    private String warning;
    

    public int getLines() {
        return lines;
    }

    public void setLines(int lines) {
        this.lines = lines;
    }

    public int getLoops() {
        return loops;
    }

    public void setLoops(int loops) {
        this.loops = loops;
    }

    public String getComplexity() {
        return complexity;
    }

    public void setComplexity(String complexity) {
        this.complexity = complexity;
    }

    public int getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(int qualityScore) {
        this.qualityScore = qualityScore;
    }
    
    public int getDuplicateLines() {
        return duplicateLines;
    }

    public void setDuplicateLines(int duplicateLines) {
        this.duplicateLines = duplicateLines;
    }
    
    public int getProductivityScore() {
        return productivityScore;
    }

    public void setProductivityScore(int productivityScore) {
        this.productivityScore = productivityScore;
    }
    
    public String getWarning() {
        return warning;
    }

    public void setWarning(String warning) {
        this.warning = warning;
    }
}