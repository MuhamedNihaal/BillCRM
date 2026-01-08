import CryptoJS from "crypto-js";

class DeviceFingerprint {
  async getFingerprint() {
    const components = [
      navigator.userAgent || "unknown",
      screen.colorDepth || "unknown",
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || "unknown",
      navigator.deviceMemory || "unknown",
      this.#getWebGLInfo(),
      await this.#getAudioFingerprint(),
    ];

    const dataString = components.join("||");
    return await this.#hashString(dataString);
  }

  async #hashString(input) {
    return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
    // if (!window.crypto?.subtle?.digest) return btoa(input);
    // const encoder = new TextEncoder();
    // const data = encoder.encode(input);
    // const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    // return Array.from(new Uint8Array(hashBuffer))
    //   .map((b) => b.toString(16).padStart(2, "0"))
    //   .join("");
  }

  #getWebGLInfo() {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "No WebGL";

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      const vendor = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : "UnknownVendor";
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : "UnknownRenderer";
      return `${vendor} | ${renderer}`;
    } catch {
      return "WebGLError";
    }
  }

  async #getAudioFingerprint() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return "NoAudioCtx";

      const audioCtx = new AudioCtx();
      const oscillator = audioCtx.createOscillator();
      const analyser = audioCtx.createAnalyser();
      const gain = audioCtx.createGain();

      oscillator.connect(gain);
      gain.connect(analyser);
      analyser.connect(audioCtx.destination);

      oscillator.start();
      gain.gain.value = 0;
      analyser.fftSize = 256;

      const buffer = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(buffer);
      oscillator.stop();
      audioCtx.close();

      return buffer.slice(0, 5).join(",");
    } catch {
      return "AudioError";
    }
  }
}

export default new DeviceFingerprint();
