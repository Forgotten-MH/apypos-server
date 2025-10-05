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

// try {
//     var interceptor = Interceptor.attach(baseAddress.add(0x000000000248AD08), {
//           onEnter: function (args) {
//             console.log("-------- cHttpClient REQUEST -----------")
//               console.log("cHttpClient *this:",   args[0])
//               console.log("cHttpClient::Listener *a2: ",  args[1])
//               console.log("Base URL: ", Memory.readCString(args[2]))
//               console.log("URL : ", Memory.readCString(args[3]))
//               //More args...
//           },
//           onLeave: function (retVal) {
//               console.log("retVal: ", retVal)

//           }
//       })

//   } catch (error) {
//       console.log(JSON.stringify(error))
//       console.error("error attaching 0x000000000248AD08")
//   }
// //sMatchingWorkspace::moveMatching(void)	.text	0000000001A398FC	000004D0	00000020		R	.	.	.	.	B	T	.
//   try {
//     var interceptor = Interceptor.attach(baseAddress.add(0x0000000001A398FC), {
//           onEnter: function (args) {
//             console.log("-------- reqCreate 1 REQUEST -----------")
//             const sMatchingWorkspace = args[0].toInt32();
//             const byte730 = Memory.readU8(ptr(sMatchingWorkspace).add(0x730));
//             const byte731 = Memory.readU8(ptr(sMatchingWorkspace).add(0x731));
//             const state = Memory.readU32(ptr(sMatchingWorkspace).add(0x72C));

//             console.log(`byte730: ${byte730}, byte731: ${byte731}, state: ${state}`);
//               //More args...
//           },
//           onLeave: function (retVal) {
//               console.log("retVal: ", retVal)

//           }
//       })

//   } catch (error) {
//       console.log(JSON.stringify(error))
//       console.error("error attaching 0x0000000001A398FC")
//   }
//native::socket::send(char const*,void const*,ulong)	.text	000000000281DAC8	00000114	00000050		R	.	.	.	.	B	T	.
try {
  var interceptor = Interceptor.attach(baseAddress.add(0x01861de4), {
    onEnter: function (args) {
      console.log("[*] native::socket::send called!");
      // console.log("    this: " + args[0]);
      // console.log("    a2 (const char*): " + args[1].readUtf8String());
      // console.log("    a3 (const void*): " + args[2]);

      // // Log the data passed in `a3` if it's a buffer
      // try {
      //     var buffer = Memory.readByteArray(args[2], 32); // Adjust size if needed
      //     console.log("    a3 buffer (first 32 bytes): " + hexdump(buffer));
      // } catch (e) {
      //     console.log("    Failed to read a3 buffer: " + e);
      // }
    },
    onLeave: function (retval) {
      // Log the return value
      console.log("reqCreate returned: " + retval.toInt32());

      // Modify the return value if necessary
      // retval.replace(0x12345678); // Example
    },
  });
} catch (error) {
  console.log(JSON.stringify(error));
  console.error("error attaching 01861de4");
}

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

      //   if (currentState === 0x0c) {
      //     const newState = 0x0d; // or whatever state you want to switch to
      //     console.log("[*] Changing state from 0x0c to:", newState);
      //     Memory.writeU32(workspacePtr.add(stateOffset), newState);
      //   }
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
      //     const newState = 0x15; // or whatever state you want to switch to
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

Interceptor.attach(
  Module.findExportByName(
    "libMHS.so",
    "_ZN15sLobbyProcedure13onReceiveInfoEiPKvm"
  ),
  {
    onEnter: function (args) {
      console.log("sLobbyProcedure::onReceiveInfo called");
      console.log("param_1:", args[0]);
      console.log("param_2:", args[1].toUInt32());
      console.log("param_3:", args[2]);

      const msgType = Memory.readU8(args[2].add(1));
      console.log("Message type (param_3 + 1):", msgType);

      // if (msgType === 5) {
      //     const roomId = Memory.readU32(args[2].add(4));
      //     const strPtr = args[2].add(8);
      //     const name = Memory.readUtf8String(strPtr);
      //     console.log('Room ID:', roomId);
      //     console.log('Room name:', name);
      // }
    },
    onLeave: function (retval) {
      console.log("Return value:", retval);
    },
  }
);

// Interceptor.attach(
//   Module.findExportByName(
//     "libMHS.so",
//     "_ZN8nNetwork10MHiSession14onSessionEventEPKNS_18NET_MESSAGE_HEADEREPKvm"
//   ), {
//     onEnter(args) {
//         const param_1 = args[1];
//         const switchVal = Memory.readU8(ptr(param_1).add(8));

//         this.switchVal = switchVal;
//         console.log('[+] onSessionEvent switch case: 0x' + switchVal.toString(16));
//     },
//     onLeave(retval) {
//         console.log('[+] Finished handling switch case 0x' + this.switchVal.toString(16));
//     }
// });

Interceptor.attach(
  Module.findExportByName(
    "libMHS.so",
    "_ZN8nNetwork10MHiSession14onSessionEventEPKNS_18NET_MESSAGE_HEADEREPKvm"
  ),
  {
    onEnter(args) {
      const base = args[0]; // this pointer
      const param_1 = args[1]; // NET_MESSAGE_HEADER*
      const payloadData = args[2];
      const size = args[3].toInt32();

      const sessionId = Memory.readU8(ptr(param_1).add(4));
      const switchVal = Memory.readU8(ptr(param_1).add(8));

      if (switchVal === 0x04) {
        console.log("\n[+] onSessionEvent → case 0x04");
        console.log("    Session ID       :", sessionId);
        console.log("    Payload Size     :", size);

        // Dump `this->handlers` table (0x10 offset, 0x80 bytes = 16 pointers)
        const handlersPtr = base.add(0x10);

        for (let i = 0; i < 16; i++) {
          const handler = handlersPtr.add(i * 8).readPointer();
          if (!handler.isNull()) {
            const vfunc = handler.readPointer().add(0x40);

            const symbol = DebugSymbol.fromAddress(vfunc);
            console.log(
              `    [${i}] Handler vfunc+0x40: ${vfunc - baseAddress} (${symbol.name})`
            );
          }
        }
      }
    },
  }
);

// let lastPhase = null;
// let lastFlags = null;
// let lastBits = null;

// Interceptor.attach(
//   Module.findExportByName(
//     "libMHS.so",
//     "_ZN18sMHiSessionManager8_offlineEv"
//   ), {
//   onEnter(args) {
//     this.session = args[0];
//     this.phase = Memory.readU32(this.session.add(0x128));
//     this.flags = Memory.readU32(this.session.add(300));
//     this.bits  = Memory.readU32(this.session.add(0x130));
//   },
//   onLeave(retval) {
//     let changed = false;

//     if (this.phase !== lastPhase || this.flags !== lastFlags || this.bits !== lastBits) {
//       changed = true;
//       console.log("[*] _offline() - State Changed:");
//       if (this.phase !== lastPhase)
//         console.log(`    Phase (0x128): ${lastPhase} → ${this.phase}`);
//       if (this.flags !== lastFlags)
//         console.log(`    Flags  (300): 0x${lastFlags?.toString(16)} → 0x${this.flags.toString(16)}`);
//       if (this.bits !== lastBits)
//         console.log(`    Bits   (130): 0x${lastBits?.toString(16)} → 0x${this.bits.toString(16)}`);
//     }

//     if (changed) {
//       lastPhase = this.phase;
//       lastFlags = this.flags;
//       lastBits = this.bits;
//     }
//   }
// });

Interceptor.attach(
  Module.findExportByName("libMHS.so", "_ZN8nNetwork10MHiSession6createEv"),
  {
    onEnter(args) {
      this.sessionPtr = args[0];

      const state = Memory.readU32(this.sessionPtr.add(0x90));
      console.log("[*] MHiSession::create called");
      console.log("    Session state:", state);

      const sessionF0 = Memory.readU32(this.sessionPtr.add(0xf0));
      const sessionAC = Memory.readU32(this.sessionPtr.add(0xac));
      console.log("    Session field 0xf0:", sessionF0);
      console.log("    Session field 0xac:", sessionAC);

      // Try to follow: sServer::mpInstance + 0x90 → +0x8 → piVar7
      const sServer_mpInstance = Module.findExportByName(
        "libMHS.so",
        "_ZN7sServer10mpInstanceE"
      ); // replace if needed
      const sServer = Memory.readPointer(sServer_mpInstance);
      const offset90 = Memory.readPointer(sServer.add(0x90)); //mpGameUserData
      const mpGameUserInfo = Memory.readPointer(offset90.add(8)); //mpGameUserInfo

      if (!mpGameUserInfo.isNull()) {
        console.log(
          "    piVar7[1] before: " + Memory.readU32(mpGameUserInfo.add(4))
        );
        console.log(
          "    piVar7[2] before: " + Memory.readU32(mpGameUserInfo.add(8))
        );

        // Force piVar7[1] to be >= 0x18
        //Memory.writeU32(piVar7.add(4), 0x20);

        console.log(
          "    piVar7[1] after: " + Memory.readU32(mpGameUserInfo.add(4))
        );
        console.log(
          "    piVar7[2] before: " + Memory.readU32(mpGameUserInfo.add(8))
        );
      } else {
        console.log("    piVar7 is null");
      }
    },
    onLeave(retval) {
      console.log("[*] MHiSession::create returned:", retval);
    },
  }
);

// Interceptor.attach(
//   Module.findExportByName(
//     "libMHS.so",
//     "_ZN8nNetwork10MHiSession12onCreateTaskEPKvP10MtNetError"
//   ),{
//   onEnter(args) {
//     this.sessionPtr = args[0];
//     this.param1 = args[1];
//     this.param2 = args[2];

//     // Example: dump the state field (this + 0x90)
//     const state = Memory.readU32(this.sessionPtr.add(0x90));
//     console.log("[+] onCreateTask called with state:", state);

//     const joinFlag = Memory.readU8(this.param1.add(8));
//     const joinId = Memory.readU16(this.param1.add(10));
//     console.log(`[+] joinFlag: ${joinFlag}  joinId: ${joinId}`);

//     if (joinFlag === 2 && joinId !== 0) {
//       console.log("[+] Join task detected");
//     } else {
//       console.log("[+] Create task detected or join failed");
//     }

//     // Optional: dump callback array (this + 0x10, length 16)
//     for (let i = 0; i < 16; i++) {
//       const callbackPtr = Memory.readPointer(this.sessionPtr.add(0x10 + i * 8));
//       if (!callbackPtr.isNull()) {
//         console.log(`  [-] Callback ${i}: ${callbackPtr}`);
//       }
//     }
//   },

//   onLeave(retval) {
//     console.log("[+] onCreateTask returned:", retval);
//   }
// });

// Interceptor.attach(
//   Module.findExportByName(
//     "libMHS.so",
//     "_ZN18sMHiSessionManager7_onlineEv"
//   ),{
//     onEnter(args) {
//         this.param1 = args[0];

//         // Read uVar2 = *(uint *)(param_1 + 300)
//         this.uVar2 = Memory.readU32(this.param1.add(300));

//         console.log("[*] sMHiSessionManager::_online() called");
//         console.log("    param_1:", this.param1);
//         console.log("    uVar2 (flags):", "0x" + this.uVar2.toString(16).padStart(8, '0'));

//         const flags = this.uVar2;

//         const paths = [
//             [0xb, 'match'],
//             [0xc, 'terminate'],
//             [3, 'join'],
//             [0xd, 'kick'],
//             [4, 'final'],
//             [7, 'entry'],
//             [8, 'cancel'],
//             [9, 'lock'],
//             [10, 'unlock'],
//         ];

//         for (const [bit, name] of paths) {
//             if ((flags >> bit) & 1) {
//                 console.log(`    Triggered path: ${name} (bit ${bit})`);
//             }
//         }
//     },
//     onLeave(retval) {
//         console.log("    Returned:", retval);
//     }
// });

// Interceptor.attach(
//   Module.findExportByName(
//     "libMHS.so",
//     "_ZNK18sMHiSessionManager6isHostEv"
//   ),{
//     onEnter(args) {
//         console.log("[*] sMHiSessionManager::isHost called");
//     },

//     onLeave(retval) {
//         console.log("[*] isHost returned:", retval.toInt32());
//         if (retval.toInt32() === 1) {
//             console.log(">> This client is the HOST");
//         } else {
//             console.log(">> This client is NOT the host");
//         }
//     }
// });

// Interceptor.attach(
//   Module.findExportByName(
//     "libMHS.so",
//     "_ZNK18sMHiSessionManager12getHostIndexEv"
//   ),{
//     onEnter(args) {
//         console.log("[*] sMHiSessionManager::getHostIndex called");
//     },
//     onLeave(retval) {
//         const index = retval.toInt32();
//         console.log("[*] getHostIndex returned:", index);

//         if (index === -1) {
//             console.log(">> No host set or invalid session database.");
//         } else {
//             console.log(">> Host index is:", index);
//         }
//     }
// });

// Interceptor.attach(
//   Module.findExportByName(
//     "libMHS.so",
//     "_ZNK18sMHiSessionManager12getSelfIndexEv"
//   ),{
//     onEnter(args) {
//         console.log("[*] sMHiSessionManager::getSelfIndex called");
//     },
//     onLeave(retval) {
//         const selfIndex = retval.toInt32();
//         console.log("[*] getSelfIndex returned:", selfIndex);

//         if (selfIndex === -1) {
//             console.log(">> Self index is invalid (0xFFFFFFFF)");
//         } else {
//             console.log(">> Self index is:", selfIndex);
//         }
//     }
// });

// Interceptor.attach(
//   Module.findExportByName(
//     "libMHS.so",
//     "_ZNK18sMHiSessionManager6isLockEv"
//   ),{
//     onEnter(args) {
//         console.log("[*] sMHiSessionManager::isLock called");
//     },
//     onLeave(retval) {
//         const locked = retval.toInt32();
//         console.log(`[*] isLock returned: ${locked} (${locked ? "LOCKED" : "UNLOCKED"})`);
//     }
// });

// Interceptor.attach(
//   Module.findExportByName(
//     "libMHS.so",
//     "_ZNK18sMHiSessionManager7isMatchEv"
//   ), {
//     onEnter(args) {
//         console.log("[*] sMHiSessionManager::isMatch called");
//     },
//     onLeave(retval) {
//         const isMatch = retval.toInt32();
//         console.log(`[*] isMatch returned: ${isMatch} (${isMatch ? "IN MATCH" : "NOT IN MATCH"})`);
//     }
// });

// Interceptor.attach(
//   Module.findExportByName("libMHS.so", "_ZN15sLobbyProcedure14cEventListener14onJoinCompleteEbP10MtNetError"),
//   {
//     onEnter: function (args) {
//         // args[0] = param_1 (undefined8)
//         // args[1] = param_2 (ulong)
//         const param2 = args[1].toInt32();  // or toUInt32() if unsigned, adjust if 64-bit needed

//         // Check bit 0
//         const failed = (param2 & 1) !== 0;

//         console.log("[*] onJoinComplete called");
//         console.log("    param_2 (flags): " + param2.toString(16));
//         console.log("    Join " + (failed ? "FAILED" : "SUCCEEDED"));
//     },

//     onLeave: function (retval) {
//         // Optionally log return value
//         // console.log("[*] onJoinComplete returned");
//     }
// });

Interceptor.attach(
  Module.findExportByName(
    "libMHS.so",
    "_ZN8nNetwork10MHiSession16onCreateCompleteEbP10MtNetError"
  ),
  {
    onEnter(args) {
      // 'this' pointer (first argument in __thiscall)
      this.self = args[0];
      this.param_bool = !!args[1].toInt32(); // bool (true if 1)
      this.param_error_ptr = args[2];

      console.log("[*] onCreateComplete called");
      console.log("    this           :", this.self);
      console.log("    success?       :", this.param_bool);
      console.log("    MtNetError*    :", this.param_error_ptr);
      const tpidr_el0 = Process.getRegister("tpidr_el0"); // ARM64 only
      const local_48 = Memory.readPointer(tpidr_el0.add(0x28));

      console.log("[*] Stack canary (local_48):", local_48);
    },
    onLeave(retval) {
      console.log("[*] onCreateComplete return");
    },
  }
);


Interceptor.attach(
  Module.findExportByName("libMHS.so", "_ZN15sLobbyProcedure14cEventListener16onCreateCompleteEbP10MtNetError"),
  {
    onEnter(args) {
      const success = (args[1].toUInt32() & 1) !== 0;
      console.log("[*] sLobby::onCreateComplete called");
      console.log("    Success? :", success);

      
    }
  }
);

Interceptor.attach(
  Module.findExportByName("libMHS.so", "_ZN18sMHiSessionManager14cEventListener16onCreateCompleteEbP10MtNetError"),
  {
    onEnter(args) {
      const param2 = args[1].toUInt32();
      const success = (param2 & 1) !== 0;
      console.log("[*] sMHiSessionManager::onCreateComplete");
      console.log("    Success?       :", success);

      // Optionally force success
      // args[1] = ptr(1); 

      // You could also dump or patch flags:
      const mpInstance = Module.findExportByName("libMHS.so", "_ZN18sMHiSessionManager10mpInstanceE");
      const flag130 = mpInstance.add(0x130);
      const flag12c = mpInstance.add(0x12C);

      console.log("    Flag @ 0x130:", Memory.readU32(flag130));
      console.log("    Flag @ 0x12C:", Memory.readU32(flag12c));
    }
  }
);
