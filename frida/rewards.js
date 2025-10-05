// Replace this with the actual address or use a pattern scan

Interceptor.attach(Module.findExportByName(
    "libMHS.so",
    "_ZN22uGUIResultKakutokuList14createItemDataEPKN7nServer13cQuestEndDataE"
  ), {
       onEnter(args) {
        this.thisPtr = args[0];
        this.param1 = args[1];

        console.log("=== createItemData Called ===");
        console.log("this: " + this.thisPtr);
        console.log("param_1: " + this.param1);

        // Read lVar8 = *(long *)(param_1 + 0x28)
        const lVar8 = Memory.readPointer(this.param1.add(0x28));
        console.log("lVar8 (param_1 + 0x28): " + lVar8);

        // *(int *)(lVar8 + 0x10)
        const count = Memory.readU32(lVar8.add(0x10));
        console.log("count (lVar8 + 0x10): " + count);

        // Log pointer list
        const itemListBase = Memory.readPointer(lVar8.add(0x20));
        console.log("itemList base: " + itemListBase);

        for (let i = 0; i < count && i < 3; i++) { // Max 3 as per code
            const itemEntry = Memory.readPointer(itemListBase.add(i * 8));
            console.log(`Item[${i}] @ ${itemEntry}`);

            // Read nested *(long *)(itemEntry + 0x28)
            const nested = Memory.readPointer(itemEntry.add(0x28));
            const defineTypeId = Memory.readU32(nested);         // first long*
            const defineTypeArg = Memory.readU32(ptr(defineTypeId).add(8)); // +8
            console.log(`  -> defineTypeId[${i}]: ${defineTypeArg}`);

            // Read *(int *)(itemEntry + 0x18)
            const hasData = Memory.readU32(itemEntry.add(0x18));
            console.log(`  -> hasData: ${hasData}`);

            // Read *(undefined4 *)(itemEntry + 0xC)
            const unkC = Memory.readU32(itemEntry.add(0xC));
            console.log(`  -> itemEntry + 0xC = 0x${unkC.toString(16)}`);

            // Check item +0x38 and +0x48 if available
            const flag38 = Memory.readU32(itemEntry.add(0x38));
            const nested48 = Memory.readPointer(itemEntry.add(0x48));
            console.log(`  -> flag38: ${flag38}, ptr48: ${nested48}`);
        }

        // Also read *(param_1 + 0x29c)
        const val29c = Memory.readU32(this.param1.add(0x29c));
        console.log("param_1 + 0x29c = 0x" + val29c.toString(16));

        // *(sResultWorkspace::mpInstance + 0x164)
        const mpResult = Module.findExportByName(null, "sResultWorkspace__mpInstance");
        if (mpResult) {
            const resultInst = Memory.readPointer(mpResult);
            const value164 = Memory.readU32(resultInst.add(0x164));
            console.log("sResultWorkspace::mpInstance + 0x164 = 0x" + value164.toString(16));
        } else {
            console.log("sResultWorkspace::mpInstance not found in exports.");
        }

        // Save this for post-return values
        this.thisField1738 = this.thisPtr.add(0x1738);
        this.thisField172c = this.thisPtr.add(0x172c);
    },

    onLeave(retval) {
        const final1738 = Memory.readU32(this.thisField1738);
        const final172c = Memory.readU32(this.thisField172c);

        console.log(`this + 0x1738: 0x${final1738.toString(16)}`);
        console.log(`this + 0x172c: 0x${final172c.toString(16)}`);
    }
});