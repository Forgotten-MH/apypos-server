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

try {
    var interceptor = Interceptor.attach(baseAddress.add(0x000000000248AD08), {
          onEnter: function (args) {
            console.log("#####-cHttpClient REQUEST-#####")
              console.log("cHttpClient *this:",   args[0])
              console.log("cHttpClient::Listener *a2: ",  args[1])
              console.log("Base URL: ", Memory.readCString(args[2]))
              console.log("URL : ", Memory.readCString(args[3]))
              //More args...
          },
          onLeave: function (retVal) {
              console.log("retVal: ", retVal)

  
          }
      })
  
  } catch (error) {
      console.log(JSON.stringify(error))
      console.error("error attaching 0x000000000248AD08")
  }














try {
    //sServer::setupDictionaryEquipmentGetResponse(cMHiJessicaAPIResponseBase *)	.text	000000000193AB84	000001BC	00000070		R	.	.	.	.	B	T	.
    var interceptor = Interceptor.attach(baseAddress.add(0x000000000193AB84), {
          onEnter: function (args) {


            console.log("ENTERED SETUP BOX")
            // args[1] corresponds to the `a2` parameter in the setupBoxGetResponse function
            // var a2 = args[1];
   
            // // Read session_id (string at offset 0x8)
            // var v15_ptr = a2.add(0x10).readPointer();
            // var session_id = Memory.readUtf8String(v15_ptr);
            // console.log("session_id: " + session_id);
   
            // // Read block_seq (s64 at offset 0x10)
            // var v18_ptr = a2.add(0x20).readS64();
            // console.log("block_seq: " + v18_ptr);

            // var v18_ptr = a2.add(0x70).readS64();
            //  console.log("70: " + v18_ptr);
            //  var v18_ptr = a2.add(0x80).readS64();
            //  console.log("80: " + v18_ptr);
            


             var param1 = args[1];
            // Read value at param_1 + 0x60
            var mst_equipment_ids = Memory.readU32(param1.add(0x60));
            console.log("mst_equipment_ids 0x60: " + mst_equipment_ids);
             // Read value at param_1 + 0x70
             var data70 = Memory.readU32(param1.add(0x70));
             console.log("Value at param_1 + 0x70: " + data70);
     
             // Get the pointer at param_1 + 0x80
             var param1_80 = Memory.readPointer(param1.add(0x80));
     
             // Assuming 'data' is the value at param_1 + 0x70 which is an integer representing count
             var count = data70;
     
             // Loop through each count
             for (var i = 0; i < count; i++) {
                 // Calculate the address for data10
                 var data10_ptr = Memory.readPointer(param1_80.add(i * 8));
                 var data10 = Memory.readU64(data10_ptr.add(8));
                 console.log("data10 at count " + i + ": " + data10);
             }
            
            // console.log("#####-cHttpClient REQUEST-#####")
            //   console.log("cHttpClient *this:",   args[0])
            //   console.log("cHttpClient::Listener *a2: ",  args[1])
            //   console.log("Base URL: ", Memory.readCString(args[2]))
            //   console.log("URL : ", Memory.readCString(args[3]))
            //   //More args...
          },
          onLeave: function (retVal) {
              console.log("retVal: ", retVal)

  
          }
      })
  
  } catch (error) {
      console.log(JSON.stringify(error))
      console.error("error attaching 0x000000000193AB84")
  }



try {
//sServer::setupUserGetResponse(cMHiJessicaAPIResponseBase *)	.text	0000000001925210	00001FE8	00000120	000000C0	R	.	.	.	.	B	T	.
var interceptor = Interceptor.attach(baseAddress.add(0x0000000001925210), {
          onEnter: function (args) {

// Assuming ARM64 architecture and __fastcall calling convention

      
            console.log('sServer::setupUserGetResponse called');
            console.log('Arguments:');
    
            // Print all arguments (adjust if needed)
            for (let i = 0; i < 32; i++) {
                console.log(`arg[${i}] = ${args[i].toString()}`);
            }

            let a18_ptr = args[17];
            let a18_value = a18_ptr.readPointer();
            console.log(`a18 (pointer) = ${Memory.readCString(a18_ptr)}`);
    
            // Example of modifying an argument
            // args[0] = ptr('0xDEADBEEF'); // Uncomment to modify argument 0
        },
        // var a2 = args[1];


        // // var v15_ptr = a2.add(0x8).readPointer();
        // // var session_id = Memory.readUtf8String(v15_ptr);
        // // console.log("session_id: " + session_id);
        // // // Read session_id (string at offset 0x8)
        // // var v15_ptr = a2.add(0x10).readPointer();
        // // var block_seq = Memory.readUtf8String(v15_ptr);
        // // console.log("block_seq: " + block_seq);
        
        // // var one_day_time = a2.add(0x30).readS64();
        // // console.log("one_day_time: " + one_day_time);

        // // var now_time = a2.add(0x38).readS64();
        // // console.log("now_time: " + now_time);

        // // // Read block_seq (s64 at offset 0x10)
        // // var error_code = a2.add(0x48).readS64();
        // // console.log("error_code: " + error_code);

        // // var error_category = a2.add(0x50).readS64();
        // // console.log("error_category: " + error_category);

        // // var error_detail = a2.add(0x58).readS64();
        // // console.log("error_detail: " + error_detail);
        // // //payment_model_info = 0x60

        // // var payment_model_info = a2.add(0x60).readS64();
        // // console.log("payment_model_info: " + payment_model_info);
        // // var payment_model_info = a2.add(0x60).readS64();
        // // console.log("face: " + payment_model_info);
        // // // var payment_model_info_count = Memory.readU32(a2.add(0x70));
        // // // console.log("payment_model_info_count 0x70: " + payment_model_info_count);
     
        // // // var payment_model_info_count = Memory.readU32(a2.add(0x70));
        // // //      console.log("Value at param_1 + 0x70: " + payment_model_info_count);
        // // //      // Get the pointer at param_1 + 0x80
        // // //      var param1_80 = Memory.readPointer(a2.add(0x80));
     
        // // //      // Assuming 'data' is the value at param_1 + 0x70 which is an integer representing count
        // // //      var count = payment_model_info_count;
     
        // // //      // Loop through each count
        // // //      for (var i = 0; i < count; i++) {
        // // //          // Calculate the address for data10
        // // //          var data10_ptr = Memory.readPointer(param1_80.add(i * 8));
        // // //          var data10 = Memory.readU64(data10_ptr.add(8));
        // // //          console.log("data10 at count " + i + ": " + data10);
        // // //      }










        // //user_info = 0xc0
        // var user_info = a2.add(0xc0).readS64();
        // console.log("user_info: " + user_info);
        //  var ptr3 = a2.add(0x100).readU64();
        //  console.log("0x100: " + ptr3);
         


        //  var ptr4 = a2.add(0xf0).readU64();
        //  console.log("0xf0: " + ptr4);
        //  var ptr5 = a2.add(0xf8).readU64();
        //  console.log("0xf8: " + ptr5);

          
          onLeave: function (retVal) {
              console.log("retVal: ", retVal)

  
          }
      })
  
  } catch (error) {
      console.log(JSON.stringify(error))
      console.error("error attaching 0x0000000001925210")
  }


//   try {
//     //nFunction::cMHiMap<nServer::cItemEquip>::hash_add(nServer::cItemEquip*,uint,char const*)	.text	000000000194BB88	000002DC	00000050		R	.	.	.	.	B	T	.
//     var interceptor = Interceptor.attach(baseAddress.add(0x000000000194BB88), {
//           onEnter: function (args) {
                
//              console.log("__int64 a1",args[0])
//              console.log("const MtDTI *a2",args[1])
//              console.log("int a3",args[2])
//              console.log("char *s2",Memory.readCString(args[3]))
             
//           },
//           onLeave: function (retVal) {
//               console.log("retVal: ", retVal)

  
//           }
//       })
  
//   } catch (error) {
//       console.log(JSON.stringify(error))
//       console.error("error attaching 0x000000000194BB88")
//   }



// try {
// //sPlayerWorkspace::createItemDataEquip(uint,uint,uint,uint,bool,long,long,ushort,uint,uint,long)	.text	0000000001A9D808	000002EC	000000C0	00000020	R	.	.	.	.	B	T	.
// var interceptor = Interceptor.attach(baseAddress.add(0x0000000001A9D808), {
//           onEnter: function (args) {
//             console.log("sPlayerWorkspace *this",args[0])
//             console.log("unsigned int a2",args[1])
//             console.log("unsigned int a3",args[2])
//             console.log("unsigned int a4",args[3])
//             console.log("int a5",args[4])
//             console.log("char a6",Memory.readCString(args[5]))
//             console.log("__int64 a7",args[6])
//             console.log("__int64 a8",args[7])
//             console.log("unsigned __int16 a9",args[8])
//             console.log("unsigned int a10",args[9])
//             console.log("unsigned int a11",args[10])
//             console.log(" __int64 a12",args[11])
             
//           },
//           onLeave: function (retVal) {
//               console.log("retVal: ", retVal)

  
//           }
//       })
  
//   } catch (error) {
//       console.log(JSON.stringify(error))
//       console.error("error attaching 0x0000000001A9D808")
//   }

//   try {
// //sServer::setBoxDataEquipment(cMHiJessicaArray<nResponse::Equipment,(MtMemoryAllocator::FrameworkAllocator)13> const*)	.text	000000000192DAB0	0000023C	00000070		R	.	.	.	.	B	.	.
//   Interceptor.attach(baseAddress.add(0x000000000192D8D4), {
//     onEnter: function(args) {
//         console.log("ENTERED SETUP BOX")
//          // args[1] corresponds to the `a2` parameter in the setupBoxGetResponse function
//          var a2 = args[1];

//          // Read session_id (string at offset 0x8)
//          var v15_ptr = a2.add(0x10).readPointer();
//          var session_id = Memory.readUtf8String(v15_ptr);
//          console.log("session_id: " + session_id);

//          // Read block_seq (s64 at offset 0x10)
//          var v18_ptr = a2.add(0x20).readS64();
//          console.log("block_seq: " + v18_ptr);

         
//     }
// });
// } catch (error) {
//     console.log(JSON.stringify(error))
//     console.error("error attaching 0x000000000192D8D4")
// }


// try {
// //sResponse::setupDictionaryEquipmentGet(cMHiJessicaAPIResponseBase *)	.text	00000000017B9AA0	00000010			R	.	.	.	.	.	T	.
// Interceptor.attach(baseAddress.add(0x00000000017B9AA0), {
//         onEnter: function(args) {
//             console.log("ENTERED SETUP BOX")
//              // args[1] corresponds to the `a2` parameter in the setupBoxGetResponse function
//              var a2 = args[1];
    
//              // Read session_id (string at offset 0x8)
//              var v15_ptr = a2.add(0x10).readPointer();
//              var session_id = Memory.readUtf8String(v15_ptr);
//              console.log("session_id: " + session_id);
    
//              // Read block_seq (s64 at offset 0x10)
//              var v18_ptr = a2.add(0x20).readS64();
//              console.log("block_seq: " + v18_ptr);
    
             
//         }
//     });
//     } catch (error) {
//         console.log(JSON.stringify(error))
//         console.error("error attaching 0x000000000192D8D4")
//     }


// try {

//     var interceptor = Interceptor.attach(Module.getExportByName('libc.so', 'strncmp'), {
//         onEnter: function (args) {
//             console.log("strncmp compare: ", Memory.readCString(args[0]))
//             console.log("strncmp to: ", Memory.readCString(args[1]))


//         },
//         onLeave: function (retVal) {
//             console.log("retVal: ", retVal)

//         }
//     })

// } catch (error) {
//     console.log(JSON.stringify(error))
//     console.error("error attaching strcmp")
// }

// //native::httpclient::HttpURLConnection::sendRequest(char const*,int,char const*,char const*,ulong)	.text	000000000280C614	000003FC	00000070		R	.	.	.	.	B	T	.
// try {
//     var interceptor = Interceptor.attach(baseAddress.add(0x000000000280C614), {
//           onEnter: function (args) {
//             console.log("#####-NATIVE-HTTP REQUEST-#####")
//               console.log("Unk",   args[0])
//               console.log("URL: ", Memory.readCString(args[1]))
//               console.log("Unk",   args[2])
//               console.log("Headers: ", Memory.readCString(args[3]))
//               //Brings back weird objects from memory
//               //console.log("Body: ", Memory.readCString(args[4]))
//           },
//           onLeave: function (retVal) {
//               console.log("retVal: ", retVal)

  
//           }
//       })
  
//   } catch (error) {
//       console.log(JSON.stringify(error))
//       console.error("error attaching 0x000000000280C614")
//   }







try {
    //sPlayerWorkspace::getEquipData(MtString)	.text	0000000001AA1CD8	0000028C	00000040		R	.	.	.	.	B	T	.
    var interceptor = Interceptor.attach(baseAddress.add(0x0000000001AA1CD8), {
        onEnter: function (args) {
            // sPlayerWorkspace::getEquipData(__int64 a1, unsigned int **a2, unsigned int a3)
            this.arg1 = args[0]   // __int64 a1
            this.arg2 = args[1]// unsigned int **a2 (readPointer dereferences the pointer)
            this.arg3 = args[2] // unsigned int a3
    
            // You can log or manipulate arguments here
            console.log('sPlayerWorkspace::getEquipData called');
            console.log('a1: ' + this.arg1);
            console.log('a2: ' + this.arg2);
            console.log('a3: ' + this.arg3);
        },
    
        onLeave: function (retval) {
            // retval is the return value of the function
            console.log('sPlayerWorkspace::getEquipData returned: ' + retval);
    
            // You can modify the return value if needed
            // retval.replace(ptr(1234)); // Example: Changing return value to 1234
        }
    })

} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x0000000001AA1CD8")
}

// try {
// //sPlayerWorkspace::getEquipDataFromIdx(uint)	.text	0000000001AA21F0	000000D4	00000030		R	.	.	.	.	B	T	.
// var interceptor = Interceptor.attach(baseAddress.add(0x0000000001AA21F0), {
//         onEnter: function (args) {
//             console.log("getEquipDataFromIdx(uint) Field: ", args[0])


//         },
//         onLeave: function (retVal) {
//             console.log("retVal: ", retVal)

//         }
//     })

// } catch (error) {
//     console.log(JSON.stringify(error))
//     console.error("error attaching 0x0000000001AA21F0")
// }

// try {
//     //sPlayerWorkspace::getEquipDataNum(uint)	.text	0000000001AA22CC	00000094			R	.	.	.	.	.	T	.
//     var interceptor = Interceptor.attach(baseAddress.add(0x0000000001AA22CC), {
//             onEnter: function (args) {
//                 console.log("getEquipDataNum(uint) Field: ", args[0])


//             },
//             onLeave: function (retVal) {
//                 console.log("retVal: ", retVal)

//             }
//         })

//     } catch (error) {
//         console.log(JSON.stringify(error))
//         console.error("error attaching 0x0000000001AA22CC")
//     }

try {
    ////sPlayerWorkspace::getEquipWeapon(uint)	.text	0000000001AA3CEC	0000015C	00000030		R	.	.	.	.	B	T	.
    var interceptor = Interceptor.attach(baseAddress.add(0x0000000001AA3CEC), {
            onEnter: function (args) {
                console.log("sPlayerWorkspace::getEquipWeapon(uint)	 called");

                console.log("sPlayerWorkspace *this ", args[0])
                console.log("int a2 ", args[1])

            },
            onLeave: function (retVal) {
                console.log("retVal: ", retVal)

            }
        })

    } catch (error) {
        console.log(JSON.stringify(error))
        console.error("error attaching 0x0000000001AA3CEC")
    }

    try {
        ////sPlayerWorkspace::setSelectMySetId(uint)	.text	0000000001AA8B58	00000080	00000030		R	.	.	.	.	B	T	.
        var interceptor = Interceptor.attach(baseAddress.add(0x0000000001AA8B58), {
                onEnter: function (args) {
                    console.log("sPlayerWorkspace::setSelectMySetId(uint)	 called");

                    console.log("sPlayerWorkspace *this ", args[0])
                    console.log("int a2 ", args[1])
    
                },
                onLeave: function (retVal) {
                    console.log("retVal: ", retVal)
    
                }
            })
    
        } catch (error) {
            console.log(JSON.stringify(error))
            console.error("error attaching 0x0000000001AA3CEC")
        }

// try {
//     //sDefineCtrl::DefineData::getDefine(void)	.text	00000000019C3F2C	00000008			R	.	.	.	.	.	T	.
// var interceptor = Interceptor.attach(baseAddress.add(0x00000000019C3F2C), {
//         onEnter: function (args) {
//             console.log("getDefine Field: ", args[0])


//         },
//         onLeave: function (retVal) {
//             console.log("retVal: ", JSON.stringify(retVal))

//         }
//     })

// } catch (error) {
//     console.log(JSON.stringify(error))
//     console.error("error attaching 0x00000000019C3F2C")
// }
try {
//nFunction::cMHiMap<nServer::cItemEquip>::hash_add(nServer::cItemEquip*,uint,char const*)	.text	000000000194BB88	000002DC	00000050		R	.	.	.	.	B	T	.
var interceptor = Interceptor.attach(baseAddress.add(0x000000000194BB88), {
        onEnter: function (args) {
            console.log("cItemEquip Hash Add Field0: ", Memory.readS64(args[0]));
            console.log("cItemEquip Hash Add Field1: ", Memory.readS64(args[1]));
            console.log("cItemEquip Hash Add Field2:: ", parseInt(args[2], 16))
            console.log("cItemEquip Hash Add Field3: ", Memory.readCString(args[3]))


        },
        onLeave: function (retVal) {
            console.log("retVal: ",retVal)

        }
    })

} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x000000000194BB88")
}

// try {
//     //MtCRC::getCRC(char const*,uint)	.text	000000000273CC68	00000038			R	.	.	.	.	.	T	.
//     var interceptor = Interceptor.attach(baseAddress.add(0x000000000273CC68), {
//         onEnter: function (args) {
//             console.log("getCRC Field: ", Memory.readCString(args[0]))
//             // console.log("getCRC Field 1: ", Memory.readCString(args[1]))


//         },
//         onLeave: function (retVal) {
//             console.log("retVal: ",retVal)

//         }
//     })

// } catch (error) {
//     console.log(JSON.stringify(error))
//     console.error("error attaching 0x000000000273CC68")
// }
// try {
//     //cMHiNetworkAPI::callAPI(uint,cMHiJessicaAPIRequestBase *,bool)	.text	000000000174C07C	000000DC	00000040		R	.	.	.	.	B	T	.
//     var interceptor = Interceptor.attach(baseAddress.add(0x000000000174C07C), {
//         onEnter: function (args) {
//             console.log("callAPI Field: ", args[0])
//             console.log("callAPI Field: ", args[1])
//             console.log("callAPI Field: ", args[2])
//             console.log("callAPI Field: ", args[3])


//         },
//         onLeave: function (retVal) {
//             console.log("retVal: ", JSON.stringify(retVal))

//         }
//     })

// } catch (error) {
//     console.log(JSON.stringify(error))
//     console.error("error attaching 0x000000000174C07C")
// }



// try {
//     //cMHiParser::findObject(char const*,cReceiveNode *)	.text	000000000175C444

//     var interceptor = Interceptor.attach(Module.getExportByName('libc.so', 'strncmp'), {
//         onEnter: function (args) {
//             console.log("strcmp Field: ", Memory.readCString(args[0]))
//             console.log("strcmp Field: ", Memory.readCString(args[1]))


//         },
//         onLeave: function (retVal) {
//             console.log("retVal: ", retVal)

//         }
//     })

// } catch (error) {
//     console.log(JSON.stringify(error))
//     console.error("error attaching 0x000000000175C444")
// }


try {
    //nPlayerWorkspace::cItemEquip::createWeapon(uint,uint,uint,uint,uint,uint,uint,uint,ushort,uint,uint,long)	.text	000000000129F398	00000EF8	000003A0	00000028	R	.	.	.	.	B	T	.
    var interceptor = Interceptor.attach(baseAddress.add(0x000000000129F398), {
        onEnter: function (args) {
            // Log the arguments
            console.log("nPlayerWorkspace::cItemEquip::createWeapon called");
    
            console.log("this: " + args[0]);  // nPlayerWorkspace::cItemEquip *this
            console.log("a2: " + args[1].toInt32());  // unsigned int a2
            console.log("a3/hash: " + args[2].toUInt32());  // unsigned int a3
            console.log("a4: " + args[3].toInt32());  // int a4
            console.log("a5: " + args[4].toInt32());  // int a5
            console.log("a6: " + args[5].toInt32());  // int a6
            console.log("a7: " + args[6].toInt32());  // int a7
            console.log("a8: " + args[7].toInt32());  // int a8
            console.log("a9: " + args[8].toInt32());  // unsigned int a9
            console.log("a10: " + args[9]);  // unsigned __int16 a10
            console.log("a11: " + args[10]);  // unsigned int a11
            console.log("a12: " + args[11]);  // unsigned int a12
            console.log("a13: " + args[12]);  // __int64 a13
        },
        onLeave: function (retval) {
            console.log("nPlayerWorkspace::cItemEquip::createWeapon return: " + retval);
        }
    })

} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x000000000175C444")
}
try {
    //nPlayerWorkspace::cItemEquip::createArmor(uint,uint,uint,uint,uint,uint,uint,uint,uint,long)	.text	00000000012A0424	00000858	000001C0	00000018	R	.	.	.	.	B	T	.
    var interceptor = Interceptor.attach(baseAddress.add(0x00000000012A0424), {
        onEnter: function (args) {
            console.log("nPlayerWorkspace::cItemEquip::createArmor called");
    
            // Log arguments
            console.log("this: " + args[0]);
            console.log("a2: " + args[1].toInt32());
            console.log("a3: " + args[2].toUInt32());
            console.log("a4: " + args[3].toInt32());
            console.log("a5: " + args[4].toInt32());
            console.log("a6: " + args[5].toInt32());
            console.log("a7: " + args[6].toInt32());
            console.log("a8: " + args[7].toUInt32());
            console.log("a9: " + args[8].toUInt32());
            console.log("a10: " + args[9].toUInt32());
            console.log("a11: " + args[10]);
        },
        onLeave: function (retval) {
            console.log("nPlayerWorkspace::cItemEquip::createArmor returned: " + retval);
        }
    })

} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x00000000012A0424")
}


try {
    //nPlayerWorkspace::cItemOmamori::createOmamori(uint,uint,uint,bool,long,long,long,long,uint,long,bool)	.text	00000000012A16C4	000007C8	000002B0	00000019	R	.	.	.	.	B	T	.
    var interceptor = Interceptor.attach(baseAddress.add(0x00000000012A16C4), {
        onEnter: function (args) {
            // Logging all arguments
            console.log("Hooked nPlayerWorkspace::cItemOmamori::createOmamori");
    
            console.log("this: " + args[0].toString());
            console.log("a2: " + args[1].toInt32());
            console.log("a3: " + args[2].toInt32());
            console.log("a4: " + args[3].toInt32());
            console.log("charrrrr: " + args[4]);
            console.log("a6: " + args[5]);
            console.log("a7: " + args[6]);
            console.log("a8: " + args[7]);
            console.log("a9: " + args[8]);
            console.log("a10: " + args[9]);
            console.log("a11: " + args[10]);
            console.log("a12: " + args[11]);
    
            // If you want to modify an argument, do it here
            // For example, to modify a3:
            // this.context.rdx = ptr(999); // assuming a3 is passed in the RDX register
        },
        onLeave: function (retval) {
            // Modify the return value if needed
            // retval.replace(ptr('0x1')); // Example of changing the return value to 1
    
            console.log("nPlayerWorkspace::cItemOmamori::createOmamori returned:", retval);
        }
    })

} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x00000000012A16C4")
}


// try {
//     //nPlayerWorkspace::cItemAugite::createAugite(uint,uint,uint)	.text	00000000012A3440	0000017C	00000160		R	.	.	.	.	B	T	.
//     var interceptor = Interceptor.attach(baseAddress.add(0x00000000012A3440), {
//         onEnter: function (args) {
//             console.log("nPlayerWorkspace::cItemAugite::createAugite called");
    
//             // Log arguments
//             console.log("this: " + args[0]);
//             console.log("a2: " + args[1].toInt32());
//             console.log("a3: " + args[2].toUInt32());
//             console.log("a4: " + args[3].toInt32());
//             console.log("a5: " + args[4].toInt32());
//             console.log("a6: " + args[5].toInt32());
//             console.log("a7: " + args[6].toInt32());
//             console.log("a8: " + args[7].toUInt32());
//             console.log("a9: " + args[8].toUInt32());
//             console.log("a10: " + args[9].toUInt32());
//             console.log("a11: " + args[10]);
//         },
//         onLeave: function (retval) {
//             console.log("nPlayerWorkspace::cItemAugite::createAugite returned: " + retval);
//         }
//     })

// } catch (error) {
//     console.log(JSON.stringify(error))
//     console.error("error attaching 0x00000000012A0424")
// }


// try {
//     //sPlayerWorkspace::createItemDataEquip(uint,uint,uint,uint,bool,long,long,ushort,uint,uint,long)	.text	0000000001A9D808	000002EC	000000C0	00000020	R	.	.	.	.	B	T	.
//     var interceptor = Interceptor.attach(baseAddress.add(0x0000000001A9D808), {
//         onEnter: function (args) {
//             console.log("sPlayerWorkspace::createItemDataEquip called");
    
//             // Log arguments
//             console.log("this: " + args[0]);
//             console.log("a2: " + args[1].toUInt32());
//             console.log("a3: " + args[2].toUInt32());
//             console.log("a4: " + args[3].toInt32());
//             console.log("a5: " + args[4].toInt32());
//             console.log("a6: " +  args[5].toInt32()); //char
//             console.log("a7: " + args[6]);
//             console.log("a8: " + args[7]);
//             console.log("a9: " + args[8]);
//             console.log("a10: " + args[9]);
//             console.log("a11: " + args[10]);
//             console.log("a12: " + args[11]);

//         },
//         onLeave: function (retval) {
//             console.log("sPlayerWorkspace::createItemDataEquip returned: " + retval);
//         }
//     })

// } catch (error) {
//     console.log(JSON.stringify(error))
//     console.error("error attaching 0x0000000001A9D808")
// }



// try {
// //nFunction::cMHiMapEx<nBookWorkspace::cBookData>::hash_add(nBookWorkspace::cBookData*,uint)	.text	000000000126868C	000001D4	00000040		R	.	.	.	.	B	.	.
// var interceptor = Interceptor.attach(baseAddress.add(0x000000000126868C), {
//         onEnter: function (args) {
//             console.log("nFunction::cMHiMapEx<nBookWorkspace::cBookData>::hash_add called");
    
//             // Log arguments
//             console.log("this: " + args[0]);
//             console.log("a2: " + args[1]);
//             console.log("a3: " + args[2]);
//         },
//         onLeave: function (retval) {
//             console.log("nFunction::cMHiMapEx<nBookWorkspace::cBookData>::hash_add returned: " + retval);
//         }
//     })

// } catch (error) {
//     console.log(JSON.stringify(error))
//     console.error("error attaching 0x000000000126868C")
// }

// try {
//     //MtTime::getCurrent(void)	.text	00000000027F1E4C	00000024	00000020		R	.	.	.	.	B	T	.
//     var interceptor = Interceptor.attach(baseAddress.add(0x00000000027F1E4C), {
//             onEnter: function (args) {
//                 console.log("MtTime::getCurrent( called");
        
//                 // Log arguments
//                 console.log("this: " + args[0]);
//                 console.log("a2: " + args[1]);
//             },
//             onLeave: function (retval) {
//                 console.log("MtTime::getCurrent( returned: " + retval);
//             }
//         })
    
//     } catch (error) {
//         console.log(JSON.stringify(error))
//         console.error("error attaching 0x00000000027F1E4C")
//     }



// try {
// //nBookWorkspace::cBookCacheData::getBookListLength(nBookWorkspace::BOOK_TYPE)	.text	0000000001267478	00000014			R	.	.	.	.	.	.	.
//     var interceptor = Interceptor.attach(baseAddress.add(0x0000000001267478), {
//         onEnter: function(args) {
//             // args[0] is the 'this' pointer in __fastcall
//             console.log('getBookListLength called');
//             console.log('this pointer:', args[0]);
//             console.log('this pointer:', args[1]);
//             console.log('INTERESTING this pointer:', args[2]);

//           },
//           onLeave: function(retval) {
//             console.log('sMHiSaveData::getBannerVersion returned:', retval);
            
//             // You can modify the return value if needed
//             // retval.replace(ptr('0x0')); // Example: force return 0
//           }
//         })
    
//     } catch (error) {
//         console.log(JSON.stringify(error))
//         console.error("error attaching 0x00000000027F1E4C")
//     }

    // try {
    //     //nFunction::cMHiMapEx<rQuestSheet::cQuestData>::hash_add(rQuestSheet::cQuestData*,uint)	.text	0000000001884B08	000001D4	00000040		R	.	.	.	.	B	.	.
    //         var interceptor = Interceptor.attach(baseAddress.add(0x0000000001884B08), {
    //             onEnter: function(args) {
    //                 // args[0] is the 'this' pointer in __fastcall
    //                 console.log('HiMapEx<rQuestSheet::cQuestData>::hash_add called');
    //                 console.log('this pointer:', args[0]);
    //                 console.log('this pointer:', args[1]);
    //                 console.log('this pointer:', args[2]);
        
    //               },
    //               onLeave: function(retval) {
    //                 console.log('sMHiSaveData::getBannerVersion returned:', retval);
                    
    //                 // You can modify the return value if needed
    //                 // retval.replace(ptr('0x0')); // Example: force return 0
    //               }
    //             })
            
    //         } catch (error) {
    //             console.log(JSON.stringify(error))
    //             console.error("error attaching 0x00000000027F1E4C")
    //         }


            try {
                //nFunction::cMHiMapEx<rOfflineQuestSheet::cRouteData>::hash_add(rOfflineQuestSheet::cRouteData*,uint)	.text	0000000001881E68	000001D4	00000040		R	.	.	.	.	B	.	.
                    var interceptor = Interceptor.attach(baseAddress.add(0x0000000001881E68), {
                        onEnter: function(args) {
                            // args[0] is the 'this' pointer in __fastcall
                            console.log('hash_add(rOfflineQuestSheet::cRouteDat called');
                            console.log('this pointer:', args[0]);
                            console.log('this pointer:', args[1]);
                            console.log('this pointer:', args[2]);
                
                          },
                          onLeave: function(retval) {
                            console.log('sMHiSaveData::getBannerVersion returned:', retval);
                            
                            // You can modify the return value if needed
                            // retval.replace(ptr('0x0')); // Example: force return 0
                          }
                        })
                    
                    } catch (error) {
                        console.log(JSON.stringify(error))
                        console.error("error attaching 0x00000000027F1E4C")
                    }