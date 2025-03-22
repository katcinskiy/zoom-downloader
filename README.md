# Zoom Recording Downloader

Downloads Zoom cloud recordings from shared links. 
Works even in cases when [ZED: Zoom Easy Downloader](https://chromewebstore.google.com/detail/zed-zoom-easy-downloader/pdadlkbckhinonakkfkdaadceojbekep) fails after recent Zoom updates.


Zoom might patch this exploit in the future. If it stops working, open an issue on GitHub and we'll try to find new workarounds.

## Install

```bash
git clone https://github.com/katcinskiy/zoom-downloader.git
cd zoom-downloader
pip install -r requirements.txt
playwright install chromium
```

## Usage

Basic:
```
python zoom_downloader.py https://zoom.us/rec/share/your-link
```

Custom filename:
```
python zoom_downloader.py https://zoom.us/rec/share/your-link -o meeting.mp4
```
