import React, { useState } from 'react';
import { Code, Copy, Check, X, Sparkles, Terminal } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lastSpokenText: string;
  lastStatusText: string;
  lastTTSOutput: string;
}

const KOTLIN_CODE = `package com.example.phoneagent

import android.content.Intent
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import java.util.Locale

class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    private lateinit var statusText: TextView
    private lateinit var voiceButton: Button
    private lateinit var tts: TextToSpeech

    private val voiceLauncher =
        registerForActivityResult(
            androidx.activity.result.contract.ActivityResultContracts
                .StartActivityForResult()
        ) { result ->

            val spokenText = result.data
                ?.getStringArrayListExtra(
                    RecognizerIntent.EXTRA_RESULTS
                )
                ?.firstOrNull()

            if (!spokenText.isNullOrBlank()) {
                statusText.text = "You said: $spokenText"
                handleCommand(spokenText)
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.statusText)
        voiceButton = findViewById(R.id.voiceButton)

        tts = TextToSpeech(this, this)

        voiceButton.setOnClickListener {
            startVoice()
        }
    }

    private fun startVoice() {
        val intent = Intent(
            RecognizerIntent.ACTION_RECOGNIZE_SPEECH
        )
        intent.putExtra(
            RecognizerIntent.EXTRA_LANGUAGE_MODEL,
            RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
        )
        // Latest Hindi (hi-IN) and English voice access
        intent.putExtra(
            RecognizerIntent.EXTRA_LANGUAGE,
            "hi-IN"
        )
        intent.putExtra(
            RecognizerIntent.EXTRA_PROMPT,
            "क्या करना है बताइए (Say what to do)"
        )
        voiceLauncher.launch(intent)
    }

    private fun handleCommand(command: String) {
        val text = command
            .lowercase(Locale.getDefault())
            .trim()

        when {
            text.contains("youtube") ||
            text.contains("यूट्यूब") -> {
                speak("यूट्यूब खोल रहा हूँ")
                openApp("com.google.android.youtube")
            }

            text.contains("whatsapp") ||
            text.contains("व्हाट्सएप") ||
            text.contains("व्हाट्सऐप") -> {
                speak("व्हाट्सएप खोल रहा हूँ")
                openApp("com.whatsapp")
            }

            text.contains("chrome") ||
            text.contains("क्रोम") -> {
                speak("क्रोम खोल रहा हूँ")
                openApp("com.android.chrome")
            }

            text.contains("camera") ||
            text.contains("कैमरा") -> {
                speak("कैमरा खोल रहा हूँ")
                val intent =
                    Intent("android.media.action.IMAGE_CAPTURE")
                startActivity(intent)
            }

            text.contains("settings") ||
            text.contains("सेटिंग्स") -> {
                speak("सेटिंग्स खोल रहा हूँ")
                startActivity(
                    Intent(
                        android.provider.Settings
                            .ACTION_SETTINGS
                    )
                )
            }

            text.contains("call") ||
            text.contains("कॉल") ||
            text.contains("फोन") -> {
                speak("कॉल शुरू कर रहा हूँ")
                val callIntent = Intent(Intent.ACTION_CALL)
                startActivity(callIntent)
            }

            else -> {
                statusText.text =
                    "Command recognized: \\"$command\\""
                speak(
                    "मुझे कमांड समझ आई, लेकिन यह ऐप फोन में नहीं मिला"
                )
            }
        }
    }

    private fun openApp(packageName: String) {
        val launchIntent =
            packageManager.getLaunchIntentForPackage(
                packageName
            )

        if (launchIntent != null) {
            startActivity(launchIntent)
        } else {
            speak("यह ऐप फोन में इंस्टॉल नहीं है")
            statusText.text = "App not installed on device."
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale("hi", "IN")
        }
    }

    private fun speak(message: String) {
        tts.speak(
            message,
            TextToSpeech.QUEUE_FLUSH,
            null,
            null
        )
    }

    override fun onDestroy() {
        if (::tts.isInitialized) {
            tts.stop()
            tts.shutdown()
        }
        super.onDestroy()
    }
}`;

export const KotlinCodeViewerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lastSpokenText,
  lastStatusText,
  lastTTSOutput,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(KOTLIN_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                MainActivity.kt
                <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                  com.example.phoneagent
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Active Android Kotlin implementation with Bengali RecognizerIntent &amp; TextToSpeech
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live VM State Monitor */}
        <div className="bg-slate-950/90 border-b border-slate-800 p-3 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">spokenText (RecognizerIntent)</span>
            <span className="text-emerald-400 font-medium truncate block">
              {lastSpokenText || 'None yet'}
            </span>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">statusText (TextView)</span>
            <span className="text-slate-200 truncate block">
              {lastStatusText || 'কী করতে হবে বলুন (Waiting)'}
            </span>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">tts.speak (Locale("bn", "IN"))</span>
            <span className="text-purple-300 truncate block">
              {lastTTSOutput || 'Initialized'}
            </span>
          </div>
        </div>

        {/* Code Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs leading-relaxed">
          <pre className="text-slate-300">
            <code>{KOTLIN_CODE}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
