import { useState } from "react";

const BOOKING_URL = "https://reserva.clinicalascondes.cl/AgendaWeb/consulta-medica";

// ── PREGUNTAS DEL CUESTIONARIO ──────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "age",
    section: "Datos generales",
    text: "¿Cuántos años tiene usted?",
    type: "number",
    placeholder: "Ej: 58",
    key: "age",
  },
  {
    id: "surgery_type",
    section: "Datos generales",
    text: "¿Qué tipo de cirugía tiene programada?",
    type: "select",
    key: "surgery_type",
    options: [
      { value: "ambulatoria_menor", label: "Cirugía ambulatoria / procedimiento menor (< 1 hora)" },
      { value: "intermedia", label: "Cirugía de mediana complejidad (1–3 horas)" },
      { value: "mayor", label: "Cirugía mayor / de alta complejidad (> 3 horas o cavidad)" },
      { value: "no_se", label: "No lo sé / me lo indicó el médico" },
    ],
  },
  {
    id: "asa_hint_heart",
    section: "Antecedentes cardiovasculares",
    text: "¿Tiene usted alguno de los siguientes antecedentes cardíacos?",
    type: "multicheck",
    key: "heart",
    options: [
      { value: "icc", label: "Insuficiencia cardíaca o falla cardíaca" },
      { value: "coronaria", label: "Angina, infarto al corazón o stent coronario" },
      { value: "arritmia", label: "Arritmia conocida (fibrilación auricular u otra)" },
      { value: "valvular", label: "Valvulopatía o prótesis valvular cardíaca" },
      { value: "marcapasos", label: "Marcapasos o desfibrilador implantado" },
      { value: "ninguno", label: "Ninguno de los anteriores" },
    ],
  },
  {
    id: "asa_hint_resp",
    section: "Antecedentes respiratorios",
    text: "¿Presenta alguno de estos antecedentes respiratorios?",
    type: "multicheck",
    key: "resp",
    options: [
      { value: "epoc", label: "EPOC / bronquitis crónica / enfisema" },
      { value: "asma", label: "Asma (no controlada o que requiere corticoides)" },
      { value: "saos", label: "Apnea del sueño (SAOS) con uso de CPAP o BPAP" },
      { value: "htp", label: "Hipertensión pulmonar" },
      { value: "ninguno", label: "Ninguno de los anteriores" },
    ],
  },
  {
    id: "asa_hint_metabolic",
    section: "Antecedentes metabólicos y renales",
    text: "¿Tiene alguna de estas condiciones?",
    type: "multicheck",
    key: "metabolic",
    options: [
      { value: "dm_insulina", label: "Diabetes que requiere insulina" },
      { value: "dm_oral", label: "Diabetes controlada solo con pastillas" },
      { value: "irc", label: "Insuficiencia renal crónica (en diálisis o en control nefrológico)" },
      { value: "hepatica", label: "Enfermedad hepática crónica o cirrosis" },
      { value: "ninguno", label: "Ninguno de los anteriores" },
    ],
  },
  {
    id: "bmi",
    section: "Antecedentes generales",
    text: "¿Cuánto pesa y cuánto mide aproximadamente?",
    type: "bmi",
    key: "bmi",
  },
  {
    id: "anticoag",
    section: "Medicamentos",
    text: "¿Toma alguno de estos medicamentos actualmente?",
    type: "multicheck",
    key: "anticoag",
    options: [
      { value: "anticoagulante", label: "Anticoagulantes (Warfarina, Acenocumarol, Apixabán, Rivaroxabán, Dabigatrán)" },
      { value: "antiagregante", label: "Antiagregantes plaquetarios (Aspirina, Clopidogrel, Ticagrelor)" },
      { value: "inmunosupresor", label: "Inmunosupresores o corticoides crónicos" },
      { value: "ninguno", label: "Ninguno de los anteriores" },
    ],
  },
  {
    id: "anesthesia_hx",
    section: "Antecedentes anestésicos",
    text: "¿Ha tenido usted o algún familiar directo complicaciones con anestesias anteriores?",
    type: "radio",
    key: "anesthesia_hx",
    options: [
      { value: "si_yo", label: "Sí, yo he tenido complicaciones" },
      { value: "si_familiar", label: "Sí, un familiar directo (padres, hermanos, hijos)" },
      { value: "no", label: "No, ninguna complicación conocida" },
      { value: "nunca", label: "Es mi primera cirugía / nunca me han operado" },
    ],
  },
  {
    id: "neuro",
    section: "Antecedentes neurológicos",
    text: "¿Tiene antecedentes de alguna de estas condiciones?",
    type: "multicheck",
    key: "neuro",
    options: [
      { value: "avc", label: "ACV (derrame cerebral) o AIT previo" },
      { value: "epilepsia", label: "Epilepsia o convulsiones" },
      { value: "parkison", label: "Parkinson u otra enfermedad neurodegenerativa" },
      { value: "ninguno", label: "Ninguno de los anteriores" },
    ],
  },
  {
    id: "functional",
    section: "Capacidad funcional",
    text: "En su vida diaria, ¿puede realizar estas actividades SIN quedarse sin aire ni sentir dolor de pecho?",
    type: "radio",
    key: "functional",
    options: [
      { value: "alto", label: "Sí, puedo subir escaleras o caminar rápido sin problemas (≥ 4 METs)" },
      { value: "moderado", label: "Puedo caminar en plano, pero me canso al subir escaleras (2–4 METs)" },
      { value: "bajo", label: "Me cuesta mucho hacer cualquier esfuerzo físico (< 2 METs)" },
    ],
  },
];

// ── LÓGICA DE TRIAGE ────────────────────────────────────────────────────────
function calcularTriage(answers) {
  const flags = [];
  let requiresPresencial = false;

  const age = parseInt(answers.age, 10);
  if (age >= 70) {
    requiresPresencial = true;
    flags.push("Edad mayor o igual a 70 años");
  }

  if (answers.surgery_type === "mayor") {
    requiresPresencial = true;
    flags.push("Cirugía de alta complejidad o larga duración (> 3 horas)");
  }
  if (answers.surgery_type === "no_se") {
    requiresPresencial = true;
    flags.push("Tipo de cirugía no especificado — requiere evaluación para clasificar riesgo");
  }

  const heartRisk = (answers.heart || []).filter(v => v !== "ninguno");
  if (heartRisk.length > 0) {
    requiresPresencial = true;
    heartRisk.forEach(v => {
      const labels = { icc: "Insuficiencia cardíaca", coronaria: "Cardiopatía coronaria / stent", arritmia: "Arritmia conocida", valvular: "Valvulopatía / prótesis valvular", marcapasos: "Marcapasos o DAI implantado" };
      flags.push(labels[v] || v);
    });
  }

  const respRisk = (answers.resp || []).filter(v => v !== "ninguno");
  if (respRisk.length > 0) {
    requiresPresencial = true;
    respRisk.forEach(v => {
      const labels = { epoc: "EPOC / bronquitis crónica", asma: "Asma no controlada", saos: "Apnea del sueño con CPAP", htp: "Hipertensión pulmonar" };
      flags.push(labels[v] || v);
    });
  }

  const metabolicRisk = (answers.metabolic || []).filter(v => v !== "ninguno");
  if (metabolicRisk.length > 0) {
    metabolicRisk.forEach(v => {
      if (v === "dm_insulina") { requiresPresencial = true; flags.push("Diabetes insulinorrequirente"); }
      if (v === "irc") { requiresPresencial = true; flags.push("Insuficiencia renal crónica"); }
      if (v === "hepatica") { requiresPresencial = true; flags.push("Enfermedad hepática crónica"); }
      if (v === "dm_oral") flags.push("Diabetes con hipoglicemiantes orales (a evaluar según control)");
    });
  }

  // IMC
  const peso = parseFloat(answers.peso);
  const talla = parseFloat(answers.talla);
  if (peso > 0 && talla > 0) {
    const tallam = talla / 100;
    const bmi = peso / (tallam * tallam);
    if (bmi >= 40) {
      requiresPresencial = true;
      flags.push(`Obesidad mórbida (IMC ${bmi.toFixed(1)} kg/m²)`);
    } else if (bmi >= 35) {
      requiresPresencial = true;
      flags.push(`Obesidad severa (IMC ${bmi.toFixed(1)} kg/m²)`);
    }
  }

  const anticoagRisk = (answers.anticoag || []).filter(v => v !== "ninguno");
  if (anticoagRisk.length > 0) {
    requiresPresencial = true;
    anticoagRisk.forEach(v => {
      const labels = { anticoagulante: "Terapia anticoagulante", antiagregante: "Terapia antiagregante plaquetaria", inmunosupresor: "Inmunosupresores / corticoides crónicos" };
      flags.push(labels[v] || v);
    });
  }

  if (answers.anesthesia_hx === "si_yo") {
    requiresPresencial = true;
    flags.push("Complicación anestésica personal previa");
  }
  if (answers.anesthesia_hx === "si_familiar") {
    requiresPresencial = true;
    flags.push("Antecedente familiar de complicación anestésica (posible hipertermia maligna u otra)");
  }

  const neuroRisk = (answers.neuro || []).filter(v => v !== "ninguno");
  if (neuroRisk.length > 0) {
    requiresPresencial = true;
    neuroRisk.forEach(v => {
      const labels = { avc: "ACV / AIT previo", epilepsia: "Epilepsia o convulsiones", parkison: "Enfermedad neurodegenerativa" };
      flags.push(labels[v] || v);
    });
  }

  if (answers.functional === "bajo") {
    requiresPresencial = true;
    flags.push("Capacidad funcional severamente reducida (< 2 METs)");
  }
  if (answers.functional === "moderado" && requiresPresencial) {
    flags.push("Capacidad funcional moderada (2–4 METs) — relevante en contexto de otras comorbilidades");
  }

  return { requiresPresencial, flags };
}

// ── COMPONENTES UI ───────────────────────────────────────────────────────────
const colors = {
  primary: "#0B4F8A",
  primaryLight: "#1A6BB5",
  accent: "#00A878",
  warning: "#E8A000",
  danger: "#C0392B",
  success: "#27AE60",
  bg: "#F7F9FC",
  card: "#FFFFFF",
  border: "#DDE4EF",
  text: "#1A2332",
  textLight: "#5A6A82",
  textMuted: "#8A9AB5",
};

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: "monospace" }}>
          Pregunta {current} de {total}
        </span>
        <span style={{ fontSize: 12, color: colors.primary, fontWeight: "bold", fontFamily: "monospace" }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 4, background: "#DDE4EF", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function MultiCheck({ options, value = [], onChange }) {
  const toggle = (v) => {
    if (v === "ninguno") return onChange(["ninguno"]);
    const without = value.filter(x => x !== "ninguno");
    if (without.includes(v)) onChange(without.filter(x => x !== v));
    else onChange([...without, v]);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map(opt => {
        const checked = value.includes(opt.value);
        return (
          <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${checked ? colors.primary : colors.border}`, background: checked ? "#EBF3FC" : colors.card, cursor: "pointer", transition: "all 0.15s", fontSize: 14, color: colors.text }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${checked ? colors.primary : colors.border}`, background: checked ? colors.primary : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {checked && <span style={{ color: "white", fontSize: 12 }}>✓</span>}
            </div>
            <input type="checkbox" checked={checked} onChange={() => toggle(opt.value)} style={{ display: "none" }} />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {options.map(opt => {
        const selected = value === opt.value;
        return (
          <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${selected ? colors.primary : colors.border}`, background: selected ? "#EBF3FC" : colors.card, cursor: "pointer", transition: "all 0.15s", fontSize: 14, color: colors.text }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selected ? colors.primary : colors.border}`, background: selected ? colors.primary : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
            </div>
            <input type="radio" checked={selected} onChange={() => onChange(opt.value)} style={{ display: "none" }} />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

function SelectField({ options, value, onChange }) {
  return (
    <select value={value || ""} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${value ? colors.primary : colors.border}`, background: colors.card, fontSize: 14, color: value ? colors.text : colors.textMuted, outline: "none", cursor: "pointer" }}>
      <option value="" disabled>Seleccione una opción...</option>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

function BMIField({ answers, onChange }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 12, color: colors.textLight, display: "block", marginBottom: 6 }}>Peso (kg)</label>
        <input type="number" placeholder="Ej: 75" value={answers.peso || ""} onChange={e => onChange({ ...answers, peso: e.target.value })}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${answers.peso ? colors.primary : colors.border}`, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 12, color: colors.textLight, display: "block", marginBottom: 6 }}>Talla (cm)</label>
        <input type="number" placeholder="Ej: 170" value={answers.talla || ""} onChange={e => onChange({ ...answers, talla: e.target.value })}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${answers.talla ? colors.primary : colors.border}`, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>
    </div>
  );
}

// ── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function ScreeningPreoperatorio() {
  const [step, setStep] = useState("intro"); // intro | questions | result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [surgeryDate, setSurgeryDate] = useState("");

  const q = QUESTIONS[currentQ];

  const getAnswer = () => {
    if (q.type === "bmi") return answers.peso && answers.talla;
    return answers[q.key];
  };

  const isAnswered = () => {
    const ans = getAnswer();
    if (!ans) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    if (q.type === "number") return ans !== "" && !isNaN(parseInt(ans));
    return !!ans;
  };

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const r = calcularTriage(answers);
      setResult(r);
      setStep("result");
    }
  };

  const handleAnswerChange = (val) => {
    setAnswers(prev => ({ ...prev, [q.key]: val }));
  };

  const handleBMIChange = (vals) => {
    setAnswers(prev => ({ ...prev, ...vals }));
  };

  const resetAll = () => {
    setStep("intro");
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setPatientName("");
    setSurgeryDate("");
  };

  // ── INTRO ──
  if (step === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Palatino Linotype', Georgia, serif" }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          {/* Header card */}
          <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`, borderRadius: 20, padding: "36px 32px", marginBottom: 20, color: "white", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏥</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: "bold", letterSpacing: 0.3 }}>
              Evaluación Preoperatoria
            </h1>
            <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: 14, lineHeight: 1.6 }}>
              Clínica Las Condes · Unidad de Anestesiología
            </p>
          </div>

          <div style={{ background: colors.card, borderRadius: 16, padding: "28px 28px", border: `1px solid ${colors.border}`, marginBottom: 16 }}>
            <p style={{ margin: "0 0 20px", color: colors.text, fontSize: 15, lineHeight: 1.7 }}>
              Este cuestionario nos permitirá determinar si usted necesita una <strong>entrevista preanestésica en persona</strong> antes de su cirugía, o si puede continuar directamente con los preparativos.
            </p>
            <p style={{ margin: "0 0 20px", color: colors.textLight, fontSize: 13, lineHeight: 1.6 }}>
              Tarda aproximadamente <strong>3–5 minutos</strong>. Sus respuestas son confidenciales y serán revisadas por el equipo de anestesiología.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: colors.textLight, display: "block", marginBottom: 6 }}>Nombre completo del paciente</label>
                <input type="text" placeholder="Ej: María González Pérez" value={patientName} onChange={e => setPatientName(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${patientName ? colors.primary : colors.border}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: colors.textLight, display: "block", marginBottom: 6 }}>Fecha de cirugía programada</label>
                <input type="date" value={surgeryDate} onChange={e => setSurgeryDate(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${surgeryDate ? colors.primary : colors.border}`, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
            </div>
          </div>

          <div style={{ background: "#FFF8E7", border: `1px solid #F0D080`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#7A5800", lineHeight: 1.6 }}>
            ⚠️ <strong>Este cuestionario no reemplaza la evaluación médica.</strong> Su resultado es orientativo y el equipo de anestesiología tomará la decisión final.
          </div>

          <button
            onClick={() => setStep("questions")}
            disabled={!patientName || !surgeryDate}
            style={{ width: "100%", padding: "16px", background: patientName && surgeryDate ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})` : "#C5CDD8", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: "bold", cursor: patientName && surgeryDate ? "pointer" : "not-allowed", fontFamily: "inherit", letterSpacing: 0.3 }}>
            Comenzar evaluación →
          </button>
        </div>
      </div>
    );
  }

  // ── QUESTIONS ──
  if (step === "questions") {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, display: "flex", flexDirection: "column", fontFamily: "'Palatino Linotype', Georgia, serif" }}>
        {/* Top bar */}
        <div style={{ background: colors.primary, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>🏥 Evaluación Preoperatoria</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{patientName}</span>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "28px 20px" }}>
          <div style={{ maxWidth: 560, width: "100%" }}>
            <ProgressBar current={currentQ + 1} total={QUESTIONS.length} />

            {/* Section label */}
            <div style={{ fontSize: 11, letterSpacing: 2, color: colors.primary, textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>
              {q.section}
            </div>

            {/* Question card */}
            <div style={{ background: colors.card, borderRadius: 16, padding: "24px 24px", border: `1px solid ${colors.border}`, marginBottom: 20 }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 17, color: colors.text, lineHeight: 1.5, fontWeight: "bold" }}>
                {q.text}
              </h2>

              {q.type === "number" && (
                <input
                  type="number"
                  placeholder={q.placeholder}
                  value={answers[q.key] || ""}
                  onChange={e => handleAnswerChange(e.target.value)}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: `1.5px solid ${answers[q.key] ? colors.primary : colors.border}`, fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              )}
              {q.type === "select" && (
                <SelectField options={q.options} value={answers[q.key]} onChange={handleAnswerChange} />
              )}
              {q.type === "multicheck" && (
                <MultiCheck options={q.options} value={answers[q.key] || []} onChange={handleAnswerChange} />
              )}
              {q.type === "radio" && (
                <RadioGroup options={q.options} value={answers[q.key]} onChange={handleAnswerChange} />
              )}
              {q.type === "bmi" && (
                <BMIField answers={answers} onChange={handleBMIChange} />
              )}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 12 }}>
              {currentQ > 0 && (
                <button onClick={() => setCurrentQ(currentQ - 1)}
                  style={{ flex: 1, padding: "13px", background: "white", color: colors.primary, border: `1.5px solid ${colors.primary}`, borderRadius: 12, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                  ← Anterior
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!isAnswered()}
                style={{ flex: 2, padding: "13px", background: isAnswered() ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})` : "#C5CDD8", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: "bold", cursor: isAnswered() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                {currentQ < QUESTIONS.length - 1 ? "Siguiente →" : "Ver resultado →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (step === "result" && result) {
    const { requiresPresencial, flags } = result;

    return (
      <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Palatino Linotype', Georgia, serif" }}>
        {/* Top bar */}
        <div style={{ background: colors.primary, padding: "14px 24px" }}>
          <span style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>🏥 Evaluación Preoperatoria</span>
        </div>

        <div style={{ maxWidth: 580, margin: "0 auto", padding: "28px 20px" }}>
          {/* Patient info */}
          <div style={{ background: colors.card, borderRadius: 12, padding: "14px 18px", border: `1px solid ${colors.border}`, marginBottom: 20, display: "flex", justifyContent: "space-between", fontSize: 13, color: colors.textLight }}>
            <span>👤 {patientName}</span>
            <span>📅 Cirugía: {surgeryDate}</span>
          </div>

          {/* Result banner */}
          <div style={{
            background: requiresPresencial
              ? `linear-gradient(135deg, ${colors.warning} 0%, #E05500 100%)`
              : `linear-gradient(135deg, ${colors.success} 0%, #1A8A50 100%)`,
            borderRadius: 20, padding: "28px 28px", marginBottom: 20, color: "white", textAlign: "center"
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>
              {requiresPresencial ? "⚠️" : "✅"}
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: "bold" }}>
              {requiresPresencial
                ? "Se requiere evaluación preanestésica presencial"
                : "No se requiere evaluación presencial"}
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: 14, lineHeight: 1.6 }}>
              {requiresPresencial
                ? "Basado en sus antecedentes, el equipo de anestesiología necesita evaluarle en persona antes de su cirugía."
                : "Sus antecedentes no presentan factores de riesgo que requieran evaluación presencial. Puede continuar con la preparación habitual para su cirugía."}
            </p>
          </div>

          {/* Flags */}
          {requiresPresencial && flags.length > 0 && (
            <div style={{ background: colors.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${colors.border}`, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 15, color: colors.text, fontWeight: "bold" }}>
                Factores identificados que requieren evaluación:
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {flags.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: colors.text, lineHeight: 1.5 }}>
                    <span style={{ color: colors.warning, flexShrink: 0, marginTop: 1 }}>◆</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {requiresPresencial ? (
            <div style={{ background: colors.card, borderRadius: 16, padding: "22px 24px", border: `1.5px solid ${colors.primary}`, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 16, color: colors.primary }}>
                📋 Próximo paso: Agendar su evaluación preanestésica
              </h3>
              <p style={{ margin: "0 0 18px", fontSize: 14, color: colors.textLight, lineHeight: 1.6 }}>
                Le recomendamos agendar <strong>al menos 7 días antes</strong> de su cirugía. Al ingresar al sistema de reservas, siga estos pasos:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {[
                  { n: "1", label: "Sede", desc: 'Seleccione la sede "Estéril"' },
                  { n: "2", label: "Especialidad", desc: "Seleccione Anestesióloga" },
                  { n: "3", label: "Prestación", desc: 'Seleccione "Evaluación Preanestésica"' },
                ].map(s => (
                  <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 12, background: "#F0F5FC", borderRadius: 10, padding: "11px 14px" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: colors.primary, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: "bold", flexShrink: 0 }}>
                      {s.n}
                    </div>
                    <div>
                      <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 }}>{s.label} · </span>
                      <span style={{ fontSize: 14, color: colors.text }}>{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", width: "100%", padding: "15px", background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`, color: "white", textAlign: "center", borderRadius: 12, fontSize: 15, fontWeight: "bold", textDecoration: "none", boxSizing: "border-box" }}>
                Ir al sistema de agendamiento →
              </a>
            </div>
          ) : (
            <div style={{ background: "#EBF8F0", borderRadius: 16, padding: "22px 24px", border: `1.5px solid ${colors.success}`, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 16, color: colors.success }}>
                📋 Instrucciones para su cirugía
              </h3>
              <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, color: colors.text, lineHeight: 1.9 }}>
                <li>Recibirá las instrucciones de preparación por parte de su cirujano.</li>
                <li>Recuerde informar <strong>todos sus medicamentos actuales</strong> al equipo médico.</li>
                <li>Respete el <strong>ayuno indicado</strong> (generalmente 8 horas sólidos, 2 horas líquidos claros).</li>
                <li>Si tiene dudas, comuníquese con su médico tratante.</li>
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ background: "#FFF8E7", border: `1px solid #F0D080`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "#7A5800", lineHeight: 1.6 }}>
            ⚠️ Este resultado es orientativo. La decisión final sobre la necesidad de evaluación preanestésica la tomará el equipo de anestesiología de Clínica Las Condes.
          </div>

          <button onClick={resetAll}
            style={{ width: "100%", padding: "13px", background: "white", color: colors.textLight, border: `1.5px solid ${colors.border}`, borderRadius: 12, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            ↩ Realizar nueva evaluación
          </button>
        </div>
      </div>
    );
  }

  return null;
}
