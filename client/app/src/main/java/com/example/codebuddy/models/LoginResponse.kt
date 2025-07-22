package com.example.codebuddy.models

data class LoginResponse (
    val accessToken: String,
    val refreshToken: String
)