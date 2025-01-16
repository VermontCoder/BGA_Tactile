from PIL import Image
import os

def process_images(input_folder, output_folder):
    """
    Processes images to make black pixels transparent, crop them, and save the results.

    Args:
        input_folder (str): Folder containing input images.
        output_folder (str): Folder to save processed images.

    Returns:
        None
    """
    # Check if the output folder exists, if not, create it
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Get all image files in the input folder
    image_files = [f for f in os.listdir(input_folder) if f.endswith(".png")]
    image_files.sort(key=lambda x: int(os.path.splitext(os.path.basename(x))[0]))

    print(f"Processing {len(image_files)} images from {input_folder}...")

    for idx,image_file in enumerate(image_files):
        input_path = os.path.join(input_folder, image_file)
        output_path = os.path.join(output_folder, str(idx) + ".png")

        # Open the image
        with Image.open(input_path) as img:
            # Convert to RGBA if not already in RGBA mode
            img = img.convert("RGBA")

            # Make black pixels transparent
            data = img.getdata()
            new_data = []
            for item in data:
                # If pixel is black, make it transparent
                if item[:3] == (0, 0, 0):
                    new_data.append((0, 0, 0, 0))  # Transparent pixel
                else:
                    new_data.append(item)
            img.putdata(new_data)

            # Crop the image
            width, height = img.size
            left = 15
            top = 16
            right = width - 16
            bottom = height - 16
            cropped_img = img.crop((left, top, right, bottom))

            # Save the processed image
            cropped_img.save(output_path)
            print(f"Processed and saved: {output_path}")

    print("All images processed!")

# Example usage
input_dir = "png_images"  # Replace with your folder containing the input images
output_dir = "processed_images"  # Replace with your desired output folder
process_images(input_dir, output_dir)
