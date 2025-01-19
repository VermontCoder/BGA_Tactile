from PIL import Image
import os

def create_sprite_sheet(input_folder, output_file):
    """
    Combines all images in a folder into a single sprite sheet, ordered numerically by filename.

    Args:
        input_folder (str): Folder containing the input images.
        output_file (str): Path to save the output sprite sheet.

    Returns:
        None
    """
    # Get all image files in the input folder
    image_files = [f for f in os.listdir(input_folder) if f.endswith(".png")]

    # Sort files numerically based on the number in the filename
    image_files.sort(key=lambda x: int(os.path.splitext(os.path.basename(x))[0]))

    print(image_files)
    if not image_files:
        print("No images found in the input folder.")
        return

    print(f"Creating sprite sheet from {len(image_files)} images...")

    # Open all images and get their dimensions
    images = [Image.open(os.path.join(input_folder, img)) for img in image_files]
    widths, heights = zip(*(img.size for img in images))

    # Calculate the dimensions of the sprite sheet
    total_width = sum(widths)
    max_height = max(heights)

    # Create a blank image for the sprite sheet
    sprite_sheet = Image.new("RGBA", (total_width, max_height))

    # Paste each image into the sprite sheet
    x_offset = 0
    for img in images:
        sprite_sheet.paste(img, (x_offset, 0))
        x_offset += img.width
    # Save the sprite sheet
    sprite_sheet.save(output_file)
    print(f"Sprite sheet saved as {output_file}")

# Example usage
input_dir = "png_images_resources_highlighted"  # Replace with your folder containing the images
output_sprite = "resource_tokens_highlighted.png"  # Replace with your desired output file
create_sprite_sheet(input_dir, output_sprite)
