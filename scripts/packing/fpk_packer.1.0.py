# FPK Packer
# For use on MHXR Installed files ./arc_adrd/ ./arc_ios/ ./arc_cmn to transform the unpacked files into a FPK
# By the team

import os
import argparse



# Create the argument parser
parser = argparse.ArgumentParser(description="Creates .fpk files from each folder inside the specified input directory. py .\\fpk_packer.py -i .\\arc_adrd\ -o .\\")

# Add arguments for input and output
parser.add_argument("-i", "--input", required=True, help="Path to the input folder containing subfolders of .arc files")
parser.add_argument("-o", "--output", required=True, help="Path to the output folder where FPK files will be saved")

args = parser.parse_args()

# Specify the input folder path
input_base_path = args.input
# Specify the output folder path
output_base_path = args.output
# Specify the unused FPK spaces (Manual for now...)
unusedFpkSpaces = 0

# Define the bytes for FPK header
fileMagic = bytearray([0x46, 0x50, 0x4B, 0x00])
field_4 = bytearray([0x00, 0x00, 0x00, 0x00])
field_8 = bytearray([0x00, 0x00, 0x00, 0x00])
mCompression = bytearray([0x02, 0x00])  # if mCompression <= 1: [de]compress files in this pack, else, read raw.

fpkHeaderSize = len(fileMagic) + len(field_4) + len(field_8) + len(mCompression) + 2

mFlags = 1
sizeOfFPKTableEntry = 80
max_entries_per_fpk = 100  # Maximum number of entries per FPK file

# Helper function to write the FPK file
def write_fpk_file(output_file_path, entries, file_pointers):
    with open(output_file_path, 'wb') as output_file:
        # Write the FPK header
        output_file.write(fileMagic)
        output_file.write(field_4)
        output_file.write(field_8)
        output_file.write(mCompression)
        
        # Write the number of files this FPK contains
        output_file.write(len(entries).to_bytes(2, "little"))

        # Calculate the total bytes to seek forward for the file data
        bytes_to_write_forward = (len(entries) * sizeOfFPKTableEntry) + fpkHeaderSize + (unusedFpkSpaces * sizeOfFPKTableEntry)
        output_file.seek(bytes_to_write_forward)

        # Write file data and store pointers
        for entry in entries:
            file_path = entry['file_path']
            with open(file_path, 'rb') as source_file:
                file_bytes = source_file.read()
                pointer = output_file.tell()
                file_pointers.append(pointer)
                output_file.write(file_bytes)

        # Go back to write the FPK table entries
        output_file.seek(fpkHeaderSize)
        for i, entry in enumerate(entries):
            output_file.write(entry["mFilePath"])
            output_file.write(bytearray([0xCD, 0xCD, 0xCD, 0xCD]))
            output_file.write(entry["mSize"].to_bytes(4, "little"))
            mSizeAndFlags = (entry["mSize"] & 0x1FFFFFFF) | (mFlags << 29)
            output_file.write(mSizeAndFlags.to_bytes(4, "little", signed=False))
            output_file.write(file_pointers[i].to_bytes(4, "little"))

# Loop through each folder in the input base path
for subfolder in os.listdir(input_base_path):
    subfolder_path = os.path.join(input_base_path, subfolder)

    # Skip files, only process directories
    if not os.path.isdir(subfolder_path):
        continue

    FPKTableEntrys = []
    file_pointers = []
    fpk_file_count = 0  # Start with the first FPK file

    # Collect files and write them into .fpk files
    for root, _, files in os.walk(subfolder_path):
        for filename in files:
            # Get the full path of the file
            file_path = os.path.join(root, filename)
            # Get the size of the file
            mSize = os.path.getsize(file_path)
            # Ensure OS path separator is always Unix type
            parsedPath = file_path.replace("\\", "/")[1:]
            string_bytes = parsedPath.encode('utf-8')
            padding_length = 64 - len(string_bytes)
            if padding_length >= 0:
                padded_bytes = string_bytes + b'\x00' * padding_length
                FPKTableEntrys.append({"mFilePath": padded_bytes, "mSize": mSize, "file_path": file_path})
            else:
                print("Input string is too long to fit within 64 bytes.")

            # Check if we've reached the max entries per FPK file
            if len(FPKTableEntrys) == max_entries_per_fpk:
                output_file_path = os.path.join(output_base_path, f"{subfolder}.{fpk_file_count:02d}.fpk")
                write_fpk_file(output_file_path, FPKTableEntrys, file_pointers)
                print(f'Bytes written to: {output_file_path}')
                print(f'Processed files in the directory: {subfolder_path}')
                FPKTableEntrys = []
                file_pointers = []
                fpk_file_count += 1

    # Write any remaining entries to a new FPK file
    if FPKTableEntrys:
        output_file_path = os.path.join(output_base_path, f"{subfolder}.{fpk_file_count:02d}.fpk")
        write_fpk_file(output_file_path, FPKTableEntrys, file_pointers)
        print(f'Bytes written to: {output_file_path}')
        print(f'Processed files in the directory: {subfolder_path}')