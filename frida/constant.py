import zlib

# Input data
data = {
"WD_LSWORD002":	4249613118,
"WD_LSWORD003":	2320286632,
"WD_LSWORD004":	338187787 ,
}

# Find the constant
constants = []
for key, value in data.items():
    crc32_value = zlib.crc32(key.encode())  # Compute the CRC32 of the key
    constant = value ^ crc32_value          # Reverse the XOR to find the constant
    constants.append(constant)

# Verify if the constants are consistent
if len(set(constants)) == 1:
    print(f"Constant found: {constants[0]:#010x}")
else:
    print("Inconsistent constants:", constants)