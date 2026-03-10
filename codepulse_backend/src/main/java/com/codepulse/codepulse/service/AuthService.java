package com.codepulse.codepulse.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codepulse.codepulse.dto.SignupRequest;
import com.codepulse.codepulse.Entities.User;
import com.codepulse.codepulse.repository.UserRepo;

@Service
public class AuthService {

    @Autowired
    private UserRepo userRepository;

    //SIGNUP
    public String signup(SignupRequest request) {
        // Check if all fields are filled
        if (request.getName() == null || request.getName().isEmpty()) {
            return "Name is required";
        }
        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            return "Email is required";
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            return "Password is required";
        }

        // Check if email already exists
        User existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser != null) {
            return "Email already exists";
        }

        // Save new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        userRepository.save(user);

        return "User Registered Successfully";
    }

    //LOGIN
    public String login(SignupRequest request) {
        // Check if fields are filled
        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            return "Email is required";
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            return "Password is required";
        }

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null) {
            return "User not found! Please register first";
        }

        // Check password
        if (!user.getPassword().equals(request.getPassword())) {
            return "Invalid password";
        }

        return "Login Successful";
    }
}