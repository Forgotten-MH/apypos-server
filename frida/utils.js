const getArrayValuesFromAddress = (baseAddress,mtPropertyAddress)=>{
    //This only works if the mtProperty is an Array of values u64
    var mtProperty = Memory.readU32(baseAddress.add(mtPropertyAddress)); // Get this value from the ::createProperty on the cAPIXXXXResource class 
    console.log("mst_equipment_ids 0x60: " + mtProperty);
     // Read value at param_1 + 0x70
     var dataLength = Memory.readU32(baseAddress.add(mtPropertyAddress+0x10));
     console.log("dataLength: " + dataLength);

     // Get the pointer at param_1 + 0x80
     var param1_80 = Memory.readPointer(baseAddress.add(mtPropertyAddress+0x20));

     // Assuming 'data' is the value at param_1 + 0x70 which is an integer representing count
     var count = dataLength;

     // Loop through each count
     for (var i = 0; i < count; i++) {
         // Calculate the address for data10
         var value_ptr = Memory.readPointer(param1_80.add(i * 8));
         var value = Memory.readU64(value_ptr.add(8));
         console.log("value at count " + i + ": " + value);
     }
};