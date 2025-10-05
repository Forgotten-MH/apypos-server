const findObjectAddr = Module.findExportByName(
  "libMHS.so",
  "_ZN10cMHiParser10findObjectEPKcP12cReceiveNode"
);
const getS64Addr = Module.findExportByName(
  "libMHS.so",
  "_ZN10cMHiParser6getS64EPKcRlP12cReceiveNode"
);

const getU64Addr = Module.findExportByName(
  "libMHS.so",
  "_ZN10cMHiParser6getU64EPKcRmP12cReceiveNode"
);

const getStringAddr = Module.findExportByName(
  "libMHS.so",
  "_ZN10cMHiParser9getStringEPKcR8MtStringP12cReceiveNode"
);
const findArrayAddr = Module.findExportByName(
  "libMHS.so",
  "_ZN10cMHiParser9findArrayEPKcP12cReceiveNode"
);
const findArrayS64Addr = Module.findExportByName(
  "libMHS.so",
  "_ZN10cMHiParser11getArrayS64EPKcP12cReceiveNode"
);
const findArrayStringAddr = Module.findExportByName(
  "libMHS.so",
  "_ZN10cMHiParser14getArrayStringEPKcP12cReceiveNode"
);

var baseAddress = Module.findBaseAddress("libMHS.so");
if (baseAddress) {
  send("Base Found");
} else {
  send("Base NOT Found");
}

try {
  Interceptor.attach(baseAddress.add(0x000000000248ad08), {
    onEnter: function (args) {
      send("#####-cHttpClient REQUEST-#####");

      send(`Base URL: ${args[2].readCString()}`);
      send(`URL : ${args[3].readCString()}`);
      //More args...
    },
  });
} catch (error) {
  send(JSON.stringify(error));
  console.error("error attaching 0x000000000248AD08");
}

if (findObjectAddr) {
  Interceptor.attach(findObjectAddr, {
    onEnter(args) {
      // args[0], args[1], args[2] = parserPtr, key, base
      this.key = args[1].readCString();
      this.base = args[2].toInt32();
      send(`[findObject] ${this.key}`);
    },
    // onLeave(retval) {
    //     send(`[Interceptor] findObject returned 0x${retval.toString(16)}`);
    // }
  });
}

if (getS64Addr) {
  Interceptor.attach(getS64Addr, {
    onEnter(args) {
      this.key = args[1].readCString();
      this.base = args[3].toInt32();
      this.outValPtr = args[2];
      send(`[getS64] ${this.key}`);
    },
    // onLeave(retval) {
    //     // Read the int64 value from outVal pointer (assuming little-endian)
    //     const val = this.outValPtr.readS64();
    //     send(`[Interceptor] getS64 output: ${val}`);
    // }
  });
}

if (getU64Addr) {
  Interceptor.attach(getU64Addr, {
    onEnter(args) {
      this.key = args[1].readCString();
      this.base = args[3].toInt32();
      this.outValPtr = args[2];
      send(`[getU64] ${this.key}`);
    },
    // onLeave(retval) {
    //     // Read the int64 value from outVal pointer (assuming little-endian)
    //     const val = this.outValPtr.readS64();
    //     send(`[Interceptor] getS64 output: ${val}`);
    // }
  });
}

if (getStringAddr) {
  Interceptor.attach(getStringAddr, {
    onEnter(args) {
      this.key = args[1].readCString();
      this.base = args[3].toInt32();
      send(`[getString] ${this.key}`);
    },
    // onLeave(retval) {
    //     send(`[Interceptor] getString returned pointer: ${retval}`);
    // }
  });
}

if (findArrayAddr) {
  Interceptor.attach(findArrayAddr, {
    onEnter(args) {
      this.key = args[2].readCString();
      this.base = args[3].toInt32();
      this.outCountPtr = args[0];
      send(`[findArray] ${this.key}`);
    },
    // onLeave(retval) {
    //     const count = this.outCountPtr.readU32();
    //     send(`[Interceptor] findArray count: ${count}`);
    // }
  });
}

if (findArrayS64Addr) {
  Interceptor.attach(findArrayS64Addr, {
    onEnter(args) {
      this.key = args[2].readCString();
      this.base = args[3].toInt32();
      this.outCountPtr = args[0];
      send(`[findArrayS64] ${this.key}`);
    },
    // onLeave(retval) {
    //     const count = this.outCountPtr.readU32();
    //     send(`[Interceptor] findArray count: ${count}`);
    // }
  });
}

if (findArrayStringAddr) {
  Interceptor.attach(findArrayStringAddr, {
    onEnter(args) {
      this.key = args[2].readCString();
      this.base = args[3].toInt32();
      this.outCountPtr = args[0];
      send(`[findArrayString] ${this.key}`);
    },
    // onLeave(retval) {
    //     const count = this.outCountPtr.readU32();
    //     send(`[Interceptor] findArray count: ${count}`);
    // }
  });
}
