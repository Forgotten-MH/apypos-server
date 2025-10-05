Java.perform(function () {
    // Get the class reference
    var MTFPSocket = Java.use("jp.co.capcom.android.explore.MTFPSocket");

    // Hook the native method
    MTFPSocket.onReceive.overload("int", "[B", "int").implementation = function (i, bArr, i2) {
        console.log("onReceive called with:");
        console.log("  int i: " + i);
        console.log("  byte[] bArr: " + Java.array('byte', bArr)); // Convert to readable format
        console.log("  int i2: " + i2);

        // Modify arguments if needed
        var modifiedI = i;
        var modifiedBArr = bArr; // Or manipulate the array if necessary
        var modifiedI2 = i2;
        console.log(modifiedBArr)
        // Call the original method
        var result = this.onReceive(modifiedI, modifiedBArr, modifiedI2);

        // Log the result if applicable
        console.log("onReceive executed successfully.");

        return result; // Return the result as is or modified
    };
});
