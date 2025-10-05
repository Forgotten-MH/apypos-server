console.log("Script loaded successfully ");
console.log(Process.id)
console.log(Process.arch)
console.log(Process.platform)
console.log(JSON.stringify(Process.mainModule))



var baseAddress = Module.findBaseAddress("libMHS.so");
if (baseAddress) {
    console.log("Base Found");

} else {
    console.log("Base NOT Found");
}

Interceptor.attach(Module.findExportByName("libMHS.so", '_ZN11sMHiSession16addReceiveBufferEhPvm'), {
    onEnter(args) {
        // args[0] = result (session pointer)
        // args[1] = a2 (char)
        // args[2] = a3 (const void*)
        // args[3] = a4 (length)

        const ptr_a3 = args[2];
        const len_a4 = args[3].toInt32(); // or .toUInt32()

        console.log("===> sMHiSession::addReceiveBuffer called");
        console.log("a2:", args[1].toString());
        console.log("a3:", ptr_a3);
        console.log("a4 (length):", len_a4);

        if (ptr_a3.isNull() || len_a4 <= 0 || len_a4 > 0x1000) {
            console.log("Invalid or suspicious buffer length");
            return;
        }

        // Dump hex
        console.log(hexdump(ptr_a3, {
            offset: 0,
            length: len_a4,
            header: true,
            ansi: true
        }));
    }
});