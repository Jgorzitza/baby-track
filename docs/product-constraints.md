# Product Constraints

These constraints are locked and cannot be changed without formal review.

## Tracking & Features

### Sleep Tracking
- Must support start/end times.
- Calculated duration must be visible.
- Support for "currently sleeping" state.

### Feeding Tracking
- **Breastfeeding**: Support for Left/Right timers with play/pause.
- **Resume support**: Parents often switch sides during a single session.
- **Bottle feeds**: Tracking volume (oz/ml) and type (Formula/Breast milk).
- **Quality**: Simple outcome/quality rating (e.g., Good/Poor).

### Diaper Tracking
- Three primary categories: Wet, Dirty, Both.
- Optional detail fields for stool color/consistency and urine color.

### Health & Growth
- **Temperature**: Support for units (C/F).
- **Medication**: Dosage and time.
- **Growth**: Height/Weight tracking with simple percentile calculation (optional).
- **Symptoms**: Free-text logging with timestamp.

### Doctor Appointment Mode
- **Always Available**: Even if no appointment is scheduled.
- **Goal**: Show a curated summary of the last 24h, 48h, and 7d.
- **Insights**: Total sleep, feeding frequency, diaper count, health log.
- **Questions**: A list of questions for the doctor, entered in advance.

## Access & Sharing

### Household Model
- Exactly 2 parents per household (intended use).
- No individual siloing: Parent A sees exactly what Parent B sees.
- Household-based RLS in Supabase is mandatory.

### No Magic Links
- Auth is Email + Password only.
- Simplifies mobile browser edge cases.

## Non-Goals (Strict)
- **No Medical Advice**: The app does not say "Your baby is sick".
- **No AI Diagnosis**: No LLM-driven medical analysis.
- **No Social/Public Features**: This is for internal family use only.
- **No Next.js / SSR-first**: Offline-first App Shell is the priority.
