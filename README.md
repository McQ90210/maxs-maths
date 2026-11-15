# Raccoon Rovers: Max's Maths

A maths training app for Max (Year 5, KS2), built from his PiXL Year 5 Reasoning paper (Autumn, Paper 3).
Max manages Raccoon Rovers. Coony, the captain, gives the coach's tips. Every 5 questions earns a match.

## How it works
- All 22 questions from the paper, with step boxes, typical mistakes, 3 tier tips and mini worked examples.
- Handwriting scratch pad on squared paper (saved on each device, never read by the app).
- Wrong step: VAR review, Coony explains the step, Max fixes it for a comeback goal.
- Seven player skills match the National Curriculum Year 5 strands. Mastered = right with no wrong steps and at most one tip, on two different days.
- Rounds go through the paper in order first, then lean towards the questions he finds hardest.
- Grown ups area behind a PIN: match reports, detail per question, methods still learning.

## Files
- `index.html`, `style.css`
- `js/questions.js`: all question content, answers, mistakes, tips and examples
- `js/logic.js`: checking, mastery, round picking, match simulation
- `js/app.js`: screens
- `js/pad.js`, `js/sound.js`, `js/art.js`, `js/store.js`
- `firebase-config.js`, `firestore.rules`: the separate maxs-maths Firebase project

## Try it without signing in
Add `?demo=1` to the address. Progress then saves on that device only.
