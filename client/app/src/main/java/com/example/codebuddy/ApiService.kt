package com.example.codebuddy

import com.example.codebuddy.models.ApiResponse
import com.example.codebuddy.models.LoginRequest
import com.example.codebuddy.models.LoginResponse
import com.example.codebuddy.models.OtpRequest
import com.example.codebuddy.models.RegisterRequest
import com.example.codebuddy.models.VerifyOtpRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<Unit>>

    @POST("send-otp")
    suspend fun sendOtp(@Body request: OtpRequest): Response<ApiResponse<Unit>>

    @POST("verify-otp")
    suspend fun verifyOtp(@Body request: VerifyOtpRequest): Response<ApiResponse<LoginResponse>>

    @POST("login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<LoginResponse>>
}