# Zoom Recording Downloader

A Python-based tool to download **Zoom cloud recordings** from shared links — even when downloading is disabled by the host.
Works in cases where browser extensions like [ZED: Zoom Easy Downloader](https://chromewebstore.google.com/detail/zed-zoom-easy-downloader/pdadlkbckhinonakkfkdaadceojbekep) fail, especially after Zoom's recent updates.

This script uses **Playwright** to intercept Zoom video streams, capture `.mp4` or `.m3u8` media links, and optionally merges multiple streams (e.g., screen share + webcam) using `ffmpeg`.

> Zoom may patch this method in the future. If it stops working, feel free to open an issue or suggest a fix.

---

## Features

* Detects and downloads multiple video streams
* Supports both `.mp4` and `.m3u8` formats
* Optionally merges streams using `ffmpeg` (side-by-side layout)
* Works without needing Zoom credentials

---

## Installation

### 1. Clone the repo

```bash
git clone https://github.com/your-username/zoom-downloader.git
cd zoom-downloader
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Install Playwright and browser drivers

```bash
playwright install chromium
```

> You’ll need Python 3.7+ and `ffmpeg` in your system PATH if you want to use the merge option.

---

## Usage

### Basic example

```bash
python zoom_downloader.py https://zoom.us/rec/share/your-recording-link
```

### Custom output filename

```bash
python zoom_downloader.py https://zoom.us/rec/share/your-link -o meeting_video
```

### Download and auto-merge streams (requires ffmpeg)

```bash
python zoom_downloader.py https://zoom.us/rec/share/your-link -o session --merge
```

The output will be saved in the `downloads/` folder.

---

## Notes

* Works best with shared Zoom cloud recordings that do not require login or passcodes.
* Set `headless=False` in the script if you want to see browser behavior while debugging.
* If you encounter `403` errors or failed downloads, check whether the recording has playback restrictions.

---

## License

MIT License. Use at your own risk.
