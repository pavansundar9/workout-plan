import { useState, useEffect, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const START_DATE = new Date("2026-05-19"); // Monday anchor — May 2026
const END_DATE = new Date("2027-05-19");   // exactly 1 year — May 2027

// Exercise pools per slot — each slot has 4+ alternatives
const EXERCISE_POOLS = {
  // MONDAY — Push
  mon_main: [
    { name: "Chest Press Machine", sets: "4x6-8", note: "Two-rod push machine. Back flat, don't lock elbows. Drive through chest." },
    { name: "Assisted Bench Press", sets: "3x5", note: "Start light (bar + small plates). Bar to lower chest, elbows 45° from body." },
    { name: "Dumbbell Floor Press", sets: "4x6", note: "Lie flat, press up like bench. Floor limits range, safer on shoulders." },
    { name: "Push-Up (weighted vest or slow tempo)", sets: "4x10", note: "3 sec down, pause at bottom, explode up. Harder than it sounds." },
    { name: "Cable Chest Fly", sets: "3x12", note: "Arms wide like hugging a tree, squeeze at the centre. Full stretch." },
  ],
  mon_shoulder: [
    { name: "Dumbbell Shoulder Press (Seated)", sets: "3x8-10", note: "Dumbbells at ear level, press straight up. Shoulders packed down." },
    { name: "Arnold Press", sets: "3x10", note: "Start with palms facing you, rotate as you press up. Hits all 3 deltoid heads." },
    { name: "Barbell Overhead Press (Smith Machine)", sets: "3x8", note: "Bar to upper chest, press overhead. Keep core braced." },
    { name: "Dumbbell Front Raise", sets: "3x12", note: "Alternate arms, raise to shoulder height. Slow and controlled." },
  ],
  mon_tricep: [
    { name: "Tricep Pushdown (cable)", sets: "3x10-12", note: "Elbows pinned to sides, push down, squeeze at bottom." },
    { name: "Overhead Tricep Extension (dumbbell)", sets: "3x12", note: "One dumbbell overhead, lower behind head, extend. Don't flare elbows." },
    { name: "Close-Grip Dumbbell Press", sets: "3x10", note: "Dumbbells together on chest, press keeping them touching each other." },
    { name: "Diamond Push-Ups", sets: "3x12", note: "Hands form a diamond shape, elbows tuck back. Pure tricep burnout." },
  ],
  mon_lateral: [
    { name: "Dumbbell Lateral Raises", sets: "3x12-15", note: "Lead with elbows not wrists. Raise to shoulder height only." },
    { name: "Cable Lateral Raise", sets: "3x15", note: "Single arm, cable at lowest position. Constant tension throughout." },
    { name: "Upright Row (dumbbells)", sets: "3x12", note: "Pull dumbbells up along body to chin, elbows lead and go high." },
    { name: "Plate Front Raise", sets: "3x15", note: "Hold a weight plate with both hands, raise to eye level." },
  ],
  mon_core: [
    { name: "Plank Hold", sets: "3x40-50 sec", note: "Body is a straight line from head to heel. Don't let hips sag or rise." },
    { name: "Hollow Body Hold", sets: "3x30 sec", note: "Lie on back, arms overhead, press lower back into floor, lift legs + shoulders slightly. Brutal core stability." },
    { name: "Pallof Press (cable)", sets: "3x12 each", note: "Cable at chest height, hold with both hands, press out and back in. Resists rotation — works deep core." },
    { name: "Ab Wheel Rollout", sets: "3x8-10", note: "On knees, roll forward until flat, roll back using core only. Hardest core exercise." },
    { name: "Dead Bug", sets: "3x8 each side", note: "On back, arms up, knees 90°. Lower opposite arm+leg. Press lower back into floor throughout." },
  ],
  // TUESDAY — Pull
  tue_lat: [
    { name: "Lat Pulldown (wide grip)", sets: "4x6-8", note: "Pull bar to upper chest, elbows drive down toward hips." },
    { name: "Assisted Pull-Up", sets: "4x6", note: "Use the assisted machine if available. Full range: dead hang to chin over bar." },
    { name: "Close-Grip Lat Pulldown", sets: "4x8", note: "Narrow grip, lean back slightly, pull to upper chest." },
    { name: "Straight-Arm Pulldown (cable)", sets: "3x12", note: "Arms straight, pull bar from overhead to thighs. Pure lat isolation." },
  ],
  tue_row: [
    { name: "Seated Cable Row", sets: "4x8", note: "Pull to belly button, squeeze shoulder blades together. Sit upright." },
    { name: "Dumbbell Single-Arm Row", sets: "3x8 each", note: "Knee on bench, pull dumbbell to hip. Keep hips square." },
    { name: "Chest-Supported Dumbbell Row", sets: "3x10", note: "Face down on incline bench, row dumbbells up. No momentum possible." },
    { name: "Barbell Bent-Over Row", sets: "4x6", note: "Hinge forward 45°, pull bar to belly button. Big compound pull." },
  ],
  tue_bicep: [
    { name: "Dumbbell Bicep Curl (Standing)", sets: "3x10-12", note: "Elbows stay glued to sides. Supinate wrist at top. Slow on the way down." },
    { name: "Hammer Curl", sets: "3x12", note: "Neutral grip (thumbs up). Works brachialis — adds thickness to arms." },
    { name: "Incline Dumbbell Curl", sets: "3x10", note: "Seated on incline bench, arms hang, curl. Huge stretch at the bottom." },
    { name: "Cable Curl", sets: "3x12", note: "Low cable, curl up. Constant tension — no rest at the top." },
  ],
  tue_rear: [
    { name: "Face Pulls (cable, rope)", sets: "3x15", note: "Cable at face height. Pull to ears, elbows flare high. Critical for posture." },
    { name: "Rear Delt Dumbbell Fly", sets: "3x15", note: "Bent over 90°, raise dumbbells out to side. Light weight, strict form." },
    { name: "Band Pull-Apart", sets: "3x20", note: "Hold resistance band in front, pull apart to chest height. Squeezes rear delts." },
    { name: "Reverse Cable Fly", sets: "3x15", note: "Cross cables, pull out and back. Arms at shoulder height." },
  ],
  tue_core: [
    { name: "Dead Bug", sets: "3x8 each side", note: "Lower back pressed into floor throughout. Opposite arm + leg. Slow control." },
    { name: "Cable Crunch (kneeling)", sets: "3x15", note: "Rope attachment, kneel below cable, crunch down toward knees. Adds resistance to abs." },
    { name: "Hanging Knee Raises", sets: "3x12", note: "Hang from bar, raise knees to chest. Lower slowly — don't swing." },
    { name: "Reverse Crunch", sets: "3x15", note: "On floor, bring knees to chest and curl hips up. Lower back stays pressed into floor." },
    { name: "Bicycle Crunches", sets: "3x20", note: "Slow and controlled. Touch elbow to opposite knee. Feel the oblique twist." },
  ],
  // THURSDAY — Legs
  thu_squat: [
    { name: "Goblet Squat (dumbbell)", sets: "4x8-10", note: "Dumbbell at chest, sit between knees. Best beginner squat pattern." },
    { name: "Leg Press Machine", sets: "4x10", note: "High foot placement = glutes/hams. Don't lock knees at top." },
    { name: "Dumbbell Bulgarian Split Squat", sets: "3x8 each", note: "Back foot on bench, front foot forward. Hardest leg exercise. Rewards patience." },
    { name: "Hack Squat (machine)", sets: "4x8", note: "Shoulder-width stance, controlled descent. Great for quads." },
  ],
  thu_hinge: [
    { name: "Romanian Deadlift (Dumbbells)", sets: "4x8", note: "Hinge at hips, push back, drag dumbbells down legs. Hamstring stretch at bottom." },
    { name: "Dumbbell Deadlift (full)", sets: "4x5", note: "Full range from floor. Drive feet through ground to stand. Total body." },
    { name: "Good Mornings (barbell/empty)", sets: "3x12", note: "Bar on back, hinge forward like a bow. Loads hamstrings and lower back. Light weight." },
    { name: "Kettlebell / Dumbbell Swing", sets: "4x15", note: "Hip hinge explosion. Hips drive the weight — not arms. Cardio + posterior chain." },
  ],
  thu_lunge: [
    { name: "Walking Lunges", sets: "3x10 each", note: "Torso upright. Back knee toward floor. Push off front foot to step through." },
    { name: "Reverse Lunges", sets: "3x10 each", note: "Step backward instead. Easier on knees. Same glute+quad hit." },
    { name: "Step-Ups (bench or box)", sets: "3x10 each", note: "Full foot on box, drive through heel to stand. Add dumbbells as you progress." },
    { name: "Side Lunges", sets: "3x10 each", note: "Step wide to side, sit into that hip. Works inner thighs and glutes differently." },
  ],
  thu_calf: [
    { name: "Standing Calf Raises", sets: "3x15-20", note: "On a step, full range. 3 seconds down. Most people rush these." },
    { name: "Seated Calf Raises (machine)", sets: "3x20", note: "If machine available — adds more stretch at the bottom." },
    { name: "Single-Leg Calf Raise", sets: "3x12 each", note: "Hold dumbbell for resistance. Huge strength difference between legs will show up." },
  ],
  thu_core: [
    { name: "Plank + Shoulder Taps", sets: "3x10 each side", note: "In plank position, tap opposite shoulder. Hips stay absolutely still. Builds anti-rotation core." },
    { name: "Ab Wheel Rollout", sets: "3x8-10", note: "The king of core exercises. On knees. Roll out slowly, pull back with abs." },
    { name: "Hanging Knee Raises", sets: "3x12", note: "Hang from bar, raise knees to chest controlled. Lower slowly." },
    { name: "Side Plank Hip Dips", sets: "3x12 each", note: "In side plank, dip hip to floor and raise. Oblique focus = waist definition." },
    { name: "Mountain Climbers (slow)", sets: "3x20 total", note: "In push-up position, drive knees to chest alternately. Keep hips level." },
  ],
  // FRIDAY — Full Body
  fri_press: [
    { name: "Dumbbell Floor Press", sets: "4x6", note: "On floor, press up like bench. Floor protects shoulders at bottom." },
    { name: "Assisted Bench Press", sets: "4x5", note: "Barbell, start light. Elbows 45°. Controlled descent." },
    { name: "Dumbbell Incline Press", sets: "4x8", note: "Bench at 30-45°. Hits upper chest. Good for chest measurement." },
    { name: "Push-Up Variations", sets: "4x12", note: "Wide for chest, narrow for triceps, archer for unilateral strength." },
  ],
  fri_compound: [
    { name: "Row + Overhead Press Superset", sets: "3 supersetsx8", note: "8 rows then immediately 8 presses. 90 sec rest between supersets." },
    { name: "Dumbbell Complex (curl-press-row)", sets: "3x6 each", note: "Curl to press, lower, row. No rest between movements. 3 exercises, 1 dumbbell." },
    { name: "Clean and Press (dumbbells)", sets: "4x5", note: "Squat to pick up, explode up, press overhead. Full body explosive strength." },
    { name: "Renegade Row", sets: "3x8 each", note: "Push-up position with dumbbells, row one arm at a time. Insane core + back work." },
  ],
  fri_deadlift: [
    { name: "Dumbbell Deadlift", sets: "4x5", note: "Full range from floor. Total body. Best bang for buck on strength days." },
    { name: "Trap Bar Deadlift (if available)", sets: "4x5", note: "Most beginner-friendly deadlift. Handles at your sides — natural position." },
    { name: "Sumo Dumbbell Deadlift", sets: "4x8", note: "Wide stance, toes out, grabs single dumbbell between legs. Hits inner thighs + glutes." },
    { name: "Single-Leg Deadlift (dumbbell)", sets: "3x8 each", note: "Balance on one leg, hinge. Hard but incredible for hip stability and glutes." },
  ],
  fri_carry: [
    { name: "Farmer's Walk", sets: "4x20-30m", note: "Heaviest dumbbells you can hold. Walk tall, chest up, core braced." },
    { name: "Suitcase Carry (one side)", sets: "3x20m each", note: "One heavy dumbbell at side. Resist leaning — core works overtime." },
    { name: "Overhead Carry (dumbbell)", sets: "3x15m each", note: "Press one dumbbell overhead, walk. Shoulder stability + core." },
    { name: "Bear Hug Carry (plate)", sets: "4x20m", note: "Bear hug a heavy plate to chest and walk. Works grip, chest, core together." },
  ],
  fri_core: [
    { name: "Cable Woodchop (high to low)", sets: "3x10 each", note: "Rotate from high to low diagonally. Obliques = waist definition." },
    { name: "Pallof Press", sets: "3x12 each", note: "Resist rotation. Deep core anti-rotation exercise. Looks easy, isn't." },
    { name: "L-Sit Hold (parallel bars or floor)", sets: "3x15-20 sec", note: "Legs straight out in front, hold. Absolutely destroys the core and hip flexors." },
    { name: "Russian Twists (weighted)", sets: "3x20", note: "Seated, lean back slightly, rotate side to side with a plate or dumbbell." },
    { name: "Plank to Downward Dog", sets: "3x10", note: "From plank, push hips up to inverted V, return. Dynamic core + shoulder stability." },
  ],
  // BELLY / DEDICATED CORE (extra slot every day)
  belly: [
    { name: "Vacuum Exercise (standing)", sets: "3x30 sec hold", note: "Exhale fully, suck your belly button toward spine, hold. Shrinks waist over time. Do it daily." },
    { name: "Incline Walk (treadmill)", sets: "10-15 min", note: "Incline 10-12, speed 5.5 km/h. Best fat-burning cardio that doesn't eat muscle." },
    { name: "Battle Ropes (if available)", sets: "4x30 sec on/15 sec off", note: "Slam, wave, alternating. Heart rate spikes. Burns belly fat aggressively." },
    { name: "Jump Rope HIIT", sets: "10 rounds: 30 sec on / 20 sec off", note: "Sprint jump rope for 30 sec, rest 20. 10 rounds. Done. Very effective belly burner." },
    { name: "Box Jumps / Step-Ups (explosive)", sets: "4x8", note: "Explosive lower body cardio. Spikes metabolism. Good for hip tightening too." },
    { name: "Sled Push / Sprint (if available)", sets: "6x20m", note: "Most powerful fat-loss tool in the gym. If no sled, sprint 20m x 6 with 60 sec rest." },
    { name: "Rowing Machine Intervals", sets: "8 rounds: 250m hard / 90 sec rest", note: "All-body cardio. Burns fat from everywhere, especially midsection." },
    { name: "Burpees", sets: "4x10", note: "Squat, kick back, push-up, jump up. Full body explosion. Brutal for fat loss." },
  ],
};

const DAY_PLANS = {
  mon: {
    label: "Monday", color: "#e8ff00", bg: "rgba(232,255,0,0.08)", focus: "Push — Chest · Shoulders · Triceps",
    slots: [
      { key: "mon_main",     label: "Chest (Primary)" },
      { key: "mon_shoulder", label: "Shoulders" },
      { key: "mon_lateral",  label: "Lateral Delts" },
      { key: "mon_tricep",   label: "Triceps" },
      { key: "mon_core",     label: "Core / Stability" },
      { key: "belly",        label: "🔥 Belly Burner" },
    ],
  },
  tue: {
    label: "Tuesday", color: "#ff6b35", bg: "rgba(255,107,53,0.08)", focus: "Pull — Back · Biceps · Rear Delts",
    slots: [
      { key: "tue_lat",   label: "Lats (Primary)" },
      { key: "tue_row",   label: "Rows (Mid-Back)" },
      { key: "tue_bicep", label: "Biceps" },
      { key: "tue_rear",  label: "Rear Delts / Posture" },
      { key: "tue_core",  label: "Core / Abs" },
      { key: "belly",     label: "🔥 Belly Burner" },
    ],
  },
  thu: {
    label: "Thursday", color: "#00d4ff", bg: "rgba(0,212,255,0.08)", focus: "Lower Body — Legs · Glutes · Core",
    slots: [
      { key: "thu_squat", label: "Squat Pattern" },
      { key: "thu_hinge", label: "Hip Hinge / Deadlift" },
      { key: "thu_lunge", label: "Lunge / Unilateral" },
      { key: "thu_calf",  label: "Calves" },
      { key: "thu_core",  label: "Core / Anti-Rotation" },
      { key: "belly",     label: "🔥 Belly Burner" },
    ],
  },
  fri: {
    label: "Friday", color: "#c084fc", bg: "rgba(192,132,252,0.08)", focus: "Full Body Strength + Conditioning",
    slots: [
      { key: "fri_press",    label: "Press (Primary)" },
      { key: "fri_compound", label: "Compound Combo" },
      { key: "fri_deadlift", label: "Deadlift Variation" },
      { key: "fri_carry",    label: "Carries / Loaded Walk" },
      { key: "fri_core",     label: "Core / Rotation" },
      { key: "belly",        label: "🔥 Belly Burner" },
    ],
  },
};

const WORKOUT_DAYS = ["mon", "tue", "thu", "fri"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  date.setHours(0,0,0,0);
  return date;
}

function weeksBetween(a, b) {
  return Math.floor((b - a) / (7 * 24 * 60 * 60 * 1000));
}

function totalWeeks() {
  const start = getMonday(START_DATE);
  const end = getMonday(END_DATE);
  return weeksBetween(start, end) + 1;
}

function currentWeekIndex() {
  const start = getMonday(START_DATE);
  const now = getMonday(new Date());
  const idx = weeksBetween(start, now);
  return Math.max(0, Math.min(idx, totalWeeks() - 1));
}

function weekLabel(idx) {
  const start = getMonday(START_DATE);
  const d = new Date(start);
  d.setDate(d.getDate() + idx * 7);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  const fmt = (dt) => dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return `${fmt(d)} - ${fmt(end)}`;
}

function sessionKey(weekIdx, dayKey) {
  return `w${weekIdx}_${dayKey}`;
}

function daysUntilEnd() {
  const now = new Date();
  now.setHours(0,0,0,0);
  const diff = END_DATE - now;
  return Math.max(0, Math.ceil(diff / (24*60*60*1000)));
}

function pickDefault(poolKey) {
  return 0; // always default to index 0
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const total = totalWeeks();
  const [week, setWeek] = useState(currentWeekIndex());
  const [log, setLog] = useState({}); // { "w3_mon": { done: true, exercises: { slot_idx: exIdx } } }
  const [swaps, setSwaps] = useState({}); // { "w3_mon_2": 1 } — week+day+slot -> pool index
  const [openDay, setOpenDay] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(null); // { weekIdx, dayKey, slotIdx }
  const [view, setView] = useState("week"); // "week" | "progress"

  // load from storage
  useEffect(() => {
    (async () => {
      try {
        const l = await storage.get("log");
        if (l) setLog(JSON.parse(l.value));
      } catch {}
      try {
        const s = await storage.get("swaps");
        if (s) setSwaps(JSON.parse(s.value));
      } catch {}
    })();
  }, []);

  const saveLog = useCallback(async (next) => {
    setLog(next);
    try { await storage.set("log", JSON.stringify(next)); } catch {}
  }, []);

  const saveSwaps = useCallback(async (next) => {
    setSwaps(next);
    try { await storage.set("swaps", JSON.stringify(next)); } catch {}
  }, []);

  // Toggle a day done/skipped
  function toggleDay(weekIdx, dayKey, done) {
    const key = sessionKey(weekIdx, dayKey);
    const next = { ...log, [key]: { ...log[key], done } };
    saveLog(next);
  }

  // Get which exercise index is active for a slot
  function getExIdx(weekIdx, dayKey, slotIdx) {
    const k = `${weekIdx}_${dayKey}_${slotIdx}`;
    return swaps[k] ?? 0;
  }

  // Shuffle a specific slot (today only)
  function shuffleSlot(weekIdx, dayKey, slotIdx, poolKey, currentIdx) {
    const pool = EXERCISE_POOLS[poolKey];
    let next = (currentIdx + 1) % pool.length;
    const k = `${weekIdx}_${dayKey}_${slotIdx}`;
    const nextSwaps = { ...swaps, [k]: next };
    saveSwaps(nextSwaps);
    setShowSwapModal(null);
  }

  // Shuffle the whole day (replace all slots with next option)
  function shuffleDay(weekIdx, dayKey) {
    const plan = DAY_PLANS[dayKey];
    const nextSwaps = { ...swaps };
    plan.slots.forEach((slot, idx) => {
      const k = `${weekIdx}_${dayKey}_${idx}`;
      const pool = EXERCISE_POOLS[slot.key];
      const cur = nextSwaps[k] ?? 0;
      nextSwaps[k] = (cur + 1) % pool.length;
    });
    saveSwaps(nextSwaps);
  }

  // Stats
  function calcStats() {
    let totalSessions = 0, doneSessions = 0, skippedSessions = 0;
    for (let w = 0; w < total; w++) {
      for (const d of WORKOUT_DAYS) {
        const key = sessionKey(w, d);
        totalSessions++;
        if (log[key]?.done === true) doneSessions++;
        if (log[key]?.done === false) skippedSessions++;
      }
    }
    const weeksLogged = new Set(
      Object.keys(log).filter(k => log[k]?.done !== undefined).map(k => k.split("_")[0])
    ).size;
    return { totalSessions, doneSessions, skippedSessions, weeksLogged };
  }

  const stats = calcStats();
  const completion = stats.totalSessions > 0 ? Math.round((stats.doneSessions / (4 * total)) * 100) : 0;
  const daysLeft = daysUntilEnd();
  const weeksLeft = Math.ceil(daysLeft / 7);

  // Weekly completion bar data
  const weekBars = Array.from({ length: total }, (_, w) => {
    const done = WORKOUT_DAYS.filter(d => log[sessionKey(w, d)]?.done === true).length;
    const skipped = WORKOUT_DAYS.filter(d => log[sessionKey(w, d)]?.done === false).length;
    return { done, skipped, total: 4 };
  });

  // ── Sidebar content (stats + week grid) — shown left on desktop, inside progress tab on mobile
  const SidebarStats = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { label: "Completed", val: stats.doneSessions, color: "#e8ff00" },
          { label: "Skipped", val: stats.skippedSessions, color: "#ff3333" },
          { label: "Weeks Done", val: stats.weeksLogged ?? 0, color: "#c084fc" },
          { label: "Weeks Left", val: weeksLeft, color: "#00d4ff" },
        ].map(s => (
          <div key={s.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 30, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 9, color: "#555", fontFamily: "'DM Mono'", marginTop: 4, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div>
        <div style={{ fontFamily: "'DM Mono'", fontSize: 9, letterSpacing: 2, color: "#444", marginBottom: 10 }}>// ALL 52 WEEKS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))", gap: 4 }}>
          {weekBars.map((wb, w) => {
            const isCurrent = w === currentWeekIndex();
            const isPast = w < currentWeekIndex();
            const allDone = wb.done === 4;
            const anyDone = wb.done > 0;
            const bg = allDone ? "#e8ff00" : anyDone ? "#4a5500" : isPast ? "#1a1a1a" : "#111";
            const textColor = allDone ? "#000" : anyDone ? "#e8ff00" : "#333";
            return (
              <button key={w} className="btn" title={`Week ${w+1}: ${weekLabel(w)}`}
                onClick={() => { setWeek(w); setView("week"); }}
                style={{ aspectRatio: "1", borderRadius: 6, background: bg,
                  border: `1px solid ${isCurrent ? "#e8ff00" : "#1e1e1e"}`,
                  boxShadow: isCurrent ? "0 0 0 2px #e8ff0066" : "none",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s", minWidth: 0 }}>
                <div style={{ fontSize: 9, fontFamily: "'DM Mono'", color: textColor, lineHeight: 1 }}>{w+1}</div>
                {wb.done > 0 && <div style={{ fontSize: 7, color: allDone ? "#000" : "#e8ff00", marginTop: 1 }}>{"●".repeat(wb.done)}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[["#e8ff00", "Perfect (4/4)"], ["#4a5500", "Partial"], ["#1a1a1a", "Past"], ["#111", "Upcoming"]].map(([bg, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: "1px solid #2a2a2a", flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#555" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Monthly breakdown */}
      <div>
        <div style={{ fontFamily: "'DM Mono'", fontSize: 9, letterSpacing: 2, color: "#444", marginBottom: 10 }}>// MONTH-BY-MONTH</div>
        {(() => {
          const months = {};
          for (let w = 0; w < total; w++) {
            const d = new Date(getMonday(START_DATE));
            d.setDate(d.getDate() + w * 7);
            const mk = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
            if (!months[mk]) months[mk] = { done: 0, total: 0 };
            months[mk].total += 4;
            WORKOUT_DAYS.forEach(day => {
              if (log[sessionKey(w, day)]?.done === true) months[mk].done++;
            });
          }
          return Object.entries(months).map(([mk, m]) => (
            <div key={mk} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{mk}</span>
                <span style={{ fontSize: 10, color: "#666", fontFamily: "'DM Mono'" }}>{m.done}/{m.total}</span>
              </div>
              <div style={{ height: 5, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${m.total > 0 ? (m.done/m.total)*100 : 0}%`, background: "linear-gradient(90deg,#e8ff00,#00d4ff)", borderRadius: 3, transition: "width 0.4s ease" }} />
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Reminder */}
      <div style={{ background: "#0d1100", border: "1px solid #2a3a00", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, color: "#c8b96a", lineHeight: 1.8 }}>
          <strong style={{ color: "#e8ff00" }}>Remember:</strong> {daysLeft} days left in your year. Consistency beats intensity. Even 3 out of 4 days each week compounds to a completely different body by the end. Track honestly — the skips are data, not failure.
        </div>
      </div>
    </div>
  );

  // ── Week panel content
  const WeekPanel = () => (
    <div className="fade-in">
      {/* Week navigator */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button className="btn" onClick={() => setWeek(w => Math.max(0, w-1))}
          style={{ width: 36, height: 36, borderRadius: 8, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f0f0f0", fontSize: 18, flexShrink: 0 }}>‹</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Week {week + 1} <span style={{ color: "#444", fontWeight: 400 }}>of {total}</span></div>
          <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Mono'", marginTop: 2 }}>{weekLabel(week)}</div>
        </div>
        <button className="btn" onClick={() => setWeek(w => Math.min(total-1, w+1))}
          style={{ width: 36, height: 36, borderRadius: 8, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f0f0f0", fontSize: 18, flexShrink: 0 }}>›</button>
        <button className="btn" onClick={() => setWeek(currentWeekIndex())}
          style={{ padding: "6px 12px", borderRadius: 8, background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#e8ff00", fontSize: 10, fontFamily: "'DM Mono'", letterSpacing: 1, flexShrink: 0 }}>NOW</button>
      </div>

      {/* Day cards */}
      {WORKOUT_DAYS.map(dayKey => {
        const plan = DAY_PLANS[dayKey];
        const sKey = sessionKey(week, dayKey);
        const status = log[sKey]?.done;
        const isOpen = openDay === `${week}_${dayKey}`;

        return (
          <div key={dayKey} style={{
            border: `1px solid ${status === true ? plan.color + "55" : status === false ? "#ff333344" : "#222"}`,
            borderRadius: 12, marginBottom: 10, overflow: "hidden",
            background: status === true ? plan.bg : "#0f0f0f",
            transition: "border-color 0.2s, background 0.2s"
          }}>
            {/* Day header */}
            <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", userSelect: "none" }}
              onClick={() => setOpenDay(isOpen ? null : `${week}_${dayKey}`)}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: plan.color, boxShadow: `0 0 8px ${plan.color}`, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: plan.color, letterSpacing: 2, lineHeight: 1 }}>{plan.label}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{plan.focus}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <button className="btn" onClick={() => toggleDay(week, dayKey, true)}
                  style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: status === true ? plan.color : "#1a1a1a",
                    color: status === true ? "#000" : "#555",
                    border: `1px solid ${status === true ? plan.color : "#2a2a2a"}`,
                    transition: "all 0.15s" }}>✓</button>
                <button className="btn" onClick={() => toggleDay(week, dayKey, false)}
                  style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: status === false ? "#ff3333" : "#1a1a1a",
                    color: status === false ? "#fff" : "#555",
                    border: `1px solid ${status === false ? "#ff3333" : "#2a2a2a"}`,
                    transition: "all 0.15s" }}>✗</button>
              </div>
              <div style={{ color: "#333", fontSize: 13, marginLeft: 2, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</div>
            </div>

            {/* Expanded exercises */}
            {isOpen && (
              <div style={{ borderTop: "1px solid #1e1e1e" }}>
                <div style={{ padding: "10px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono'", letterSpacing: 1 }}>THIS WEEK'S EXERCISES</span>
                  <button className="btn" onClick={() => shuffleDay(week, dayKey)}
                    style={{ padding: "5px 14px", borderRadius: 20, fontSize: 10, fontFamily: "'DM Mono'", letterSpacing: 1,
                      background: "#1a1a1a", border: `1px solid ${plan.color}44`, color: plan.color, cursor: "pointer" }}>
                    ⟳ SHUFFLE ALL
                  </button>
                </div>

                {plan.slots.map((slot, slotIdx) => {
                  const exIdx = getExIdx(week, dayKey, slotIdx);
                  const pool = EXERCISE_POOLS[slot.key];
                  const ex = pool[exIdx];
                  return (
                    <div key={slotIdx} className="slot-row" style={{
                      padding: "13px 18px", borderBottom: "1px solid #141414",
                      display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start"
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontFamily: "'DM Mono'", color: "#3a3a3a", letterSpacing: 1, marginBottom: 4 }}>{slot.label.toUpperCase()}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: plan.color, marginBottom: 4, lineHeight: 1.3 }}>{ex.name}</div>
                        <div style={{ fontSize: 11, color: "#5a5a5a", lineHeight: 1.65 }}>{ex.note}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                        <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: "#888", whiteSpace: "nowrap",
                          padding: "4px 10px", borderRadius: 20, border: "1px solid #252525", background: "#161616" }}>
                          {ex.sets}
                        </div>
                        <button className="btn" onClick={() => shuffleSlot(week, dayKey, slotIdx, slot.key, exIdx)}
                          style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontFamily: "'DM Mono'",
                            background: "#1a1a1a", border: "1px solid #252525", color: "#555", cursor: "pointer",
                            transition: "color 0.15s, border-color 0.15s" }}
                          onMouseEnter={e => { e.target.style.color = plan.color; e.target.style.borderColor = plan.color + "55"; }}
                          onMouseLeave={e => { e.target.style.color = "#555"; e.target.style.borderColor = "#252525"; }}>
                          ⟳ {exIdx + 1}/{pool.length}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Rest days */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 4 }}>
        {["Wednesday", "Saturday", "Sunday"].map(d => (
          <div key={d} style={{ border: "1px solid #161616", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#2a2a2a", marginBottom: 2 }}>{d}</div>
            <div style={{ fontSize: 9, color: "#222", fontFamily: "'DM Mono'", letterSpacing: 1 }}>REST</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#f0f0f0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        .btn { cursor: pointer; border: none; font-family: inherit; background: none; }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .slot-row:hover { background: rgba(255,255,255,0.025); }
        .tab-btn { transition: all 0.2s; }

        /* ── LAYOUT ── */
        .app-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        /* top bar — always full width */
        .topbar {
          border-bottom: 1px solid #1a1a1a;
          padding: 28px 32px 0;
          flex-shrink: 0;
        }
        /* body splits into sidebar + main on wide screens */
        .app-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .sidebar {
          display: none;
          width: 320px;
          flex-shrink: 0;
          border-right: 1px solid #1a1a1a;
          padding: 24px 24px 40px;
          overflow-y: auto;
          height: calc(100vh - 140px);
          position: sticky;
          top: 0;
        }
        .main-panel {
          flex: 1;
          overflow-y: auto;
          padding: 24px 28px 48px;
          min-width: 0;
        }
        /* mobile tabs */
        .mobile-tabs {
          display: flex;
        }
        /* ── BREAKPOINTS ── */
        @media (min-width: 860px) {
          .topbar { padding: 32px 40px 0; }
          .sidebar { display: block; }
          .mobile-tabs { display: none; }
          .main-panel { padding: 28px 40px 56px; }
          .topbar-title { font-size: 56px !important; }
        }
        @media (min-width: 1200px) {
          .sidebar { width: 360px; padding: 28px 32px 48px; }
          .main-panel { padding: 32px 56px 64px; }
        }
      `}</style>

      <div className="app-shell">
        {/* ── TOP BAR ── */}
        <div className="topbar">
          <div style={{ fontFamily: "'DM Mono'", fontSize: 10, letterSpacing: 3, color: "#444", marginBottom: 10 }}>
            // 1-YEAR · STRENGTH TRACKER
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="topbar-title" style={{ fontFamily: "'Bebas Neue'", fontSize: 44, letterSpacing: 2, lineHeight: 1 }}>
                YOUR <span style={{ color: "#e8ff00" }}>PLAN</span>
              </div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 5 }}>
                {daysLeft} days remaining · {weeksLeft} weeks left · Week {currentWeekIndex() + 1} of {total}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 40, color: "#e8ff00", letterSpacing: 1, lineHeight: 1 }}>{completion}%</div>
                <div style={{ fontSize: 9, color: "#444", fontFamily: "'DM Mono'", letterSpacing: 1 }}>OVERALL</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 40, color: "#00d4ff", letterSpacing: 1, lineHeight: 1 }}>{stats.doneSessions}</div>
                <div style={{ fontSize: 9, color: "#444", fontFamily: "'DM Mono'", letterSpacing: 1 }}>DONE</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: "#181818", borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completion}%`, background: "linear-gradient(90deg, #e8ff00, #00d4ff)", borderRadius: 2, transition: "width 0.6s ease" }} />
          </div>

          {/* Mobile-only tabs */}
          <div className="mobile-tabs" style={{ gap: 4, marginBottom: -1 }}>
            {[["week", "This Week"], ["progress", "Progress"]].map(([v, label]) => (
              <button key={v} className="btn tab-btn" onClick={() => setView(v)}
                style={{ padding: "9px 16px", fontSize: 12, fontWeight: 600, borderRadius: "8px 8px 0 0",
                  background: view === v ? "#0f0f0f" : "transparent",
                  color: view === v ? "#f0f0f0" : "#444",
                  border: `1px solid ${view === v ? "#222" : "transparent"}`,
                  borderBottom: view === v ? "1px solid #0f0f0f" : "none" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── APP BODY ── */}
        <div className="app-body">
          {/* Sidebar — desktop only, always shows stats */}
          <aside className="sidebar">
            <SidebarStats />
          </aside>

          {/* Main panel */}
          <main className="main-panel">
            {/* Desktop: always shows week view */}
            {/* Mobile: toggles between week and progress */}
            {view === "week" ? (
              <WeekPanel />
            ) : (
              <div className="fade-in">
                <SidebarStats />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}