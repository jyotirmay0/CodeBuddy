package com.example.codebuddy.models

data class ApiResponse<T>(
    val statusCode: Int,
    val data: T?,
    val message: String

)
