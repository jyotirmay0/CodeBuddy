package com.example.codebuddy.pages

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.codebuddy.R
import com.example.codebuddy.RetrofitClient
import com.example.codebuddy.databinding.FragmentSignupBinding
import com.example.codebuddy.models.OtpRequest
import com.example.codebuddy.models.RegisterRequest
import kotlinx.coroutines.launch

class signupFragment :Fragment(){


        private lateinit var binding: FragmentSignupBinding

        override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?
        ): View {
            binding = FragmentSignupBinding.inflate(inflater, container, false)

            binding.signUpButton.setOnClickListener {
                val username = binding.usernameEditText.text.toString().trim()
                val email = binding.emailEditText.text.toString().trim()
                val password = binding.passwordEditText.text.toString().trim()

                if (username.isEmpty() || email.isEmpty() || password.isEmpty()) {
                    Toast.makeText(requireContext(), "All fields are required", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }

                lifecycleScope.launch {
                    try {
                        val registerResponse = RetrofitClient.api.register(RegisterRequest(username, email, password))
                        if (registerResponse.isSuccessful) {
                            // On successful registration, send OTP
                            val otpResponse = RetrofitClient.api.sendOtp(OtpRequest(email))
                            if (otpResponse.isSuccessful) {
                                Toast.makeText(requireContext(), "OTP sent to your email", Toast.LENGTH_SHORT).show()

                                // Navigate to OTP fragment, passing the email as argument
                                val bundle = Bundle().apply {
                                    putString("email", email)
                                }
                                findNavController().navigate(R.id.action_signupFragment_to_otpFragment, bundle)

                            } else {
                                Toast.makeText(requireContext(), otpResponse.body()?.message ?: "Failed to send OTP", Toast.LENGTH_SHORT).show()
                            }
                        } else {
                            Toast.makeText(requireContext(), registerResponse.body()?.message ?: "Registration failed", Toast.LENGTH_SHORT).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(requireContext(), "Error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                    }
                }
            }

            binding.signInButton.setOnClickListener {
                findNavController().navigate(R.id.action_signupFragment_to_loginFragment)
            }

            return binding.root
        }
    }

