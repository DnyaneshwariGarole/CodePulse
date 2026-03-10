package com.codepulse.codepulse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.codepulse.codepulse.Entities.User;

public interface UserRepo extends  JpaRepository<User, Long>  {
    User findByEmail(String email);

}