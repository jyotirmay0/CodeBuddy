package com.example.codebuddy.pages

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import com.example.codebuddy.R
import com.example.codebuddy.RetrofitClient
import com.example.codebuddy.databinding.FragmentOtpBinding
import com.example.codebuddy.models.VerifyOtpRequest
import kotlinx.coroutines.launch

class OtpFragment : Fragment() {

    private lateinit var binding: FragmentOtpBinding
   // To get email passed from signup
    private var email: String? = null
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentOtpBinding.inflate(inflater, container, false)

        // Get email from arguments once
        email = arguments?.getString("email")

        binding.otpVerify.setOnClickListener {
            val otp = binding.otpEditText.text.toString().trim()
            if (otp.isEmpty()) {
                Toast.makeText(requireContext(), "Please enter OTP", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (email.isNullOrEmpty()) {
                Toast.makeText(requireContext(), "Email not received", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    val verifyResponse = RetrofitClient.api.verifyOtp(VerifyOtpRequest(email!!, otp))
                    if (verifyResponse.isSuccessful) {
                        Toast.makeText(requireContext(), "OTP Verified! Registration Complete", Toast.LENGTH_SHORT).show()
                        findNavController().navigate(R.id.action_otpFragment_to_homeFragment)
                    } else {
                        Toast.makeText(requireContext(), verifyResponse.body()?.message ?: "Invalid OTP", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(requireContext(), "Error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        return binding.root
    }

}
