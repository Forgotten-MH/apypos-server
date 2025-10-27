# 信息说明
多人联机功能由 socket.io 负责处理，其基于 HTTPS 协议，因此数据包在传输过程中会进行加密，但服务器似乎能够正常处理该加密逻辑。由于服务器发送数据时采用明文形式，而客户端发送数据时采用加密形式，这种不一致可能会在后续使用中引发问题。不过目前来看，因未正确处理 HTTPS 协议所导致的明显问题尚未出现。

鉴于所使用的 socket.io 版本较旧，本项目中采用的版本为 "socket.io": "2.3.0"。

# 发送类型（Emit Types）
```
//客户端发送的类型...
const recv = [
  "host_change_request",  //主机变更请求
  //"leave",  //离开（注释状态）
  //"create",  //创建（注释状态）
  //"join",  //加入（注释状态）
  "lock",  //锁定
  "unlock",  //解锁
  "kick",  //踢出
  "entry",  //进入
  "cancel",  //取消
  "data",  //数据
];

//服务器发送的类型...
const events = [
  //"entry",  //进入（注释状态）
  "data",  //数据
  "notice",  //通知
  //"create_ok",  //创建成功（注释状态）
  //"create_ng",  //创建失败（注释状态）
  //"join",  //加入（注释状态）
  //"join_ok",  //加入成功（注释状态）
  //"join_ng",  //加入失败（注释状态）
  "entry",  //进入
  "entry_ok",  //进入成功
  "entry_ng",  //进入失败
  "cancel",  //取消
  "cancel_ok",  //取消成功
  "cancel_ng",  //取消失败
  "match",  //匹配
  "match_ok",  //匹配成功
  "terminate",  //终止
  "terminate_ok",  //终止成功
  "lock",  //锁定
  "lock_ok",  //锁定成功
  "lock_ng",  //锁定失败
  "unlock",  //解锁
  "unlock_ok",  //解锁成功
  //"leave",  //离开（注释状态）
  //"leave_ok",  //离开成功（注释状态）
  "host_change",  //主机变更
];
```
# 数据结构（Structure）
uint32 roomid：房间 ID（32 位无符号整数）

ubyte unk1：未知字段 1（无符号字节）

uint16 sequence：序列号（16 位无符号整数），用于数据包排序，发送或接收每个数据包时该值都会递增。

ubyte unk2：未知字段 2（无符号字节）

ubyte emitType：发送类型（无符号字节）。若调用 .emit(data,pkt) 方法，无论传入何种值，该字节都会被替换为 .emit 方法中设定的对应字节值。

ubyte flag1：标记位 1（无符号字节），似乎是监听器数据包 ID，但存在数值差异。有时需要在 setDataListener 方法中显示的数值基础上加上 5（示例如下）：

 /**
 * 1. sMHiSession::setSystemCallback(sMHiSession::mpInstance,3,puVar2,onSessionEvent,0);                            此方法对应的数据包ID为3（无需加5）
 * 2. sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,2,param_1,onReceiveInfo,0);                 此方法显示的数值为2，但实际数据包ID为7（即2+5）
 * 3. sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,4,param_1,onReceiveChat,0);                 此方法显示的数值为4，但实际数据包ID为9（即4+5）
 * 4. uVar2 = sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,5,param_1,onReceiveNotice,0);       此方法显示的数值为5，但实际数据包ID为10（即5+5）

 * 注：截至目前，以下方法暂未触发，它们可能在进入游戏后才会生效
 * 5. sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,1,param_1,onReceiveParam,0); //可能对应玩家操作，关联方法：sAppProcedure::applyRecvData
 * 6. sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,3,param_1,onReceiveActivity,0); //关联方法：sAppProcedure::applyRecvActivity
 */

uint16 pktlength：数据包长度（16 位无符号整数），表示后续数据数组的长度。

uint32 flag2：标记位 2（32 位无符号整数）

ubyte array[pktlength]：数据数组（无符号字节数组），长度由 pktlength 定义，存储实际的数据包内容。

# 相关函数（Functions of relevance）
待补充（TODO）