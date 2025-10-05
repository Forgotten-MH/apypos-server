// Replace with the real function addresses — use symbols or patterns if available
const writeFieldPtr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter10writeFieldEPKcS1_");
const writeField2Ptr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter10writeFieldEPKcl");
const writeField3Ptr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter10writeFieldEPKcm");
const writeField4Ptr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter10writeFieldEPKcd");


const writeBeginFieldPtr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter15writeBeginFieldEPKc");
const writeBeginObjectPtr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter16writeBeginObjectEv");
const writeEndObjectPtr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter14writeEndObjectEv");
const writeBeginArrayPtr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter15writeBeginArrayEv");
const writeEndArrayPtr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter13writeEndArrayEv");
const writeEndFieldPtr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter13writeEndFieldEv");
const writeStringValuePtr = Module.findExportByName("libMHS.so", "_ZN12MtJsonWriter16writeStringValueEPKc");




// Utility to safely read a C string
function safeReadString(ptr) {
    try {
        return ptr.readUtf8String();
    } catch {
        return "<invalid>";
    }
}

// Hook writeField(writer, key, value)
if (writeFieldPtr) {
    Interceptor.attach(writeFieldPtr, {
        onEnter(args) {
            const key = safeReadString(args[1]);
            const value = args[2]; // Usually 64-bit integer or pointer to string
            let output = "";

            // Try to read as string first
            try {
                const valueStr = value.readUtf8String();
                output = `"${key}": "${valueStr}"`;
            } catch {
                // Fallback: print as integer or pointer
                output = `"${key}": ${value}`;
            }

            console.log("[writeField]", output);
        }
    });
}

if (writeField2Ptr) {
    Interceptor.attach(writeField2Ptr, {
        onEnter(args) {
            const key = safeReadString(args[1]);
            const value = args[2]; // Usually 64-bit integer or pointer to string
            let output = "";

            // Try to read as string first
            try {
                const valueStr = value.readUtf8String();
                output = `"${key}": "${valueStr}"`;
            } catch {
                // Fallback: print as integer or pointer
                output = `"${key}": ${value}`;
            }

            console.log("[writeField]", output);
        }
    });
}

if (writeField3Ptr) {
    Interceptor.attach(writeField3Ptr, {
        onEnter(args) {
            const key = safeReadString(args[1]);
            const value = args[2]; // Usually 64-bit integer or pointer to string
            let output = "";

            // Try to read as string first
            try {
                const valueStr = value.readUtf8String();
                output = `"${key}": "${valueStr}"`;
            } catch {
                // Fallback: print as integer or pointer
                output = `"${key}": ${value}`;
            }

            console.log("[writeField]", output);
        }
    });
}

if (writeField4Ptr) {
    Interceptor.attach(writeField4Ptr, {
        onEnter(args) {
            const key = safeReadString(args[1]);
            const value = args[2]; // Usually 64-bit integer or pointer to string
            let output = "";

            // Try to read as string first
            try {
                const valueStr = value.readUtf8String();
                output = `"${key}": "${valueStr}"`;
            } catch {
                // Fallback: print as integer or pointer
                output = `"${key}": ${value}`;
            }

            console.log("[writeField]", output);
        }
    });
}

if (writeStringValuePtr) {
    Interceptor.attach(writeStringValuePtr, {
        onEnter(args) {
            const key = safeReadString(args[1]);
            const value = args[2]; // Usually 64-bit integer or pointer to string
            let output = "";

            // Try to read as string first
            try {
                const valueStr = value.readUtf8String();
                output = `"${key}": "${valueStr}"`;
            } catch {
                // Fallback: print as integer or pointer
                output = `"${key}": ${value}`;
            }

            console.log("[writeStringValue]", output);
        }
    });
}

// Hook writeBeginField(writer, key)
if (writeBeginFieldPtr) {
    Interceptor.attach(writeBeginFieldPtr, {
        onEnter(args) {
            const key = safeReadString(args[1]);
            console.log("[writeBeginField]", `"${key}":`);
        }
    });
}

// Hook writeBeginObject(writer)
if (writeBeginObjectPtr) {
    Interceptor.attach(writeBeginObjectPtr, {
        onEnter() {
            console.log("[writeBeginObject] {");
        }
    });
}

// Hook writeEndObject(writer)
if (writeEndObjectPtr) {
    Interceptor.attach(writeEndObjectPtr, {
        onEnter() {
            console.log("[writeEndObject] }");
        }
    });
}

// Hook writeBeginArray(writer)
if (writeBeginArrayPtr) {
    Interceptor.attach(writeBeginArrayPtr, {
        onEnter() {
            console.log("[writeBeginArray] [");
        }
    });
}

// Hook writeEndArray(writer)
if (writeEndArrayPtr) {
    Interceptor.attach(writeEndArrayPtr, {
        onEnter() {
            console.log("[writeEndArray] ]");
        }
    });
}

// Hook writeEndField(writer)
if (writeEndFieldPtr) {
    Interceptor.attach(writeEndFieldPtr, {
        onEnter() {
            console.log("[writeEndField]");
        }
    });
}
