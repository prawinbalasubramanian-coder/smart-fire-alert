// API Service for AI Smart Fire Alert System
// Handles communication with FastAPI backend with seamless frontend simulation fallback

const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const defaultApiUrl = isHttps ? '' : 'http://localhost:8000/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultApiUrl;

// Realistic baseline profiles for software simulation
export const SIMULATION_PROFILES = {
  SAFE: {
    temperature: 24.5,
    tempJitter: 1.2,
    humidity: 58.0,
    humJitter: 2.0,
    smoke: 115,
    smokeJitter: 15,
    flame: false,
    prediction: 'SAFE',
    confidence: 0.978,
    probabilities: { safe: 0.978, warning: 0.021, danger: 0.001 },
    response: {
      pump: 'OFF',
      relay: 'OFF',
      servo: 'NORMAL',
      buzzer: 'OFF',
      led: 'GREEN'
    },
    aiAlert: 'Zone 1 is currently SAFE. Temperature, humidity, and atmospheric smoke readings remain well within normal environmental baseline parameters. No fire signatures detected.'
  },
  WARNING: {
    temperature: 41.8,
    tempJitter: 1.8,
    humidity: 38.0,
    humJitter: 2.5,
    smoke: 410,
    smokeJitter: 35,
    flame: false,
    prediction: 'WARNING',
    confidence: 0.892,
    probabilities: { safe: 0.081, warning: 0.892, danger: 0.027 },
    response: {
      pump: 'OFF',
      relay: 'OFF',
      servo: 'NORMAL',
      buzzer: 'INTERMITTENT',
      led: 'YELLOW'
    },
    aiAlert: 'WARNING detected in Zone 1. Elevated thermal gradient (41.8°C) and moderate smoke particle concentration (410 PPM) observed. Pre-combustion hazard suspected. Inspection recommended.'
  },
  DANGER: {
    temperature: 58.6,
    tempJitter: 2.5,
    humidity: 26.0,
    humJitter: 3.0,
    smoke: 845,
    smokeJitter: 50,
    flame: true,
    prediction: 'DANGER',
    confidence: 0.984,
    probabilities: { safe: 0.002, warning: 0.014, danger: 0.984 },
    response: {
      pump: 'ON',
      relay: 'ON',
      servo: 'SPRAY POSITION',
      buzzer: 'ON',
      led: 'RED'
    },
    aiAlert: 'CRITICAL FIRE DANGER detected in Zone 1! Active optical flame signature confirmed with heavy smoke density (845 PPM) and critical temperature spike (58.6°C). Automatic suppression system activated: DC water pump ON, spray servo deployed, audible siren engaged.'
  }
};

// Check if backend is reachable
export async function checkBackendHealth() {
  if (!API_BASE_URL) {
    return { online: false, data: null };
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const response = await fetch(`${API_BASE_URL}/status`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      return { online: true, data };
    }
  } catch {
    // Backend is offline, run in local simulation mode
  }
  return { online: false, data: null };
}

// Generate realistic simulated reading from profile
export function generateSimulatedReading(profileKey, customOverrides = null) {
  const base = SIMULATION_PROFILES[profileKey] || SIMULATION_PROFILES.SAFE;
  
  // Add subtle Gaussian-like jitter for realistic sensor fluctuations
  const tempRand = (Math.random() - 0.5) * 2 * base.tempJitter;
  const humRand = (Math.random() - 0.5) * 2 * base.humJitter;
  const smokeRand = Math.round((Math.random() - 0.5) * 2 * base.smokeJitter);

  let temp = +(base.temperature + tempRand).toFixed(1);
  let hum = Math.min(99, Math.max(10, Math.round(base.humidity + humRand)));
  let smoke = Math.max(20, Math.round(base.smoke + smokeRand));
  let flame = base.flame;

  if (customOverrides) {
    if (customOverrides.temperature !== undefined) temp = customOverrides.temperature;
    if (customOverrides.humidity !== undefined) hum = customOverrides.humidity;
    if (customOverrides.smoke !== undefined) smoke = customOverrides.smoke;
    if (customOverrides.flame !== undefined) flame = customOverrides.flame;
  }

  // Determine prediction based on values if customized
  let prediction = base.prediction;
  let confidence = base.confidence;
  let probabilities = { ...base.probabilities };
  let response = { ...base.response };
  let aiAlert = base.aiAlert;

  if (customOverrides) {
    if (flame || (temp > 50 && smoke > 600)) {
      prediction = 'DANGER';
      confidence = 0.985;
      probabilities = { safe: 0.002, warning: 0.013, danger: 0.985 };
      response = { pump: 'ON', relay: 'ON', servo: 'SPRAY POSITION', buzzer: 'ON', led: 'RED' };
      aiAlert = `CRITICAL FIRE DANGER detected in Zone 1! Active flame: ${flame ? 'DETECTED' : 'NOT DETECTED'}, Smoke: ${smoke} PPM, Temp: ${temp}°C. Autonomous suppression activated.`;
    } else if (temp > 38 || smoke > 300) {
      prediction = 'WARNING';
      confidence = 0.912;
      probabilities = { safe: 0.065, warning: 0.912, danger: 0.023 };
      response = { pump: 'OFF', relay: 'OFF', servo: 'NORMAL', buzzer: 'INTERMITTENT', led: 'YELLOW' };
      aiAlert = `WARNING condition in Zone 1. Smoke (${smoke} PPM) or Temp (${temp}°C) above safe operating threshold. Intermittent buzzer active.`;
    } else {
      prediction = 'SAFE';
      confidence = 0.976;
      probabilities = { safe: 0.976, warning: 0.022, danger: 0.002 };
      response = { pump: 'OFF', relay: 'OFF', servo: 'NORMAL', buzzer: 'OFF', led: 'GREEN' };
      aiAlert = `Zone 1 is SAFE. Temperature (${temp}°C) and smoke level (${smoke} PPM) are normal.`;
    }
  }

  return {
    timestamp: new Date().toLocaleTimeString(),
    zone: 'Zone 1',
    temperature: temp,
    humidity: hum,
    smoke: smoke,
    flame: flame,
    prediction: prediction,
    confidence: confidence,
    probabilities: probabilities,
    response: response,
    aiAlert: aiAlert
  };
}
