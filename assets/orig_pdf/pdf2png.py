import fitz  # PyMuPDF
import os

def pdf_to_png(pdf_path, output_folder):
    """
    Converts each page of a PDF to a PNG image.

    Args:
        pdf_path (str): Path to the input PDF file.
        output_folder (str): Folder to save the output PNG files.

    Returns:
        None
    """
    # Check if the output folder exists, if not, create it
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Open the PDF file
    pdf_document = fitz.open(pdf_path)
    total_pages = pdf_document.page_count
    print(f"Converting {total_pages} pages from {pdf_path} to PNG images...")

    # Loop through each page and save as PNG
    for page_num in range(total_pages):
        page = pdf_document[page_num]
        pix = page.get_pixmap()
        output_file = os.path.join(output_folder, f"{page_num}.png")
        pix.save(output_file)
        print(f"Saved page {page_num + 1} as {output_file}")

    # Close the PDF file
    pdf_document.close()
    print("Conversion completed!")

# Example usage
pdf_file = "orig_pdf//Card Deck_top.pdf"  # Replace with the path to your PDF file
output_dir = "output_images"  # Replace with your desired output folder
pdf_to_png(pdf_file, output_dir)
