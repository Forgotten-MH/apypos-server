"""DEPRECATED: Use patcher.py instead. This file will be removed in a future release."""
import sys
import os

print("=" * 70)
print("  DEPRECATED: patcher_windows_legacy.py is no longer maintained.")
print("  It only applies 2 of 7 required patches (missing SafetyNet bypass).")
print()
print("  Use patcher.py instead — it works on all platforms:")
print()
print("    python patcher.py -i <apk> -ip <server_ip:port>")
print()
print("  See: docs/APK_PATCHING_GUIDE.md for details.")
print("=" * 70)
sys.exit(1)
