# YOLO / Hand Gesture Logic Extraction

This document extracts the gesture/sign logic from Spirit OS so it can be copied into another project.

Important: the current working gesture system is not actually running YOLO inference. The active implementation uses MediaPipe Hands landmarks, custom geometric classification, and an optional TensorFlow.js sign-language classifier. YOLO is only referenced as an optional object-detection model location: `client/public/models/yolo/yolov8s.onnx`.

If you want the exact behavior from Spirit OS, copy the MediaPipe landmark logic below. If you specifically want YOLO object detection, you still need to add an ONNX Runtime wrapper because this repo does not currently contain an active `useYoloDetector.js`.

## Source Files

Main runtime files:

- `client/src/input/GestureController.jsx`
- `client/src/input/SignLanguageController.jsx`
- `client/src/input/sharedCamera.js`
- `client/src/input/loadMediaPipeHands.js`
- `client/src/config/gestureConfig.js`
- `client/src/input/signLanguage/signConfig.js`

Training/dev files for sign language:

- `client/src/input/signLanguage/SignDataCollector.jsx`
- `client/src/input/signLanguage/trainClassifier.js`

Required public assets:

- `client/public/mediapipe-hands/`
- Optional placeholder: `client/public/models/yolo/yolov8s.onnx`
- Optional trained sign model output: `client/public/sign_model/model.json`

## Dependencies

Runtime:

```bash
npm install @mediapipe/hands @tensorflow/tfjs
```

Training the sign-language classifier:

```bash
npm install @tensorflow/tfjs-node
```

## Architecture

Gesture control:

```text
webcam
  -> sharedCamera.acquireCamera()
  -> MediaPipe Hands
  -> 21 hand landmarks
  -> custom geometry classifier
  -> majority vote / swipe tracker / hold timer
  -> OS action
```

Sign language:

```text
webcam
  -> sharedCamera.acquireCamera()
  -> MediaPipe Hands
  -> 21 hand landmarks
  -> normalize landmarks relative to wrist
  -> TF.js classifier
  -> confidence threshold
  -> dwell timer
  -> speak/show sign
```

## Shared Camera Logic

Use one camera stream for all input controllers. This avoids browser camera conflicts.

Core behavior from `sharedCamera.js`:

- Maintain one `_stream`.
- Maintain `_refCount`.
- If camera is already starting, reuse `_pending` promise.
- Stop tracks only when ref count reaches zero.

Camera request:

```js
navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'user', width: 960, height: 540 },
  audio: false
})
```

## MediaPipe Hands Loader

`loadMediaPipeHands.js` tries three sources:

1. Existing global `window.Hands`
2. Dynamic import from `@mediapipe/hands`
3. Local script: `/mediapipe-hands/hands.js`

MediaPipe options used by both gesture and sign-language controllers:

```js
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5
})
```

## Landmark Index Map

MediaPipe Hands returns 21 landmarks:

```text
0  WRIST
1  THUMB_CMC
2  THUMB_MCP
3  THUMB_IP
4  THUMB_TIP
5  INDEX_MCP
6  INDEX_PIP
7  INDEX_DIP
8  INDEX_TIP
9  MIDDLE_MCP
10 MIDDLE_PIP
11 MIDDLE_DIP
12 MIDDLE_TIP
13 RING_MCP
14 RING_PIP
15 RING_DIP
16 RING_TIP
17 PINKY_MCP
18 PINKY_PIP
19 PINKY_DIP
20 PINKY_TIP
```

## Gesture Constants

From `GestureController.jsx`:

```js
const PINCH_THRESH = 0.38
const SWIPE_DX = 0.15
const SWIPE_MS = 700
const SWIPE_MAX_DY = 0.18
const SWIPE_MIN_SPEED = 0.35
const SWIPE_ARMING_DX = 0.08
const SWIPE_ARMING_SPEED = 0.22
const HOLD_MS = 400
const VOTE_MIN = 2
```

From `gestureConfig.js`:

```js
GESTURE_COOLDOWN = 2000
GESTURE_HOLD_TIME = 800
CLICK_COOLDOWN = 300
KEY_COOLDOWN = 250
MOUSE_SMOOTHING = 0.55
MAJORITY_VOTE_MIN = 3
```

The controller uses the local `HOLD_MS` and `VOTE_MIN` values for current hold/vote behavior.

## Geometry Classifier

The classifier is based on normalized distances, not image pixels.

Helper:

```js
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
```

Palm scale:

```js
const palm = dist(indexMcp, pinkyMcp) + 1e-3
```

Palm center:

```js
const palmCenter = {
  x: (wrist.x + indexMcp.x + middleMcp.x + ringMcp.x + pinkyMcp.x) / 5,
  y: (wrist.y + indexMcp.y + middleMcp.y + ringMcp.y + pinkyMcp.y) / 5
}
```

Finger extension:

```js
const fingerExt = (tip, pip) =>
  dist(tip, wrist) > dist(pip, wrist) + palm * 0.15
```

Thumb extension:

```js
const thumbExtRatio = dist(thumbTip, indexMcp) / palm
const thumbReach = dist(thumbTip, thumbMcp) / palm
const thumbExt = thumbExtRatio > 1.1
const thumbPoseExt = thumbExt || thumbReach > 0.65
```

Pinch:

```js
const pinchDist = dist(thumbTip, indexTip) / palm
if (pinchDist < PINCH_THRESH) return 'pinch'
```

Thumb up/down support:

```js
const fingerCurledForThumb = (tip, pip, mcp) => (
  dist(tip, mcp) < palm * 1.0 ||
  dist(tip, wrist) < dist(pip, wrist) + palm * 0.18
)
```

Thumb direction:

```js
const thumbDeltaY = thumbTip.y - thumbMcp.y
const thumbUpRaw =
  thumbDeltaY < -palm * 0.45 &&
  thumbTip.y < indexMcp.y - palm * 0.15

const thumbDownRaw =
  thumbDeltaY > palm * 0.45 &&
  thumbTip.y > indexMcp.y + palm * 0.15
```

Three-finger variants:

```js
const extCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length
const threeNonThumb = extCount === 3
const threeWithThumb = thumbExt && indexExt && middleExt && !ringExt && !pinkyExt
const loveYouSign = thumbExt && indexExt && !middleExt && !ringExt && pinkyExt
```

## Gesture Classification Order

Order matters. More specific gestures must be checked first.

```text
1. pinch
2. thumb_up / thumb_down
3. open_palm
4. three
5. peace
6. point
7. fist
8. null
```

Rules:

```js
if (pinchDist < PINCH_THRESH) {
  return 'pinch'
}

if (mostlyFingersCurled && thumbPoseExt) {
  if (thumbUpRaw) return 'thumb_up'
  if (thumbDownRaw) return 'thumb_down'
}

if (indexExt && middleExt && ringExt && pinkyExt && thumbExt) {
  return 'open_palm'
}

if (threeNonThumb || threeWithThumb || loveYouSign) {
  return 'three'
}

if (indexExt && middleExt && !ringExt && !pinkyExt) {
  return 'peace'
}

if (indexExt && !middleExt && !ringExt && !pinkyExt) {
  return 'point'
}

if (!indexExt && !middleExt && !ringExt && !pinkyExt && !thumbExt) {
  return 'fist'
}
```

## Cursor Mapping

The cursor follows index-tip landmark 8.

Because the camera preview is mirrored, X is flipped:

```js
const PAD = 0.18
const usable = 1 - 2 * PAD
const fx = clamp((point.x - PAD) / usable, 0, 1)
const fy = clamp((point.y - PAD) / usable, 0, 1)

const viewportX = (1 - fx) * window.innerWidth
const viewportY = fy * window.innerHeight
```

Smoothing:

```js
const lerp = (a, b, t) => (a == null ? b : a + (b - a) * t)
smoothX = lerp(previousX, viewportX, MOUSE_SMOOTHING)
smoothY = lerp(previousY, viewportY, MOUSE_SMOOTHING)
```

## Click Logic

Pinch fires immediately if cursor mode is on and click cooldown is ready.

The controller dispatches pointer and mouse events manually:

```text
pointerover
pointerenter
pointerdown
mousedown
pointerup
mouseup
click
pointerout
pointerleave
```

For fist/right-click:

```text
pointerdown
mousedown
pointerup
mouseup
contextmenu
```

Double-click:

- Store last pinch target and timestamp.
- If the same target is pinched again within 500 ms, dispatch `dblclick`.

## Swipe Logic

Swipe is not a static hand shape. It is detected from palm-center motion.

Track samples:

```js
swipeTrack.push({ x: palmCenter.x, y: palmCenter.y, t: now, gesture })
keep samples where now - t <= 700
```

Compute:

```js
dx = last.x - first.x
dy = last.y - first.y
dt = last.t - first.t
speed = Math.abs(dx) / (dt / 1000)
```

Reject if:

- A thumb up/down pose appears in the track.
- Vertical movement is too high.
- Direction is inconsistent.
- Speed is too low.

Swipe fires when:

```js
Math.abs(dx) > SWIPE_DX
Math.abs(dy) < SWIPE_MAX_DY
speed > SWIPE_MIN_SPEED
mostlySameDirection === true
```

Direction:

```js
const swipeGesture = dx < 0 ? 'swipe_right' : 'swipe_left'
```

Note: because the camera is mirrored visually, this direction mapping is intentionally chosen for the current app behavior.

## Majority Vote and Hold

Static gestures do not fire instantly. They go through:

1. Last 5-frame history.
2. Majority vote.
3. Hold timer.
4. Latch/cooldown.

Majority vote:

```js
hist.push(gesture)
if (hist.length > 5) hist.shift()

count each non-null gesture
stable = gesture with highest count
if (topCount < VOTE_MIN) stable = null
```

Hold timer:

```js
setTimeout(() => {
  runAction(stableGesture)
  lastFired = stableGesture
  lastFiredAt = Date.now()
}, HOLD_MS)
```

Latch behavior:

- Same gesture cannot refire for 3 seconds.
- Neutral/point resets latch.
- Horizontal swipe motion cancels static hold.

## Action Map

Normal desktop mode:

| Gesture | Action |
| --- | --- |
| `point` | cursor only |
| `pinch` | left click / double click |
| `fist` | right click |
| `open_palm` | open Notes |
| `thumb_up` | open File Explorer |
| `thumb_down` | close focused window |
| `peace` | open Calculator |
| `three` | open Translator |
| `swipe_right` | focus next window |
| `swipe_left` | focus previous window |

Presentation mode:

| Gesture | Action |
| --- | --- |
| `thumb_up`, `open_palm`, `peace` | next slide |
| `thumb_down` | close presentation |
| `three` | read slide |

## Sign Language Labels

From `signConfig.js`:

```js
export const SIGN_LABELS = [
  'Hello', 'Thank You', 'Yes', 'No',
  'Help', 'Please', 'Sorry', 'Goodbye'
]

export const CONFIDENCE_THRESHOLD = 0.82
export const DWELL_TIME_MS = 600
```

## Sign Language Runtime

Model path:

```js
const MODEL_URL = '/sign_model/model.json'
```

Load:

```js
const model = await tf.loadLayersModel(MODEL_URL)
```

Normalize landmarks relative to wrist:

```js
function normaliseLandmarks(landmarks) {
  const wrist = landmarks[0]
  const flat = new Float32Array(63)
  for (let i = 0; i < 21; i++) {
    flat[i * 3] = landmarks[i].x - wrist.x
    flat[i * 3 + 1] = landmarks[i].y - wrist.y
    flat[i * 3 + 2] = (landmarks[i].z ?? 0) - (wrist.z ?? 0)
  }
  return flat
}
```

Classify:

```js
const input = tf.tensor2d([Array.from(flat)])
const preds = model.predict(input)
const data = preds.dataSync()
input.dispose()
preds.dispose()
```

Pick max probability:

```js
let maxIdx = 0
let maxVal = data[0]
for (let i = 1; i < data.length; i++) {
  if (data[i] > maxVal) {
    maxVal = data[i]
    maxIdx = i
  }
}
return { label: SIGN_LABELS[maxIdx], confidence: maxVal }
```

Dwell rule:

- If confidence is below `0.82`, clear dwell timer.
- If label changes, start a new `600 ms` timer.
- If the same label stays long enough, speak and add to recent history.

## Sign Language Training

Data collection:

- Go to `/dev/sign-collector`.
- Collect `30` samples per sign.
- Export `sign_training_data.json`.
- Place it in `client/src/input/signLanguage/sign_training_data.json`.

Model architecture from `trainClassifier.js`:

```text
63 inputs
  -> Dense 128 ReLU
  -> Dropout 0.3
  -> Dense 64 ReLU
  -> Dropout 0.2
  -> Dense 8 Softmax
```

Training:

```js
optimizer: adam(0.001)
loss: categoricalCrossentropy
metrics: accuracy
epochs: 100
batchSize: 32
split: 80/20 train/validation
```

Output:

```text
client/public/sign_model/model.json
client/public/sign_model/group1-shard1of1.bin
```

## Optional YOLO Model Status

The repo contains this note:

```text
client/public/models/yolo/yolov8s.onnx
```

Expected purpose:

- Optional object detection in the gesture camera preview.
- COCO 80-class labels as badges.
- Should not block MediaPipe gesture control if missing.

But the active source tree does not include the ONNX runtime hook that consumes it. To add actual YOLO in another project, you need to implement:

```js
import * as ort from 'onnxruntime-web'

const session = await ort.InferenceSession.create('/models/yolo/yolov8s.onnx')
// preprocess video frame -> tensor
// session.run({ images: tensor })
// postprocess boxes/classes/scores
// draw detections
```

Keep YOLO separate from the hand gesture classifier. Use it as an overlay or object detector, not as the source of hand landmarks.

## Minimal Copy Checklist

Copy these files:

```text
client/src/input/GestureController.jsx
client/src/input/sharedCamera.js
client/src/input/loadMediaPipeHands.js
client/src/config/gestureConfig.js
client/public/mediapipe-hands/
```

If you need sign language:

```text
client/src/input/SignLanguageController.jsx
client/src/input/signLanguage/signConfig.js
client/src/input/signLanguage/SignDataCollector.jsx
client/src/input/signLanguage/trainClassifier.js
client/public/sign_model/
```

Then adapt imports:

- Replace `useOsStore` with your app state.
- Replace `useWindowStore` with your own action handlers.
- Replace `APP_DEFAULTS` with your own app/window sizes.
- Keep `sharedCamera` if more than one component uses webcam.

## Porting Strategy

Recommended structure in another React project:

```text
src/input/
  GestureController.jsx
  SignLanguageController.jsx
  sharedCamera.js
  loadMediaPipeHands.js

src/config/
  gestureConfig.js

public/
  mediapipe-hands/
  sign_model/
  models/yolo/
```

Mount the controller once near the root:

```jsx
function App() {
  return (
    <>
      <YourApp />
      {gestureEnabled && <GestureController />}
      {signLanguageEnabled && <SignLanguageController />}
    </>
  )
}
```

Replace the action map with callbacks:

```js
const actions = {
  thumb_up: openFiles,
  thumb_down: closeActive,
  peace: openCalculator,
  three: openTranslator,
  open_palm: openNotes,
  fist: rightClick,
  swipe_right: nextWindow,
  swipe_left: prevWindow
}
```

## Common Failure Points

- Camera permission denied: show a clear UI error.
- Multiple webcam users: use `sharedCamera`, never call `getUserMedia` everywhere.
- MediaPipe constructor missing: serve `/mediapipe-hands/hands.js` correctly.
- Gesture flicker: keep majority vote plus hold timer.
- Swipe confused with thumb: keep the `thumbPoseInTrack` rejection.
- Pinch confused during swipe: keep `horizontalMotion` suppression.
- Sign model missing: disable sign-language toggle until `/sign_model/model.json` exists.
- Memory leaks: dispose TF tensors after every prediction.

## Summary

The exact transferable logic is MediaPipe Hands landmarks plus deterministic geometry, not YOLO. YOLO is only an optional model placeholder in this repo. For another project, copy the camera loader, MediaPipe asset folder, gesture classifier, smoothing/click/swipe logic, and optional TF.js sign classifier.
