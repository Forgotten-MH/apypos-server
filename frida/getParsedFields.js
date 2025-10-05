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



try {
    var interceptor = Interceptor.attach(baseAddress.add(0x000000000248AD08), {
          onEnter: function (args) {
            console.log("-------- cHttpClient REQUEST -----------")
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
    //cMHiParser::findArray(char const*,cReceiveNode *)	.text	000000000175C438	0000000C			R	.	.	.	.	.	T	.
    var interceptor = Interceptor.attach(baseAddress.add(0x000000000175C438), {
        onEnter: function (args) {
            //console.log("\"",Memory.readCString(args[0],"\":[]"))

            console.log("\"",Memory.readCString(args[1],"\":[]"))

        }
    })

} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x000000000175C438")
}

try {
    ////cMHiParser::findObjectNode(char const*,cReceiveNode *)	.text	000000000175C26C	0000000C			R	.	.	.	.	.	T	.

    var interceptor = Interceptor.attach(baseAddress.add(0x000000000175C26C), {
        onEnter: function (args) {
            //console.log("\"",Memory.readCString(args[0],"\":[]"))
            console.log("entered")
            console.log("\"",Memory.readCString(args[1],"\":[]"))

        }
    })

} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x000000000175C26C")
}
try {
    //cMHiParser::getArrayString(char const*,cReceiveNode *)	.text	000000000175A810
    var interceptor = Interceptor.attach(baseAddress.add(0x000000000175A810), {
        onEnter: function (args) {
            console.log("\"", Memory.readCString(args[1]), "\":\"[\"String\"]\"")

        }
    })
} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x000000000175A810")
}
try {
    //cMHiParser::getArrayS64(char const*,cReceiveNode *)	.text	000000000175AD38
    var interceptor = Interceptor.attach(baseAddress.add(0x000000000175AD38), {
        onEnter: function (args) {
            console.log("\"", Memory.readCString(args[1]), "\":\"[sint64]\"")

        }
    })

} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x000000000175AD38")
}


try {
    //cMHiParser::findObject(char const*,cReceiveNode *)	.text	000000000175C444	00000074	00000050		R	.	.	.	.	B	T	.
    var interceptor = Interceptor.attach(baseAddress.add(0x000000000175C444), {
        onEnter: function (args) {
           // console.log("\"",Memory.readCString(args[0],"\":{}"))
            console.log("\"",Memory.readCString(args[1],"\":{}"))

        }
    })

} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x000000000175C444")
}

try {

    //cMHiParser::getString(cMHiParser *this, const char *a2, MtString *a3, cReceiveNode *a4)
    var interceptor = Interceptor.attach(baseAddress.add(0x000000000175A068), {
        onEnter: function (args) {

            console.log("\"", Memory.readCString(args[1]), "\":\"String\"")

        }
    })

} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x000000000175A068")
}
try {
    //cMHiParser::getS64(cMHiParser *this, const char *a2, __int64 *a3, cReceiveNode *a4)

    var interceptor = Interceptor.attach(baseAddress.add(0x000000000175A3E4), {
        onEnter: function (args) {
            console.log("\"", Memory.readCString(args[1]), "\":\"sint64\"")

        }
        
    })
} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x000000000175A3E4")
}

try {
    //cMHiParser::getU64(char const*,ulong &,cReceiveNode *)	.text	000000000175A224
    var interceptor = Interceptor.attach(baseAddress.add(0x000000000175A224), {
        onEnter: function (args) {

            console.log("\"", Memory.readCString(args[1]), "\":\"uint64\"")


        }
    })
} catch (error) {
    console.log(JSON.stringify(error))
    console.error("error attaching 0x000000000175A224")
}
