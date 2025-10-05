console.log("Script loaded successfully ");
console.log(Process.id)
console.log(Process.arch)
console.log(Process.platform)
console.log(JSON.stringify(Process.mainModule))



Process.enumerateModulesSync()
// Process.enumerateModules().forEach(element => {
//     console.log(JSON.stringify(element))
// });

// Module.enumerateImports("libMHS.so").forEach(element => {
//     console.log(JSON.stringify(element))
// });

var baseAddress = Module.findBaseAddress("libMHS.so");
if (baseAddress) {
    console.log("Base Found");

} else {
    console.log("Base NOT Found");
}

// try {
//     var interceptor = Interceptor.attach(baseAddress.add(0x000000000248AD08), {
//           onEnter: function (args) {
//             console.log("#####-cHttpClient REQUEST-#####")
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

try {
        //MtNet::Ndk::Socket::startConnect(MtNetAddress *)	.text	00000000027C6AC8	000001E0	00000060		R	.	.	.	.	B	.	.
    var interceptor = Interceptor.attach(baseAddress.add(0x00000000027C6AC8), {
             onEnter: function (args) {
                console.log("[+] Entered startConnect");
            
                // Log arguments
                console.log("Arg 0 (a1):", args[0].toInt32());
                console.log("Arg 1 (a2):", args[1]);
    
                if (args[1]) {
                    var a2Value = args[1].readPointer();
                    console.log("Value pointed by a2:", a2Value.toInt32());
                }
    
        },
        onLeave: function (retval) {
            // Optionally, modify the return value
            console.log("Return value:", retval);
        }
        })
    
    } catch (error) {
        console.log(JSON.stringify(error))
        console.error("error attaching 00000000017AF76C")
    }

   