# Info
Multiplayer is handled by socket.io it is https so pkts are encrypted in flight however it seems the server can handle it. Because the server sends in clear text and the client sends in encrypted there could be consequences for this down the line. However so far there has been no noticable consequences to not dealing with https properly so far.

Due to the age socket io we are using version     "socket.io": "2.3.0" in the project.


# Emit Types
```
//Client Sends...
const recv = [
  "host_change_request",
  //"leave",
  //"create",
  //  "join",
  "lock",
  "unlock",
  "kick",
  "entry",
  "cancel",
  "data",
];
//Server Sends...
const events = [
  //   "entry",
  "data",
  "notice",
  //   "create_ok",
  //   "create_ng",
  //   "join",
  //   "join_ok",
  //   "join_ng",
  "entry",
  "entry_ok",
  "entry_ng",
  "cancel",
  "cancel_ok",
  "cancel_ng",
  "match",
  "match_ok",
  "terminate",
  "terminate_ok",
  "lock",
  "lock_ok",
  "lock_ng",
  "unlock",
  "unlock_ok",
  //   "leave",
  //   "leave_ok",
  "host_change",
];
```
# Structure
uint32 roomid;
ubyte unk1;
uint16 sequence; //this is the packet ordering... it increments every packet sent or recieved.
ubyte unk2;
ubyte emitType; //This is the emit type.. If you do .emit(data,pkt)  this byte no matter what will be replaced by the byte version of what is set in the .emit
ubyte flag1; // This seems to be a listener pkt id... there is a descrepency. Sometimes you need +5 added to the value you see in the setDataListener (Examples)
  /**
   * sMHiSession::setSystemCallback(sMHiSession::mpInstance,3,puVar2,onSessionEvent,0);                            pkt id for this is 3 
    sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,2,param_1,onReceiveInfo,0);                 pkt id for this is 2 but its actually 7 so 2+5
    sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,4,param_1,onReceiveChat,0);                 pkt id for this is 4 but its actually 9 so 4+5
    uVar2 = sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,5,param_1,onReceiveNotice,0);       pkt id for this is 5 but its actually 10 so 5+5

    // as of today not been able to trigger these. These are probably when you get into game
    sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,1,param_1,onReceiveParam,0); //Player actions? sAppProcedure::applyRecvData
    sMHiSessionManager::setDataListener(sMHiSessionManager::mpInstance,3,param_1,onReceiveActivity,0); sAppProcedure::applyRecvActivity
   */
uint16 pktlength;
uint32 flag2;
ubyte array[pktlength];

# Functions of relevance
TODO