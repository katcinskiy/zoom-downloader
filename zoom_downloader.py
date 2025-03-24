#!/usr/bin/env python3

import asyncio
import requests
import argparse
from playwright.async_api import async_playwright


async def download_zoom_video_with_playwright(zoom_url, output_filename="zoom_recording.mp4"):
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                '--disable-web-security',
                '--ignore-certificate-errors',
                '--ignore-ssl-errors',
            ]
        )

        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        )

        page = await context.new_page()

        await page.route("**/*", lambda route: route.continue_())

        video_url = None

        async def handle_response(response):
            nonlocal video_url
            url = response.url
            status = response.status
            if '.mp4' in url and status in [200, 206]:
                print(f"Found video URL: {url}")
                video_url = url

        page.on("response", handle_response)

        try:
            print(f"Opening Zoom URL: {zoom_url}")
            await page.goto(zoom_url, wait_until="domcontentloaded", timeout=60000)

            print("Video URL not found immediately. Trying to interact with the page...")

            watch_selectors = [
                'span:text("Watch recording")'  # for zoom events, for example https://events.zoom.us/ejl/...
            ]

            if not video_url:
                print("Can't find video link so far, will try to click 'Watch recording' button")
                for selector in watch_selectors:
                    try:
                        print(f"Trying to click element with selector: {selector}")
                        await page.wait_for_selector(selector, timeout=5000)
                        await page.click(selector)
                        print(f"Clicked {selector}")

                        await asyncio.sleep(10)

                        if video_url:
                            print("Video URL found after clicking!")
                            break
                    except Exception as e:
                        print(f"Failed to interact with {selector}: {str(e)}")

            if not video_url:
                print("No video URL found, sorry. Please open a bug.")
                return False

            cookies = await context.cookies()
            cookies_dict = {cookie['name']: cookie['value'] for cookie in cookies}

            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Referer': zoom_url,
                'Range': 'bytes=0-',
                'Connection': 'keep-alive'
            }

            print(f"Downloading video to {output_filename}...")
            response = requests.get(video_url, headers=headers, cookies=cookies_dict)

            if response.status_code in [200, 206]:
                with open(output_filename, 'wb') as f:
                    f.write(response.content)
                print(f"Video downloaded successfully as {output_filename}")
                return True
            else:
                print(f"Download failed. Status code: {response.status_code}")
                return False

        except Exception as e:
            print(f"Error: {str(e)}")
            return False

        finally:
            await browser.close()


def download_zoom_video(zoom_url, output_filename="zoom_recording.mp4"):
    asyncio.run(download_zoom_video_with_playwright(zoom_url, output_filename))


def main():
    parser = argparse.ArgumentParser(description='Download Zoom recordings via command line')
    parser.add_argument('url', type=str, help='Zoom recording URL')
    parser.add_argument('-o', '--output', type=str, default="zoom_recording.mp4",
                        help='Output filename (default: zoom_recording.mp4)')
    parser.add_argument('-v', '--version', action='version', version='Zoom Downloader 1.0')

    args = parser.parse_args()

    success = download_zoom_video(args.url, args.output)

    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
