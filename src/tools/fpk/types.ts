// ── FPK ──────────────────────────────────────────────────────────────────────

export interface FpkHeader {
  magic: string; // 'FPK\0'
  field4: number; // u32 – always 0
  field8: number; // u32 – always 0
  compression: number; // u16 – 2 = raw
  fileCount: number; // u16
}

export interface FpkEntry {
  filePath: string; // 64-byte null-padded UTF-8
  padding: number; // u32 – 0xCDCDCDCD
  size: number; // u32
  sizeAndFlags: number; // u32  (size & 0x1FFFFFFF) | (flags << 29)
  offset: number; // u32
  data: Buffer;
}

export interface FpkFile {
  header: FpkHeader;
  entries: FpkEntry[];
}

// ── ARC ──────────────────────────────────────────────────────────────────────

export interface ArcHeader {
  magic: string; // 'ARC\0' or 'ARCC'
  version: number; // u16 – always 7
  fileCount: number; // u16
}

export interface ArcEntry {
  name: string; // 64-byte null-padded UTF-8
  extHash: number; // u32 – JAMCRC of type name
  compSize: number; // u32
  decompSize: number; // u32 – raw value including flags
  offset: number; // u32
  data: Buffer; // decompressed file data
}

export interface ArcFile {
  header: ArcHeader;
  entries: ArcEntry[];
  encrypted: boolean;
}

// ── XFS ──────────────────────────────────────────────────────────────────────

export enum DtiType {
  UNDEFINED = 0x00,
  CLASS = 0x01,
  CLASSREF = 0x02,
  BOOL = 0x03,
  U8 = 0x04,
  U16 = 0x05,
  U32 = 0x06,
  U64 = 0x07,
  S8 = 0x08,
  S16 = 0x09,
  S32 = 0x0a,
  S64 = 0x0b,
  F32 = 0x0c,
  F64 = 0x0d,
  STRING = 0x0e,
  COLOR = 0x0f,
  POINT = 0x10,
  SIZE = 0x11,
  RECT = 0x12,
  MATRIX = 0x13,
  VECTOR3 = 0x14,
  VECTOR4 = 0x15,
  QUATERNION = 0x16,
  PROPERTY = 0x17,
  EVENT = 0x18,
  GROUP = 0x19,
  PAGE_BEGIN = 0x1a,
  PAGE_END = 0x1b,
  EVENT32 = 0x1c,
  ARRAY = 0x1d,
  PROPERTYLIST = 0x1e,
  GROUP_END = 0x1f,
  CSTRING = 0x20,
  TIME = 0x21,
  FLOAT2 = 0x22,
  FLOAT3 = 0x23,
  FLOAT4 = 0x24,
  FLOAT3x3 = 0x25,
  FLOAT4x3 = 0x26,
  FLOAT4x4 = 0x27,
  EASECURVE = 0x28,
  LINE = 0x29,
  LINESEGMENT = 0x2a,
  RAY = 0x2b,
  PLANE = 0x2c,
  SPHERE = 0x2d,
  CAPSULE = 0x2e,
  AABB = 0x2f,
  OBB = 0x30,
  CYLINDER = 0x31,
  TRIANGLE = 0x32,
  CONE = 0x33,
  TORUS = 0x34,
  ELLIPSOID = 0x35,
  RANGE = 0x36,
  RANGEF = 0x37,
  RANGEU16 = 0x38,
  HERMITECURVE = 0x39,
  ENUMLIST = 0x3a,
  FLOAT3x4 = 0x3b,
  LINESEGMENT4 = 0x3c,
  AABB4 = 0x3d,
  OSCILLATOR = 0x3e,
  VARIABLE = 0x3f,
  VECTOR2 = 0x40,
  MATRIX33 = 0x41,
  RECT3D_XZ = 0x42,
  RECT3D = 0x43,
  RECT3D_COLLISION = 0x44,
  PLANE_XZ = 0x45,
  RAY_Y = 0x46,
  POINTF = 0x47,
  SIZEF = 0x48,
  RECTF = 0x49,
  EVENT64 = 0x4a,
  END = 0x4b,
  CUSTOM = 0x80,
}

export interface XfsHeader {
  magic: string; // 'XFS\0'
  version: number; // u16 – 16
  type: number; // u16
  classCount: bigint; // i64
  defCount: number; // i32
  defSize: number; // i32
}

export interface XfsPropertyDef {
  nameOffset: number; // u32 – offset into definition block string table
  name: string; // resolved name
  type: DtiType; // u8
  attr: number; // u8
  bytes: number; // u16 :15
  disabled: number; // u16 :1 (high bit)
  _pad: Buffer; // 32 bytes padding
}

export interface XfsClassDef {
  dtiHash: number; // u32
  propNum: number; // u16 :15 (lower 15 bits)
  _upper17: number; // upper 17 bits
  properties: XfsPropertyDef[];
}

export interface XfsClassRef {
  type: number; // i16
  variant: number; // i16
  size?: number; // u32 – present only when type != 0x7FFF and type is odd
  object?: XfsSerializedObject;
}

export interface XfsFieldValue {
  classRef?: XfsClassRef;
  value?: unknown;
  _raw?: string; // hex fallback for unknown types
}

export interface XfsField {
  count: number;
  values: XfsFieldValue[];
}

export interface XfsSerializedObject {
  classIndex: number; // index into defs array (type >> 1)
  fields: XfsField[];
}

export interface XfsDocument {
  header: XfsHeader;
  classes: XfsClassDef[];
  root: XfsClassRef;
}

// ── JSON representation ─────────────────────────────────────────────────────

export interface XfsJsonProperty {
  nameOffset: number;
  name: string;
  type: number;
  typeName: string;
  attr: number;
  bytes: number;
  disabled: number;
}

export interface XfsJsonClass {
  dtiHash: number;
  propNum: number;
  _upper17: number;
  properties: XfsJsonProperty[];
}

export interface XfsJson {
  _format: 'xfs-v16';
  _header: {
    version: number;
    type: number;
    classCount: string; // bigint serialized as string
    defCount: number;
    defSize: number;
  };
  _classes: XfsJsonClass[];
  root: unknown;
}

// ── Manifest types ──────────────────────────────────────────────────────────

export interface FpkManifestEntry {
  filePath: string;
  padding: number;
  size: number;
  sizeAndFlags: number;
  arcDir: string; // subdirectory name for this ARC
}

export interface FpkManifest {
  _format: 'fpk-manifest';
  header: FpkHeader;
  entries: FpkManifestEntry[];
}

export interface ArcManifestEntry {
  name: string;
  extHash: number;
  extension: string;
  decompSizeRaw: number; // raw value including flags
  fileName: string; // relative path in output dir
}

export interface ArcManifest {
  _format: 'arc-manifest';
  header: ArcHeader;
  encrypted: boolean;
  entries: ArcManifestEntry[];
}
