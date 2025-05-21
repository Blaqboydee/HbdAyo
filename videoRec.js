


let mediaRecorder;
let recordedChunks = [];
let videoBlob = null;

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  const preview = document.getElementById('preview');
  preview.srcObject = stream;
  preview.muted = true;

  recordedChunks = [];

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.start();
}

function stopRecording() {
  if (!mediaRecorder) return;

  mediaRecorder.stop();

  mediaRecorder.onstop = () => {
    // Create a Blob from the recorded data
    videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
    const videoURL = URL.createObjectURL(videoBlob);

    // Preview the recorded video
    const playback = document.getElementById('playback');
    playback.src = videoURL;
    playback.style.display = 'block';

    // Stop camera
    const preview = document.getElementById('preview');
    preview.srcObject.getTracks().forEach(track => track.stop());
    preview.srcObject = null;
  };
}

async function uploadVideo() {
  if (!videoBlob) {
    alert("No video recorded yet!");
    return;
  }

  const formData = new FormData();
  formData.append('file', videoBlob);
  formData.append('upload_preset', 'Birthday_upload'); // your unsigned preset

  try {
    const response = await fetch("https://api.cloudinary.com/v1_1/dgrdyhoxj/video/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Uploaded to Cloudinary:", data.secure_url);
      alert("Upload successful!");
    } else {
      console.error("Upload error:", data);
      alert("Upload failed!");
    }
  } catch (err) {
    console.error("Error uploading:", err);
    alert("An error occurred during upload.");
  }
}
