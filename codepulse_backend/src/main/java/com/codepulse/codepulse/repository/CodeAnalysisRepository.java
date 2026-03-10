package com.codepulse.codepulse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.codepulse.codepulse.Entities.CodeAnalysis;

public interface CodeAnalysisRepository extends JpaRepository<CodeAnalysis, Long> {
}