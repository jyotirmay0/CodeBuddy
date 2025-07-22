package com.example.codebuddy.models

data class VerifyOtpRequest(
    val email: String,
    val otp: String
)
