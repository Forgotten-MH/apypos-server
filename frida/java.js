console.log("Script loaded successfully ");
console.log(Process.id);
console.log(Process.arch);
console.log(Process.platform);
console.log(JSON.stringify(Process.mainModule));

var baseAddress = Module.findBaseAddress("libMHS.so");
if (baseAddress) {
  console.log("Base Found");
} else {
  console.log("Base NOT Found");
}

// //     let addr = Module.findExportByName("libMHS.so", "_ZN6native6socket15onReceiveSocketEP7_JNIEnvP8_jobjectiP11_jbyteArrayi");
// // console.log("Address:", addr);
// // if (addr) {
// //     Interceptor.attach(addr, {
// //         onEnter: function (args) {
// //             const env = args[0];
// //             const jbyteArray = args[3];
// //             const length = args[4].toInt32();

// //             try {
// //               const jniEnv = Java.vm.getEnv(); // Now safe to access
// //               const bytes = jniEnv.getByteArrayElements(jbyteArray, null);
// //               const buffer = Memory.readByteArray(bytes, length);
// //               console.log("Socket Data:", buffer);
// //               jniEnv.releaseByteArrayElements(jbyteArray, bytes, 0);
// //             } catch (err) {
// //               console.error("Failed to access jbyteArray:", err);
// //             }
// //           }
// //     });
// // }

// // Interceptor.attach(Module.findExportByName("libMHS.so", '_ZN18sMHiSessionManager14_acceptRequestEv'), {
// //     onEnter: function (args) {
// //         send("📡 _ZN18sMHiSessionManager14_acceptRequestEv called");

// //         Stalker.follow({
// //             pid: Process.getCurrentThreadId(),
// //             events: {
// //                 call: true,
// //                 ret: true,
// //                 exec: false,
// //                 block: false,
// //                 compile: false
// //             },
// //             onCallSummary: function (summary) {
// //                 for (let target in summary) {
// //                     let count = summary[target];
// //                     let symbol = DebugSymbol.fromAddress(ptr(target));
// //                     send(`PHONE ${symbol.name} (${symbol.moduleName}) - called ${count} times`);
// //                 }
// //             }
// //         });
// //     },
// //     onLeave: function (retval) {
// //         send("TICK _ZN11sMHiSession16addReceiveBufferEhPvm returned");

// //         // Stop tracing
// //         Stalker.unfollow();
// //         Stalker.garbageCollect();
// //     }
// // });

//UNCOMMMENT

// Interceptor.attach(Module.findExportByName("libMHS.so", '_ZN18sMHiSessionManager8_offlineEv'), {
//         onEnter: function(args) {
//           // `args[0]` is the `param_1` argument passed to the function
//           var param_1 = args[0];

//           // Read the relevant variables using the memory offsets
//           var state = Memory.readU32(param_1.add(0x128)); // state at offset 0x128
//           var flag_uVar2 = Memory.readU32(param_1.add(300)); // flag at offset 300
//           var flag_uVar3 = Memory.readU32(param_1.add(0x130)); // flags at offset 0x130
//           var searchKey = Memory.readU32(param_1.add(0x134)); // search key at offset 0x134
//           var sessionPointer = Memory.readU32(param_1.add(0x138)); // session pointer at offset 0x138
//           var sessionData = Memory.readU64(param_1.add(0x144)); // session data at offset 0x144

//           // Log the read values to the console for inspection
//           console.log('State at 0x128: ' + state);
//           console.log('Flags at 0x12C: ' + flag_uVar2.toString(16));6
//           console.log('Flags at 0x130: ' + flag_uVar3.toString(16));
//           console.log('Search Key at 0x134: ' + searchKey);
//           console.log('Session Pointer at 0x138: ' + sessionPointer);
//           console.log('Session Data at 0x144: ' + sessionData.toString(16));
//         },

//         onLeave: function(retval) {
//           // You can modify the return value if needed, for now we just pass it
//         }
//       });

// // Interceptor.attach(Module.findExportByName("libMHS.so", '_ZN6native6socket18setReceiveCallbackEPvPFvS1_hS1_mE'), {
// //     onEnter(args) {
// //         const result = args[0]; // X0
// //         const a2 = args[1];     // X1

// //         console.log("native::socket::setReceiveCallback called");
// //         console.log("result (mReceiveListener) =", result);
// //         console.log("a2 (qword_357AE80) =", a2);
// //       }
// // });

// Interceptor.attach(Module.findExportByName("libMHS.so", '_ZN6native6socket15onReceiveSocketEP7_JNIEnvP8_jobjectiP11_jbyteArrayi'), {
//     onEnter(args) {
//         const a2 = args[1];
//         const a3 = args[2].toInt32(); // unsigned int
//         const a4 = args[3];
//         const a5 = args[4].toInt32(); // int
//         const v8 = args[0]; // native::socket*
//         console.log("v8 (this):", v8);
//         console.log("a2:", a2);
//         console.log("a3 (size):", a3);
//         console.log("a4 (buffer):", a4);
//         console.log("a5 length:", a5);

//         try {
//             console.log("a2 memory dump:");
//             console.log(hexdump(a2, {
//                 length: Math.min(a3, 128),
//                 header: true,
//                 ansi: true
//             }));
//         } catch (e) {
//             console.error("Failed to read a4 memory:", e);
//         }
//         try {
//             console.log("v8 memory dump:");
//             console.log(hexdump(v8, {
//                 length: 128, // dump first 128 bytes of the object
//                 header: true,
//                 ansi: true
//             }));
//         } catch (e) {
//             console.error("Failed to dump v8:", e);
//         }
//     }
// });

// Java.perform(function () {
//     const targetClass  = "jp.co.capcom.android.explore.MTFPSocket";
//     const clazz = Java.use(targetClass);

//     const methods = clazz.class.getDeclaredMethods();
//     console.log(`[*] Methods in ${targetClass}:`);

//     methods.forEach(function (method) {
//         console.log("    " + method.toString());
//     });
// });

// Java.perform(function () {
//     const className = "jp.co.capcom.android.explore.MTFPSocket";
//     const MTFPSocket = Java.use(className);

//     MTFPSocket.registerEvent.overload('java.lang.String', 'byte').implementation = function (eventName, byteVal) {
//         console.log(`[*] registerEvent called`);
//         console.log(`    eventName: ${eventName}`);
//         console.log(`    byte: ${byteVal}`);

//         // Call the original method
//         return this.registerEvent(eventName, byteVal);
//     };

//     console.log("[*] Hooked registerEvent");
// });
// Java.perform(function () {
//     const className = "jp.co.capcom.android.explore.MTFPSocket";
//     const MTFPSocket = Java.use(className);

//     MTFPSocket.connect.overload('java.lang.String').implementation = function (url) {
//         console.log(`[*] MTFPSocket.connect called`);
//         console.log(`    URL: ${url}`);

//         const result = this.connect(url);
//         console.log(`    => returned: ${result}`);
//         return result;
//     };

//     console.log("[*] Hooked MTFPSocket.connect(String)");
// });
// Java.perform(function () {
//     var MTFPSocket = Java.use("jp.co.capcom.android.explore.MTFPSocket");

//     MTFPSocket.isConnecting.implementation = function () {
//         var result = this.isConnecting();
//         console.log("MTFPSocket.isConnecting() called, returned: " + result);
//         return result;
//     };
// });
Java.perform(function () {
  const className = "jp.co.capcom.android.explore.MTFPSocket";
  const MTFPSocket = Java.use(className);

  MTFPSocket.emit.overload("java.lang.String", "[B").implementation = function (
    eventName,
    byteArray
  ) {
    console.log(`[*] MTFPSocket.emit called`);
    console.log(`    eventName: ${eventName}`);

    // Convert the byte array to hex for inspection
    const bytes = Java.array("byte", byteArray);
    let hex = [];
    for (let i = 0; i < bytes.length; i++) {
      hex.push(("0" + (bytes[i] & 0xff).toString(16)).slice(-2));
    }
    console.log(`    data (hex): ${hex.join(" ")}`);

    const result = this.emit(eventName, byteArray);
    console.log(`    => returned: ${result}`);
    return result;
  };

  console.log("[*] Hooked MTFPSocket.emit(String, byte[])");
});

// Java.perform(function () {
//     const className = "jp.co.capcom.android.explore.MTFPSocket";
//     const MTFPSocket = Java.use(className);

//     MTFPSocket.onReceive.overload('int', '[B', 'int').implementation = function (i, bArr, i2) {
//         console.log("[*] MTFPSocket.onReceive called");
//         console.log(`    int arg (i): ${i}`);

//         // Convert byte array to readable format
//         const byteArray = Array.from(bArr);
//         console.log(`    byte[] data: [${byteArray.join(", ")}]`);

//         console.log(`    int arg2 (i2): ${i2}`);

//         const result = this.onReceive(i, bArr, i2);
//         console.log("[*] MTFPSocket.onReceive completed");

//         return result;
//     };

//     console.log("[*] Hooked MTFPSocket.onReceive(int, byte[], int)");
// });
// Java.perform(function () {
//     const MtBuildMode = Java.use('jp.co.capcom.android.explore.MtBuildMode');

//     // Hook setBuildDevelop and set it to true
//     MtBuildMode.setBuildDevelop.overload('boolean').implementation = function (z) {
//         console.log(`[*] setBuildDevelop called with: ${z}`);
//         this.setBuildDevelop(true);  // Always set to true
//     };

//     // Hook setBuildMaster and set it to true
//     MtBuildMode.setBuildMaster.overload('boolean').implementation = function (z) {
//         console.log(`[*] setBuildMaster called with: ${z}`);
//         this.setBuildMaster(true);  // Always set to true
//     };

//     // Hook setBuildProduction and set it to true
//     MtBuildMode.setBuildProduction.overload('boolean').implementation = function (z) {
//         console.log(`[*] setBuildProduction called with: ${z}`);
//         this.setBuildProduction(true);  // Always set to true
//     };

//     console.log("[*] Hooked MtBuildMode setBuild methods to always set to true");
// });

// Java.perform(function () {
//     const Log = Java.use('android.util.Log');

//     // Hooking Log.d (Debug logs)
//     Log.d.overload('java.lang.String', 'java.lang.String').implementation = function (tag, msg) {
//         console.log(`[DEBUG] ${tag}: ${msg}`);
//         return this.d(tag, msg);  // Call the original method
//     };

//     // Hooking Log.i (Info logs)
//     Log.i.overload('java.lang.String', 'java.lang.String').implementation = function (tag, msg) {
//         console.log(`[INFO] ${tag}: ${msg}`);
//         return this.i(tag, msg);  // Call the original method
//     };

//     // Hooking Log.e (Error logs)
//     Log.e.overload('java.lang.String', 'java.lang.String').implementation = function (tag, msg) {
//         console.log(`[ERROR] ${tag}: ${msg}`);
//         return this.e(tag, msg);  // Call the original method
//     };

//     // Hooking Log.w (Warning logs)
//     Log.w.overload('java.lang.String', 'java.lang.String').implementation = function (tag, msg) {
//         console.log(`[WARNING] ${tag}: ${msg}`);
//         return this.w(tag, msg);  // Call the original method
//     };

//     // Optionally, you can also hook Log.v (Verbose logs)
//     Log.v.overload('java.lang.String', 'java.lang.String').implementation = function (tag, msg) {
//         console.log(`[VERBOSE] ${tag}: ${msg}`);
//         return this.v(tag, msg);  // Call the original method
//     };

//     console.log("[*] Hooked android.util.Log methods");
// });
// Interceptor.attach(Module.findExportByName("libMHS.so", "_ZN6native6socket18setReceiveCallbackEPvPFvS1_hS1_mE"), {
//     onEnter: function (args) {
//         console.log("[*] setReceiveCallback called");
//         console.log("    mReceiveListener (result): " + args[0]);
//         console.log("    qword_357AE80 (a2): " + args[1]);
//     },
//     onLeave: function (retval) {
//         console.log("    => returned: " + retval);
//     }
// });

// Interceptor.attach(Module.findExportByName("libMHS.so", "_ZN8nNetwork7Session11addListenerEPNS_15SessionListenerE"), {
//     onEnter: function(args) {
//         console.log("onSessionEvent called!");

//         // // Access the arguments if needed
//         // var header = args[0]; // NET_MESSAGE_HEADER*
//         // var data = args[1];   // void*

//         // console.log("Header: " + header);
//         // console.log("Data: " + data);

//         // // You can modify arguments here if needed
//     },
//     onLeave: function(retval) {
//         console.log("onSessionEvent returned!");
//         // You can modify the return value if needed
//     }
// });

//UNCOMMMENT

let lastPhase = null;
Interceptor.attach(
  Module.findExportByName("libMHS.so", "_ZNK18sMHiSessionManager8getPhaseEv"),
  {
    onEnter(args) {
      this.self = args[0]; // 'this' pointer
      var phasePtr = this.self.add(0x128);
      var phase = Memory.readU32(phasePtr);
      if (phase != lastPhase) {
        console.log(
          "[getPhase] this:",
          this.self,
          " phase (from memory):",
          phase
        );
                lastPhase = phase;

      }

      // if (phase === 5) {
      //     console.log("WRITING 6 TO MEMORY AT OFFSET 0x128");
      //     Memory.writeU32(phasePtr, 6); // Replace value in memory
      // }
      // if (phase === 6) {
      //     console.log("WRITING 5 TO MEMORY AT OFFSET 0x128");
      //     Memory.writeU32(phasePtr, 5); // Replace value in memory
      // }
    },
    onLeave(retval) {
      // Log the 'this' pointer and the value at offset 0x128
    },
  }
);

// Interceptor.attach(Module.findExportByName("libMHS.so", '_ZN11sMHiSession14onConnectEventEPvb'), {
//         onEnter(args) {
//             this.sessionPtr = args[0];
//             this.flag = args[1].toInt32() & 1;

//             console.log("===> onConnectEvent called");
//             console.log("a1 (this): " + this.sessionPtr);
//             console.log("a2 (flag): " + this.flag);

//             // Read session ID at offset 19664
//             const sessionIdOffset = 19664;
//             try {
//                 const sessionId = Memory.readU32(this.sessionPtr.add(sessionIdOffset));
//                 console.log("Session ID: " + sessionId);

//                 // Optional: dump around session ID to understand structure
//                 console.log("Dump near session ID:");
//                 console.log(hexdump(this.sessionPtr.add(sessionIdOffset - 16), {
//                     length: 64,
//                     header: true,
//                     ansi: true
//                 }));
//             } catch (e) {
//                 console.log("Failed to read session ID: " + e);
//             }

//             // Store base for later use
//             this.mtMapEx = this.sessionPtr.add(0x4B8); // offset of MtMapEx
//         },
//         onLeave(retval) {
//             console.log("<=== onConnectEvent returned: " + retval);

//             try {
//                 const result = retval; // _QWORD* return value from eraseEx or earlier call
//                 if (!result.isNull()) {
//                     console.log("Inspecting result object...");

//                     // Dump first 32 bytes (vtable, pointers, etc.)
//                     console.log("Result object memory:");
//                     console.log(hexdump(result, {
//                         length: 64,
//                         header: true,
//                         ansi: true
//                     }));

//                     // Optionally read values directly
//                     const v14 = Memory.readPointer(result.add(16)); // result[2]
//                     const v15 = Memory.readU64(result.add(24));     // result[3]
//                     const v16 = Memory.readU64(result.add(32));     // result[4]

//                     console.log("v14 (result[2]): " + v14);
//                     console.log("v15 (result[3]): 0x" + v15.toString(16));
//                     console.log("v16 (result[4]): 0x" + v16.toString(16));

//                     if (!v14.isNull()) {
//                         console.log("Dumping callback container (v14)...");
//                         console.log(hexdump(v14, {
//                             length: 64,
//                             header: true,
//                             ansi: true
//                         }));
//                     }
//                 } else {
//                     console.log("No result object returned — likely map miss.");
//                 }
//             } catch (e) {
//                 console.log("Error while inspecting result: " + e);
//             }
//         }
//     });
// Interceptor.attach(
//   Module.findExportByName(
//     "libMHS.so",
//     "_ZN11sMHiSession16addReceiveBufferEhPvm"
//   ),
//   {
//     onEnter(args) {
//       // args[0] = result (session pointer)
//       // args[1] = a2 (char)
//       // args[2] = a3 (const void*)
//       // args[3] = a4 (length)

//       const ptr_a3 = args[2];
//       const len_a4 = args[3].toInt32(); // or .toUInt32()

//       console.log("===> sMHiSession::addReceiveBuffer called");
//       console.log("a2:", args[1].toString());
//       console.log("a3:", ptr_a3);
//       console.log("a4 (length):", len_a4);

//       if (ptr_a3.isNull() || len_a4 <= 0 || len_a4 > 0x1000) {
//         console.log("Invalid or suspicious buffer length");
//         return;
//       }

//       // Dump hex
//       console.log(
//         hexdump(ptr_a3, {
//           offset: 0,
//           length: len_a4,
//           header: true,
//           ansi: true,
//         })
//       );
//     },
//   }
// );
// Interceptor.attach(Module.findExportByName("libMHS.so", '_ZN11sMHiSession16addReceiveBufferEhPvm'), {
//     onEnter(args) {
//         // args[0] = result (session pointer)
//         // args[1] = a2 (char)
//         // args[2] = a3 (const void*)
//         // args[3] = a4 (length)

//         const ptr_a3 = args[2];
//         const len_a4 = args[3].toInt32(); // or .toUInt32()

//         console.log("===> sMHiSession::addReceiveBuffer called");
//         console.log("a2:", args[1].toString());
//         console.log("a3:", ptr_a3);
//         console.log("a4 (length):", len_a4);

//         if (ptr_a3.isNull() || len_a4 <= 0 || len_a4 > 0x1000) {
//             console.log("Invalid or suspicious buffer length");
//             return;
//         }

//         // Dump hex
//         console.log(hexdump(ptr_a3, {
//             offset: 0,
//             length: len_a4,
//             header: true,
//             ansi: true
//         }));
//     }
// });

//UNCOMMMENT

//     Interceptor.attach(Module.findExportByName("libMHS.so", "_ZN11sMHiSession10sendBufferEPKvmhPNS_12PersonalTaskEj"), {
//             onEnter(args) {
//                 this.sp = this.context.sp;

//                 // Capture and log arguments
//                 const a1 = args[0];  // __int64 a1
//                 const a2 = args[1];  // const void *a2 (pointer to the buffer)
//                 const a3 = args[2].toInt32(); // size_t a3 (size of the buffer)
//                 const a4 = args[3].toInt32(); // char a4
//                 const a5 = args[4];  // __int64 a5
//                 const a6 = args[5].toInt32(); // int a6

//                 console.log("Function called: sMHiSession::sendBuffer");
//                 console.log("a1 (this):", a1);
//                 console.log("a2 (buffer):", a2);
//                 console.log("a3 (size):", a3);
//                 console.log("a4 (char):", a4);
//                 console.log("a5:", a5);
//                 console.log("a6:", a6);

//                 // Capture the memory of the buffer (a2), if it's not NULL
//                 if (a2.isNull() === false) {
//                     const bufferData = Memory.readByteArray(a2, a3); // Read 'a3' bytes from 'a2'
//                     console.log("Buffer data (first 64 bytes):", hexdump(bufferData, { length: 64 }));
//                 }

//                 // Capture specific values from the stack if necessary
//                 const v12 = this.sp.add(0x28).readU64();
//                 console.log("v12:", v12);

//                 const v13 = this.sp.add(0x30).readU64();
//                 console.log("v13:", v13);

//                 const v16 = this.context.w26.toInt32(); // Capture v16 (w26)
//                 console.log("v16:", v16);

//                 // Optionally, log other values that you need
//             },

//             onLeave(retval) {
//                 // Capture the return value
//                 const returnValue = retval.toInt32();
//                 console.log("Function returned:", returnValue);

//                 // Modify return value if necessary (e.g., if you want to modify behavior)
//                 // retval.replace(0);  // Example: Replace return value with 0
//             }
//         });

//         Interceptor.attach(Module.findExportByName("libMHS.so", "_ZN18sMHiSessionManager10sendOthersEPKvjjb"), {
//             onEnter(args) {
//                 this.thisPtr = args[0];        // sMHiSessionManager* this
//                 const a2 = args[1];            // const void* (buffer)
//                 const a3 = args[2].toInt32();  // int (size)
//                 const a4 = args[3].toInt32();  // char
//                 const a5 = args[4].toInt32();  // char

//                 console.log("[*] sMHiSessionManager::sendOthers called");
//                 console.log("this:", this.thisPtr);
//                 console.log("a3 (size):", a3);
//                 console.log("a4:", a4);
//                 console.log("a5:", a5);

//                 if (!a2.isNull() && a3 > 0) {
//                     const data = Memory.readByteArray(a2, a3);
//                     console.log("Buffer (first 64 bytes):", hexdump(data, { length: 64 }));
//                 }

//                 // Compute v5 based on (a5 & 1)
//                 const v5 = (a5 & 1) !== 0 ? 0x10 : 4;
//                 console.log("Computed v5:", v5);
//                 console.log("Final a4 + 5 =", a4 + 5);
//             },

//             onLeave(retval) {
//                 console.log("Returned:", retval);
//             }
//         });

//UNCOMMMENT

// Interceptor.attach(Module.findExportByName("libMHS.so", "_ZN18sMHiSessionManager14_acceptRequestEv"), {
//     onEnter(args) {
//         this.result = args[0]; // sMHiSessionManager *result
//     },
//     onLeave(retval) {
//         const mpInstanceAddr = Module.findExportByName(null, "sMHiSession::mpInstance");

//         if (mpInstanceAddr) {
//             const mpInstance = ptr(mpInstanceAddr).readPointer();
//             const mpSession = mpInstance.add(0x40).readPointer(); // QWORD read at offset 0x40

//             console.log("mpSession =", mpSession);

//             const sessionStateAddr = mpSession.add(0x90); // address of sessionState
//             const sessionState = sessionStateAddr.readU32();
//             console.log("mpSession state =", sessionState);

//             // // Write new state
//             // sessionStateAddr.writeU32(2);
//             // console.log("mpSession state changed to 2");
//         } else {
//             // console.log("sMHiSession::mpInstance not found.");
//         }
//     }
// });

//           Interceptor.attach(Module.findExportByName("libMHS.so", "_ZN18sMHiSessionManager15setDataListenerEhP8MtObjectMS0_FviPKvmE"), {
//             onEnter(args) {
//                 console.log("[*] sMHiSessionManager::setDataListener called");

//                 this.a1 = args[0];
//                 this.a2 = args[1].toInt32(); // unsigned __int8
//                 this.a3 = args[2];
//                 this.a4 = args[3]; // function pointer
//                 this.a5 = args[4];

//                 console.log("a1 =", this.a1);
//                 console.log("a2 =", this.a2);
//                 console.log("a3 =", this.a3);
//                 console.log("a4 =", this.a4);  // likely function ptr
//                 console.log("a5 =", this.a5);

//                 // Optionally hook a4 if it's a callable address
//                 try {
//                     const fnPtr = this.a4;
//                     const mod = Process.findModuleByAddress(fnPtr);
//                     console.log(`[*] Attempting to hook callback at ${fnPtr} (${mod ? mod.name : "??"})`);

//                     Interceptor.attach(fnPtr, {
//                         onEnter(args) {
//                             console.log("[+] Callback (a4) invoked!");
//                             console.log("  arg0 =", args[0].toInt32());
//                             console.log("  arg1 =", args[1]);
//                             console.log("  arg2 =", args[2].toInt32());
//                         },
//                         onLeave(retval) {
//                             console.log("[+] Callback returned:", retval);
//                         }
//                     });
//                 } catch (e) {
//                     console.log("[!] Failed to hook a4:", e.message);
//                 }
//             },

//             onLeave(retval) {
//                 console.log("[*] sMHiSessionManager::setDataListener returned:", retval);
//             }
//         });

//         Interceptor.attach(Module.findExportByName("libMHS.so", "_ZN15sLobbyProcedure13onReceiveInfoEiPKvm"), {
//             onEnter(args) {
//     // ARM64 calling convention:
//     // x0 = param1 (sMatchingWorkspace*)
//     // x1 = param2 (uint32_t)
//     // x2 = param3 (pointer to data structure)

//     const param1 = args[0];
//     const param2 = args[1].toInt32();
//     const param3 = args[2];

//     console.log('[+] onReceiveInfo called');
//     console.log('    param1 (sMatchingWorkspace*):', param1);
//     console.log('    param2 (uint32_t):', param2);
//     console.log('    param3:', param3);

//     // Optionally read message type byte (param3 + 1)
//     const messageType = Memory.readU8(param3.add(1));
//     console.log('    messageType:', messageType);

//     // If it's case 5, dump the string at param3 + 8
//     if (messageType === 5) {
//       const strPtr = param3.add(8);
//       const strVal = Memory.readCString(strPtr);
//       console.log('    case 5 string:', strVal);
//     }
//   },

//   onLeave(retval) {
//     console.log('[+] onReceiveInfo returned');
//     // You can modify retval if necessary (not needed here since it's void)
//   }
// });

// Interceptor.attach(
//     Module.findExportByName(
//       "libMHS.so",
//       "_ZN15sLobbyProcedure15onReceiveNoticeEiPKvm"
//     ),
//     {
//       onEnter(args) {
//         this.param2 = args[1].toInt32();
//         this.param3_ptr = args[2];
//         this.param3_val = Memory.readU32(this.param3_ptr);
//         this.param4 = args[3];
//         this.param5 = args[4];
//         this.param5_val = Memory.readU32(this.param5);

//         this.param6 = args[5];
//         this.param6_val = Memory.readU32(this.param6);

//         this.param7 = args[6];
//         this.param8 = args[7];
//         this.param8_val = Memory.readU32(this.param8);

//         console.log("\n--- onReceiveNotice called ---");
//         console.log("param_2 (int): " + this.param2);
//         console.log(
//           "param_3 (uint*): 0x" +
//             this.param3_ptr.toString(16) +
//             " -> " +
//             this.param3_val
//         );
//         console.log("param_4 (ulong): " + this.param4);
//         console.log(
//             "param_5 (ptr): 0x" +
//               this.param5.toString(16) +
//               " -> " +
//               this.param5_val
//           );
//         console.log(
//             "param_6 (ptr): 0x" +
//               this.param6.toString(16) +
//               " -> " +
//               this.param6_val
//           );
//         console.log("param_7 (int/ptr): " + this.param7);
//         console.log(
//             "param_8 (ptr): 0x" +
//               this.param8.toString(16) +
//               " -> " +
//               this.param8_val
//           );

//         const tryReadUtf8 = (label, ptr) => {
//           if (ptr.isNull()) {
//             console.log(`${label}: NULL`);
//             return;
//           }
//           try {
//             const str = Memory.readUtf8String(ptr);
//             console.log(`${label} (string): "${str}"`);
//           } catch (e) {
//             console.log(`${label} (raw): 0x${ptr.toString(16)} (not a string?)`);
//           }
//         };

//         tryReadUtf8("param_5", this.param5);
//         tryReadUtf8("param_6", this.param6);
//         tryReadUtf8("param_8", this.param8);

//         // param_7 might be an integer or pointer. Try both:
//         try {
//           const val = this.param7.toInt32();
//           console.log("param_7 (int):", val);
//         } catch (e) {
//           tryReadUtf8("param_7", this.param7);
//         }

//         console.log(hexdump(this.param3_ptr, { length: 16 }));

//         console.log(hexdump(this.param8, { length: 64 }));

//       },

//       onLeave: function (retval) {
//         console.log("onReceiveNotice returned\n");
//       },
//     }
//   );

//   Interceptor.attach(Module.findExportByName("libMHS.so", "_ZN15sLobbyProcedure13onReceiveChatEiPKvm"), {
//     onEnter(args) {
//         const param_1 = args[0];

//         // Modify the size directly in memory (set it to 0x11)
//         // args[1] = ptr(0x5);
//         const size = args[1].toInt32();
//         const data = args[2];

//         console.log(">> onReceiveChat called");
//         console.log("param_1:", param_1);
//         console.log("size:", size);
//         console.log("data ptr:", data);

//         // Pointer to chat string (at offset 0x36)
//         const chatPtr = data.add(0x36);
//         const originalMessage = chatPtr.readCString();
//         console.log("Original Chat message:", originalMessage);

//         // Replace chat message in memory
//         const newMessage = "gotcha!";
//         chatPtr.writeUtf8String(newMessage);

//         const updatedMessage = chatPtr.readCString();
//         console.log("Modified Chat message:", updatedMessage);

//         // Optional: Dump raw metadata after message (up to 12 bytes)
//         const metaStart = chatPtr.add(newMessage.length + 1);
//         console.log("Raw metadata:");
//         console.log(hexdump(metaStart, { length: 12 }));

//         // Dump surrounding memory
//         console.log("Raw data around chat:");
//         console.log(hexdump(data, { length: 96 }));
//       },

//       onLeave(retval) {
//         console.log("<< onReceiveChat returned");
//       }
//     });

//     Interceptor.attach(Module.findExportByName('libMHS.so', '_ZN18sMatchingWorkspace11addChatDataE8MtStringjj'), {
//         onEnter: function(args) {
//             // Log when addChatData is entered
//             console.log("addChatData called");

//             // Log arguments passed to addChatData
//             console.log("Argument 1 (this): " + args[0].toString());
//             console.log("Argument 2: " + args[1].toString());
//             console.log("Argument 3: " + args[2].toString());
//             console.log("Argument 4: " + args[3].toString());
//             console.log("Argument 5: " + args[4].toString());

//             // You can add more argument logging if necessary
//         },
//         onLeave: function(retval) {
//             // Log when addChatData returns
//             console.log("addChatData returned");

//             // Optionally log the return value if needed
//             console.log("Return value: " + retval.toString());
//         }
//     });
let lastState = null;

Interceptor.attach(
  Module.findExportByName(
    "libMHS.so",
    "_ZN18sMatchingWorkspace12moveMatchingEv"
  ),
  {
    onEnter(args) {
      const workspacePtr = args[0];
      const stateOffset = 0x72c;

      const currentState = Memory.readU32(workspacePtr.add(stateOffset));
      if (currentState !== lastState) {
        console.log("[*] Current state changed:", currentState);
        lastState = currentState;
      }

      // if (currentState === 0x0c) {
      //   const newState = 0x0d; // or whatever state you want to switch to
      //   console.log("[*] Changing state from 0x0c to:", newState);
      //   Memory.writeU32(workspacePtr.add(stateOffset), newState);
      // }
      //   if (currentState === 0x0d) {
      //     const newState = 0x0E; // or whatever state you want to switch to
      //     console.log("[*] Changing state from 0x0c to:", newState);
      //     Memory.writeU32(workspacePtr.add(stateOffset), newState);
      // }

      // if (currentState === 0x0c) {
      //     const newState = 0x0d; // or whatever state you want to switch to
      //     console.log("[*] Changing state from 0x0c to:", newState);
      //     Memory.writeU32(workspacePtr.add(stateOffset), newState);
      // }
      // if (currentState === 0x0d) {
      //     const newState = 0x1c; // or whatever state you want to switch to
      //     console.log("[*] Changing state from 0x0c to:", newState);
      //     Memory.writeU32(workspacePtr.add(stateOffset), newState);
      // }
      // if (currentState === 0x0e) {
      //     const newState = 0x18; // or whatever state you want to switch to
      //     console.log("[*] Changing state from 0x0c to:", newState);
      //     Memory.writeU32(workspacePtr.add(stateOffset), newState);
      // }
    },

    onLeave(retval) {
        // // Access the return value
        // var returnValue = retval;
        // console.log("move Matching Return value: " + returnValue);

    },
  }
);

//   Interceptor.attach(
//     Module.findExportByName(
//       "libMHS.so",
//       "_ZNK18sMHiSessionManager12getSelfIndexEv"
//     ),
//     {
//       onLeave(retval) {
//         // .toInt32() if it’s returning an unsigned int
//         console.log("getSelfIndex returned:", retval.toUInt32());
//       },
//     }
//   );
//   Interceptor.attach(
//     Module.findExportByName(
//       "libMHS.so",
//       "_ZNK18sMHiSessionManager12getHostIndexEv"
//     ),
//     {
//       onLeave(retval) {
//         // .toInt32() if it’s returning an unsigned int
//         console.log("getHostIndex returned:", retval.toUInt32());
//       },
//     }
//   );
// Interceptor.attach(Module.findExportByName('libMHS.so', '_ZN15sLobbyProcedure13onReceiveInfoEiPKvm'), {
//     onEnter: function (args) {
//         console.log('sLobbyProcedure::onReceiveInfo called');
//         console.log('param_1:', args[0]);
//         console.log('param_2:', args[1].toUInt32());
//         console.log('param_3:', args[2]);

//         const msgType = Memory.readU8(args[2].add(1));
//         console.log('Message type (param_3 + 1):', msgType);

//         if (msgType === 5) {
//             const roomId = Memory.readU32(args[2].add(4));
//             const strPtr = args[2].add(8);
//             const name = Memory.readUtf8String(strPtr);
//             console.log('Room ID:', roomId);
//             console.log('Room name:', name);
//         }
//     },
//     onLeave: function (retval) {
//         console.log('Return value:', retval);
//     }
// });

Interceptor.attach(
  Module.findExportByName(
    "libMHS.so",
    "_ZN13sAppProcedure17onReceiveActivityEiPKvm"
  ),
  {
    onEnter: function (args) {
      console.log("onReceiveActivity called");

      // Logging the parameters
      console.log("param_1: " + args[0]);
      console.log("param_2: " + args[1]);
      console.log("param_3: " + args[2]);

      // If you want to read the data from param_3 (a byte pointer):
      var buffer = args[2];
      var data = Memory.readByteArray(buffer, 64); // Reading 64 bytes from param_3
      console.log(
        "param_3 data: " +
          hexdump(data, {
            offset: 0,
            length: data.length,
            header: true,
            ansi: true,
          })
      );
    },
    onLeave: function (retval) {
      console.log("onReceiveActivity finished");

      // Log the return value
      console.log("Return value: " + retval);
    },
  }
);

Interceptor.attach(
  Module.findExportByName(
    "libMHS.so",
    "_ZN13sAppProcedure14onReceiveParamEiPKvm"
  ),
  {
    onEnter: function (args) {
      console.log("onReceiveParam called");

      // Logging the parameters
      console.log("param_1: " + args[0]);
      console.log("param_2: " + args[1]);
      console.log("param_3_00: " + args[2]);
      console.log("param_4: " + args[3].toFloat32()); // Assuming param_4 is a float
      console.log("param_5 (sAppProcedure*): " + args[4]);
      console.log("param_6: " + args[5]);
      console.log("param_7: " + args[6].toUInt64());
      console.log("param_8: " + args[7].toUInt64());
      console.log("param_9: " + args[8]);
      console.log("param_10: " + args[9]);
      console.log("param_11: " + args[10]);
      console.log("param_12: " + args[11]);

      // If you want to read data from param_1, param_2, and param_3_00 (byte arrays):
      var buffer1 = args[0];
      var buffer2 = args[1];
      var buffer3 = args[2];
      console.log(
        "param_1 data: " +
          hexdump(Memory.readByteArray(buffer1, 16), {
            offset: 0,
            length: 16,
            header: true,
            ansi: true,
          })
      );
      console.log(
        "param_2 data: " +
          hexdump(Memory.readByteArray(buffer2, 16), {
            offset: 0,
            length: 16,
            header: true,
            ansi: true,
          })
      );
      console.log(
        "param_3_00 data: " +
          hexdump(Memory.readByteArray(buffer3, 16), {
            offset: 0,
            length: 16,
            header: true,
            ansi: true,
          })
      );
    },
    onLeave: function (retval) {
      console.log("onReceiveParam finished");

      // Log the return value
      console.log("Return value: " + retval.toUInt64());
    },
  }
);

// Interceptor.attach(Module.findExportByName("libMHS.so", '_ZN8nNetwork10MHiSession14onSessionEventEPKNS_18NET_MESSAGE_HEADEREPKvm'), {
//     onEnter: function (args) {
//         const thisPtr = args[0];
//         const param1 = args[1]; // NET_MESSAGE_HEADER*
//         const param2 = args[2];
//         const param3 = args[3];

//         console.log("Called onSessionEvent:");
//         console.log("  this =", thisPtr);
//         console.log("  param_1 (header) =", param1);

//         // Dump first 16 bytes of param1
//         const headerBuf = param1.readByteArray(50);
//         console.log("  header[0-50] =", hexdump(headerBuf, {
//             offset: 0,
//             length: 50,
//             header: false,
//             ansi: false
//         }));

//         const header4 = param1.add(4).readU8();
//         const header8 = param1.add(8).readU8();

//         console.log("    header[4] =", header4);
//         console.log("    header[8] =", header8);

//         if (!param2.isNull()) {
//             const param2Value = param2.readU16();
//             console.log("  param_2 =", param2, "->", param2Value);
//         } else {
//             console.log("  param_2 = NULL");
//         }

//         console.log("  param_3 =", param3.toInt32());
//     },
//     onLeave: function (retval) {
//         console.log("onSessionEvent returned.");
//     }
// });

Interceptor.attach(
  Module.findExportByName(
    "libMHS.so",
    "_ZN8nNetwork10MHiSession14onSessionEventEPKNS_18NET_MESSAGE_HEADEREPKvm"
  ),
  {
    onEnter: function (args) {
      const thisPtr = args[0];
      const param_1 = args[1];
      const payloadData = args[2];
      const size = args[3].toInt32();

      // Read sessionId from *(char *)(param_1 + 4)
      const sessionId = Memory.readS8(param_1.add(4));
      // Read uVar1 (event type) from *(byte *)(param_1 + 8)
      const eventType = Memory.readU8(param_1.add(8));

      // We're only interested in case 0x16
      if (eventType === 0x16) {
        const dbPtrPtr = thisPtr.add(8);
        const dbPtr = Memory.readPointer(dbPtrPtr);

        // Read flags byte at offset 0xd10
        const flagsByte = Memory.readU8(dbPtr.add(0xd10));

        if ((flagsByte & 1) !== 0) {
          console.log("[+] onSessionEvent case 0x16 triggered");
          console.log("    this =", thisPtr);
          console.log("    sessionId =", sessionId);
          console.log("    flagsByte =", flagsByte);

          const hostEntryPtr = dbPtr.add(sessionId * 0xd0 + 8);
          console.log("    hostEntryPtr =", hostEntryPtr);

          // Optionally, dump the memory around the host entry
          console.log(hexdump(hostEntryPtr, { length: 0x40 }));
        } else {
          console.log(" Not Triggered   flagsByte =", flagsByte);
        }
      }
    },
    onLeave: function (retval) {
      // You can also hook onLeave if needed.
    },
  }
);

Interceptor.attach(
  Module.findExportByName(
    "libMHS.so",
    "_ZN8nNetwork18MHiSessionDatabase10changeHostEi"
  ),
  {
    onEnter(args) {
      const thisPtr = args[0];
      const param_1 = args[1].toInt32();

      console.log("[*] MHiSessionDatabase::changeHost called");
      console.log("    this     :", thisPtr);
      console.log("    param_1  :", param_1);

      // Optional: Dump the current host index before and after change
      const hostIndexPtr = thisPtr.add(0xd0c);
      const currentHost = hostIndexPtr.readS32();
      console.log("    current host index:", currentHost);

      const oldHostFlagPtr = thisPtr.add(0xd0 + currentHost * 0xd0);
      const newHostFlagPtr = thisPtr.add(0xd0 + param_1 * 0xd0);

      console.log("    Old host flag before change:", oldHostFlagPtr.readU8());
      console.log("    New host flag before change:", newHostFlagPtr.readU8());
    },
    onLeave(retval) {
      console.log("[*] MHiSessionDatabase::changeHost returned");

      // Optionally, confirm change:
      const thisPtr = this.context.x0; // On ARM64, x0 = `this`
      const hostIndexPtr = thisPtr.add(0xd0c);
      const newHost = hostIndexPtr.readS32();

      console.log("    New current host index:", newHost);
    },
  }
);


Interceptor.attach(
  Module.findExportByName(
    "libMHS.so",
    "_ZN18sMHiSessionManager9reqCreateEji"
  ), {
    onEnter: function(args) {
        console.log("sMHiSessionManager::reqCreate called");

        // Access the parameters
        var param1 = args[0].toInt32(); // param_1
        var param2 = args[1].toInt32(); // param_2
        console.log("param_1: " + param1);
        console.log("param_2: " + param2);

        // Modify the parameters if needed
        // args[0] = ptr(12345);  // Example modification

        // Example: if param_1 == 0, change it to 99999
        if (param1 == 0) {
            console.log("Changing param_1 to 99999");
            args[0] = ptr(99999);
        }
    },
    onLeave: function(retval) {
        console.log("sMHiSessionManager::reqCreate returned");

        // Access the return value
        var returnValue = retval.toInt32();
        console.log("Return value: " + returnValue);

        // Modify return value if necessary
    }
});
Interceptor.attach(
  Module.findExportByName(
    "libMHS.so",
    "_ZN18sMHiSessionManager9_setPhaseEi"
  ), {
    onEnter: function(args) {
        console.log("_ZN18sMHiSessionManager9_setPhaseEi called");
    },
    onLeave: function(retval) {
        console.log("_ZN18sMHiSessionManager9_setPhaseEi returned");

        // Access the return value
        var returnValue = retval.toInt32();
        console.log("Return value: " + returnValue);

        // Modify return value if necessary
    }
});
