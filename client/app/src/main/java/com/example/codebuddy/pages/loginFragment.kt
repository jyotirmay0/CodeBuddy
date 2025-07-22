package com.example.codebuddy.pages

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import com.example.codebuddy.R
import com.example.codebuddy.databinding.FragmentLoginBinding

import android.widget.Toast
import androidx.lifecycle.lifecycleScope

import com.example.codebuddy.RetrofitClient

import com.example.codebuddy.models.LoginRequest
import kotlinx.coroutines.launch

class loginFragment : Fragment() {

    private lateinit var binding: FragmentLoginBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentLoginBinding.inflate(inflater, container, false)

        binding.signInButton.setOnClickListener {
            val email = binding.emailEditText.text.toString().trim()
            val password = binding.passwordEditText.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(requireContext(), "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    val loginResponse = RetrofitClient.api.login(LoginRequest(email, password))
                    if (loginResponse.isSuccessful) {
                        val tokens = loginResponse.body()?.data
                        // TODO: Save tokens securely
                        Toast.makeText(requireContext(), "Login successful!", Toast.LENGTH_SHORT).show()
                        findNavController().navigate(R.id.action_loginFragment_to_homeFragment)
                    } else {
                        Toast.makeText(requireContext(),
                            loginResponse.body()?.message ?: "Login failed",
                            Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(requireContext(),
                        "Error: ${e.localizedMessage}",
                        Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.signUpButton.setOnClickListener {
            findNavController().navigate(R.id.action_loginFragment_to_signupFragment2)
        }

        return binding.root
    }

}