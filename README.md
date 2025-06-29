# VideoPull - Zoom Recording Downloader

Downloads Zoom cloud recordings from shared links without authorization when downloading is disabled. 
Works even in cases when [ZED: Zoom Easy Downloader](https://chromewebstore.google.com/detail/zed-zoom-easy-downloader/pdadlkbckhinonakkfkdaadceojbekep) fails after recent Zoom updates.

🌐 **Web version available at [videopull.net](https://videopull.net)**

Zoom might patch this exploit in the future. If it stops working, open an issue on GitHub and we'll try to find new workarounds.

## Repository Structure

- **`backend/`** - FastAPI server that processes Zoom URLs
- **`frontend/`** - React web client

## CLI Usage

Install dependencies:
```bash
git clone https://github.com/katcinskiy/zoom-downloader.git
cd zoom-downloader
pip install -r requirements.txt
playwright install chromium
```

Basic usage:
```bash
python zoom_downloader.py https://zoom.us/rec/share/your-link
```

Custom filename:
```bash
python zoom_downloader.py https://zoom.us/rec/share/your-link -o meeting.mp4
```