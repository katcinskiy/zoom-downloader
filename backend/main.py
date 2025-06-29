import logging
import os
import sys
import tempfile
import traceback
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import storage
from pydantic import BaseModel, HttpUrl

sys.path.append('..')
from zoom_downloader import download_zoom_video_with_playwright

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class DownloadRequest(BaseModel):
    url: HttpUrl

try:
    storage_client = storage.Client()
    bucket_name = f"{os.environ.get('PROJECT_ID', 'video-pull-455410')}-temp-files"
    try:
        bucket = storage_client.bucket(bucket_name)
        bucket.reload()
        if bucket.iam_configuration.uniform_bucket_level_access_enabled:
            policy = bucket.get_iam_policy(requested_policy_version=3)
            policy.bindings.append({"role": "roles/storage.objectViewer", "members": {"allUsers"}})
            bucket.set_iam_policy(policy)
    except Exception:
        bucket_name = f"{bucket_name}-v2"
        bucket = storage_client.create_bucket(bucket_name, location='US')
        bucket.iam_configuration.uniform_bucket_level_access_enabled = False
        bucket.patch()
except Exception as e:
    logger.error(f"Cloud Storage failed: {e}")
    bucket = None

@app.post("/process")
async def process_video(request: DownloadRequest):
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
        temp_path = temp_file.name
    
    try:
        success = await download_zoom_video_with_playwright(str(request.url), temp_path)
        if not success:
            os.unlink(temp_path)
            raise HTTPException(status_code=400, detail="Failed to process video")
        
        file_size = os.path.getsize(temp_path)
        blob_name = f"temp/{uuid.uuid4()}.mp4"
        blob = bucket.blob(blob_name)
        
        blob.upload_from_filename(temp_path, content_type='video/mp4')
        blob.content_disposition = 'attachment; filename="zoom_recording.mp4"'
        blob.patch()
        
        try:
            if not bucket.iam_configuration.uniform_bucket_level_access_enabled:
                blob.make_public()
        except Exception:
            pass
        
        os.unlink(temp_path)
        return {"download_url": blob.public_url, "file_size": file_size}
    except Exception as e:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
        raise HTTPException(status_code=500, detail=traceback.format_exc())

@app.get("/health")
async def health_check():
    return {"status": "healthy"}