export const PROTOCOL = {
  RES_VER: 282, // Controls banner version url /download/android/v0282/stdDL/download.list
  BANNER_VER: 91, // If set to 0 /api/banner/dllist/get is not called; incremental update trigger
  APP_VER: '09.03.06',
  BLOCK_SEQ: 0, // Possibly need to increment for cycling encryption (client ignores if 0)
} as const;
