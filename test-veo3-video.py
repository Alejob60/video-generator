import time
import sys
from google import genai
from google.genai import types

# Initialize client with your credentials
client = genai.Client(
    project="orbital-prime-vision",
    location="us-central1",
)

print("🎬 Testing VEO3 Video Generation...")
print("=" * 50)

# Define the source prompt
source = types.GenerateVideosSource(
    prompt="""The camera dollies to show a close up of a desperate man in a green trench coat that's making a call on a rotary-style wall phone with a green neon light and a movie scene.""",
)

# Configure video generation
config = types.GenerateVideosConfig(
    aspect_ratio="16:9",
    number_of_videos=1,  # Start with 1 for testing
    generate_audio=False,
)

try:
    # Generate the video generation request
    print("📡 Sending video generation request...")
    operation = client.models.generate_videos(
        model="veo-3.1-generate-001", 
        source=source, 
        config=config
    )

    # Wait for the video(s) to be generated
    print("⏳ Waiting for video generation...")
    while not operation.done:
        print("   Video has not been generated yet. Check again in 10 seconds...")
        time.sleep(10)
        operation = client.operations.get(operation)

    response = operation.result
    if not response:
        print("❌ Error occurred while generating video.")
        sys.exit(1)

    generated_videos = response.generated_videos
    if not generated_videos:
        print("❌ No videos were generated.")
        sys.exit(1)

    print(f"\n✅ Generated {len(generated_videos)} video(s).")
    
    for i, generated_video in enumerate(generated_videos, 1):
        if generated_video.video:
            print(f"\n🎥 Video {i}:")
            print(f"   Status: Ready")
            # Note: .show() might not work in all environments
            # You can also access the video bytes directly
            # video_bytes = generated_video.video.bytes
            
    print("\n✨ VEO3 test completed successfully!")

except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    sys.exit(1)
