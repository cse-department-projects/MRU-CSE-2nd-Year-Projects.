# ESP32-S3 voice assistant with OLED face

## What you need
- ESP32-S3 Mini
- OLED 1.3" I2C (4-pin, SSD1306 or SH1106 driver, 128x64)
- INMP441 I2S microphone module
- MAX98357A I2S amplifier module + a small speaker (4-8 ohm)
- TTP223 touch sensor module
- A PC or Raspberry Pi on the same WiFi (this runs the "brain")

## Wiring
| Module   | Pin       | ESP32-S3 GPIO |
|----------|-----------|---------------|
| OLED     | SDA / SCL | 8 / 9         |
| INMP441  | WS/SCK/SD | 5 / 4 / 6 (L/R -> GND) |
| MAX98357A| LRC/BCLK/DIN | 17 / 16 / 18 |
| TTP223   | OUT       | 1             |

All modules: VCC -> 3V3, GND -> GND.

## 1. Set up the server (the "brain")
```bash
pip install flask openai
export OPENAI_API_KEY="sk-..."      # get one at platform.openai.com
python server.py
```
Note the IP address it prints, e.g. `192.168.1.50`.

## 2. Flash the ESP32
1. Install Arduino IDE, add ESP32 board support (Espressif "esp32" package).
2. Board: your ESP32-S3 board, with **PSRAM enabled** (Tools > PSRAM > OPI/QSPI PSRAM). This is required - the recording buffer lives in PSRAM.
3. Install libraries: "Adafruit GFX Library", "Adafruit SSD1306".
4. Open `voice_assistant.ino`, edit the top of the file:
   ```cpp
   const char* WIFI_SSID     = "your wifi name";
   const char* WIFI_PASSWORD = "your wifi password";
   const char* SERVER_URL    = "http://192.168.1.50:5000/ask"; // your server's IP
   ```
5. Upload.

## 3. Use it
- Touch and **hold** the sensor while you speak.
- Release when you're done - the face switches to "thinking", then "talking" once the answer starts playing.
- Face goes back to a calm idle expression, ready for the next touch.

## Notes and easy upgrades
- If your OLED is SH1106 instead of SSD1306, swap the include/library to `Adafruit_SH110X` and use `Adafruit_SH1106G` in place of `Adafruit_SSD1306` - the drawing calls stay identical.
- Max recording length is 8 seconds (`RECORD_SECONDS` in the .ino) - raise it if you have more PSRAM.
- Swap `voice="alloy"` in `server.py` for any other OpenAI TTS voice, or swap the whole STT/TTS stack for a local one (e.g. Whisper.cpp + Piper) if you'd rather not use a cloud API.
- The emoji faces are drawn with simple shapes (circles, lines) so they're easy to redesign - look at `faceIdle()`, `faceListening()`, `faceThinking()`, `faceSpeaking()` in the .ino.
