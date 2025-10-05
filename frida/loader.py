import time
import frida

output_file_path = "./output1.txt"
output_file = open(output_file_path, "w")

def write_to_file(text):
    output_file.write(text + "\n")
    output_file.flush()
print(frida.get_device_manager().enumerate_devices())
device = frida.get_device_manager().enumerate_devices()[3]

pid = device.spawn(["jp.co.capcom.android.explore"])
device.resume(pid)

time.sleep(3) # Without it Java.perform silently fails

# Attach to the process session
# If using emulator like bluestacks use realm="emulated"
session1 = device.attach(pid)

with open("./frida/multiplayer.js") as f:
    script = session1.create_script(f.read())

def on_message(message, data):
    write_to_file(str(message))
    print(message)

script.on('message', on_message)
script.load()
input()
\
output_file.close()
