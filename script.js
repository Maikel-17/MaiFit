// --- DATOS Y MAPEOS ---
const muscleMap = {
    "Espalda": [
        "Dominadas","Dominadas Supinas","Jalón Tras Nuca","Jalón Al Pecho","Jalón Agarre Neutro",
        "Remo Bajo En Polea","Remo Alto En Polea","Remo Con Mancuernas","Remo Con Barra",
        "Remo Pendlay","Remo T-Bar","Pull-Over En Polea","Hiperextensiones Lumbares",
        "Peso Muerto Convencional","Peso Muerto Rumano"
    ],

    "Pecho": [
        "Press De Banca","Press De Banca Con Mancuernas","Press Inclinado","Press Inclinado Con Mancuernas",
        "Press Declinado","Press Sentado Máquina","Aperturas Planas","Aperturas Inclinadas",
        "Cruces De Polea Alta","Cruces De Polea Baja","Fondos En Paralelas","Pull-Over","Press En Máquina Hammer"
    ],

    "Biceps": [
        "Curl Con Barra Recta","Curl Con Barra Z","Curl Alterno Mancuernas","Curl Martillo","Curl Concentrado",
        "Curl En Máquina","Curl En Polea Baja","Curl En Banco Scott","Curl Inclinado",
        "Curl Araña (Spider Curl)","Curl Zottman"
    ],

    "Triceps": [
        "Press Francés","Press Francés Mancuernas","Press A Una Mano","Extensión En Polea Con Cuerda",
        "Extensión En Polea Barra Recta","Extensión En Polea Agarre Inverso","Fondos En Paralelas",
        "Press Cerrado En Banca","Patada Trasera Con Mancuerna","Extensión Sobre La Cabeza",
        "Extensión A Dos Manos Con Mancuerna"
    ],

    "Hombro": [
        "Press Militar","Press Con Mancuernas","Press Máquina","Press Arnold","Elevaciones Laterales",
        "Elevaciones Frontales","Pájaros Con Mancuernas","Pájaros En Máquina","Elevación Lateral En Polea",
        "Remo Al Cuello Con Barra","Encogimientos Con Barra","Encogimientos Con Mancuernas"
    ],

    "Abdominales": [
        "Crunch Clásico","Crunch En Máquina","Elevación De Piernas","Elevación De Rodillas En Barra",
        "Plancha","Plancha Lateral","Crunch Con Polea","Twist Ruso","Ab Wheel","Crunch Inverso"
    ],

    "Cuádriceps": [
        "Sentadilla Con Barra","Sentadilla Frontal","Prensa","Extensiones","Zancadas Con Barra",
        "Zancadas Con Mancuernas","Sentadilla Búlgara","Sentadilla Hack","Sentadilla En Smith","Goblet Squat"
    ],

    "Femoral": [
        "Curl Femoral Tumbado","Curl Femoral Sentado","Peso Muerto Rumano","Peso Muerto Piernas Rígidas",
        "Buenas Mañanas","Curl Nórdico","Hip Thrust (Femoral Secundario)"
    ],

    "Abductores": [
        "Abducción En Máquina","Apertura Con Banda Elástica","Abducción En Polea",
        "Sentadilla Sumo","Zancada Lateral"
    ],

    "Aductores": [
        "Aducción En Máquina","Aducción Con Polea Baja","Cierre Con Banda Elástica",
        "Sentadilla Sumo Cerrada","Zancada Cruzada"
    ],

    "Gemelos": [
        "Elevación De Talones De Pie","Elevación De Talones Sentado","Elevaciones En Prensa",
        "Elevaciones En Máquina Smith","Elevación Unilateral","Saltos En Puntillas"
    ],

    "Glúteo": [
        "Hip Thrust","Puente De Glúteo","Sentadilla Con Barra","Sentadilla Sumo","Peso Muerto Rumano",
        "Zancadas","Patada De Glúteo En Polea","Kickback Con Banda","Step-Up"
    ],

    "Full Body": []
};

muscleMap["Full Body"] = Object.values(muscleMap).flat();
const allExercises = [...new Set(Object.values(muscleMap).flat())].sort();
const muscleOptions = Object.keys(muscleMap).filter(k => k !== "Full Body").sort(); muscleOptions.push("Full Body");

// --- ESTADO ---
let workoutData = [];
let startTime = null;
let selectedMuscles = [];
let restTimerInterval = null;
let restTimeRemaining = 0;
let isAdvancedMode = false; 
let activeExerciseIndex = -1;
let personalRecords = {};
let activeModules = [];

// --- INIT ---
function initApp() {
    loadState();
    setInterval(updateClock, 1000); updateClock();

    const muscleAdder = document.getElementById('muscleAdder');
    muscleOptions.forEach(opt => { let o = document.createElement("option"); o.value = opt; o.text = opt; muscleAdder.add(o); });

    const searchInput = document.getElementById('exerciseSearchInput');
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', handleSearch);
    document.addEventListener('click', (e) => { if (!document.getElementById('exerciseSearchResults').parentElement.contains(e.target)) document.getElementById('exerciseSearchResults').classList.add('hidden'); });

    const now = new Date();
    const dateInput = document.getElementById('dateInput');
    if (!dateInput.value) {
        dateInput.value = now.toLocaleDateString('en-CA');
        const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        document.getElementById('daySelect').value = days[now.getDay()];
    }

    updateUIState();
    applyAdvancedMode();
    renderMuscleChips();
    renderWorkoutUI();
    calcBMI();
    document.getElementById('quickNotes').value = localStorage.getItem('workoutNotes_v11') || "";
}

function updateClock() {
    const now = new Date();
    document.getElementById('liveClock').innerText = `${now.toLocaleTimeString()} ${now.toLocaleDateString()}`;
}

// --- LÓGICA UI MÓDULOS ---
function updateUIState() {
    const topBtn = document.getElementById('topModuleBtn');
    const emptyState = document.getElementById('emptyDashboardState');
    
    // FIX: Renderizar SIEMPRE para asegurar que se oculten visualmente
    renderModules();

    if (activeModules.length === 0) {
        emptyState.classList.remove('hidden');
        topBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        topBtn.classList.remove('hidden');
    }
}

function openModuleSelector() {
    document.getElementById('moduleSelectorModal').classList.remove('hidden');
}

function toggleModule(moduleId) {
    if (!activeModules.includes(moduleId)) {
        activeModules.push(moduleId);
    }
    saveState();
    updateUIState();
    document.getElementById('moduleSelectorModal').classList.add('hidden');
}

function removeModule(moduleId) {
    activeModules = activeModules.filter(id => id !== moduleId);
    saveState();
    updateUIState();
}

function renderModules() {
    document.querySelectorAll('.module-container').forEach(el => el.classList.remove('active-module'));
    activeModules.forEach(id => {
        const el = document.getElementById(`module-${id}`);
        if(el) el.classList.add('active-module');
    });
}

// --- BODY STATS LOGIC ---
function calcBMI() {
    const w = parseFloat(document.getElementById('bodyWeight').value);
    const h = parseFloat(document.getElementById('bodyHeight').value) / 100;
    const bmiEl = document.getElementById('bmiValue');
    const labelEl = document.getElementById('bmiLabel');
    const bar = document.getElementById('bmiBar');

    if (w && h) {
        const bmi = (w / (h * h)).toFixed(1);
        bmiEl.innerText = bmi;
        let color = "bg-gray-400"; let text = ""; let pct = 0;
        if (bmi < 18.5) { color = "bg-blue-400"; text = "Bajo peso"; pct = 20; }
        else if (bmi < 25) { color = "bg-green-500"; text = "Normal"; pct = 50; }
        else if (bmi < 30) { color = "bg-yellow-400"; text = "Sobrepeso"; pct = 75; }
        else { color = "bg-red-500"; text = "Obesidad"; pct = 100; }
        bar.className = `h-2.5 rounded-full transition-all duration-500 ${color}`;
        bar.style.width = `${pct}%`;
        labelEl.innerText = text;
        labelEl.className = "text-[10px] text-right mt-1 font-bold " + color.replace("bg-", "text-");
        saveState();
    }
}

// --- NOTEPAD & 1RM ---
function saveNotes() { localStorage.setItem('workoutNotes_v11', document.getElementById('quickNotes').value); }
function calc1RM() {
    const w = parseFloat(document.getElementById('rmWeight').value);
    const r = parseFloat(document.getElementById('rmReps').value);
    if (w && r) { document.getElementById('rmResult').innerText = Math.round(w * (1 + r / 30)) + " kg"; }
}

// --- WORKOUT CORE LOGIC ---
function toggleAdvancedMode() { isAdvancedMode = !isAdvancedMode; applyAdvancedMode(); saveState(); }
function applyAdvancedMode() {
    const btn = document.getElementById('advModeBtn');
    const circle = document.getElementById('advModeCircle');
    const hiddenEls = document.querySelectorAll('.advanced-feature');
    if (isAdvancedMode) {
        btn.classList.replace('bg-gray-300', 'bg-blue-600'); circle.classList.add('translate-x-5');
        hiddenEls.forEach(el => el.classList.remove('hidden-feature'));
    } else {
        btn.classList.replace('bg-blue-600', 'bg-gray-300'); circle.classList.remove('translate-x-5');
        hiddenEls.forEach(el => el.classList.add('hidden-feature'));
    }
}

function saveState() {
    const state = {
        userName: document.getElementById('userNameInput').value,
        day: document.getElementById('daySelect').value,
        date: document.getElementById('dateInput').value,
        selectedMuscles, workoutData, startTime: startTime?.getTime(), isAdvancedMode, activeExerciseIndex,
        personalRecords, activeModules,
        bodyStats: { w: document.getElementById('bodyWeight').value, h: document.getElementById('bodyHeight').value }
    };
    localStorage.setItem('workoutAppState_v11', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('workoutAppState_v11');
    if (saved) {
        const state = JSON.parse(saved);
        document.getElementById('userNameInput').value = state.userName || "";
        document.getElementById('daySelect').value = state.day || "Lunes";
        document.getElementById('dateInput').value = state.date || "";
        selectedMuscles = state.selectedMuscles || [];
        workoutData = state.workoutData || [];
        isAdvancedMode = state.isAdvancedMode || false;
        activeExerciseIndex = state.activeExerciseIndex ?? -1;
        personalRecords = state.personalRecords || {};
        activeModules = state.activeModules || [];
        if (state.bodyStats) {
            document.getElementById('bodyWeight').value = state.bodyStats.w || "";
            document.getElementById('bodyHeight').value = state.bodyStats.h || "";
        }
        if (state.startTime) {
            startTime = new Date(state.startTime);
            document.getElementById('timerStatus').innerText = `Inicio: ${startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
        }
    }
}

function handleSearch() {
    const query = this.value.toLowerCase();
    const resultsContainer = document.getElementById('exerciseSearchResults');
    let pool = selectedMuscles.length ? selectedMuscles.flatMap(m => muscleMap[m] || []) : allExercises;
    pool = [...new Set(pool)].sort();
    const filtered = pool.filter(ex => ex.toLowerCase().includes(query));
    resultsContainer.innerHTML = filtered.length ? '' : '<div class="p-3 text-sm text-gray-500 italic">No encontrado</div>';
    filtered.forEach(ex => {
        const d = document.createElement('div');
        d.className = 'p-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 dark:text-gray-200';
        d.innerText = ex;
        d.onclick = () => { document.getElementById('exerciseSearchInput').value = ex; resultsContainer.classList.add('hidden'); };
        resultsContainer.appendChild(d);
    });
    resultsContainer.classList.remove('hidden');
}

function addExercise() {
    const name = document.getElementById('exerciseSearchInput').value;
    if(!name) return showToast("Elige un ejercicio", true);
    if(workoutData.some(e => e.name === name)) return showToast("Ya existe", true);
    workoutData.push({ name, sets: [], notes: "" });
    activeExerciseIndex = workoutData.length - 1;
    document.getElementById('exerciseSearchInput').value = "";
    renderWorkoutUI(); saveState();
}

function addSet() {
    if(activeExerciseIndex === -1) return showToast("Selecciona ejercicio");
    const r = document.getElementById('repsInput').value, w = document.getElementById('weightInput').value;
    if((!r && !document.getElementById('secondsInput').value) || !w) return showToast("Faltan datos");
    
    const currentPR = personalRecords[workoutData[activeExerciseIndex].name] || 0;
    if (parseFloat(w) > currentPR) {
        personalRecords[workoutData[activeExerciseIndex].name] = parseFloat(w);
        showToast(`🏆 Nuevo Récord: ${w}kg!`, false);
    }

    workoutData[activeExerciseIndex].sets.push({
        type: document.getElementById('secondsInput').value ? 'seconds' : 'reps',
        val: document.getElementById('secondsInput').value || r,
        weight: w,
        rpe: isAdvancedMode ? document.getElementById('rpeInput').value : ""
    });
    ['repsInput','secondsInput','rpeInput'].forEach(id => document.getElementById(id).value = "");
    renderWorkoutUI(); saveState();
}

function renderWorkoutUI() {
    const list = document.getElementById('workoutVisualList');
    const setsSec = document.getElementById('setsSection');
    const label = document.getElementById('currentExerciseLabel');
    const overlay = document.getElementById('noSelectionOverlay');
    const prDisplay = document.getElementById('prDisplay');

    list.innerHTML = "";
    if(!workoutData.length) {
        list.innerHTML = `<div class="text-center py-8 text-gray-400 italic text-sm border-2 border-dashed border-gray-200 rounded-lg">Sin ejercicios</div>`;
        setsSec.classList.add('opacity-50', 'pointer-events-none');
        overlay.classList.remove('hidden');
        label.innerText = "";
        return;
    }

    setsSec.classList.remove('opacity-50', 'pointer-events-none');
    overlay.classList.add('hidden');
    
    if(activeExerciseIndex === -1) activeExerciseIndex = 0;
    const activeEx = workoutData[activeExerciseIndex];
    if(activeEx) {
        label.innerText = activeEx.name;
        document.getElementById('exerciseNotesInput').value = activeEx.notes || "";
        const pr = personalRecords[activeEx.name];
        if(pr) { prDisplay.innerText = `🏆 PR: ${pr} kg`; prDisplay.classList.remove('hidden'); }
        else { prDisplay.classList.add('hidden'); }
    }

    workoutData.forEach((ex, idx) => {
        const card = document.createElement('div');
        const active = idx === activeExerciseIndex;
        card.className = `exercise-card bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 fade-in-up ${active ? 'active-card shadow-md' : 'border-gray-200 dark:border-gray-600'}`;
        card.onclick = () => { activeExerciseIndex = idx; renderWorkoutUI(); };
        
        let html = `<div class="flex justify-between items-start border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
            <div><h3 class="font-bold text-sm text-blue-700 dark:text-blue-400">${ex.name}</h3>${ex.notes ? `<p class="text-[10px] text-gray-500 italic">📝 ${ex.notes}</p>` : ''}</div>
            ${active ? '<span class="text-[10px] bg-blue-100 text-blue-700 px-2 rounded-full font-bold">Editando</span>' : ''}
        </div>`;
        
        if(ex.sets.length) {
            html += '<ul class="space-y-1">';
            ex.sets.forEach((s, i) => {
                 html += `<li class="text-xs flex justify-between bg-white dark:bg-gray-800 p-1 rounded border border-gray-100 dark:border-gray-700">
                    <span><b>${i+1}</b> ${s.val}${s.type==='seconds'?'s':'r'}</span>
                    <span class="font-mono font-bold">${s.weight}kg ${s.rpe ? `<span class="text-[9px] bg-purple-100 text-purple-700 px-1 rounded">RPE${s.rpe}</span>` : ''}</span>
                 </li>`;
            });
            html += '</ul>';
        } else html += '<div class="text-[10px] text-gray-400 italic">Sin series</div>';
        card.innerHTML = html;
        list.appendChild(card);
    });
}

function updateExerciseNotes(val) { if(activeExerciseIndex!==-1) { workoutData[activeExerciseIndex].notes = val; saveState(); } }
function deleteLastSet() { if(activeExerciseIndex!==-1 && workoutData[activeExerciseIndex].sets.length) { workoutData[activeExerciseIndex].sets.pop(); renderWorkoutUI(); saveState(); } }
function deleteActiveExercise() { if(activeExerciseIndex!==-1) { workoutData.splice(activeExerciseIndex, 1); activeExerciseIndex = workoutData.length ? Math.max(0, activeExerciseIndex-1) : -1; renderWorkoutUI(); saveState(); } }

// --- FUNCIONES BORRADO / RESET ---
function openClearModal() { document.getElementById('confirmModal').classList.remove('hidden'); }
function closeModal() { document.getElementById('confirmModal').classList.add('hidden'); }

function confirmClearAll() { 
    // 1. Limpiar datos nucleares
    workoutData = []; 
    activeExerciseIndex = -1; 
    startTime = null; 
    
    // 2. Limpiar UI Textos
    document.getElementById('timerStatus').innerText = "No iniciado"; 
    document.getElementById('userNameInput').value = ""; // Borrar Nombre
    
    // 3. Limpiar Músculos
    selectedMuscles = [];
    document.getElementById('muscleAdder').value = "";
    renderMuscleChips();

    // 4. Guardar y Renderizar
    saveState(); 
    renderWorkoutUI(); 
    closeModal(); 
    showToast("Rutina reseteada por completo", false);
}

// Timer Logic
function addRestTime(s) { restTimeRemaining+=s; updateTimerDisplay(); document.getElementById('restTimerOverlay').classList.remove('hidden'); if(!restTimerInterval) restTimerInterval=setInterval(()=>{ restTimeRemaining--; updateTimerDisplay(); if(restTimeRemaining<=0) stopRestTimer(); },1000); }
function stopRestTimer() { clearInterval(restTimerInterval); restTimerInterval=null; restTimeRemaining=0; document.getElementById('restTimerOverlay').classList.add('hidden'); const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.2); showToast("¡Tiempo!", false); }
function updateTimerDisplay() { const m=Math.floor(restTimeRemaining/60).toString().padStart(2,'0'), s=(restTimeRemaining%60).toString().padStart(2,'0'); document.getElementById('restTimerDisplay').innerText=`${m}:${s}`; }
function openRestTimerModal() { if(restTimeRemaining<=0) addRestTime(60); else document.getElementById('restTimerOverlay').classList.remove('hidden'); }

// Utils
function toggleDarkMode() { document.documentElement.classList.toggle('dark'); }
function showToast(msg, isErr=false) {
    const t = document.createElement('div'); t.className = `toast px-4 py-2 rounded-lg text-white text-sm shadow-lg mb-2 ${isErr ? 'bg-red-500' : 'bg-blue-600'}`;
    t.innerText = msg; document.getElementById('toastContainer').appendChild(t); setTimeout(() => t.remove(), 3000);
}
function startTraining() { startTime=new Date(); document.getElementById('timerStatus').innerText=`Inicio: ${startTime.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`; showToast("Go!", false); saveState(); }
function addMuscle(m) { if(m && !selectedMuscles.includes(m)) { if(m==="Full Body") selectedMuscles=["Full Body"]; else { selectedMuscles=selectedMuscles.filter(x=>x!=="Full Body"); selectedMuscles.push(m); } } document.getElementById('muscleAdder').value=""; renderMuscleChips(); saveState(); }
function removeMuscle(m) { selectedMuscles=selectedMuscles.filter(x=>x!==m); renderMuscleChips(); saveState(); }
function renderMuscleChips() { document.getElementById('selectedMusclesContainer').innerHTML = selectedMuscles.map(m=>`<div class="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">${m}<button onclick="removeMuscle('${m}')" class="ml-1 hover:text-red-500">×</button></div>`).join(''); }

// --- GESTION PLANTILLAS ---
function openTemplatesModal() { document.getElementById('templatesModal').classList.remove('hidden'); switchTemplateTab('load'); }
function closeTemplatesModal() { document.getElementById('templatesModal').classList.add('hidden'); }
function switchTemplateTab(tab) {
    document.getElementById('tabSave').className = tab === 'save' ? "flex-1 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600" : "flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700";
    document.getElementById('tabLoad').className = tab === 'load' ? "flex-1 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600" : "flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700";
    document.getElementById('contentSave').className = tab === 'save' ? "space-y-3" : "hidden space-y-3";
    document.getElementById('contentLoad').className = tab === 'load' ? "space-y-2 max-h-60 overflow-y-auto custom-scrollbar" : "hidden";
    if(tab === 'load') renderSavedRoutinesList();
}
function saveRoutineTemplate() {
    const name = document.getElementById('templateNameInput').value;
    if (!name) return showToast("Ponle nombre", true);
    if (workoutData.length === 0) return showToast("Rutina vacía", true);
    const templates = JSON.parse(localStorage.getItem('workoutTemplates') || "{}");
    templates[name] = { muscles: selectedMuscles, exercises: workoutData.map(e => ({name: e.name, notes: e.notes || "", sets: []})) };
    localStorage.setItem('workoutTemplates', JSON.stringify(templates));
    showToast("Guardado"); document.getElementById('templateNameInput').value = ""; switchTemplateTab('load');
}
function renderSavedRoutinesList() {
    const list = document.getElementById('savedRoutinesList');
    const templates = JSON.parse(localStorage.getItem('workoutTemplates') || "{}");
    list.innerHTML = "";
    const keys = Object.keys(templates);
    if (keys.length === 0) { list.innerHTML = "<div class='text-center text-gray-400 text-xs italic'>Sin plantillas</div>"; return; }
    keys.forEach(key => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600";
        div.innerHTML = `<span class="text-sm font-medium dark:text-gray-200 truncate">${key}</span><div class="flex gap-2"><button onclick="loadRoutineTemplate('${key}')" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Cargar</button><button onclick="deleteTemplate('${key}')" class="text-xs text-red-500 hover:text-red-700 font-bold px-1">✕</button></div>`;
        list.appendChild(div);
    });
}
function loadRoutineTemplate(key) {
    if(!confirm("Cargar plantilla borrará el ejercicio actual.")) return;
    const templates = JSON.parse(localStorage.getItem('workoutTemplates') || "{}");
    const t = templates[key];
    if (!t) return;
    selectedMuscles = t.muscles || [];
    workoutData = t.exercises.map(e => ({ ...e, sets: [] })); 
    activeExerciseIndex = workoutData.length > 0 ? 0 : -1;
    renderMuscleChips(); renderWorkoutUI(); saveState(); closeTemplatesModal(); showToast(`Cargado: ${key}`);
}
function deleteTemplate(key) { if(!confirm(`¿Borrar?`)) return; const t = JSON.parse(localStorage.getItem('workoutTemplates') || "{}"); delete t[key]; localStorage.setItem('workoutTemplates', JSON.stringify(t)); renderSavedRoutinesList(); }

// --- GENERAR ARCHIVOS ---
function generateFile(type) {
    const userName = document.getElementById('userNameInput').value || "Atleta";
    const day = document.getElementById('daySelect').value;
    const dateVal = document.getElementById('dateInput').value;
    let duration = "No registrado";
    if(startTime) {
        const diffMins = Math.floor((new Date() - startTime) / 60000);
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        duration = h > 0 ? `${h}h ${m}m` : `${m} min`;
    }
    const muscleStr = selectedMuscles.join(", ");
    
    if (type === 'txt') {
        let content = "";
        workoutData.forEach(ex => {
            content += `${ex.name}\n${ex.notes ? `Nota: ${ex.notes}\n` : ''}----------------\n`;
            ex.sets.forEach((set, i) => {
                const l = set.type==="seconds"?"Segs":"Reps";
                content += `Serie ${i+1}: ${set.val} ${l} - ${set.weight}kg${set.rpe ? ` (RPE ${set.rpe})` : ''}\n`;
            });
            content += "\n";
        });
        const finalStr = `MAIFIT WORKOUT PLANNER\nEntrena, Come, Duerme y Repite\n\nATLETA: ${userName}\nFECHA: ${day}, ${dateVal}\nMÚSCULOS: ${muscleStr}\nDURACIÓN: ${duration}\n\n${content}`;
        const blob = new Blob(["\uFEFF" + finalStr], { type: "text/plain;charset=utf-8" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `Rutina_${day}.txt`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } 
    else if (type === 'pdf') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 20;
        doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.text("MAIFIT PLANNER", 15, y); y += 7;
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(50, 50, 200); doc.text("ENTRENA, COME, DUERME Y REPITE", 15, y); y += 6;
        doc.setFontSize(8); doc.setTextColor(150); doc.text("By Maikel17", 15, y); y += 10;
        doc.setFontSize(12); doc.setTextColor(0); doc.setFont("helvetica", "bold"); doc.text(`Atleta: ${userName}`, 15, y); y += 6;
        doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.text(`${day}, ${dateVal}`, 15, y); y += 6;
        doc.setFontSize(10); doc.setTextColor(100); doc.text(`Músculos: ${muscleStr}`, 15, y); y += 5;
        doc.text(`Duración: ${duration}`, 15, y); y += 10;
        doc.setDrawColor(200); doc.line(15, y, 195, y); y += 10;
        workoutData.forEach(ex => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFontSize(12); doc.setTextColor(0); doc.setFont("helvetica", "bold"); doc.text(ex.name, 15, y); y += 6;
            if(ex.notes) { doc.setFontSize(10); doc.setFont("helvetica", "italic"); doc.setTextColor(80); doc.text(`Nota: ${ex.notes}`, 15, y); y += 6; }
            doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(0);
            ex.sets.forEach((set, i) => {
                if (y > 280) { doc.addPage(); y = 20; }
                const l = set.type==="seconds"?"s":"r";
                const rpeTxt = set.rpe ? ` - RPE ${set.rpe}` : "";
                doc.text(`• S${i+1}: ${set.val}${l} - ${set.weight}kg${rpeTxt}`, 20, y);
                y += 6;
            });
            y += 6;
        });
        doc.save(`Rutina_${day}.pdf`);
    }
}