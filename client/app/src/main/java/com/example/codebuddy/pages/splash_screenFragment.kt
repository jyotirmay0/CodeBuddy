package com.example.codebuddy.pages

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import com.example.codebuddy.R
import com.example.codebuddy.databinding.FragmentSplashScreenBinding


class splash_screenFragment : Fragment() {


    lateinit var binding:FragmentSplashScreenBinding
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentSplashScreenBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        Handler(Looper.getMainLooper()).postDelayed({
            if (isAdded) { // Ensure fragment is still attached to NavController
                findNavController().navigate(R.id.action_splash_screenFragment_to_signupFragment)
            }
        }, 3000)
    }

}