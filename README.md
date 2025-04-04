# Focus Timer App

![App Screenshot](./assets/screenshots/Screenshot.gif)

![App Screenshot](./assets/screenshots/Screenshot_2.gif)

A beautiful, animated countdown timer application built with React Native and Reanimated. Perfect for focus sessions, workouts, or any timed activity.

## Features

- 🎨 Smooth animations using React Native Reanimated
- ⏱️ Customizable timer durations (from 1 to 60 minutes in 5-minute increments)
- 📱 Responsive design that works on all screen sizes
- 🎚️ Intuitive scrollable timer selector
- 🔔 Vibration feedback when timer completes
- 🌈 Visually appealing color scheme

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/focus-timer.git
```

2. Install dependencies:
```bash
cd focus-timer
bun install
# or
yarn install
```

3. Run the app:
```bash
bunx expo start
```

## Technologies Used

- React Native
- React Native Reanimated
- Expo
- TypeScript
- Tailwind CSS (via NativeWind)


## Adding Screen Animations to README

To add animated screenshots to your README:

1. **Record your screen**:
   - On iOS: Use the built-in screen recorder
   - On Android: Use `adb shell screenrecord`
   - On Mac: Use QuickTime Player
   - On Windows: Use Xbox Game Bar (Win+Alt+R)

2. **Convert to GIF**:
```bash
# Using ffmpeg
ffmpeg -i screen-recording.mp4 -vf "fps=15,scale=640:-1:flags=lanczos" -c:v gif Screenshot.gif

# Or use online tools like:
# - https://ezgif.com/video-to-gif
# - https://cloudconvert.com/mp4-to-gif
```

3. **Optimize the GIF**:
```bash
# Using gifsicle
gifsicle -O3 --lossy=80 -o Screenshot.gif Screenshot_2.gif
```

4. **Add to your README**:
```markdown
![App Demo](./assets/screenshots/Screenshot.gif)
```

## Project Structure

```
/src
  /components
    TimerItem.tsx    # Timer selection item component
  /assets
    /image          # App icons and logos
    /screenshots     # App screenshots and GIFs
  /app
    _layout.tsx
    index.tsx            # Main application component
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT © Glitch404
```
